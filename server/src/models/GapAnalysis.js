import mongoose from "mongoose";

const gapItemSchema = new mongoose.Schema(
  {
    competencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competency",
      required: true
    },
    requiredLevel: {
      type: Number,
      min: 1,
      max: 4,
      required: true
    },
    achievedLevel: {
      type: Number,
      min: 1,
      max: 4,
      required: true
    },
    competencyScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    competencyStatus: {
      type: String,
      enum: ["Highly Competent", "Competent", "Partially Competent", "Not Yet Competent"],
      required: true
    },
    gapLevel: {
      type: Number,
      min: -3,
      max: 3,
      required: true
    },
    severity: {
      type: String,
      enum: ["none", "low", "moderate", "high"],
      default: "none"
    },
    classification: {
      type: String,
      trim: true
    },
    engineRecommendation: {
      type: String,
      trim: true
    },
    mappingStatus: {
      type: String,
      enum: ["mapped", "unmapped"],
      default: "mapped"
    },
    rtbReference: {
      type: String,
      trim: true
    },
    standardVersion: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ["none", "low", "medium", "high"],
      default: "none"
    }
  },
  { _id: false }
);

const gapAnalysisSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      unique: true
    },
    graduateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Graduate",
      required: true
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ICTDomain",
      required: true
    },
    overallGapScore: {
      type: Number,
      min: -3,
      max: 3,
      default: 0
    },
    readinessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    summary: {
      type: String,
      trim: true
    },
    methodology: {
      type: String,
      default: "RTB weighted evidence model: practical 40%, portfolio 30%, academic 20%, self-assessment 10%."
    },
    engineVersion: {
      type: String,
      default: "rtb-skills-gap-v1"
    },
    gapCounts: {
      none: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      moderate: { type: Number, default: 0 },
      high: { type: Number, default: 0 }
    },
    gapItems: [gapItemSchema]
  },
  { timestamps: true }
);

gapAnalysisSchema.index({ graduateId: 1, createdAt: -1 });
gapAnalysisSchema.index({ domainId: 1, overallGapScore: -1 });

export const GapAnalysis = mongoose.model("GapAnalysis", gapAnalysisSchema);
