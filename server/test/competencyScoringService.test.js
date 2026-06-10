import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCompetencyResult,
  calculateWeightedScore,
  classifyGap,
  competencyLevelFromScore
} from "../src/services/competencyScoringService.js";

test("calculates the proposal worked example correctly", () => {
  const evidenceScores = {
    practical: 80,
    portfolio: 70,
    academic: 75,
    selfAssessment: 90
  };

  assert.equal(calculateWeightedScore(evidenceScores), 77);
  assert.deepEqual(calculateCompetencyResult(evidenceScores), {
    competencyScore: 77,
    competencyLevel: 3,
    competencyLabel: "Competent"
  });
  assert.deepEqual(classifyGap(4, 3), {
    gapLevel: 1,
    severity: "low",
    priority: "low",
    label: "Low Gap",
    action: "Minor competency improvement needed"
  });
});

test("maps percentage boundaries to the documented competency levels", () => {
  assert.equal(competencyLevelFromScore(0).level, 1);
  assert.equal(competencyLevelFromScore(39).level, 1);
  assert.equal(competencyLevelFromScore(40).level, 2);
  assert.equal(competencyLevelFromScore(59).level, 2);
  assert.equal(competencyLevelFromScore(60).level, 3);
  assert.equal(competencyLevelFromScore(79).level, 3);
  assert.equal(competencyLevelFromScore(80).level, 4);
  assert.equal(competencyLevelFromScore(100).level, 4);
});

test("classifies no, moderate, and high gaps", () => {
  assert.equal(classifyGap(4, 4).severity, "none");
  assert.equal(classifyGap(3, 4).gapLevel, -1);
  assert.equal(classifyGap(3, 4).label, "No Gap");
  assert.equal(classifyGap(4, 2).severity, "moderate");
  assert.equal(classifyGap(4, 1).severity, "high");
});

test("rejects missing and out-of-range evidence scores", () => {
  assert.throws(
    () =>
      calculateWeightedScore({
        practical: 101,
        portfolio: 70,
        academic: 75,
        selfAssessment: 90
      }),
    RangeError
  );
  assert.throws(
    () =>
      calculateWeightedScore({
        practical: 80,
        portfolio: 70,
        academic: 75
      }),
    RangeError
  );
});
