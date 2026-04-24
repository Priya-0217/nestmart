import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { authRateLimiter } from "../middleware/rate-limit.js";
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators/auth.validators.js";

export const authRouter = Router();

authRouter.use(authRateLimiter);

authRouter.post("/register", validate({ body: registerSchema }), asyncHandler(controller.register));
authRouter.post("/verify-otp", validate({ body: verifyOtpSchema }), asyncHandler(controller.verifyOtp));
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(controller.login));
authRouter.post("/refresh", validate({ body: refreshSchema }), asyncHandler(controller.refresh));
authRouter.post("/logout", validate({ body: logoutSchema }), asyncHandler(controller.logout));
authRouter.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  asyncHandler(controller.forgotPassword),
);
authRouter.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  asyncHandler(controller.resetPassword),
);
