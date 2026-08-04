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

const PULSE = ["K", "E", "Y", "F", "L", "O", "W"];

export default function KeyboardShowcase({ onEnter }) {
  const reduceMotion = useReducedMotion();
  const [autoKey, setAutoKey] = useState("K");
  const [hoverKey, setHoverKey] = useState("");
  const pointerX = useMotionValue(.5);
  const pointerY = useMotionValue(.5);
  const smoothX = useSpring(pointerX, { stiffness: 74, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 74, damping: 24 });
  const rotateY = useTransform(smoothX, [0, 1], [-4.5, 4.5]);
  const rotateX = useTransform(smoothY, [0, 1], [3.5, -3.5]);
  const shineX = useTransform(smoothX, [0, 1], ["8%", "92%"]);
  const shineY = useTransform(smoothY, [0, 1], ["8%", "82%"]);

  useEffect(() => {
    if (reduceMotion) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % PULSE.length;
      setAutoKey(PULSE[index]);
    }, 720);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <motion.div
      className="neural-keyboard-stage"
      role="button"
      tabIndex={0}
      aria-label="交互式键盘，点击进入训练"
      onClick={onEnter}
      onKeyDown={(event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); onEnter(event); } }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width);
        pointerY.set((event.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={() => { pointerX.set(.5); pointerY.set(.5); setHoverKey(""); }}
    >
      <motion.div className="neural-keyboard-shadow" animate={reduceMotion ? undefined : { scaleX: [1, .94, 1], opacity: [.28, .18, .28] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="neural-keyboard" style={reduceMotion ? undefined : { rotateX, rotateY, "--shine-x": shineX, "--shine-y": shineY }} animate={reduceMotion ? undefined : { y: [0, -5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
        <div className="neural-keyboard-light" />
        <div className="neural-keywell">
          {ROWS.map((row, rowIndex) => (
            <div className="neural-key-row" key={rowIndex}>
              {row.map((key, keyIndex) => {
                const active = hoverKey === key || (!hoverKey && autoKey === key);
                return (
                  <motion.span
                    key={`${rowIndex}-${keyIndex}-${key}`}
                    className={`${key === "space" ? "space" : ""} ${["tab", "caps", "shift", "↵", "⌫"].includes(key) ? "wide" : ""} ${active ? "pressed" : ""}`}
                    onPointerEnter={() => setHoverKey(key)}
                    animate={active && !reduceMotion ? { y: 6, scale: .985 } : { y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 390, damping: 25 }}
                  >{key === "space" ? <i /> : key}</motion.span>
                );
              })}
            </div>
          ))}
        </div>
        <footer><span>KEYFLOW / TITANIUM 01</span><i /><strong>{hoverKey || autoKey}</strong></footer>
      </motion.div>
    </motion.div>
  );
}
