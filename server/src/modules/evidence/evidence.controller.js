/**
 * @fileoverview Evidence upload, download, and deletion endpoints.
 */

import { access } from "node:fs/promises";
import { Evidence } from "./evidence.model.js";
import { assertGraduateAccess, findGraduateForUser } from "../../shared/helpers/accessControl.service.js";
import {
  removeEvidenceFile,
  resolveEvidencePath,
  sanitizeOriginalFilename,
  validateEvidenceFile
} from "./evidenceFile.service.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const uploadEvidence = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Select an evidence file to upload.");
  }

  try {
    const graduate = await findGraduateForUser(req.user._id);
    if (!graduate) {
      throw new ApiError(404, "Graduate profile was not found.");
    }

    await validateEvidenceFile(req.file);
    const evidence = await Evidence.create({
      ownerId: req.user._id,
      graduateId: graduate._id,
      originalName: sanitizeOriginalFilename(req.file.originalname),
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    res.status(201).json({
      message: "Evidence uploaded successfully.",
      evidence: {
        id: evidence._id,
        originalName: evidence.originalName,
        mimeType: evidence.mimeType,
        size: evidence.size
      }
    });
  } catch (error) {
    // Multer has already written the file, so every downstream failure must
    // remove it to avoid accumulating untracked uploads.
    await removeEvidenceFile(req.file.filename);
    throw error;
  }
});

export const downloadEvidence = asyncHandler(async (req, res) => {
  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) {
    throw new ApiError(404, "Evidence file was not found.");
  }

  await assertGraduateAccess(
    req.user,
    evidence.graduateId,
    "You cannot access this evidence file."
  );

  const filePath = resolveEvidencePath(evidence.storedName);
  try {
    await access(filePath);
  } catch {
    throw new ApiError(404, "The stored evidence file is no longer available.");
  }

  res.setHeader("Cache-Control", "private, no-store");
  return res.download(filePath, evidence.originalName);
});

export const deleteEvidence = asyncHandler(async (req, res) => {
  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) {
    throw new ApiError(404, "Evidence file was not found.");
  }

  if (evidence.ownerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot delete this evidence file.");
  }
  if (evidence.assessmentIds.length > 0) {
    throw new ApiError(409, "Evidence attached to a submitted assessment cannot be deleted.");
  }

  await Evidence.deleteOne({ _id: evidence._id });
  await removeEvidenceFile(evidence.storedName);
  res.json({ message: "Evidence removed successfully." });
});
