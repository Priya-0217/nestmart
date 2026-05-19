import { Schema, model, type InferSchemaType, type Model } from "mongoose";

export const COUPON_TYPES = ["percent", "fixed"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, default: "" },
    type: { type: String, enum: COUPON_TYPES, required: true },
    // percent: 0..100   |   fixed: amount in currency's smallest unit (e.g. rupees)
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 0 }, // total uses across all users
    perUserLimit: { type: Number, min: 0, default: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type Coupon = InferSchemaType<typeof couponSchema> & { _id: string };
export const CouponModel: Model<Coupon> = model<Coupon>("Coupon", couponSchema);
