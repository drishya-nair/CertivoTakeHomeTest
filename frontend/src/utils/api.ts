import axios from "axios";
import type { MergedComponent, MergedResponse } from "@/types";

// Point frontend requests to Next.js rewrite proxy. Backend URL is configured in next.config.ts
export const API_BASE = "/api";

export const api = axios.create({
  baseURL: API_BASE,
});

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

// Re-export types for convenience
export type { MergedComponent, MergedResponse };


