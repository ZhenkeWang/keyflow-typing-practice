"use client";

import { useEffect } from "react";

export default function PwaRuntime() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return undefined;
    let active = true;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline capability is progressive enhancement; the app stays usable.
    });
    return () => { active = false; void active; };
  }, []);
  return null;
}

