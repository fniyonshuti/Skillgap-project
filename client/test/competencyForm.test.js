import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyCompetencyForm,
  createQuestionBank,
  isQuestionBankReady,
  QUESTION_SOURCES
} from "../src/features/competencies/competencyForm.js";

test("creates one starter question for every scoring source", () => {
  const questionBank = createQuestionBank("Database administration");

  assert.equal(questionBank.length, Object.keys(QUESTION_SOURCES).length);
  assert.deepEqual(
    questionBank.map((question) => question.source),
    Object.keys(QUESTION_SOURCES)
  );
  assert.equal(isQuestionBankReady(questionBank), true);
});

test("creates predictable empty form defaults", () => {
  const form = createEmptyCompetencyForm("domain-1", new Date("2026-06-14T00:00:00.000Z"));

  assert.equal(form.domainId, "domain-1");
  assert.equal(form.requiredLevel, 3);
  assert.equal(form.effectiveDate, "2026-06-14");
  assert.equal(isQuestionBankReady(form.assessmentQuestions), true);
});

test("detects a question bank with a missing source", () => {
  const questionBank = createQuestionBank("Networking").filter(
    (question) => question.source !== "portfolio"
  );

  assert.equal(isQuestionBankReady(questionBank), false);
});
