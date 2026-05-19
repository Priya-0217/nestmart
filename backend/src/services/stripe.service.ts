import Stripe from "stripe";
import { env } from "../config/env.js";
import { OrderModel, OrderEventModel } from "../models/index.js";
import { logger } from "../config/logger.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe Payment Intent for an order.
 * @param orderId - The MongoDB _id of the order.
 * @param amount - Total amount in INR.
 * @param customerEmail - User's email for receipt.
 */
export async function createPaymentIntent(orderId: string, amount: number, customerEmail: string) {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects cents/paise
    currency: "inr",
    metadata: { orderId },
    receipt_email: customerEmail,
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: intent.client_secret,
    stripeId: intent.id,
  };
}

/**
 * Handles Stripe Webhook events.
 * @param payload - Raw request body.
 * @param signature - Stripe-Signature header.
 */
export async function handleWebhook(payload: string | Buffer, signature: string) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    logger.error({ err: err.message }, "Stripe webhook signature verification failed");
    throw new Error(`Webhook Error: ${err.message}`);
  }

  const intent = event.data.object as Stripe.PaymentIntent;
  const orderId = intent.metadata.orderId;

  if (!orderId) {
    logger.warn({ eventType: event.type }, "Stripe event missing orderId in metadata");
    return;
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await updateOrderStatus(orderId, "paid", "Payment succeeded via Stripe", "webhook");
      break;

    case "payment_intent.payment_failed":
      await updateOrderStatus(orderId, "payment_failed", intent.last_payment_error?.message || "Payment failed via Stripe", "webhook");
      break;

    case "charge.dispute.created":
      await updateOrderStatus(orderId, "cancelled", "Dispute created - flagged for review", "webhook");
      break;

    case "refund.created":
      await updateOrderStatus(orderId, "refunded", "Refund processed via Stripe", "webhook");
      break;

    default:
      logger.info({ eventType: event.type }, "Unhandled Stripe webhook event");
  }
}

async function updateOrderStatus(orderId: string, status: string, message: string, actor: string) {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    logger.error({ orderId }, "Order not found during Stripe webhook processing");
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

  logger.info({ orderId, status }, "Order status updated via Stripe webhook");
}
