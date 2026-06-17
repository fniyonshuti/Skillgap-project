/**
 * @fileoverview RTB competency standard and assessment question-bank model.
 */

import mongoose from "mongoose";

const assessmentOptionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  { _id: true }
);

const assessmentQuestionSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["practical", "portfolio", "academic", "selfAssessment"],
      required: true
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2_000
    },
    options: {
      type: [assessmentOptionSchema],
      validate: {
        validator: (options) => options.length >= 2,
        message: "Each assessment question requires at least two answer options."
      }
    },
    order: {
      type: Number,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { _id: true }
);

const competencySchema = new mongoose.Schema(
  {
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ICTDomain",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2_000
    },
    category: {
      type: String,
      trim: true,
      maxlength: 120
    },
    requiredLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },
    rtbReference: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    evidenceExamples: [{ type: String, trim: true, maxlength: 500 }],
    version: {
      type: String,
      trim: true,
      default: "1.0",
      maxlength: 40
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    },
    standardStatus: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "active"
    },
    assessmentQuestions: {
      type: [assessmentQuestionSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

competencySchema.index({ domainId: 1, title: 1 }, { unique: true });
competencySchema.index({ category: 1, requiredLevel: 1 });
competencySchema.index({ rtbReference: 1, version: 1 });

export const Competency = mongoose.model("Competency", competencySchema);
