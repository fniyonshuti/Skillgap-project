const rubricOptions = {
  practical: [
    ["I have not completed a practical task for this competency.", 0],
    ["I completed a basic task with continuous guidance.", 40],
    ["I completed a standard task independently and can demonstrate the result.", 70],
    ["I completed and verified a complex task independently.", 100]
  ],
  portfolio: [
    ["I do not yet have a portfolio artifact for this competency.", 0],
    ["I have an incomplete or unverified artifact.", 40],
    ["I have a complete artifact that demonstrates the required outcome.", 70],
    ["I have multiple complete artifacts with verification or user feedback.", 100]
  ],
  academic: [
    ["I do not have an academic record covering this competency.", 0],
    ["My relevant module result is below the pass requirement.", 30],
    ["I passed the relevant module and can provide the record.", 60],
    ["I achieved a strong result and can provide the verified record.", 90]
  ],
  selfAssessment: [
    ["I cannot yet explain or perform this competency.", 0],
    ["I understand the main concepts but need guidance to perform tasks.", 40],
    ["I can perform routine tasks independently.", 70],
    ["I can solve complex tasks and explain the work to others.", 100]
  ]
};

const prompts = {
  practical: (title) =>
    `Which statement best describes your demonstrated practical performance in "${title}"?`,
  portfolio: (title) =>
    `Which statement best describes the portfolio evidence you can provide for "${title}"?`,
  academic: (title) =>
    `Which statement matches your verified academic record for "${title}"?`,
  selfAssessment: (title) =>
    `Which statement best describes what you can independently do in "${title}"?`
};

export function buildDefaultQuestionBank(title) {
  return Object.keys(rubricOptions).map((source, order) => ({
    source,
    prompt: prompts[source](title),
    order,
    isActive: true,
    options: rubricOptions[source].map(([label, score]) => ({ label, score }))
  }));
}
