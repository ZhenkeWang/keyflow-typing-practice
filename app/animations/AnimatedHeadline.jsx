"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const DEFAULT_PHRASES = [
  "Type faster.",
  "Build muscle memory.",
  "Master your keyboard.",
  "Enter the flow.",
];

export default function AnimatedHeadline({ active, phrases = DEFAULT_PHRASES }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active || reduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [active, phrases.length, reduceMotion]);

  return (
    <span className="animated-headline" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={phrases[index]}
          initial={reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(9px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18, filter: "blur(8px)" }}
          transition={{ type: "spring", stiffness: 125, damping: 18, mass: .85 }}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
