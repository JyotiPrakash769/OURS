import { describe, expect, it } from 'vitest'
import { elapsed } from './counter'
import { nextMilestone } from './milestones'
import { wallInZone, wallToInstant } from './zone'

const IST = 'Asia/Kolkata'
const NY = 'America/New_York'
const at = (y: number, mo: number, d: number, h = 0, mi = 0, s = 0, tz = IST) =>
  wallToInstant({ y, mo, d, h, mi, s }, tz)
const parts = (e: ReturnType<typeof elapsed>) => [e.years, e.months, e.days, e.hours, e.minutes, e.seconds]

describe('zone conversion', () => {
  it('maps IST wall time to the right UTC instant', () => {
    expect(at(2024, 5, 12, 23, 30).toISOString()).toBe('2024-05-12T18:00:00.000Z')
  })
  it('round-trips wall time in zones with and without DST', () => {
    for (const tz of [IST, NY]) {
      const w = { y: 2024, mo: 11, d: 3, h: 9, mi: 15, s: 30 }
      expect(wallInZone(wallToInstant(w, tz), tz)).toEqual(w)
    }
  })
})

describe('elapsed', () => {
  it('splits years, months, days and time', () => {
    const e = elapsed(at(2024, 5, 12, 18, 30), at(2026, 9, 29, 11, 15), IST)
    expect(parts(e)).toEqual([2, 4, 16, 16, 45, 0])
  })
  it('is exact on the anniversary and one second before it', () => {
    const start = at(2024, 5, 12, 18, 30)
    expect(parts(elapsed(start, at(2025, 5, 12, 18, 30), IST))).toEqual([1, 0, 0, 0, 0, 0])
    expect(parts(elapsed(start, at(2025, 5, 12, 18, 29, 59), IST))).toEqual([0, 11, 29, 23, 59, 59])
  })
  it('handles month-end starts (31 Jan)', () => {
    const e = elapsed(at(2025, 1, 31, 10), at(2025, 3, 1, 10), IST)
    expect(parts(e)).toEqual([0, 1, 1, 0, 0, 0])
  })
  it('handles a 29 Feb start: anniversary is 28 Feb in non-leap years, 29 Feb in leap years', () => {
    const start = at(2024, 2, 29, 12)
    expect(parts(elapsed(start, at(2025, 2, 28, 12), IST))).toEqual([1, 0, 0, 0, 0, 0])
    expect(parts(elapsed(start, at(2028, 2, 29, 12), IST))).toEqual([4, 0, 0, 0, 0, 0])
  })
  it('counts on the wall clock across a DST change', () => {
    const e = elapsed(at(2024, 3, 1, 12, 0, 0, NY), at(2024, 4, 1, 12, 0, 0, NY), NY)
    expect(parts(e)).toEqual([0, 1, 0, 0, 0, 0])
  })
  it('reports not started when now is before the start', () => {
    expect(elapsed(at(2030, 1, 1), at(2026, 1, 1), IST).started).toBe(false)
  })
  it('counts total elapsed days', () => {
    expect(elapsed(at(2024, 5, 12, 18, 30), at(2024, 8, 20, 18, 30), IST).totalDays).toBe(100)
  })
})

describe('nextMilestone', () => {
  const start = at(2024, 5, 12, 18, 30)
  it('finds the 100-day milestone the day before and on the day', () => {
    expect(nextMilestone(start, at(2024, 8, 19, 12), IST)).toMatchObject({ label: '100 days', daysAway: 1 })
    expect(nextMilestone(start, at(2024, 8, 20, 12), IST)).toMatchObject({ label: '100 days', daysAway: 0 })
  })
  it('prefers the anniversary when it ties with 365 days', () => {
    expect(nextMilestone(start, at(2025, 5, 1, 12), IST).label).toBe('1 year together')
  })
  it('moves on to 500 days after the first anniversary', () => {
    expect(nextMilestone(start, at(2025, 5, 13, 12), IST)).toMatchObject({ label: '500 days', daysAway: 134 })
  })
})
