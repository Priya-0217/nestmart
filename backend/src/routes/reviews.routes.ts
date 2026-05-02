import { Router } from "express";
import * as controller from "../controllers/reviews.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  reviewCreateSchema,
  reviewIdParamsSchema,
  reviewListQuerySchema,
  reviewModerationSchema,
} from "../validators/reviews.validators.js";

export const reviewsRouter = Router();

// Public list (approved only by default; ?status= requires admin).
reviewsRouter.get("/", validate({ query: reviewListQuerySchema }), asyncHandler(controller.list));

// Admin moderation queue + actions.
reviewsRouter.get(
  "/pending",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ query: reviewListQuerySchema }),
  asyncHandler(controller.listPending),
);
reviewsRouter.patch(
  "/:id/moderate",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ params: reviewIdParamsSchema, body: reviewModerationSchema }),
  asyncHandler(controller.moderate),
);

// Customer creates a review (must be authed; verifiedPurchase computed server-side).
reviewsRouter.post(
  "/",
  requireAuth,
  validate({ body: reviewCreateSchema }),
  asyncHandler(controller.create),
);
