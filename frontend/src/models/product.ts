import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export type Product = InferSchemaType<typeof productSchema> & { _id: string };

export const ProductModel: Model<Product> = models.Product ?? model<Product>('Product', productSchema);
