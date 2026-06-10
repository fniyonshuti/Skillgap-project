import mongoose from "mongoose";

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
    }
  },
  { timestamps: true }
);

institutionSchema.index({ district: 1 });

export const Institution = mongoose.model("Institution", institutionSchema);
