import { Router } from "express";
import {
  deleteEvidence,
  downloadEvidence,
  uploadEvidence
} from "../controllers/evidenceController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { uploadEvidenceFile } from "../middlewares/evidenceUpload.js";

export const evidenceRoutes = Router();

evidenceRoutes.use(authenticate);
evidenceRoutes.post("/upload", authorize("graduate"), uploadEvidenceFile, uploadEvidence);
evidenceRoutes.get("/:id/download", downloadEvidence);
evidenceRoutes.delete("/:id", authorize("graduate"), deleteEvidence);
