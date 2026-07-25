"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export default function CountUp({ value = 0, decimals = 0, suffix = "", className = "", duration = 1.15 }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduceMotion = useReducedMotion();
  const numericValue = Number(value) || 0;
  const display = useTransform(motionValue, (latest) => {
    const formatted = decimals
      ? latest.toFixed(decimals)
      : Math.round(latest).toLocaleString("en-US");
    return `${formatted}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      motionValue.set(numericValue);
      return;
    }
    const controls = animate(motionValue, numericValue, {
      duration,
      ease: [.16, 1, .3, 1],
    });
    return () => controls.stop();
  }, [duration, inView, motionValue, numericValue, reduceMotion]);

  return <motion.span className={className} ref={ref}>{display}</motion.span>;
}
