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
    primaryAddress1Id: user.primaryAddress1Id,
    primaryAddress2Id: user.primaryAddress2Id,
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
  const [user, items] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { primaryAddress1Id: true, primaryAddress2Id: true },
    }),
    prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);
  return {
    items,
    primaryAddress1Id: user?.primaryAddress1Id ?? null,
    primaryAddress2Id: user?.primaryAddress2Id ?? null,
  };
}

export async function createAddress(userId: string, data: Record<string, unknown>) {
  const isDefault = data.isDefault === true;
  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const [count, user] = await Promise.all([
      tx.address.count({ where: { userId } }),
      tx.user.findUnique({
        where: { id: userId },
        select: { primaryAddress1Id: true, primaryAddress2Id: true },
      }),
    ]);
    const created = await tx.address.create({
      data: { ...(data as object), userId, isDefault: isDefault || count === 0 } as never,
    });
    if (user) {
      const updateData: { primaryAddress1Id?: string; primaryAddress2Id?: string } = {};
      if (!user.primaryAddress1Id) {
        updateData.primaryAddress1Id = created.id;
      } else if (!user.primaryAddress2Id) {
        updateData.primaryAddress2Id = created.id;
      }
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({ where: { id: userId }, data: updateData });
      }
    }
    return created;
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

export async function setPrimaryAddresses(
  userId: string,
  data: { primaryAddress1Id?: string | null; primaryAddress2Id?: string | null },
) {
  if (data.primaryAddress1Id && data.primaryAddress2Id && data.primaryAddress1Id === data.primaryAddress2Id) {
    throw BadRequest("Primary addresses must be different");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { primaryAddress1Id: true, primaryAddress2Id: true },
    });
    if (!user) throw NotFound("User not found");

    if (data.primaryAddress1Id) {
      const address = await tx.address.findUnique({ where: { id: data.primaryAddress1Id } });
      if (!address || address.userId !== userId) throw BadRequest("Primary address 1 not found");
    }
    if (data.primaryAddress2Id) {
      const address = await tx.address.findUnique({ where: { id: data.primaryAddress2Id } });
      if (!address || address.userId !== userId) throw BadRequest("Primary address 2 not found");
    }

    const nextPrimary1 =
      data.primaryAddress1Id !== undefined ? data.primaryAddress1Id : user.primaryAddress1Id;
    const nextPrimary2 =
      data.primaryAddress2Id !== undefined ? data.primaryAddress2Id : user.primaryAddress2Id;

    if (nextPrimary1 && nextPrimary2 && nextPrimary1 === nextPrimary2) {
      throw BadRequest("Primary addresses must be different");
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        ...(data.primaryAddress1Id !== undefined ? { primaryAddress1Id: data.primaryAddress1Id } : {}),
        ...(data.primaryAddress2Id !== undefined ? { primaryAddress2Id: data.primaryAddress2Id } : {}),
      },
      select: { primaryAddress1Id: true, primaryAddress2Id: true },
    });
    return updated;
  });
}

export async function deleteAddress(userId: string, id: string) {
  const [existing, user] = await Promise.all([
    prisma.address.findUnique({ where: { id } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { primaryAddress1Id: true, primaryAddress2Id: true },
    }),
  ]);
  if (!existing || existing.userId !== userId) throw NotFound("Address not found");
  if (!user) throw NotFound("User not found");

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });

    const remaining = await tx.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    let primaryAddress1Id = user.primaryAddress1Id === id ? null : user.primaryAddress1Id;
    let primaryAddress2Id = user.primaryAddress2Id === id ? null : user.primaryAddress2Id;

    if (!primaryAddress1Id && remaining.length > 0) {
      primaryAddress1Id = remaining[0]!.id;
    }
    if (!primaryAddress2Id) {
      const fallback = remaining.find((addr) => addr.id !== primaryAddress1Id);
      primaryAddress2Id = fallback?.id ?? null;
    }
    if (primaryAddress1Id && primaryAddress2Id && primaryAddress1Id === primaryAddress2Id) {
      primaryAddress2Id = null;
    }

    await tx.user.update({
      where: { id: userId },
      data: { primaryAddress1Id, primaryAddress2Id },
    });

    if (existing.isDefault && remaining.length > 0) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      await tx.address.update({
        where: { id: remaining[0]!.id },
        data: { isDefault: true },
      });
    }
  });

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
