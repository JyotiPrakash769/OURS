import { useEffect, useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { MemoryViewerModal } from '../components/MemoryViewerModal'
import { PolaroidCard } from '../components/PolaroidCard'
import { useApp } from '../lib/appContext'
import { deleteMemory, loadMemories, type Memory } from '../lib/memories'
import { loadMediaForMemories, type MemoryMedia } from '../lib/storage'

export function MemoriesWall() {
  const { relationship } = useApp()
  const [memories, setMemories] = useState<Memory[]>([])
  const [mediaMap, setMediaMap] = useState<Record<string, MemoryMedia[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fullscreen viewer modal
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [lastRandomId, setLastRandomId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let ignore = false
    Promise.all([loadMemories(relationship.id), loadMediaForMemories(relationship.id)])
      .then(([mems, media]) => {
        if (!ignore) {
          setMemories(mems)
          setMediaMap(media)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Could not load memories.')
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [relationship.id])

  const handleTakeMeSomewhere = () => {
    if (memories.length === 0) return

    // Pick a random memory different from the current one
    const eligible = memories.length > 1 ? memories.filter((m) => m.id !== lastRandomId) : memories
    const picked = eligible[Math.floor(Math.random() * eligible.length)]

    startTransition(() => {
      setLastRandomId(picked.id)
      setSelectedMemory(picked)
    })
  }

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id)
      setMemories((prev) => prev.filter((m) => m.id !== id))
      setSelectedMemory(null)
    } catch {
      alert('Could not delete memory.')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-text sm:text-4xl">
            Memory Wall
          </h1>
          <p className="mt-1 text-sm text-muted">
            Our scrapbook of captured days and little moments.
          </p>
        </div>

        {memories.length > 0 && (
          <button
            type="button"
            onClick={handleTakeMeSomewhere}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent-soft/30 px-5 py-2.5 text-sm font-medium text-accent shadow-xs transition hover:bg-accent hover:text-surface active:scale-[0.98]"
          >
            <span>✨</span>
            <span>Take me somewhere</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="mt-8 flex-1">
        {loading ? (
          <div className="flex justify-center py-24">
            <p className="animate-pulse text-sm text-muted">Opening our scrapbook...</p>
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-accent/30 bg-accent-soft/20 p-6 text-center text-sm text-accent">
            <p>{error}</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <EmptyState title="No memories yet." line="Save the next little moment." />
            <Link
              to="/app/story"
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-surface shadow-xs transition hover:opacity-90"
            >
              <span>Add to Our Story</span>
            </Link>
          </div>
        ) : (
          /* Masonry Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {memories.map((mem) => (
              <div key={mem.id} className="flex">
                <PolaroidCard
                  memory={mem}
                  media={mediaMap[mem.id]}
                  onClick={() => setSelectedMemory(mem)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen memory viewer */}
      {selectedMemory && (
        <MemoryViewerModal
          memory={selectedMemory}
          media={mediaMap[selectedMemory.id]}
          onClose={() => setSelectedMemory(null)}
          onNextRandom={memories.length > 1 ? handleTakeMeSomewhere : undefined}
          onDelete={handleDeleteMemory}
        />
      )}
    </div>
  )
}
