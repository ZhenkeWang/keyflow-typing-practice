"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const passages = [
  "small steps every day create remarkable results over time stay curious keep learning and trust the process",
  "the quiet morning light moves across the room while fresh ideas wait patiently for a place on the page",
  "focus is not about doing more things it is about giving your full attention to the one thing that matters now",
  "good design feels simple because every detail has been considered every choice has a clear reason and purpose",
  "practice builds confidence speed follows accuracy and steady progress always wins against a hurried beginning",
  "a clear mind a calm rhythm and a little patience can turn an ordinary session into your personal best",
];

const durations = [30, 60, 120];

function makeText(minLength = 900) {
  let result = "";
  let index = Math.floor(Math.random() * passages.length);
  while (result.length < minLength) {
    result += (result ? " " : "") + passages[index % passages.length];
    index += 1;
  }
  return result;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export default function Home() {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [text, setText] = useState(() => makeText());
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState("idle");
  const [best, setBest] = useState(0);
  const inputRef = useRef(null);
  const startedAt = useRef(null);

  const correct = useMemo(
    () => [...typed].reduce((sum, char, index) => sum + (char === text[index] ? 1 : 0), 0),
    [typed, text]
  );
  const errors = typed.length - correct;
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  const elapsed = status === "idle" ? 0 : Math.max(1, duration - timeLeft);
  const wpm = elapsed ? Math.round(correct / 5 / (elapsed / 60)) : 0;

  const reset = useCallback((nextDuration = duration) => {
    setDuration(nextDuration);
    setTimeLeft(nextDuration);
    setText(makeText());
    setTyped("");
    setStatus("idle");
    startedAt.current = null;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [duration]);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("keyflow-best")) || 0;
    setBest(saved);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      const passed = Math.floor((Date.now() - startedAt.current) / 1000);
      const remaining = Math.max(0, duration - passed);
      setTimeLeft(remaining);
      if (remaining === 0) setStatus("finished");
    }, 200);
    return () => window.clearInterval(timer);
  }, [status, duration]);

  useEffect(() => {
    if (status === "finished" && wpm > best) {
      setBest(wpm);
      window.localStorage.setItem("keyflow-best", String(wpm));
    }
  }, [status, wpm, best]);

  useEffect(() => {
    let tabPressed = false;
    function handleShortcut(event) {
      if (event.key === "Tab") {
        tabPressed = true;
        window.setTimeout(() => { tabPressed = false; }, 1200);
      } else if (event.key === "Enter" && tabPressed) {
        event.preventDefault();
        tabPressed = false;
        reset();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [reset]);

  function handleInput(event) {
    if (status === "finished") return;
    const value = event.target.value.replace(/[\r\n]/g, "");
    if (status === "idle" && value.length) {
      startedAt.current = Date.now();
      setStatus("running");
    }
    setTyped(value.slice(0, text.length));
  }

  const visibleStart = Math.max(0, typed.length - 100);
  const visibleText = text.slice(visibleStart, visibleStart + 340);

  return (
    <main className="shell" onClick={() => status !== "finished" && inputRef.current?.focus()}>
      <header className="nav">
        <a className="brand" href="#" aria-label="Keyflow 首页">
          <span className="brand-mark">K</span>
          <span>keyflow</span>
        </a>
        <div className="nav-actions">
          <span className="best-pill"><span>◆</span> 最佳 {best} WPM</span>
          <button className="icon-button" onClick={(event) => { event.stopPropagation(); reset(); }} aria-label="重新开始">↻</button>
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow"><span /> TYPING PRACTICE</p>
        <h1>让指尖找到<br /><em>自己的节奏。</em></h1>
        <p className="subtitle">专注当下，准确输入。速度会自然跟上。</p>
      </section>

      <section className="practice-card">
        <div className="toolbar">
          <div className="modes" aria-label="练习时长">
            {durations.map((item) => (
              <button
                key={item}
                className={duration === item ? "active" : ""}
                onClick={(event) => { event.stopPropagation(); reset(item); }}
              >
                {item === 120 ? "2 分钟" : `${item} 秒`}
              </button>
            ))}
          </div>
          <span className={`status ${status}`}><i /> {status === "finished" ? "已完成" : status === "running" ? "计时中" : "准备就绪"}</span>
        </div>

        <div className="stats">
          <div className="stat primary"><span>速度</span><strong>{wpm}</strong><small>WPM</small></div>
          <div className="stat"><span>准确率</span><strong>{accuracy}<small>%</small></strong></div>
          <div className="stat"><span>错字</span><strong>{errors}</strong></div>
          <div className="stat timer"><span>剩余时间</span><strong>{formatTime(timeLeft)}</strong></div>
        </div>

        <div className="typing-zone">
          <textarea
            ref={inputRef}
            value={typed}
            onChange={handleInput}
            disabled={status === "finished"}
            aria-label="打字输入区域"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
          <div className="passage" aria-hidden="true">
            {visibleText.split("").map((char, index) => {
              const absolute = visibleStart + index;
              let className = "pending";
              if (absolute < typed.length) className = typed[absolute] === char ? "correct" : "wrong";
              if (absolute === typed.length && status !== "finished") className += " current";
              return <span className={className} key={`${absolute}-${char}`}>{char}</span>;
            })}
          </div>
          {status === "idle" && <p className="hint"><kbd>开始输入</kbd><span>计时器将在第一次按键时启动</span></p>}
          {status === "finished" && (
            <div className="result-overlay">
              <p>本轮完成</p>
              <strong>{wpm} <span>WPM</span></strong>
              <button onClick={(event) => { event.stopPropagation(); reset(); }}>再来一次 <span>→</span></button>
            </div>
          )}
        </div>

        <footer className="card-footer">
          <span><kbd>Tab</kbd> + <kbd>Enter</kbd> 重新开始</span>
          <span>每一次敲击，都是进步。</span>
        </footer>
      </section>

      <footer className="page-footer"><span>KEYFLOW</span><p>Built for focus · 2026</p></footer>
    </main>
  );
}
