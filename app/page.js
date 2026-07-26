"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Aurora from "./components/Aurora";
import LandingHero from "./components/LandingHero";
import ErrorAnalysis from "./components/ErrorAnalysis";
import SessionResult from "./components/SessionResult";
import TrainingDashboard from "./components/TrainingDashboard";
import AITrainingReport from "./components/AITrainingReport";
import TrainingKeyboard from "./components/TrainingKeyboard";
import TrainingIntelligence from "./components/TrainingIntelligence";
import TrainingMetrics from "./components/TrainingMetrics";
import GrowthNotifications from "./components/GrowthNotifications";
import ThemeRuntime from "./components/ThemeRuntime";
import PwaRuntime from "./components/PwaRuntime";
import CloudSyncRuntime from "./components/CloudSyncRuntime";
import { useAiCoachStore } from "./stores/aiCoachStore";
import ScrollRevealController from "./animations/ScrollRevealController";
import {
  buildDailyMissions,
  calculatePracticeStreak,
  calculateSessionRewards,
  getAchievements,
  getGrowthLevelInfo,
} from "./utils/growthEngine";
import {
  aggregateCharacterStats,
  appendMistakes,
  buildErrorPatterns,
  buildFingerHeatmap,
  buildFocusedWeakKeyText,
  buildPersonalTrainingPlan,
  buildTrainingReport,
  buildWeakKeyRanking,
  buildWeakKeyText,
  calculateCodeMetrics,
  calculateConsistency,
  calculateRhythmBpm,
  calculateRhythmScore,
  calculateTypingMetrics,
  getLevelInfo,
  normalizeHistory,
  summarizeReactionTime,
} from "./utils/typingEngine";

const SaaSControlCenter = lazy(() => import("./components/SaaSControlCenter"));

const TEXT_BANK = {
  speed: [
    "speed comes from relaxed hands clear focus and thousands of accurate repetitions",
    "move quickly through familiar words while keeping every keystroke light and precise",
    "fast typing feels effortless when your eyes stay ahead and your hands trust the rhythm",
  ],
  ai: [
    "intelligent practice adapts to every hesitation repeated error and improving rhythm",
    "train the weakest key first then carry the new control into combinations and complete sentences",
    "small accurate corrections build durable muscle memory and make fast typing feel natural",
  ],
  accuracy: [
    "thinking through the transition brings lasting precision to every typing session",
    "the quick rhythm of writing improves when each combination lands in the right order",
    "practice action station motion typing flowing bring thing through thought",
  ],
  weak: [
    "quality people sequence practice precision query pixel project keyboard flow",
  ],
  rhythm: [
    "breathe and type keep the beat steady hands move lightly thoughts move freely",
    "one clear key at a time creates a calm continuous rhythm across the keyboard",
    "steady motion steady focus steady breathing every keystroke arrives on time",
  ],
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

const CODE_BANK = {
  python: [
    "def train_model(data):\n    result = model.fit(data)\n    return result",
    "scores = [value * 2 for value in results if value > 0]",
    "with open('notes.txt', 'r') as file: content = file.read()",
  ],
  javascript: [
    "const train = (items) => {\n  return items.filter(Boolean).map((item) => item.value);\n};",
    "if (response.ok) {\n  const data = await response.json();\n  render(data);\n}",
    "export const sum = (numbers = []) => numbers.reduce((total, value) => total + value, 0);",
  ],
  cpp: [
    "std::vector<int> values = {1, 2, 3};\nfor (const auto& value : values) {\n    std::cout << value;\n}",
    "for (const auto& item : values) { std::cout << item; }",
    "int clamp(int value, int low, int high) { return std::min(std::max(value, low), high); }",
  ],
  java: [
    "public boolean isReady() { return status == Status.READY; }",
    "List<String> names = items.stream().map(Item::getName).toList();",
    "for (int index = 0; index < values.length; index++) { total += values[index]; }",
  ],
  shell: [
    "git status --short && npm run build",
    "find ./src -type f -name '*.js' | sort",
    "for file in *.log; do echo \"$file\"; done",
  ],
  sql: [
    "SELECT user_id, COUNT(*) AS sessions FROM practice_records GROUP BY user_id ORDER BY sessions DESC;",
    "WITH recent AS (SELECT * FROM sessions WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') SELECT AVG(wpm) FROM recent;",
    "UPDATE typing_profiles SET level = level + 1, xp = xp - 1000 WHERE user_id = 42;",
  ],
  rust: [
    "fn clamp(value: i32, min: i32, max: i32) -> i32 {\n    value.max(min).min(max)\n}",
    "let active: Vec<_> = items.iter().filter(|item| item.ready).collect();",
    "match result {\n    Ok(value) => println!(\"{value}\"),\n    Err(error) => eprintln!(\"{error}\"),\n}",
  ],
};

const NUMBER_BANK = {
  mixed: TEXT_BANK.numbers,
  network: [
    "192.168.1.100 10.0.0.24 255.255.255.0 172.16.0.1 8.8.8.8",
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334 127.0.0.1 8080 443 3000",
  ],
  date: [
    "2026-07-24 09:30 2027-01-01 18:45 2025-12-31 23:59",
    "07/24/2026 24-07-2026 2026.07.24 09:30:45 UTC+8",
  ],
  formula: [
    "E = mc^2 x = (-b + sqrt(b^2 - 4ac)) / 2a 3.14159 * r^2",
    "a^2 + b^2 = c^2 f(x) = 2x + 1 12.5% + 87.5% = 100%",
  ],
};

const MODES = [
  { id: "ai", label: "AI Training", icon: "✦", desc: "个性化训练方案" },
  { id: "speed", label: "Speed Test", icon: "↗", desc: "突破最高 WPM" },
  { id: "accuracy", label: "Accuracy", icon: "◎", desc: "字符组合准确率" },
  { id: "weak", label: "Weak Keys", icon: "⌁", desc: "历史薄弱按键" },
  { id: "code", label: "Coding", icon: "</>", desc: "程序语言输入" },
  { id: "rhythm", label: "Rhythm", icon: "◉", desc: "BPM 节奏稳定" },
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

const KEY_GAP = { value: "gap", label: "", size: "cluster", spacer: true };
const KEY_BLANK = { value: "blank", label: "", spacer: true };

const KEY_ROWS = [
  [
    { value: "escape", label: "Esc" }, KEY_GAP,
    { value: "f1", label: "F1" }, { value: "f2", label: "F2" }, { value: "f3", label: "F3" }, { value: "f4", label: "F4" }, KEY_GAP,
    { value: "f5", label: "F5" }, { value: "f6", label: "F6" }, { value: "f7", label: "F7" }, { value: "f8", label: "F8" }, KEY_GAP,
    { value: "f9", label: "F9" }, { value: "f10", label: "F10" }, { value: "f11", label: "F11" }, { value: "f12", label: "F12" }, KEY_GAP,
    { value: "printscreen", label: "PrtSc" }, { value: "scrolllock", label: "ScrLk" }, { value: "pause", label: "Pause" },
  ],
  [
    { value: "`", label: "`" }, { value: "1", label: "1" }, { value: "2", label: "2" },
    { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" },
    { value: "6", label: "6" }, { value: "7", label: "7" }, { value: "8", label: "8" },
    { value: "9", label: "9" }, { value: "0", label: "0" }, { value: "-", label: "−" },
    { value: "=", label: "=" }, { value: "backspace", label: "⌫", size: "wide" }, KEY_GAP,
    { value: "insert", label: "Ins" }, { value: "home", label: "Home" }, { value: "pageup", label: "PgUp" }, KEY_GAP,
    { value: "numlock", label: "Num" }, { value: "num-divide", label: "/" }, { value: "num-multiply", label: "×" }, { value: "num-minus", label: "−" },
  ],
  [
    { value: "tab", label: "Tab", size: "wide" }, { value: "q", label: "Q" }, { value: "w", label: "W" },
    { value: "e", label: "E" }, { value: "r", label: "R" }, { value: "t", label: "T" },
    { value: "y", label: "Y" }, { value: "u", label: "U" }, { value: "i", label: "I" },
    { value: "o", label: "O" }, { value: "p", label: "P" }, { value: "[", label: "[" },
    { value: "]", label: "]" }, { value: "\\", label: "\\", size: "wide" }, KEY_GAP,
    { value: "delete", label: "Del" }, { value: "end", label: "End" }, { value: "pagedown", label: "PgDn" }, KEY_GAP,
    { value: "num7", label: "7" }, { value: "num8", label: "8" }, { value: "num9", label: "9" }, { value: "num-plus", label: "+" },
  ],
  [
    { value: "caps", label: "Caps", size: "wide" }, { value: "a", label: "A" }, { value: "s", label: "S" },
    { value: "d", label: "D" }, { value: "f", label: "F" }, { value: "g", label: "G" },
    { value: "h", label: "H" }, { value: "j", label: "J" }, { value: "k", label: "K" },
    { value: "l", label: "L" }, { value: ";", label: ";" }, { value: "'", label: "'" },
    { value: "enter", label: "Enter", size: "enter" }, KEY_GAP,
    KEY_BLANK, KEY_BLANK, KEY_BLANK, KEY_GAP,
    { value: "num4", label: "4" }, { value: "num5", label: "5" }, { value: "num6", label: "6" }, { value: "num-plus-lower", label: "+" },
  ],
  [
    { value: "shift", label: "Shift", size: "shift" }, { value: "z", label: "Z" }, { value: "x", label: "X" },
    { value: "c", label: "C" }, { value: "v", label: "V" }, { value: "b", label: "B" },
    { value: "n", label: "N" }, { value: "m", label: "M" }, { value: ",", label: "," },
    { value: ".", label: "." }, { value: "/", label: "/" }, { value: "shift-right", label: "Shift", size: "shift" }, KEY_GAP,
    KEY_BLANK, { value: "arrow-up", label: "↑" }, KEY_BLANK, KEY_GAP,
    { value: "num1", label: "1" }, { value: "num2", label: "2" }, { value: "num3", label: "3" }, { value: "num-enter", label: "Enter" },
  ],
  [
    { value: "ctrl", label: "Ctrl", size: "meta" }, { value: "meta", label: "◆", size: "meta" },
    { value: "alt", label: "Alt", size: "meta" }, { value: " ", label: "Space", size: "space" },
    { value: "alt-right", label: "Alt", size: "meta" }, { value: "fn", label: "Fn", size: "meta" },
    { value: "menu", label: "Menu", size: "meta" }, { value: "ctrl-right", label: "Ctrl", size: "meta" }, KEY_GAP,
    { value: "arrow-left", label: "←" }, { value: "arrow-down", label: "↓" }, { value: "arrow-right", label: "→" }, KEY_GAP,
    { value: "num0", label: "0", size: "wide" }, { value: "num-decimal", label: "." }, { value: "num-enter-lower", label: "Enter" },
  ],
];

const SPARKS = [
  [-24, -18, 0, 3], [-8, -27, 18, 2], [18, -20, 30, 3],
  [26, 10, 12, 2], [-18, 20, 26, 2], [7, 23, 8, 3],
];

const DEFAULT_PROFILE = {
  username: "",
  email: "",
  goal: "accuracy",
  signedIn: false,
};

const TITLE_LINES = ["找到你的", "击键节奏。"];

function makeText(mode, minLength = 1600, variant = "", startIndex = null) {
  const source = mode === "code"
    ? CODE_BANK[variant] || CODE_BANK.javascript
    : mode === "numbers"
      ? NUMBER_BANK[variant] || NUMBER_BANK.mixed
      : TEXT_BANK[mode] || TEXT_BANK.speed;
  let result = "";
  let index = startIndex ?? Math.floor(Math.random() * source.length);
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

function getTimeBasedTheme() {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

export default function Home() {
  const [mode, setMode] = useState("speed");
  const [testType, setTestType] = useState("time");
  const [goal, setGoal] = useState(60);
  // Keep the server and browser's first render identical; subsequent resets
  // still use the randomized starting point for varied practice material.
  const [text, setText] = useState(() => makeText("speed", 1600, "", 0));
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
  const [themePreference, setThemePreference] = useState("auto");
  const [theme, setTheme] = useState("dark");
  const [immersive, setImmersive] = useState(false);
  const [burstPosition, setBurstPosition] = useState({ x: 0, y: 0 });
  const [entryReady, setEntryReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [entryLeaving, setEntryLeaving] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [numberPreset, setNumberPreset] = useState("mixed");
  const [mistakeLog, setMistakeLog] = useState([]);
  const [xpTotal, setXpTotal] = useState(0);
  const [lastXpAward, setLastXpAward] = useState(0);
  const [lastXpBreakdown, setLastXpBreakdown] = useState([]);
  const [leveledUp, setLeveledUp] = useState(false);
  const [claimedMissionIds, setClaimedMissionIds] = useState([]);
  const [growthEvents, setGrowthEvents] = useState([]);
  const [resultView, setResultView] = useState("summary");
  const [rhythmTarget, setRhythmTarget] = useState(90);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedWeakKey, setSelectedWeakKey] = useState("");
  const sessionReview = useAiCoachStore((state) => state.sessionReview);
  const reviewSession = useAiCoachStore((state) => state.review);
  const clearSessionReview = useAiCoachStore((state) => state.clearReview);

  const inputRef = useRef(null);
  const typingZoneRef = useRef(null);
  const passageRef = useRef(null);
  const startedAt = useRef(0);
  const finishedAt = useRef(0);
  const lastKeyAt = useRef(0);
  const intervals = useRef([]);
  const speedTimeline = useRef([]);
  const keystrokes = useRef({ total: 0, incorrect: 0, corrected: 0 });
  const characterStats = useRef({});
  const recorded = useRef(false);
  const composing = useRef(false);
  const appliedTheme = useRef(null);

  const elapsedMs = startedAt.current
    ? Math.max(0, (status === "finished" ? finishedAt.current : now) - startedAt.current)
    : 0;
  const elapsedSeconds = elapsedMs / 1000;
  const typingMetrics = useMemo(() => calculateTypingMetrics({
    typed,
    target: text,
    elapsedMs,
    totalKeystrokes: keystrokes.current.total,
    incorrectKeystrokes: keystrokes.current.incorrect,
  }), [elapsedMs, pulse, text, typed]);
  const {
    correct,
    incorrect: errors,
    wpm,
    rawWpm,
    cpm,
    accuracy,
    errorRate,
  } = typingMetrics;
  const totalErrors = keystrokes.current.incorrect;
  const chineseContent = isChineseContent(mode, newsSource);
  const metric = chineseContent ? "CPM" : "WPM";
  const speed = chineseContent ? cpm : wpm;
  const words = unitCount(typed, mode, newsSource);
  const timeLeft = testType !== "words" ? Math.max(0, Math.ceil(goal - elapsedSeconds)) : 0;
  const progress = testType !== "words"
    ? Math.min(100, (elapsedSeconds / goal) * 100)
    : Math.min(100, (words / goal) * 100);
  const consistency = useMemo(() => calculateConsistency(intervals.current), [pulse, typed]);
  const rhythmBpm = useMemo(() => calculateRhythmBpm(intervals.current), [pulse, typed]);
  const rhythmScore = useMemo(
    () => calculateRhythmScore(intervals.current, rhythmTarget),
    [pulse, rhythmTarget, typed]
  );
  const aggregateStats = useMemo(
    () => aggregateCharacterStats(history, characterStats.current),
    [history, pulse]
  );
  const weakKeyRanking = useMemo(
    () => buildWeakKeyRanking(history, characterStats.current, 10),
    [history, pulse]
  );
  const fingerHeatmap = useMemo(
    () => buildFingerHeatmap(aggregateStats),
    [aggregateStats]
  );
  const reactionTime = useMemo(
    () => summarizeReactionTime(characterStats.current)
      || Math.round(history.find((item) => item.reactionTime)?.reactionTime || 0),
    [history, pulse]
  );
  const codeMetrics = useMemo(
    () => calculateCodeMetrics({
      characterStats: characterStats.current,
      typed,
      target: text,
      elapsedMs,
    }),
    [elapsedMs, pulse, text, typed]
  );
  const aiTrainingPlan = useMemo(
    () => buildPersonalTrainingPlan({
      weakKeys: weakKeyRanking,
      accuracy,
      reactionTime,
      rhythmScore,
    }),
    [accuracy, reactionTime, rhythmScore, weakKeyRanking]
  );
  const errorPatterns = useMemo(
    () => buildErrorPatterns(mistakeLog, text),
    [mistakeLog, text]
  );
  const trainingReport = useMemo(() => buildTrainingReport({
    mistakes: mistakeLog,
    characterStats: characterStats.current,
    accuracy,
    wpm: speed,
    mode,
  }), [accuracy, mistakeLog, mode, pulse, speed]);
  const levelInfo = useMemo(() => getLevelInfo(xpTotal), [xpTotal]);
  const level = levelInfo.level;

  const reset = useCallback((options = {}) => {
    const nextMode = options.mode ?? mode;
    const nextType = options.testType ?? testType;
    const nextGoal = options.goal ?? goal;
    const nextCodeLanguage = options.codeLanguage ?? codeLanguage;
    const nextNumberPreset = options.numberPreset ?? numberPreset;
    const nextRhythmTarget = options.rhythmTarget ?? rhythmTarget;
    const nextWeakKey = options.selectedWeakKey ?? selectedWeakKey;
    setMode(nextMode);
    setTestType(nextType);
    setGoal(nextGoal);
    setCodeLanguage(nextCodeLanguage);
    setNumberPreset(nextNumberPreset);
    setRhythmTarget(nextRhythmTarget);
    setSelectedWeakKey(nextWeakKey);
    setText(
      nextMode === "weak"
        ? nextWeakKey
          ? buildFocusedWeakKeyText(nextWeakKey)
          : buildWeakKeyText(history)
        : nextMode === "ai"
          ? buildWeakKeyText(history)
        : makeText(nextMode, 1600, nextMode === "code" ? nextCodeLanguage : nextNumberPreset)
    );
    setTyped("");
    setDraft("");
    setStatus("idle");
    setNow(0);
    setCombo(0);
    setFeedback("correct");
    setMistakeLog([]);
    setLastXpAward(0);
    setLastXpBreakdown([]);
    setLeveledUp(false);
    setResultView("summary");
    setPkPlayer(1);
    setPkScores({ 1: null, 2: null });
    setBest(
      Number(localStorage.getItem(`keyflow-best-${nextMode}`))
      || (nextMode === "speed"
        ? Number(localStorage.getItem("keyflow-best-focus"))
          || Number(localStorage.getItem("keyflow-best"))
          || 0
        : 0)
    );
    startedAt.current = 0;
    finishedAt.current = 0;
    lastKeyAt.current = 0;
    intervals.current = [];
    speedTimeline.current = [];
    clearSessionReview();
    keystrokes.current = { total: 0, incorrect: 0, corrected: 0 };
    characterStats.current = {};
    recorded.current = false;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [clearSessionReview, codeLanguage, goal, history, mode, numberPreset, rhythmTarget, selectedWeakKey, testType]);

  useEffect(() => {
    setBest(
      Number(localStorage.getItem("keyflow-best-speed"))
      || Number(localStorage.getItem("keyflow-best-focus"))
      || Number(localStorage.getItem("keyflow-best"))
      || 0
    );
    try {
      setHistory(normalizeHistory(JSON.parse(localStorage.getItem("keyflow-history") || "[]")));
    } catch {
      setHistory([]);
    }
    setXpTotal(Number(localStorage.getItem("keyflow-xp")) || 0);
    try {
      const missionState = JSON.parse(localStorage.getItem("keyflow-daily-missions") || "{}");
      const today = new Date().toLocaleDateString("en-CA");
      setClaimedMissionIds(missionState.date === today ? missionState.claimedIds || [] : []);
    } catch {
      setClaimedMissionIds([]);
    }
    try {
      setProfile({
        ...DEFAULT_PROFILE,
        ...JSON.parse(localStorage.getItem("keyflow-profile") || "{}"),
      });
    } catch {
      setProfile(DEFAULT_PROFILE);
    }
    const savedPreference = localStorage.getItem("keyflow-theme-mode");
    const legacyTheme = localStorage.getItem("keyflow-theme");
    setThemePreference(
      ["auto", "light", "dark"].includes(savedPreference)
        ? savedPreference
        : ["light", "dark"].includes(legacyTheme) ? legacyTheme : "auto"
    );
  }, []);

  useEffect(() => {
    if (!growthEvents.length) return undefined;
    const timer = window.setTimeout(() => setGrowthEvents((events) => events.slice(1)), 4200);
    return () => window.clearTimeout(timer);
  }, [growthEvents]);

  useEffect(() => {
    const resolveTheme = () => setTheme(
      themePreference === "auto" ? getTimeBasedTheme() : themePreference
    );
    resolveTheme();
    localStorage.setItem("keyflow-theme-mode", themePreference);
    const timer = themePreference === "auto"
      ? window.setInterval(resolveTheme, 60_000)
      : null;
    return () => timer && window.clearInterval(timer);
  }, [themePreference]);

  useEffect(() => {
    const root = document.documentElement;
    const changed = appliedTheme.current && appliedTheme.current !== theme;
    let timer;
    if (changed) {
      root.classList.remove("theme-changing");
      void root.offsetWidth;
      root.classList.add("theme-changing");
      timer = window.setTimeout(() => root.classList.remove("theme-changing"), 1800);
    }
    root.dataset.theme = theme;
    localStorage.setItem("keyflow-theme", theme);
    appliedTheme.current = theme;
    return () => timer && window.clearTimeout(timer);
  }, [theme]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setEntryReady(true), reducedMotion ? 60 : 720);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (entered || !entryReady || entryLeaving) return;
    function handleLandingShortcut(event) {
      if (event.key === "Enter") enterPractice(event);
    }
    window.addEventListener("keydown", handleLandingShortcut);
    return () => window.removeEventListener("keydown", handleLandingShortcut);
  }, [entered, entryLeaving, entryReady]);

  useEffect(() => {
    if (!pulse || !typed.length) return;
    const frame = window.requestAnimationFrame(() => {
      const zone = typingZoneRef.current;
      const target = passageRef.current?.querySelector(`[data-absolute="${typed.length - 1}"]`);
      if (!zone || !target) return;
      const zoneRect = zone.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setBurstPosition({
        x: targetRect.left - zoneRect.left + targetRect.width / 2,
        y: targetRect.top - zoneRect.top + targetRect.height / 2,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pulse, typed.length]);

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
      const stamp = performance.now();
      setNow(stamp);
      if (testType !== "words" && stamp - startedAt.current >= goal * 1000) {
        finishedAt.current = startedAt.current + goal * 1000;
        setStatus("finished");
      }
    }, 100);
    return () => clearInterval(timer);
  }, [goal, status, testType]);

  useEffect(() => {
    if (status !== "running" || elapsedSeconds < 1) return;
    const second = Math.floor(elapsedSeconds);
    const bucket = Math.max(5, Math.floor(second / 5) * 5);
    const previous = speedTimeline.current.at(-1);
    if (previous?.second === bucket) {
      previous.wpm = speed;
      return;
    }
    speedTimeline.current.push({ second: bucket, wpm: speed });
  }, [elapsedSeconds, speed, status]);

  useEffect(() => {
    if (status !== "finished" || recorded.current) return;
    recorded.current = true;
    const completedAt = Date.now();
    const entry = {
      wpm: speed,
      cpm,
      accuracy,
      errorRate,
      errors: totalErrors,
      duration: Math.round(elapsedSeconds),
      mode,
      metric,
      consistency,
      timestamp: completedAt,
      at: completedAt,
      player: testType === "pk" ? pkPlayer : null,
      mistakes: mistakeLog.map((item) => ({
        key: item.key,
        expected: item.expected,
        typed: item.typed,
        count: item.count,
        positions: item.positions,
      })),
      errorPatterns,
      handStats: trainingReport.hands,
      rhythmBpm,
      rhythmScore,
      reactionTime,
      codeLanguage: mode === "code" ? codeLanguage : null,
      codeMetrics: mode === "code" ? codeMetrics : null,
      speedTimeline: speedTimeline.current.map((point) => ({ ...point })),
      characterStats: Object.fromEntries(
        Object.entries(characterStats.current).map(([character, stats]) => [character, { ...stats }])
      ),
      characters: typed.length,
      correctCharacters: correct,
    };
    const projectedHistory = [entry, ...history];
    const missionsAfter = buildDailyMissions(projectedHistory, completedAt, claimedMissionIds);
    const completedMissions = missionsAfter.filter((mission) => mission.completed && !mission.claimed);
    const reward = calculateSessionRewards({
      mode,
      duration: elapsedSeconds,
      accuracy,
      correctCharacters: correct,
      streak: calculatePracticeStreak(projectedHistory, completedAt),
      missionRewards: completedMissions.map((mission) => mission.reward),
    });
    const xpGain = reward.total;
    entry.xp = xpGain;
    const nextHistory = [entry, ...history].slice(0, 1000);
    setHistory(nextHistory);
    reviewSession(entry, history);
    localStorage.setItem("keyflow-history", JSON.stringify(nextHistory));
    if (testType === "pk") setPkScores((scores) => ({ ...scores, [pkPlayer]: entry }));
    setLastXpAward(xpGain);
    setLastXpBreakdown(reward.breakdown);
    const nextClaimedMissionIds = [...new Set([...claimedMissionIds, ...completedMissions.map((mission) => mission.id)])];
    if (completedMissions.length) {
      setClaimedMissionIds(nextClaimedMissionIds);
      localStorage.setItem("keyflow-daily-missions", JSON.stringify({
        date: new Date(completedAt).toLocaleDateString("en-CA"),
        claimedIds: nextClaimedMissionIds,
      }));
    }
    const previousAchievementIds = new Set(getAchievements(history, completedAt).filter((item) => item.unlocked).map((item) => item.id));
    const unlockedAchievement = getAchievements(nextHistory, completedAt).find((item) => item.unlocked && !previousAchievementIds.has(item.id));
    setXpTotal((current) => {
      const next = current + xpGain;
      const previousLevel = getGrowthLevelInfo(current);
      const nextLevel = getGrowthLevelInfo(next);
      const didLevelUp = previousLevel.level < nextLevel.level;
      setLeveledUp(didLevelUp);
      const events = [
        ...(didLevelUp ? [{ type: "level", level: nextLevel.level, title: nextLevel.title }] : []),
        ...(unlockedAchievement ? [{ type: "achievement", ...unlockedAchievement }] : []),
        ...completedMissions.map((mission) => ({ type: "mission", ...mission })),
      ];
      if (events.length) setGrowthEvents((currentEvents) => [...currentEvents, ...events]);
      localStorage.setItem("keyflow-xp", String(next));
      return next;
    });
    if (speed > best) {
      setBest(speed);
      localStorage.setItem(`keyflow-best-${mode}`, String(speed));
      if (mode === "speed") localStorage.setItem("keyflow-best", String(speed));
    }
  }, [accuracy, best, claimedMissionIds, codeLanguage, codeMetrics, consistency, correct, cpm, elapsedSeconds, errorPatterns, errorRate, history, metric, mistakeLog, mode, pkPlayer, reactionTime, reviewSession, rhythmBpm, rhythmScore, speed, status, testType, totalErrors, trainingReport.hands, typed.length]);

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
        if (immersive) setImmersive(false);
        else reset();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [immersive, reset]);

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement) setImmersive(false);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function finish() {
    finishedAt.current = performance.now();
    setNow(finishedAt.current);
    setStatus("finished");
  }

  function processInput(value) {
    if (status === "finished") return;
    value = (mode === "code" ? value.replace(/\r\n/g, "\n") : value.replace(/[\r\n]/g, "")).slice(0, text.length);
    if (interaction === "sprint" && value.length < typed.length) return;
    const stamp = performance.now();
    const reactionDelta = lastKeyAt.current ? stamp - lastKeyAt.current : 0;
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
      const newMistakes = [];
      for (let cursor = typed.length; cursor < value.length; cursor += 1) {
        const expectedCharacter = text[cursor] || "∅";
        const isCharacterCorrect = value[cursor] === text[cursor];
        const stats = characterStats.current[expectedCharacter] || {
          attempts: 0,
          errors: 0,
          latencyTotal: 0,
          latencyCount: 0,
        };
        const shouldRecordLatency = cursor === value.length - 1
          && reactionDelta >= 40
          && reactionDelta <= 2000;
        characterStats.current[expectedCharacter] = {
          attempts: stats.attempts + 1,
          errors: stats.errors + (isCharacterCorrect ? 0 : 1),
          latencyTotal: (stats.latencyTotal || 0) + (shouldRecordLatency ? reactionDelta : 0),
          latencyCount: (stats.latencyCount || 0) + (shouldRecordLatency ? 1 : 0),
        };
        keystrokes.current.total += 1;
        if (!isCharacterCorrect) {
          keystrokes.current.incorrect += 1;
          newMistakes.push({ expected: expectedCharacter, typed: value[cursor] || "∅", index: cursor });
        }
      }
      if (newMistakes.length) {
        setMistakeLog((current) => appendMistakes(current, newMistakes));
      }
      setCombo((current) => isCorrect ? current + 1 : 0);
      setFeedback(isCorrect ? "correct" : "wrong");
      setPulse((current) => current + 1);
    } else if (value.length < typed.length) {
      keystrokes.current.corrected += typed.length - value.length;
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
    keystrokes.current = { total: 0, incorrect: 0, corrected: 0 };
    characterStats.current = {};
    setMistakeLog([]);
    setResultView("summary");
    recorded.current = false;
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function changeMode(nextMode) {
    if (nextMode === mode || typeof document.startViewTransition !== "function") {
      reset({ mode: nextMode });
      return;
    }
    const currentIndex = MODES.findIndex((item) => item.id === mode);
    const nextIndex = MODES.findIndex((item) => item.id === nextMode);
    const directionClass = nextIndex > currentIndex ? "transition-forward" : "transition-backward";
    document.documentElement.classList.add("mode-transitioning", directionClass);
    const transition = document.startViewTransition(() => {
      flushSync(() => reset({ mode: nextMode }));
    });
    const finishTransition = () => {
      document.documentElement.classList.remove("mode-transitioning", "transition-forward", "transition-backward");
    };
    transition.finished.then(finishTransition, finishTransition);
  }

  function changeInteraction(nextInteraction) {
    if (nextInteraction === interaction) return;
    const applyChange = () => {
      setInteraction(nextInteraction);
      reset();
    };
    if (typeof document.startViewTransition !== "function") {
      applyChange();
      return;
    }
    const currentIndex = INTERACTIONS.findIndex((item) => item.id === interaction);
    const nextIndex = INTERACTIONS.findIndex((item) => item.id === nextInteraction);
    const directionClass = nextIndex > currentIndex ? "transition-forward" : "transition-backward";
    document.documentElement.classList.add("interaction-transitioning", directionClass);
    const transition = document.startViewTransition(() => {
      flushSync(applyChange);
    });
    const finishTransition = () => {
      document.documentElement.classList.remove("interaction-transitioning", "transition-forward", "transition-backward");
    };
    transition.finished.then(finishTransition, finishTransition);
  }

  async function toggleImmersive() {
    const next = !immersive;
    setImmersive(next);
    try {
      if (next && !document.fullscreenElement) await document.documentElement.requestFullscreen();
      if (!next && document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // CSS immersive mode remains available when the browser blocks the Fullscreen API.
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleKeyboardPointerMove(event) {
    const surface = event.currentTarget;
    const keyboard = surface.matches(".keyboard") ? surface : surface.querySelector(".keyboard");
    if (!keyboard) return;
    const surfaceRect = surface.getBoundingClientRect();
    const keyboardRect = keyboard.getBoundingClientRect();
    const x = event.clientX - surfaceRect.left;
    const y = event.clientY - surfaceRect.top;
    const nx = x / surfaceRect.width - .5;
    const ny = y / surfaceRect.height - .5;
    surface.style.setProperty("--kbd-ry", `${nx * 11}deg`);
    surface.style.setProperty("--kbd-rx", `${ny * -9}deg`);
    keyboard.style.setProperty("--kbd-ry", `${nx * 11}deg`);
    keyboard.style.setProperty("--kbd-rx", `${ny * -9}deg`);
    keyboard.style.setProperty("--kbd-glow-x", `${event.clientX - keyboardRect.left}px`);
    keyboard.style.setProperty("--kbd-glow-y", `${event.clientY - keyboardRect.top}px`);

    keyboard.querySelectorAll(".key-row > span:not(.key-spacer)").forEach((key) => {
      const keyRect = key.getBoundingClientRect();
      const distance = Math.hypot(
        event.clientX - (keyRect.left + keyRect.width / 2),
        event.clientY - (keyRect.top + keyRect.height / 2)
      );
      const isPointed = (
        event.clientX >= keyRect.left &&
        event.clientX <= keyRect.right &&
        event.clientY >= keyRect.top &&
        event.clientY <= keyRect.bottom
      );
      const proximity = isPointed ? 1 : Math.max(0, 1 - distance / 150) * .12;
      const ratio = Math.min(1, Math.max(0, (keyRect.left + keyRect.width / 2 - keyboardRect.left) / keyboardRect.width));
      const hue = 255 - ratio * 90;
      const lightness = theme === "light" ? 43 : 68;
      const saturation = theme === "light" ? 76 : 88;
      key.classList.toggle("pointer-down", isPointed);
      key.style.setProperty("--key-y", `${proximity * 11}px`);
      key.style.setProperty("--key-z", `${proximity * -18}px`);
      key.style.setProperty("--key-light", proximity.toFixed(3));
      key.style.setProperty("--key-accent", `hsla(${hue}, ${saturation}%, ${lightness}%, ${(proximity * .3).toFixed(3)})`);
      key.style.setProperty("--key-border", `hsla(${hue}, ${saturation}%, ${lightness}%, ${(proximity * .62).toFixed(3)})`);
    });
  }

  function resetKeyboardDepth(event) {
    const surface = event.currentTarget;
    const keyboard = surface.matches(".keyboard") ? surface : surface.querySelector(".keyboard");
    if (!keyboard) return;
    surface.style.setProperty("--kbd-ry", "0deg");
    surface.style.setProperty("--kbd-rx", "0deg");
    keyboard.style.setProperty("--kbd-ry", "0deg");
    keyboard.style.setProperty("--kbd-rx", "0deg");
    keyboard.querySelectorAll(".key-row > span:not(.key-spacer)").forEach((key) => {
      key.style.setProperty("--key-y", "0px");
      key.style.setProperty("--key-z", "0px");
      key.style.setProperty("--key-light", "0");
      key.style.setProperty("--key-accent", "transparent");
      key.style.setProperty("--key-border", "transparent");
      key.classList.remove("pointer-down");
    });
  }

  const visibleStart = Math.max(0, typed.length - 85);
  const visibleText = text.slice(visibleStart, visibleStart + 280);
  const expectedCharacter = (text[typed.length] || "").toLowerCase();
  const lastTypedCharacter = (typed.at(-1) || "").toLowerCase();
  const expectedKey = expectedCharacter === "\n" ? "enter" : expectedCharacter;
  const lastTypedKey = lastTypedCharacter === "\n" ? "enter" : lastTypedCharacter;
  const modeLabel = MODES.find((item) => item.id === mode)?.label;
  const previousComparable = history.find((item) => item.mode === mode && item.metric === metric) || history[0];
  const improvement = previousComparable?.wpm
    ? Math.round(((speed - previousComparable.wpm) / Math.max(1, previousComparable.wpm)) * 100)
    : 0;
  const timeOptions = [15, 30, 60, 120, 300];
  const wordOptions = [10, 25, 50, 100];
  const pkOptions = [15, 30, 60];
  function chooseTheme(nextTheme) {
    const resolvedTheme = nextTheme === "auto" ? getTimeBasedTheme() : nextTheme;
    setThemePreference(nextTheme);
    setTheme(resolvedTheme);
  }

  function enterPractice(event) {
    event?.stopPropagation();
    if (!entryReady || entryLeaving) return;
    setEntryLeaving(true);
    setEntered(true);
    window.setTimeout(() => {
      setEntryLeaving(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }, 820);
  }

  function saveProfile(nextProfile) {
    setProfile(nextProfile);
    localStorage.setItem("keyflow-profile", JSON.stringify(nextProfile));
    setProfileOpen(false);
  }

  function signOutProfile() {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem("keyflow-profile");
    setProfileOpen(false);
  }

  function startPlanMode(nextMode) {
    reset({ mode: nextMode });
    requestAnimationFrame(() => {
      document.querySelector(".control-deck")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function startAiPlan(item) {
    reset({
      mode: item.mode,
      testType: "time",
      goal: item.duration * 60,
      selectedWeakKey: item.mode === "weak" ? item.focus : selectedWeakKey,
    });
    requestAnimationFrame(() => {
      document.querySelector(".practice-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function selectWeakKey(character) {
    reset({ mode: "weak", selectedWeakKey: character, testType: "time", goal: 300 });
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const pkWinner = pkScores[1] && pkScores[2]
    ? pkScores[1].wpm === pkScores[2].wpm
      ? pkScores[1].accuracy === pkScores[2].accuracy ? 0 : pkScores[1].accuracy > pkScores[2].accuracy ? 1 : 2
      : pkScores[1].wpm > pkScores[2].wpm ? 1 : 2
    : null;
  const focusStart = chineseContent ? typed.length : text.lastIndexOf(" ", Math.max(0, typed.length - 1)) + 1;
  const nextSpace = chineseContent ? typed.length + 8 : text.indexOf(" ", typed.length);
  const focusEnd = nextSpace === -1 ? text.length : nextSpace;

  return (
    <main
      className={`app-shell theme-${theme} ${immersive ? "immersive-mode" : ""} ${!entered ? "landing-active" : "practice-entered"}`}
      onClick={() => {
        if (entered && status !== "finished") inputRef.current?.focus();
      }}
    >
      <ThemeRuntime />
      <PwaRuntime />
      <CloudSyncRuntime
        profile={profile}
        history={history}
        xpTotal={xpTotal}
        onCloudRecords={(records) => {
          if (!records?.length) return;
          setHistory((current) => {
            const merged = normalizeHistory(
              [...records, ...current].filter((record, index, list) => (
                list.findIndex((item) => (item.timestamp || item.at) === (record.timestamp || record.at)) === index
              ))
            ).slice(0, 1000);
            localStorage.setItem("keyflow-history", JSON.stringify(merged));
            return merged;
          });
        }}
      />
      <ScrollRevealController />
      <div className="aurora-backdrop">
        <Aurora
          colorStops={theme === "light" ? ["#b8a9ff", "#8de5d1", "#b9c8ff"] : ["#7667ff", "#47d7bf", "#5363e8"]}
          amplitude={theme === "light" ? 0.68 : 0.88}
          blend={theme === "light" ? 0.58 : 0.7}
          speed={theme === "light" ? 0.78 : 0.9}
        />
      </div>
      <div className="background-wash" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {(!entered || entryLeaving) && (
        <section
          className={`entry-gate saas-entry-gate ${entryReady ? "is-ready" : ""} ${entryLeaving ? "is-leaving" : ""}`}
          aria-label="Keyflow 入场动画"
        >
          <LandingHero
            ready={entryReady}
            leaving={entryLeaving}
            themePreference={themePreference}
            onThemeChange={chooseTheme}
            onEnter={enterPractice}
          />
        </section>
      )}

      <header className="nav">
        <div className="nav-actions">
          <span className="sync-dot"><i /> {profile.cloud ? "云端已连接" : "本地记录"}</span>
          <span className="best-pill"><b>⌁</b> BEST <strong>{best}</strong> {metric}</span>
          <button
            className="nav-profile-button"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setProfileOpen(true);
            }}
          >
            <i>{profile.username.trim().slice(0, 2).toUpperCase() || "KF"}</i>
              <span>{profile.signedIn ? profile.username : "账号与设置"}</span>
          </button>
          <div className="nav-theme-segmented" onClick={(event) => event.stopPropagation()} aria-label="快速切换主题">
            <button
              className={themePreference === "auto" ? "active" : ""}
              type="button"
              onClick={() => chooseTheme("auto")}
              aria-pressed={themePreference === "auto"}
            >
              Auto
            </button>
            <button
              className={themePreference === "light" ? "active" : ""}
              type="button"
              onClick={() => chooseTheme("light")}
              aria-pressed={themePreference === "light"}
            >
              Light
            </button>
            <button
              className={themePreference === "dark" ? "active" : ""}
              type="button"
              onClick={() => chooseTheme("dark")}
              aria-pressed={themePreference === "dark"}
            >
              Dark
            </button>
          </div>
          <button className="icon-button" onClick={(event) => { event.stopPropagation(); reset(); }} aria-label="重新开始">↻</button>
        </div>
      </header>

      <section className="control-deck">
        <div className="mode-grid">
          {MODES.map((item) => (
            <button
              key={item.id}
              className={`mode-card ${mode === item.id ? "active" : ""}`}
              onClick={(event) => { event.stopPropagation(); changeMode(item.id); }}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                event.currentTarget.style.setProperty("--mx", `${x}px`);
                event.currentTarget.style.setProperty("--my", `${y}px`);
                event.currentTarget.style.setProperty("--card-ry", `${(x / rect.width - .5) * 7}deg`);
                event.currentTarget.style.setProperty("--card-rx", `${(y / rect.height - .5) * -6}deg`);
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty("--card-ry", "0deg");
                event.currentTarget.style.setProperty("--card-rx", "0deg");
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
                {testType !== "words" ? (item > 60 ? `${item / 60}m` : `${item}s`) : `${item}${chineseContent ? "字" : "词"}`}
              </button>
            ))}
          </div>
          <div className="interaction-switch" aria-label="交互方式">
            {INTERACTIONS.map((item) => (
              <button
                key={item.id}
                className={interaction === item.id ? "active" : ""}
                title={item.desc}
                onClick={(event) => { event.stopPropagation(); changeInteraction(item.id); }}
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

        {mode === "code" && (
          <div className="specialty-bar" aria-label="代码语言">
            <span><i>{"</>"}</i> Code language</span>
            <div>
              {[
                ["python", "Python"],
                ["javascript", "JavaScript"],
                ["java", "Java"],
                ["cpp", "C++"],
                ["rust", "Rust"],
                ["sql", "SQL"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={codeLanguage === id ? "active" : ""}
                  onClick={(event) => {
                    event.stopPropagation();
                    reset({ mode: "code", codeLanguage: id });
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <small>为程序员优化的符号与语法训练</small>
          </div>
        )}

        {mode === "rhythm" && (
          <div className="specialty-bar rhythm-control" aria-label="节奏训练目标">
            <span><i className="rhythm-beat" style={{ "--beat-duration": `${60 / rhythmTarget}s` }} /> Rhythm target</span>
            <div>
              {[60, 90, 120, 150].map((bpm) => (
                <button
                  key={bpm}
                  className={rhythmTarget === bpm ? "active" : ""}
                  onClick={(event) => {
                    event.stopPropagation();
                    reset({ mode: "rhythm", rhythmTarget: bpm });
                  }}
                >
                  {bpm} BPM
                </button>
              ))}
            </div>
            <small>当前 {rhythmBpm || "—"} BPM · 跟随节拍保持连续输入</small>
          </div>
        )}

        <TrainingIntelligence
          mode={mode}
          weakKeys={weakKeyRanking}
          selectedWeakKey={selectedWeakKey}
          onSelectWeakKey={selectWeakKey}
          fingers={fingerHeatmap}
          plan={aiTrainingPlan}
          reactionTime={reactionTime}
          onStartPlan={startAiPlan}
          rhythmTarget={rhythmTarget}
          rhythmScore={rhythmScore}
          codeMetrics={codeMetrics}
        />
      </section>

      <section className={`practice-card ${status} interaction-${interaction} ${errors > 0 && typed.at(-1) !== text[typed.length - 1] ? "has-error" : ""}`}>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <div className="card-topline">
          <span className={`live-status ${status}`}><i /> {status === "idle" ? "READY" : status === "running" ? "LIVE SESSION" : "SESSION COMPLETE"}</span>
          <span>{modeLabel} · {INTERACTIONS.find((item) => item.id === interaction)?.label} · {testType !== "words" ? (goal > 60 ? `${goal / 60} 分钟` : `${goal} 秒`) : `${goal} ${chineseContent ? "字" : "词"}`}</span>
          <div className="session-actions">
            <span className="session-index">{testType === "pk" ? `PLAYER ${pkPlayer} / 2` : `SESSION / ${String(history.length + 1).padStart(2, "0")}`}</span>
            <button
              className="immersive-enter"
              onClick={(event) => { event.stopPropagation(); toggleImmersive(); }}
              aria-label="进入沉浸式全屏"
              title="沉浸式全屏"
            ><i /> 全屏</button>
          </div>
        </div>

        {immersive && (
          <button
            className="immersive-exit"
            onClick={(event) => { event.stopPropagation(); toggleImmersive(); }}
            aria-label="退出沉浸式全屏"
          >退出全屏 <kbd>Esc</kbd></button>
        )}

        <TrainingMetrics
          wpm={speed}
          accuracy={accuracy}
          consistency={consistency}
          timeLabel={testType === "words" ? `${words}/${goal}` : formatTime(timeLeft)}
          timeProgress={testType === "words" ? progress : Math.max(0, 100 - progress)}
          best={best}
        />

        <div className="typing-zone" ref={typingZoneRef}>
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
            onBeforeInput={(event) => {
              if (["insertFromPaste", "insertFromDrop"].includes(event.nativeEvent.inputType)) {
                event.preventDefault();
              }
            }}
            onPaste={(event) => event.preventDefault()}
            onDrop={(event) => event.preventDefault()}
            disabled={status === "finished"}
            aria-label="打字输入区域"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <div className="typing-meta">
            <span>ERRORS <b>{totalErrors}</b></span>
            <span>RAW <b>{rawWpm}</b></span>
            <span>CORRECTED <b>{keystrokes.current.corrected}</b></span>
            <span className={`combo ${combo >= 5 ? "hot" : ""}`}>COMBO <b>{combo}</b></span>
            {mode === "rhythm" && <span>RHYTHM <b>{rhythmBpm || "—"} / {rhythmTarget}</b></span>}
            <span className="interaction-label">{INTERACTIONS.find((item) => item.id === interaction)?.desc}</span>
          </div>

          {pulse > 0 && status === "running" && <span className={`key-burst ${feedback}`} key={pulse}>{feedback === "correct" ? "+1" : "×"}</span>}
          {pulse > 0 && status === "running" && feedback === "correct" && (
            <span
              className={`spark-burst ${feedback}`}
              key={`spark-${pulse}`}
              style={{ left: `${burstPosition.x}px`, top: `${burstPosition.y}px` }}
              aria-hidden="true"
            >
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
          {combo >= 5 && status === "running" && (
            <span
              className="flow-cursor-trail"
              key={`flow-${pulse}`}
              style={{ left: `${burstPosition.x}px`, top: `${burstPosition.y}px` }}
              aria-hidden="true"
            />
          )}

          <div className={`passage ${mode} ${combo >= 5 ? "is-flowing" : ""}`} ref={passageRef} aria-hidden="true">
            {visibleText.split("").map((char, index) => {
              const absolute = visibleStart + index;
              let className = "pending";
              if (absolute < typed.length) className = typed[absolute] === char ? "correct" : "wrong";
              if (absolute === typed.length && status !== "finished") className += " current";
              if (absolute === typed.length - 1 && typed[absolute] !== char) className += " latest-error";
              if (absolute >= focusStart && absolute <= focusEnd) className += " focus-range";
              return <span className={className} data-absolute={absolute} data-error-position={absolute + 1} key={`${absolute}-${char}`}>{char}</span>;
            })}
          </div>

          {!immersive && (
            <TrainingKeyboard
              expectedKey={expectedKey}
              activeKey={lastTypedKey}
              pulse={pulse}
              feedback={feedback}
            />
          )}

          {status === "idle" && <div className="start-hint"><span>{testType === "pk" ? `玩家 ${pkPlayer} 准备好后开始输入` : "点击这里或直接开始输入"}</span><small>{chineseContent ? "支持拼音与五笔输入法" : interaction === "sprint" ? "冲刺模式无法使用退格键" : "首个按键后自动计时"}</small></div>}

          {status === "finished" && resultView === "summary" && (
            <SessionResult
              wpm={speed}
              cpm={cpm}
              metric={metric}
              accuracy={accuracy}
              consistency={consistency}
              errors={totalErrors}
              best={Math.max(best, speed)}
              errorPatterns={errorPatterns}
              modeLabel={modeLabel}
              rhythmBpm={mode === "rhythm" ? rhythmBpm : 0}
              rhythmScore={mode === "rhythm" ? rhythmScore : 0}
              reactionTime={reactionTime}
              improvement={improvement}
              recommendation={trainingReport.recommendation}
              codeMetrics={mode === "code" ? codeMetrics : null}
              gainedXp={lastXpAward}
              xpBreakdown={lastXpBreakdown}
              level={level}
              leveledUp={leveledUp}
              aiReview={sessionReview}
              testType={testType}
              pkPlayer={pkPlayer}
              pkWinner={pkWinner}
              pkScores={pkScores}
              onAdvancePk={(event) => { event.stopPropagation(); advancePk(); }}
              onRestart={(event) => { event.stopPropagation(); reset(); }}
              onViewReport={(event) => { event.stopPropagation(); setResultView("report"); }}
            />
          )}
          {status === "finished" && resultView === "report" && (
            <AITrainingReport
              report={trainingReport}
              aiReview={sessionReview}
              weakKeys={weakKeyRanking}
              fingers={fingerHeatmap}
              plan={aiTrainingPlan}
              reactionTime={reactionTime}
              rhythmScore={rhythmScore}
              improvement={improvement}
              onBack={(event) => { event.stopPropagation(); setResultView("summary"); }}
              onRestart={(event) => { event.stopPropagation(); reset(); }}
              onStartPlan={(item) => {
                startAiPlan(item);
              }}
              onApplyRecommendation={(event) => {
                event.stopPropagation();
                reset({ mode: trainingReport.recommendation.mode });
              }}
            />
          )}
        </div>

        {!immersive && <ErrorAnalysis mistakes={mistakeLog} typed={typed} text={text} />}
        {chineseContent && !immersive && <div className="ime-panel"><span>中</span><div><strong>{mode === "news" ? "实时中文内容已就绪" : "中文输入已就绪"}</strong><small>使用系统输入法完成文字上屏后，系统将逐字计算速度与准确率。</small></div></div>}
        {immersive && <div
          className="keyboard full-keyboard"
          onPointerMove={handleKeyboardPointerMove}
          onPointerLeave={resetKeyboardDepth}
          aria-hidden="true"
        >
          {KEY_ROWS.map((row, rowIndex) => (
            <div className="key-row" key={rowIndex}>
              {row.map((key, keyIndex) => (
                <span
                  className={`${key.spacer ? "key-spacer " : ""}${expectedKey === key.value ? "next " : ""}${lastTypedKey === key.value && pulse ? "pressed " : ""}${key.size ? `key-${key.size}` : ""}`}
                  key={`${rowIndex}-${keyIndex}-${key.value}-${lastTypedKey === key.value ? pulse : "idle"}`}
                >{key.label}</span>
              ))}
            </div>
          ))}
          {pulse > 0 && status === "running" && (
            <span className={`keyboard-deck-wave ${feedback}`} key={`deck-wave-${pulse}`} aria-hidden="true" />
          )}
        </div>}

        <footer className="card-footer">
          <span><kbd>Tab</kbd><b>+</b><kbd>Enter</kbd> 重开</span>
          <span><kbd>Esc</kbd> 重置</span>
          <span>每一次敲击，都是进步。</span>
        </footer>
      </section>

      <TrainingDashboard
        history={history}
        xpTotal={xpTotal}
        profile={profile}
        claimedMissionIds={claimedMissionIds}
        onEditProfile={() => setProfileOpen(true)}
        onStartPlan={startPlanMode}
      />

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
      <Suspense fallback={profileOpen ? <div className="saas-center-loading" role="status">正在载入控制中心…</div> : null}>
        <SaaSControlCenter
          open={profileOpen}
          profile={profile}
          history={history}
          xpTotal={xpTotal}
          onClose={() => setProfileOpen(false)}
          onProfileChange={saveProfile}
          onCloudRecords={(records) => {
            if (!records?.length) return;
            const merged = normalizeHistory(
              [...records, ...history].filter((record, index, list) => (
                list.findIndex((item) => (item.timestamp || item.at) === (record.timestamp || record.at)) === index
              ))
            ).slice(0, 1000);
            setHistory(merged);
            localStorage.setItem("keyflow-history", JSON.stringify(merged));
          }}
        />
      </Suspense>
      <GrowthNotifications
        event={growthEvents[0]}
        onDismiss={() => setGrowthEvents((events) => events.slice(1))}
      />
    </main>
  );
}
