import {
  createAIConversation,
  createTrainingPlan,
  createUserAnalysis,
} from "../models/aiCoach.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const average = (values = []) => values.length
  ? values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
  : 0;

const recentFirst = (history = [], limit = 20) => [...history]
  .filter(Boolean)
  .sort((a, b) => Number(b.timestamp || b.at) - Number(a.timestamp || a.at))
  .slice(0, limit);

function collectWeakKeys(history) {
  const totals = {};
  history.forEach((record) => {
    if (record.characterStats) {
      Object.entries(record.characterStats).forEach(([character, stats]) => {
        if (!character.trim()) return;
        const key = character.toLowerCase();
        const item = totals[key] || { character: key, errors: 0, attempts: 0, latencyTotal: 0, latencyCount: 0 };
        item.errors += Number(stats.errors) || 0;
        item.attempts += Number(stats.attempts) || 0;
        item.latencyTotal += Number(stats.latencyTotal) || 0;
        item.latencyCount += Number(stats.latencyCount) || 0;
        totals[key] = item;
      });
      return;
    }
    (record.mistakes || []).forEach((mistake) => {
      const key = String(mistake.expected || "").toLowerCase();
      if (!key.trim()) return;
      const item = totals[key] || { character: key, errors: 0, attempts: 0, latencyTotal: 0, latencyCount: 0 };
      item.errors += Number(mistake.count) || 1;
      item.attempts += Number(mistake.count) || 1;
      totals[key] = item;
    });
  });
  return Object.values(totals)
    .map((item) => ({
      ...item,
      errorRate: item.attempts ? Number(((item.errors / item.attempts) * 100).toFixed(1)) : 0,
      reactionTime: item.latencyCount ? Math.round(item.latencyTotal / item.latencyCount) : 0,
    }))
    .filter((item) => item.errors > 0)
    .sort((a, b) => b.errors - a.errors || b.errorRate - a.errorRate)
    .slice(0, 10);
}

function collectCombinations(history) {
  const totals = {};
  history.forEach((record) => {
    (record.errorPatterns || []).forEach((item) => {
      if (!item.pattern) return;
      totals[item.pattern] = (totals[item.pattern] || 0) + (Number(item.count) || 1);
    });
  });
  return Object.entries(totals)
    .map(([pattern, errors]) => ({ pattern, errors }))
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 6);
}

function analyzeEndurance(history) {
  const timelines = history
    .map((record) => record.speedTimeline)
    .filter((timeline) => Array.isArray(timeline) && timeline.length >= 3);
  if (!timelines.length) {
    return { first20Wpm: 0, laterWpm: 0, dropRate: 0, status: "collecting", detail: "再完成一次 60 秒训练即可分析持续能力" };
  }
  const early = timelines.flatMap((timeline) => timeline.filter((point) => point.second <= 20).map((point) => point.wpm));
  const later = timelines.flatMap((timeline) => timeline.filter((point) => point.second > 20).map((point) => point.wpm));
  const first20Wpm = Math.round(average(early));
  const laterWpm = Math.round(average(later));
  const dropRate = first20Wpm ? Math.round(((first20Wpm - laterWpm) / first20Wpm) * 100) : 0;
  return {
    first20Wpm,
    laterWpm,
    dropRate,
    status: dropRate >= 18 ? "weak" : dropRate >= 8 ? "watch" : "stable",
    detail: dropRate >= 18 ? "后半程速度明显下降，持续能力不足" : "长段输入保持较稳定",
  };
}

function analyzeFingerIssue(history, weakKeys) {
  const fingers = {
    "左手小指": "`1qaz", "左手无名指": "2wsx", "左手中指": "3edc", "左手食指": "45rtfgvb",
    "右手食指": "67yuhjnm", "右手中指": "8ik,", "右手无名指": "9ol.", "右手小指": "0p;:/[{'\"-=_+]}\\?",
  };
  const ranked = Object.entries(fingers).map(([label, keys]) => ({
    label,
    errors: weakKeys.filter((item) => keys.includes(item.character)).reduce((sum, item) => sum + item.errors, 0),
  })).sort((a, b) => b.errors - a.errors);
  const fallbackHand = history.find((record) => record.handStats)?.handStats;
  if (!ranked[0]?.errors && fallbackHand) {
    return fallbackHand.left.accuracy < fallbackHand.right.accuracy
      ? { label: "左手键区", errors: fallbackHand.left.errors || 0 }
      : { label: "右手键区", errors: fallbackHand.right.errors || 0 };
  }
  return ranked[0] || { label: "暂无明显手指弱点", errors: 0 };
}

function analyzeHabits(history) {
  const hours = history.map((record) => new Date(record.timestamp || record.at).getHours());
  const modeCounts = history.reduce((result, record) => {
    result[record.mode || "speed"] = (result[record.mode || "speed"] || 0) + 1;
    return result;
  }, {});
  const preferredMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "speed";
  const preferredHour = hours.length ? Math.round(average(hours)) : null;
  return {
    sessions: history.length,
    averageDuration: Math.round(average(history.map((record) => record.duration))),
    preferredMode,
    preferredHour,
    consistency: Math.round(average(history.map((record) => record.consistency || 0))),
  };
}

export function predictGrowth(history = [], goal = 80) {
  const recent = recentFirst(history, 20);
  const current = Math.round(average(recent.slice(0, 5).map((record) => record.wpm)));
  const older = Math.round(average(recent.slice(5, 10).map((record) => record.wpm)));
  const observedGain = recent.length >= 6 ? clamp(current - older, -3, 8) : 1;
  const weeklyGain = Math.max(1, observedGain || 1);
  const day30 = Math.round(Math.min(goal, current + weeklyGain * 4.2));
  const day90 = Math.round(Math.min(Math.max(goal, current), current + weeklyGain * 12.8));
  return {
    current,
    day30,
    day90,
    goal,
    condition: "每天训练 10 分钟",
    confidence: recent.length >= 12 ? "high" : recent.length >= 5 ? "medium" : "early",
    points: [
      { day: 0, wpm: current },
      { day: 30, wpm: day30 },
      { day: 60, wpm: Math.round((day30 + day90) / 2) },
      { day: 90, wpm: day90 },
    ],
  };
}

export function generatePlan(analysis, goal = 80) {
  const weakCharacters = analysis.weakKeys.slice(0, 3).map((item) => item.character.toUpperCase());
  const rhythmTarget = analysis.rhythm.volatility >= 22 ? 60 : 75;
  return createTrainingPlan({
    goal,
    duration: 13,
    difficulty: analysis.currentStatus.averageWpm >= 70 ? "advanced" : analysis.currentStatus.averageWpm >= 40 ? "intermediate" : "foundation",
    tasks: [
      { id: "weak", mode: "weak", title: "Weak Key Training", target: weakCharacters.length ? weakCharacters.join(" · ") : "E · R · T", duration: 5, reason: "先消除最高频的动作阻塞" },
      { id: "rhythm", mode: "rhythm", title: "Rhythm Training", target: `${rhythmTarget} BPM`, duration: 3, reason: "缩小相邻击键间隔波动" },
      { id: "speed", mode: "speed", title: "Sentence Flow", target: `${Math.max(35, analysis.currentStatus.averageWpm + 3)} WPM`, duration: 5, reason: "把专项动作迁移回连续句子" },
    ],
    timeline: [
      { week: 1, title: `稳定 ${Math.max(30, analysis.currentStatus.averageWpm)} WPM`, detail: "以准确和节奏为主" },
      { week: 2, title: "降低高频错键", detail: `重点 ${weakCharacters.join(" / ") || "基础键区"}` },
      { week: 3, title: "速度突破", detail: `挑战 ${Math.min(goal, analysis.currentStatus.averageWpm + 10)} WPM` },
      { week: 4, title: "综合训练", detail: `向 ${goal} WPM 目标收敛` },
    ],
  });
}

export function derivePerformanceAnalysis(history = [], options = {}) {
  const recent = recentFirst(history, 20);
  const last12 = recent.slice(0, 12);
  const weakKeys = collectWeakKeys(last12);
  const combinations = collectCombinations(last12);
  const recentWpm = last12.slice(0, 6).map((record) => Number(record.wpm) || 0);
  const olderWpm = last12.slice(6, 12).map((record) => Number(record.wpm) || 0);
  const currentAverage = Math.round(average(recentWpm));
  const previousAverage = Math.round(average(olderWpm));
  const accuracy = Number(average(last12.map((record) => record.accuracy)).toFixed(1));
  const volatility = Math.round(100 - average(last12.map((record) => record.consistency || 100)));
  const endurance = analyzeEndurance(last12);
  const fingerIssue = analyzeFingerIssue(last12, weakKeys);
  const habits = analyzeHabits(last12);
  const strengths = [];
  if (accuracy >= 97) strengths.push("准确率稳定在专业训练区间");
  if (volatility <= 12) strengths.push("击键节奏连续且波动较小");
  if (currentAverage > previousAverage && previousAverage) strengths.push(`近期速度提升 ${currentAverage - previousAverage} WPM`);
  if (!strengths.length) strengths.push("训练数据正在形成，动作基线已经建立");
  const weaknesses = [
    ...(weakKeys[0] ? [{ type: "character", label: `${weakKeys[0].character.toUpperCase()} 键`, detail: `${weakKeys[0].errors} 次错误 · ${weakKeys[0].errorRate}%`, severity: weakKeys[0].errorRate >= 10 ? "high" : "medium" }] : []),
    ...(combinations[0] ? [{ type: "combination", label: combinations[0].pattern, detail: `${combinations[0].errors} 次组合错误`, severity: "medium" }] : []),
    ...(fingerIssue.errors ? [{ type: "finger", label: fingerIssue.label, detail: `关联 ${fingerIssue.errors} 次错误`, severity: "medium" }] : []),
    ...(volatility >= 18 ? [{ type: "rhythm", label: "节奏波动", detail: `${volatility}% 波动`, severity: volatility >= 30 ? "high" : "medium" }] : []),
    ...(endurance.status === "weak" ? [{ type: "endurance", label: "持续能力", detail: `后半程下降 ${endurance.dropRate}%`, severity: "high" }] : []),
  ];
  if (!weaknesses.length) weaknesses.push({ type: "data", label: "暂无集中弱点", detail: "继续训练以提高分析置信度", severity: "low" });
  const analysis = {
    currentStatus: {
      averageWpm: currentAverage,
      averageAccuracy: accuracy,
      trend: previousAverage ? currentAverage - previousAverage : 0,
      reactionTime: Math.round(average(last12.map((record) => record.reactionTime))),
      rhythmScore: Math.round(average(last12.map((record) => record.rhythmScore || record.consistency))),
    },
    weakKeys,
    combinations,
    fingerIssue,
    rhythm: { volatility, status: volatility >= 30 ? "weak" : volatility >= 18 ? "watch" : "stable" },
    endurance,
    habits,
    strengths,
    weaknesses,
    lastUpdated: new Date(options.now || Date.now()).toISOString(),
    sampleSize: last12.length,
  };
  analysis.prediction = predictGrowth(recent, options.goal || 80);
  analysis.recommendations = generatePlan(analysis, options.goal || 80);
  return createUserAnalysis(analysis);
}

export async function analyzePerformance(history = [], options = {}) {
  if (options.delay !== 0) await new Promise((resolve) => setTimeout(resolve, options.delay ?? 420));
  return derivePerformanceAnalysis(history, options);
}

export async function buildSessionReview(record = {}, history = [], options = {}) {
  if (options.delay !== 0) await new Promise((resolve) => setTimeout(resolve, options.delay ?? 280));
  const analysis = derivePerformanceAnalysis([record, ...history], options);
  const score = clamp(Math.round(
    (Number(record.accuracy) || 0) * .45
    + (Number(record.consistency) || 0) * .25
    + Math.min(100, Number(record.wpm) || 0) * .3
  ), 0, 100);
  const previous = recentFirst(history, 5);
  const previousAccuracy = average(previous.map((item) => item.accuracy));
  const accuracyDelta = previousAccuracy ? Number(((Number(record.accuracy) || 0) - previousAccuracy).toFixed(1)) : 0;
  return {
    score,
    strengths: [
      accuracyDelta > 0 ? `准确率提升 ${accuracyDelta}%` : analysis.strengths[0],
      Number(record.consistency) >= 90 ? "本轮节奏稳定" : null,
    ].filter(Boolean),
    issues: analysis.weaknesses.slice(0, 2),
    nextStep: analysis.recommendations.tasks[0],
    generatedAt: new Date().toISOString(),
  };
}

function contextualAnswer(question, analysis, plan) {
  const normalized = question.toLowerCase();
  const weak = analysis.weakKeys.slice(0, 3).map((item) => item.character.toUpperCase()).join("、") || "E、R、T";
  if (/80|目标|达到/.test(normalized)) {
    return `你当前最近平均速度是 ${analysis.currentStatus.averageWpm} WPM。先把准确率稳定在 97% 以上，再按 ${plan.tasks[1].target} 做 3 分钟节奏训练。以每天 10 分钟计算，30 天预测约为 ${analysis.prediction.day30} WPM。`;
  }
  if (/错误|哪里|弱点/.test(normalized)) {
    return `最近 ${analysis.sampleSize} 次训练中，最需要关注的是 ${analysis.weaknesses[0].label}：${analysis.weaknesses[0].detail}。建议先练 ${weak}，随后完成一轮 Sentence Flow 验证迁移效果。`;
  }
  if (/为什么|提高不了|速度/.test(normalized)) {
    const reason = analysis.rhythm.volatility >= 18
      ? `击键节奏波动达到 ${analysis.rhythm.volatility}%`
      : analysis.endurance.status === "weak"
        ? `后半程速度下降 ${analysis.endurance.dropRate}%`
        : `${weak} 等高频动作仍有停顿`;
    return `你的准确率为 ${analysis.currentStatus.averageAccuracy}%，主要限制不是“打错太多”，而是${reason}。今天依次完成 Weak Key、Rhythm 和 Sentence Flow，会比单纯追求峰值速度更有效。`;
  }
  return `基于最近 ${analysis.sampleSize} 次训练，你当前为 ${analysis.currentStatus.averageWpm} WPM、${analysis.currentStatus.averageAccuracy}% 准确率。优先完成 ${plan.tasks[0].title}（${plan.tasks[0].target}），再用 ${plan.tasks[1].target} 稳定节奏。`;
}

export async function chatCoach(question, context = {}, options = {}) {
  if (options.delay !== 0) await new Promise((resolve) => setTimeout(resolve, options.delay ?? 520));
  const analysis = context.analysis || derivePerformanceAnalysis(context.history || [], { goal: context.goal });
  const plan = context.plan || generatePlan(analysis, context.goal || 80);
  return createAIConversation({
    question,
    answer: contextualAnswer(question, analysis, plan),
    date: new Date().toISOString(),
    source: "local-performance-model",
  });
}
