import { Assessment } from "../models/Assessment.js";
import {
  assertAssessmentAccess
} from "../services/assessmentAccessService.js";
import {
  findGraduateForUser,
  getInstitutionGraduateIds
} from "../services/accessControlService.js";
import { submitAssessment } from "../services/assessmentSubmissionService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { trustedIn } from "../utils/mongoQuery.js";

export const listAssessments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "graduate") {
    const graduate = await findGraduateForUser(req.user._id);
    if (!graduate) throw new ApiError(404, "Graduate profile was not found.");
    filter.graduateId = graduate._id;
  }

  if (req.user.role === "institution") {
    const { graduateIds } = await getInstitutionGraduateIds(req.user._id);
    filter.graduateId = trustedIn(graduateIds);
  }

  if (req.query.graduateId && req.user.role === "admin") {
    filter.graduateId = req.query.graduateId;
  }

  if (req.query.domainId) {
    filter.domainId = req.query.domainId;
  }

  const assessments = await Assessment.find(filter)
    .populate("graduateId")
    .populate("domainId")
    .populate("items.competencyId", "-assessmentQuestions")
    .sort({ createdAt: -1 });

  res.json(assessments);
});

export const createAssessment = asyncHandler(async (req, res) => {
  const result = await submitAssessment({
    user: req.user,
    payload: req.body
  });

  res.status(201).json(result);
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
