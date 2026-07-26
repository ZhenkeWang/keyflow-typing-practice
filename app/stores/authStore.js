"use client";

import { create } from "zustand";
import {
  readStoredSession,
  signInWithEmail,
  signOutFromCloud,
  signUpWithEmail,
} from "../services/auth";
import { isCloudConfigured } from "../services/cloudClient";

export const useAuthStore = create((set, get) => ({
  configured: isCloudConfigured(),
  status: "idle",
  session: null,
  error: null,
  message: "",

  hydrate() {
    const session = readStoredSession();
    set({ session, status: session ? "authenticated" : "anonymous" });
  },

  async signIn(credentials) {
    set({ status: "loading", error: null, message: "" });
    try {
      const session = await signInWithEmail(credentials);
      set({ session, status: "authenticated", message: "已连接 KeyFlow Cloud。" });
      return session;
    } catch (error) {
      set({ status: "error", error: error.message });
      throw error;
    }
  },

  async signUp(credentials) {
    set({ status: "loading", error: null, message: "" });
    try {
      const result = await signUpWithEmail(credentials);
      const session = result?.access_token ? result : null;
      set({
        session,
        status: session ? "authenticated" : "confirmation-required",
        message: session ? "账号已创建并登录。" : "验证邮件已发送，请完成邮箱验证。",
      });
      return result;
    } catch (error) {
      set({ status: "error", error: error.message });
      throw error;
    }
  },

  async signOut() {
    set({ status: "loading", error: null });
    await signOutFromCloud(get().session);
    set({ session: null, status: "anonymous", message: "已安全退出云端账号。" });
  },
}));

