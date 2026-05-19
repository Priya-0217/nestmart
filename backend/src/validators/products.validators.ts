import { Types } from "mongoose";
import { z } from "zod";

const objectId = z
  .string()
  .refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" });

const productIdOrSlug = z
  .string()
  .min(1)
  .max(120)
  .refine(
    (v) => Types.ObjectId.isValid(v) || /^[a-zA-Z0-9-]+$/.test(v),
    { message: "Invalid product id or slug" }
  );

export const productCreateSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-zA-Z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().default(""),
  brand: z.string().default("NestMart"),
  category: objectId,
  subcategory: objectId.optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  currency: z.string().default("INR"),
  stock: z.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  attributes: z.record(z.string(), z.unknown()).default({}),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productIdParamsSchema = z.object({ id: productIdOrSlug });

export const productListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  tag: z.string().optional(),
  isFeatured: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (typeof v === "boolean") return v;
      return v === "true";
    }),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (typeof v === "boolean") return v;
      return v === "true";
    }),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating", "popular"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
