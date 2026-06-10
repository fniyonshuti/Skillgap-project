import { Competency } from "../models/Competency.js";
import { GapAnalysis } from "../models/GapAnalysis.js";
import { Recommendation } from "../models/Recommendation.js";
import { buildRecommendation } from "./recommendationService.js";
import { classifyGap, normalizeLegacyAssessmentItem } from "./competencyScoringService.js";
import { SKILLS_GAP_ENGINE_VERSION } from "./skillsGapAnalysisEngine.js";

function summaryFromScores(readinessScore, highPriorityCount) {
  if (readinessScore >= 85 && highPriorityCount === 0) {
    return "Graduate is highly aligned with the selected RTB competency profile.";
  }

  if (readinessScore >= 65) {
    return "Graduate has a moderate skills gap and should focus on priority competencies.";
  }

  return "Graduate has significant gaps that require structured improvement support.";
}

export async function generateGapAnalysis(assessment, engineResults = []) {
  const competencies = await Competency.find({
    _id: { $in: assessment.items.map((item) => item.competencyId) },
    isActive: true
  });

  const competencyMap = new Map(competencies.map((competency) => [competency._id.toString(), competency]));
  const engineResultMap = new Map(
    engineResults.map((result) => [result.competencyId.toString(), result])
  );

  const gapItems = assessment.items.map((item) => {
    const competency = competencyMap.get(item.competencyId.toString());
    const requiredLevel = competency?.requiredLevel || 1;
    const engineResult = engineResultMap.get(item.competencyId.toString());
    const legacyResult = engineResult ? null : normalizeLegacyAssessmentItem(item);
    const gap = engineResult
      ? {
          gapLevel: engineResult.gapScore,
          severity: engineResult.severity,
          priority: engineResult.priority,
          label: engineResult.gapClassification,
          action: engineResult.recommendation
        }
      : classifyGap(requiredLevel, legacyResult.competencyLevel);

    return {
      competencyId: item.competencyId,
      requiredLevel,
      achievedLevel: engineResult?.graduateLevel || legacyResult.competencyLevel,
      competencyScore: engineResult?.competencyScore ?? legacyResult.competencyScore,
      competencyStatus:
        engineResult?.competencyStatus || legacyResult.competencyLabel,
      gapLevel: gap.gapLevel,
      severity: gap.severity,
      classification: gap.label,
      engineRecommendation: gap.action,
      priority: gap.priority,
      mappingStatus: competency ? "mapped" : "unmapped",
      rtbReference: competency?.rtbReference || item.mappingSnapshot?.rtbReference,
      standardVersion: competency?.version || item.mappingSnapshot?.standardVersion
    };
  });

  const totalGap = gapItems.reduce((sum, item) => sum + item.gapLevel, 0);
  const overallGapScore = Number((totalGap / gapItems.length || 0).toFixed(2));
  const readinessScore = Number(
    (
      gapItems.reduce((sum, item) => sum + item.competencyScore, 0) / gapItems.length || 0
    ).toFixed(1)
  );
  const highPriorityCount = gapItems.filter((item) => item.priority === "high").length;
  const gapCounts = gapItems.reduce(
    (counts, item) => ({ ...counts, [item.severity]: counts[item.severity] + 1 }),
    { none: 0, low: 0, moderate: 0, high: 0 }
  );

  const gapAnalysis = await GapAnalysis.create({
    assessmentId: assessment._id,
    graduateId: assessment.graduateId,
    domainId: assessment.domainId,
    overallGapScore,
    readinessScore,
    summary: summaryFromScores(readinessScore, highPriorityCount),
    engineVersion: SKILLS_GAP_ENGINE_VERSION,
    gapCounts,
    gapItems
  });

  const recommendationDocs = gapItems
    .filter((item) => item.priority !== "none")
    .map((item) => {
      const competency = competencyMap.get(item.competencyId.toString());
      const recommendation = buildRecommendation(
        competency,
        item.priority,
        item.engineRecommendation
      );

      return {
        graduateId: assessment.graduateId,
        gapAnalysisId: gapAnalysis._id,
        competencyId: item.competencyId,
        ...recommendation
      };
    });

  const recommendations = recommendationDocs.length
    ? await Recommendation.insertMany(recommendationDocs)
    : [];

  await gapAnalysis.populate("domainId");
  await gapAnalysis.populate("gapItems.competencyId", "-assessmentQuestions");

  return { gapAnalysis, recommendations };
}
