import { body } from "express-validator";
import { Assessment } from "../models/Assessment.js";
import { Competency } from "../models/Competency.js";
import { Evidence } from "../models/Evidence.js";
import { GapAnalysis } from "../models/GapAnalysis.js";
import { Graduate } from "../models/Graduate.js";
import { Institution } from "../models/Institution.js";
import { Notification } from "../models/Notification.js";
import { Recommendation } from "../models/Recommendation.js";
import { Report } from "../models/Report.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateGapAnalysis } from "../services/gapAnalysisService.js";
import {
  determineGraduateCompetencyLevel,
  InvalidCompetencyDataError,
  runSkillsGapAnalysis
} from "../services/skillsGapAnalysisEngine.js";
import { formatGraduateReportPayload } from "../services/reportService.js";
import {
  InvalidAssessmentResponsesError,
  scoreCompetencyResponses
} from "../services/assessmentQuestionScoringService.js";

export const assessmentValidation = [
  body("domainId").isMongoId().withMessage("A valid ICT domain is required."),
  body("items").isArray({ min: 1 }).withMessage("At least one assessment item is required."),
  body("items.*.competencyId").isMongoId().withMessage("Each item must contain a valid competency."),
  body("items.*.evidenceScores")
    .not()
    .exists()
    .withMessage("Scores are calculated by the system and cannot be submitted by graduates."),
  body("items.*.responses")
    .isArray({ min: 1 })
    .withMessage("Answer every assessment question before submitting."),
  body("items.*.responses.*.questionId")
    .isMongoId()
    .withMessage("Each response must contain a valid question."),
  body("items.*.responses.*.optionId")
    .isMongoId()
    .withMessage("Each response must contain a valid answer option."),
  body("items.*.evidenceLink")
    .optional({ checkFalsy: true })
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Evidence links must be complete URLs beginning with http:// or https://."),
  body("items.*.evidenceIds")
    .optional()
    .isArray({ max: 5 })
    .withMessage("A maximum of five evidence files is allowed per competency."),
  body("items.*.evidenceIds.*")
    .optional()
    .isMongoId()
    .withMessage("Each uploaded evidence reference must be valid."),
  body("items.*").custom((item) => {
    if (!item.evidence?.trim() && !item.evidenceLink?.trim() && !item.evidenceIds?.length) {
      throw new Error(
        "Each competency requires an evidence description, evidence link, or uploaded file."
      );
    }
    return true;
  })
];

async function currentInstitution(userId) {
  return Institution.findOne({ accountUserId: userId });
}

async function assertAssessmentAccess(user, assessment) {
  if (user.role === "admin") return;

  const graduate = await Graduate.findById(assessment.graduateId);
  if (!graduate) {
    throw new ApiError(404, "Graduate was not found.");
  }

  if (user.role === "graduate" && graduate.userId.toString() === user._id.toString()) return;

  if (user.role === "institution") {
    const institution = await currentInstitution(user._id);
    if (institution && graduate.institutionId?.toString() === institution._id.toString()) return;
  }

  throw new ApiError(403, "You cannot access this assessment.");
}

export const listAssessments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "graduate") {
    const graduate = await Graduate.findOne({ userId: req.user._id });
    if (!graduate) throw new ApiError(404, "Graduate profile was not found.");
    filter.graduateId = graduate._id;
  }

  if (req.user.role === "institution") {
    const institution = await currentInstitution(req.user._id);
    if (!institution) throw new ApiError(404, "Institution profile was not found.");
    const graduateIds = await Graduate.find({ institutionId: institution._id }).distinct("_id");
    filter.graduateId = { $in: graduateIds };
  }

  if (req.query.graduateId && req.user.role === "admin") {
    filter.graduateId = req.query.graduateId;
  }

  if (req.query.domainId) filter.domainId = req.query.domainId;

  const assessments = await Assessment.find(filter)
    .populate("graduateId")
    .populate("domainId")
    .populate("items.competencyId", "-assessmentQuestions")
    .sort({ createdAt: -1 });

  res.json(assessments);
});

export const createAssessment = asyncHandler(async (req, res) => {
  const graduate = await Graduate.findOne({ userId: req.user._id });
  if (!graduate) {
    throw new ApiError(404, "Graduate profile was not found.");
  }

  const competencyIds = req.body.items.map((item) => item.competencyId);
  const competencies = await Competency.find({
    domainId: req.body.domainId,
    isActive: true,
    $or: [{ standardStatus: "active" }, { standardStatus: { $exists: false } }]
  });
  const submittedCompetencyIds = new Set(competencyIds);
  const activeCompetencyIds = new Set(competencies.map((item) => item._id.toString()));

  if (
    submittedCompetencyIds.size !== competencyIds.length ||
    submittedCompetencyIds.size !== activeCompetencyIds.size ||
    [...submittedCompetencyIds].some((id) => !activeCompetencyIds.has(id))
  ) {
    throw new ApiError(
      400,
      "The assessment must include every active RTB competency in the selected ICT domain exactly once."
    );
  }

  const submittedEvidenceIds = [
    ...new Set(req.body.items.flatMap((item) => item.evidenceIds || []).map(String))
  ];
  const evidenceDocuments = submittedEvidenceIds.length
    ? await Evidence.find({
        _id: { $in: submittedEvidenceIds },
        ownerId: req.user._id,
        graduateId: graduate._id
      })
    : [];

  if (evidenceDocuments.length !== submittedEvidenceIds.length) {
    throw new ApiError(400, "One or more uploaded evidence files are invalid or inaccessible.");
  }

  const competencyMap = new Map(
    competencies.map((competency) => [competency._id.toString(), competency])
  );
  const evidenceMap = new Map(
    evidenceDocuments.map((document) => [document._id.toString(), document])
  );
  let storedItems;
  try {
    storedItems = req.body.items.map((item) => {
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
  } catch (error) {
    if (error instanceof InvalidAssessmentResponsesError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }

  const assessment = await Assessment.create({
    graduateId: graduate._id,
    domainId: req.body.domainId,
    assessedBy: req.user._id,
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
      user: req.user,
      gapAnalysis: {
        ...gapAnalysis.toObject(),
        assessmentId: assessment.toObject()
      },
      recommendations: populatedRecommendations
    });
    assessment.workflowLog.push({ stage: "Generate Report", status: "completed" });

    reportRecord = await Report.create({
      ownerId: req.user._id,
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

    if (submittedEvidenceIds.length) {
      await Evidence.updateMany(
        { _id: { $in: submittedEvidenceIds } },
        { $addToSet: { assessmentIds: assessment._id } }
      );
    }

    assessment.status = "submitted";
    assessment.processingStatus = "completed";
    assessment.workflowLog.push({ stage: "Save Results", status: "completed" });
    await assessment.save();
  } catch (error) {
    const generatedGap = await GapAnalysis.findOne({ assessmentId: assessment._id }).select("_id");
    const cleanupOperations = [
      Report.deleteMany({ assessmentId: assessment._id }),
      GapAnalysis.deleteOne({ assessmentId: assessment._id }),
      Assessment.deleteOne({ _id: assessment._id }),
      Evidence.updateMany(
        { _id: { $in: submittedEvidenceIds } },
        { $pull: { assessmentIds: assessment._id } }
      )
    ];
    if (generatedGap) {
      cleanupOperations.push(Recommendation.deleteMany({ gapAnalysisId: generatedGap._id }));
    }
    await Promise.allSettled(cleanupOperations);
    if (error instanceof InvalidCompetencyDataError) {
      throw new ApiError(400, "Invalid competency data");
    }
    if (error instanceof InvalidAssessmentResponsesError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }

  await Notification.create({
    userId: req.user._id,
    title: "Assessment submitted",
    message: "Your skills gap analysis report is ready.",
    type: "assessment"
  }).catch(() => null);

  res.status(201).json({
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
  });
});

export const getAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id)
    .populate("graduateId")
    .populate("domainId")
    .populate("items.competencyId", "-assessmentQuestions")
    .populate("reviewedBy", "name email");

  if (!assessment) {
    throw new ApiError(404, "Assessment was not found.");
  }

  await assertAssessmentAccess(req.user, assessment);
  res.json(assessment);
});

export const reviewAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) {
    throw new ApiError(404, "Assessment was not found.");
  }

  await assertAssessmentAccess(req.user, assessment);

  assessment.status = "reviewed";
  assessment.evidenceVerificationStatus = "verified";
  assessment.reviewedBy = req.user._id;
  assessment.reviewedAt = new Date();
  await assessment.save();

  res.json(assessment);
});
