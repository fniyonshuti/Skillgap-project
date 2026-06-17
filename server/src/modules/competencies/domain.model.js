/**
 * @fileoverview Top-level ICT competency domain model.
 */

import mongoose from "mongoose";

const ictDomainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 160
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1_500
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const ICTDomain = mongoose.model("ICTDomain", ictDomainSchema);
