import { Types } from "mongoose";
import { z } from "zod";

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" });

export const cartAddSchema = z.object({
  productId: objectId,
  quantity: z.number().int().positive().default(1),
});

export const cartUpdateSchema = z.object({
  productId: objectId,
  quantity: z.number().int().nonnegative(),
});

export const cartRemoveSchema = z.object({
  productId: objectId,
});

export const cartCouponSchema = z.object({
  code: z.string().min(1),
});
