import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export type AdminUser = InferSchemaType<typeof adminUserSchema> & { _id: string };

export const AdminUserModel: Model<AdminUser> = models.AdminUser ?? model<AdminUser>('AdminUser', adminUserSchema);
