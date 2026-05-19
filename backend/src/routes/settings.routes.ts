import { Router } from "express";
import * as controller from "../controllers/settings.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

export const settingsRouter = Router();

settingsRouter.get("/", asyncHandler(controller.getSettings));

settingsRouter.patch(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(controller.updateSettings)
);
