import type { RequestHandler } from "express";
import { Forbidden, Unauthorized } from "../utils/errors.js";
import type { UserRole } from "./auth.js";

export const requireRole = (...roles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) return next(Unauthorized());
    if (!roles.includes(req.user.role)) return next(Forbidden("Insufficient role"));
    next();
  };
};
