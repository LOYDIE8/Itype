/**
 * Typing Math Utilities
 */

/**
 * Calculates Gross WPM (Words Per Minute).
 * A "word" is standardized as 5 keystrokes/characters.
 */
export function calculateWpm(totalChars: number, timeSeconds: number): number {
  if (timeSeconds <= 0) return 0;
  const minutes = timeSeconds / 60;
  const wpm = (totalChars / 5) / minutes;
  return Math.round(wpm);
}

/**
 * Calculates Net WPM (Gross WPM minus errors penalty per minute).
 */
export function calculateNetWpm(totalChars: number, uncorrectedErrors: number, timeSeconds: number): number {
  if (timeSeconds <= 0) return 0;
  const minutes = timeSeconds / 60;
  const correctChars = Math.max(0, totalChars - uncorrectedErrors);
  const wpm = (correctChars / 5) / minutes;
  return Math.max(0, Math.round(wpm));
}

/**
 * Calculates Accuracy Percentage.
 */
export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 100;
  const accuracy = (correctChars / totalChars) * 100;
  return Math.min(100, Math.max(0, Math.round(accuracy)));
}

/**
 * Formats duration in seconds to MM:SS display format.
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
