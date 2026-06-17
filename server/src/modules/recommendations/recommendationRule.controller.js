/**
 * @fileoverview Institution-owned recommendation rule configuration.
 */

import { findInstitutionForUser } from "../../shared/helpers/accessControl.service.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

async function getInstitution(userId) {
  const institution = await findInstitutionForUser(userId);
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
