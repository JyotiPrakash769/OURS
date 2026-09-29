import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { InvitePanel } from '../components/InvitePanel'
import { OnThisDayCard } from '../components/OnThisDayCard'
import { RelationshipCounter } from '../components/RelationshipCounter'
import { useApp } from '../lib/appContext'
import { nextMilestone } from '../lib/dates/milestones'
import { formatDateOnly } from '../lib/dates/zone'
import { loadMemories, type Memory } from '../lib/memories'
import { loadMediaForMemories, type MemoryMedia } from '../lib/storage'

export function Home() {
  const { relationship, me, partner } = useApp()
  const startAt = useMemo(() => new Date(relationship.relationship_start_at), [relationship.relationship_start_at])
  const [now] = useState(() => new Date())
  const next = useMemo(() => nextMilestone(startAt, now, relationship.timezone), [startAt, now, relationship.timezone])

  const [memories, setMemories] = useState<Memory[]>([])
  const [mediaMap, setMediaMap] = useState<Record<string, MemoryMedia[]>>({})

  useEffect(() => {
    let ignore = false
    Promise.all([loadMemories(relationship.id), loadMediaForMemories(relationship.id)])
      .then(([mems, media]) => {
        if (!ignore) {
          setMemories(mems)
          setMediaMap(media)
        }
      })
      .catch(() => {
        // If memories fail to load for Home, non-critical
      })

    return () => {
      ignore = true
    }
  }, [relationship.id])

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <p className="mb-8 font-serif text-2xl text-muted">
        {partner ? `${me.display_name} + ${partner.display_name}` : me.display_name}
      </p>
      <RelationshipCounter startAt={startAt} timeZone={relationship.timezone} />
      <p className="mt-10 text-sm text-muted">
        Next: {next.label} · {next.daysAway === 0 ? 'today' : `${formatDateOnly(next.date)}, in ${next.daysAway} days`}
      </p>

      {/* On This Day card (renders only if today matches past memories) */}
      <OnThisDayCard
        memories={memories}
        mediaMap={mediaMap}
        timeZone={relationship.timezone}
      />

      {/* Letters shortcut */}
      <div className="mt-8">
        <Link
          to="/app/letters"
          className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-border/80 bg-surface px-4 py-2 text-xs font-medium text-muted transition hover:border-accent hover:text-accent shadow-2xs"
        >
          <span>💌</span>
          <span>Letters to each other</span>
        </Link>
      </div>

      {!partner && <InvitePanel />}
    </div>
  )
}
