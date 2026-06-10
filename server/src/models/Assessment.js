import mongoose from "mongoose";

const assessmentResponseSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    source: {
      type: String,
      enum: ["practical", "portfolio", "academic", "selfAssessment"],
      required: true
    },
    promptSnapshot: {
      type: String,
      required: true,
      trim: true
    },
    selectedLabelSnapshot: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const sourceScoreSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["practical", "portfolio", "academic", "selfAssessment"],
      required: true
    },
    questionCount: {
      type: Number,
      min: 1,
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    }
  },
  { _id: false }
);

const assessmentItemSchema = new mongoose.Schema(
  {
    competencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competency",
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 5
    },
    evidenceScores: {
      practical: { type: Number, min: 0, max: 100 },
      portfolio: { type: Number, min: 0, max: 100 },
      academic: { type: Number, min: 0, max: 100 },
      selfAssessment: { type: Number, min: 0, max: 100 }
    },
    responses: {
      type: [assessmentResponseSchema],
      default: []
    },
    sourceScoreBreakdown: {
      type: [sourceScoreSchema],
      default: []
    },
    competencyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    competencyLevel: {
      type: Number,
      min: 1,
      max: 4
    },
    competencyLabel: {
      type: String,
      trim: true
    },
    mappingSnapshot: {
      rtbReference: { type: String, trim: true },
      title: { type: String, trim: true },
      requiredLevel: { type: Number, min: 1, max: 4 },
      standardVersion: { type: String, trim: true }
    },
    evidence: {
      type: String,
      trim: true
    },
    evidenceLink: {
      type: String,
      trim: true
    },
    evidenceFiles: [
      {
        _id: false,
        evidenceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Evidence",
          required: true
        },
        originalName: {
          type: String,
          required: true,
          trim: true
        },
        mimeType: {
          type: String,
          required: true
        },
        size: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],
    remarks: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
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
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assessmentType: {
      type: String,
      enum: ["self", "institution", "admin"],
      default: "self"
    },
    status: {
      type: String,
      enum: ["draft", "processing", "submitted", "reviewed"],
      default: "submitted"
    },
    processingStatus: {
      type: String,
      enum: [
        "pending",
        "validating_data",
        "storing_data",
        "calculating_score",
        "determining_level",
        "retrieving_rtb_standards",
        "calculating_gap",
        "classifying_gap",
        "generating_recommendations",
        "generating_report",
        "saving_results",
        "completed",
        "failed"
      ],
      default: "pending"
    },
    workflowLog: [
      {
        _id: false,
        stage: {
          type: String,
          required: true
        },
        status: {
          type: String,
          enum: ["completed", "failed"],
          required: true
        },
        completedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    evidenceVerificationStatus: {
      type: String,
      enum: ["submitted", "verified", "needs_revision"],
      default: "submitted"
    },
    items: [assessmentItemSchema],
    totalScore: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    overallCompetencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    overallCompetencyLevel: {
      type: Number,
      min: 1,
      max: 4,
      default: 1
    },
    scoringMethod: {
      type: String,
      enum: [
        "legacy_self_rating",
        "rtb_weighted_evidence_v1",
        "rtb_system_question_bank_v1"
      ],
      default: "rtb_system_question_bank_v1"
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: Date
  },
  { timestamps: true }
);

assessmentSchema.index({ graduateId: 1, createdAt: -1 });
assessmentSchema.index({ domainId: 1, status: 1 });

export const Assessment = mongoose.model("Assessment", assessmentSchema);
