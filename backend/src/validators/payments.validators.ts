import { Types } from "mongoose";
import { z } from "zod";

const objectId = z.string().refine((value) => Types.ObjectId.isValid(value), { message: "Invalid ObjectId" });

export const paymentOrderIdSchema = z.object({
  orderId: objectId,
});
