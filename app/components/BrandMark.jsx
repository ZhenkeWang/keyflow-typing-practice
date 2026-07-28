"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function BrandMark({ compact = false, animate = false, className = "" }) {
  const reduceMotion = useReducedMotion();
  return (
    <span className={`keyflow-brand-mark ${compact ? "compact" : ""} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <motion.path
          d="M17 12v40M18 34 42 12M27 28l20 24"
          initial={animate && !reduceMotion ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.05, ease: [.16, 1, .3, 1] }}
        />
        <motion.path
          className="brand-flow-line"
          d="M34 18c10 0 15 5 15 12s-5 12-15 12"
          initial={animate && !reduceMotion ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: .72 }}
          transition={{ duration: .8, delay: .3, ease: [.16, 1, .3, 1] }}
        />
      </svg>
      {animate && !reduceMotion && <motion.i initial={{ x: "-160%", opacity: 0 }} animate={{ x: "220%", opacity: [0, 1, 0] }} transition={{ duration: 1.2, delay: .15, ease: "easeInOut" }} />}
    </span>
  );
}

