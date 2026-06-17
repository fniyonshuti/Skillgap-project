import { Assessment } from "./assessment.model.js";
import { Competency } from "../competencies/competency.model.js";
import { Evidence } from "../evidence/evidence.model.js";
import { GapAnalysis } from "../gaps/gapAnalysis.model.js";
import { Graduate } from "../graduates/graduate.model.js";
import { Notification } from "../notifications/notification.model.js";
import { Recommendation } from "../recommendations/recommendation.model.js";
import { Report } from "../reports/report.model.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { trustedExists, trustedIn } from "../../shared/utils/mongoQuery.js";
import {
  InvalidAssessmentResponsesError,
  scoreCompetencyResponses
} from "../../engine/competency-engine/assessmentQuestionScoringEngine.js";
import { generateGapAnalysis } from "../gaps/gapAnalysis.service.js";
import { formatGraduateReportPayload } from "../reports/report.service.js";
import {
  determineGraduateCompetencyLevel,
  InvalidCompetencyDataError,
  runSkillsGapAnalysis
} from "../../engine/gap-scoring-engine/gapScoringEngine.js";

function validateSubmittedCompetencies(payload, competencies) {
  const competencyIds = payload.items.map((item) => item.competencyId);
  const submittedIds = new Set(competencyIds);
  const activeIds = new Set(competencies.map((item) => item._id.toString()));

  const hasDuplicateOrMissingCompetencies =
    submittedIds.size !== competencyIds.length ||
    submittedIds.size !== activeIds.size ||
    [...submittedIds].some((id) => !activeIds.has(id));

  if (hasDuplicateOrMissingCompetencies) {
    throw new ApiError(
      400,
      "The assessment must include every active RTB competency in the selected ICT domain exactly once."
    );
  }
}

async function loadSubmittedEvidence(payload, user, graduate) {
  const evidenceIds = [
    ...new Set(payload.items.flatMap((item) => item.evidenceIds || []).map(String))
  ];
  const documents = evidenceIds.length
    ? await Evidence.find({
        _id: trustedIn(evidenceIds),
        ownerId: user._id,
        graduateId: graduate._id
      })
    : [];

  if (documents.length !== evidenceIds.length) {
    throw new ApiError(400, "One or more uploaded evidence files are invalid or inaccessible.");
  }

  return { evidenceIds, documents };
}

function buildStoredItems(payload, competencies, evidenceDocuments) {
  const competencyMap = new Map(
    competencies.map((competency) => [competency._id.toString(), competency])
  );
  const evidenceMap = new Map(
    evidenceDocuments.map((document) => [document._id.toString(), document])
  );

  try {
    const items = payload.items.map((item) => {
      const competency = competencyMap.get(item.competencyId);
      const scoredResponses = scoreCompetencyResponses(competency, item.responses);

      return {
        competencyId: item.competencyId,
        evidenceScores: scoredResponses.evidenceScores,
        responses: scoredResponses.responses,
        sourceScoreBreakdown: scoredResponses.sourceScoreBreakdown,
        evidence: item.evidence || "",
        evidenceLink: item.evidenceLink || "",
        evidenceFiles: (item.evidenceIds || []).map((evidenceId) => {
          const document = evidenceMap.get(String(evidenceId));
          return {
            evidenceId: document._id,
            originalName: document.originalName,
            mimeType: document.mimeType,
            size: document.size
          };
        }),
        remarks: item.remarks || "",
        mappingSnapshot: {
          rtbReference: competency.rtbReference,
          title: competency.title,
          requiredLevel: competency.requiredLevel,
          standardVersion: competency.version
        }
      };
    });

    return { items, competencyMap };
  } catch (error) {
    if (error instanceof InvalidAssessmentResponsesError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
}

async function rollbackAssessment(assessmentId, evidenceIds) {
  const generatedGap = await GapAnalysis.findOne({ assessmentId }).select("_id");
  const cleanupOperations = [
    Report.deleteMany({ assessmentId }),
    GapAnalysis.deleteOne({ assessmentId }),
    Assessment.deleteOne({ _id: assessmentId }),
    Evidence.updateMany(
      { _id: trustedIn(evidenceIds) },
      { $pull: { assessmentIds: assessmentId } }
    )
  ];

  if (generatedGap) {
    cleanupOperations.push(Recommendation.deleteMany({ gapAnalysisId: generatedGap._id }));
  }

  await Promise.allSettled(cleanupOperations);
}

/**
 * Runs the complete, server-authoritative assessment transaction.
 *
 * The service validates competency coverage and evidence ownership, resolves
 * private answer scores, runs the skills-gap engine, and persists all derived
 * records. Any processing error removes partial records before it is rethrown.
 */
export async function submitAssessment({ user, payload }) {
  const graduate = await Graduate.findOne({ userId: user._id });
  if (!graduate) {
    throw new ApiError(404, "Graduate profile was not found.");
  }

  const competencies = await Competency.find({
    domainId: payload.domainId,
    isActive: true,
    $or: [{ standardStatus: "active" }, { standardStatus: trustedExists(false) }]
  });
  validateSubmittedCompetencies(payload, competencies);

  const { evidenceIds, documents: evidenceDocuments } = await loadSubmittedEvidence(
    payload,
    user,
    graduate
  );
  const { items: storedItems, competencyMap } = buildStoredItems(
    payload,
    competencies,
    evidenceDocuments
  );

  const assessment = await Assessment.create({
    graduateId: graduate._id,
    domainId: payload.domainId,
    assessedBy: user._id,
    assessmentType: "self",
    status: "processing",
    processingStatus: "storing_data",
    items: storedItems,
    scoringMethod: "rtb_system_question_bank_v1",
    workflowLog: [
      { stage: "Validate Data", status: "completed" },
      { stage: "Store Data", status: "completed" }
    ]
  });

  let gapAnalysis;
  let recommendations;
  let reportRecord;
  let reportSnapshot;

  try {
    const engineResults = storedItems.map((item) => {
      const competency = competencyMap.get(item.competencyId.toString());
      return runSkillsGapAnalysis({
        evidenceScores: item.evidenceScores,
        requiredRtbLevel: competency.requiredLevel,
        competencyId: item.competencyId,
        competencyArea: competency.title,
        rtbReference: competency.rtbReference
      });
    });
    const engineResultMap = new Map(
      engineResults.map((result) => [result.competencyId.toString(), result])
    );
    const calculatedItems = storedItems.map((item) => {
      const result = engineResultMap.get(item.competencyId.toString());
      return {
        ...item,
        competencyScore: result.competencyScore,
        competencyLevel: result.graduateLevel,
        competencyLabel: result.competencyStatus,
        score: result.graduateLevel
      };
    });
    const overallCompetencyScore = Number(
      (
        calculatedItems.reduce((sum, item) => sum + item.competencyScore, 0) /
        calculatedItems.length
      ).toFixed(1)
    );
    const overallLevel =
      determineGraduateCompetencyLevel(overallCompetencyScore).graduateLevel;

    assessment.items = calculatedItems;
    assessment.totalScore = overallLevel;
    assessment.overallCompetencyScore = overallCompetencyScore;
    assessment.overallCompetencyLevel = overallLevel;
    assessment.processingStatus = "determining_level";
    assessment.workflowLog.push(
      { stage: "Calculate Score", status: "completed" },
      { stage: "Determine Level", status: "completed" }
    );
    await assessment.save();

    ({ gapAnalysis, recommendations } = await generateGapAnalysis(assessment, engineResults));
    assessment.processingStatus = "generating_report";
    assessment.workflowLog.push(
      { stage: "Retrieve RTB Standards", status: "completed" },
      { stage: "Calculate Gap Score", status: "completed" },
      { stage: "Classify Gap", status: "completed" },
      { stage: "Generate Recommendations", status: "completed" }
    );

    const populatedRecommendations = await Recommendation.populate(recommendations, {
      path: "competencyId",
      select: "-assessmentQuestions"
    });
    reportSnapshot = formatGraduateReportPayload({
      graduate,
      user,
      gapAnalysis: {
        ...gapAnalysis.toObject(),
        assessmentId: assessment.toObject()
      },
      recommendations: populatedRecommendations
    });
    assessment.workflowLog.push({ stage: "Generate Report", status: "completed" });

    reportRecord = await Report.create({
      ownerId: user._id,
      graduateId: graduate._id,
      assessmentId: assessment._id,
      gapAnalysisId: gapAnalysis._id,
      reportType: "graduate",
      format: "json",
      metadata: {
        readinessScore: reportSnapshot.analysis.readinessScore,
        overallCompetencyLevel: reportSnapshot.analysis.overallCompetencyLevel,
        recommendationCount: reportSnapshot.recommendations.length
      },
      snapshot: reportSnapshot
    });

    if (evidenceIds.length) {
      await Evidence.updateMany(
        { _id: trustedIn(evidenceIds) },
        { $addToSet: { assessmentIds: assessment._id } }
      );
    }

    assessment.status = "submitted";
    assessment.processingStatus = "completed";
    assessment.workflowLog.push({ stage: "Save Results", status: "completed" });
    await assessment.save();
  } catch (error) {
    await rollbackAssessment(assessment._id, evidenceIds);

    if (error instanceof InvalidCompetencyDataError) {
      throw new ApiError(400, "Invalid competency data");
    }
    if (error instanceof InvalidAssessmentResponsesError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }

  await Notification.create({
    userId: user._id,
    title: "Assessment submitted",
    message: "Your skills gap analysis report is ready.",
    type: "assessment"
  }).catch(() => null);

  return {
    message: "Assessment completed and competency report generated successfully.",
    workflow: {
      validateData: "Data validated successfully.",
      storeData: "Assessment data stored successfully.",
      calculateScore: "Competency scores calculated successfully.",
      determineLevel: "Competency levels determined successfully.",
      standards: "RTB competency standards retrieved successfully.",
      gapScore: "Gap score generated successfully.",
      classification: "Competency gaps classified successfully.",
      recommendations: "Recommendations generated.",
      report: "Competency report generated successfully.",
      saveResults: "Assessment results saved successfully."
    },
    assessment,
    gapAnalysis,
    recommendations,
    report: {
      id: reportRecord._id,
      ...reportSnapshot
    }
  };
}
