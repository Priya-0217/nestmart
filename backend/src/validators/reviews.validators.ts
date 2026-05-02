import { Types } from "mongoose";
import { z } from "zod";
import { REVIEW_STATUSES } from "../models/review.model.js";

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" });

export const reviewCreateSchema = z.object({
  productId: objectId,
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(5).max(2000),
});

export const reviewListQuerySchema = z.object({
  productId: objectId.optional(),
  status: z.enum(REVIEW_STATUSES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const reviewIdParamsSchema = z.object({ id: objectId });

export const reviewModerationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  moderatorNote: z.string().optional(),
});
