import { Router } from "express";
import {
  listRecommendations,
  updateRecommendationStatus
} from "./recommendation.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { mongoIdParam } from "../../shared/validators/commonValidation.js";
import {
  listRecommendationsValidation,
  updateRecommendationStatusValidation
} from "../../shared/validators/recommendationValidation.js";

export const recommendationRoutes = Router();

recommendationRoutes.use(authenticate);
recommendationRoutes.get("/", listRecommendationsValidation, validateRequest, listRecommendations);
recommendationRoutes.patch(
  "/:id/status",
  mongoIdParam("id", "Recommendation"),
  updateRecommendationStatusValidation,
  validateRequest,
  updateRecommendationStatus
);
