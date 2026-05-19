import { Types } from "mongoose";
import { ReviewModel, type ReviewStatus } from "../models/review.model.js";
import { OrderModel } from "../models/order.model.js";
import { ProductModel } from "../models/product.model.js";
import { prisma } from "../config/prisma.js";
import { BadRequest, Conflict, Forbidden, NotFound } from "../utils/errors.js";
import { buildPageMeta } from "../utils/pagination.js";

export async function createReview(
  userId: string,
  input: { productId: string; rating: number; title?: string; body: string },
) {
  const product = await ProductModel.findById(input.productId);
  if (!product) throw NotFound("Product not found");

  const duplicate = await ReviewModel.findOne({ productId: input.productId, userId });
  if (duplicate) throw Conflict("You have already reviewed this product");

  // verifiedPurchase: did this user have a delivered order containing this product?
  const purchased = await OrderModel.exists({
    userId,
    status: { $in: ["delivered", "shipped", "paid"] },
    "items.productId": new Types.ObjectId(input.productId),
  });
  if (!purchased) {
    throw Forbidden("You can only review products you have purchased");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw BadRequest("User not found");

  const review = await ReviewModel.create({
    productId: input.productId,
    userId,
    userName: user.name ?? user.email.split("@")[0],
    rating: input.rating,
    title: input.title ?? "",
    body: input.body,
    verifiedPurchase: Boolean(purchased),
    status: "approved",
  });
  await recomputeProductRating(input.productId);
  return review;
}

export async function updateReview(
  userId: string,
  reviewId: string,
  input: { rating: number; title?: string; body: string },
) {
  const review = await ReviewModel.findOne({ _id: reviewId, userId });
  if (!review) throw NotFound("Review not found");

  const purchased = await OrderModel.exists({
    userId,
    status: { $in: ["delivered", "shipped", "paid"] },
    "items.productId": review.productId,
  });
  if (!purchased) {
    throw Forbidden("You can only edit reviews for products you have purchased");
  }

  review.rating = input.rating;
  review.title = input.title ?? "";
  review.body = input.body;
  review.status = "pending";
  review.moderatorNote = undefined;
  await review.save();
  return review;
}

export async function listMyReviews(userId: string, productId?: string) {
  const filter: Record<string, unknown> = { userId };
  if (productId) filter.productId = productId;
  return ReviewModel.find(filter).sort({ createdAt: -1 }).lean();
}

export async function listReviews(args: {
  productId?: string;
  status?: ReviewStatus;
  page: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (args.productId) filter.productId = args.productId;
  // If no status filter: default to approved for public listings.
  filter.status = args.status ?? "approved";
  const skip = (args.page - 1) * args.limit;
  const [items, total] = await Promise.all([
    ReviewModel.find(filter)
      .select("-userId -status -moderatorNote")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(args.limit)
      .lean(),
    ReviewModel.countDocuments(filter),
  ]);
  return { items, pagination: buildPageMeta(total, { page: args.page, limit: args.limit, skip }) };
}

export async function listPending(page: number, limit: number) {
  return listReviews({ status: "pending", page, limit });
}

async function recomputeProductRating(productId: string) {
  const [agg] = await ReviewModel.aggregate<{ avg: number; count: number }>([
    { $match: { productId: new Types.ObjectId(productId), status: "approved" } },
    { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await ProductModel.updateOne(
    { _id: productId },
    {
      ratingAverage: agg ? Math.round(agg.avg * 10) / 10 : 0,
      ratingCount: agg ? agg.count : 0,
    },
  );
}

export async function moderate(id: string, status: "approved" | "rejected", note?: string) {
  const review = await ReviewModel.findById(id);
  if (!review) throw NotFound("Review not found");
  review.status = status;
  if (note) review.moderatorNote = note;
  await review.save();
  await recomputeProductRating(String(review.productId));
  return review;
}

export async function remove(id: string) {
  const review = await ReviewModel.findByIdAndDelete(id);
  if (!review) throw NotFound("Review not found");
  await recomputeProductRating(String(review.productId));
  return { ok: true };
}
