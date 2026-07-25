import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCoachSummary,
  buildDailySeries,
  buildPersonalPlan,
  calculateGrowthStats,
  calculatePracticeStreak,
  getAchievements,
} from "../app/utils/growthEngine.js";

const DAY = 86_400_000;
const TODAY = new Date(2026, 6, 25, 12).getTime();

const record = (daysAgo, overrides = {}) => ({
  timestamp: TODAY - daysAgo * DAY,
  wpm: 80,
  cpm: 400,
  accuracy: 98,
  consistency: 91,
  duration: 60,
  characters: 400,
  mistakes: [],
  errorPatterns: [],
  ...overrides,
});

test("calculates product growth metrics and a consecutive streak", () => {
  const history = [record(0), record(1), record(2, { wpm: 100, accuracy: 100 })];
  assert.equal(calculatePracticeStreak(history, TODAY), 3);
  assert.deepEqual(calculateGrowthStats(history, 1250, TODAY), {
    totalCharacters: 1200,
    totalPracticeSeconds: 180,
    averageWpm: 87,
    bestWpm: 100,
    averageAccuracy: 99,
    streak: 3,
    sessions: 3,
    xpTotal: 1250,
  });
});

test("daily series aggregates sessions by local calendar day", () => {
  const series = buildDailySeries([
    record(0, { wpm: 80 }),
    record(0, { wpm: 100 }),
    record(1, { wpm: 70 }),
  ], 2, TODAY);
  assert.equal(series[1].wpm, 90);
  assert.equal(series[1].sessions, 2);
  assert.equal(series[0].wpm, 70);
});

test("unlocks achievements and builds a targeted three-day plan", () => {
  const history = [
    record(0, {
      wpm: 104,
      accuracy: 100,
      characters: 10_000,
      errorPatterns: [{ pattern: "tion", count: 4 }],
    }),
  ];
  const unlocked = getAchievements(history, TODAY).filter((item) => item.unlocked).map((item) => item.id);
  assert.ok(unlocked.includes("wpm-100"));
  assert.ok(unlocked.includes("perfect"));
  assert.ok(unlocked.includes("characters-10k"));
  assert.equal(buildPersonalPlan(history)[0].reason, "重点处理 “tion”");
  assert.equal(buildCoachSummary(history).focus, "tion");
});
