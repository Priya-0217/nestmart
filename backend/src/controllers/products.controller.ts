import type { Request, Response } from "express";
import * as service from "../services/products.service.js";

export async function list(req: Request, res: Response) {
  const result = await service.listProducts(req.query as never);
  res.json(result);
}

export async function get(req: Request, res: Response) {
  const result = await service.getProductById(req.params.id as string);
  res.json(result);
}

export async function related(req: Request, res: Response) {
  const result = await service.getRelated(req.params.id as string);
  res.json(result);
}

export async function create(req: Request, res: Response) {
  const product = await service.createProduct(req.body);
  res.status(201).json(product);
}

export async function update(req: Request, res: Response) {
  const product = await service.updateProduct(req.params.id as string, req.body);
  res.json(product);
}

export async function remove(req: Request, res: Response) {
  const result = await service.deleteProduct(req.params.id as string);
  res.json(result);
}
