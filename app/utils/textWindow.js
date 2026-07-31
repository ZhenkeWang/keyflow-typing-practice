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
  const { backwardMargin, forwardMargin, anchor } = {
    ...DEFAULT_WINDOW,
    ...options,
  };
  const safeCursor = Math.max(0, Number(cursor) || 0);
  const safeStart = Math.max(0, Number(currentStart) || 0);

  if (
    safeCursor < safeStart + backwardMargin
    || safeCursor > safeStart + forwardMargin
  ) {
    return Math.max(0, safeCursor - anchor);
  }

  return safeStart;
}
