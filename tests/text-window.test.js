import test from "node:test";
import assert from "node:assert/strict";
import { getStableWindowStart } from "../app/utils/textWindow.js";

test("keeps the passage anchored during ordinary backspace input", () => {
  assert.equal(getStableWindowStart(103, 40), 40);
  assert.equal(getStableWindowStart(102, 40), 40);
});

test("repositions only after the cursor crosses the backward buffer", () => {
  assert.equal(getStableWindowStart(67, 40), 3);
});

test("advances when the cursor crosses the forward buffer", () => {
  assert.equal(getStableWindowStart(167, 40), 103);
});

test("never returns a negative passage start", () => {
  assert.equal(getStableWindowStart(3, 0), 0);
});
