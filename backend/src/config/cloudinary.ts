import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
import { ServiceUnavailable } from "../utils/errors.js";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw ServiceUnavailable("Cloudinary is not configured on this server");
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export async function uploadImageBuffer(params: {
  buffer: Buffer;
  folder: string;
  fileName?: string;
}): Promise<{ url: string; publicId: string }> {
  ensureConfigured();

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: params.folder,
        resource_type: "image",
        public_id: params.fileName,
        overwrite: true,
      },
      (err, uploadResult) => {
        if (err || !uploadResult) {
          reject(err ?? new Error("Upload failed"));
          return;
        }
        resolve(uploadResult as { secure_url: string; public_id: string });
      },
    );
    stream.end(params.buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}
