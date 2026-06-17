/**
 * @fileoverview HTTP adapters for account registration and authentication.
 */

import {
  authenticateCredentials,
  getAuthenticatedProfile,
  registerAccount
} from "./auth.service.js";
import { serializeUser } from "../../shared/helpers/userSerializer.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerAccount(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authenticateCredentials(req.body);
  res.json(result);
});

export const getMe = asyncHandler(async (req, res) => {
  const profile = await getAuthenticatedProfile(req.user);
  res.json({
    user: serializeUser(req.user),
    profile
  });
});
