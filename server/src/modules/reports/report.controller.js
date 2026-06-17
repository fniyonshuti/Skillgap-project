import { GapAnalysis } from "../gaps/gapAnalysis.model.js";
import { Recommendation } from "../recommendations/recommendation.model.js";
import { Report } from "./report.model.js";
import { assertGraduateAccess } from "../../shared/helpers/accessControl.service.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  formatGraduateReportPayload,
  graduateReportToCsv,
  graduateReportToPdf
} from "./report.service.js";

async function resolveGraduateForReport(req) {
  const graduate = await assertGraduateAccess(
    req.user,
    req.params.graduateId,
    "You cannot access this report."
  );
  return graduate.populate("userId", "name email");
}

export const generateGraduateReport = asyncHandler(async (req, res) => {
  const format = req.query.format || "json";
  const graduate = await resolveGraduateForReport(req);
  const gapAnalysis = await GapAnalysis.findOne({ graduateId: graduate._id })
    .populate("domainId")
    .populate("gapItems.competencyId", "-assessmentQuestions")
    .populate("assessmentId")
    .sort({ createdAt: -1 });
  if (!gapAnalysis) {
    throw new ApiError(404, "Complete a skills assessment before generating a report.");
  }

  const recommendations = await Recommendation.find({
    graduateId: graduate._id,
    gapAnalysisId: gapAnalysis._id
  }).populate("competencyId", "-assessmentQuestions");

  const report = formatGraduateReportPayload({
    graduate,
    user: graduate.userId,
    gapAnalysis,
    recommendations
  });

  if (format !== "json") {
    await Report.create({
      ownerId: req.user._id,
      graduateId: graduate._id,
      assessmentId: gapAnalysis.assessmentId._id,
      gapAnalysisId: gapAnalysis._id,
      reportType: "graduate",
      format,
      metadata: {
        readinessScore: report.analysis.readinessScore,
        overallCompetencyLevel: report.analysis.overallCompetencyLevel,
        recommendationCount: report.recommendations.length
      },
      generatedAt: new Date()
    });
  }

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=graduate-skills-gap-report.csv");
    return res.send(graduateReportToCsv(report));
  }

  if (format === "pdf") {
    const pdf = await graduateReportToPdf(report);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=graduate-skills-gap-report.pdf");
    return res.send(pdf);
  }

  return res.json(report);
});
