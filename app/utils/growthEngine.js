const DAY_MS = 86_400_000;

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

export function getAchievements(history = [], now = Date.now()) {
  const stats = calculateGrowthStats(history, 0, now);
  return [
    {
      id: "first-session",
      icon: "✦",
      title: "First Flow",
      detail: "完成第一次训练",
      unlocked: stats.sessions >= 1,
      progress: Math.min(1, stats.sessions),
    },
    {
      id: "wpm-100",
      icon: "⚡",
      title: "First 100 WPM",
      detail: "单次速度达到 100 WPM",
      unlocked: stats.bestWpm >= 100,
      progress: Math.min(1, stats.bestWpm / 100),
    },
    {
      id: "perfect",
      icon: "◎",
      title: "Perfect Accuracy",
      detail: "完成一次 100% 准确率训练",
      unlocked: history.some((record) => Number(record.accuracy) === 100),
      progress: Math.min(1, stats.averageAccuracy / 100),
    },
    {
      id: "characters-10k",
      icon: "⌨",
      title: "10K Keystrokes",
      detail: "累计输入 10,000 字符",
      unlocked: stats.totalCharacters >= 10_000,
      progress: Math.min(1, stats.totalCharacters / 10_000),
    },
    {
      id: "streak-30",
      icon: "◒",
      title: "30 Day Streak",
      detail: "连续训练 30 天",
      unlocked: stats.streak >= 30,
      progress: Math.min(1, stats.streak / 30),
    },
  ];
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
    {
      day: "Day 1",
      mode: firstMode,
      title: firstMode === "accuracy" ? "Accuracy Training" : "Weak Key Training",
      duration: "5 min",
      reason: topSignal ? `重点处理 “${topSignal}”` : "建立准确、放松的击键基线",
    },
    {
      day: "Day 2",
      mode: "rhythm",
      title: "Rhythm Training",
      duration: "5 min",
      reason: "稳定连续输入，减少不必要停顿",
    },
    {
      day: "Day 3",
      mode: "speed",
      title: "Speed Training",
      duration: "3 × 30s",
      reason: `挑战 ${Math.max(40, stats.bestWpm + 3)} WPM 的可控速度`,
    },
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

  const issues = signals.slice(0, 3).map(([pattern, count]) => ({
    label: pattern,
    detail: `近期累计 ${count} 次相关错误`,
  }));
  if (!issues.length) {
    issues.push({
      label: "节奏稳定性",
      detail: "暂无集中错键，下一阶段应缩小击键间隔波动",
    });
  }

  return {
    strengths,
    issues,
    focus: signals[0]?.[0] || "rhythm",
    recommendation: buildPersonalPlan(recent)[0],
  };
}
