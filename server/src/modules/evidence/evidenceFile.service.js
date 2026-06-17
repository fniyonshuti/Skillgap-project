/**
 * @fileoverview Secure filesystem operations for graduate evidence uploads.
 *
 * File metadata supplied by browsers is not trusted. This service keeps all
 * paths inside the evidence directory and verifies common file signatures
 * before an upload is made available for download.
 */

import { open, readFile, unlink } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { evidenceUploadDirectory } from "../../config/storage.js";
import { ApiError } from "../../shared/utils/apiError.js";

const FILE_SIGNATURES = {
  "application/pdf": [Buffer.from("%PDF-")],
  "application/msword": [Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    Buffer.from([0x50, 0x4b, 0x07, 0x08])
  ],
  "image/jpeg": [Buffer.from([0xff, 0xd8, 0xff])],
  "image/png": [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])]
};

function startsWith(buffer, signature) {
  return buffer.length >= signature.length && buffer.subarray(0, signature.length).equals(signature);
}

/**
 * Checks whether the initial bytes are consistent with the declared MIME type.
 * WebP is special because its identifying marker begins at byte eight.
 */
export function matchesFileSignature(mimeType, buffer) {
  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return (FILE_SIGNATURES[mimeType] || []).some((signature) => startsWith(buffer, signature));
}

/**
 * Distinguishes a Word Open XML package from an arbitrary ZIP archive.
 */
export function isWordOpenXmlDocument(buffer) {
  return (
    buffer.includes(Buffer.from("[Content_Types].xml")) &&
    buffer.includes(Buffer.from("word/"))
  );
}

/**
 * Removes path fragments and control characters from a client filename.
 */
export function sanitizeOriginalFilename(filename) {
  const cleanName = basename(filename)
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 255);
  return cleanName || "evidence-file";
}

/**
 * Resolves a generated stored name without allowing directory traversal.
 */
export function resolveEvidencePath(storedName) {
  if (!storedName || basename(storedName) !== storedName) {
    throw new ApiError(500, "Evidence storage metadata is invalid.");
  }
  return resolve(evidenceUploadDirectory, storedName);
}

export async function validateEvidenceFile(file) {
  const filePath = resolveEvidencePath(file.filename);
  const fileHandle = await open(filePath, "r");
  try {
    const header = Buffer.alloc(12);
    const { bytesRead } = await fileHandle.read(header, 0, header.length, 0);
    if (!matchesFileSignature(file.mimetype, header.subarray(0, bytesRead))) {
      throw new ApiError(
        400,
        "The uploaded file contents do not match the selected file type."
      );
    }
  } finally {
    await fileHandle.close();
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const archive = await readFile(filePath);
    if (!isWordOpenXmlDocument(archive)) {
      throw new ApiError(400, "The uploaded file is not a valid Word document.");
    }
  }
}

export async function removeEvidenceFile(storedName) {
  await unlink(resolveEvidencePath(storedName)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}
