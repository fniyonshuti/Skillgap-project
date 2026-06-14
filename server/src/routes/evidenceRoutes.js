import { Router } from "express";
import {
  deleteEvidence,
  downloadEvidence,
  uploadEvidence
} from "../controllers/evidenceController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { uploadEvidenceFile } from "../middlewares/evidenceUpload.js";
import { mongoIdParam } from "../validators/commonValidation.js";

export const evidenceRoutes = Router();

evidenceRoutes.use(authenticate);
evidenceRoutes.post("/upload", authorize("graduate"), uploadEvidenceFile, uploadEvidence);
evidenceRoutes.get(
  "/:id/download",
  mongoIdParam("id", "Evidence"),
  validateRequest,
  downloadEvidence
);
evidenceRoutes.delete(
  "/:id",
  authorize("graduate"),
  mongoIdParam("id", "Evidence"),
  validateRequest,
  deleteEvidence
);
