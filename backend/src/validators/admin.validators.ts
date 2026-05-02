import { Types } from "mongoose";
import { z } from "zod";
import { ORDER_STATUSES } from "../models/order.model.js";

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" });

export const statsRangeSchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
});

export const bulkProductUpdateSchema = z.object({
  productIds: z.array(objectId).min(1).max(500),
  update: z.object({
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
  }),
});

export const bulkOrderStatusSchema = z.object({
  orderIds: z.array(objectId).min(1).max(500),
  status: z.enum(ORDER_STATUSES),
});

export const inventoryAlertsQuerySchema = z.object({
  threshold: z.coerce.number().int().nonnegative().default(5),
});
