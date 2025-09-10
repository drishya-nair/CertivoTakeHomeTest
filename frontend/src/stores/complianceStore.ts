import { create } from "zustand";
import { api, setAuthToken, API_BASE } from "@/utils/api";
import type { MergedResponse } from "@/types";
import { createSocket } from "@/utils/socket";

type State = {
  token?: string;
  merged?: MergedResponse;
  loading: boolean;
  error?: string;
  filter: string;
};

type Actions = {
  login: (username: string, password: string) => Promise<void>;
  fetchMerged: () => Promise<void>;
  setFilter: (value: string) => void;
};

export const useComplianceStore = create<State & Actions>((set, get) => ({
  token: undefined,
  merged: undefined,
  loading: false,
  error: undefined,
  filter: "",
  async login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    const token = res.data.token as string;
    set({ token });
    setAuthToken(token);
    const socket = createSocket(API_BASE, token);
    socket.on("bom:updated", () => {
      // refresh data in realtime when backend signals an update
      get().fetchMerged();
    });
  },
  async fetchMerged() {
    try {
      set({ loading: true, error: undefined });
      const res = await api.get<MergedResponse>("/merged");
      set({ merged: res.data });
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      set({ error: err?.response?.data?.message || err?.message || "Failed to fetch" });
    } finally {
      set({ loading: false });
    }
  },
  setFilter(value) {
    set({ filter: value });
  },
}));


