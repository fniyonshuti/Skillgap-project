import mongoose from "mongoose";

const ictDomainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const ICTDomain = mongoose.model("ICTDomain", ictDomainSchema);
