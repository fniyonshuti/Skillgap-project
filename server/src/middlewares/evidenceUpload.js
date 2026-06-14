import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { extname } from "node:path";
import multer from "multer";
import { evidenceUploadDirectory } from "../config/storage.js";
import { ApiError } from "../utils/apiError.js";

mkdirSync(evidenceUploadDirectory, { recursive: true });

const allowedExtensionsByMimeType = new Map([
  ["application/pdf", new Set([".pdf"])],
  ["application/msword", new Set([".doc"])],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    new Set([".docx"])
  ],
  ["image/jpeg", new Set([".jpg", ".jpeg"])],
  ["image/png", new Set([".png"])],
  ["image/webp", new Set([".webp"])]
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
    const extension = extname(file.originalname).toLowerCase();
    const allowedExtensions = allowedExtensionsByMimeType.get(file.mimetype);
    if (!allowedExtensions?.has(extension)) {
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
