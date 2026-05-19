import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { AuthTokenPurpose, type User } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { BadRequest, Conflict, Unauthorized, NotFound, ServiceUnavailable } from "../utils/errors.js";
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
import { logger } from "../config/logger.js";

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
  const email = params.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Conflict("Email already registered");

  const passwordHash = await bcrypt.hash(params.password, env.BCRYPT_COST);
  const user = await prisma.user.create({
    data: { email, name: params.name, passwordHash },
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

  // Send only OTP during registration.
  await sendOtpEmail(user.email, otp);

  return { user: publicUser(user), otpSent: true };
}

export async function verifyOtp(emailRaw: string, otp: string) {
  const email = emailRaw.toLowerCase();
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

  // Send welcome email after successful verification
  await sendWelcomeEmail(user.email, user.name ?? user.email);

  return { verified: true };
}

export async function resendOtp(emailRaw: string) {
  const email = emailRaw.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Avoid account enumeration; always return ok.
  if (!user) return { ok: true };
  if (user.emailVerified) return { ok: true };

  const otp = generateOtp();
  await prisma.authToken.create({
    data: {
      userId: user.id,
      purpose: AuthTokenPurpose.otp,
      tokenHash: sha256(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  await sendOtpEmail(user.email, otp);
  return { ok: true };
}

export async function login(params: { email: string; password: string; ua?: string; ip?: string }) {
  const email = params.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw Unauthorized("Invalid credentials");
  const ok = await bcrypt.compare(params.password, user.passwordHash);
  if (!ok) throw Unauthorized("Invalid credentials");
  if (!user.isActive) throw Unauthorized("Account is disabled");
  if (!user.emailVerified) throw Unauthorized("Please verify your email before logging in");

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
  
  if (!session || session.userId !== payload.sub) {
    throw Unauthorized("Refresh token is invalid");
  }

  // Check if revoked, but allow a 30-second grace period for rotation race conditions
  if (session.revokedAt) {
    const gracePeriodEnd = new Date(session.revokedAt.getTime() + 30 * 1000);
    if (new Date() > gracePeriodEnd) {
      // Token was revoked more than 30s ago, potential reuse attack
      // Security: revoke all sessions for this user
      await logoutAll(session.userId);
      throw Unauthorized("Refresh token has been revoked");
    }
    // Within grace period, return the user but don't rotate again (or we'd create a chain)
    // Actually, it's better to return the same tokens if possible, but we don't store them.
    // For now, let's just allow it to continue if it's not expired.
  }

  if (session.expiresAt < new Date()) {
    throw Unauthorized("Refresh token expired");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw Unauthorized("User not found or inactive");

  // Rotate: revoke the old session row and create a new one atomically.
  const tokens = issueTokens(user);
  await prisma.$transaction([
    prisma.session.update({ 
      where: { id: session.id }, 
      data: { revokedAt: session.revokedAt || new Date() } 
    }),
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

export async function logoutAll(userId: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return { ok: true };
}

export async function forgotPassword(emailRaw: string) {
  const email = emailRaw.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    logger.warn({ email }, "forgot password failed: user not found");
    throw NotFound("Account with this email does not exist. Please create an account.");
  }

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

// Lazy singleton — constructed on first use so missing env in tests doesn't crash module load.
let googleClient: OAuth2Client | null = null;
function getGoogleClient(): OAuth2Client {
  if (googleClient) return googleClient;
  if (!env.GOOGLE_CLIENT_ID) {
    throw BadRequest("Google sign-in is not configured on this server");
  }
  googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  return googleClient;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

/** Verifies a Google ID token. Exposed for test injection via the verifier param. */
export async function verifyGoogleIdToken(
  idToken: string,
  verifier: (idToken: string) => Promise<GoogleProfile> = defaultGoogleVerifier,
): Promise<GoogleProfile> {
  return verifier(idToken);
}

async function defaultGoogleVerifier(idToken: string): Promise<GoogleProfile> {
  const ticket = await getGoogleClient().verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw Unauthorized("Invalid Google token");
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    email_verified: payload.email_verified,
  };
}

export async function loginWithGoogle(params: {
  idToken?: string;
  profile?: GoogleProfile;
  ua?: string;
  ip?: string;
  intent?: "login" | "register";
  verifier?: (idToken: string) => Promise<GoogleProfile>;
}) {
  const profile = params.profile ?? (params.idToken ? await verifyGoogleIdToken(params.idToken, params.verifier) : null);
  
  if (!profile?.sub || !profile.email) {
    logger.error({ profile }, "Invalid Google profile during loginWithGoogle");
    throw Unauthorized("Invalid Google profile");
  }

  logger.info({ email: profile.email, intent: params.intent }, "Google login attempt");

  // Find by googleId, fall back to email (so existing email accounts can link).
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.sub }, { email: profile.email }] },
  });

  if (!user) {
    // If intent is login, we expect the user to already exist.
    if (params.intent === "login") {
      logger.warn({ email: profile.email }, "Google login failed: user not found and intent was login");
      throw NotFound("Account not found. Please register first with Google.");
    }

    // Default behavior for register or undefined intent: create user.
    logger.info({ email: profile.email }, "Creating new user from Google profile");
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name ?? profile.email.split("@")[0],
        googleId: profile.sub,
        avatarUrl: profile.picture,
        emailVerified: profile.email_verified ? new Date() : null,
        isActive: true,
      },
    });
  } else {
    // User exists. If they don't have a googleId linked yet, link it now.
    if (!user.googleId) {
      logger.info({ email: profile.email }, "Linking existing email account to Google ID");
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.sub,
          avatarUrl: user.avatarUrl ?? profile.picture ?? null,
          emailVerified: user.emailVerified ?? (profile.email_verified ? new Date() : null),
        },
      });
    } else if (user.googleId !== profile.sub) {
      // This should rarely happen if email is unique, but just in case.
      logger.error({ email: profile.email, existingGoogleId: user.googleId, newGoogleId: profile.sub }, "Google ID mismatch for existing user");
      throw Conflict("This email is already linked to a different Google account.");
    }
  }

  if (!user.isActive) {
    logger.warn({ email: user.email }, "Google login failed: account disabled");
    throw Unauthorized("Your account has been disabled. Please contact support.");
  }

  const tokens = issueTokens(user);
  await persistSession(user.id, tokens.refreshToken, params.ua, params.ip);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  logger.info({ email: user.email }, "Google login successful");
  return { user: publicUser(user), ...tokens };
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
