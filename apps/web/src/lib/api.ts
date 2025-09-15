import axios from "axios";
import type { MergedComponent, MergedResponse } from "@certivo/shared-types";

// API configuration
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE,
});

// Auth token management
export const setAuthToken = (token?: string): void => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Re-export types for convenience
export type { MergedComponent, MergedResponse };
