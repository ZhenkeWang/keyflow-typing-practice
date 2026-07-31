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
