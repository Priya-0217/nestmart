import type { Request, Response } from "express";
import * as service from "../services/reviews.service.js";

export async function create(req: Request, res: Response) {
  const review = await service.createReview(req.user!.id, req.body);
  res.status(201).json(review);
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
