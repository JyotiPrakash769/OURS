// Wall-clock helpers. A "Wall" is a calendar date + clock time as seen in a specific IANA time zone.
export type Wall = { y: number; mo: number; d: number; h: number; mi: number; s: number }

export const DAY_MS = 86_400_000

/** Days in a month (mo is 1-based). */
export const daysInMonth = (y: number, mo: number) => new Date(Date.UTC(y, mo, 0)).getUTCDate()

/** Treat a Wall as if it were UTC, so wall-clock differences ignore DST shifts. */
export const naive = (w: Wall) => Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s)

export function wallInZone(date: Date, timeZone: string): Wall {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value)
  return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour'), mi: get('minute'), s: get('second') }
}

/** Convert a wall-clock time in a zone to the real instant it refers to. */
export function wallToInstant(w: Wall, timeZone: string): Date {
  const target = naive(w)
  let guess = target
  for (let i = 0; i < 3; i++) {
    const offset = naive(wallInZone(new Date(guess), timeZone)) - guess
    guess = target - offset
  }
  return new Date(guess)
}

/** Format a date-only value stored as UTC midnight, e.g. "12 May 2024". */
export const formatDateOnly = (utcMidnight: Date) =>
  utcMidnight.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })

/** Format an instant as a date in a given zone. */
export const formatInZone = (date: Date, timeZone: string) =>
  date.toLocaleDateString('en-GB', { timeZone, day: 'numeric', month: 'long', year: 'numeric' })
