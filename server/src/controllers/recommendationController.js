import { Graduate } from "../models/Graduate.js";
import { GapAnalysis } from "../models/GapAnalysis.js";
import { Institution } from "../models/Institution.js";
import { Recommendation } from "../models/Recommendation.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function resolveGraduateFilter(req) {
  if (req.user.role === "graduate") {
    const graduate = await Graduate.findOne({ userId: req.user._id });
    if (!graduate) throw new ApiError(404, "Graduate profile was not found.");
    return { graduateId: graduate._id };
  }

  if (req.user.role === "institution") {
    const institution = await Institution.findOne({ accountUserId: req.user._id });
    if (!institution) throw new ApiError(404, "Institution profile was not found.");
    const graduateIds = await Graduate.find({ institutionId: institution._id }).distinct("_id");
    return { graduateId: { $in: graduateIds } };
  }

  return {};
}

export const listRecommendations = asyncHandler(async (req, res) => {
  const filter = await resolveGraduateFilter(req);

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

  const filter = await resolveGraduateFilter(req);
  const allowedIds = filter.graduateId?.$in?.map((id) => id.toString());
  const recommendationGraduateId = recommendation.graduateId.toString();

  if (filter.graduateId && !allowedIds && filter.graduateId.toString() !== recommendationGraduateId) {
    throw new ApiError(403, "You cannot update this recommendation.");
  }

  if (allowedIds && !allowedIds.includes(recommendationGraduateId)) {
    throw new ApiError(403, "You cannot update this recommendation.");
  }

  if (!["pending", "in_progress", "completed"].includes(req.body.status)) {
    throw new ApiError(400, "Invalid recommendation status.");
  }

  recommendation.status = req.body.status;
  await recommendation.save();
  res.json(recommendation);
});
