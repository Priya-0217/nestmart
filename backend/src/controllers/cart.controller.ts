import type { Request, Response } from "express";
import * as service from "../services/cart.service.js";

export async function get(req: Request, res: Response) {
  const result = await service.getCart(req.user!.id);
  res.json(result);
}

export async function addItem(req: Request, res: Response) {
  const result = await service.addItem(req.user!.id, req.body.productId, req.body.quantity);
  res.status(201).json(result);
}

export async function updateItem(req: Request, res: Response) {
  const result = await service.updateItem(req.user!.id, req.body.productId, req.body.quantity);
  res.json(result);
}

export async function removeItem(req: Request, res: Response) {
  const result = await service.removeItem(req.user!.id, req.body.productId);
  res.json(result);
}

export async function applyCoupon(req: Request, res: Response) {
  const result = await service.applyCoupon(req.user!.id, req.body.code);
  res.json(result);
}

export async function removeCoupon(req: Request, res: Response) {
  const result = await service.removeCoupon(req.user!.id);
  res.json(result);
}
