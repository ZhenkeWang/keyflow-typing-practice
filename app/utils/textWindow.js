const DEFAULT_WINDOW = Object.freeze({
  backwardMargin: 28,
  forwardMargin: 126,
  anchor: 64,
});

/**
 * Keep the rendered passage anchored while the cursor moves within a safe
 * region. This prevents a single Backspace from reflowing the entire passage.
 */
export function getStableWindowStart(cursor, currentStart, options = {}) {
  const {
    backwardMargin,
    forwardMargin,
    anchor,
    preserveOnBackwardMove = false,
  } = {
    ...DEFAULT_WINDOW,
    ...options,
  };
  const safeCursor = Math.max(0, Number(cursor) || 0);
  const safeStart = Math.max(0, Number(currentStart) || 0);

  // Deletion should not slide a still-visible passage backwards. Keeping the
  // same DOM window avoids a full text reflow for every Backspace repeat.
  if (preserveOnBackwardMove && safeCursor >= safeStart) {
    return safeStart;
  }

  if (
    safeCursor < safeStart + backwardMargin
    || safeCursor > safeStart + forwardMargin
  ) {
    return Math.max(0, safeCursor - anchor);
  }

  return safeStart;
}

/**
 * Move the rendered window to the start of a visual line while retaining a
 * small amount of reading context above the caret. `lineStarts` is measured
 * from the currently rendered DOM, so this remains accurate across font,
 * viewport and fullscreen changes.
 */
export function getLineAnchoredWindowStart(
  cursor,
  currentStart,
  lineStarts,
  keepLines = 1,
) {
  const safeCursor = Math.max(0, Number(cursor) || 0);
  const safeStart = Math.max(0, Number(currentStart) || 0);
  const starts = Array.from(new Set(lineStarts || []))
    .map((value) => Math.max(0, Number(value) || 0))
    .filter((value) => value >= safeStart && value <= safeCursor)
    .sort((a, b) => a - b);

  if (!starts.length) return safeStart;
  const contextLines = Math.max(0, Number(keepLines) || 0);
  return starts[Math.max(0, starts.length - 1 - contextLines)] ?? safeStart;
}

export function shouldCapturePracticeBackspace({
  key,
  entered,
  status,
  isEditable,
}) {
  return key === "Backspace"
    && entered
    && status !== "finished"
    && !isEditable;
}
