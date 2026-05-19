import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { BadRequest } from "../utils/errors.js";

export async function getSettings(req: Request, res: Response) {
  const settings = await prisma.setting.findMany();
  const result = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
  res.json(result);
}

export async function updateSettings(req: Request, res: Response) {
  const updates = req.body as Record<string, string>;
  
  if (typeof updates !== "object" || updates === null) {
    throw BadRequest("Invalid settings data");
  }

  const transactions = Object.entries(updates).map(([key, value]) => {
    return prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  });

  await prisma.$transaction(transactions);
  
  res.json({ ok: true });
}
