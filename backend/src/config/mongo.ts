import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

mongoose.set("strictQuery", true);

export async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, { autoIndex: env.NODE_ENV !== "production" });
    logger.info({ host: mongoose.connection.host, db: mongoose.connection.name }, "mongo connected");
  } catch (err) {
    logger.error({ err }, "mongo connection failed");
    throw err;
  }
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
