import {
  calculateWeightedCompetencyScore,
  classifySkillsGap,
  COMPETENCY_LEVELS,
  determineGraduateCompetencyLevel,
  EVIDENCE_WEIGHTS
} from "./skillsGapAnalysisEngine.js";

export { COMPETENCY_LEVELS, EVIDENCE_WEIGHTS };

export const calculateWeightedScore = calculateWeightedCompetencyScore;

export function competencyLevelFromScore(score) {
  const result = determineGraduateCompetencyLevel(score);
  return {
    level: result.graduateLevel,
    label: result.competencyStatus
  };
}

export function calculateCompetencyResult(evidenceScores) {
  const competencyScore = calculateWeightedScore(evidenceScores);
  const level = competencyLevelFromScore(competencyScore);

  return {
    competencyScore,
    competencyLevel: level.level,
    competencyLabel: level.label
  };
}

export function classifyGap(requiredLevel, achievedLevel) {
  const result = classifySkillsGap(requiredLevel, achievedLevel);
  return {
    gapLevel: result.gapScore,
    severity: result.severity,
    priority: result.priority,
    label: result.gapClassification,
    action: result.recommendation
  };
}

export function normalizeLegacyAssessmentItem(item) {
  if (Number.isFinite(Number(item.competencyScore)) && Number(item.competencyLevel) >= 1) {
    return {
      competencyScore: Number(item.competencyScore),
      competencyLevel: Number(item.competencyLevel),
      competencyLabel:
        item.competencyLabel || competencyLevelFromScore(Number(item.competencyScore)).label
    };
  }

  const legacyScore = Math.min(5, Math.max(0, Number(item.score) || 0));
  const competencyScore = Number((legacyScore * 20).toFixed(1));
  const level = competencyLevelFromScore(competencyScore);

  return {
    competencyScore,
    competencyLevel: level.level,
    competencyLabel: level.label
  };
}
