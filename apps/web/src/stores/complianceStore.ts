import { create } from "zustand";
import { api } from "@/lib/api";
import type { MergedResponse } from "@certivo/shared-types";
import { ERROR_MESSAGES } from "@/lib/constants";
import { extractErrorMessage, logError } from "@/lib/errorHandling";

// Store state interface
interface ComplianceState {
  merged?: MergedResponse;
  loading: boolean;
  error?: string;
  filter: string;
}

// Store actions interface
interface ComplianceActions {
  fetchMerged: () => Promise<void>;
  setFilter: (value: string) => void;
}

// Combined store type
type ComplianceStore = ComplianceState & ComplianceActions;

export const useComplianceStore = create<ComplianceStore>((set) => ({
  // Initial state
  merged: undefined,
  loading: false,
  error: undefined,
  filter: "",

  // Fetch merged compliance data
  async fetchMerged() {
    try {
      set({ loading: true, error: undefined });
      const response = await api.get<MergedResponse>("/merged");
      set({ merged: response.data });
    } catch (error) {
      logError("ComplianceStore.fetchMerged", error);
      set({ error: extractErrorMessage(error) || ERROR_MESSAGES.FETCH_FAILED });
    } finally {
      set({ loading: false });
    }
  },

  // Set filter value
  setFilter(value: string) {
    set({ filter: value });
  },
}));


