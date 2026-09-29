import { describe, expect, it } from 'vitest'
import { getCelebrationInfo } from './celebrations'

describe('getCelebrationInfo', () => {
  const couple = { meName: 'Jyoti', partnerName: 'Sweetheart' }
  const timeZone = 'Asia/Kolkata'

  it('detects 25th as First Kiss Anniversary with rose petals', () => {
    // 25th September 2026
    const date = new Date('2026-09-25T12:00:00+05:30')
    const celebration = getCelebrationInfo(date, timeZone, couple)

    expect(celebration).not.toBeNull()
    expect(celebration?.type).toBe('kiss_day')
    expect(celebration?.title).toContain('First Kiss Anniversary')
    expect(celebration?.particleMode).toBe('petals')
    expect(celebration?.wish).toContain('Happy Kiss Anniversary')
  })

  it('detects 29th September as 2nd Month Anniversary with congratulations wish and confetti', () => {
    // 29th September 2026 (Today!)
    const date = new Date('2026-09-29T12:00:00+05:30')
    const celebration = getCelebrationInfo(date, timeZone, couple)

    expect(celebration).not.toBeNull()
    expect(celebration?.type).toBe('monthly_anniversary')
    expect(celebration?.months).toBe(2)
    expect(celebration?.title).toContain('2nd Month Anniversary')
    expect(celebration?.wish).toBe('Congratulations for the time you have spent together! 🎉🎉🎊🎊')
    expect(celebration?.particleMode).toBe('confetti')
  })

  it('detects 6-month jubilee on 29th January with flowers and crackers', () => {
    // 29th January 2027 (6 months from July 2026)
    const date = new Date('2027-01-29T12:00:00+05:30')
    const celebration = getCelebrationInfo(date, timeZone, couple)

    expect(celebration).not.toBeNull()
    expect(celebration?.type).toBe('half_year_jubilee')
    expect(celebration?.months).toBe(6)
    expect(celebration?.title).toContain('Half-Year Milestone')
    expect(celebration?.particleMode).toBe('crackers_flowers')
  })

  it('detects grand annual gala on 29th July with golden fireworks', () => {
    // 29th July 2027 (1 Year Anniversary)
    const date = new Date('2027-07-29T12:00:00+05:30')
    const celebration = getCelebrationInfo(date, timeZone, couple)

    expect(celebration).not.toBeNull()
    expect(celebration?.type).toBe('annual_grand_gala')
    expect(celebration?.years).toBe(1)
    expect(celebration?.title).toContain('1 Year Anniversary')
    expect(celebration?.particleMode).toBe('golden_fireworks')
  })

  it('returns null on a normal day', () => {
    // 10th August 2026
    const date = new Date('2026-08-10T12:00:00+05:30')
    const celebration = getCelebrationInfo(date, timeZone, couple)
    expect(celebration).toBeNull()
  })

  it('allows forced preview mode on any day', () => {
    const normalDay = new Date('2026-08-10T12:00:00+05:30')
    const preview = getCelebrationInfo(normalDay, timeZone, couple, 'annual_grand_gala')
    expect(preview?.type).toBe('annual_grand_gala')
  })
})
