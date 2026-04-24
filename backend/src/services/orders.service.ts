import { randomBytes } from "node:crypto";
import { OrderModel, type OrderStatus, type PaymentMethod } from "../models/order.model.js";
import { ProductModel } from "../models/product.model.js";
import { BadRequest, Forbidden, NotFound } from "../utils/errors.js";
import { buildPageMeta } from "../utils/pagination.js";
import { CartModel } from "../models/cart.model.js";
import * as cartService from "./cart.service.js";
import * as coupons from "./coupons.service.js";
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail } from "./email.service.js";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

export interface CreateOrderArgs {
  userId: string;
  email: string;
  paymentMethod: PaymentMethod;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

function generateOrderNumber(): string {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `NM-${stamp}-${suffix}`;
}

export async function createOrder(args: CreateOrderArgs) {
  if (args.paymentMethod === "cod" && !env.COD_ENABLED) {
    throw BadRequest("Cash on Delivery is currently disabled");
  }

  const cart = await CartModel.findOne({ userId: args.userId });
  if (!cart || cart.items.length === 0) throw BadRequest("Cart is empty");

  // Re-verify stock and unit prices from the product catalog.
  for (const item of cart.items) {
    const product = await ProductModel.findById(item.productId);
    if (!product || !product.isActive) throw BadRequest(`Product ${item.title} unavailable`);
    if (product.stock < item.quantity) throw BadRequest(`Not enough stock for ${item.title}`);
  }

  const totals = await cartService.computeTotals(cart);

  const orderNumber = generateOrderNumber();
  const order = await OrderModel.create({
    orderNumber,
    userId: args.userId,
    items: cart.items.map((i) => ({
      productId: i.productId,
      title: i.title,
      image: i.image,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      subtotal: Math.round(i.unitPrice * i.quantity * 100) / 100,
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    currency: totals.currency,
    couponCode: cart.couponCode,
    paymentMethod: args.paymentMethod,
    paymentStatus: args.paymentMethod === "cod" ? "pending" : "pending",
    status: "pending",
    shippingAddress: args.shippingAddress,
    placedAt: new Date(),
  });

  // Decrement stock and bump coupon usage (best-effort — full atomic inventory is Phase 4).
  await Promise.all(
    cart.items.map((i) =>
      ProductModel.updateOne({ _id: i.productId }, { $inc: { stock: -i.quantity } }),
    ),
  );
  if (cart.couponCode) await coupons.incrementUsage(cart.couponCode);

  // Clear cart after successful order creation.
  await cartService.clearCart(args.userId);

  // Order-confirmation email (the final "paid" email goes out after payment success).
  await sendOrderConfirmationEmail(args.email, order.orderNumber);

  return order;
}

export async function listUserOrders(userId: string, page: number, limit: number, status?: OrderStatus) {
  const filter: Record<string, unknown> = { userId };
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    OrderModel.countDocuments(filter),
  ]);
  return { items, pagination: buildPageMeta(total, { page, limit, skip }) };
}

export async function listAllOrders(page: number, limit: number, status?: OrderStatus) {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    OrderModel.countDocuments(filter),
  ]);
  return { items, pagination: buildPageMeta(total, { page, limit, skip }) };
}

export async function getOrder(userId: string, role: string, id: string) {
  const order = await OrderModel.findById(id).lean();
  if (!order) throw NotFound("Order not found");
  if (order.userId !== userId && role !== "admin" && role !== "manager") {
    throw Forbidden("Not your order");
  }
  return order;
}

export async function cancelOrder(userId: string, id: string, reason?: string) {
  const order = await OrderModel.findById(id);
  if (!order) throw NotFound("Order not found");
  if (order.userId !== userId) throw Forbidden("Not your order");
  if (!["pending", "paid"].includes(order.status)) {
    throw BadRequest("Order can no longer be cancelled");
  }
  order.status = "cancelled";
  if (reason) order.cancelReason = reason;
  await order.save();

  // Restock.
  await Promise.all(
    order.items.map((i) =>
      ProductModel.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity } }),
    ),
  );
  return order;
}

export async function requestReturn(userId: string, id: string, reason: string) {
  const order = await OrderModel.findById(id);
  if (!order) throw NotFound("Order not found");
  if (order.userId !== userId) throw Forbidden("Not your order");
  if (order.status !== "delivered") throw BadRequest("Only delivered orders can be returned");
  order.status = "return_requested";
  order.returnReason = reason;
  await order.save();
  return order;
}

export async function updateStatus(id: string, status: OrderStatus, trackingNumber?: string) {
  const order = await OrderModel.findById(id);
  if (!order) throw NotFound("Order not found");
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === "shipped" && !order.shippedAt) order.shippedAt = new Date();
  if (status === "delivered" && !order.deliveredAt) order.deliveredAt = new Date();
  await order.save();

  if (status === "shipped" && order.trackingNumber) {
    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (user?.email) {
      await sendShippingConfirmationEmail(user.email, order.orderNumber, order.trackingNumber);
    }
  }
  return order;
}
