import multer from "multer";
import { BadRequest } from "../utils/errors.js";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(BadRequest("Only image files are allowed") as unknown as Error);
    return;
  }
  cb(null, true);
};

export const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
