import { Router } from "express";
import {
  getRecommendationRules,
  updateRecommendationRules
} from "./recommendationRule.controller.js";
import { authenticate, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/errorMiddleware.js";
import { recommendationRuleValidation } from "../../shared/validators/recommendationValidation.js";

export const recommendationRuleRoutes = Router();

recommendationRuleRoutes.use(authenticate, authorize("institution"));
recommendationRuleRoutes.get("/", getRecommendationRules);
recommendationRuleRoutes.put(
  "/",
  recommendationRuleValidation,
  validateRequest,
  updateRecommendationRules
);
