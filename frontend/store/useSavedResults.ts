import { create } from "zustand";
import { AnalysisResponse } from "@/lib/gemini";

export interface SavedResult {
  id: string;
  inputText: string;
  result: AnalysisResponse;
  timestamp: number;
  type: "text" | "link" | "email" | "image";
  riskLevel: string;
  riskScore: number;
}

interface SavedResultsStore {
  results: SavedResult[];
  addResult: (
    inputText: string,
    result: AnalysisResponse,
    type: "text" | "link" | "email" | "image",
  ) => void;
  removeResult: (id: string) => void;
  clearAll: () => void;
  loadResults: () => void;
  getResultById: (id: string) => SavedResult | undefined;
}

const STORAGE_KEY = "fraudguard_results";

export const useSavedResults = create<SavedResultsStore>((set, get) => {
  // Load results from localStorage on first access
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        set({ results: parsed });
      } catch (e) {
        console.error("Failed to load saved results:", e);
      }
    }
  }

  return {
    results: [],

    addResult: (inputText, result, type) => {
      const newResult: SavedResult = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        inputText,
        result,
        timestamp: Date.now(),
        type,
        riskLevel: result.risk_level || "Unknown",
        riskScore: result.risk_score || 0,
      };

      set((state) => {
        const updated = [newResult, ...state.results];
        // Persist to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        return { results: updated };
      });

      return newResult.id;
    },

    removeResult: (id) => {
      set((state) => {
        const updated = state.results.filter((r) => r.id !== id);
        // Persist to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        return { results: updated };
      });
    },

    clearAll: () => {
      set({ results: [] });
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    loadResults: () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            set({ results: parsed });
          } catch (e) {
            console.error("Failed to load saved results:", e);
          }
        }
      }
    },

    getResultById: (id) => {
      return get().results.find((r) => r.id === id);
    },
  };
});
