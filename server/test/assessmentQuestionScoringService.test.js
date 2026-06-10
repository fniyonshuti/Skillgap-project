import test from "node:test";
import assert from "node:assert/strict";
import {
  InvalidAssessmentResponsesError,
  sanitizeQuestionBank,
  scoreCompetencyResponses
} from "../src/services/assessmentQuestionScoringService.js";

const competency = {
  title: "Web application development",
  assessmentQuestions: [
    {
      _id: "q-practical-1",
      source: "practical",
      prompt: "Practical result?",
      options: [
        { _id: "p-low", label: "Needs guidance", score: 40 },
        { _id: "p-high", label: "Independent", score: 80 }
      ]
    },
    {
      _id: "q-practical-2",
      source: "practical",
      prompt: "Testing result?",
      options: [
        { _id: "t-low", label: "Incomplete", score: 20 },
        { _id: "t-high", label: "Verified", score: 100 }
      ]
    },
    {
      _id: "q-portfolio",
      source: "portfolio",
      prompt: "Portfolio result?",
      options: [
        { _id: "o-none", label: "None", score: 0 },
        { _id: "o-complete", label: "Complete", score: 70 }
      ]
    },
    {
      _id: "q-academic",
      source: "academic",
      prompt: "Academic result?",
      options: [
        { _id: "a-pass", label: "Pass", score: 60 },
        { _id: "a-strong", label: "Strong", score: 90 }
      ]
    },
    {
      _id: "q-self",
      source: "selfAssessment",
      prompt: "Independent capability?",
      options: [
        { _id: "s-basic", label: "Basic", score: 40 },
        { _id: "s-advanced", label: "Advanced", score: 100 }
      ]
    }
  ]
};

const completeResponses = [
  { questionId: "q-practical-1", optionId: "p-high" },
  { questionId: "q-practical-2", optionId: "t-high" },
  { questionId: "q-portfolio", optionId: "o-complete" },
  { questionId: "q-academic", optionId: "a-strong" },
  { questionId: "q-self", optionId: "s-basic" }
];

test("derives source scores from private option points", () => {
  const result = scoreCompetencyResponses(competency, completeResponses);

  assert.deepEqual(result.evidenceScores, {
    practical: 90,
    portfolio: 70,
    academic: 90,
    selfAssessment: 40
  });
  assert.equal(result.responses.length, 5);
  assert.deepEqual(result.sourceScoreBreakdown[0], {
    source: "practical",
    questionCount: 2,
    score: 90
  });
});

test("does not expose scoring points in the graduate question bank", () => {
  const sanitized = sanitizeQuestionBank(competency);
  assert.equal(sanitized.assessmentReady, true);
  assert.equal("score" in sanitized.assessmentQuestions[0].options[0], false);
});

test("rejects missing, duplicate, and foreign responses", () => {
  assert.throws(
    () => scoreCompetencyResponses(competency, completeResponses.slice(1)),
    InvalidAssessmentResponsesError
  );
  assert.throws(
    () =>
      scoreCompetencyResponses(competency, [
        ...completeResponses,
        { questionId: "q-self", optionId: "s-advanced" }
      ]),
    InvalidAssessmentResponsesError
  );
  assert.throws(
    () =>
      scoreCompetencyResponses(competency, [
        ...completeResponses.slice(0, -1),
        { questionId: "q-self", optionId: "option-from-another-question" }
      ]),
    InvalidAssessmentResponsesError
  );
});
