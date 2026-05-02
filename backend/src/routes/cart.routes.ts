import { Router } from "express";
import * as controller from "../controllers/cart.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import {
  cartAddSchema,
  cartCouponSchema,
  cartRemoveSchema,
  cartUpdateSchema,
} from "../validators/cart.validators.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", asyncHandler(controller.get));
cartRouter.post("/items", validate({ body: cartAddSchema }), asyncHandler(controller.addItem));
cartRouter.patch("/items", validate({ body: cartUpdateSchema }), asyncHandler(controller.updateItem));
cartRouter.delete("/items", validate({ body: cartRemoveSchema }), asyncHandler(controller.removeItem));
cartRouter.post("/coupon", validate({ body: cartCouponSchema }), asyncHandler(controller.applyCoupon));
cartRouter.delete("/coupon", asyncHandler(controller.removeCoupon));
