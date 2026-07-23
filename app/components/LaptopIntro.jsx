"use client";

import { useRef, useState } from "react";

const GAP = { value: "gap", label: "", spacer: true, size: "cluster" };
const BLANK = { value: "blank", label: "", spacer: true };

const INTRO_KEYS = [
  [
    { value: "escape", label: "Esc" }, GAP,
    { value: "f1", label: "F1" }, { value: "f2", label: "F2" }, { value: "f3", label: "F3" }, { value: "f4", label: "F4" }, GAP,
    { value: "f5", label: "F5" }, { value: "f6", label: "F6" }, { value: "f7", label: "F7" }, { value: "f8", label: "F8" }, GAP,
    { value: "f9", label: "F9" }, { value: "f10", label: "F10" }, { value: "f11", label: "F11" }, { value: "f12", label: "F12" }, GAP,
    { value: "print", label: "PrtSc" }, { value: "scroll", label: "ScrLk" }, { value: "pause", label: "Pause" },
  ],
  [
    { value: "`", label: "`" }, { value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" },
    { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }, { value: "7", label: "7" },
    { value: "8", label: "8" }, { value: "9", label: "9" }, { value: "0", label: "0" }, { value: "-", label: "−" },
    { value: "=", label: "=" }, { value: "backspace", label: "⌫", size: "wide" }, GAP,
    { value: "insert", label: "Ins" }, { value: "home", label: "Home" }, { value: "pageup", label: "PgUp" }, GAP,
    { value: "num", label: "Num" }, { value: "divide", label: "/" }, { value: "multiply", label: "×" }, { value: "minus", label: "−" },
  ],
  [
    { value: "tab", label: "Tab", size: "wide" }, { value: "q", label: "Q" }, { value: "w", label: "W" },
    { value: "e", label: "E" }, { value: "r", label: "R" }, { value: "t", label: "T" }, { value: "y", label: "Y" },
    { value: "u", label: "U" }, { value: "i", label: "I" }, { value: "o", label: "O" }, { value: "p", label: "P" },
    { value: "[", label: "[" }, { value: "]", label: "]" }, { value: "\\", label: "\\", size: "wide" }, GAP,
    { value: "delete", label: "Del" }, { value: "end", label: "End" }, { value: "pagedown", label: "PgDn" }, GAP,
    { value: "num7", label: "7" }, { value: "num8", label: "8" }, { value: "num9", label: "9" }, { value: "plus", label: "+" },
  ],
  [
    { value: "caps", label: "Caps", size: "wide" }, { value: "a", label: "A" }, { value: "s", label: "S" },
    { value: "d", label: "D" }, { value: "f", label: "F" }, { value: "g", label: "G" }, { value: "h", label: "H" },
    { value: "j", label: "J" }, { value: "k", label: "K" }, { value: "l", label: "L" }, { value: ";", label: ";" },
    { value: "'", label: "'" }, { value: "enter", label: "Enter", size: "enter" }, GAP,
    BLANK, BLANK, BLANK, GAP,
    { value: "num4", label: "4" }, { value: "num5", label: "5" }, { value: "num6", label: "6" }, { value: "plus-lower", label: "+" },
  ],
  [
    { value: "shift", label: "Shift", size: "shift" }, { value: "z", label: "Z" }, { value: "x", label: "X" },
    { value: "c", label: "C" }, { value: "v", label: "V" }, { value: "b", label: "B" }, { value: "n", label: "N" },
    { value: "m", label: "M" }, { value: ",", label: "," }, { value: ".", label: "." }, { value: "/", label: "/" },
    { value: "shift-right", label: "Shift", size: "shift" }, GAP,
    BLANK, { value: "up", label: "↑" }, BLANK, GAP,
    { value: "num1", label: "1" }, { value: "num2", label: "2" }, { value: "num3", label: "3" }, { value: "num-enter", label: "Enter" },
  ],
  [
    { value: "ctrl", label: "Ctrl", size: "meta" }, { value: "meta", label: "◆", size: "meta" },
    { value: "alt", label: "Alt", size: "meta" }, { value: "space", label: "Space", size: "space" },
    { value: "alt-right", label: "Alt", size: "meta" }, { value: "fn", label: "Fn", size: "meta" },
    { value: "menu", label: "Menu", size: "meta" }, { value: "ctrl-right", label: "Ctrl", size: "meta" }, GAP,
    { value: "left", label: "←" }, { value: "down", label: "↓" }, { value: "right", label: "→" }, GAP,
    { value: "num0", label: "0", size: "wide" }, { value: "decimal", label: "." }, { value: "num-enter-lower", label: "Enter" },
  ],
];

export default function LaptopIntro({ ready, leaving, onEnter }) {
  const keyboardRef = useRef(null);
  const [pointedKey, setPointedKey] = useState("");

  function handlePointerMove(event) {
    if (!ready || leaving || !keyboardRef.current) return;
    const rect = keyboardRef.current.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - .5;
    const ny = (event.clientY - rect.top) / rect.height - .5;
    keyboardRef.current.style.setProperty("--intro-kbd-ry", `${nx * 3.2}deg`);
    keyboardRef.current.style.setProperty("--intro-kbd-rx", `${ny * -2.4}deg`);

    const key = event.target.closest(".intro-key:not(.key-spacer)");
    setPointedKey(key?.dataset.keyId || "");
  }

  function resetPointer() {
    setPointedKey("");
    if (!keyboardRef.current) return;
    keyboardRef.current.style.setProperty("--intro-kbd-ry", "0deg");
    keyboardRef.current.style.setProperty("--intro-kbd-rx", "0deg");
  }

  let absoluteIndex = 0;

  return (
    <div className={`entry-split-stage ${ready ? "is-ready" : ""} ${leaving ? "is-leaving" : ""}`}>
      <section className="entry-liquid-screen" aria-label="Keyflow 欢迎屏幕">
        <div className="liquid-glass-refraction" aria-hidden="true" />
        <div className="liquid-glass-highlight" aria-hidden="true" />
        <div className="entry-liquid-content">
          <span>KEYFLOW · FLOW STATE TRAINING</span>
          <h1>找到你的<em>击键节奏。</em></h1>
          <button
            type="button"
            disabled={!ready || leaving}
            onClick={onEnter}
          >
            点击进入练习 <i>→</i>
          </button>
        </div>
      </section>

      <section
        className="entry-keyboard-stage"
        aria-label="可交互的悬浮全尺寸键盘"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <div className="entry-keyboard-aura" aria-hidden="true" />
        <div className="entry-full-keyboard keyboard full-keyboard" ref={keyboardRef}>
          {INTRO_KEYS.map((row, rowIndex) => (
            <div className="key-row" key={rowIndex}>
              {row.map((key, keyIndex) => {
                const keyId = `${rowIndex}-${keyIndex}-${key.value}`;
                const index = absoluteIndex++;
                return (
                  <span
                    className={`${key.spacer ? "key-spacer " : ""}${key.size ? `key-${key.size} ` : ""}${pointedKey === keyId ? "pointer-down" : ""}`}
                    data-key-id={keyId}
                    key={keyId}
                    style={{ "--intro-key-index": index }}
                  >
                    {key.label}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <p className="entry-split-caption">让指尖先认识节奏，再进入专注练习。</p>
    </div>
  );
}
