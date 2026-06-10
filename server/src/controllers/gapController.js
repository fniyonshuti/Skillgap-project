import { GapAnalysis } from "../models/GapAnalysis.js";
import { Graduate } from "../models/Graduate.js";
import { Institution } from "../models/Institution.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function assertGraduateAccess(user, graduateId) {
  const graduate = await Graduate.findById(graduateId);
  if (!graduate) throw new ApiError(404, "Graduate was not found.");

  if (user.role === "admin") return graduate;
  if (user.role === "graduate" && graduate.userId.toString() === user._id.toString()) return graduate;

  if (user.role === "institution") {
    const institution = await Institution.findOne({ accountUserId: user._id });
    if (institution && graduate.institutionId?.toString() === institution._id.toString()) return graduate;
  }

  throw new ApiError(403, "You cannot access this gap analysis.");
}

export const getLatestGapAnalysis = asyncHandler(async (req, res) => {
  const graduateId = req.params.graduateId;
  await assertGraduateAccess(req.user, graduateId);

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

  await assertGraduateAccess(req.user, gapAnalysis.graduateId);
  res.json(gapAnalysis);
});
