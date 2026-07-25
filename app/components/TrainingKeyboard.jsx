"use client";

import { memo } from "react";

const ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace"],
  ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"],
  ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift-right"],
  ["ctrl", "alt", " ", "alt-right", "ctrl-right"],
];

const LABELS = {
  backspace: "⌫",
  tab: "Tab",
  caps: "Caps",
  enter: "Enter",
  shift: "Shift",
  "shift-right": "Shift",
  ctrl: "Ctrl",
  "ctrl-right": "Ctrl",
  alt: "Alt",
  "alt-right": "Alt",
  " ": "Space",
};

function TrainingKeyboard({ expectedKey, activeKey, pulse, feedback, compact = false }) {
  return (
    <div className={`training-keyboard ${compact ? "compact" : ""}`} aria-label="虚拟键盘">
      <div className="training-keyboard-status">
        <span><i /> NEXT KEY</span>
        <strong>{expectedKey === " " ? "SPACE" : expectedKey || "—"}</strong>
      </div>
      <div className="training-keyboard-rows">
        {ROWS.map((row, rowIndex) => (
          <div className="training-keyboard-row" key={rowIndex}>
            {row.map((key, keyIndex) => {
              const isActive = activeKey === key;
              const isNext = expectedKey === key;
              return (
                <span
                  className={`${isActive ? `active ${feedback}` : ""} ${isNext ? "next" : ""} ${key === " " ? "space" : ""} ${["backspace", "tab", "caps", "enter", "shift", "shift-right"].includes(key) ? "wide" : ""}`}
                  key={`${rowIndex}-${keyIndex}-${key}-${isActive ? pulse : "idle"}`}
                >
                  {LABELS[key] || key.toUpperCase()}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(TrainingKeyboard);
