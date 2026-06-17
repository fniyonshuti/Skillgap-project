import { Assessment } from "../assessments/assessment.model.js";
import { Competency } from "../competencies/competency.model.js";
import { GapAnalysis } from "../gaps/gapAnalysis.model.js";
import { Graduate } from "../graduates/graduate.model.js";
import { Institution } from "../institutions/institution.model.js";
import { User } from "../users/user.model.js";
import {
  findGraduateForUser,
  getInstitutionGraduateIds
} from "../../shared/helpers/accessControl.service.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { trustedIn } from "../../shared/utils/mongoQuery.js";

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
