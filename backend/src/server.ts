import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectMongo, disconnectMongo } from "./config/mongo.js";
import { connectPrisma, disconnectPrisma } from "./config/prisma.js";

async function start() {
  await connectMongo();
  await connectPrisma();

  const server = app.listen(env.PORT, () => {
    logger.info(`NestMart API listening on http://localhost:${env.PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${env.PORT} is already in use. Please kill the process or use a different port.`);
      process.exit(1);
    } else {
      logger.error({ err }, "server error");
    }
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "shutting down");
    server.close();
    await Promise.allSettled([disconnectMongo(), disconnectPrisma()]);
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((err) => {
  logger.error({ err }, "failed to start server");
  process.exit(1);
});
