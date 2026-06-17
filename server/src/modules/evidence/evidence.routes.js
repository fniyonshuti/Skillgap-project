import { Router } from "express";
import {
  deleteEvidence,
  downloadEvidence,
  uploadEvidence
} from "./evidence.controller.js";
import { authenticate, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { uploadEvidenceFile } from "../../middleware/evidenceUploadMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";

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
