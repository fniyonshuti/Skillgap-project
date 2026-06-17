import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    graduateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Graduate"
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment"
    },
    gapAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GapAnalysis"
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution"
    },
    reportType: {
      type: String,
      enum: ["graduate", "institution", "admin"],
      required: true
    },
    format: {
      type: String,
      enum: ["json", "csv", "pdf"],
      default: "json"
    },
    fileUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
    snapshot: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ["generated", "archived"],
      default: "generated"
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

reportSchema.index({ ownerId: 1, reportType: 1, generatedAt: -1 });
reportSchema.index({ assessmentId: 1, format: 1 });

export const Report = mongoose.model("Report", reportSchema);
