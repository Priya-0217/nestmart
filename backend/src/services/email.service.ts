import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ServiceUnavailable } from "../utils/errors.js";
import { renderMjmlTemplate } from "./email-template.service.js";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn("SMTP creds not configured — emails will be logged instead of sent");
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth:
      env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    tls: {
      // Do not fail on invalid certs (common in dev/test)
      rejectUnauthorized: false,
    },
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
    console.log(`\n[DEV ONLY] Email to ${args.to}:`);
    console.log(`Subject: ${args.subject}`);
    console.log(`Body: ${args.text || args.html}\n`);
    logger.info({ to: args.to, subject: args.subject }, "[email] would send (SMTP not configured)");
    return;
  }
  try {
    const info = await getTransporter().sendMail({ from: env.MAIL_FROM, ...args });
    logger.info({ messageId: info.messageId, to: args.to }, "email sent");
  } catch (error) {
    logger.error({ error, to: args.to, subject: args.subject }, "failed to send email");
    throw ServiceUnavailable("Failed to send email. Please check your SMTP configuration.");
  }
}

// Branded MJML email templates

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    const html = await renderMjmlTemplate("welcome", { name });
    await sendMail({
      to,
      subject: "Welcome to NestMart! 🎉",
      html,
      text: `Hi ${name}, welcome to NestMart!`,
    });
  } catch (error) {
    logger.error({ error, to }, "Failed to send welcome email");
    // Fallback to simple text email
    await sendMail({
      to,
      subject: "Welcome to NestMart",
      html: `<p>Hi ${name},</p><p>Welcome to NestMart! Your account is ready.</p>`,
      text: `Hi ${name}, welcome to NestMart!`,
    });
  }
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  try {
    const html = await renderMjmlTemplate("otp", { otp });
    await sendMail({
      to,
      subject: "Your NestMart verification code",
      html,
      text: `Your NestMart verification code is ${otp}. It expires in 10 minutes.`,
    });
  } catch (error) {
    logger.error({ error, to }, "Failed to send OTP email");
    // Fallback
    await sendMail({
      to,
      subject: "Your NestMart verification code",
      html: `<p>Your NestMart verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
      text: `Your NestMart verification code is ${otp}. It expires in 10 minutes.`,
    });
  }
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<void> {
  try {
    const html = await renderMjmlTemplate("password-reset", { resetLink: link });
    await sendMail({
      to,
      subject: "Reset your NestMart password",
      html,
      text: `Reset your password: ${link}`,
    });
  } catch (error) {
    logger.error({ error, to }, "Failed to send password reset email");
    // Fallback
    await sendMail({
      to,
      subject: "Reset your NestMart password",
      html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 30 minutes.</p>`,
      text: `Reset your password: ${link}`,
    });
  }
}

export interface OrderConfirmationEmailData {
  orderId: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    itemTotal: number;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  shippingAddress: string;
}

function normalizeOrderConfirmationEmailData(orderData: OrderConfirmationEmailData | string): OrderConfirmationEmailData {
  if (typeof orderData === "string") {
    return {
      orderId: orderData,
      customerName: "there",
      items: [],
      subtotal: 0,
      shippingCost: 0,
      tax: 0,
      totalAmount: 0,
      shippingAddress: "",
    };
  }

  return orderData;
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderData: OrderConfirmationEmailData | string,
): Promise<void> {
  const normalizedOrderData = normalizeOrderConfirmationEmailData(orderData);
  try {
    const html = await renderMjmlTemplate("order-confirmation", normalizedOrderData);
    await sendMail({
      to,
      subject: `Order Confirmed: ${normalizedOrderData.orderId} 🛒`,
      html,
      text: `Order ${normalizedOrderData.orderId} confirmed. Total: ${normalizedOrderData.totalAmount}`,
    });
  } catch (error) {
    logger.error({ error, to }, "Failed to send order confirmation email");
    // Fallback
    await sendMail({
      to,
      subject: `Your NestMart order ${normalizedOrderData.orderId} is confirmed`,
      html: `<p>Thanks! Order <strong>${normalizedOrderData.orderId}</strong> has been placed. Total: <strong>${normalizedOrderData.totalAmount}</strong></p>`,
      text: `Thanks! Order ${normalizedOrderData.orderId} has been placed.`,
    });
  }
}

export async function sendShippingConfirmationEmail(
  to: string,
  orderNumber: string,
  trackingNumber: string,
): Promise<void> {
  await sendMail({
    to,
    subject: `Your NestMart order ${orderNumber} has shipped 📦`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px;">
        <h2 style="color: #1a56db;">Your order has shipped!</h2>
        <p>Order <strong>${orderNumber}</strong> has been dispatched.</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p><a href="https://nestmart.com/account/orders/${orderNumber}" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Track Your Order</a></p>
      </div>
    `,
    text: `Order ${orderNumber} has shipped. Tracking: ${trackingNumber}.`,
  });
}
