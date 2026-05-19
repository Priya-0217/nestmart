import { CouponModel, type Coupon } from "../models/coupon.model.js";
import { BadRequest, NotFound } from "../utils/errors.js";

export interface AppliedCoupon {
  code: string;
  type: Coupon["type"];
  value: number;
  discount: number;
}

function computeDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.type === "percent") {
    const raw = (subtotal * coupon.value) / 100;
    return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  }
  return Math.min(coupon.value, subtotal);
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

/** Validates a coupon and returns the applicable discount for the given subtotal. Throws on invalid. */
export async function validateCoupon(code: string, subtotal: number): Promise<AppliedCoupon> {
  const coupon = await CouponModel.findOne({ code: normalizeCode(code) });
  if (!coupon) throw NotFound("Coupon not found");
  const now = new Date();
  if (!coupon.isActive) throw BadRequest("Coupon is inactive");
  if (coupon.startsAt && coupon.startsAt > now) throw BadRequest("Coupon is not yet active");
  if (coupon.expiresAt < now) throw BadRequest("Coupon has expired");
  if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
    throw BadRequest(`Minimum order amount is ${coupon.minOrderAmount}`);
  }
  if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw BadRequest("Coupon usage limit reached");
  }
  const discount = computeDiscount(coupon, subtotal);
  return { code: coupon.code, type: coupon.type, value: coupon.value, discount };
}

export async function incrementUsage(code: string) {
  await CouponModel.updateOne({ code: normalizeCode(code) }, { $inc: { usedCount: 1 } });
}

export async function list() {
  const items = await CouponModel.find().sort({ createdAt: -1 }).lean();
  return { items };
}

export async function getById(id: string) {
  const item = await CouponModel.findById(id).lean();
  if (!item) throw NotFound("Coupon not found");
  return item;
}

export async function create(input: Record<string, unknown>) {
  const normalized = typeof input.code === "string" ? { ...input, code: normalizeCode(input.code) } : input;
  return CouponModel.create(normalized);
}

export async function update(id: string, input: Record<string, unknown>) {
  const normalized = typeof input.code === "string" ? { ...input, code: normalizeCode(input.code) } : input;
  const updated = await CouponModel.findByIdAndUpdate(id, normalized, { new: true });
  if (!updated) throw NotFound("Coupon not found");
  return updated;
}

export async function remove(id: string) {
  const deleted = await CouponModel.findByIdAndDelete(id);
  if (!deleted) throw NotFound("Coupon not found");
  return { ok: true };
}
