import { useEffect, useState } from 'react'
import { elapsed } from '../lib/dates/counter'
import { formatInZone } from '../lib/dates/zone'

const pad = (n: number) => String(n).padStart(2, '0')
const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 'S'}`

export function RelationshipCounter({ startAt, timeZone }: { startAt: Date; timeZone: string }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const e = elapsed(startAt, now, timeZone)
  return (
    <div role="timer" className="flex flex-col items-center">
      <div className="font-serif text-6xl leading-tight md:text-8xl">
        {e.years > 0 && <div>{unit(e.years, 'YEAR')}</div>}
        {(e.years > 0 || e.months > 0) && <div>{unit(e.months, 'MONTH')}</div>}
        <div>{unit(e.days, 'DAY')}</div>
      </div>
      <p className="mt-6 font-serif text-3xl tabular-nums text-muted md:text-4xl">
        {pad(e.hours)} : {pad(e.minutes)} : {pad(e.seconds)}
      </p>
      <p className="mt-6 text-sm text-muted">Since {formatInZone(startAt, timeZone)}</p>
    </div>
  )
}
