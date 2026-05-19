import { Router, type RequestHandler } from "express";
import * as controller from "../controllers/uploads.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { imageUpload } from "../middleware/upload.js";

export const uploadsRouter = Router();

uploadsRouter.use(requireAuth, requireRole("admin", "manager"));

const uploadSingleImage = imageUpload.single("image") as unknown as RequestHandler;

uploadsRouter.post(
  "/products/image",
  uploadSingleImage,
  asyncHandler(controller.uploadProductImage),
);
