import { Router } from "express";
import * as controller from "../controllers/payments.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { paymentOrderIdSchema } from "../validators/payments.validators.js";

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

paymentsRouter.post(
  "/stripe/create-intent",
  validate({ body: paymentOrderIdSchema }),
  asyncHandler(controller.createStripeIntent),
);

paymentsRouter.post(
  "/razorpay/create-order",
  validate({ body: paymentOrderIdSchema }),
  asyncHandler(controller.createRazorpayOrder),
);