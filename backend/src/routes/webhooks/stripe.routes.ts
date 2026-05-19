import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { prisma } from "../../config/prisma.js";
import { OrderModel } from "../../models/order.model.js";
import { BadRequest } from "../../utils/errors.js";
import { logger } from "../../config/logger.js";

export const stripeWebhookRouter = Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

/**
 * Raw body middleware for Stripe signature verification.
 * Express.json() must come AFTER this router is mounted, or use custom middleware.
 */
stripeWebhookRouter.post(
  "/stripe",
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    if (!stripe) {
      logger.error("Stripe is not configured; ignoring webhook.");
      res.status(500).json({ error: "Stripe not configured" });
      return;
    }

    let event: Stripe.Event;
    try {
      const body = (req as any).rawBody || JSON.stringify(req.body);
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret,
      );
    } catch (err) {
      logger.error({ err }, "Stripe webhook signature verification failed");
      res.status(400).json({ error: "Webhook signature verification failed" });
      return;
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          logger.info({ type: event.type }, "Unhandled webhook event type");
      }
      res.json({ received: true });
    } catch (err) {
      logger.error({ err, eventId: event.id }, "Error processing webhook");
      res.status(500).json({ error: "Failed to process webhook" });
    }
  },
);

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Extract order ID from metadata
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    logger.warn({ piId: paymentIntent.id }, "Payment intent missing orderId in metadata");
    return;
  }

  // Find order and update status
  const order = await OrderModel.findById(orderId);
  if (!order) {
    logger.warn({ orderId }, "Order not found");
    return;
  }

  // Update order status to paid
  order.paymentStatus = "paid";
  order.status = "confirmed";
  order.paidAt = new Date();
  await order.save();

  // Payment confirmation updates the order state; the placement email already contains the full order summary.
  const user = await prisma.user.findUnique({ where: { id: order.userId } });
  if (!user) {
    logger.warn({ orderId }, "Order owner not found during Stripe webhook processing");
  }

  logger.info({ orderId, piId: paymentIntent.id }, "Order payment confirmed");
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    logger.warn({ piId: paymentIntent.id }, "Payment intent missing orderId in metadata");
    return;
  }

  // Find and update order
  const order = await OrderModel.findById(orderId);
  if (!order) {
    logger.warn({ orderId }, "Order not found");
    return;
  }

  // Update order status to failed
  order.paymentStatus = "failed";
  order.status = "payment_failed";
  await order.save();

  logger.info({ orderId, piId: paymentIntent.id }, "Order payment failed");
}
