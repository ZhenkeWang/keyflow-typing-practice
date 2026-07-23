"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Aurora from "./components/Aurora";

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
  chinese: [
    "真正的专注不是隔绝所有声音，而是在纷繁世界里，依然能够听见自己清晰而稳定的节奏。",
    "每一次练习都不必追求完美，保持准确，放松双手，速度会在不知不觉中慢慢提升。",
    "清晨的光穿过窗帘，桌面安静而整洁，新的一天正等待我们写下认真而从容的故事。",
    "好的习惯来自微小的重复，当动作变得自然，思考便可以走得更远，看见更多可能。",
    "山川湖海各有自己的方向，文字也有独特的温度，耐心输入，让想法准确地抵达。",
  ],
  news: [
    "城市公共空间正在变得更加开放与友好，新的生活方式也在街巷之间自然生长。",
    "人工智能工具逐渐融入日常工作，人们开始重新思考效率、创造力与协作的关系。",
    "健康生活、绿色出行和周末短途旅行，正在成为越来越多人关注的生活话题。",
  ],
};

const MODES = [
  { id: "focus", label: "专注", icon: "Aa", desc: "常用词" },
  { id: "quote", label: "标点", icon: "“ ”", desc: "完整句" },
  { id: "code", label: "代码", icon: "</>", desc: "符号流" },
  { id: "numbers", label: "数字", icon: "123", desc: "数字列" },
  { id: "chinese", label: "中文", icon: "中", desc: "中文段落" },
  { id: "news", label: "热点", icon: "↗", desc: "实时内容" },
];

const INTERACTIONS = [
  { id: "standard", label: "标准", desc: "自由修正" },
  { id: "focus", label: "聚焦", desc: "高亮当前" },
  { id: "sprint", label: "冲刺", desc: "禁止回删" },
  { id: "zen", label: "禅意", desc: "隐藏数据" },
];

const FEED_SOURCES = [
  { id: "news", label: "全球新闻", detail: "实时媒体标题" },
  { id: "hot", label: "中文热榜", detail: "近期关注话题" },
  { id: "tech", label: "科技趋势", detail: "开发者热议" },
];

const KEY_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const SPARKS = [
  [-34, -22, 0, 5], [-12, -36, 18, 3], [15, -34, 30, 5], [36, -16, 12, 3],
  [39, 12, 36, 4], [22, 33, 8, 3], [-5, 38, 26, 5], [-31, 27, 40, 3],
  [-42, 3, 22, 4], [-21, -8, 46, 3], [18, 8, 32, 4], [2, -18, 14, 3],
];

function makeText(mode, minLength = 1600) {
  const source = TEXT_BANK[mode];
  let result = "";
  let index = Math.floor(Math.random() * source.length);
  while (result.length < minLength) {
    result += (result ? (["chinese", "news"].includes(mode) ? "" : " ") : "") + source[index % source.length];
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

function isChineseContent(mode, newsSource) {
  return mode === "chinese" || (mode === "news" && newsSource !== "tech");
}

function unitCount(value, mode, newsSource) {
  return isChineseContent(mode, newsSource) ? [...value.replace(/\s/g, "")].length : wordCount(value);
}

function makeLiveText(items, source, minLength = 1600) {
  const sentences = items.map((item) => source === "hot" ? `“${item}”成为近期受到关注的话题。` : item.replace(/[。.!?？]$/, "") + (source === "tech" ? "." : "。"));
  let result = "";
  let index = 0;
  while (result.length < minLength && sentences.length) {
    const separator = result ? (source === "tech" ? " " : "") : "";
    result += separator + sentences[index % sentences.length];
    index += 1;
  }
  return result;
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
  const [draft, setDraft] = useState("");
  const [pkPlayer, setPkPlayer] = useState(1);
  const [pkScores, setPkScores] = useState({ 1: null, 2: null });
  const [interaction, setInteraction] = useState("standard");
  const [feedback, setFeedback] = useState("correct");
  const [newsSource, setNewsSource] = useState("news");
  const [feedStatus, setFeedStatus] = useState("idle");
  const [feedUpdated, setFeedUpdated] = useState("");
  const [theme, setTheme] = useState("dark");

  const inputRef = useRef(null);
  const startedAt = useRef(0);
  const finishedAt = useRef(0);
  const lastKeyAt = useRef(0);
  const intervals = useRef([]);
  const recorded = useRef(false);
  const composing = useRef(false);

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
  const chineseContent = isChineseContent(mode, newsSource);
  const metric = chineseContent ? "CPM" : "WPM";
  const wpm = elapsedSeconds > 0
    ? Math.round((chineseContent ? correct : correct / 5) / (elapsedSeconds / 60))
    : 0;
  const words = unitCount(typed, mode, newsSource);
  const timeLeft = testType !== "words" ? Math.max(0, Math.ceil(goal - elapsedSeconds)) : 0;
  const progress = testType !== "words"
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
    setDraft("");
    setStatus("idle");
    setNow(0);
    setCombo(0);
    setFeedback("correct");
    setPkPlayer(1);
    setPkScores({ 1: null, 2: null });
    setBest(Number(localStorage.getItem(`keyflow-best-${nextMode}`)) || (nextMode === "focus" ? Number(localStorage.getItem("keyflow-best")) || 0 : 0));
    startedAt.current = 0;
    finishedAt.current = 0;
    lastKeyAt.current = 0;
    intervals.current = [];
    recorded.current = false;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [goal, mode, testType]);

  useEffect(() => {
    setBest(Number(localStorage.getItem("keyflow-best-focus")) || Number(localStorage.getItem("keyflow-best")) || 0);
    try {
      setHistory(JSON.parse(localStorage.getItem("keyflow-history") || "[]"));
    } catch {
      setHistory([]);
    }
    const savedTheme = localStorage.getItem("keyflow-theme");
    setTheme(savedTheme || "dark");
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("keyflow-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (mode !== "news") return;
    const controller = new AbortController();
    setFeedStatus("loading");
    fetch(`/api/trending?source=${newsSource}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Feed unavailable");
        return response.json();
      })
      .then((data) => {
        if (startedAt.current === 0 && data.items?.length) setText(makeLiveText(data.items, newsSource));
        setFeedUpdated(data.updatedAt || "");
        setFeedStatus(data.fallback ? "fallback" : "live");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFeedStatus("fallback");
      });
    return () => controller.abort();
  }, [mode, newsSource]);

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      const stamp = Date.now();
      setNow(stamp);
      if (testType !== "words" && stamp - startedAt.current >= goal * 1000) {
        finishedAt.current = startedAt.current + goal * 1000;
        setStatus("finished");
      }
    }, 100);
    return () => clearInterval(timer);
  }, [goal, status, testType]);

  useEffect(() => {
    if (status !== "finished" || recorded.current) return;
    recorded.current = true;
    const entry = { wpm, accuracy, mode, metric, consistency, at: Date.now(), player: testType === "pk" ? pkPlayer : null };
    const nextHistory = [entry, ...history].slice(0, 5);
    setHistory(nextHistory);
    localStorage.setItem("keyflow-history", JSON.stringify(nextHistory));
    if (testType === "pk") setPkScores((scores) => ({ ...scores, [pkPlayer]: entry }));
    if (wpm > best) {
      setBest(wpm);
      localStorage.setItem(`keyflow-best-${mode}`, String(wpm));
      if (mode === "focus") localStorage.setItem("keyflow-best", String(wpm));
    }
  }, [accuracy, best, consistency, history, metric, mode, pkPlayer, status, testType, wpm]);

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

  function processInput(value) {
    if (status === "finished") return;
    value = value.replace(/[\r\n]/g, "").slice(0, text.length);
    if (interaction === "sprint" && value.length < typed.length) return;
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
      setFeedback(isCorrect ? "correct" : "wrong");
      setPulse((current) => current + 1);
    } else if (value.length < typed.length) {
      setCombo(0);
    }

    setTyped(value);
    if (testType === "words" && unitCount(value, mode, newsSource) >= goal) finish();
  }

  function handleInput(event) {
    const value = event.target.value;
    if (composing.current) {
      setDraft(value.slice(typed.length));
      return;
    }
    processInput(value);
  }

  function advancePk() {
    setPkPlayer(2);
    setTyped("");
    setDraft("");
    setStatus("idle");
    setNow(0);
    setCombo(0);
    startedAt.current = 0;
    finishedAt.current = 0;
    lastKeyAt.current = 0;
    intervals.current = [];
    recorded.current = false;
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const visibleStart = Math.max(0, typed.length - 85);
  const visibleText = text.slice(visibleStart, visibleStart + 360);
  const expectedKey = (text[typed.length] || "").toLowerCase();
  const modeLabel = MODES.find((item) => item.id === mode)?.label;
  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];
  const pkOptions = [15, 30, 60];
  const pkWinner = pkScores[1] && pkScores[2]
    ? pkScores[1].wpm === pkScores[2].wpm
      ? pkScores[1].accuracy === pkScores[2].accuracy ? 0 : pkScores[1].accuracy > pkScores[2].accuracy ? 1 : 2
      : pkScores[1].wpm > pkScores[2].wpm ? 1 : 2
    : null;
  const focusStart = chineseContent ? typed.length : text.lastIndexOf(" ", Math.max(0, typed.length - 1)) + 1;
  const nextSpace = chineseContent ? typed.length + 8 : text.indexOf(" ", typed.length);
  const focusEnd = nextSpace === -1 ? text.length : nextSpace;

  return (
    <main className={`app-shell theme-${theme}`} onClick={() => status !== "finished" && inputRef.current?.focus()}>
      <div className="aurora-backdrop">
        <Aurora
          colorStops={theme === "light" ? ["#b8a9ff", "#8de5d1", "#b9c8ff"] : ["#7667ff", "#47d7bf", "#5363e8"]}
          amplitude={theme === "light" ? 0.56 : 0.72}
          blend={theme === "light" ? 0.48 : 0.58}
        />
      </div>
      <div className="background-wash" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="nav">
        <a className="brand" href="#" aria-label="Keyflow 首页">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>keyflow<small>LAB</small></span>
        </a>
        <div className="nav-actions">
          <span className="sync-dot"><i /> 本地记录</span>
          <span className="best-pill"><b>⌁</b> BEST <strong>{best}</strong> {metric}</span>
          <button
            className="icon-button theme-toggle"
            onClick={(event) => {
              event.stopPropagation();
              setTheme((current) => current === "dark" ? "light" : "dark");
            }}
            aria-label={theme === "dark" ? "切换到浅色主题" : "切换到深色主题"}
            title={theme === "dark" ? "浅色主题" : "深色主题"}
          >{theme === "dark" ? "☼" : "☾"}</button>
          <button className="icon-button" onClick={(event) => { event.stopPropagation(); reset(); }} aria-label="重新开始">↻</button>
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow"><span /> FLOW STATE TRAINING</p>
          <h1 className="art-title">找到你的<span>击键节奏。</span></h1>
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
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
              }}
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
            <button className={testType === "pk" ? "active" : ""} onClick={(event) => { event.stopPropagation(); reset({ testType: "pk", goal: 30 }); }}>本地 PK</button>
          </div>
          <div className="goal-options">
            {(testType === "time" ? timeOptions : testType === "pk" ? pkOptions : wordOptions).map((item) => (
              <button key={item} className={goal === item ? "active" : ""} onClick={(event) => { event.stopPropagation(); reset({ goal: item }); }}>
                {testType !== "words" ? (item === 120 ? "2m" : `${item}s`) : `${item}${chineseContent ? "字" : "词"}`}
              </button>
            ))}
          </div>
          <div className="interaction-switch" aria-label="交互方式">
            {INTERACTIONS.map((item) => (
              <button
                key={item.id}
                className={interaction === item.id ? "active" : ""}
                title={item.desc}
                onClick={(event) => { event.stopPropagation(); setInteraction(item.id); reset(); }}
              ><strong>{item.label}</strong><small>{item.desc}</small></button>
            ))}
          </div>
        </div>

        {mode === "news" && (
          <div className="feed-bar">
            <div className={`feed-live ${feedStatus}`}><i /> {feedStatus === "loading" ? "正在更新内容" : feedStatus === "live" ? "实时内容已更新" : "当前使用备用内容"}</div>
            <div className="feed-options">
              {FEED_SOURCES.map((item) => (
                <button key={item.id} className={newsSource === item.id ? "active" : ""} onClick={(event) => { event.stopPropagation(); setNewsSource(item.id); reset({ mode: "news" }); }}>
                  <strong>{item.label}</strong><small>{item.detail}</small>
                </button>
              ))}
            </div>
            <span>{feedUpdated ? `更新于 ${new Date(feedUpdated).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}` : "连接公开数据源"}</span>
          </div>
        )}
      </section>

      <section className={`practice-card ${status} interaction-${interaction} ${errors > 0 && typed.at(-1) !== text[typed.length - 1] ? "has-error" : ""}`}>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <div className="card-topline">
          <span className={`live-status ${status}`}><i /> {status === "idle" ? "READY" : status === "running" ? "LIVE SESSION" : "SESSION COMPLETE"}</span>
          <span>{modeLabel} · {INTERACTIONS.find((item) => item.id === interaction)?.label} · {testType !== "words" ? `${goal} 秒` : `${goal} ${chineseContent ? "字" : "词"}`}</span>
          <span className="session-index">{testType === "pk" ? `PLAYER ${pkPlayer} / 2` : `SESSION / ${String(history.length + 1).padStart(2, "0")}`}</span>
        </div>

        <div className="stats">
          <div className="stat primary" key={`wpm-${pulse}`}><span>{metric}</span><strong>{wpm}</strong><small>速度</small></div>
          <div className="stat"><span>ACC</span><strong>{accuracy}<small>%</small></strong><small>准确率</small></div>
          <div className="stat"><span>FLOW</span><strong>{consistency}<small>%</small></strong><small>稳定度</small></div>
          <div className="stat"><span>{testType === "words" ? (chineseContent ? "CHARS" : "WORDS") : "TIME"}</span><strong>{testType === "words" ? `${words}/${goal}` : formatTime(timeLeft)}</strong><small>{testType === "words" ? "进度" : "剩余"}</small></div>
        </div>

        <div className="typing-zone">
          <textarea
            ref={inputRef}
            value={typed + draft}
            onChange={handleInput}
            onCompositionStart={() => { composing.current = true; }}
            onCompositionEnd={(event) => {
              composing.current = false;
              setDraft("");
              processInput(event.currentTarget.value);
            }}
            disabled={status === "finished"}
            aria-label="打字输入区域"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <div className="typing-meta">
            <span>ERRORS <b>{errors}</b></span>
            <span className={`combo ${combo >= 5 ? "hot" : ""}`}>COMBO <b>{combo}</b></span>
            <span className="interaction-label">{INTERACTIONS.find((item) => item.id === interaction)?.desc}</span>
          </div>

          {pulse > 0 && status === "running" && <span className={`key-burst ${feedback}`} key={pulse}>{feedback === "correct" ? "+1" : "×"}</span>}
          {pulse > 0 && status === "running" && (
            <span className={`spark-burst ${feedback}`} key={`spark-${pulse}`} aria-hidden="true">
              <i className="spark-core" />
              {SPARKS.map(([x, y, delay, size], index) => (
                <i
                  className="spark"
                  key={index}
                  style={{ "--spark-x": `${x}px`, "--spark-y": `${y}px`, "--spark-delay": `${delay}ms`, "--spark-size": `${size}px` }}
                />
              ))}
            </span>
          )}

          <div className={`passage ${mode}`} aria-hidden="true">
            {visibleText.split("").map((char, index) => {
              const absolute = visibleStart + index;
              let className = "pending";
              if (absolute < typed.length) className = typed[absolute] === char ? "correct" : "wrong";
              if (absolute === typed.length && status !== "finished") className += " current";
              if (absolute >= focusStart && absolute <= focusEnd) className += " focus-range";
              return <span className={className} key={`${absolute}-${char}`}>{char}</span>;
            })}
          </div>

          {status === "idle" && <div className="start-hint"><span>{testType === "pk" ? `玩家 ${pkPlayer} 准备好后开始输入` : "点击这里或直接开始输入"}</span><small>{chineseContent ? "支持拼音与五笔输入法" : interaction === "sprint" ? "冲刺模式无法使用退格键" : "首个按键后自动计时"}</small></div>}

          {status === "finished" && (
            <div className="result-overlay">
              <div className="result-glow" />
              <p>{testType === "pk" ? `PLAYER ${pkPlayer} COMPLETE` : "SESSION COMPLETE"}</p>
              <strong>{wpm}<span>{metric}</span></strong>
              <div className="result-details"><span>{accuracy}% 准确</span><i /> <span>{consistency}% 稳定</span><i /> <span>{errors} 错误</span></div>
              {testType === "pk" && pkPlayer === 2 && (
                <div className="pk-result">
                  <div className={pkWinner === 1 ? "winner" : ""}><small>玩家 1</small><b>{pkScores[1]?.wpm ?? 0}</b><span>{metric}</span></div>
                  <i>VS</i>
                  <div className={pkWinner === 2 ? "winner" : ""}><small>玩家 2</small><b>{pkScores[2]?.wpm ?? wpm}</b><span>{metric}</span></div>
                  <p>{pkWinner === 0 ? "平局！节奏完全一致" : pkWinner ? `玩家 ${pkWinner} 获胜` : "正在计算结果"}</p>
                </div>
              )}
              {testType === "pk" && pkPlayer === 1
                ? <button onClick={(event) => { event.stopPropagation(); advancePk(); }}>交给玩家 2 <span>→</span></button>
                : <button onClick={(event) => { event.stopPropagation(); reset(); }}>{testType === "pk" ? "再战一局" : "再来一次"} <span>↗</span></button>}
            </div>
          )}
        </div>

        {chineseContent ? <div className="ime-panel"><span>中</span><div><strong>{mode === "news" ? "实时中文内容已就绪" : "中文输入已就绪"}</strong><small>使用系统输入法完成文字上屏后，系统将逐字计算速度与准确率。</small></div></div> : <div className="keyboard" aria-hidden="true">
          {KEY_ROWS.map((row, rowIndex) => (
            <div className="key-row" key={rowIndex}>
              {row.map((key) => <span className={expectedKey === key ? "next" : ""} key={key}>{key}</span>)}
            </div>
          ))}
          <div className="key-row"><span className={`space-key ${expectedKey === " " ? "next" : ""}`}>SPACE</span></div>
        </div>}

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
              <span className="history-mode">{item.player ? `玩家 ${item.player} · ` : ""}{MODES.find((entry) => entry.id === item.mode)?.label || "专注"}</span>
              <strong>{item.wpm}<small>{item.metric || "WPM"}</small></strong>
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
