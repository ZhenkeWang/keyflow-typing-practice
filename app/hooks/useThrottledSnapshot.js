"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps the calculation path fully real-time while presenting rapidly changing
 * values at a calmer, layout-stable cadence.
 */
export default function useThrottledSnapshot(snapshot, active, interval = 250) {
  const latest = useRef(snapshot);
  const [display, setDisplay] = useState(snapshot);

  latest.current = snapshot;

  useEffect(() => {
    if (!active) {
      setDisplay(latest.current);
      return undefined;
    }

    setDisplay(latest.current);
    const timer = window.setInterval(() => {
      setDisplay(latest.current);
    }, interval);

    return () => window.clearInterval(timer);
  }, [active, interval]);

  return display;
}
