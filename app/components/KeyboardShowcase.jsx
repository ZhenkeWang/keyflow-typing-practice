"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const ROWS = [
  ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "↵"],
  ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "ctrl", "opt", "space", "cmd", "←", "↓", "↑", "→"],
];

const SEQUENCE = ["A", "S", "D", "F", "J", "K", "L", ";"];

export default function KeyboardShowcase({ onEnter }) {
  const reduceMotion = useReducedMotion();
  const [autoKey, setAutoKey] = useState("F");
  const [hoverKey, setHoverKey] = useState("");
  const x = useMotionValue(.5);
  const y = useMotionValue(.5);
  const sx = useSpring(x, { stiffness: 88, damping: 28, mass: .8 });
  const sy = useSpring(y, { stiffness: 88, damping: 28, mass: .8 });
  const rotateY = useTransform(sx, [0, 1], [-3.2, 3.2]);
  const rotateX = useTransform(sy, [0, 1], [2.4, -2.4]);

  useEffect(() => {
    if (reduceMotion) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % SEQUENCE.length;
      setAutoKey(SEQUENCE[index]);
    }, 680);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <motion.div
      className="atelier-keyboard-wrap"
      role="button"
      tabIndex={0}
      aria-label="交互键盘，点击进入训练"
      onClick={onEnter}
      onKeyDown={(event) => {
        if (["Enter", " "].includes(event.key)) { event.preventDefault(); onEnter(event); }
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left) / rect.width);
        y.set((event.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={() => { x.set(.5); y.set(.5); setHoverKey(""); }}
    >
      <motion.div className="atelier-keyboard" style={reduceMotion ? undefined : { rotateX, rotateY }}>
        <div className="atelier-keyboard-plate">
          {ROWS.map((row, rowIndex) => (
            <div className="atelier-key-row" key={rowIndex}>
              {row.map((key, keyIndex) => {
                const active = hoverKey === key || (!hoverKey && autoKey === key);
                return (
                  <motion.span
                    key={`${rowIndex}-${keyIndex}-${key}`}
                    className={`${key === "space" ? "space" : ""} ${["tab", "caps", "shift", "↵", "⌫"].includes(key) ? "wide" : ""} ${active ? "pressed" : ""}`}
                    onPointerEnter={() => setHoverKey(key)}
                    animate={active && !reduceMotion ? { y: 5, boxShadow: "0 1px 0 var(--key-edge)" } : { y: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  >
                    {key === "space" ? <i /> : key}
                  </motion.span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="atelier-board-meta"><span>HOME ROW CALIBRATION</span><i /><span>{hoverKey || autoKey}</span></div>
      </motion.div>
      <div className="atelier-keyboard-shadow" aria-hidden="true" />
    </motion.div>
  );
}
