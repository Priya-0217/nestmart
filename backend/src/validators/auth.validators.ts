import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
});

export const googleLoginSchema = z
  .object({
    idToken: z.string().optional().nullable(),
    profile: z
      .object({
        sub: z.any(),
        email: z.any(),
        name: z.any().optional().nullable(),
        picture: z.any().optional().nullable(),
        email_verified: z.any().optional().nullable(),
      })
      .passthrough()
      .optional()
      .nullable(),
    /** 'register' → create account if new; 'login' → reject if account doesn't exist */
    intent: z.any().optional().nullable(),
  })
  .passthrough()
  .refine((data) => Boolean(data.idToken || data.profile), {
    message: "Google login requires either an idToken or a verified profile",
  });
