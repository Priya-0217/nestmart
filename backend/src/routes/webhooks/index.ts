import { Router, type Request, type Response } from "express";
import { logger } from "../../config/logger.js";
import * as stripeService from "../../services/stripe.service.js";
import * as razorpayService from "../../services/razorpay.service.js";

export const webhookRouter = Router();

/**
 * Stripe Webhook Handler
 */
webhookRouter.post(
  "/stripe",
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const body = (req as any).rawBody || req.body;

    try {
      await stripeService.handleWebhook(body, signature);
      res.json({ received: true });
    } catch (err: any) {
      logger.error({ err: err.message }, "Stripe webhook failed");
      res.status(400).send(err.message);
    }
  }
);

/**
 * Razorpay Webhook Handler
 */
webhookRouter.post(
  "/razorpay",
  async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = (req as any).rawBody || JSON.stringify(req.body);

    if (!razorpayService.verifyWebhookSignature(body, signature)) {
      logger.warn("Razorpay webhook signature verification failed");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    try {
      await razorpayService.handleWebhook(req.body);
      res.json({ received: true });
    } catch (err: any) {
      logger.error({ err: err.message }, "Razorpay webhook processing failed");
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
