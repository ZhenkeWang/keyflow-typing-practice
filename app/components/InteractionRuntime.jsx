"use client";

import { useEffect } from "react";
import { useExperienceStore } from "../stores/experienceStore";

const TILT_SELECTOR = [
  ".growth-metric-card",
  ".ai-status-grid article",
  ".achievement-grid article",
  ".mode-card",
  ".daily-trend-card",
  ".leaderboard-card",
].join(",");

export default function InteractionRuntime() {
  const hydrate = useExperienceStore((state) => state.hydrate);
  const pointerEffects = useExperienceStore((state) => state.pointerEffects);
  const motion = useExperienceStore((state) => state.motion);
  useEffect(() => hydrate(), [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.dataset.motionPreference = motion;
    if (!pointerEffects || motion !== "full" || coarse || reduced) {
      root.dataset.pointerEffects = "off";
      return undefined;
    }
    root.dataset.pointerEffects = "on";
    let frame = 0;
    let latest = { x: window.innerWidth / 2, y: window.innerHeight / 2, target: null };
    const paint = () => {
      frame = 0;
      root.style.setProperty("--pointer-x", `${latest.x}px`);
      root.style.setProperty("--pointer-y", `${latest.y}px`);
      const card = latest.target?.closest?.(TILT_SELECTOR);
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--tilt-x", `${((latest.y - rect.top) / rect.height - .5) * -3.6}deg`);
        card.style.setProperty("--tilt-y", `${((latest.x - rect.left) / rect.width - .5) * 4.2}deg`);
        card.style.setProperty("--glow-x", `${latest.x - rect.left}px`);
        card.style.setProperty("--glow-y", `${latest.y - rect.top}px`);
      }
    };
    const move = (event) => {
      latest = { x: event.clientX, y: event.clientY, target: event.target };
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = (event) => {
      const card = event.target.closest?.(TILT_SELECTOR);
      if (!card) return;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
      cancelAnimationFrame(frame);
      delete root.dataset.pointerEffects;
    };
  }, [motion, pointerEffects]);

  return null;
}
