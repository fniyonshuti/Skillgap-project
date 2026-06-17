import test from "node:test";
import assert from "node:assert/strict";
import {
  InvalidCompetencyDataError,
  runSkillsGapAnalysis
} from "../../src/engine/gap-scoring-engine/gapScoringEngine.js";

const completeEvidence = {
  practical: 80,
  portfolio: 70,
  academic: 75,
  selfAssessment: 90
};

test("runs the complete proposal algorithm for one RTB competency", () => {
  const result = runSkillsGapAnalysis({
    evidenceScores: completeEvidence,
    requiredRtbLevel: 4,
    competencyId: "competency-1",
    competencyArea: "Web application development",
    rtbReference: "RTB-ICT-SD-02"
  });

  assert.deepEqual(result, {
    engineVersion: "rtb-skills-gap-v1",
    competencyId: "competency-1",
    competencyArea: "Web application development",
    rtbReference: "RTB-ICT-SD-02",
    evidenceScores: completeEvidence,
    competencyScore: 77,
    graduateLevel: 3,
    competencyStatus: "Competent",
    requiredRtbLevel: 4,
    gapScore: 1,
    gapClassification: "Low Gap",
    severity: "low",
    priority: "low"
  });
});

test("implements every graduate competency level boundary", () => {
  const cases = [
    [100, 4, "Highly Competent"],
    [80, 4, "Highly Competent"],
    [79, 3, "Competent"],
    [60, 3, "Competent"],
    [59, 2, "Partially Competent"],
    [40, 2, "Partially Competent"],
    [39, 1, "Not Yet Competent"],
    [0, 1, "Not Yet Competent"]
  ];

  cases.forEach(([score, expectedLevel, expectedStatus]) => {
    const result = runSkillsGapAnalysis({
      evidenceScores: {
        practical: score,
        portfolio: score,
        academic: score,
        selfAssessment: score
      },
      requiredRtbLevel: 4
    });

    assert.equal(result.graduateLevel, expectedLevel);
    assert.equal(result.competencyStatus, expectedStatus);
  });
});

test("implements every gap classification and priority", () => {
  const cases = [
    [3, 4, -1, "No Gap", "none"],
    [4, 4, 0, "No Gap", "none"],
    [4, 3, 1, "Low Gap", "low"],
    [4, 2, 2, "Moderate Gap", "medium"],
    [4, 1, 3, "High Gap", "high"]
  ];

  cases.forEach(
    ([requiredRtbLevel, achievedLevel, gapScore, gapClassification, priority]) => {
      const evidenceScore = [0, 20, 50, 70, 90][achievedLevel];
      const result = runSkillsGapAnalysis({
        evidenceScores: {
          practical: evidenceScore,
          portfolio: evidenceScore,
          academic: evidenceScore,
          selfAssessment: evidenceScore
        },
        requiredRtbLevel
      });

      assert.equal(result.gapScore, gapScore);
      assert.equal(result.gapClassification, gapClassification);
      assert.equal(result.priority, priority);
      assert.equal(Object.hasOwn(result, "recommendation"), false);
    }
  );
});

test("stops with Invalid competency data for missing or invalid scores", () => {
  assert.throws(
    () =>
      runSkillsGapAnalysis({
        evidenceScores: {
          practical: 80,
          portfolio: 70,
          academic: 75
        },
        requiredRtbLevel: 4
      }),
    InvalidCompetencyDataError
  );

  assert.throws(
    () =>
      runSkillsGapAnalysis({
        evidenceScores: { ...completeEvidence, practical: -1 },
        requiredRtbLevel: 4
      }),
    InvalidCompetencyDataError
  );

  assert.throws(
    () =>
      runSkillsGapAnalysis({
        evidenceScores: { ...completeEvidence, practical: 101 },
        requiredRtbLevel: 4
      }),
    InvalidCompetencyDataError
  );
});
