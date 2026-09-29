import { useEffect } from 'react'
import { formatDateOnly } from '../lib/dates/zone'
import { MEMORY_CATEGORIES, type Memory } from '../lib/memories'
import type { MemoryMedia } from '../lib/storage'
import { MemoryPhoto } from './MemoryPhoto'

type Props = {
  memory: Memory
  media?: MemoryMedia[]
  onClose: () => void
  onNextRandom?: () => void
  onDelete?: (id: string) => void
}

export function MemoryViewerModal({ memory, media = [], onClose, onNextRandom, onDelete }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const formattedDate = formatDateOnly(new Date(`${memory.memory_date}T00:00:00Z`))
  const categoryMeta = MEMORY_CATEGORIES.find((c) => c.value === memory.category) ?? {
    value: memory.category,
    label: memory.category,
    icon: '✨',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-2xl">
        {/* Close & Random buttons on top header */}
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-bg px-2.5 py-0.5 text-xs font-medium text-muted">
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.label}</span>
            </span>
            <span className="text-xs text-muted">· {formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            {onNextRandom && (
              <button
                type="button"
                onClick={onNextRandom}
                title="View another random memory"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-bg px-3 text-xs font-medium text-text transition hover:border-accent hover:text-accent"
              >
                <span>✨</span>
                <span className="hidden sm:inline">Another memory</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${memory.title}"? This cannot be undone.`)) {
                    onDelete(memory.id)
                    onClose()
                  }
                }}
                title="Delete this memory"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-red-500"
              >
                🗑️
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-text"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Photos */}
          {media.length > 0 && (
            <div className="mb-6 space-y-4">
              {media.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-xl border border-border/70 shadow-sm">
                  <MemoryPhoto storageKey={item.storage_key} alt={memory.title} />
                </div>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 id="viewer-title" className="font-serif text-2xl font-normal text-text sm:text-3xl">
            {memory.title}
          </h2>

          {/* Date & Location */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
            <time dateTime={memory.memory_date}>{formattedDate}</time>
            {memory.location_name && (
              <span className="flex items-center gap-1">
                <span>📍</span>
                <span>{memory.location_name}</span>
              </span>
            )}
          </div>

          {/* Description */}
          {memory.description && (
            <div className="mt-5 border-t border-border/60 pt-5">
              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text/85 sm:text-base">
                {memory.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
