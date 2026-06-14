/**
 * @fileoverview Recommendation query and progress-management endpoints.
 */

import { GapAnalysis } from "../models/GapAnalysis.js";
import { Recommendation } from "../models/Recommendation.js";
import {
  assertGraduateAccess,
  findGraduateForUser,
  getInstitutionGraduateIds
} from "../services/accessControlService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { trustedIn } from "../utils/mongoQuery.js";

async function resolveGraduateFilter(req) {
  if (req.user.role === "graduate") {
    const graduate = await findGraduateForUser(req.user._id);
    if (!graduate) throw new ApiError(404, "Graduate profile was not found.");
    return { graduateId: graduate._id };
  }

  if (req.user.role === "institution") {
    const { graduateIds } = await getInstitutionGraduateIds(req.user._id);
    return { graduateId: trustedIn(graduateIds) };
  }

  return {};
}

export const listRecommendations = asyncHandler(async (req, res) => {
  const filter = await resolveGraduateFilter(req);

  // Graduates see the current plan only, while institutions and administrators
  // can inspect historical recommendations for the graduates they manage.
  if (req.user.role === "graduate") {
    const latestGap = await GapAnalysis.findOne(filter).sort({ createdAt: -1 }).select("_id");
    filter.gapAnalysisId = latestGap?._id || null;
  }

  if (req.query.graduateId && req.user.role === "admin") {
    filter.graduateId = req.query.graduateId;
  }
  if (req.query.status) filter.status = req.query.status;

  const recommendations = await Recommendation.find(filter)
    .populate("competencyId", "-assessmentQuestions")
    .populate("gapAnalysisId")
    .populate({
      path: "graduateId",
      populate: { path: "userId", select: "name email" }
    })
    .sort({ priority: -1, createdAt: -1 });

  res.json(recommendations);
});

export const updateRecommendationStatus = asyncHandler(async (req, res) => {
  const recommendation = await Recommendation.findById(req.params.id);
  if (!recommendation) {
    throw new ApiError(404, "Recommendation was not found.");
  }

  await assertGraduateAccess(
    req.user,
    recommendation.graduateId,
    "You cannot update this recommendation."
  );

  recommendation.status = req.body.status;
  await recommendation.save();
  res.json(recommendation);
});
