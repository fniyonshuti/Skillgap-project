/**
 * @fileoverview Authentication identity and role model.
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
      maxlength: 255
    },
    role: {
      type: String,
      enum: ["graduate", "institution", "admin"],
      default: "graduate"
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    },
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  if (!this.passwordHash.startsWith("$2")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }

  return next();
});

/**
 * Compares a plaintext login secret with the stored bcrypt digest.
 */
userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);
