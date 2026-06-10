import { Router } from "express";
import {
  listRecommendations,
  updateRecommendationStatus
} from "../controllers/recommendationController.js";
import { authenticate } from "../middlewares/auth.js";

export const recommendationRoutes = Router();

recommendationRoutes.use(authenticate);
recommendationRoutes.get("/", listRecommendations);
recommendationRoutes.patch("/:id/status", updateRecommendationStatus);
