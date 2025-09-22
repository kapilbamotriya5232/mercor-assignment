/**
 * Utility functions for handling time in Insightful's format
 * All Insightful timestamps are Unix timestamps in milliseconds
 */

/**
 * Convert a Date object to Unix timestamp in milliseconds
 */
export function toUnixMs(date: Date = new Date()): bigint {
  return BigInt(date.getTime());
}

/**
 * Convert Unix timestamp in milliseconds to Date object
 */
export function fromUnixMs(ms: bigint | number): Date {
  return new Date(Number(ms));
}

/**
 * Get current Unix timestamp in milliseconds
 */
export function nowUnixMs(): bigint {
  return BigInt(Date.now());
}

/**
 * Format Unix timestamp for API response
 * Converts BigInt to number for JSON serialization
 */
export function formatTimestamp(ms: bigint | number | null): number {
  if (ms === null) return 0;
  return Number(ms);
}

/**
 * Calculate timezone offset in milliseconds
 * Negative values indicate time zones ahead of UTC
 */
export function getTimezoneOffsetMs(): bigint {
  const offsetMinutes = new Date().getTimezoneOffset();
  return BigInt(offsetMinutes * 60 * 1000);
}

/**
 * Apply timezone offset to get translated time
 * Used for startTranslated and endTranslated fields
 */
export function applyTimezoneOffset(timestampMs: bigint, offsetMs: bigint): bigint {
  return timestampMs - offsetMs;
}

/**
 * Calculate duration between two timestamps in milliseconds
 */
export function calculateDuration(startMs: bigint, endMs: bigint | null): bigint {
  if (endMs === null) {
    return nowUnixMs() - startMs;
  }
  return endMs - startMs;
}

/**
 * Convert duration in milliseconds to hours (for billing calculations)
 */
export function msToHours(ms: bigint): number {
  return Number(ms) / (1000 * 60 * 60);
}

/**
 * Check if a timestamp represents "not set" (0 in Insightful's format)
 */
export function isTimestampUnset(ms: bigint | number): boolean {
  return Number(ms) === 0;
}

/**
 * Format time for display (ISO string)
 */
export function formatForDisplay(ms: bigint | number): string {
  return fromUnixMs(ms).toISOString();
}

/**
 * Parse ISO date string to Unix timestamp in milliseconds
 */
export function parseToUnixMs(dateString: string): bigint {
  return BigInt(new Date(dateString).getTime());
}
