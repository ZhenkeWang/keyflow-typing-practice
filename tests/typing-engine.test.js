import assert from "node:assert/strict";
import test from "node:test";
import {
  appendMistakes,
  buildErrorPatterns,
  buildTrainingReport,
  buildWeakKeyText,
  calculateConsistency,
  calculateRhythmBpm,
  calculateTypingMetrics,
  calculateXpAward,
  compareInput,
  extractWeakKeys,
  getHandForCharacter,
  getLevelInfo,
  normalizeHistory,
  summarizeHandPerformance,
} from "../app/utils/typingEngine.js";

test("compareInput counts correct and incorrect Unicode characters", () => {
  assert.deepEqual(compareInput("中文输错", "中文输入"), {
    correct: 3,
    incorrect: 1,
    typedCount: 4,
    targetCount: 4,
    remaining: 0,
  });
});

test("calculates net WPM, raw WPM, CPM and event-based accuracy", () => {
  const result = calculateTypingMetrics({
    typed: "quick brown fox jumps",
    target: "quick brown fox jumps",
    elapsedMs: 60_000,
    totalKeystrokes: 22,
    incorrectKeystrokes: 2,
  });
  assert.equal(result.wpm, 4);
  assert.equal(result.rawWpm, 4);
  assert.equal(result.cpm, 21);
  assert.equal(result.accuracy, 91);
  assert.equal(result.errorRate, 9);
});

test("corrected errors remain represented in accuracy and raw speed", () => {
  const result = calculateTypingMetrics({
    typed: "hello",
    target: "hello",
    elapsedMs: 30_000,
    totalKeystrokes: 7,
    incorrectKeystrokes: 1,
  });
  assert.equal(result.wpm, 2);
  assert.equal(result.rawWpm, 3);
  assert.equal(result.accuracy, 86);
});

test("suppresses unstable speed during the first half second", () => {
  const result = calculateTypingMetrics({
    typed: "a",
    target: "a",
    elapsedMs: 120,
    totalKeystrokes: 1,
  });
  assert.equal(result.wpm, 0);
  assert.equal(result.cpm, 0);
});

test("aggregates repeated mistakes and preserves positions", () => {
  const result = appendMistakes([], [
    { expected: "r", typed: "t", index: 4 },
    { expected: "r", typed: "t", index: 12 },
  ]);
  assert.equal(result[0].count, 2);
  assert.deepEqual(result[0].positions, [4, 12]);
});

test("consistency stays bounded and history records are migrated", () => {
  assert.equal(calculateConsistency([100, 100, 100, 100]), 100);
  assert.ok(calculateConsistency([50, 250, 70, 300]) >= 0);
  const [record] = normalizeHistory([{ wpm: 60, accuracy: 98, at: 123 }]);
  assert.equal(record.cpm, 300);
  assert.equal(record.timestamp, 123);
});

test("maps characters to hands and calculates hand accuracy", () => {
  assert.equal(getHandForCharacter("R"), "left");
  assert.equal(getHandForCharacter("j"), "right");
  assert.equal(getHandForCharacter(" "), "neutral");
  assert.deepEqual(summarizeHandPerformance({
    r: { attempts: 10, errors: 2 },
    j: { attempts: 8, errors: 0 },
  }), {
    left: { attempts: 10, errors: 2, accuracy: 80 },
    right: { attempts: 8, errors: 0, accuracy: 100 },
  });
});

test("training report identifies weak hand and recommends targeted drills", () => {
  const report = buildTrainingReport({
    mistakes: [{ key: "1→2", expected: "1", typed: "2", count: 3, lastIndex: 8, positions: [2, 5, 8] }],
    characterStats: { 1: { attempts: 5, errors: 3 }, j: { attempts: 5, errors: 0 } },
    accuracy: 90,
    wpm: 45,
  });
  assert.equal(report.weakerHand, "left");
  assert.equal(report.recommendation.mode, "weak");
  assert.equal(report.topMistakes[0].count, 3);
});

test("sustains accurate metrics across a 1000-character session", () => {
  const target = "a".repeat(1000);
  const result = calculateTypingMetrics({
    typed: target,
    target,
    elapsedMs: 120_000,
    totalKeystrokes: 1000,
    incorrectKeystrokes: 0,
  });
  assert.equal(result.wpm, 100);
  assert.equal(result.cpm, 500);
  assert.equal(result.accuracy, 100);
  assert.equal(result.remaining, 0);
});

test("derives rhythm, weak keys and contextual error combinations", () => {
  assert.equal(calculateRhythmBpm([500, 500, 500, 500]), 120);
  const history = [{
    mistakes: [
      { expected: "q", count: 4 },
      { expected: "p", count: 2 },
      { expected: ";", count: 1 },
    ],
  }];
  assert.deepEqual(extractWeakKeys(history, 2), ["q", "p"]);
  assert.match(buildWeakKeyText(history, 120), /q/);
  assert.deepEqual(
    buildErrorPatterns([
      { expected: "i", positions: [4, 11] },
    ], "action action"),
    [{ pattern: "tion", count: 2 }]
  );
});

test("XP awards are bounded and level progress is deterministic", () => {
  const xp = calculateXpAward({ correctCharacters: 100, accuracy: 98, duration: 60, errorRate: 2 });
  assert.ok(xp > 20);
  assert.deepEqual(getLevelInfo(1250), {
    level: 2,
    title: "Rhythm Builder",
    currentXp: 250,
    nextLevelXp: 1000,
    progress: 0.25,
  });
});
