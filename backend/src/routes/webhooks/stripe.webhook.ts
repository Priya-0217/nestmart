import { Router } from "express";
// Raw-body parser for signature verification is applied here, not app-wide.
export const stripeWebhookRouter = Router();
