import { DAY_MS, daysInMonth, wallInZone } from './zone'

// Deliberately short list (per spec): day milestones plus the yearly anniversary.
const DAY_MILESTONES = [100, 365, 500, 1000]

export type Milestone = {
  label: string
  /** Calendar date stored as UTC midnight; format with formatDateOnly. */
  date: Date
  daysAway: number
}

export function nextMilestone(start: Date, now: Date, timeZone: string): Milestone {
  const s = wallInZone(start, timeZone)
  const n = wallInZone(now, timeZone)
  const today = Date.UTC(n.y, n.mo - 1, n.d)
  const startDay = Date.UTC(s.y, s.mo - 1, s.d)
  const make = (label: string, d: number): Milestone => ({ label, date: new Date(d), daysAway: (d - today) / DAY_MS })

  const candidates: Milestone[] = []

  // Anniversary first, so it wins ties with a day milestone landing on the same date.
  for (let y = Math.max(s.y + 1, n.y); ; y++) {
    const d = Date.UTC(y, s.mo - 1, Math.min(s.d, daysInMonth(y, s.mo)))
    if (d >= today) {
      const years = y - s.y
      candidates.push(make(`${years} year${years > 1 ? 's' : ''} together`, d))
      break
    }
  }
  for (const days of DAY_MILESTONES) {
    const d = startDay + days * DAY_MS
    if (d >= today) candidates.push(make(`${days} days`, d))
  }

  return candidates.reduce((best, c) => (c.daysAway < best.daysAway ? c : best))
}
