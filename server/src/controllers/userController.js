import { body } from "express-validator";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateUserValidation = [
  body("role").optional().isIn(["graduate", "institution", "admin"]).withMessage("Invalid role."),
  body("status").optional().isIn(["active", "suspended"]).withMessage("Invalid status.")
];

export const listUsers = asyncHandler(async (req, res) => {
  const { role, status, search = "", page = 1, limit = 20 } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const updates = {};

  if (req.body.role) updates.role = req.body.role;
  if (req.body.status) updates.status = req.body.status;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) {
    throw new ApiError(404, "User was not found.");
  }

  res.json(user);
});
