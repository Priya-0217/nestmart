import { Schema, model, type InferSchemaType, type Model } from "mongoose";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: String, required: true, index: true }, // Postgres User.id
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    body: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: false, index: true },
    status: { type: String, enum: REVIEW_STATUSES, default: "pending", index: true },
    moderatorNote: { type: String },
  },
  { timestamps: true },
);

// One review per (user, product).
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export type Review = InferSchemaType<typeof reviewSchema> & { _id: string };
export const ReviewModel: Model<Review> = model<Review>("Review", reviewSchema);
