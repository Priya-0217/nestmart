import type { Request, Response } from "express";
import * as service from "../services/coupons.service.js";

export async function validateCoupon(req: Request, res: Response) {
  const result = await service.validateCoupon(req.body.code, req.body.cartTotal);
  res.json(result);
}

export async function list(_req: Request, res: Response) {
  const result = await service.list();
  res.json(result);
}

export async function get(req: Request, res: Response) {
  const item = await service.getById(req.params.id as string);
  res.json(item);
}

export async function create(req: Request, res: Response) {
  const item = await service.create(req.body);
  res.status(201).json(item);
}

export async function update(req: Request, res: Response) {
  const item = await service.update(req.params.id as string, req.body);
  res.json(item);
}

export async function remove(req: Request, res: Response) {
  const result = await service.remove(req.params.id as string);
  res.json(result);
}
