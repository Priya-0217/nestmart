import { Types } from "mongoose";
import { z } from "zod";

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" });

export const couponCreateSchema = z
  .object({
    code: z.string().min(3).max(30),
    description: z.string().default(""),
    type: z.enum(["percent", "fixed"]),
    value: z.number().positive(),
    minOrderAmount: z.number().nonnegative().default(0),
    maxDiscount: z.number().nonnegative().optional(),
    usageLimit: z.number().int().nonnegative().optional(),
    perUserLimit: z.number().int().nonnegative().default(1),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date(),
    isActive: z.boolean().default(true),
  })
  .refine((v) => (v.type === "percent" ? v.value <= 100 : true), {
    message: "percent coupons must have value <= 100",
    path: ["value"],
  });

export const couponUpdateSchema = z.object({
  description: z.string().optional(),
  type: z.enum(["percent", "fixed"]).optional(),
  value: z.number().positive().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().nonnegative().optional(),
  perUserLimit: z.number().int().nonnegative().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const couponIdParamsSchema = z.object({ id: objectId });

export const couponValidateSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().nonnegative(),
});
