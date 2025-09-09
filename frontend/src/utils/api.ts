import axios from "axios";

// Point frontend requests to Next.js rewrite proxy. Backend URL is configured in next.config.ts
export const API_BASE = "/api";

export const api = axios.create({
  baseURL: API_BASE,
});

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export interface MergedComponent {
  id: string;
  substance: string | null;
  mass: string;
  threshold_ppm: number | null;
  status: "Compliant" | "Non-Compliant" | "Unknown";
  material: string;
}

export interface MergedResponse {
  product: string;
  components: MergedComponent[];
}


