import { Router } from "express";
import * as controller from "../controllers/coupons.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  couponCreateSchema,
  couponIdParamsSchema,
  couponUpdateSchema,
  couponValidateSchema,
} from "../validators/coupons.validators.js";

export const couponsRouter = Router();

// Public-ish: needs auth (we want per-user tracking), but any role works.
couponsRouter.post(
  "/validate",
  requireAuth,
  validate({ body: couponValidateSchema }),
  asyncHandler(controller.validateCoupon),
);

// Admin CRUD.
couponsRouter.get("/", requireAuth, requireRole("admin", "manager"), asyncHandler(controller.list));
couponsRouter.get(
  "/:id",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ params: couponIdParamsSchema }),
  asyncHandler(controller.get),
);
couponsRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate({ body: couponCreateSchema }),
  asyncHandler(controller.create),
);
couponsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({ params: couponIdParamsSchema, body: couponUpdateSchema }),
  asyncHandler(controller.update),
);
couponsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({ params: couponIdParamsSchema }),
  asyncHandler(controller.remove),
);
