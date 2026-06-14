/**
 * @fileoverview Configured API client and user-facing error normalization.
 */

import axios from "axios";
import { expireStoredAuth, getStoredToken } from "../utils/authStorage.js";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

// Production requests stay on the frontend origin and are proxied by Vercel.
// This avoids browser CORS failures even if an old VITE_API_URL remains configured.
export const API_URL = (
  import.meta.env.PROD ? "/api" : configuredApiUrl || "/api"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: {
    Accept: "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthenticationAttempt =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthenticationAttempt) {
      expireStoredAuth();
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  if (error.code === "ECONNABORTED") {
    return "The request took too long. Check your connection and try again.";
  }
  if (!error.response) {
    return "The server could not be reached. Check your connection and try again.";
  }
  return error.response?.data?.message || error.message || "Something went wrong.";
}
