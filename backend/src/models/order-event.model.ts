import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const orderEventSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    status: { type: String, required: true },
    message: { type: String },
    actor: { type: String, required: true }, // "user", "admin", "system", "webhook"
    actorId: { type: String }, // User.id if applicable
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type OrderEvent = InferSchemaType<typeof orderEventSchema> & { _id: string };
export const OrderEventModel: Model<OrderEvent> = model<OrderEvent>("OrderEvent", orderEventSchema);
