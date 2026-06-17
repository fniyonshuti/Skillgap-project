import PDFDocument from "pdfkit";

export function formatGraduateReportPayload({ graduate, user, gapAnalysis, recommendations }) {
  const assessmentItems = gapAnalysis?.assessmentId?.items || [];
  const recommendationMap = new Map(
    recommendations.map((item) => [item.competencyId?._id?.toString(), item])
  );
  const competencies = (gapAnalysis?.gapItems || []).map((gapItem) => {
    const competency = gapItem.competencyId;
    const competencyId = competency?._id?.toString() || gapItem.competencyId?.toString();
    const assessmentItem = assessmentItems.find(
      (item) => item.competencyId?.toString() === competencyId
    );
    const recommendation = recommendationMap.get(competencyId);

    return {
      competency: competency?.title || assessmentItem?.mappingSnapshot?.title || "Competency",
      rtbReference:
        gapItem.rtbReference ||
        competency?.rtbReference ||
        assessmentItem?.mappingSnapshot?.rtbReference ||
        "",
      practicalScore: assessmentItem?.evidenceScores?.practical ?? null,
      portfolioScore: assessmentItem?.evidenceScores?.portfolio ?? null,
      academicScore: assessmentItem?.evidenceScores?.academic ?? null,
      selfAssessmentScore: assessmentItem?.evidenceScores?.selfAssessment ?? null,
      weightedScore:
        gapItem.competencyScore ??
        Number(Math.min(100, Math.max(0, Number(gapItem.achievedLevel || 0) * 20)).toFixed(1)),
      achievedLevel: gapItem.achievedLevel,
      competencyStatus:
        gapItem.competencyStatus ||
        assessmentItem?.competencyLabel ||
        "",
      requiredLevel: gapItem.requiredLevel,
      gapScore: gapItem.gapLevel,
      classification: gapItem.classification,
      priority: gapItem.priority,
      evidence: assessmentItem?.evidence || "",
      evidenceLink: assessmentItem?.evidenceLink || "",
      evidenceFiles: (assessmentItem?.evidenceFiles || []).map((file) => ({
        id: file.evidenceId,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size
      })),
      recommendation:
        recommendation?.recommendationText ||
        (gapItem.priority === "none"
          ? "No improvement action is required."
          : "Institution recommendation unavailable."),
      actionItems: recommendation?.actionItems || []
    };
  });

  return {
    message: "Competency report generated successfully.",
    generatedAt: new Date().toISOString(),
    methodology:
      gapAnalysis?.methodology ||
      "RTB weighted evidence model: practical 40%, portfolio 30%, academic 20%, self-assessment 10%.",
    graduate: {
      name: user.name,
      email: user.email,
      program: graduate.program,
      graduationYear: graduate.graduationYear,
      district: graduate.district
    },
    ictCompetencyArea:
      gapAnalysis?.domainId?.name ||
      gapAnalysis?.domainId?.toString?.() ||
      "ICT competency area",
    analysis: {
      readinessScore: gapAnalysis?.readinessScore || 0,
      overallGapScore: gapAnalysis?.overallGapScore || 0,
      overallCompetencyLevel: gapAnalysis?.assessmentId?.overallCompetencyLevel || 0,
      evidenceVerificationStatus:
        gapAnalysis?.assessmentId?.evidenceVerificationStatus || "submitted",
      summary: gapAnalysis?.summary || "No assessment has been completed yet.",
      gapCounts: gapAnalysis?.gapCounts || { none: 0, low: 0, moderate: 0, high: 0 }
    },
    competencies,
    recommendations: recommendations.map((item) => ({
      competency: item.competencyId?.title || "Competency",
      priority: item.priority,
      status: item.status,
      action: item.recommendationText,
      actionItems: item.actionItems || [],
      targetLevel: item.targetLevel
    }))
  };
}

export function graduateReportToCsv(report) {
  const rows = [
    ["Graduate", report.graduate.name],
    ["Email", report.graduate.email],
    ["Program", report.graduate.program || ""],
    ["Graduation Year", report.graduate.graduationYear || ""],
    ["ICT Competency Area", report.ictCompetencyArea],
    ["Readiness Score", report.analysis.readinessScore],
    ["Overall Competency Level", report.analysis.overallCompetencyLevel],
    ["Evidence Verification", report.analysis.evidenceVerificationStatus],
    ["Overall Gap Score", report.analysis.overallGapScore],
    ["Summary", report.analysis.summary],
    ["Methodology", report.methodology],
    [],
    [
      "Competency",
      "RTB Reference",
      "Practical (40%)",
      "Portfolio (30%)",
      "Academic (20%)",
      "Self-assessment (10%)",
      "Weighted Score",
      "Achieved Level",
      "Competency Status",
      "Required Level",
      "Gap Score",
      "Classification",
      "Uploaded Evidence",
      "Recommended Action"
    ],
    ...report.competencies.map((item) => [
      item.competency,
      item.rtbReference,
      item.practicalScore ?? "",
      item.portfolioScore ?? "",
      item.academicScore ?? "",
      item.selfAssessmentScore ?? "",
      item.weightedScore,
      item.achievedLevel,
      item.competencyStatus,
      item.requiredLevel,
      item.gapScore,
      item.classification,
      item.evidenceFiles.map((file) => file.originalName).join("; "),
      item.recommendation
    ])
  ];

  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}

export function graduateReportToPdf(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("Skills Gap Analysis Report", { align: "center" });
    doc.fontSize(9).fillColor("#5b6474").text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, {
      align: "center"
    });
    doc.fillColor("#000000");
    doc.moveDown();
    doc.fontSize(12).text(`Graduate: ${report.graduate.name}`);
    doc.text(`Email: ${report.graduate.email}`);
    doc.text(`Program: ${report.graduate.program || "Not provided"}`);
    doc.text(`Graduation Year: ${report.graduate.graduationYear || "Not provided"}`);
    doc.text(`ICT Competency Area: ${report.ictCompetencyArea}`);
    doc.moveDown();
    doc.fontSize(14).text("Analysis Summary");
    doc.fontSize(12).text(`Readiness Score: ${report.analysis.readinessScore}%`);
    doc.text(`Overall Competency Level: ${report.analysis.overallCompetencyLevel}`);
    doc.text(`Evidence Verification: ${report.analysis.evidenceVerificationStatus}`);
    doc.text(`Overall Gap Score: ${report.analysis.overallGapScore}`);
    doc.text(report.analysis.summary);
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#5b6474").text(report.methodology);
    doc.fillColor("#000000");
    doc.moveDown();
    doc.fontSize(14).text("Competency Mapping and Gap Results");

    if (!report.competencies.length) {
      doc.fontSize(12).text("No competency results are available.");
    }

    report.competencies.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.competency} (${item.rtbReference || "RTB reference not provided"})`)
        .fontSize(10)
        .text(
          `Weighted score: ${item.weightedScore}% | Graduate: Level ${item.achievedLevel} (${item.competencyStatus}) | Required RTB: Level ${item.requiredLevel} | Gap: ${item.gapScore} (${item.classification})`,
          { indent: 14 }
        );

      if (item.practicalScore !== null) {
        doc.text(
          `Evidence scores: Practical ${item.practicalScore}, Portfolio ${item.portfolioScore}, Academic ${item.academicScore}, Self-assessment ${item.selfAssessmentScore}`,
          { indent: 14 }
        );
      }

      if (item.evidenceFiles.length) {
        doc.text(
          `Uploaded evidence: ${item.evidenceFiles.map((file) => file.originalName).join(", ")}`,
          { indent: 14 }
        );
      }

      doc.text(`Recommendation: ${item.recommendation}`, { indent: 14 });
      item.actionItems.forEach((action) => doc.text(`- ${action}`, { indent: 28 }));
      doc.moveDown(0.7);
    });

    doc.end();
  });
}
