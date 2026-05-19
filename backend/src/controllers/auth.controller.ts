import type { Request, Response, CookieOptions } from "express";
import * as auth from "../services/auth.service.js";
import { env } from "../config/env.js";

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookies(res: Response, accessToken: string, refreshToken: string, role?: string) {
  const isAdmin = role === "admin" || role === "manager";
  const accessKey = isAdmin ? "adminAccessToken" : "accessToken";
  const refreshKey = isAdmin ? "adminRefreshToken" : "refreshToken";

  res.cookie(accessKey, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  res.cookie(refreshKey, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

function clearAuthCookies(res: Response, role?: string) {
  const isAdmin = role === "admin" || role === "manager";
  const accessKey = isAdmin ? "adminAccessToken" : "accessToken";
  const refreshKey = isAdmin ? "adminRefreshToken" : "refreshToken";

  res.clearCookie(accessKey, COOKIE_OPTIONS);
  res.clearCookie(refreshKey, COOKIE_OPTIONS);
  
  // Also clear the other ones just in case if no role provided
  if (!role) {
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.clearCookie("adminAccessToken", COOKIE_OPTIONS);
    res.clearCookie("adminRefreshToken", COOKIE_OPTIONS);
  }
}

export async function register(req: Request, res: Response) {
  const result = await auth.register(req.body);
  res.status(201).json(result);
}

export async function verifyOtp(req: Request, res: Response) {
  const result = await auth.verifyOtp(req.body.email, req.body.otp);
  res.json(result);
}

export async function resendOtp(req: Request, res: Response) {
  const result = await auth.resendOtp(req.body.email);
  res.json(result);
}

export async function login(req: Request, res: Response) {
  const result = await auth.login({
    email: req.body.email,
    password: req.body.password,
    ua: req.headers["user-agent"] ?? undefined,
    ip: req.ip,
  });

  setAuthCookies(res, result.accessToken, result.refreshToken, result.user.role);
  res.json(result);
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.adminRefreshToken || req.cookies.refreshToken || req.body.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  const result = await auth.refresh(refreshToken, req.headers["user-agent"] ?? undefined, req.ip);
  
  setAuthCookies(res, result.accessToken, result.refreshToken, result.user.role);
  res.json(result);
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies.adminRefreshToken || req.cookies.refreshToken || req.body.refreshToken;
  if (refreshToken) {
    await auth.logout(refreshToken);
  }
  clearAuthCookies(res, req.user?.role);
  res.json({ ok: true });
}

export async function logoutAll(req: Request, res: Response) {
  await auth.logoutAll(req.user!.id);
  clearAuthCookies(res, req.user?.role);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}

export async function forgotPassword(req: Request, res: Response) {
  const result = await auth.forgotPassword(req.body.email);
  res.json(result);
}

export async function resetPassword(req: Request, res: Response) {
  const result = await auth.resetPassword(req.body.token, req.body.password);
  res.json(result);
}

export async function googleLogin(req: Request, res: Response) {
  const result = await auth.loginWithGoogle({
    idToken: req.body.idToken,
    profile: req.body.profile,
    intent: req.body.intent,
    ua: req.headers["user-agent"] ?? undefined,
    ip: req.ip,
  });

  setAuthCookies(res, result.accessToken, result.refreshToken, result.user.role);
  res.json(result);
}
