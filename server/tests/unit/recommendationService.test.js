import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRecommendation,
  MissingRecommendationRuleError
} from "../../src/engine/recommendation-engine/recommendationEngine.js";

const competency = {
  title: "Web application development",
  rtbReference: "RTB-ICT-SD-02",
  requiredLevel: 4
};

const institutionRules = [
  {
    priority: "low",
    recommendationText: "Complete the institution's targeted refresher.",
    actionItems: ["Attend the refresher lab.", "Submit the revised project."],
    resourceType: "practice"
  }
];

test("builds recommendations exclusively from the institution rule", () => {
  assert.deepEqual(buildRecommendation(competency, "low", institutionRules), {
    recommendationText: "Complete the institution's targeted refresher.",
    rationale:
      "Your demonstrated level is below the RTB requirement for RTB-ICT-SD-02.",
    actionItems: ["Attend the refresher lab.", "Submit the revised project."],
    targetLevel: 4,
    resourceType: "practice",
    priority: "low"
  });
});

test("refuses to invent a recommendation when the institution rule is missing", () => {
  assert.throws(
    () => buildRecommendation(competency, "high", institutionRules),
    MissingRecommendationRuleError
  );
});
