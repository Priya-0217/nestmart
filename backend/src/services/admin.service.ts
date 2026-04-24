import { OrderModel } from "../models/order.model.js";
import { ProductModel } from "../models/product.model.js";
import { prisma } from "../config/prisma.js";
import type { OrderStatus } from "../models/order.model.js";

export interface DashboardStats {
  range: { days: number; from: string; to: string };
  revenue: number;
  ordersCount: number;
  usersCount: number;
  newUsersCount: number;
  conversion: number; // orders / users * 100
  avgOrderValue: number;
  byStatus: Array<{ status: string; count: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
}

export async function getDashboardStats(days: number): Promise<DashboardStats> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  const [revenueAgg, ordersCount, usersCount, newUsersCount, byStatusAgg, dailyAgg] =
    await Promise.all([
      OrderModel.aggregate<{ total: number }>([
        { $match: { createdAt: { $gte: from }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      OrderModel.countDocuments({ createdAt: { $gte: from } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: from } } }),
      OrderModel.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: from } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      OrderModel.aggregate<{ _id: string; revenue: number; orders: number }>([
        { $match: { createdAt: { $gte: from } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] },
            },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  const revenue = revenueAgg[0]?.total ?? 0;
  const conversion = usersCount > 0 ? Math.round((ordersCount / usersCount) * 10000) / 100 : 0;
  const avgOrderValue = ordersCount > 0 ? Math.round((revenue / ordersCount) * 100) / 100 : 0;

  return {
    range: { days, from: from.toISOString(), to: to.toISOString() },
    revenue: Math.round(revenue * 100) / 100,
    ordersCount,
    usersCount,
    newUsersCount,
    conversion,
    avgOrderValue,
    byStatus: byStatusAgg.map((s) => ({ status: s._id, count: s.count })),
    dailyRevenue: dailyAgg.map((d) => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
  };
}

export async function inventoryAlerts(threshold: number) {
  const items = await ProductModel.find({ stock: { $lte: threshold }, isActive: true })
    .sort({ stock: 1 })
    .select("_id slug title stock price images")
    .lean();
  return { threshold, items };
}

export async function bulkUpdateProducts(ids: string[], update: Record<string, unknown>) {
  const result = await ProductModel.updateMany({ _id: { $in: ids } }, { $set: update });
  return { matched: result.matchedCount, modified: result.modifiedCount };
}

export async function bulkUpdateOrderStatus(ids: string[], status: OrderStatus) {
  const result = await OrderModel.updateMany({ _id: { $in: ids } }, { $set: { status } });
  return { matched: result.matchedCount, modified: result.modifiedCount };
}

export async function listUsers(page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
    prisma.user.count(),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}
