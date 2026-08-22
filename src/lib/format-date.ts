/**
 * Date formatting with an EXPLICIT locale and timezone.
 *
 * Bare `toLocaleDateString()` picks up the runtime's locale, which differs
 * between the server and the browser — that's a hydration mismatch waiting to
 * happen the moment any of these lists is rendered server-side. Pinning both
 * makes output identical everywhere, and this is a UK clinic, so en-GB.
 */
const LOCALE = 'en-GB';
const TIME_ZONE = 'Europe/London';

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: TIME_ZONE
});

const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE
});

/** e.g. "17 Aug 2026". Returns an em dash for missing/invalid input. */
export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return dateFmt.format(d);
}

/** e.g. "17 Aug 2026, 14:32". */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return dateTimeFmt.format(d);
}

/** Coarse relative time ("3d ago"). Client-only — never render this on a server. */
export function formatRelative(value?: string | Date | null): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * A millisecond duration as something a human can compare at a glance:
 * "2m 14s", "48s", "1.2s", "840ms".
 *
 * Deliberately not `formatRelative`-style — these are measured spans, and the
 * whole point of the analysis timings is to spot the run that took four minutes
 * next to the one that took ninety seconds, so the seconds have to survive.
 */
export function formatDuration(ms?: number | null): string {
  if (ms == null || Number.isNaN(ms) || ms < 0) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;

  const totalSeconds = ms / 1000;
  if (totalSeconds < 10) return `${totalSeconds.toFixed(1)}s`;
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  // 3m 60s is a rounding artefact, not a duration.
  if (seconds === 60) return `${minutes + 1}m 0s`;
  return `${minutes}m ${seconds}s`;
}
