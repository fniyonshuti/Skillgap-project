export const RECOMMENDATION_PRIORITIES = Object.freeze(["low", "medium", "high"]);

export class MissingRecommendationRuleError extends Error {
  constructor(priority) {
    super(`Recommendation rule is not configured for ${priority} priority.`);
    this.name = "MissingRecommendationRuleError";
    this.priority = priority;
  }
}

export function buildRecommendation(competency, priority, institutionRules = []) {
  const rule = institutionRules.find((item) => item.priority === priority);
  if (!rule) {
    throw new MissingRecommendationRuleError(priority);
  }

  return {
    recommendationText: rule.recommendationText,
    rationale: `Your demonstrated level is below the RTB requirement for ${competency.rtbReference || competency.title}.`,
    actionItems: [...rule.actionItems],
    targetLevel: competency.requiredLevel,
    resourceType: rule.resourceType,
    priority
  };
}
