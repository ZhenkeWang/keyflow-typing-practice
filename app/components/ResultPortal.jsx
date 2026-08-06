"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Result views belong to the viewport, not to the glass practice card. A
 * portal avoids fixed-position containment created by backdrop filters and
 * keeps long reports independently scrollable on every layout.
 */
export default function ResultPortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
