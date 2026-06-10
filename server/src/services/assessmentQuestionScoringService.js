import { EVIDENCE_WEIGHTS } from "./skillsGapAnalysisEngine.js";

export const ASSESSMENT_SOURCES = Object.freeze(Object.keys(EVIDENCE_WEIGHTS));

export class InvalidAssessmentResponsesError extends Error {
  constructor(message = "Invalid assessment responses") {
    super(message);
    this.name = "InvalidAssessmentResponsesError";
  }
}

function idOf(value) {
  return String(value?._id || value || "");
}

export function isQuestionBankReady(competency) {
  const activeQuestions = (competency?.assessmentQuestions || []).filter(
    (question) => question.isActive !== false
  );

  return (
    activeQuestions.length >= ASSESSMENT_SOURCES.length &&
    ASSESSMENT_SOURCES.every((source) =>
      activeQuestions.some(
        (question) =>
          question.source === source &&
          question.prompt?.trim() &&
          Array.isArray(question.options) &&
          question.options.length >= 2
      )
    )
  );
}

export function sanitizeQuestionBank(competency) {
  const plain = competency.toObject ? competency.toObject() : competency;

  return {
    ...plain,
    assessmentReady: isQuestionBankReady(plain),
    assessmentQuestions: (plain.assessmentQuestions || [])
      .filter((question) => question.isActive !== false)
      .sort((left, right) => (left.order || 0) - (right.order || 0))
      .map((question) => ({
        _id: question._id,
        source: question.source,
        prompt: question.prompt,
        order: question.order || 0,
        options: (question.options || []).map((option) => ({
          _id: option._id,
          label: option.label
        }))
      }))
  };
}

export function scoreCompetencyResponses(competency, responses) {
  if (!isQuestionBankReady(competency)) {
    throw new InvalidAssessmentResponsesError(
      `The question bank for "${competency?.title || "this competency"}" is incomplete.`
    );
  }

  if (!Array.isArray(responses)) {
    throw new InvalidAssessmentResponsesError();
  }

  const questions = competency.assessmentQuestions.filter(
    (question) => question.isActive !== false
  );
  const questionMap = new Map(questions.map((question) => [idOf(question), question]));
  const responseMap = new Map();

  for (const response of responses) {
    const questionId = idOf(response.questionId);
    if (!questionMap.has(questionId) || responseMap.has(questionId)) {
      throw new InvalidAssessmentResponsesError();
    }
    responseMap.set(questionId, response);
  }

  if (responseMap.size !== questions.length) {
    throw new InvalidAssessmentResponsesError(
      "Every assessment question must be answered exactly once."
    );
  }

  const pointsBySource = Object.fromEntries(
    ASSESSMENT_SOURCES.map((source) => [source, []])
  );
  const storedResponses = [];

  for (const question of questions) {
    const response = responseMap.get(idOf(question));
    const option = question.options.find(
      (candidate) => idOf(candidate) === idOf(response.optionId)
    );

    if (!option) {
      throw new InvalidAssessmentResponsesError();
    }

    const score = Number(option.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new InvalidAssessmentResponsesError();
    }

    pointsBySource[question.source].push(score);
    storedResponses.push({
      questionId: question._id,
      optionId: option._id,
      source: question.source,
      promptSnapshot: question.prompt,
      selectedLabelSnapshot: option.label
    });
  }

  const evidenceScores = {};
  const sourceScoreBreakdown = ASSESSMENT_SOURCES.map((source) => {
    const scores = pointsBySource[source];
    if (!scores.length) {
      throw new InvalidAssessmentResponsesError();
    }

    const score = Number(
      (scores.reduce((total, value) => total + value, 0) / scores.length).toFixed(1)
    );
    evidenceScores[source] = score;
    return { source, questionCount: scores.length, score };
  });

  return {
    evidenceScores,
    responses: storedResponses,
    sourceScoreBreakdown
  };
}
