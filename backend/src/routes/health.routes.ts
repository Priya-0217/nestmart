import { Router } from "express";
import mongoose from "mongoose";
import { prisma } from "../config/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok", service: "nestmart-api", timestamp: new Date().toISOString() });
});

healthRouter.get("/ready", async (_req, res) => {
  const checks = { mongo: false, postgres: false };
  checks.mongo = mongoose.connection.readyState === 1;
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = true;
  } catch {
    checks.postgres = false;
  }
  const ok = Object.values(checks).every(Boolean);
  res.status(ok ? 200 : 503).json({ status: ok ? "ready" : "degraded", checks });
});
