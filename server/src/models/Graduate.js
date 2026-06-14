/**
 * @fileoverview Graduate profile and institution membership model.
 */

import mongoose from "mongoose";

const graduateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution"
    },
    registrationNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: 80
    },
    program: {
      type: String,
      trim: true,
      maxlength: 160
    },
    graduationYear: {
      type: Number,
      min: 2000,
      max: 2100
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40
    },
    district: {
      type: String,
      default: "Kicukiro",
      trim: true,
      maxlength: 120
    },
    profileCompleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

graduateSchema.index({ institutionId: 1 });
graduateSchema.index({ program: 1, graduationYear: 1 });

export const Graduate = mongoose.model("Graduate", graduateSchema);
