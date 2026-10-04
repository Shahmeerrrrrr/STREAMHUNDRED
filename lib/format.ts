// Utility functions for formatting data in the UI

/**
 * Format a raw stream count into a compact string.
 * Examples: 5610198940 -> "5.61B", 820000000 -> "820M", 1234567 -> "1.23M"
 */
export function formatStreams(count: number): string {
  if (count >= 1_000_000_000) {
    return (count / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "B";
  }
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  }
  return count.toLocaleString();
}

/**
 * Format a daily stream count, returning null display if not available.
 * Example: 4200000 -> "+4.2M/day"
 */
export function formatDailyStreams(count: number | null): string {
  if (count === null) return "—";
  return "+" + formatStreams(count) + "/day";
}

/**
 * Return a relative-time string from an ISO timestamp.
 * No external dependencies.
 * Examples: "2 hours ago", "3 days ago", "just now"
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

/**
 * Calculate the age of a release in years from an ISO date string.
 * Returns null if releaseDate is null or unparseable.
 * Example: "2017-03-17" -> 6 (years old)
 */
export function ageInYears(releaseDate: string | null): number | null {
  if (!releaseDate) return null;
  const release = new Date(releaseDate);
  if (isNaN(release.getTime())) return null;
  const now = new Date();
  const years = now.getFullYear() - release.getFullYear();
  // Subtract 1 if the birthday hasn't passed yet this year
  const hasBirthdayPassed =
    now.getMonth() > release.getMonth() ||
    (now.getMonth() === release.getMonth() &&
      now.getDate() >= release.getDate());
  return hasBirthdayPassed ? years : years - 1;
}
