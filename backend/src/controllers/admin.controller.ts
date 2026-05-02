import type { Request, Response } from "express";
import * as service from "../services/admin.service.js";

export async function dashboardStats(req: Request, res: Response) {
  const { days } = req.query as unknown as { days: number };
  const stats = await service.getDashboardStats(days);
  res.json(stats);
}

export async function inventoryAlerts(req: Request, res: Response) {
  const { threshold } = req.query as unknown as { threshold: number };
  const result = await service.inventoryAlerts(threshold);
  res.json(result);
}

export async function bulkUpdateProducts(req: Request, res: Response) {
  const result = await service.bulkUpdateProducts(req.body.productIds, req.body.update);
  res.json(result);
}

export async function bulkUpdateOrderStatus(req: Request, res: Response) {
  const result = await service.bulkUpdateOrderStatus(req.body.orderIds, req.body.status);
  res.json(result);
}

export async function listUsers(req: Request, res: Response) {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? 20), 10) || 20));
  const result = await service.listUsers(page, limit);
  res.json(result);
}
