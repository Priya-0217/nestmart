import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    brand: { type: String, default: "NestMart", index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    tags: { type: [String], default: [], index: true },
    images: { type: [String], default: [] },
    features: { type: [String], default: [] },

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: "INR" },

    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, unique: true, sparse: true },

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },

    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },

    variants: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        color: { type: String },
        colorHex: { type: String },
        size: { type: String },
        sku: { type: String },
        stock: { type: Number, default: 0 },
        price: { type: Number, required: true },
      },
    ],

    attributes: { type: Schema.Types.Mixed, default: {} }, // free-form { color, size, ... }
  },
  { timestamps: true },
);

productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ price: 1 });
productSchema.index({ ratingAverage: -1 });
productSchema.index({ createdAt: -1 });

export type Product = InferSchemaType<typeof productSchema> & { _id: string };
export const ProductModel: Model<Product> = model<Product>("Product", productSchema);
