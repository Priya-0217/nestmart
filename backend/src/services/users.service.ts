import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { BadRequest, NotFound, Unauthorized } from "../utils/errors.js";
import { WishlistModel } from "../models/wishlist.model.js";
import { ProductModel } from "../models/product.model.js";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw NotFound("User not found");
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified !== null,
    createdAt: user.createdAt,
  };
}

export async function updateProfile(userId: string, data: Record<string, unknown>) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return getProfile(user.id);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) throw Unauthorized("Password not set for this account");
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw Unauthorized("Current password is incorrect");
  const newHash = await bcrypt.hash(newPassword, env.BCRYPT_COST);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
  return { ok: true };
}

// -------------------- Addresses --------------------

export async function listAddresses(userId: string) {
  const items = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return { items };
}

export async function createAddress(userId: string, data: Record<string, unknown>) {
  const isDefault = data.isDefault === true;
  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const count = await tx.address.count({ where: { userId } });
    return tx.address.create({
      data: { ...(data as object), userId, isDefault: isDefault || count === 0 } as never,
    });
  });
}

export async function updateAddress(userId: string, id: string, data: Record<string, unknown>) {
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw NotFound("Address not found");
  return prisma.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id }, data });
  });
}

export async function deleteAddress(userId: string, id: string) {
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw NotFound("Address not found");
  await prisma.address.delete({ where: { id } });
  return { ok: true };
}

// -------------------- Wishlist --------------------

export async function getWishlist(userId: string) {
  const wishlist = await WishlistModel.findOne({ userId }).lean();
  if (!wishlist || wishlist.productIds.length === 0) return { items: [] };
  const products = await ProductModel.find({ _id: { $in: wishlist.productIds } }).lean();
  return { items: products };
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await ProductModel.findById(productId);
  if (!product) throw BadRequest("Product not found");
  await WishlistModel.updateOne(
    { userId },
    { $addToSet: { productIds: productId } },
    { upsert: true },
  );
  return getWishlist(userId);
}

export async function removeFromWishlist(userId: string, productId: string) {
  await WishlistModel.updateOne({ userId }, { $pull: { productIds: productId } });
  return getWishlist(userId);
}
