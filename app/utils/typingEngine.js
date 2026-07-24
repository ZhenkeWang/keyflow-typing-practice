export const CHARACTERS_PER_WORD = 5;
export const XP_PER_LEVEL = 1000;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const LEFT_HAND_KEYS = new Set(Array.from("qwertasdfgzxcvb12345`"));
const RIGHT_HAND_KEYS = new Set(Array.from("yuiophjklnm67890-=[]\\;',./"));

export function compareInput(typed = "", target = "") {
  const typedChars = Array.from(typed);
  const targetChars = Array.from(target);
  let correct = 0;
  let incorrect = 0;

  typedChars.forEach((char, index) => {
    if (char === targetChars[index]) correct += 1;
    else incorrect += 1;
  });

  return {
    correct,
    incorrect,
    typedCount: typedChars.length,
    targetCount: targetChars.length,
    remaining: Math.max(0, targetChars.length - typedChars.length),
  };
}

/**
 * Net WPM is based on currently correct characters. Raw WPM uses every
 * committed character attempt, so corrections do not hide inefficient input.
 */
export function calculateTypingMetrics({
  typed = "",
  target = "",
  elapsedMs = 0,
  totalKeystrokes = 0,
  incorrectKeystrokes = 0,
} = {}) {
  const comparison = compareInput(typed, target);
  if (elapsedMs < 500) {
    return {
      ...comparison,
      wpm: 0,
      rawWpm: 0,
      cpm: 0,
      rawCpm: 0,
      accuracy: totalKeystrokes ? Math.round(((totalKeystrokes - incorrectKeystrokes) / totalKeystrokes) * 100) : 100,
      errorRate: totalKeystrokes ? Math.round((incorrectKeystrokes / totalKeystrokes) * 100) : 0,
    };
  }

  const minutes = elapsedMs / 60_000;
  const attempts = Math.max(totalKeystrokes, comparison.typedCount);
  const safeErrors = clamp(incorrectKeystrokes, 0, attempts);

  return {
    ...comparison,
    wpm: Math.round((comparison.correct / CHARACTERS_PER_WORD) / minutes),
    rawWpm: Math.round((attempts / CHARACTERS_PER_WORD) / minutes),
    cpm: Math.round(comparison.correct / minutes),
    rawCpm: Math.round(attempts / minutes),
    accuracy: attempts ? Math.round(((attempts - safeErrors) / attempts) * 100) : 100,
    errorRate: attempts ? Math.round((safeErrors / attempts) * 100) : 0,
  };
}

export function calculateConsistency(intervals = []) {
  const valid = intervals.filter((value) => Number.isFinite(value) && value > 0).slice(-60);
  if (valid.length < 4) return 100;
  const mean = valid.reduce((sum, value) => sum + value, 0) / valid.length;
  const variance = valid.reduce((sum, value) => sum + (value - mean) ** 2, 0) / valid.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  return clamp(Math.round(100 - coefficientOfVariation * 60), 0, 100);
}

export function appendMistakes(current = [], mistakes = [], limit = 12) {
  const next = current.map((item) => ({ ...item, positions: [...item.positions] }));

  mistakes.forEach((mistake) => {
    const key = `${mistake.expected}→${mistake.typed}`;
    const index = next.findIndex((item) => item.key === key);
    if (index >= 0) {
      next[index] = {
        ...next[index],
        count: next[index].count + 1,
        lastIndex: mistake.index,
        positions: [...next[index].positions, mistake.index],
      };
    } else {
      next.push({
        ...mistake,
        key,
        count: 1,
        lastIndex: mistake.index,
        positions: [mistake.index],
      });
    }
  });

  return next
    .sort((a, b) => b.count - a.count || b.lastIndex - a.lastIndex)
    .slice(0, limit);
}

export function getHandForCharacter(character = "") {
  const key = character.toLowerCase();
  if (LEFT_HAND_KEYS.has(key)) return "left";
  if (RIGHT_HAND_KEYS.has(key)) return "right";
  return "neutral";
}

export function summarizeHandPerformance(characterStats = {}) {
  const summary = {
    left: { attempts: 0, errors: 0, accuracy: 100 },
    right: { attempts: 0, errors: 0, accuracy: 100 },
  };

  Object.entries(characterStats).forEach(([character, stats]) => {
    const hand = getHandForCharacter(character);
    if (hand === "neutral") return;
    summary[hand].attempts += Number(stats.attempts) || 0;
    summary[hand].errors += Number(stats.errors) || 0;
  });

  ["left", "right"].forEach((hand) => {
    const { attempts, errors } = summary[hand];
    summary[hand].accuracy = attempts
      ? Math.round(((attempts - Math.min(attempts, errors)) / attempts) * 100)
      : 100;
  });

  return summary;
}

export function buildTrainingReport({
  mistakes = [],
  characterStats = {},
  accuracy = 100,
  wpm = 0,
  mode = "focus",
} = {}) {
  const hands = summarizeHandPerformance(characterStats);
  const topMistakes = [...mistakes]
    .sort((a, b) => b.count - a.count || b.lastIndex - a.lastIndex)
    .slice(0, 5);
  const accuracyGap = Math.abs(hands.left.accuracy - hands.right.accuracy);
  const weakerHand = accuracyGap === 0
    ? null
    : hands.left.accuracy < hands.right.accuracy ? "left" : "right";

  let recommendation = {
    mode: "focus",
    label: "专注基础训练",
    reason: "保持均匀节奏，先把高频字符的准确率稳定下来。",
  };
  if (topMistakes.some((item) => /[0-9]/.test(item.expected))) {
    recommendation = {
      mode: "numbers",
      label: "数字专项训练",
      reason: "错误集中在数字键，建议强化数字行与结构化数据输入。",
    };
  } else if (mode === "code" || topMistakes.some((item) => /[()[\]{};:'"<>/=+*-]/.test(item.expected))) {
    recommendation = {
      mode: "code",
      label: "代码符号训练",
      reason: "符号与成对结构是当前主要损耗点，适合继续代码专项。",
    };
  } else if (accuracy >= 97 && wpm >= 55) {
    recommendation = {
      mode: "quote",
      label: "标点节奏训练",
      reason: "基础准确率已经稳定，可以用完整句提升连续输入与停顿控制。",
    };
  }

  return {
    topMistakes,
    hands,
    weakerHand,
    insight: topMistakes.length
      ? `最常见错误是 ${topMistakes[0].expected === " " ? "空格" : topMistakes[0].expected} → ${topMistakes[0].typed === " " ? "空格" : topMistakes[0].typed}，共 ${topMistakes[0].count} 次。`
      : "本轮没有记录到错误，输入节奏稳定。",
    handInsight: accuracyGap >= 3
      ? `${weakerHand === "left" ? "左手" : "右手"}准确率低 ${accuracyGap}%，建议降低速度并做单侧键区热身。`
      : "左右手表现均衡，可以继续提升连续输入速度。",
    recommendation,
  };
}

export function calculateXpAward({
  correctCharacters = 0,
  accuracy = 0,
  duration = 0,
  errorRate = 0,
} = {}) {
  const volumeXp = Math.round(Math.max(0, correctCharacters) * 0.65);
  const accuracyBonus = accuracy >= 98 ? 45 : accuracy >= 95 ? 30 : accuracy >= 90 ? 18 : 6;
  const completionBonus = Math.min(40, Math.round(Math.max(0, duration) / 3));
  const errorPenalty = Math.min(25, Math.round(Math.max(0, errorRate)));
  return Math.max(20, volumeXp + accuracyBonus + completionBonus - errorPenalty);
}

export function getLevelInfo(xpTotal = 0) {
  const safeXp = Math.max(0, Number(xpTotal) || 0);
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const titles = ["Starter", "Rhythm Builder", "Flow Typist", "Speed Crafter", "Typing Master"];
  return {
    level,
    title: titles[Math.min(titles.length - 1, level - 1)],
    currentXp: safeXp % XP_PER_LEVEL,
    nextLevelXp: XP_PER_LEVEL,
    progress: (safeXp % XP_PER_LEVEL) / XP_PER_LEVEL,
  };
}

export function normalizeHistory(records = []) {
  return records
    .filter((item) => item && Number.isFinite(Number(item.wpm)))
    .map((item) => ({
      ...item,
      wpm: Number(item.wpm) || 0,
      cpm: Number(item.cpm) || Math.round((Number(item.wpm) || 0) * CHARACTERS_PER_WORD),
      accuracy: Number(item.accuracy) || 0,
      errorRate: Number(item.errorRate) || 0,
      errors: Number(item.errors) || 0,
      duration: Number(item.duration) || 0,
      consistency: Number(item.consistency) || 0,
      timestamp: Number(item.timestamp || item.at) || Date.now(),
      at: Number(item.at || item.timestamp) || Date.now(),
    }));
}
