import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { generalRateLimiter } from "./middleware/rate-limit.js";
import { apiRouter } from "./routes/index.js";
import { stripeWebhookRouter } from "./routes/webhooks/stripe.webhook.js";
import { razorpayWebhookRouter } from "./routes/webhooks/razorpay.webhook.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(pinoHttp({ logger }));

// Webhook routes MUST receive raw bodies for signature verification.
// Mount them BEFORE express.json().
app.use("/api/webhooks/stripe", stripeWebhookRouter);
app.use("/api/webhooks/razorpay", razorpayWebhookRouter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", generalRateLimiter, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
