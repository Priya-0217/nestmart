import { Router } from "express";
import * as controller from "../controllers/reviews.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  reviewCreateSchema,
  reviewIdParamsSchema,
  reviewMineQuerySchema,
  reviewListQuerySchema,
  reviewModerationSchema,
  reviewUpdateSchema,
} from "../validators/reviews.validators.js";

export const reviewsRouter = Router();

// Public list (approved only by default; ?status= requires admin).
reviewsRouter.get("/", validate({ query: reviewListQuerySchema }), asyncHandler(controller.list));

// Customer's own reviews for order-history editing.
reviewsRouter.get(
  "/mine",
  requireAuth,
  validate({ query: reviewMineQuerySchema }),
  asyncHandler(controller.mine),
);

reviewsRouter.put(
  "/:id",
  requireAuth,
  validate({ params: reviewIdParamsSchema, body: reviewUpdateSchema }),
  asyncHandler(controller.update),
);

// Admin moderation queue + actions.
reviewsRouter.get(
  "/pending",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ query: reviewListQuerySchema }),
  asyncHandler(controller.listPending),
);
reviewsRouter.put(
  "/:id/moderate",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ params: reviewIdParamsSchema, body: reviewModerationSchema }),
  asyncHandler(controller.moderate),
);

// Admin delete review.
reviewsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ params: reviewIdParamsSchema }),
  asyncHandler(controller.remove),
);

// Customer creates a review (must be authed; verifiedPurchase computed server-side).
reviewsRouter.post(
  "/",
  requireAuth,
  validate({ body: reviewCreateSchema }),
  asyncHandler(controller.create),
);
