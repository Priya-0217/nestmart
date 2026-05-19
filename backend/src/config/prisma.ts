import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export async function connectPrisma(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("postgres (prisma) connected");
  } catch (err) {
    logger.error({ err }, "postgres connection failed");
    throw err;
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
