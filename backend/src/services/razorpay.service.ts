import Razorpay from "razorpay";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { OrderModel, OrderEventModel } from "../models/index.js";
import { logger } from "../config/logger.js";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay Order.
 * @param orderId - The MongoDB _id of the order.
 * @param amount - Total amount in INR.
 */
export async function createRazorpayOrder(orderId: string, amount: number) {
  const options = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency: "INR",
    receipt: orderId,
    notes: { orderId },
  };

  const razorpayOrder = await razorpay.orders.create(options);
  return razorpayOrder;
}

/**
 * Verifies Razorpay Webhook signature.
 * @param payload - Raw request body as string.
 * @param signature - X-Razorpay-Signature header.
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Handles Razorpay Webhook events.
 * @param event - The parsed webhook body.
 */
export async function handleWebhook(event: any) {
  const { event: eventType, payload } = event;
  const payment = payload.payment.entity;
  const orderId = payment.notes.orderId || payload.order?.entity?.receipt;

  if (!orderId) {
    logger.warn({ eventType }, "Razorpay event missing orderId in notes or receipt");
    return;
  }

  switch (eventType) {
    case "payment.captured":
      await updateOrderStatus(orderId, "paid", "Payment succeeded via Razorpay", "webhook");
      break;

    case "payment.failed":
      await updateOrderStatus(orderId, "payment_failed", payment.error_description || "Payment failed via Razorpay", "webhook");
      break;

    case "refund.processed":
      await updateOrderStatus(orderId, "refunded", "Refund processed via Razorpay", "webhook");
      break;

    default:
      logger.info({ eventType }, "Unhandled Razorpay webhook event");
  }
}

async function updateOrderStatus(orderId: string, status: string, message: string, actor: string) {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    logger.error({ orderId }, "Order not found during Razorpay webhook processing");
    return;
  }

  await OrderModel.updateOne(
    { _id: orderId },
    { 
      status, 
      paymentStatus: status === "paid" ? "paid" : status === "payment_failed" ? "failed" : order.paymentStatus,
      paidAt: status === "paid" ? new Date() : order.paidAt
    }
  );

  await OrderEventModel.create({
    orderId,
    status,
    message,
    actor,
  });

  logger.info({ orderId, status }, "Order status updated via Razorpay webhook");
}
