import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { Evidence } from "../models/Evidence.js";
import { Graduate } from "../models/Graduate.js";
import { Institution } from "../models/Institution.js";
import { evidenceUploadDirectory } from "../middlewares/evidenceUpload.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function assertEvidenceAccess(user, evidence) {
  if (user.role === "admin") return;
  if (user.role === "graduate" && evidence.ownerId.toString() === user._id.toString()) return;

  if (user.role === "institution") {
    const [institution, graduate] = await Promise.all([
      Institution.findOne({ accountUserId: user._id }),
      Graduate.findById(evidence.graduateId)
    ]);

    if (institution && graduate?.institutionId?.toString() === institution._id.toString()) return;
  }

  throw new ApiError(403, "You cannot access this evidence file.");
}

export const uploadEvidence = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Select an evidence file to upload.");
  }

  const graduate = await Graduate.findOne({ userId: req.user._id });
  if (!graduate) {
    throw new ApiError(404, "Graduate profile was not found.");
  }

  let evidence;
  try {
    evidence = await Evidence.create({
      ownerId: req.user._id,
      graduateId: graduate._id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    await unlink(resolve(evidenceUploadDirectory, req.file.filename)).catch(() => {});
    throw error;
  }

  res.status(201).json({
    message: "Evidence uploaded successfully.",
    evidence: {
      id: evidence._id,
      originalName: evidence.originalName,
      mimeType: evidence.mimeType,
      size: evidence.size
    }
  });
});

export const downloadEvidence = asyncHandler(async (req, res) => {
  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) {
    throw new ApiError(404, "Evidence file was not found.");
  }

  await assertEvidenceAccess(req.user, evidence);
  return res.download(resolve(evidenceUploadDirectory, evidence.storedName), evidence.originalName);
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
  await unlink(resolve(evidenceUploadDirectory, evidence.storedName)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });

  res.json({ message: "Evidence removed successfully." });
});
