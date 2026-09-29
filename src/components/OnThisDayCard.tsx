import { useMemo, useState } from 'react'
import { wallInZone } from '../lib/dates/zone'
import type { Memory } from '../lib/memories'
import type { MemoryMedia } from '../lib/storage'
import { MemoryPhoto } from './MemoryPhoto'
import { MemoryViewerModal } from './MemoryViewerModal'

type Props = {
  memories: Memory[]
  mediaMap: Record<string, MemoryMedia[]>
  timeZone: string
}

export function OnThisDayCard({ memories, mediaMap, timeZone }: Props) {
  const [now] = useState(() => new Date())
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  const matchingMemories = useMemo(() => {
    const wall = wallInZone(now, timeZone)
    const monthStr = String(wall.mo).padStart(2, '0')
    const dayStr = String(wall.d).padStart(2, '0')
    const suffix = `-${monthStr}-${dayStr}`

    return memories.filter((m) => {
      const year = parseInt(m.memory_date.slice(0, 4), 10)
      return m.memory_date.endsWith(suffix) && year < wall.y
    })
  }, [memories, now, timeZone])

  if (matchingMemories.length === 0) {
    return null
  }

  const primary = matchingMemories[0]
  const wall = wallInZone(now, timeZone)
  const memoryYear = parseInt(primary.memory_date.slice(0, 4), 10)
  const yearsAgo = wall.y - memoryYear
  const primaryMedia = mediaMap[primary.id]?.[0]

  return (
    <>
      <section
        aria-labelledby="on-this-day-title"
        className="mt-12 w-full max-w-md rounded-2xl border border-accent/30 bg-surface p-5 text-left shadow-sm transition hover:border-accent/60 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-base">✨</span>
            <h2 id="on-this-day-title" className="font-serif text-lg font-medium text-text">
              On This Day
            </h2>
          </div>
          <span className="rounded-full bg-accent-soft/40 px-2.5 py-0.5 text-[11px] font-medium text-accent">
            {yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSelectedMemory(primary)}
          className="mt-4 flex w-full flex-col gap-3 text-left group"
        >
          {primaryMedia && (
            <div className="h-44 w-full overflow-hidden rounded-xl border border-border/60">
              <MemoryPhoto
                storageKey={primaryMedia.storage_key}
                alt={primary.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          )}

          <div>
            <h3 className="font-serif text-lg font-normal text-text transition group-hover:text-accent">
              {primary.title}
            </h3>
            {primary.location_name && (
              <p className="mt-0.5 text-xs text-muted">📍 {primary.location_name}</p>
            )}
            {primary.description && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text/80">
                {primary.description}
              </p>
            )}
          </div>

          <span className="mt-1 text-xs font-medium text-accent hover:underline">
            Read memory →
          </span>
        </button>
      </section>

      {selectedMemory && (
        <MemoryViewerModal
          memory={selectedMemory}
          media={mediaMap[selectedMemory.id]}
          onClose={() => setSelectedMemory(null)}
        />
      )}
    </>
  )
}
