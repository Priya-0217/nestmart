import type { Request, Response } from "express";
import crypto from "node:crypto";
import * as service from "../services/orders.service.js";
import { OrderModel, type OrderStatus } from "../models/order.model.js";
import { env } from "../config/env.js";

export async function create(req: Request, res: Response) {
  const order = await service.createOrder({
    userId: req.user!.id,
    email: req.user!.email,
    paymentMethod: req.body.paymentMethod,
    shippingAddressId: req.body.shippingAddressId,
    shippingAddress: req.body.shippingAddress,
  });
  res.status(201).json(order);
}

export async function listMine(req: Request, res: Response) {
  const { page, limit, status } = req.query as unknown as {
    page: number;
    limit: number;
    status?: OrderStatus;
  };
  const result = await service.listUserOrders(req.user!.id, page, limit, status);
  res.json(result);
}

export async function listAll(req: Request, res: Response) {
  const { page, limit, status } = req.query as unknown as {
    page: number;
    limit: number;
    status?: OrderStatus;
  };
  const result = await service.listAllOrders(page, limit, status);
  res.json(result);
}

export async function get(req: Request, res: Response) {
  const order = await service.getOrder(req.user!.id, req.user!.role, req.params.id as string);
  res.json(order);
}

export async function cancel(req: Request, res: Response) {
  const order = await service.cancelOrder(req.user!.id, req.params.id as string, req.body.reason);
  res.json(order);
}

export async function returnRequest(req: Request, res: Response) {
  const order = await service.requestReturn(req.user!.id, req.params.id as string, req.body.reason);
  res.json(order);
}

export async function updateStatus(req: Request, res: Response) {
  const order = await service.updateStatus(
    req.params.id as string,
    req.body.status,
    req.body.trackingNumber,
  );
  res.json(order);
}

export async function verifyRazorpayPayment(req: Request, res: Response) {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  const orderId = req.params.id as string;

  const order = await OrderModel.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.razorpayOrderId !== razorpayOrderId) {
    return res.status(400).json({ message: "Invalid Razorpay Order ID" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  // Signature verified successfully
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  const updatedOrder = await service.transitionStatus(
    order.id,
    "paid",
    "system",
    undefined,
    "Razorpay payment verified successfully"
  );

  res.json(updatedOrder);
}

