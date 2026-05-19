import { randomBytes } from "node:crypto";
import { OrderModel, type OrderStatus, type PaymentMethod, OrderEventModel } from "../models/index.js";
import { ProductModel } from "../models/product.model.js";
import { BadRequest, Forbidden, NotFound } from "../utils/errors.js";
import { buildPageMeta } from "../utils/pagination.js";
import { CartModel } from "../models/cart.model.js";
import * as cartService from "./cart.service.js";
import * as coupons from "./coupons.service.js";
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail } from "./email.service.js";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export interface CreateOrderArgs {
  userId: string;
  email: string;
  paymentMethod: PaymentMethod;
  shippingAddressId?: string;
  shippingAddress?: {
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

type ShippingAddressPayload = NonNullable<CreateOrderArgs["shippingAddress"]>;

function generateOrderNumber(): string {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `NM-${stamp}-${suffix}`;
}

/**
 * Creates a new order.
 * Implements CREATED -> AWAITING_PAYMENT state.
 */
export async function createOrder(args: CreateOrderArgs) {
  if (args.paymentMethod === "cod") {
    if (!env.COD_ENABLED) {
      throw BadRequest("Cash on Delivery is currently disabled");
    }
  }

  const resolvedShippingAddress = await resolveShippingAddress(args);

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
  const shippingAddressText = [
    resolvedShippingAddress.fullName,
    resolvedShippingAddress.phone,
    resolvedShippingAddress.line1,
    resolvedShippingAddress.line2,
    `${resolvedShippingAddress.city}, ${resolvedShippingAddress.state} ${resolvedShippingAddress.postalCode}`,
    resolvedShippingAddress.country,
  ].filter(Boolean).join(", ");

  const orderConfirmationEmailData = {
    orderId: orderNumber,
    customerName: args.email.split("@")[0] || "there",
    items: cart.items.map((item) => ({
      productName: item.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTotal: Math.round(item.unitPrice * item.quantity * 100) / 100,
    })),
    subtotal: totals.subtotal,
    shippingCost: totals.shipping,
    tax: totals.tax,
    totalAmount: totals.total,
    shippingAddress: shippingAddressText,
  };

  const session = await OrderModel.startSession();
  session.startTransaction();

  try {
    const status = args.paymentMethod === "cod" ? "pending" : "pending"; // Start as pending
    const paymentStatus = "pending";

    const [createdOrder] = await OrderModel.create(
      [
        {
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
          paymentStatus,
          status,
          shippingAddress: resolvedShippingAddress,
          placedAt: new Date(),
        },
      ],
      { session },
    );

    if (!createdOrder) {
      throw new Error("Failed to create order");
    }

    if (args.paymentMethod === "razorpay") {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(totals.total * 100), // amount in paise
        currency: totals.currency,
        receipt: createdOrder.orderNumber,
      });
      createdOrder.razorpayOrderId = rzpOrder.id;
      await createdOrder.save({ session });
    }

    // Stock decrement
    await Promise.all(
      cart.items.map((i) =>
        ProductModel.updateOne(
          { _id: i.productId },
          { $inc: { stock: -i.quantity } },
          { session },
        ),
      ),
    );

    // Initial event log
    await OrderEventModel.create(
      [
        {
          orderId: createdOrder._id,
          status: "pending",
          message: `Order created via ${args.paymentMethod.toUpperCase()}`,
          actor: "user",
          actorId: args.userId,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    if (cart.couponCode) {
      await coupons.incrementUsage(cart.couponCode).catch(() => null);
    }

    await cartService.clearCart(args.userId);
    await sendOrderConfirmationEmail(args.email, orderConfirmationEmailData);

    return createdOrder;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

/**
 * Atomic status transition with event logging.
 */
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "confirmed", "cancelled", "payment_failed"],
  paid: ["confirmed", "shipped", "cancelled", "refunded"],
  confirmed: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "return_requested", "refunded"],
  delivered: ["return_requested", "returned", "refunded"],
  cancelled: [],
  refunded: [],
  payment_failed: ["pending", "cancelled"],
  return_requested: ["returned", "refunded"],
  returned: [],
};

export async function transitionStatus(
  orderId: string, 
  newStatus: OrderStatus, 
  actor: string, 
  actorId?: string, 
  message?: string
) {
  const order = await OrderModel.findById(orderId);
  if (!order) throw NotFound("Order not found");

  const oldStatus = order.status;
  if (!allowedTransitions[oldStatus]?.includes(newStatus) && oldStatus !== newStatus) {
    throw BadRequest(`Cannot transition order from ${oldStatus} to ${newStatus}`);
  }

  const session = await OrderModel.startSession();
  session.startTransaction();

  try {
    order.status = newStatus;
    if (newStatus === "shipped" && !order.shippedAt) order.shippedAt = new Date();
    if (newStatus === "delivered" && !order.deliveredAt) order.deliveredAt = new Date();
    if (newStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date();
        order.paymentStatus = "paid";
    }
    
    await order.save({ session });

    await OrderEventModel.create([{
      orderId,
      status: newStatus,
      message: message || `Status changed from ${oldStatus} to ${newStatus}`,
      actor,
      actorId
    }], { session });

    await session.commitTransaction();

    // Trigger side effects
    if (newStatus === "shipped" && order.trackingNumber) {
      const user = await prisma.user.findUnique({ where: { id: order.userId } });
      if (user?.email) {
        await sendShippingConfirmationEmail(user.email, order.orderNumber, order.trackingNumber);
      }
    }

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  return order;
}

async function resolveShippingAddress(args: CreateOrderArgs): Promise<ShippingAddressPayload> {
  if (args.shippingAddressId) {
    const address = await prisma.address.findUnique({ where: { id: args.shippingAddressId } });
    if (!address || address.userId !== args.userId) {
      throw BadRequest("Selected shipping address not found");
    }
    return {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? undefined,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };
  }

  if (args.shippingAddress) {
    return args.shippingAddress;
  }

  const user = await prisma.user.findUnique({
    where: { id: args.userId },
    select: { primaryAddress1Id: true, primaryAddress2Id: true },
  });
  const fallbackAddressId = user?.primaryAddress1Id ?? user?.primaryAddress2Id;
  if (!fallbackAddressId) {
    throw BadRequest("No shipping address provided and no primary address is set");
  }

  const fallbackAddress = await prisma.address.findUnique({ where: { id: fallbackAddressId } });
  if (!fallbackAddress || fallbackAddress.userId !== args.userId) {
    throw BadRequest("Primary shipping address not found");
  }
  return {
    fullName: fallbackAddress.fullName,
    phone: fallbackAddress.phone,
    line1: fallbackAddress.line1,
    line2: fallbackAddress.line2 ?? undefined,
    city: fallbackAddress.city,
    state: fallbackAddress.state,
    postalCode: fallbackAddress.postalCode,
    country: fallbackAddress.country,
  };
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
    return transitionStatus(id, "cancelled", "user", userId, reason || "Cancelled by user");
}

export async function requestReturn(userId: string, id: string, reason: string) {
    return transitionStatus(id, "return_requested", "user", userId, reason);
}

export async function updateStatus(id: string, status: OrderStatus, trackingNumber?: string, actor?: string, actorId?: string) {
  const order = await OrderModel.findById(id);
  if (!order) throw NotFound("Order not found");
  
  if (trackingNumber) order.trackingNumber = trackingNumber;
  await order.save();

  return transitionStatus(id, status, actor || "admin", actorId, `Admin updated status to ${status}`);
}
