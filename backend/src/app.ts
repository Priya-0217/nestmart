import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { generalRateLimiter } from "./middleware/rate-limit.js";
import { apiRouter } from "./routes/index.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

// Raw body capture for webhook signature verification (ONLY for webhooks path)
app.use("/api/webhooks", express.raw({ type: "application/json", limit: "1mb" }), (req, res, next) => {
  (req as any).rawBody = req.body;
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", generalRateLimiter, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
