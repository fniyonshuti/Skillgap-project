/**
 * @fileoverview Validation contracts for recommendation rules and status.
 */

import { body, query } from "express-validator";
import { RECOMMENDATION_PRIORITIES } from "../services/recommendationService.js";
import { optionalMongoIdQuery } from "./commonValidation.js";

const RESOURCE_TYPES = ["course", "practice", "certification", "mentorship"];
const RECOMMENDATION_STATUSES = ["pending", "in_progress", "completed"];

export const recommendationRuleValidation = [
  body("rules")
    .isArray({ min: 3, max: 3 })
    .withMessage("Define exactly one low, medium, and high recommendation rule."),
  body("rules.*.priority")
    .isIn(RECOMMENDATION_PRIORITIES)
    .withMessage("Rule priority must be low, medium, or high."),
  body("rules.*.recommendationText")
    .trim()
    .notEmpty()
    .withMessage("Each rule requires recommendation text.")
    .isLength({ max: 2_000 })
    .withMessage("Recommendation text must not exceed 2000 characters."),
  body("rules.*.actionItems")
    .isArray({ min: 1, max: 20 })
    .withMessage("Each rule requires between 1 and 20 action items."),
  body("rules.*.actionItems.*")
    .trim()
    .notEmpty()
    .withMessage("Action items cannot be empty.")
    .isLength({ max: 500 })
    .withMessage("Action items must not exceed 500 characters."),
  body("rules.*.resourceType")
    .isIn(RESOURCE_TYPES)
    .withMessage("Each rule requires a valid resource type."),
  body("rules").custom((rules) => {
    const priorities = new Set(rules.map((rule) => rule.priority));
    if (
      priorities.size !== RECOMMENDATION_PRIORITIES.length ||
      RECOMMENDATION_PRIORITIES.some((priority) => !priorities.has(priority))
    ) {
      throw new Error("Define exactly one low, medium, and high recommendation rule.");
    }
    return true;
  })
];

export const listRecommendationsValidation = [
  optionalMongoIdQuery("graduateId", "Graduate"),
  query("status")
    .optional({ checkFalsy: true })
    .isIn(RECOMMENDATION_STATUSES)
    .withMessage("Invalid recommendation status.")
];

export const updateRecommendationStatusValidation = [
  body("status")
    .isIn(RECOMMENDATION_STATUSES)
    .withMessage("Invalid recommendation status.")
];
