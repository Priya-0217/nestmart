import { Types, type FilterQuery } from "mongoose";
import { ProductModel, type Product } from "../models/product.model.js";
import { NotFound } from "../utils/errors.js";
import { buildPageMeta } from "../utils/pagination.js";

export interface ListProductsArgs {
  q?: string;
  category?: string;
  brand?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort: "newest" | "price-asc" | "price-desc" | "rating" | "popular";
  page: number;
  limit: number;
}

const sortMap: Record<ListProductsArgs["sort"], Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { ratingAverage: -1, ratingCount: -1 },
  popular: { ratingCount: -1, ratingAverage: -1 },
};

export async function listProducts(args: ListProductsArgs) {
  const filter: FilterQuery<Product> = { isActive: true };
  if (args.q) filter.$text = { $search: args.q };
  if (args.category) filter.category = new Types.ObjectId(args.category);
  if (args.brand) filter.brand = args.brand;
  if (args.tag) filter.tags = args.tag;
  if (args.minPrice !== undefined || args.maxPrice !== undefined) {
    filter.price = {};
    if (args.minPrice !== undefined) filter.price.$gte = args.minPrice;
    if (args.maxPrice !== undefined) filter.price.$lte = args.maxPrice;
  }
  if (args.minRating !== undefined) filter.ratingAverage = { $gte: args.minRating };
  if (args.inStock === true) filter.stock = { $gt: 0 };
  if (args.inStock === false) filter.stock = { $lte: 0 };

  const skip = (args.page - 1) * args.limit;
  const [items, total] = await Promise.all([
    ProductModel.find(filter).sort(sortMap[args.sort]).skip(skip).limit(args.limit).lean(),
    ProductModel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: buildPageMeta(total, { page: args.page, limit: args.limit, skip }),
  };
}

export async function getProductById(id: string) {
  const product = await ProductModel.findById(id).lean();
  if (!product) throw NotFound("Product not found");
  return product;
}

export async function getRelated(id: string) {
  const product = await ProductModel.findById(id).lean();
  if (!product) throw NotFound("Product not found");
  const related = await ProductModel.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category }, { tags: { $in: product.tags ?? [] } }],
  })
    .sort({ ratingAverage: -1 })
    .limit(8)
    .lean();
  return { items: related };
}

export async function createProduct(input: Record<string, unknown>) {
  return ProductModel.create(input);
}

export async function updateProduct(id: string, input: Record<string, unknown>) {
  const updated = await ProductModel.findByIdAndUpdate(id, input, { new: true });
  if (!updated) throw NotFound("Product not found");
  return updated;
}

export async function deleteProduct(id: string) {
  const deleted = await ProductModel.findByIdAndDelete(id);
  if (!deleted) throw NotFound("Product not found");
  return { ok: true };
}
