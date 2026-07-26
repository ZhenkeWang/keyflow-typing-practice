import test from "node:test";
import assert from "node:assert/strict";
import { getPlanLimit, isFeatureAvailable, PLAN_FEATURES } from "../app/config/saas.js";
import { buildResultShareText } from "../app/services/share.js";
import { THEME_PRESETS } from "../app/stores/themeStore.js";

test("keeps Free and Pro entitlements explicit without payment behavior", () => {
  assert.equal(PLAN_FEATURES.free.label, "Free");
  assert.equal(PLAN_FEATURES.pro.label, "Pro");
  assert.equal(isFeatureAvailable("free", "cloudSync"), true);
  assert.equal(getPlanLimit("free", "aiReviewsPerDay"), 3);
  assert.equal(getPlanLimit("pro", "aiReviewsPerDay"), Infinity);
});

test("ships five distinct visual theme presets", () => {
  assert.deepEqual(
    THEME_PRESETS.map((theme) => theme.id),
    ["apple-white", "cyber-dark", "terminal", "aurora", "mechanical"]
  );
  THEME_PRESETS.forEach((theme) => assert.equal(theme.swatches.length, 3));
});

test("creates a compact privacy-safe result share message", () => {
  const text = buildResultShareText({ wpm: 86, accuracy: 98, mode: "Coding" });
  assert.equal(text, "KeyFlow · 86 WPM · 98% Accuracy · Coding");
  assert.equal(text.includes("@"), false);
});

