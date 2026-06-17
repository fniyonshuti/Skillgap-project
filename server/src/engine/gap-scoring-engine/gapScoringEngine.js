export const SKILLS_GAP_ENGINE_VERSION = "rtb-skills-gap-v1";

export const EVIDENCE_WEIGHTS = Object.freeze({
  practical: 0.4,
  portfolio: 0.3,
  academic: 0.2,
  selfAssessment: 0.1
});

export const COMPETENCY_LEVELS = Object.freeze([
  { min: 80, level: 4, status: "Highly Competent" },
  { min: 60, level: 3, status: "Competent" },
  { min: 40, level: 2, status: "Partially Competent" },
  { min: 0, level: 1, status: "Not Yet Competent" }
]);

export class InvalidCompetencyDataError extends RangeError {
  constructor() {
    super("Invalid competency data");
    this.name = "InvalidCompetencyDataError";
  }
}

function validateScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new InvalidCompetencyDataError();
  }
  return score;
}

function validateRequiredLevel(value) {
  const level = Number(value);
  if (!Number.isInteger(level) || level < 1 || level > 4) {
    throw new InvalidCompetencyDataError();
  }
  return level;
}

export function validateCompetencyData(evidenceScores) {
  return Object.fromEntries(
    Object.keys(EVIDENCE_WEIGHTS).map((source) => [
      source,
      validateScore(evidenceScores?.[source])
    ])
  );
}

/**
 * Applies the official evidence-source weights and returns a score from 0-100.
 */
export function calculateWeightedCompetencyScore(evidenceScores) {
  const validatedScores = validateCompetencyData(evidenceScores);
  const score = Object.entries(EVIDENCE_WEIGHTS).reduce(
    (total, [source, weight]) => total + validatedScores[source] * weight,
    0
  );

  return Number(score.toFixed(1));
}

/**
 * Maps a validated percentage score to the implemented RTB competency level.
 */
export function determineGraduateCompetencyLevel(competencyScore) {
  const score = validateScore(competencyScore);
  const result = COMPETENCY_LEVELS.find((level) => score >= level.min);

  return {
    graduateLevel: result.level,
    competencyStatus: result.status
  };
}

/**
 * Compares required and achieved levels. Negative gaps are retained to show
 * that the graduate exceeds the requirement.
 */
export function classifySkillsGap(requiredRtbLevel, graduateLevel) {
  const requiredLevel = validateRequiredLevel(requiredRtbLevel);
  const achievedLevel = validateRequiredLevel(graduateLevel);
  const gapScore = requiredLevel - achievedLevel;

  if (gapScore <= 0) {
    return {
      gapScore,
      gapClassification: "No Gap",
      severity: "none",
      priority: "none"
    };
  }

  if (gapScore === 1) {
    return {
      gapScore,
      gapClassification: "Low Gap",
      severity: "low",
      priority: "low"
    };
  }

  if (gapScore === 2) {
    return {
      gapScore,
      gapClassification: "Moderate Gap",
      severity: "moderate",
      priority: "medium"
    };
  }

  return {
    gapScore,
    gapClassification: "High Gap",
    severity: "high",
    priority: "high"
  };
}

/**
 * Produces the immutable result consumed by gap analysis and reporting.
 */
export function runSkillsGapAnalysis({
  evidenceScores,
  requiredRtbLevel,
  competencyId,
  competencyArea,
  rtbReference
}) {
  const competencyScore = calculateWeightedCompetencyScore(evidenceScores);
  const levelResult = determineGraduateCompetencyLevel(competencyScore);
  const gapResult = classifySkillsGap(requiredRtbLevel, levelResult.graduateLevel);

  return Object.freeze({
    engineVersion: SKILLS_GAP_ENGINE_VERSION,
    competencyId,
    competencyArea,
    rtbReference,
    evidenceScores: Object.freeze(validateCompetencyData(evidenceScores)),
    competencyScore,
    graduateLevel: levelResult.graduateLevel,
    competencyStatus: levelResult.competencyStatus,
    requiredRtbLevel: Number(requiredRtbLevel),
    gapScore: gapResult.gapScore,
    gapClassification: gapResult.gapClassification,
    severity: gapResult.severity,
    priority: gapResult.priority
  });
}
