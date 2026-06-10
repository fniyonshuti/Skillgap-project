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
      trim: true
    },
    storedName: {
      type: String,
      required: true,
      unique: true
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
  },
  { timestamps: true }
);

evidenceSchema.index({ ownerId: 1, createdAt: -1 });
evidenceSchema.index({ graduateId: 1, createdAt: -1 });

export const Evidence = mongoose.model("Evidence", evidenceSchema);
