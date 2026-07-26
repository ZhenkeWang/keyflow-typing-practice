import { cloudRequest, isCloudConfigured } from "./cloudClient";

const SESSION_KEY = "keyflow-cloud-session";

export function readStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!session?.access_token || !session?.user?.id) return null;
    if (session.expires_at && session.expires_at * 1000 <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function persistSession(session) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function signUpWithEmail({ email, password, username }) {
  const result = await cloudRequest("/auth/v1/signup", {
    method: "POST",
    body: {
      email,
      password,
      data: { username },
    },
  });
  if (result?.access_token) persistSession(result);
  return result;
}

export async function signInWithEmail({ email, password }) {
  const result = await cloudRequest("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
  });
  persistSession(result);
  return result;
}

export async function signOutFromCloud(session = readStoredSession()) {
  try {
    if (session?.access_token && isCloudConfigured()) {
      await cloudRequest("/auth/v1/logout", {
        method: "POST",
        token: session.access_token,
      });
    }
  } finally {
    persistSession(null);
  }
}

