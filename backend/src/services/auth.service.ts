import bcrypt from "bcryptjs";
import { AuthTokenPurpose, type User } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { BadRequest, Conflict, Unauthorized } from "../utils/errors.js";
import {
  generateOtp,
  randomUrlToken,
  sha256,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "./email.service.js";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified !== null,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
  };
}

function issueTokens(user: User) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  return { accessToken, refreshToken };
}

async function persistSession(userId: string, refreshToken: string, ua?: string, ip?: string) {
  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: sha256(refreshToken),
      userAgent: ua,
      ip,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
}

export async function register(params: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) throw Conflict("Email already registered");

  const passwordHash = await bcrypt.hash(params.password, env.BCRYPT_COST);
  const user = await prisma.user.create({
    data: { email: params.email, name: params.name, passwordHash },
  });

  // Issue OTP for email verification.
  const otp = generateOtp();
  await prisma.authToken.create({
    data: {
      userId: user.id,
      purpose: AuthTokenPurpose.otp,
      tokenHash: sha256(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  // Fire-and-forget (errors are logged by the email service).
  await Promise.allSettled([sendOtpEmail(user.email, otp), sendWelcomeEmail(user.email, user.name ?? "there")]);

  return { user: publicUser(user), otpSent: true };
}

export async function verifyOtp(email: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw BadRequest("Invalid email or code");

  const token = await prisma.authToken.findFirst({
    where: {
      userId: user.id,
      purpose: AuthTokenPurpose.otp,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      tokenHash: sha256(otp),
    },
    orderBy: { createdAt: "desc" },
  });
  if (!token) throw BadRequest("Invalid or expired code");

  await prisma.$transaction([
    prisma.authToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } }),
  ]);

  return { verified: true };
}

export async function login(params: { email: string; password: string; ua?: string; ip?: string }) {
  const user = await prisma.user.findUnique({ where: { email: params.email } });
  if (!user || !user.passwordHash) throw Unauthorized("Invalid credentials");
  const ok = await bcrypt.compare(params.password, user.passwordHash);
  if (!ok) throw Unauthorized("Invalid credentials");
  if (!user.isActive) throw Unauthorized("Account is disabled");

  const tokens = issueTokens(user);
  await persistSession(user.id, tokens.refreshToken, params.ua, params.ip);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { user: publicUser(user), ...tokens };
}

export async function refresh(refreshToken: string, ua?: string, ip?: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw Unauthorized("Invalid refresh token");
  }

  const hash = sha256(refreshToken);
  const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
  if (!session || session.revokedAt || session.expiresAt < new Date() || session.userId !== payload.sub) {
    throw Unauthorized("Refresh token is invalid, revoked, or expired");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw Unauthorized("User not found");

  // Rotate: revoke the old session row and create a new one atomically.
  const tokens = issueTokens(user);
  await prisma.$transaction([
    prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } }),
    prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: sha256(tokens.refreshToken),
        userAgent: ua,
        ip,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    }),
  ]);

  return { ...tokens, user: publicUser(user) };
}

export async function logout(refreshToken: string) {
  const hash = sha256(refreshToken);
  // Best-effort; idempotent.
  await prisma.session.updateMany({
    where: { refreshTokenHash: hash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return { ok: true };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return ok to avoid user enumeration.
  if (!user) return { ok: true };

  const raw = randomUrlToken(32);
  await prisma.authToken.create({
    data: {
      userId: user.id,
      purpose: AuthTokenPurpose.password_reset,
      tokenHash: sha256(raw),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });
  const link = `${env.CLIENT_ORIGIN}/auth/reset-password?token=${raw}`;
  await sendPasswordResetEmail(user.email, link);
  return { ok: true };
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const token = await prisma.authToken.findFirst({
    where: {
      purpose: AuthTokenPurpose.password_reset,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      tokenHash: sha256(rawToken),
    },
  });
  if (!token) throw BadRequest("Invalid or expired reset token");

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_COST);
  await prisma.$transaction([
    prisma.authToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
    // Invalidate all active sessions — force re-login.
    prisma.session.updateMany({
      where: { userId: token.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  return { ok: true };
}
