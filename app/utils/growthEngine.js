const DAY_MS = 86_400_000;
export const XP_PER_LEVEL = 1000;

const localDayKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const startOfDay = (value = Date.now()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const average = (values) => values.length
  ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
  : 0;

export const LEVEL_TITLES = [
  { level: 50, title: "Typing Legend" },
  { level: 30, title: "Flow Master" },
  { level: 20, title: "Speed Runner" },
  { level: 10, title: "Typing Apprentice" },
  { level: 5, title: "Keyboard Learner" },
  { level: 1, title: "Typing Beginner" },
];

export function getGrowthLevelInfo(xpTotal = 0) {
  const safeXp = Math.max(0, Number(xpTotal) || 0);
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const title = LEVEL_TITLES.find((item) => level >= item.level)?.title || "Typing Beginner";
  return {
    level,
    title,
    currentXp: safeXp % XP_PER_LEVEL,
    nextLevelXp: XP_PER_LEVEL,
    progress: (safeXp % XP_PER_LEVEL) / XP_PER_LEVEL,
  };
}

export function calculatePracticeStreak(history = [], now = Date.now()) {
  const practicedDays = new Set(history.map((record) => localDayKey(record.timestamp || record.at)));
  let cursor = startOfDay(now);
  if (!practicedDays.has(localDayKey(cursor))) cursor -= DAY_MS;
  let streak = 0;
  while (practicedDays.has(localDayKey(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

export function estimateCharacters(record = {}) {
  if (Number.isFinite(Number(record.characters))) return Math.max(0, Number(record.characters));
  if (Number.isFinite(Number(record.correctCharacters))) return Math.max(0, Number(record.correctCharacters));
  const cpm = Number(record.cpm) || (Number(record.wpm) || 0) * 5;
  return Math.max(0, Math.round(cpm * ((Number(record.duration) || 0) / 60)));
}

export function calculateGrowthStats(history = [], xpTotal = 0, now = Date.now()) {
  const speeds = history.map((record) => Number(record.wpm) || 0);
  const accuracies = history.map((record) => Number(record.accuracy) || 0);
  return {
    totalCharacters: history.reduce((sum, record) => sum + estimateCharacters(record), 0),
    totalPracticeSeconds: history.reduce((sum, record) => sum + (Number(record.duration) || 0), 0),
    averageWpm: average(speeds),
    bestWpm: speeds.length ? Math.max(...speeds) : 0,
    averageAccuracy: average(accuracies),
    streak: calculatePracticeStreak(history, now),
    sessions: history.length,
    xpTotal: Math.max(0, Number(xpTotal) || 0),
  };
}

export function buildDailySeries(history = [], days = 14, now = Date.now()) {
  const daily = history.reduce((result, record) => {
    const key = localDayKey(record.timestamp || record.at);
    const bucket = result[key] || { speeds: [], accuracies: [], sessions: 0, characters: 0 };
    bucket.speeds.push(Number(record.wpm) || 0);
    bucket.accuracies.push(Number(record.accuracy) || 0);
    bucket.sessions += 1;
    bucket.characters += estimateCharacters(record);
    result[key] = bucket;
    return result;
  }, {});
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, index) => {
    const timestamp = today - (days - 1 - index) * DAY_MS;
    const key = localDayKey(timestamp);
    const bucket = daily[key];
    return {
      key,
      timestamp,
      label: new Date(timestamp).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }),
      wpm: bucket ? average(bucket.speeds) : 0,
      accuracy: bucket ? average(bucket.accuracies) : 0,
      sessions: bucket?.sessions || 0,
      characters: bucket?.characters || 0,
    };
  });
}

const skillLevel = (points) => {
  const safe = Math.max(0, Math.round(points));
  const level = Math.max(1, Math.floor(safe / 500) + 1);
  return { level, xp: safe % 500, next: 500, progress: (safe % 500) / 500 };
};

export function calculateSkillLevels(history = []) {
  const totals = { speed: 0, accuracy: 0, rhythm: 0, coding: 0 };
  history.forEach((record) => {
    const characters = estimateCharacters(record);
    const quality = Math.max(0.25, (Number(record.accuracy) || 0) / 100);
    const base = Math.round(characters * quality + (Number(record.duration) || 0));
    totals.speed += Math.round(base * (record.mode === "speed" ? 1.35 : 0.45));
    totals.accuracy += Math.round(base * (record.mode === "accuracy" || record.mode === "weak" ? 1.4 : 0.55));
    totals.rhythm += Math.round(base * (record.mode === "rhythm" ? 1.6 : 0.35));
    totals.coding += Math.round(base * (record.mode === "code" ? 1.7 : 0.2));
  });
  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, skillLevel(value)]));
}

export const DAILY_MISSION_DEFINITIONS = [
  { id: "speed-session", title: "完成一次 Speed Test", reward: 50, target: 1, mode: "speed", goal: 30, icon: "↗" },
  { id: "accuracy-98", title: "单次准确率达到 98%", reward: 80, target: 1, mode: "accuracy", goal: 60, icon: "◎" },
  { id: "characters-1000", title: "今日完成 1,000 字符", reward: 100, target: 1000, mode: "ai", goal: 120, icon: "✦" },
];

export function buildDailyMissions(history = [], now = Date.now(), claimedIds = []) {
  const todayKey = localDayKey(now);
  const today = history.filter((record) => localDayKey(record.timestamp || record.at) === todayKey);
  const values = {
    "speed-session": today.filter((record) => record.mode === "speed").length,
    "accuracy-98": today.filter((record) => Number(record.accuracy) >= 98).length,
    "characters-1000": today.reduce((sum, record) => sum + estimateCharacters(record), 0),
  };
  return DAILY_MISSION_DEFINITIONS.map((mission) => {
    const progressValue = values[mission.id] || 0;
    return {
      ...mission,
      progressValue,
      progress: Math.min(1, progressValue / mission.target),
      completed: progressValue >= mission.target,
      claimed: claimedIds.includes(mission.id),
    };
  });
}

export function calculateSessionRewards({
  mode = "speed",
  duration = 0,
  accuracy = 0,
  correctCharacters = 0,
  streak = 0,
  missionRewards = [],
} = {}) {
  const normalizedDuration = Math.max(15, Number(duration) || 0);
  const baseByMode = { speed: 50, accuracy: 55, weak: 60, code: 65, rhythm: 60, ai: 60 };
  const base = Math.max(20, Math.round((baseByMode[mode] || 45) * Math.min(1.5, normalizedDuration / 60)));
  const volume = Math.min(70, Math.round(Math.max(0, correctCharacters) * 0.12));
  const perfect = Number(accuracy) === 100 ? 20 : 0;
  const streakBonus = streak >= 2 ? Math.min(30, streak * 3) : 0;
  const mission = missionRewards.reduce((sum, reward) => sum + Number(reward || 0), 0);
  const breakdown = [
    { id: "training", label: `${mode[0]?.toUpperCase() || ""}${mode.slice(1)} Training`, value: base + volume },
    ...(perfect ? [{ id: "perfect", label: "Perfect Accuracy", value: perfect }] : []),
    ...(streakBonus ? [{ id: "streak", label: `${streak} Day Streak`, value: streakBonus }] : []),
    ...(mission ? [{ id: "missions", label: "Daily Missions", value: mission }] : []),
  ];
  return { total: breakdown.reduce((sum, item) => sum + item.value, 0), breakdown };
}

export function getAchievements(history = [], now = Date.now()) {
  const stats = calculateGrowthStats(history, 0, now);
  const zeroErrorCharacters = history
    .filter((record) => Number(record.errors) === 0)
    .reduce((sum, record) => sum + estimateCharacters(record), 0);
  const hours = history.map((record) => new Date(record.timestamp || record.at).getHours());
  const definitions = [
    ["first-session", "start", "First Flow", "完成第一次训练", "progress", stats.sessions, 1],
    ["wpm-50", "speed", "First 50 WPM", "单次速度达到 50 WPM", "progress", stats.bestWpm, 50],
    ["wpm-100", "speed", "Speed Master", "单次速度达到 100 WPM", "progress", stats.bestWpm, 100],
    ["perfect", "accuracy", "Perfect Input", "完成一次 100% 准确率训练", "boolean", history.some((r) => Number(r.accuracy) === 100), 1],
    ["zero-error-1000", "accuracy", "Zero Error", "累计 1,000 字符零错误输入", "progress", zeroErrorCharacters, 1000],
    ["characters-10k", "progress", "10K Keystrokes", "累计输入 10,000 字符", "progress", stats.totalCharacters, 10000],
    ["streak-7", "streak", "7 Day Flow", "连续训练 7 天", "progress", stats.streak, 7],
    ["streak-30", "streak", "30 Day Legend", "连续训练 30 天", "progress", stats.streak, 30],
    ["night-coder", "special", "Night Coder", "在凌晨完成训练", "boolean", hours.some((hour) => hour < 5), 1],
    ["early-bird", "special", "Early Bird", "在清晨完成训练", "boolean", hours.some((hour) => hour >= 5 && hour < 9), 1],
  ];
  const icons = { start: "✦", speed: "↗", accuracy: "◎", progress: "◇", streak: "◉", special: "✺" };
  return definitions.map(([id, category, title, detail, type, value, target]) => {
    const progress = type === "boolean" ? (value ? 1 : 0) : Math.min(1, Number(value) / target);
    return { id, category, icon: icons[category], title, detail, unlocked: progress >= 1, progress };
  });
}

export function getUnlockedTitles(history = [], level = 1) {
  const stats = calculateGrowthStats(history);
  const titles = [{ id: "rookie", label: "Keyboard Rookie", unlocked: true }];
  titles.push({ id: "flow-master", label: "Flow Master", unlocked: stats.bestWpm >= 100 || level >= 30 });
  titles.push({ id: "accuracy-king", label: "Accuracy King", unlocked: history.some((record) => Number(record.accuracy) === 100) });
  titles.push({ id: "code-typist", label: "Code Typist", unlocked: history.filter((record) => record.mode === "code").length >= 5 });
  return titles;
}

function collectErrorSignals(history = []) {
  const totals = {};
  history.forEach((record) => {
    (record.errorPatterns || []).forEach((item) => {
      totals[item.pattern] = (totals[item.pattern] || 0) + (Number(item.count) || 0);
    });
    (record.mistakes || []).forEach((item) => {
      const label = item.expected === " " ? "Space" : item.expected;
      totals[label] = (totals[label] || 0) + (Number(item.count) || 0);
    });
  });
  return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

export function buildPersonalPlan(history = []) {
  const recent = [...history].sort((a, b) => (b.timestamp || b.at) - (a.timestamp || a.at)).slice(0, 12);
  const stats = calculateGrowthStats(recent);
  const topSignal = collectErrorSignals(recent)[0]?.[0];
  const firstMode = stats.averageAccuracy && stats.averageAccuracy < 96 ? "accuracy" : "weak";
  return [
    { day: "Day 1", mode: firstMode, title: firstMode === "accuracy" ? "Accuracy Training" : "Weak Key Training", duration: "5 min", reason: topSignal ? `重点处理 “${topSignal}”` : "建立准确、放松的击键基线" },
    { day: "Day 2", mode: "rhythm", title: "Rhythm Training", duration: "5 min", reason: "稳定连续输入，减少不必要停顿" },
    { day: "Day 3", mode: "speed", title: "Speed Training", duration: "3 × 30s", reason: `挑战 ${Math.max(40, stats.bestWpm + 3)} WPM 的可控速度` },
  ];
}

export function buildCoachSummary(history = []) {
  const recent = [...history].sort((a, b) => (b.timestamp || b.at) - (a.timestamp || a.at)).slice(0, 12);
  const stats = calculateGrowthStats(recent);
  const signals = collectErrorSignals(recent);
  const strengths = [];
  if (stats.averageAccuracy >= 97) strengths.push("准确率稳定，基础击键控制良好");
  if (recent.some((record) => Number(record.consistency) >= 90)) strengths.push("连续输入节奏稳定");
  if (stats.bestWpm >= 80) strengths.push("短时速度具备较强爆发力");
  if (!strengths.length) strengths.push("已经建立可持续的训练记录");
  const issues = signals.slice(0, 3).map(([pattern, count]) => ({ label: pattern, detail: `近期累计 ${count} 次相关错误` }));
  if (!issues.length) issues.push({ label: "节奏稳定性", detail: "暂无集中错键，下一阶段应缩小击键间隔波动" });
  return { strengths, issues, focus: signals[0]?.[0] || "rhythm", recommendation: buildPersonalPlan(recent)[0] };
}

export function buildGrowthProfile({ profile = {}, history = [], xpTotal = 0, claimedMissionIds = [], now = Date.now() } = {}) {
  const levelInfo = getGrowthLevelInfo(xpTotal);
  const skills = calculateSkillLevels(history);
  const titles = getUnlockedTitles(history, levelInfo.level);
  return {
    username: profile.username || "KeyFlow User",
    avatar: profile.avatar || "",
    xp: xpTotal,
    ...levelInfo,
    activeTitle: [...titles].reverse().find((title) => title.unlocked)?.label || "Keyboard Rookie",
    skills,
    achievements: getAchievements(history, now),
    streak: calculatePracticeStreak(history, now),
    titles,
    missions: buildDailyMissions(history, now, claimedMissionIds),
  };
}
