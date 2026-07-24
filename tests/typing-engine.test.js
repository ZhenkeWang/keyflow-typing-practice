import assert from "node:assert/strict";
import test from "node:test";
import {
  appendMistakes,
  calculateConsistency,
  calculateTypingMetrics,
  compareInput,
  normalizeHistory,
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
