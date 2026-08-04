"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const ROWS = [
  ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "↵"],
  ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "⌃", "⌥", "space", "⌘", "←", "↓", "↑", "→"],
];

const WORD = ["K", "E", "Y", "F", "L", "O", "W"];
const WORD_KEYS = new Set(WORD);

export default function KeyboardShowcase({ onEnter }) {
  const reduceMotion = useReducedMotion();
  const [activeKey, setActiveKey] = useState("K");
  const [hoverKey, setHoverKey] = useState("");
  const pointerX = useMotionValue(.5);
  const pointerY = useMotionValue(.5);
  const smoothX = useSpring(pointerX, { stiffness: 72, damping: 22, mass: .7 });
  const smoothY = useSpring(pointerY, { stiffness: 72, damping: 22, mass: .7 });
  const rotateY = useTransform(smoothX, [0, 1], [-5.5, 5.5]);
  const rotateX = useTransform(smoothY, [0, 1], [4.5, -4.5]);
  const lightX = useTransform(smoothX, [0, 1], ["14%", "86%"]);
  const lightY = useTransform(smoothY, [0, 1], ["12%", "72%"]);

  useEffect(() => {
    if (reduceMotion) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % WORD.length;
      setActiveKey(WORD[index]);
    }, 520);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <motion.div
      className="portal-instrument"
      role="button"
      tabIndex={0}
      aria-label="轻触键盘进入训练"
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
        setHoverKey("");
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 34, scale: .96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: .5, duration: 1.35, ease: [.16, 1, .3, 1] }}
    >
      <motion.div className="instrument-shadow" animate={reduceMotion ? undefined : { scaleX: [1, .94, 1], opacity: [.34, .22, .34] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div
        className="instrument-shell"
        style={{ rotateX, rotateY, "--instrument-light-x": lightX, "--instrument-light-y": lightY }}
        animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <header><span><i /> FLOWBOARD / 01</span><small>{hoverKey ? `${hoverKey === "space" ? "SPACE" : hoverKey} · touch` : "move to feel the key travel"}</small></header>
        <div className="instrument-glint" aria-hidden="true" />
        <div className="instrument-keywell">
          {ROWS.map((row, rowIndex) => (
            <div className="instrument-row" key={rowIndex}>
              {row.map((key, keyIndex) => (
                <motion.span
                  className={`${key === "space" ? "space" : ""} ${["tab", "caps", "shift", "↵", "⌫"].includes(key) ? "wide" : ""} ${WORD_KEYS.has(key) ? "word-key" : ""} ${activeKey === key && !hoverKey ? "auto-pressed" : ""} ${hoverKey === key ? "pointer-pressed" : ""}`}
                  key={`${rowIndex}-${keyIndex}-${key}`}
                  onPointerEnter={() => setHoverKey(key)}
                  whileHover={reduceMotion ? undefined : { y: 7, scale: .982 }}
                  whileTap={reduceMotion ? undefined : { y: 10, scale: .97 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24, mass: .7 }}
                >
                  {key === "space" ? "" : key}
                </motion.span>
              ))}
            </div>
          ))}
        </div>
        <footer><span>SOFT TOUCH</span><i /><span>READY</span></footer>
      </motion.div>
    </motion.div>
  );
}
