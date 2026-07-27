const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

/**
 * Formats a raw byte count into a human-readable string with appropriate units.
 *
 * @param bytes Number of bytes to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted size string (e.g. "14.50 MB")
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const dm = Math.max(0, decimals);
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    BYTE_UNITS.length - 1
  );

  const value = bytes / Math.pow(k, i);
  const formatted = i === 0 ? Math.round(value).toString() : value.toFixed(dm);

  return `${formatted} ${BYTE_UNITS[i]}`;
}

/**
 * Formats a transfer speed in bytes per second into a human-readable rate.
 *
 * @param bytesPerSecond Raw speed in B/s
 * @returns Formatted speed string (e.g. "12.40 MB/s")
 */
export function formatTransferSpeed(bytesPerSecond: number): string {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) {
    return '0 B/s';
  }
  return `${formatFileSize(bytesPerSecond)}/s`;
}

/**
 * Formats an estimated time of arrival (ETA) in seconds into a human-friendly string.
 *
 * @param seconds Number of seconds remaining
 * @returns Formatted duration (e.g. "2m 15s", "< 1s", or "Instant")
 */
export function formatETA(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return 'Calculating...';
  }
  if (seconds === 0) {
    return 'Instant';
  }
  if (seconds < 1) {
    return '< 1s';
  }

  const MathFloor = Math.floor;
  const totalSeconds = MathFloor(seconds);

  const hours = MathFloor(totalSeconds / 3600);
  const minutes = MathFloor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

/**
 * Formats a progress percentage with consistent decimal precision.
 *
 * @param percentage Value between 0 and 100
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g. "45.2%")
 */
export function formatPercentage(percentage: number, decimals: number = 1): string {
  if (!Number.isFinite(percentage) || percentage < 0) {
    return '0.0%';
  }
  const clamped = Math.min(100, Math.max(0, percentage));
  return `${clamped.toFixed(decimals)}%`;
}
