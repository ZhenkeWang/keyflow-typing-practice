"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

export default function MotionButton({ children, className = "", onClick, type = "button" }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: .35 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: .35 });

  function handlePointerMove(event) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left - rect.width / 2) * .16);
    y.set((event.clientY - rect.top - rect.height / 2) * .18);
  }

  function resetPosition() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={className}
      style={{ x, y }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: .975 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
    >
      {children}
    </motion.button>
  );
}
