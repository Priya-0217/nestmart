import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ parent: 1, order: 1 });

export type Category = InferSchemaType<typeof categorySchema> & { _id: string };
export const CategoryModel: Model<Category> = model<Category>("Category", categorySchema);
