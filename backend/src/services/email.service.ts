import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn("SMTP creds not configured — emails will be logged instead of sent");
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth:
      env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export interface SendMailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Sends mail via SMTP when credentials are set, otherwise logs the payload. */
export async function sendMail(args: SendMailArgs): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.info({ to: args.to, subject: args.subject }, "[email] would send (SMTP not configured)");
    return;
  }
  const info = await getTransporter().sendMail({ from: env.MAIL_FROM, ...args });
  logger.info({ messageId: info.messageId, to: args.to }, "email sent");
}

// Full branded templates live in src/emails/ and are rendered in Phase 3D.
// Simple inline bodies here keep Phase 3A self-contained and readable.

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendMail({
    to,
    subject: "Welcome to NestMart",
    html: `<p>Hi ${name},</p><p>Welcome to NestMart! Your account is ready.</p>`,
    text: `Hi ${name}, welcome to NestMart!`,
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await sendMail({
    to,
    subject: "Your NestMart verification code",
    html: `<p>Your NestMart verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    text: `Your NestMart verification code is ${otp}. It expires in 10 minutes.`,
  });
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<void> {
  await sendMail({
    to,
    subject: "Reset your NestMart password",
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 30 minutes.</p>`,
    text: `Reset your password: ${link}`,
  });
}

export async function sendOrderConfirmationEmail(to: string, orderNumber: string): Promise<void> {
  await sendMail({
    to,
    subject: `Your NestMart order ${orderNumber} is confirmed`,
    html: `<p>Thanks! Order <strong>${orderNumber}</strong> has been placed.</p>`,
    text: `Thanks! Order ${orderNumber} has been placed.`,
  });
}

export async function sendShippingConfirmationEmail(
  to: string,
  orderNumber: string,
  trackingNumber: string,
): Promise<void> {
  await sendMail({
    to,
    subject: `Your NestMart order ${orderNumber} has shipped`,
    html: `<p>Order <strong>${orderNumber}</strong> has shipped. Tracking: ${trackingNumber}.</p>`,
    text: `Order ${orderNumber} has shipped. Tracking: ${trackingNumber}.`,
  });
}
