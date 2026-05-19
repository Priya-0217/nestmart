import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true }, // Postgres User.id
    productIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
  },
  { timestamps: true },
);

export type Wishlist = InferSchemaType<typeof wishlistSchema> & { _id: string };
export const WishlistModel: Model<Wishlist> = model<Wishlist>("Wishlist", wishlistSchema);
