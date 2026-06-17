/**
 * @fileoverview Administrator-facing user query and account-state endpoints.
 */

import { User } from "./user.model.js";
import { serializeUser } from "../../shared/helpers/userSerializer.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { pickDefined } from "../../shared/utils/objects.js";
import { escapeRegex, parsePagination } from "../../shared/utils/query.js";

const EDITABLE_USER_FIELDS = Object.freeze(["role", "status"]);

export const listUsers = asyncHandler(async (req, res) => {
  const { role, status, search = "" } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  res.json({
    items: users.map(serializeUser),
    total,
    page,
    limit
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const updates = pickDefined(req.body, EDITABLE_USER_FIELDS);
  const isUpdatingSelf = req.params.id === req.user._id.toString();

  if (
    isUpdatingSelf &&
    (updates.status === "suspended" ||
      (updates.role && updates.role !== req.user.role))
  ) {
    throw new ApiError(
      409,
      "Administrators cannot suspend their own account or remove their own admin role."
    );
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });
  if (!user) {
    throw new ApiError(404, "User was not found.");
  }

  res.json(serializeUser(user));
});
