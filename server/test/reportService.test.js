import test from "node:test";
import assert from "node:assert/strict";
import {
  formatGraduateReportPayload,
  graduateReportToCsv,
  graduateReportToPdf
} from "../src/services/reportService.js";

function reportFixture() {
  const competencyId = "665000000000000000000001";
  const assessment = {
    overallCompetencyLevel: 3,
    evidenceVerificationStatus: "submitted",
    items: [
      {
        competencyId,
        evidenceScores: {
          practical: 80,
          portfolio: 70,
          academic: 75,
          selfAssessment: 90
        },
        competencyLabel: "Competent",
        evidence: "Portfolio project",
        evidenceLink: "https://example.com/project"
      }
    ]
  };
  const competency = {
    _id: competencyId,
    title: "Web application development",
    rtbReference: "RTB-ICT-SD-02"
  };
  const gapAnalysis = {
    domainId: { name: "Software Development" },
    assessmentId: assessment,
    readinessScore: 77,
    overallGapScore: 1,
    summary: "A focused improvement is required.",
    methodology: "RTB weighted evidence model.",
    gapCounts: { none: 0, low: 1, moderate: 0, high: 0 },
    gapItems: [
      {
        competencyId: competency,
        rtbReference: competency.rtbReference,
        competencyScore: 77,
        competencyStatus: "Competent",
        achievedLevel: 3,
        requiredLevel: 4,
        gapLevel: 1,
        classification: "Low Gap",
        priority: "low"
      }
    ]
  };
  const recommendations = [
    {
      competencyId: competency,
      priority: "low",
      status: "pending",
      targetLevel: 4,
      recommendationText: "Complete one targeted practical exercise.",
      actionItems: ["Document the result in your portfolio."]
    }
  ];

  return formatGraduateReportPayload({
    graduate: {
      program: "Software Development",
      graduationYear: 2026,
      district: "Kicukiro"
    },
    user: { name: "Demo Graduate", email: "graduate@example.com" },
    gapAnalysis,
    recommendations
  });
}

test("formats a report with competency mapping and evidence details", () => {
  const report = reportFixture();

  assert.equal(report.analysis.readinessScore, 77);
  assert.equal(report.analysis.evidenceVerificationStatus, "submitted");
  assert.equal(report.ictCompetencyArea, "Software Development");
  assert.equal(report.competencies[0].weightedScore, 77);
  assert.equal(report.competencies[0].classification, "Low Gap");
  assert.equal(report.competencies[0].competencyStatus, "Competent");
  assert.equal(report.competencies[0].practicalScore, 80);
});

test("generates a competency-oriented CSV report", () => {
  const csv = graduateReportToCsv(reportFixture());

  assert.match(csv, /RTB-ICT-SD-02/);
  assert.match(csv, /Practical \(40%\)/);
  assert.match(csv, /Low Gap/);
});

test("generates a readable PDF buffer", async () => {
  const pdf = await graduateReportToPdf(reportFixture());

  assert.ok(Buffer.isBuffer(pdf));
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  assert.ok(pdf.length > 1000);
});
