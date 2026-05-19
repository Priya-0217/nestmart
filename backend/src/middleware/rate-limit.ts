import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const isDev = env.NODE_ENV === "development";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 100 : 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many auth attempts. Try again later." } },
});

export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 100 : 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many payment attempts. Try again later." } },
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: isDev ? 1000 : 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many requests. Slow down." } },
});
