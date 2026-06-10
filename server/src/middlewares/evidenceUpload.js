import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, extname, resolve } from "node:path";
import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
export const evidenceUploadDirectory = resolve(currentDirectory, "../../uploads/evidence");
mkdirSync(evidenceUploadDirectory, { recursive: true });

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const storage = multer.diskStorage({
  destination: evidenceUploadDirectory,
  filename: (_req, file, callback) => {
    const safeExtension = extname(file.originalname).toLowerCase().slice(0, 10);
    callback(null, `${randomUUID()}${safeExtension}`);
  }
});

const evidenceUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new ApiError(400, "Evidence must be a PDF, Word document, PNG, JPEG, or WebP file.")
      );
    }

    return callback(null, true);
  }
});

export function uploadEvidenceFile(req, res, next) {
  evidenceUpload.single("file")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "Evidence files must not exceed 5 MB."));
    }

    return next(error instanceof ApiError ? error : new ApiError(400, error.message));
  });
}
