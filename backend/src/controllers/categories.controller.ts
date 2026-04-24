import type { Request, Response } from "express";
import * as service from "../services/categories.service.js";

export async function listTree(_req: Request, res: Response) {
  const items = await service.listTree();
  res.json({ items });
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
