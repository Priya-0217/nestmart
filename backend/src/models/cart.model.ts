import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    image: { type: String },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    // Postgres User.id. Stored as string because Prisma uses cuid.
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    couponCode: { type: String, default: null },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true },
);

export type Cart = InferSchemaType<typeof cartSchema> & { _id: string };
export const CartModel: Model<Cart> = model<Cart>("Cart", cartSchema);
