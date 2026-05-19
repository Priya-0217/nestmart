import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z.string().min(16).default("dev-access-secret-change-me-please"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev-refresh-secret-change-me-please"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),

  BCRYPT_COST: z.coerce.number().int().min(10).max(15).default(12),

  SMTP_HOST: z.string().default("sandbox.smtp.mailtrap.io"),
  SMTP_PORT: z.coerce.number().int().positive().default(2525),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default("NestMart <no-reply@nestmart.dev>"),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().default("sk_test_mock"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_mock"),
  
  RAZORPAY_KEY_ID: z.string().default("rzp_test_mock"),
  RAZORPAY_KEY_SECRET: z.string().default("rzp_secret_mock"),
  RAZORPAY_WEBHOOK_SECRET: z.string().default("rzp_wh_secret_mock"),

  COD_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v.toLowerCase() === "true"),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Printing to stderr directly — the logger depends on env, so we can't use it here.
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
