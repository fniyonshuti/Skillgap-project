import { body } from "express-validator";
import { Institution } from "../models/Institution.js";
import { RECOMMENDATION_PRIORITIES } from "../services/recommendationService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const resourceTypes = ["course", "practice", "certification", "mentorship"];

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
    .withMessage("Each rule requires recommendation text."),
  body("rules.*.actionItems")
    .isArray({ min: 1 })
    .withMessage("Each rule requires at least one action item."),
  body("rules.*.actionItems.*")
    .trim()
    .notEmpty()
    .withMessage("Action items cannot be empty."),
  body("rules.*.resourceType")
    .isIn(resourceTypes)
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

async function getInstitution(userId) {
  const institution = await Institution.findOne({ accountUserId: userId });
  if (!institution) {
    throw new ApiError(404, "Institution profile was not found.");
  }
  return institution;
}

export const getRecommendationRules = asyncHandler(async (req, res) => {
  const institution = await getInstitution(req.user._id);
  res.json({
    institution: {
      id: institution._id,
      name: institution.name
    },
    rules: institution.recommendationRules,
    updatedAt: institution.recommendationRulesUpdatedAt
  });
});

export const updateRecommendationRules = asyncHandler(async (req, res) => {
  const institution = await getInstitution(req.user._id);
  institution.recommendationRules = req.body.rules.map((rule) => ({
    priority: rule.priority,
    recommendationText: rule.recommendationText,
    actionItems: rule.actionItems,
    resourceType: rule.resourceType
  }));
  institution.recommendationRulesUpdatedAt = new Date();
  await institution.save();

  res.json({
    message: "Recommendation rules updated successfully.",
    institution: {
      id: institution._id,
      name: institution.name
    },
    rules: institution.recommendationRules,
    updatedAt: institution.recommendationRulesUpdatedAt
  });
});
