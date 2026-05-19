import { Router } from "express";
import * as controller from "../controllers/products.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  productCreateSchema,
  productIdParamsSchema,
  productListQuerySchema,
  productUpdateSchema,
} from "../validators/products.validators.js";

export const productsRouter = Router();

productsRouter.get("/", validate({ query: productListQuerySchema }), asyncHandler(controller.list));
productsRouter.get(
  "/:id",
  validate({ params: productIdParamsSchema }),
  asyncHandler(controller.get),
);
productsRouter.get(
  "/:id/related",
  validate({ params: productIdParamsSchema }),
  asyncHandler(controller.related),
);

// Admin-only mutations.
productsRouter.post(
  "/",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ body: productCreateSchema }),
  asyncHandler(controller.create),
);
productsRouter.put(
  "/:id",
  requireAuth,
  requireRole("admin", "manager"),
  validate({ params: productIdParamsSchema, body: productUpdateSchema }),
  asyncHandler(controller.update),
);
productsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({ params: productIdParamsSchema }),
  asyncHandler(controller.remove),
);
