export const QUESTION_SOURCES = Object.freeze({
  practical: { label: "Practical assessment", weight: 40 },
  portfolio: { label: "Portfolio evidence", weight: 30 },
  academic: { label: "Academic record", weight: 20 },
  selfAssessment: { label: "Self-assessment", weight: 10 }
});

const STARTER_OPTIONS = Object.freeze({
  practical: [
    ["No demonstrated practical task", 0],
    ["Basic task completed with continuous guidance", 40],
    ["Standard task completed independently", 70],
    ["Complex task completed independently and verified", 100]
  ],
  portfolio: [
    ["No portfolio artifact", 0],
    ["Incomplete or unverified artifact", 40],
    ["Complete artifact demonstrating the outcome", 70],
    ["Multiple verified artifacts with feedback", 100]
  ],
  academic: [
    ["No relevant academic record", 0],
    ["Result below the pass requirement", 30],
    ["Passed relevant module with supporting record", 60],
    ["Strong verified result in the relevant module", 90]
  ],
  selfAssessment: [
    ["Cannot yet explain or perform the competency", 0],
    ["Understands concepts but needs guidance", 40],
    ["Performs routine tasks independently", 70],
    ["Solves complex tasks and can guide others", 100]
  ]
});

export const COMPETENCY_LEVEL_LABELS = Object.freeze({
  1: "Not Yet Competent",
  2: "Partially Competent",
  3: "Competent",
  4: "Highly Competent"
});

export function createAssessmentQuestion(source, order, title = "this competency") {
  return {
    source,
    prompt: `Which statement best describes your verified ${QUESTION_SOURCES[
      source
    ].label.toLowerCase()} for "${title || "this competency"}"?`,
    order,
    isActive: true,
    options: STARTER_OPTIONS[source].map(([label, score]) => ({ label, score }))
  };
}

export function createQuestionBank(title) {
  return Object.keys(QUESTION_SOURCES).map((source, index) =>
    createAssessmentQuestion(source, index, title)
  );
}

export function createEmptyCompetencyForm(domainId = "", date = new Date()) {
  return {
    domainId,
    title: "",
    category: "programming",
    requiredLevel: 3,
    rtbReference: "",
    version: "1.0",
    effectiveDate: date.toISOString().slice(0, 10),
    standardStatus: "active",
    description: "",
    evidenceExamplesText: "",
    assessmentQuestions: createQuestionBank("")
  };
}

export function isQuestionBankReady(assessmentQuestions = []) {
  const activeSources = new Set(
    assessmentQuestions
      .filter((question) => question.isActive !== false)
      .map((question) => question.source)
  );

  return Object.keys(QUESTION_SOURCES).every((source) => activeSources.has(source));
}
