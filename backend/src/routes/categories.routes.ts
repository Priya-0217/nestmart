import { Router } from "express";
import * as controller from "../controllers/categories.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  categoryCreateSchema,
  categoryIdParamsSchema,
  categoryUpdateSchema,
} from "../validators/categories.validators.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(controller.listTree));
categoriesRouter.get(
  "/:id",
  validate({ params: categoryIdParamsSchema }),
  asyncHandler(controller.get),
);

categoriesRouter.post(
  "/",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ body: categoryCreateSchema }),
  asyncHandler(controller.create),
);
categoriesRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ params: categoryIdParamsSchema, body: categoryUpdateSchema }),
  asyncHandler(controller.update),
);
categoriesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({ params: categoryIdParamsSchema }),
  asyncHandler(controller.remove),
);
