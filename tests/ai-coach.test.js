import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSessionReview,
  chatCoach,
  derivePerformanceAnalysis,
  generatePlan,
  predictGrowth,
} from "../app/services/aiCoach.js";

const NOW = new Date(2026, 6, 26, 12).getTime();
const record = (index, overrides = {}) => ({
  timestamp: NOW - index * 86_400_000,
  mode: index % 3 === 0 ? "rhythm" : "speed",
  wpm: 48 + (12 - index),
  accuracy: 97 + (index % 2),
  consistency: 82,
  duration: 60,
  reactionTime: 230,
  rhythmScore: 80,
  characters: 300,
  mistakes: [{ expected: "e", typed: "r", count: 2 }],
  errorPatterns: [{ pattern: "tion", count: 1 }],
  characterStats: {
    e: { attempts: 30, errors: 3, latencyTotal: 2400, latencyCount: 10 },
    r: { attempts: 28, errors: 1, latencyTotal: 2100, latencyCount: 10 },
  },
  speedTimeline: [
    { second: 5, wpm: 54 },
    { second: 15, wpm: 52 },
    { second: 25, wpm: 43 },
    { second: 45, wpm: 39 },
  ],
  ...overrides,
});

test("detects weak keys, combinations, rhythm and endurance", () => {
  const analysis = derivePerformanceAnalysis(Array.from({ length: 12 }, (_, index) => record(index)), {
    now: NOW,
    goal: 80,
  });
  assert.equal(analysis.sampleSize, 12);
  assert.equal(analysis.weakKeys[0].character, "e");
  assert.equal(analysis.combinations[0].pattern, "tion");
  assert.equal(analysis.endurance.status, "weak");
  assert.ok(analysis.weaknesses.some((item) => item.type === "rhythm"));
});

test("generates a goal plan and bounded growth prediction", () => {
  const history = Array.from({ length: 12 }, (_, index) => record(index));
  const analysis = derivePerformanceAnalysis(history, { now: NOW, goal: 80 });
  const plan = generatePlan(analysis, 80);
  const prediction = predictGrowth(history, 80);
  assert.equal(plan.tasks.length, 3);
  assert.equal(plan.timeline.length, 4);
  assert.equal(plan.goal, 80);
  assert.ok(prediction.day30 >= prediction.current);
  assert.ok(prediction.day90 <= 80);
});

test("creates an asynchronous session review and contextual coach answer", async () => {
  const history = Array.from({ length: 8 }, (_, index) => record(index + 1));
  const review = await buildSessionReview(record(0, { accuracy: 100 }), history, { delay: 0, goal: 80 });
  assert.ok(review.score >= 0 && review.score <= 100);
  assert.ok(review.strengths.length);
  assert.equal(review.nextStep.mode, "weak");
  const response = await chatCoach("为什么我的速度提高不了？", { history, goal: 80 }, { delay: 0 });
  assert.match(response.answer, /准确率|节奏|停顿/);
  assert.equal(response.source, "local-performance-model");
});
