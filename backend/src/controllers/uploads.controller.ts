import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { BadRequest } from "../utils/errors.js";
import { uploadImageBuffer } from "../config/cloudinary.js";

export async function uploadProductImage(req: Request, res: Response) {
  if (!req.file?.buffer) {
    throw BadRequest("Image file is required");
  }

  const fileName = `${Date.now()}-${randomUUID()}`;
  const result = await uploadImageBuffer({
    buffer: req.file.buffer,
    folder: "nestmart/products",
    fileName,
  });

  res.status(201).json({
    url: result.url,
    publicId: result.publicId,
  });
}
