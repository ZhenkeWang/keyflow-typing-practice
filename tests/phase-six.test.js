import test from "node:test";
import assert from "node:assert/strict";
import { playKeySound, triggerHaptic } from "../app/services/feedback.js";

test("audio and haptic feedback degrade safely outside a browser", () => {
  assert.doesNotThrow(() => playKeySound({ mode: "mechanical", volume: .4 }));
  assert.equal(triggerHaptic(10, true), false);
});

test("silent feedback mode performs no browser work", () => {
  assert.doesNotThrow(() => playKeySound({ mode: "silent", volume: 1 }));
});

