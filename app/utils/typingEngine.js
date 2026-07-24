export const CHARACTERS_PER_WORD = 5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
