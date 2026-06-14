import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

// Production requests stay on the frontend origin and are proxied by Vercel.
// This avoids browser CORS failures even if an old VITE_API_URL remains configured.
export const API_URL = (
  import.meta.env.PROD ? "/api" : configuredApiUrl || "/api"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("skills_gap_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong.";
}
