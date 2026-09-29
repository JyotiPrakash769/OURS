import { useState } from 'react'
import { formatDateOnly } from '../lib/dates/zone'
import { MEMORY_CATEGORIES, type Memory } from '../lib/memories'

import { MemoryPhoto } from './MemoryPhoto'
import type { MemoryMedia } from '../lib/storage'

type Props = {
  memory: Memory
  media?: MemoryMedia[]
  onEdit: (memory: Memory) => void
}

function formatMemoryTime(timeStr: string | null): string | null {
  if (!timeStr) return null
  const [hStr, mStr] = timeStr.split(':')
  const h = Number(hStr)
  const m = Number(mStr)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  const period = h >= 12 ? 'pm' : 'am'
  const displayH = h % 12 === 0 ? 12 : h % 12
  const displayM = m.toString().padStart(2, '0')
  return `${displayH}:${displayM} ${period}`
}

export function TimelineCard({ memory, media = [], onEdit }: Props) {
  const [expanded, setExpanded] = useState(false)
  const categoryMeta = MEMORY_CATEGORIES.find((c) => c.value === memory.category) ?? {
    value: memory.category,
    label: memory.category,
    icon: '✨',
  }

  // Parse YYYY-MM-DD as UTC midnight to avoid local timezone day shifting
  const formattedDate = formatDateOnly(new Date(`${memory.memory_date}T00:00:00Z`))
  const formattedTime = formatMemoryTime(memory.memory_time)

  const isLongDescription = Boolean(memory.description && memory.description.length > 180)

  return (
    <article className="group relative rounded-2xl border border-border/80 bg-surface p-5 shadow-xs transition hover:border-accent/40 hover:shadow-md">
      {/* Top row: Category tag + Date + Edit button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-bg px-2.5 py-0.5 text-xs font-medium text-muted">
            <span aria-hidden="true">{categoryMeta.icon}</span>
            <span>{categoryMeta.label}</span>
          </span>
          {formattedTime && <span className="text-xs text-muted/80">{formattedTime}</span>}
        </div>

        <button
          type="button"
          onClick={() => onEdit(memory)}
          aria-label={`Edit ${memory.title}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted/60 opacity-0 transition group-hover:opacity-100 hover:bg-bg hover:text-text focus:opacity-100"
        >
          ✎
        </button>
      </div>

      {/* Title */}
      <h3 className="mt-2.5 font-serif text-lg font-medium text-text md:text-xl">
        {memory.title}
      </h3>

      {/* Date & Location */}
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <time dateTime={memory.memory_date}>{formattedDate}</time>
        {memory.location_name && (
          <span className="flex items-center gap-1 text-muted">
            <span aria-hidden="true">📍</span>
            <span>{memory.location_name}</span>
          </span>
        )}
      </div>

      {/* Photos */}
      {media && media.length > 0 && (
        <div className="mt-3.5 space-y-2">
          {media.map((item) => (
            <MemoryPhoto key={item.id} storageKey={item.storage_key} alt={memory.title} />
          ))}
        </div>
      )}

      {/* Description / Story text */}
      {memory.description && (
        <div className="mt-3 text-sm leading-relaxed text-text/85">
          <p className={!expanded && isLongDescription ? 'line-clamp-3' : 'whitespace-pre-wrap'}>
            {memory.description}
          </p>
          {isLongDescription && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 text-xs font-medium text-accent hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
