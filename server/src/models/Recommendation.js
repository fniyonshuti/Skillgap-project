import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    graduateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Graduate",
      required: true
    },
    gapAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GapAnalysis",
      required: true
    },
    competencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competency",
      required: true
    },
    recommendationText: {
      type: String,
      required: true,
      trim: true
    },
    rationale: {
      type: String,
      trim: true
    },
    actionItems: [{ type: String, trim: true }],
    targetLevel: {
      type: Number,
      min: 1,
      max: 4
    },
    resourceType: {
      type: String,
      enum: ["course", "practice", "certification", "mentorship"],
      default: "practice"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

recommendationSchema.index({ graduateId: 1, status: 1 });
recommendationSchema.index({ gapAnalysisId: 1 });

export const Recommendation = mongoose.model("Recommendation", recommendationSchema);
