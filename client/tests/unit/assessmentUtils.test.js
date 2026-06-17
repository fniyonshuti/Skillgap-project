import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAssessmentPayload,
  formatFileSize,
  isCompetencyComplete
} from "../../src/features/assessments/assessmentUtils.js";

const competency = {
  _id: "competency-1",
  assessmentReady: true,
  assessmentQuestions: [{ _id: "question-1" }, { _id: "question-2" }]
};

test("formats evidence file sizes for display", () => {
  assert.equal(formatFileSize(500), "500 B");
  assert.equal(formatFileSize(2048), "2 KB");
  assert.equal(formatFileSize(1572864), "1.5 MB");
});

test("requires complete answers and at least one evidence source", () => {
  const answers = {
    "competency-1": {
      "question-1": "option-1",
      "question-2": "option-2"
    }
  };

  assert.equal(
    isCompetencyComplete(competency, answers, {}, {}, {}),
    false
  );
  assert.equal(
    isCompetencyComplete(
      competency,
      answers,
      { "competency-1": "Portfolio description" },
      {},
      {}
    ),
    true
  );
});

test("builds a score-free assessment submission payload", () => {
  const payload = buildAssessmentPayload({
    domainId: "domain-1",
    competencies: [competency],
    answers: {
      "competency-1": {
        "question-1": "option-1",
        "question-2": "option-2"
      }
    },
    evidence: { "competency-1": "Evidence description" },
    evidenceLinks: { "competency-1": "https://example.com/evidence" },
    evidenceFiles: {
      "competency-1": [{ id: "evidence-1", originalName: "work.pdf" }]
    },
    remarks: { "competency-1": "Needs more practice" }
  });

  assert.deepEqual(payload, {
    domainId: "domain-1",
    items: [
      {
        competencyId: "competency-1",
        responses: [
          { questionId: "question-1", optionId: "option-1" },
          { questionId: "question-2", optionId: "option-2" }
        ],
        evidence: "Evidence description",
        evidenceLink: "https://example.com/evidence",
        evidenceIds: ["evidence-1"],
        remarks: "Needs more practice"
      }
    ]
  });
  assert.equal("evidenceScores" in payload.items[0], false);
});
