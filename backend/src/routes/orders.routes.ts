import { Router } from "express";
import * as controller from "../controllers/orders.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  orderCancelSchema,
  orderCreateSchema,
  orderIdParamsSchema,
  orderReturnSchema,
  orderStatusUpdateSchema,
  ordersListQuerySchema,
} from "../validators/orders.validators.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

// Admin listing — must come before the authed `/` route below via explicit path.
ordersRouter.get(
  "/admin",
  requireRole("admin", "manager"),
  validate({ query: ordersListQuerySchema }),
  asyncHandler(controller.listAll),
);

ordersRouter.get("/", validate({ query: ordersListQuerySchema }), asyncHandler(controller.listMine));
ordersRouter.post("/", validate({ body: orderCreateSchema }), asyncHandler(controller.create));

ordersRouter.get(
  "/:id",
  validate({ params: orderIdParamsSchema }),
  asyncHandler(controller.get),
);

ordersRouter.post(
  "/:id/cancel",
  validate({ params: orderIdParamsSchema, body: orderCancelSchema }),
  asyncHandler(controller.cancel),
);

ordersRouter.post(
  "/:id/return",
  validate({ params: orderIdParamsSchema, body: orderReturnSchema }),
  asyncHandler(controller.returnRequest),
);

// Admin-only status update.
ordersRouter.patch(
  "/:id/status",
  requireRole("admin", "manager"),
  validate({ params: orderIdParamsSchema, body: orderStatusUpdateSchema }),
  asyncHandler(controller.updateStatus),
);
