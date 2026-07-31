import test from "node:test";
import assert from "node:assert/strict";
import {
  getStableWindowStart,
  shouldCapturePracticeBackspace,
} from "../app/utils/textWindow.js";

test("keeps the passage anchored during ordinary backspace input", () => {
  assert.equal(getStableWindowStart(103, 40), 40);
  assert.equal(getStableWindowStart(102, 40), 40);
});

test("repositions only after the cursor crosses the backward buffer", () => {
  assert.equal(getStableWindowStart(67, 40), 3);
});

test("keeps the passage fixed throughout continuous deletion", () => {
  assert.equal(
    getStableWindowStart(67, 40, { preserveOnBackwardMove: true }),
    40,
  );
  assert.equal(
    getStableWindowStart(40, 40, { preserveOnBackwardMove: true }),
    40,
  );
});

test("moves only when deletion exits the rendered passage", () => {
  assert.equal(
    getStableWindowStart(39, 40, { preserveOnBackwardMove: true }),
    0,
  );
});

test("advances when the cursor crosses the forward buffer", () => {
  assert.equal(getStableWindowStart(167, 40), 103);
});

test("never returns a negative passage start", () => {
  assert.equal(getStableWindowStart(3, 0), 0);
});

test("captures Backspace when fullscreen focus is outside the typing field", () => {
  assert.equal(shouldCapturePracticeBackspace({
    key: "Backspace",
    entered: true,
    status: "running",
    isEditable: false,
  }), true);
});

test("leaves Backspace native behavior inside editable controls", () => {
  assert.equal(shouldCapturePracticeBackspace({
    key: "Backspace",
    entered: true,
    status: "running",
    isEditable: true,
  }), false);
});
