"use client";

import { useEffect } from "react";
import { useThemeStore } from "../stores/themeStore";

export default function ThemeRuntime() {
  const visualTheme = useThemeStore((state) => state.visualTheme);
  const customTheme = useThemeStore((state) => state.customTheme);
  const hydrated = useThemeStore((state) => state.hydrated);
  const hydrate = useThemeStore((state) => state.hydrate);

  useEffect(() => hydrate(), [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.dataset.visualTheme = visualTheme;
    root.dataset.motion = customTheme.motion;
    if (visualTheme === "custom") {
      root.style.setProperty("--custom-background", customTheme.background);
      root.style.setProperty("--custom-accent", customTheme.accent);
      root.style.setProperty("--custom-keyboard", customTheme.keyboard);
      root.dataset.customFont = customTheme.font;
    } else {
      root.style.removeProperty("--custom-background");
      root.style.removeProperty("--custom-accent");
      root.style.removeProperty("--custom-keyboard");
      delete root.dataset.customFont;
    }
  }, [customTheme, hydrated, visualTheme]);

  return null;
}

