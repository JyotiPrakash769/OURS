import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { MemoryFormModal } from '../components/MemoryFormModal'
import { TimelineCard } from '../components/TimelineCard'
import { useApp } from '../lib/appContext'
import {
  createMemory,
  deleteMemory,
  loadMemories,
  updateMemory,
  type Memory,
  type MemoryCategory,
  type MemoryInput,
} from '../lib/memories'
import {
  deleteMemoryMedia,
  loadMediaForMemories,
  uploadMemoryPhoto,
  type MemoryMedia,
} from '../lib/storage'
import { sendNotificationToPartner } from '../lib/notifications'

const CATEGORY_FILTERS: { value: MemoryCategory | 'All'; label: string; icon?: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Moment', label: 'Moments', icon: '✨' },
  { value: 'Date', label: 'Dates', icon: '☕' },
  { value: 'Trip', label: 'Trips', icon: '✈️' },
  { value: 'Milestone', label: 'Milestones', icon: '❤️' },
]

export function Story() {
  const { relationship, me } = useApp()
  const [memories, setMemories] = useState<Memory[]>([])
  const [mediaMap, setMediaMap] = useState<Record<string, MemoryMedia[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeCategory, setActiveCategory] = useState<MemoryCategory | 'All'>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)

  const startYear = useMemo(() => {
    return new Date(relationship.relationship_start_at).getFullYear()
  }, [relationship.relationship_start_at])

  const refreshMemories = useCallback(async () => {
    try {
      setError(null)
      const [data, mediaData] = await Promise.all([
        loadMemories(relationship.id),
        loadMediaForMemories(relationship.id),
      ])
      setMemories(data)
      setMediaMap(mediaData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load memories.')
    } finally {
      setLoading(false)
    }
  }, [relationship.id])

  useEffect(() => {
    let ignore = false
    Promise.all([loadMemories(relationship.id), loadMediaForMemories(relationship.id)])
      .then(([data, mediaData]) => {
        if (!ignore) {
          setMemories(data)
          setMediaMap(mediaData)
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

  const filteredMemories = useMemo(() => {
    if (activeCategory === 'All') return memories
    return memories.filter((m) => m.category === activeCategory)
  }, [memories, activeCategory])

  // Group memories by year
  const groupedByYear = useMemo(() => {
    const groups: { year: number; items: Memory[] }[] = []
    for (const mem of filteredMemories) {
      const y = parseInt(mem.memory_date.slice(0, 4), 10)
      let group = groups.find((g) => g.year === y)
      if (!group) {
        group = { year: y, items: [] }
        groups.push(group)
      }
      group.items.push(mem)
    }
    return groups
  }, [filteredMemories])

  const handleSave = async (input: MemoryInput, photoFile?: File | null) => {
    let savedMemory: Memory
    if (editingMemory) {
      savedMemory = await updateMemory(editingMemory.id, input)
      setMemories((prev) => prev.map((m) => (m.id === savedMemory.id ? savedMemory : m)))
    } else {
      savedMemory = await createMemory(relationship.id, input)
      setMemories((prev) => [savedMemory, ...prev])
      sendNotificationToPartner({
        relationshipId: relationship.id,
        title: '✨ New Memory Added',
        body: `${me?.display_name || 'Your partner'} added "${savedMemory.title}" to Our Story.`,
        url: '/app/story',
      })
    }

    if (photoFile) {
      const mediaItem = await uploadMemoryPhoto(relationship.id, savedMemory.id, photoFile)
      setMediaMap((prev) => ({
        ...prev,
        [savedMemory.id]: [...(prev[savedMemory.id] ?? []), mediaItem],
      }))
    }
  }

  const handleDeleteMedia = async (mediaId: string, storageKey: string) => {
    await deleteMemoryMedia(mediaId, storageKey)
    setMediaMap((prev) => {
      const next = { ...prev }
      for (const k of Object.keys(next)) {
        next[k] = next[k].filter((m) => m.id !== mediaId)
      }
      return next
    })
  }

  const handleDelete = async (id: string) => {
    await deleteMemory(id)
    setMemories((prev) => prev.filter((m) => m.id !== id))
    setMediaMap((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-text sm:text-4xl">
            Our Story
          </h1>
          <p className="mt-1 text-sm text-muted">
            Every little moment, date, and milestone that brought us here.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMemory(null)
            setModalOpen(true)
          }}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-surface shadow-xs transition hover:opacity-90 active:scale-[0.98]"
        >
          <span className="text-base leading-none">＋</span>
          <span>Add Memory</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      {memories.length > 0 && (
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
          {CATEGORY_FILTERS.map((cat) => {
            const isSelected = activeCategory === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-accent text-surface shadow-xs'
                    : 'border border-border/80 bg-surface text-muted hover:border-border hover:text-text'
                }`}
              >
                {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Main content: Loading, Error, Empty, or Timeline */}
      <div className="mt-8 flex-1">
        {loading && memories.length === 0 ? (
          <div className="flex justify-center py-20">
            <p className="text-sm text-muted animate-pulse">Loading our story...</p>
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-accent/30 bg-accent-soft/20 p-6 text-center text-sm text-accent">
            <p>{error}</p>
            <button
              type="button"
              onClick={refreshMemories}
              className="mt-3 text-xs font-medium underline underline-offset-2"
            >
              Try refreshing
            </button>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {memories.length === 0 ? (
              <>
                <EmptyState title="Nothing here yet." line="Your story is waiting for its first page." />
                <button
                  type="button"
                  onClick={() => {
                    setEditingMemory(null)
                    setModalOpen(true)
                  }}
                  className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-surface shadow-xs transition hover:opacity-90"
                >
                  <span>Save our first memory</span>
                </button>
              </>
            ) : (
              <EmptyState title="No matching memories." line="Try selecting a different category filter above." />
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {groupedByYear.map((group) => {
              const isStartYear = group.year === startYear
              return (
                <section key={group.year} aria-labelledby={`year-${group.year}`}>
                  {/* Year Header Separator */}
                  <div className="relative mb-6 flex items-center gap-3">
                    <h2
                      id={`year-${group.year}`}
                      className="font-serif text-2xl font-normal text-text md:text-3xl"
                    >
                      {group.year}
                    </h2>
                    {isStartYear && (
                      <span className="font-serif text-sm italic text-muted">
                        · The beginning.
                      </span>
                    )}
                    <div className="h-px flex-1 bg-border/70" />
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative border-l-2 border-border/60 pl-5 ml-2.5 sm:ml-4 sm:pl-7 space-y-6">
                    {group.items.map((mem) => (
                      <div key={mem.id} className="relative">
                        {/* Timeline Node Bullet */}
                        <div
                          aria-hidden="true"
                          className="absolute -left-[27px] sm:-left-[35px] top-6 h-3 w-3 rounded-full border-2 border-surface bg-accent shadow-xs"
                        />
                        <TimelineCard
                          memory={mem}
                          media={mediaMap[mem.id]}
                          onEdit={(m) => {
                            setEditingMemory(m)
                            setModalOpen(true)
                          }}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <MemoryFormModal
          initial={editingMemory}
          existingMedia={editingMemory ? (mediaMap[editingMemory.id] ?? []) : []}
          onSave={handleSave}
          onDeleteMedia={handleDeleteMedia}
          onDelete={handleDelete}
          onClose={() => {
            setModalOpen(false)
            setEditingMemory(null)
          }}
        />
      )}
    </div>
  )
}
