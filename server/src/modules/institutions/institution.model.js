/**
 * @fileoverview Institution profile and recommendation policy model.
 */

import mongoose from "mongoose";

const recommendationRuleSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true
    },
    recommendationText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2_000
    },
    actionItems: {
      type: [{ type: String, trim: true, maxlength: 500 }],
      validate: {
        validator: (items) => items.length > 0,
        message: "Each recommendation rule requires at least one action item."
      }
    },
    resourceType: {
      type: String,
      enum: ["course", "practice", "certification", "mentorship"],
      required: true
    }
  },
  { _id: false }
);

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 40
    },
    district: {
      type: String,
      default: "Kicukiro",
      trim: true,
      maxlength: 120
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 40
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300
    },
    accountUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    recommendationRules: {
      type: [recommendationRuleSchema],
      default: []
    },
    recommendationRulesUpdatedAt: Date
  },
  { timestamps: true }
);

institutionSchema.index({ district: 1 });

export const Institution = mongoose.model("Institution", institutionSchema);
