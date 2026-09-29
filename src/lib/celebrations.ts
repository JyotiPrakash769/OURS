import { wallInZone } from './dates/zone'

export type CelebrationType =
  | 'none'
  | 'kiss_day'
  | 'monthly_anniversary'
  | 'half_year_jubilee'
  | 'annual_grand_gala'

export type ParticleMode = 'petals' | 'confetti' | 'crackers_flowers' | 'golden_fireworks'

export type CelebrationInfo = {
  type: CelebrationType
  day: number
  months: number
  years: number
  title: string
  headline: string
  wish: string
  details: string
  badgeLabel?: string
  particleMode: ParticleMode
  accentGradient: string
  bgGlow: string
  borderColor: string
}

// Reference milestone origins:
// First kiss: 25th July 2026 (Jaydev Vatika)
// Official Proposal / Anniversary: 29th July 2026 (Khordha Park)
const ORIGIN_YEAR = 2026
const ORIGIN_MONTH = 7 // July

export function getCelebrationInfo(
  now: Date,
  timeZone: string,
  couple: { meName: string; partnerName?: string },
  forcedType?: CelebrationType
): CelebrationInfo | null {
  const wall = wallInZone(now, timeZone)
  const day = wall.d
  const month = wall.mo
  const year = wall.y

  // Calculate elapsed months since July 2026
  const elapsedMonths = Math.max(0, (year - ORIGIN_YEAR) * 12 + (month - ORIGIN_MONTH))
  const elapsedYears = Math.floor(elapsedMonths / 12)

  let type: CelebrationType = 'none'

  if (forcedType && forcedType !== 'none') {
    type = forcedType
  } else if (day === 25) {
    type = 'kiss_day'
  } else if (day === 29) {
    if (month === ORIGIN_MONTH && elapsedYears >= 1) {
      type = 'annual_grand_gala'
    } else if (elapsedMonths > 0 && elapsedMonths % 6 === 0) {
      type = 'half_year_jubilee'
    } else {
      type = 'monthly_anniversary'
    }
  }

  if (type === 'none') {
    return null
  }

  const coupleNames = couple.partnerName
    ? `${couple.meName} & ${couple.partnerName}`
    : couple.meName

  switch (type) {
    case 'kiss_day': {
      const kissMonths = elapsedMonths || 1
      return {
        type: 'kiss_day',
        day: 25,
        months: kissMonths,
        years: elapsedYears,
        title: 'First Kiss Anniversary 💋✨',
        headline: `25th of the Month · Our First Kiss`,
        wish: `Happy Kiss Anniversary, ${coupleNames}! 💋✨`,
        details: `Celebrating ${kissMonths} month${kissMonths > 1 ? 's' : ''} since that sweet, unforgettable evening at Jaydev Vatika when our lips first met.`,
        badgeLabel: '💋 First Kiss Day',
        particleMode: 'petals',
        accentGradient: 'from-rose-500/20 via-pink-500/15 to-amber-500/20',
        bgGlow: 'rgba(244, 63, 94, 0.15)',
        borderColor: 'border-pink-500/30',
      }
    }

    case 'annual_grand_gala': {
      const yearCount = Math.max(1, elapsedYears)
      return {
        type: 'annual_grand_gala',
        day: 29,
        months: elapsedMonths,
        years: yearCount,
        title: `${yearCount} Year Anniversary! 👑🎆✨`,
        headline: `29th July · Grand Annual Celebration`,
        wish: `Happy ${yearCount} Year Anniversary to ${coupleNames}! 🎉🎉🎊🎊🥂`,
        details: `365 days of devotion, happiness, cinema dates, and growing together since that magical proposal at Khordha Park where forever began!`,
        badgeLabel: `👑 ${yearCount} Year Golden Jubilee`,
        particleMode: 'golden_fireworks',
        accentGradient: 'from-amber-500/30 via-yellow-400/20 to-rose-500/30',
        bgGlow: 'rgba(234, 179, 8, 0.22)',
        borderColor: 'border-amber-400/50',
      }
    }

    case 'half_year_jubilee': {
      return {
        type: 'half_year_jubilee',
        day: 29,
        months: elapsedMonths,
        years: elapsedYears,
        title: `Half-Year Milestone: ${elapsedMonths} Months! 🌸🎆`,
        headline: `29th Milestone · 6-Month Special Jubilee`,
        wish: `Congratulations for the wonderful time you have spent together! 🎉🎉🎊🎊`,
        details: `Half a year of inseparable love, shared laughs, and countless precious memories. You two make every moment truly extraordinary!`,
        badgeLabel: `🌸 6-Month Milestone 🥂`,
        particleMode: 'crackers_flowers',
        accentGradient: 'from-emerald-500/20 via-rose-500/20 to-purple-500/20',
        bgGlow: 'rgba(168, 85, 247, 0.18)',
        borderColor: 'border-purple-400/40',
      }
    }

    case 'monthly_anniversary':
    default: {
      const monthNum = elapsedMonths || 2
      const ordinal = getOrdinal(monthNum)
      return {
        type: 'monthly_anniversary',
        day: 29,
        months: monthNum,
        years: elapsedYears,
        title: `Happy ${ordinal} Month Anniversary! ❤️`,
        headline: `29th of the Month · Official Anniversary`,
        wish: `Congratulations for the time you have spent together! 🎉🎉🎊🎊`,
        details: `Cheers to ${monthNum} month${monthNum > 1 ? 's' : ''} of loving each other, laughter, movie dates, and holding hands. Here is to a lifetime more!`,
        badgeLabel: `🎉 ${ordinal} Month Milestone`,
        particleMode: 'confetti',
        accentGradient: 'from-accent/25 via-pink-500/15 to-accent-soft/30',
        bgGlow: 'rgba(225, 29, 72, 0.15)',
        borderColor: 'border-accent/40',
      }
    }
  }
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
