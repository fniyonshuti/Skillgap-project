/**
 * @fileoverview Metadata for evidence files stored outside MongoDB.
 */

import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    graduateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Graduate",
      required: true
    },
    assessmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment"
      }
    ],
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    storedName: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100
    },
    mimeType: {
      type: String,
      required: true,
      maxlength: 150
    },
    size: {
      type: Number,
      required: true,
      min: 1,
      max: 5 * 1024 * 1024
    }
  },
  { timestamps: true }
);

evidenceSchema.index({ ownerId: 1, createdAt: -1 });
evidenceSchema.index({ graduateId: 1, createdAt: -1 });

export const Evidence = mongoose.model("Evidence", evidenceSchema);
