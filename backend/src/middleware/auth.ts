import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Unauthorized } from "../utils/errors.js";

export type UserRole = "customer" | "manager" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/** Verifies the Authorization header or cookie and attaches req.user. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  let token: string | undefined;

  // 1. Check Authorization header
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    token = header.slice("Bearer ".length).trim();
  }
  
  // 2. Check cookies if not in header
  if (!token && req.cookies) {
    // Check both potential cookies; admin takes precedence for admin paths
    const isAdminPath = req.path.startsWith("/admin") || req.baseUrl.startsWith("/admin") || req.originalUrl.startsWith("/api/admin");
    if (isAdminPath) {
      token = req.cookies.adminAccessToken || req.cookies.accessToken;
    } else {
      token = req.cookies.accessToken || req.cookies.adminAccessToken;
    }
  }

  if (!token) {
    return next(Unauthorized("Missing authentication token"));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    
    // Security check: if this is an admin path but the token is for a customer, reject
    const isAdminPath = req.path.startsWith("/admin") || req.baseUrl.startsWith("/admin") || req.originalUrl.startsWith("/api/admin");
    if (isAdminPath && req.user.role === "customer") {
      return next(Unauthorized("Admin access required"));
    }
    
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(Unauthorized("Access token expired"));
    }
    next(Unauthorized("Invalid authentication token"));
  }
};

/** Populates req.user when a valid token is present; does not fail otherwise. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  let token: string | undefined;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    token = header.slice("Bearer ".length).trim();
  } else if (req.cookies) {
    const isAdminPath = req.path.startsWith("/admin") || req.baseUrl.startsWith("/admin") || req.originalUrl.startsWith("/api/admin");
    if (isAdminPath) {
      token = req.cookies.adminAccessToken || req.cookies.accessToken;
    } else {
      token = req.cookies.accessToken || req.cookies.adminAccessToken;
    }
  }

  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    // ignore invalid tokens in optional mode
  }
  next();
};
