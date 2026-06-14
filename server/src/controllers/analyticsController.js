import { Assessment } from "../models/Assessment.js";
import { Competency } from "../models/Competency.js";
import { GapAnalysis } from "../models/GapAnalysis.js";
import { Graduate } from "../models/Graduate.js";
import { Institution } from "../models/Institution.js";
import { User } from "../models/User.js";
import {
  findGraduateForUser,
  getInstitutionGraduateIds
} from "../services/accessControlService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { trustedIn } from "../utils/mongoQuery.js";

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  if (req.user.role === "graduate") {
    const graduate = await findGraduateForUser(req.user._id);
    if (!graduate) throw new ApiError(404, "Graduate profile was not found.");

    const [assessmentCount, latestGap] = await Promise.all([
      Assessment.countDocuments({ graduateId: graduate._id }),
      GapAnalysis.findOne({ graduateId: graduate._id }).sort({ createdAt: -1 })
    ]);

    return res.json({
      role: "graduate",
      assessmentCount,
      readinessScore: latestGap?.readinessScore || 0,
      overallGapScore: latestGap?.overallGapScore || 0
    });
  }

  if (req.user.role === "institution") {
    const { graduateIds } = await getInstitutionGraduateIds(req.user._id);

    const [graduateCount, assessmentCount, gapStats] = await Promise.all([
      graduateIds.length,
      Assessment.countDocuments({ graduateId: trustedIn(graduateIds) }),
      GapAnalysis.aggregate([
        { $match: { graduateId: { $in: graduateIds } } },
        { $group: { _id: null, avgReadiness: { $avg: "$readinessScore" }, avgGap: { $avg: "$overallGapScore" } } }
      ])
    ]);

    return res.json({
      role: "institution",
      graduateCount,
      assessmentCount,
      avgReadiness: Number((gapStats[0]?.avgReadiness || 0).toFixed(1)),
      avgGap: Number((gapStats[0]?.avgGap || 0).toFixed(2))
    });
  }

  const [userCount, graduateCount, institutionCount, competencyCount, assessmentCount] =
    await Promise.all([
      User.countDocuments(),
      Graduate.countDocuments(),
      Institution.countDocuments(),
      Competency.countDocuments({ isActive: true }),
      Assessment.countDocuments()
    ]);

  return res.json({
    role: "admin",
    userCount,
    graduateCount,
    institutionCount,
    competencyCount,
    assessmentCount
  });
});
