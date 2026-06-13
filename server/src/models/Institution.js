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
      trim: true
    },
    actionItems: {
      type: [{ type: String, trim: true }],
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
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    district: {
      type: String,
      default: "Kicukiro",
      trim: true
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
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
