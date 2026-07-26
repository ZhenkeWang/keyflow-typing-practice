import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCoachSummary,
  buildDailyMissions,
  buildDailySeries,
  buildGrowthProfile,
  buildPersonalPlan,
  calculateGrowthStats,
  calculatePracticeStreak,
  calculateSessionRewards,
  calculateSkillLevels,
  getAchievements,
  getGrowthLevelInfo,
  getUnlockedTitles,
} from "../app/utils/growthEngine.js";

const DAY = 86_400_000;
const TODAY = new Date(2026, 6, 25, 12).getTime();
const record = (daysAgo, overrides = {}) => ({
  timestamp: TODAY - daysAgo * DAY,
  mode: "speed",
  wpm: 80,
  cpm: 400,
  accuracy: 98,
  consistency: 91,
  duration: 60,
  characters: 400,
  errors: 1,
  mistakes: [],
  errorPatterns: [],
  ...overrides,
});

test("calculates growth metrics and a consecutive streak", () => {
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
  const series = buildDailySeries([record(0, { wpm: 80 }), record(0, { wpm: 100 }), record(1, { wpm: 70 })], 2, TODAY);
  assert.equal(series[1].wpm, 90);
  assert.equal(series[1].sessions, 2);
  assert.equal(series[0].wpm, 70);
});

test("uses the complete level ladder and exposes skill progress", () => {
  assert.equal(getGrowthLevelInfo(0).title, "Typing Beginner");
  assert.equal(getGrowthLevelInfo(19_000).title, "Speed Runner");
  assert.equal(getGrowthLevelInfo(49_000).title, "Typing Legend");
  const skills = calculateSkillLevels([
    record(0, { mode: "code", characters: 800 }),
    record(0, { mode: "rhythm", characters: 600 }),
  ]);
  assert.ok(skills.coding.level > skills.speed.level);
  assert.ok(skills.rhythm.level > 1);
});

test("awards explainable XP and daily mission bonuses", () => {
  const missions = buildDailyMissions([
    record(0, { mode: "speed", accuracy: 100, characters: 1100 }),
  ], TODAY);
  assert.ok(missions.every((mission) => mission.completed));
  const reward = calculateSessionRewards({
    mode: "speed",
    duration: 60,
    accuracy: 100,
    correctCharacters: 400,
    streak: 7,
    missionRewards: missions.map((mission) => mission.reward),
  });
  assert.equal(reward.breakdown.at(-1).label, "Daily Missions");
  assert.ok(reward.total > 250);
});

test("unlocks categorized achievements, titles and targeted plans", () => {
  const history = [
    record(0, {
      wpm: 104,
      accuracy: 100,
      errors: 0,
      characters: 10_000,
      mode: "code",
      errorPatterns: [{ pattern: "tion", count: 4 }],
    }),
  ];
  const unlocked = getAchievements(history, TODAY).filter((item) => item.unlocked).map((item) => item.id);
  assert.ok(unlocked.includes("wpm-100"));
  assert.ok(unlocked.includes("perfect"));
  assert.ok(unlocked.includes("zero-error-1000"));
  assert.ok(getUnlockedTitles(history, 30).some((title) => title.label === "Flow Master" && title.unlocked));
  assert.equal(buildPersonalPlan(history)[0].reason, "重点处理 “tion”");
  assert.equal(buildCoachSummary(history).focus, "tion");
  assert.equal(buildGrowthProfile({ history, xpTotal: 12_400, now: TODAY }).level, 13);
});
