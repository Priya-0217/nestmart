import { Types } from "mongoose";
import { z } from "zod";

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" });

export const categoryCreateSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(120),
  description: z.string().default(""),
  image: z.string().url().optional(),
  parent: objectId.nullable().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const categoryIdParamsSchema = z.object({ id: objectId });
