import type { Request, Response } from "express";
import * as service from "../services/users.service.js";

export async function getProfile(req: Request, res: Response) {
  const user = await service.getProfile(req.user!.id);
  res.json(user);
}

export async function updateProfile(req: Request, res: Response) {
  const user = await service.updateProfile(req.user!.id, req.body);
  res.json(user);
}

export async function changePassword(req: Request, res: Response) {
  const result = await service.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  res.json(result);
}

export async function listAddresses(req: Request, res: Response) {
  const result = await service.listAddresses(req.user!.id);
  res.json(result);
}

export async function createAddress(req: Request, res: Response) {
  const result = await service.createAddress(req.user!.id, req.body);
  res.status(201).json(result);
}

export async function updateAddress(req: Request, res: Response) {
  const result = await service.updateAddress(req.user!.id, req.params.id as string, req.body);
  res.json(result);
}

export async function setPrimaryAddresses(req: Request, res: Response) {
  const result = await service.setPrimaryAddresses(req.user!.id, req.body);
  res.json(result);
}

export async function deleteAddress(req: Request, res: Response) {
  const result = await service.deleteAddress(req.user!.id, req.params.id as string);
  res.json(result);
}

export async function getWishlist(req: Request, res: Response) {
  const result = await service.getWishlist(req.user!.id);
  res.json(result);
}

export async function addToWishlist(req: Request, res: Response) {
  const result = await service.addToWishlist(req.user!.id, req.body.productId);
  res.status(201).json(result);
}

export async function removeFromWishlist(req: Request, res: Response) {
  const result = await service.removeFromWishlist(req.user!.id, req.params.productId as string);
  res.json(result);
}
