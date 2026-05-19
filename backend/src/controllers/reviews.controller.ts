import type { Request, Response } from "express";
import * as service from "../services/reviews.service.js";

export async function create(req: Request, res: Response) {
  const review = await service.createReview(req.user!.id, req.body);
  res.status(201).json(review);
}

export async function mine(req: Request, res: Response) {
  const reviews = await service.listMyReviews(req.user!.id, req.query.productId as string | undefined);
  res.json({ items: reviews });
}

export async function update(req: Request, res: Response) {
  const review = await service.updateReview(req.user!.id, req.params.id as string, req.body);
  res.json(review);
}

export async function list(req: Request, res: Response) {
  const result = await service.listReviews(req.query as never);
  res.json(result);
}

export async function listPending(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const result = await service.listPending(page, limit);
  res.json(result);
}

export async function moderate(req: Request, res: Response) {
  const result = await service.moderate(
    req.params.id as string,
    req.body.status,
    req.body.moderatorNote,
  );
  res.json(result);
}

export async function remove(req: Request, res: Response) {
  const result = await service.remove(req.params.id as string);
  res.json(result);
}
