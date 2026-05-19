import { Router } from "express";
import * as controller from "../controllers/admin.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import {
  bulkOrderStatusSchema,
  bulkProductUpdateSchema,
  inventoryAlertsQuerySchema,
  statsRangeSchema,
} from "../validators/admin.validators.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin", "manager"));

adminRouter.get(
  "/stats",
  validate({ query: statsRangeSchema }),
  asyncHandler(controller.dashboardStats),
);
adminRouter.get(
  "/inventory-alerts",
  validate({ query: inventoryAlertsQuerySchema }),
  asyncHandler(controller.inventoryAlerts),
);
adminRouter.post(
  "/products/bulk",
  validate({ body: bulkProductUpdateSchema }),
  asyncHandler(controller.bulkUpdateProducts),
);
adminRouter.post(
  "/orders/bulk-status",
  validate({ body: bulkOrderStatusSchema }),
  asyncHandler(controller.bulkUpdateOrderStatus),
);
adminRouter.get("/users", asyncHandler(controller.listUsers));
