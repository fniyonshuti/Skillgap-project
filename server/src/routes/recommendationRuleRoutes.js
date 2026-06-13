import { Router } from "express";
import {
  getRecommendationRules,
  recommendationRuleValidation,
  updateRecommendationRules
} from "../controllers/recommendationRuleController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/errorHandler.js";

export const recommendationRuleRoutes = Router();

recommendationRuleRoutes.use(authenticate, authorize("institution"));
recommendationRuleRoutes.get("/", getRecommendationRules);
recommendationRuleRoutes.put(
  "/",
  recommendationRuleValidation,
  validateRequest,
  updateRecommendationRules
);
