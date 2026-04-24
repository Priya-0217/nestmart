import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { productsRouter } from "./products.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { cartRouter } from "./cart.routes.js";
import { ordersRouter } from "./orders.routes.js";
import { usersRouter } from "./users.routes.js";
import { reviewsRouter } from "./reviews.routes.js";
import { couponsRouter } from "./coupons.routes.js";
import { adminRouter } from "./admin.routes.js";
import { paymentsRouter } from "./payments.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/coupons", couponsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/payments", paymentsRouter);
