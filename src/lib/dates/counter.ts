import { daysInMonth, naive, wallInZone, type Wall, DAY_MS } from './zone'

export type Elapsed = {
  started: boolean
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
}

const EMPTY: Elapsed = { started: false, years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 }

/** Add calendar months, clamping the day to the end of shorter months (31 Jan + 1 month = 28/29 Feb). */
function addMonths(w: Wall, n: number): Wall {
  const total = w.y * 12 + (w.mo - 1) + n
  const y = Math.floor(total / 12)
  const mo = (total % 12) + 1
  return { ...w, y, mo, d: Math.min(w.d, daysInMonth(y, mo)) }
}

/**
 * Calendar-aware elapsed time between two instants, measured on the wall clock of `timeZone`.
 * Complete months are counted first; the remainder is split into days/hours/minutes/seconds.
 */
export function elapsed(start: Date, now: Date, timeZone: string): Elapsed {
  const s = wallInZone(start, timeZone)
  const n = wallInZone(now, timeZone)
  if (naive(n) < naive(s)) return EMPTY

  let months = (n.y - s.y) * 12 + (n.mo - s.mo)
  if (naive(addMonths(s, months)) > naive(n)) months--

  let rest = Math.floor((naive(n) - naive(addMonths(s, months))) / 1000)
  const days = Math.floor(rest / 86400)
  rest -= days * 86400
  const hours = Math.floor(rest / 3600)
  rest -= hours * 3600
  const minutes = Math.floor(rest / 60)

  return {
    started: true,
    years: Math.floor(months / 12),
    months: months % 12,
    days,
    hours,
    minutes,
    seconds: rest - minutes * 60,
    totalDays: Math.floor((naive(n) - naive(s)) / DAY_MS),
  }
}
