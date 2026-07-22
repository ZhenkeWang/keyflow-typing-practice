"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TEXT_BANK = {
  focus: [
    "small steps every day create remarkable results over time stay curious keep learning and trust the process",
    "focus grows when you remove the noise and give your full attention to the moment right in front of you",
    "practice builds confidence speed follows accuracy and steady progress always wins against a hurried start",
    "a clear mind calm rhythm and patient hands can turn an ordinary session into your personal best",
    "simple ideas become powerful when they are shaped with care repeated with purpose and shared with clarity",
  ],
  quote: [
    "The secret of getting ahead is getting started. Keep moving, even when the next step feels impossibly small.",
    "Good design is as little design as possible: less, but better, because it concentrates on the essential.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit built one day at a time.",
    "Stay hungry, stay foolish; let curiosity pull you forward when certainty asks you to stand still.",
  ],
  code: [
    "const flow = keys.filter(Boolean).map(key => key.toLowerCase()); return flow.join('-');",
    "function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }",
    "items.forEach((item, index) => console.log(`${index}: ${item.name}`));",
    "if (response.ok) { const data = await response.json(); render(data); }",
    "export const sum = (numbers = []) => numbers.reduce((total, n) => total + n, 0);",
  ],
  numbers: [
    "2048 73 991 42 5608 17 365 8080 24 1024 88 451 9001 36 772 19 2026 55 640 314",
    "12.5 48.9 100 7.25 64 512 3.14 256 81 144 21.6 99.9 4096 16 32 128 0.75",
    "2026-07-22 08:45 404 200 301 127.0.0.1 60 120 30 15 204 500 192.168.1.1",
  ],
};

const MODES = [
  { id: "focus", label: "专注", icon: "Aa", desc: "常用词" },
  { id: "quote", label: "标点", icon: "“ ”", desc: "完整句" },
  { id: "code", label: "代码", icon: "</>", desc: "符号流" },
  { id: "numbers", label: "数字", icon: "123", desc: "数字列" },
];

const KEY_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

function makeText(mode, minLength = 1600) {
  const source = TEXT_BANK[mode];
  let result = "";
  let index = Math.floor(Math.random() * source.length);
  while (result.length < minLength) {
    result += (result ? " " : "") + source[index % source.length];
    index += 1;
  }
  return result;
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function wordCount(value) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function Home() {
  const [mode, setMode] = useState("focus");
  const [testType, setTestType] = useState("time");
  const [goal, setGoal] = useState(60);
  const [text, setText] = useState(() => makeText("focus"));
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState("idle");
  const [now, setNow] = useState(0);
  const [best, setBest] = useState(0);
  const [history, setHistory] = useState([]);
  const [combo, setCombo] = useState(0);
  const [pulse, setPulse] = useState(0);

  const inputRef = useRef(null);
  const startedAt = useRef(0);
  const finishedAt = useRef(0);
  const lastKeyAt = useRef(0);
  const intervals = useRef([]);
  const recorded = useRef(false);

  const correct = useMemo(
    () => [...typed].reduce((sum, char, index) => sum + (char === text[index] ? 1 : 0), 0),
    [typed, text]
  );
  const errors = typed.length - correct;
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  const elapsedMs = startedAt.current
    ? Math.max(0, (status === "finished" ? finishedAt.current : now) - startedAt.current)
    : 0;
  const elapsedSeconds = elapsedMs / 1000;
  const wpm = elapsedSeconds > 0 ? Math.round(correct / 5 / (elapsedSeconds / 60)) : 0;
  const words = wordCount(typed);
  const timeLeft = testType === "time" ? Math.max(0, Math.ceil(goal - elapsedSeconds)) : 0;
  const progress = testType === "time"
    ? Math.min(100, (elapsedSeconds / goal) * 100)
    : Math.min(100, (words / goal) * 100);
  const consistency = useMemo(() => {
    if (intervals.current.length < 4) return 100;
    const recent = intervals.current.slice(-40);
    const mean = recent.reduce((sum, item) => sum + item, 0) / recent.length;
    const variance = recent.reduce((sum, item) => sum + (item - mean) ** 2, 0) / recent.length;
    return Math.max(35, Math.round(100 - (Math.sqrt(variance) / mean) * 55));
  }, [typed]);

  const reset = useCallback((options = {}) => {
    const nextMode = options.mode ?? mode;
    const nextType = options.testType ?? testType;
    const nextGoal = options.goal ?? goal;
    setMode(nextMode);
    setTestType(nextType);
    setGoal(nextGoal);
    setText(makeText(nextMode));
    setTyped("");
    setStatus("idle");
    setNow(0);
    setCombo(0);
    startedAt.current = 0;
    finishedAt.current = 0;
    lastKeyAt.current = 0;
    intervals.current = [];
    recorded.current = false;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [goal, mode, testType]);

  useEffect(() => {
    setBest(Number(localStorage.getItem("keyflow-best")) || 0);
    try {
      setHistory(JSON.parse(localStorage.getItem("keyflow-history") || "[]"));
    } catch {
      setHistory([]);
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      const stamp = Date.now();
      setNow(stamp);
      if (testType === "time" && stamp - startedAt.current >= goal * 1000) {
        finishedAt.current = startedAt.current + goal * 1000;
        setStatus("finished");
      }
    }, 100);
    return () => clearInterval(timer);
  }, [goal, status, testType]);

  useEffect(() => {
    if (status !== "finished" || recorded.current) return;
    recorded.current = true;
    const entry = { wpm, accuracy, mode, consistency, at: Date.now() };
    const nextHistory = [entry, ...history].slice(0, 5);
    setHistory(nextHistory);
    localStorage.setItem("keyflow-history", JSON.stringify(nextHistory));
    if (wpm > best) {
      setBest(wpm);
      localStorage.setItem("keyflow-best", String(wpm));
    }
  }, [accuracy, best, consistency, history, mode, status, wpm]);

  useEffect(() => {
    let tabPressed = false;
    function handleShortcut(event) {
      if (event.key === "Tab") {
        event.preventDefault();
        tabPressed = true;
        window.setTimeout(() => { tabPressed = false; }, 1000);
      } else if (event.key === "Enter" && tabPressed) {
        event.preventDefault();
        tabPressed = false;
        reset();
      } else if (event.key === "Escape") {
        reset();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [reset]);

  function finish() {
    finishedAt.current = Date.now();
    setNow(finishedAt.current);
    setStatus("finished");
  }

  function handleInput(event) {
    if (status === "finished") return;
    const value = event.target.value.replace(/[\r\n]/g, "").slice(0, text.length);
    const stamp = Date.now();
    if (status === "idle" && value.length) {
      startedAt.current = stamp;
      lastKeyAt.current = stamp;
      setNow(stamp);
      setStatus("running");
    } else if (value.length > typed.length) {
      if (lastKeyAt.current) intervals.current.push(stamp - lastKeyAt.current);
      lastKeyAt.current = stamp;
    }

    if (value.length > typed.length) {
      const index = value.length - 1;
      const isCorrect = value[index] === text[index];
      setCombo((current) => isCorrect ? current + 1 : 0);
      setPulse((current) => current + 1);
    } else if (value.length < typed.length) {
      setCombo(0);
    }

    setTyped(value);
    if (testType === "words" && wordCount(value) >= goal) finish();
  }

  const visibleStart = Math.max(0, typed.length - 85);
  const visibleText = text.slice(visibleStart, visibleStart + 360);
  const expectedKey = (text[typed.length] || "").toLowerCase();
  const modeLabel = MODES.find((item) => item.id === mode)?.label;
  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];

  return (
    <main className="app-shell" onClick={() => status !== "finished" && inputRef.current?.focus()}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="nav">
        <a className="brand" href="#" aria-label="Keyflow 首页">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>keyflow<small>LAB</small></span>
        </a>
        <div className="nav-actions">
          <span className="sync-dot"><i /> 本地记录</span>
          <span className="best-pill"><b>⌁</b> BEST <strong>{best}</strong> WPM</span>
          <button className="icon-button" onClick={(event) => { event.stopPropagation(); reset(); }} aria-label="重新开始">↻</button>
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow"><span /> FLOW STATE TRAINING</p>
          <h1>找到你的<span>击键节奏。</span></h1>
        </div>
        <p>让视觉反馈跟上每一次敲击。<br />放松、专注，然后自然加速。</p>
      </section>

      <section className="control-deck">
        <div className="mode-grid">
          {MODES.map((item) => (
            <button
              key={item.id}
              className={`mode-card ${mode === item.id ? "active" : ""}`}
              onClick={(event) => { event.stopPropagation(); reset({ mode: item.id }); }}
            >
              <span className="mode-icon">{item.icon}</span>
              <span><strong>{item.label}</strong><small>{item.desc}</small></span>
              <i />
            </button>
          ))}
        </div>

        <div className="session-controls">
          <div className="type-switch">
            <button className={testType === "time" ? "active" : ""} onClick={(event) => { event.stopPropagation(); reset({ testType: "time", goal: 60 }); }}>计时</button>
            <button className={testType === "words" ? "active" : ""} onClick={(event) => { event.stopPropagation(); reset({ testType: "words", goal: 25 }); }}>定量</button>
          </div>
          <div className="goal-options">
            {(testType === "time" ? timeOptions : wordOptions).map((item) => (
              <button key={item} className={goal === item ? "active" : ""} onClick={(event) => { event.stopPropagation(); reset({ goal: item }); }}>
                {testType === "time" ? (item === 120 ? "2m" : `${item}s`) : `${item}词`}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={`practice-card ${status} ${errors > 0 && typed.at(-1) !== text[typed.length - 1] ? "has-error" : ""}`}>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <div className="card-topline">
          <span className={`live-status ${status}`}><i /> {status === "idle" ? "READY" : status === "running" ? "LIVE SESSION" : "SESSION COMPLETE"}</span>
          <span>{modeLabel} · {testType === "time" ? `${goal} 秒` : `${goal} 词`}</span>
          <span className="session-index">SESSION / {String(history.length + 1).padStart(2, "0")}</span>
        </div>

        <div className="stats">
          <div className="stat primary" key={`wpm-${pulse}`}><span>WPM</span><strong>{wpm}</strong><small>速度</small></div>
          <div className="stat"><span>ACC</span><strong>{accuracy}<small>%</small></strong><small>准确率</small></div>
          <div className="stat"><span>FLOW</span><strong>{consistency}<small>%</small></strong><small>稳定度</small></div>
          <div className="stat"><span>{testType === "time" ? "TIME" : "WORDS"}</span><strong>{testType === "time" ? formatTime(timeLeft) : `${words}/${goal}`}</strong><small>{testType === "time" ? "剩余" : "进度"}</small></div>
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

          <div className="typing-meta">
            <span>ERRORS <b>{errors}</b></span>
            <span className={`combo ${combo >= 5 ? "hot" : ""}`}>COMBO <b>{combo}</b></span>
          </div>

          <div className="passage" aria-hidden="true">
            {visibleText.split("").map((char, index) => {
              const absolute = visibleStart + index;
              let className = "pending";
              if (absolute < typed.length) className = typed[absolute] === char ? "correct" : "wrong";
              if (absolute === typed.length && status !== "finished") className += " current";
              return <span className={className} key={`${absolute}-${char}`}>{char}</span>;
            })}
          </div>

          {status === "idle" && <div className="start-hint"><span>点击这里或直接开始输入</span><small>首个按键后自动计时</small></div>}

          {status === "finished" && (
            <div className="result-overlay">
              <div className="result-glow" />
              <p>SESSION COMPLETE</p>
              <strong>{wpm}<span>WPM</span></strong>
              <div className="result-details"><span>{accuracy}% 准确</span><i /> <span>{consistency}% 稳定</span><i /> <span>{errors} 错误</span></div>
              <button onClick={(event) => { event.stopPropagation(); reset(); }}>再来一次 <span>↗</span></button>
            </div>
          )}
        </div>

        <div className="keyboard" aria-hidden="true">
          {KEY_ROWS.map((row, rowIndex) => (
            <div className="key-row" key={rowIndex}>
              {row.map((key) => <span className={expectedKey === key ? "next" : ""} key={key}>{key}</span>)}
            </div>
          ))}
          <div className="key-row"><span className={`space-key ${expectedKey === " " ? "next" : ""}`}>SPACE</span></div>
        </div>

        <footer className="card-footer">
          <span><kbd>Tab</kbd><b>+</b><kbd>Enter</kbd> 重开</span>
          <span><kbd>Esc</kbd> 重置</span>
          <span>每一次敲击，都是进步。</span>
        </footer>
      </section>

      <section className="history-section">
        <div className="section-heading"><span>RECENT SESSIONS</span><small>最近记录保存在此设备</small></div>
        <div className="history-list">
          {history.length ? history.map((item, index) => (
            <div className="history-item" key={item.at}>
              <span className="history-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="history-mode">{MODES.find((entry) => entry.id === item.mode)?.label || "专注"}</span>
              <strong>{item.wpm}<small>WPM</small></strong>
              <span>{item.accuracy}% ACC</span>
              <span>{item.consistency}% FLOW</span>
            </div>
          )) : <div className="empty-history">完成第一轮练习后，成绩会出现在这里。</div>}
        </div>
      </section>

      <footer className="page-footer"><span>KEYFLOW / LAB</span><p>DESIGNED FOR DEEP FOCUS · 2026</p></footer>
    </main>
  );
}
