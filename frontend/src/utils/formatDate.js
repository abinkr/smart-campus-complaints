// src/utils/formatDate.js
// Native JavaScript date formatting helpers using Intl.DateTimeFormat.
// No external date libraries (moment.js, date-fns, dayjs, luxon) are used or needed.

export const DEFAULT_TIME_ZONE = 'Asia/Kolkata';

export const SUPPORTED_TIME_ZONES = [
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata'
];

export function normalizeTimeZone(timeZone) {
  return SUPPORTED_TIME_ZONES.includes(timeZone) ? timeZone : DEFAULT_TIME_ZONE;
}

function toValidDate(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date value to a short human-readable date string.
 * Example output: "28 May 2026"
 *
 * @param {string | number | Date} dateInput
 * @param {string} timeZone
 * @returns {string}
 */
export function formatDate(dateInput, timeZone = DEFAULT_TIME_ZONE) {
  const date = toValidDate(dateInput);
  if (!date) return '-';

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: normalizeTimeZone(timeZone)
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats a date value to a date + time string.
 * Example output: "28 May 2026, 09:30 AM"
 *
 * @param {string | number | Date} dateInput
 * @param {string} timeZone
 * @returns {string}
 */
export function formatDateTime(dateInput, timeZone = DEFAULT_TIME_ZONE) {
  const date = toValidDate(dateInput);
  if (!date) return '-';

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: normalizeTimeZone(timeZone)
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

/**
 * Returns a relative time label for recent timestamps.
 * Falls back to formatDateTime for older dates (> 24 hours).
 * Example outputs: "Just now", "3 minutes ago", "2 hours ago", "Yesterday"
 *
 * @param {string | number | Date} dateInput
 * @param {string} timeZone
 * @returns {string}
 */
export function formatRelativeTime(dateInput, timeZone = DEFAULT_TIME_ZONE) {
  const date = toValidDate(dateInput);
  if (!date) return '-';

  try {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;
    return formatDate(date, timeZone);
  } catch {
    return String(dateInput);
  }
}
