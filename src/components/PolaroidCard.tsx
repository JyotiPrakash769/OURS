import { useMemo } from 'react'
import { formatDateOnly } from '../lib/dates/zone'
import type { Memory } from '../lib/memories'
import type { MemoryMedia } from '../lib/storage'
import { MemoryPhoto } from './MemoryPhoto'

type Props = {
  memory: Memory
  media?: MemoryMedia[]
  onClick: () => void
}

function getDeterministicRotation(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  const angles = [-1.8, -1.2, -0.5, 0.6, 1.2, 1.7, -1.0, 0.9]
  const deg = angles[Math.abs(hash) % angles.length]
  return `rotate(${deg}deg)`
}

export function PolaroidCard({ memory, media = [], onClick }: Props) {
  const rotation = useMemo(() => getDeterministicRotation(memory.id), [memory.id])
  const formattedDate = formatDateOnly(new Date(`${memory.memory_date}T00:00:00Z`))
  const primaryPhoto = media[0]

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ transform: rotation }}
      aria-label={`View memory: ${memory.title}`}
      className="group flex w-full flex-col rounded-sm border border-border/70 bg-surface p-3 pb-5 shadow-sm transition-all duration-300 hover:z-10 hover:!rotate-0 hover:scale-[1.02] hover:shadow-xl focus:!rotate-0 focus:outline-hidden sm:p-4 sm:pb-6"
    >
      {/* Photo frame or Polaroid placeholder */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xs bg-bg/80">
        {primaryPhoto ? (
          <MemoryPhoto
            storageKey={primaryPhoto.storage_key}
            alt={memory.title}
            className="h-full w-full object-cover rounded-xs"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <span className="font-serif text-3xl text-muted/60">♡</span>
            <p className="mt-2 line-clamp-3 font-serif text-sm italic text-muted/80">
              "{memory.description || memory.title}"
            </p>
          </div>
        )}

        {media.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
            +{media.length - 1}
          </span>
        )}
      </div>

      {/* Polaroid Bottom Chin */}
      <div className="mt-3.5 flex flex-col text-left">
        <h3 className="line-clamp-1 font-serif text-base font-normal tracking-wide text-text group-hover:text-accent sm:text-lg">
          {memory.title}
        </h3>
        <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted">
          <time dateTime={memory.memory_date}>{formattedDate}</time>
          {memory.location_name && (
            <span className="max-w-[50%] truncate text-muted/80">
              📍 {memory.location_name}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
