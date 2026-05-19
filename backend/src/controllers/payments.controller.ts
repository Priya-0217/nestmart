import type { Request, Response } from "express";
import { BadRequest } from "../utils/errors.js";
import { OrderModel } from "../models/order.model.js";
import * as stripeService from "../services/stripe.service.js";
import * as razorpayService from "../services/razorpay.service.js";
import { getOrder } from "../services/orders.service.js";

function ensurePayableStatus(status: string) {
  return status === "pending" || status === "payment_failed";
}

export async function createStripeIntent(req: Request, res: Response) {
  const order = await getOrder(req.user!.id, req.user!.role, req.body.orderId as string);
  if (!ensurePayableStatus(order.status)) {
    throw BadRequest("Order is not eligible for payment");
  }
  if (!["card", "stripe"].includes(order.paymentMethod)) {
    throw BadRequest("Order was not created for Stripe payment");
  }

  const payment = await stripeService.createPaymentIntent(order._id, order.total, req.user!.email);
  await OrderModel.updateOne(
    { _id: order._id },
    { $set: { stripePaymentIntentId: payment.stripeId } },
  );

  res.json({
    orderId: order._id,
    clientSecret: payment.clientSecret,
    stripeId: payment.stripeId,
  });
}

export async function createRazorpayOrder(req: Request, res: Response) {
  const order = await getOrder(req.user!.id, req.user!.role, req.body.orderId as string);
  if (!ensurePayableStatus(order.status)) {
    throw BadRequest("Order is not eligible for payment");
  }
  if (order.paymentMethod !== "razorpay") {
    throw BadRequest("Order was not created for Razorpay payment");
  }

  const razorpayOrder = await razorpayService.createRazorpayOrder(order._id, order.total);
  await OrderModel.updateOne(
    { _id: order._id },
    { $set: { razorpayOrderId: razorpayOrder.id } },
  );

  res.json({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    receipt: razorpayOrder.receipt,
  });
}