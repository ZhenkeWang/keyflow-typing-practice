"use client";

import { create } from "zustand";
import {
  analyzePerformance,
  buildSessionReview,
  chatCoach,
  generatePlan,
  predictGrowth,
} from "../services/aiCoach";

export const useAiCoachStore = create((set, get) => ({
  status: "idle",
  chatStatus: "idle",
  analysis: null,
  plan: null,
  sessionReview: null,
  conversation: [],
  goal: 80,
  error: null,

  hydrate() {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("keyflow-ai-coach") || "{}");
      set({
        goal: Number(saved.goal) || 80,
        conversation: Array.isArray(saved.conversation) ? saved.conversation.slice(-12) : [],
      });
    } catch {
      set({ goal: 80, conversation: [] });
    }
  },

  persist() {
    if (typeof window === "undefined") return;
    const { goal, conversation } = get();
    localStorage.setItem("keyflow-ai-coach", JSON.stringify({ goal, conversation: conversation.slice(-12) }));
  },

  setGoal(goal, history = []) {
    const safeGoal = Math.min(180, Math.max(30, Number(goal) || 80));
    const analysis = get().analysis;
    const updatedAnalysis = analysis
      ? { ...analysis, prediction: predictGrowth(history, safeGoal) }
      : analysis;
    const nextPlan = updatedAnalysis ? generatePlan(updatedAnalysis, safeGoal) : get().plan;
    set({ goal: safeGoal, analysis: updatedAnalysis, plan: nextPlan });
    get().persist();
  },

  async analyze(history) {
    const requestId = Date.now();
    set({ status: "loading", error: null, requestId });
    try {
      const analysis = await analyzePerformance(history, { goal: get().goal });
      if (get().requestId !== requestId) return;
      set({ analysis, plan: analysis.recommendations, status: "ready" });
    } catch (error) {
      if (get().requestId === requestId) set({ status: "error", error: error.message });
    }
  },

  async review(record, history) {
    const reviewRequestId = Date.now();
    set({ sessionReview: null, reviewRequestId });
    const review = await buildSessionReview(record, history, { goal: get().goal });
    if (get().reviewRequestId !== reviewRequestId) return null;
    set({ sessionReview: review });
    return review;
  },

  clearReview() {
    set({ sessionReview: null, reviewRequestId: Date.now() });
  },

  async ask(question, history) {
    const trimmed = String(question || "").trim();
    if (!trimmed) return;
    set({ chatStatus: "thinking" });
    const response = await chatCoach(trimmed, {
      history,
      analysis: get().analysis,
      plan: get().plan,
      goal: get().goal,
    });
    set((state) => ({
      chatStatus: "ready",
      conversation: [...state.conversation, response].slice(-12),
    }));
    get().persist();
  },
}));
