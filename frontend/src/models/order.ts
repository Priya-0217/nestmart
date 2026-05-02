import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

export const orderStatuses = ['pending', 'shipped', 'delivered'] as const;

const orderSchema = new Schema(
  {
    customer: { type: String, required: true, trim: true },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: orderStatuses, default: 'pending' }
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof orderSchema> & { _id: string };

export const OrderModel: Model<Order> = models.Order ?? model<Order>('Order', orderSchema);
