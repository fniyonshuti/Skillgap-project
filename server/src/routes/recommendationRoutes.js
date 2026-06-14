import { Router } from "express";
import {
  listRecommendations,
  updateRecommendationStatus
} from "../controllers/recommendationController.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";
import { mongoIdParam } from "../validators/commonValidation.js";
import {
  listRecommendationsValidation,
  updateRecommendationStatusValidation
} from "../validators/recommendationValidation.js";

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
