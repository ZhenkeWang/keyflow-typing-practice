"use client";

import { create } from "zustand";
import { DEFAULT_SAAS_PREFERENCES } from "../config/saas.js";

export const THEME_PRESETS = [
  {
    id: "apple-white",
    label: "Apple White",
    description: "明亮、克制的 Vision 风格",
    swatches: ["#f5f5f7", "#ffffff", "#635cff"],
  },
  {
    id: "cyber-dark",
    label: "Cyber Dark",
    description: "深黑界面与蓝紫环境光",
    swatches: ["#050507", "#161617", "#7772ff"],
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "专注代码输入的荧光终端",
    swatches: ["#07110d", "#0c1b14", "#63f5a8"],
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "低饱和极光与冷色玻璃",
    swatches: ["#101325", "#24214a", "#72dcc7"],
  },
  {
    id: "mechanical",
    label: "Mechanical",
    description: "温暖键帽与金属质感",
    swatches: ["#171411", "#2d2821", "#e79b67"],
  },
];

const STORAGE_KEY = "keyflow-saas-preferences";

export const useThemeStore = create((set, get) => ({
  ...DEFAULT_SAAS_PREFERENCES,
  hydrated: false,

  hydrate() {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      set({
        visualTheme: saved.visualTheme || DEFAULT_SAAS_PREFERENCES.visualTheme,
        customTheme: { ...DEFAULT_SAAS_PREFERENCES.customTheme, ...(saved.customTheme || {}) },
        reminders: { ...DEFAULT_SAAS_PREFERENCES.reminders, ...(saved.reminders || {}) },
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  persist() {
    if (typeof window === "undefined") return;
    const { visualTheme, customTheme, reminders } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ visualTheme, customTheme, reminders }));
  },

  setVisualTheme(visualTheme) {
    set({ visualTheme });
    get().persist();
  },

  updateCustomTheme(update) {
    set((state) => ({ customTheme: { ...state.customTheme, ...update }, visualTheme: "custom" }));
    get().persist();
  },

  updateReminders(update) {
    set((state) => ({ reminders: { ...state.reminders, ...update } }));
    get().persist();
  },
}));
