"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const ROWS = [
  ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "↵"],
  ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "⌘", "⌥", "space", "⌥", "←", "↑", "↓", "→"],
];

const FLOW_KEYS = new Set(["K", "E", "Y", "F", "L", "O", "W"]);

export default function KeyboardShowcase({ onEnter }) {
  const reduceMotion = useReducedMotion();
  const [activeKey, setActiveKey] = useState("K");
  const pointerX = useMotionValue(.5);
  const pointerY = useMotionValue(.5);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 18 });
  const rotateY = useTransform(smoothX, [0, 1], [-7, 7]);
  const rotateX = useTransform(smoothY, [0, 1], [6, -6]);
  const lightX = useTransform(smoothX, [0, 1], ["20%", "80%"]);
  const lightY = useTransform(smoothY, [0, 1], ["20%", "80%"]);

  useEffect(() => {
    if (reduceMotion) return;
    const sequence = ["K", "E", "Y", "F", "L", "O", "W"];
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % sequence.length;
      setActiveKey(sequence[index]);
    }, 420);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <motion.div
      className="showcase-perspective"
      role="button"
      tabIndex={0}
      aria-label="轻触虚拟键盘进入训练"
      initial={{ opacity: 0, y: 42, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: .52, duration: 1.28, ease: [.16, 1, .3, 1] }}
      onClick={onEnter}
      onKeyDown={(event) => {
        if (["Enter", " "].includes(event.key)) {
          event.preventDefault();
          onEnter(event);
        }
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width);
        pointerY.set((event.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={() => {
        pointerX.set(.5);
        pointerY.set(.5);
      }}
    >
      <div className="showcase-scale">
        <motion.div
          className="showcase-keyboard"
          style={{ rotateX, rotateY, "--light-x": lightX, "--light-y": lightY }}
          animate={reduceMotion ? undefined : { y: [0, -7, 0], rotateZ: [0, .25, 0, -.2, 0] }}
          transition={{ duration: 8.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="showcase-light" />
          <div className="showcase-keywell">
            {ROWS.map((row, rowIndex) => (
              <div className="showcase-row" key={rowIndex}>
                {row.map((key, keyIndex) => (
                  <motion.span
                    className={`${key === "space" ? "space" : ""} ${["tab", "caps", "shift", "↵", "⌫"].includes(key) ? "wide" : ""} ${FLOW_KEYS.has(key) ? "flow-key" : ""} ${activeKey === key ? "auto-pressed" : ""}`}
                    key={`${rowIndex}-${keyIndex}-${key}`}
                    whileHover={{ y: 5, scale: .985 }}
                    whileTap={{ y: 8 }}
                    transition={{ type: "spring", stiffness: 520, damping: 24 }}
                  >
                    {key === "space" ? "" : key}
                  </motion.span>
                ))}
              </div>
            ))}
          </div>
          <div className="showcase-deck-edge" />
        </motion.div>
      </div>
      <div className="showcase-shadow" />
    </motion.div>
  );
}
