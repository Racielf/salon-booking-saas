/**
 * Format total minutes into a human-readable string.
 * e.g. 240 → "4h", 90 → "1h 30m", 45 → "45m"
 */
export function formatDuration(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "—";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Convert hours + minutes fields into total minutes.
 */
export function toTotalMinutes(hours, minutes) {
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

/**
 * Split total minutes into { hours, minutes }.
 */
export function splitDuration(totalMinutes) {
  const total = Number(totalMinutes) || 0;
  return {
    hours: Math.floor(total / 60),
    minutes: total % 60,
  };
}