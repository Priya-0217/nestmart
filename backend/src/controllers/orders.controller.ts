import type { Request, Response } from "express";
import * as service from "../services/orders.service.js";
import type { OrderStatus } from "../models/order.model.js";

export async function create(req: Request, res: Response) {
  const order = await service.createOrder({
    userId: req.user!.id,
    email: req.user!.email,
    paymentMethod: req.body.paymentMethod,
    shippingAddress: req.body.shippingAddress,
  });
  res.status(201).json(order);
}

export async function listMine(req: Request, res: Response) {
  const { page, limit, status } = req.query as unknown as {
    page: number;
    limit: number;
    status?: OrderStatus;
  };
  const result = await service.listUserOrders(req.user!.id, page, limit, status);
  res.json(result);
}

export async function listAll(req: Request, res: Response) {
  const { page, limit, status } = req.query as unknown as {
    page: number;
    limit: number;
    status?: OrderStatus;
  };
  const result = await service.listAllOrders(page, limit, status);
  res.json(result);
}

export async function get(req: Request, res: Response) {
  const order = await service.getOrder(req.user!.id, req.user!.role, req.params.id as string);
  res.json(order);
}

export async function cancel(req: Request, res: Response) {
  const order = await service.cancelOrder(req.user!.id, req.params.id as string, req.body.reason);
  res.json(order);
}

export async function returnRequest(req: Request, res: Response) {
  const order = await service.requestReturn(req.user!.id, req.params.id as string, req.body.reason);
  res.json(order);
}

export async function updateStatus(req: Request, res: Response) {
  const order = await service.updateStatus(
    req.params.id as string,
    req.body.status,
    req.body.trackingNumber,
  );
  res.json(order);
}
