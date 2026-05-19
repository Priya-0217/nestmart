import { Types } from "mongoose";
import { z } from "zod";
import { ORDER_STATUSES, PAYMENT_METHODS } from "../models/order.model.js";

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" });

export const orderCreateSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  shippingAddressId: z.string().cuid().optional(),
  shippingAddress: z
    .object({
      fullName: z.string().min(1),
      phone: z.string().min(1),
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().default("IN"),
    })
    .optional(),
}).refine((data) => Boolean(data.shippingAddressId || data.shippingAddress), {
  message: "Either shippingAddressId or shippingAddress must be provided",
});

export const orderIdParamsSchema = z.object({ id: objectId });

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().optional(),
});

export const orderReturnSchema = z.object({
  reason: z.string().min(3).max(500),
});

export const orderCancelSchema = z.object({
  reason: z.string().min(3).max(500).optional(),
});

export const ordersListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(ORDER_STATUSES).optional(),
});
