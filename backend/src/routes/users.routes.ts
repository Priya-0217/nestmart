import { Router } from "express";
import * as controller from "../controllers/users.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import {
  addressCreateSchema,
  addressIdParamsSchema,
  addressUpdateSchema,
  passwordChangeSchema,
  profileUpdateSchema,
  wishlistAddSchema,
  wishlistRemoveParamsSchema,
} from "../validators/users.validators.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

// Profile
usersRouter.get("/me", asyncHandler(controller.getProfile));
usersRouter.patch("/me", validate({ body: profileUpdateSchema }), asyncHandler(controller.updateProfile));
usersRouter.post(
  "/me/password",
  validate({ body: passwordChangeSchema }),
  asyncHandler(controller.changePassword),
);

// Address book
usersRouter.get("/me/addresses", asyncHandler(controller.listAddresses));
usersRouter.post(
  "/me/addresses",
  validate({ body: addressCreateSchema }),
  asyncHandler(controller.createAddress),
);
usersRouter.patch(
  "/me/addresses/:id",
  validate({ params: addressIdParamsSchema, body: addressUpdateSchema }),
  asyncHandler(controller.updateAddress),
);
usersRouter.delete(
  "/me/addresses/:id",
  validate({ params: addressIdParamsSchema }),
  asyncHandler(controller.deleteAddress),
);

// Wishlist
usersRouter.get("/me/wishlist", asyncHandler(controller.getWishlist));
usersRouter.post(
  "/me/wishlist",
  validate({ body: wishlistAddSchema }),
  asyncHandler(controller.addToWishlist),
);
usersRouter.delete(
  "/me/wishlist/:productId",
  validate({ params: wishlistRemoveParamsSchema }),
  asyncHandler(controller.removeFromWishlist),
);
