export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function hasCompetencyEvidence(
  competencyId,
  evidence,
  evidenceLinks,
  evidenceFiles
) {
  return Boolean(
    evidence[competencyId]?.trim() ||
      evidenceLinks[competencyId]?.trim() ||
      evidenceFiles[competencyId]?.length
  );
}

export function isAnswerSetComplete(competency, answers) {
  return (
    competency.assessmentReady &&
    competency.assessmentQuestions.length > 0 &&
    competency.assessmentQuestions.every(
      (question) => Boolean(answers[competency._id]?.[question._id])
    )
  );
}

export function isCompetencyComplete(
  competency,
  answers,
  evidence,
  evidenceLinks,
  evidenceFiles
) {
  return (
    isAnswerSetComplete(competency, answers) &&
    hasCompetencyEvidence(competency._id, evidence, evidenceLinks, evidenceFiles)
  );
}

/**
 * Converts client worksheet state into the server-authoritative submission
 * contract. Numeric scores are intentionally absent from this payload.
 */
export function buildAssessmentPayload({
  domainId,
  competencies,
  answers,
  evidence,
  evidenceLinks,
  evidenceFiles,
  remarks
}) {
  return {
    domainId,
    items: competencies.map((competency) => ({
      competencyId: competency._id,
      responses: competency.assessmentQuestions.map((question) => ({
        questionId: question._id,
        optionId: answers[competency._id][question._id]
      })),
      evidence: evidence[competency._id] || "",
      evidenceLink: evidenceLinks[competency._id] || "",
      evidenceIds: (evidenceFiles[competency._id] || []).map((file) => file.id),
      remarks: remarks[competency._id] || ""
    }))
  };
}
