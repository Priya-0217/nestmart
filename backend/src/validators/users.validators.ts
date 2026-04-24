import { Types } from "mongoose";
import { z } from "zod";

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" });

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  avatarUrl: z.string().url().optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const addressCreateSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default("IN"),
  isDefault: z.boolean().default(false),
});

export const addressUpdateSchema = addressCreateSchema.partial();
export const addressIdParamsSchema = z.object({ id: z.string().min(1) });

export const wishlistAddSchema = z.object({ productId: objectId });
export const wishlistRemoveParamsSchema = z.object({ productId: objectId });
