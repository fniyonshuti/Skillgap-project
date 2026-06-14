/**
 * @fileoverview Read-only gap-analysis endpoints with graduate ownership checks.
 */

import { GapAnalysis } from "../models/GapAnalysis.js";
import { assertGraduateAccess } from "../services/accessControlService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getLatestGapAnalysis = asyncHandler(async (req, res) => {
  const graduateId = req.params.graduateId;
  await assertGraduateAccess(req.user, graduateId, "You cannot access this gap analysis.");

  const gapAnalysis = await GapAnalysis.findOne({ graduateId })
    .populate("domainId")
    .populate("gapItems.competencyId", "-assessmentQuestions")
    .sort({ createdAt: -1 });

  if (!gapAnalysis) {
    throw new ApiError(404, "No gap analysis found for this graduate.");
  }

  res.json(gapAnalysis);
});

export const getGapAnalysisByAssessment = asyncHandler(async (req, res) => {
  const gapAnalysis = await GapAnalysis.findOne({ assessmentId: req.params.assessmentId })
    .populate("domainId")
    .populate("gapItems.competencyId", "-assessmentQuestions");

  if (!gapAnalysis) {
    throw new ApiError(404, "Gap analysis was not found.");
  }

  await assertGraduateAccess(
    req.user,
    gapAnalysis.graduateId,
    "You cannot access this gap analysis."
  );
  res.json(gapAnalysis);
});
