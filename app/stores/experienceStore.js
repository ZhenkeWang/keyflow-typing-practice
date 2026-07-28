"use client";

import { create } from "zustand";

const STORAGE_KEY = "keyflow-experience";
const DEFAULTS = {
  sound: "soft",
  volume: 0.32,
  haptics: true,
  pointerEffects: true,
};

export const useExperienceStore = create((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  hydrate() {
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      set({ ...DEFAULTS, ...stored, hydrated: true });
    } catch {
      set({ ...DEFAULTS, hydrated: true });
    }
  },

  update(update) {
    set(update);
    if (typeof window !== "undefined") {
      const { sound, volume, haptics, pointerEffects } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sound, volume, haptics, pointerEffects }));
    }
  },
}));

