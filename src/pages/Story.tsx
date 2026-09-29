import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { MemoryFormModal } from '../components/MemoryFormModal'
import { TimelineCard } from '../components/TimelineCard'
import { useApp } from '../lib/appContext'
import {
  createMemory,
  createMemoriesBatch,
  deleteMemory,
  loadMemories,
  updateMemory,
  type Memory,
  type MemoryCategory,
  type MemoryInput,
} from '../lib/memories'
import { DEFAULT_MEMORIES } from '../lib/defaultMemories'
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
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  const [activeCategory, setActiveCategory] = useState<MemoryCategory | 'All'>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)

  const unimportedCount = useMemo(() => {
    const existingTitles = new Set(memories.map((m) => m.title.trim().toLowerCase()))
    return DEFAULT_MEMORIES.filter((d) => !existingTitles.has(d.title.trim().toLowerCase())).length
  }, [memories])

  const handleImportDefaultMemories = async () => {
    try {
      setImporting(true)
      setError(null)
      const existingTitles = new Set(memories.map((m) => m.title.trim().toLowerCase()))
      const toInsert = DEFAULT_MEMORIES.filter(
        (m) => !existingTitles.has(m.title.trim().toLowerCase())
      )

      if (toInsert.length === 0) {
        setImportSuccess('All 23 memories are already in your story!')
        setTimeout(() => setImportSuccess(null), 4000)
        return
      }

      const inserted = await createMemoriesBatch(relationship.id, toInsert)
      setMemories((prev) =>
        [...inserted, ...prev].sort((a, b) => b.memory_date.localeCompare(a.memory_date))
      )
      setImportSuccess(`Successfully added ${inserted.length} memories to Our Story! ❤️`)
      setTimeout(() => setImportSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import memories.')
    } finally {
      setImporting(false)
    }
  }

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
      {/* Success alert */}
      {importSuccess && (
        <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          {importSuccess}
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-2">
          {unimportedCount > 0 && memories.length > 0 && (
            <button
              type="button"
              disabled={importing}
              onClick={handleImportDefaultMemories}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent-soft/30 px-4 py-2.5 text-xs font-medium text-accent shadow-xs transition hover:bg-accent-soft/50 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{importing ? 'Adding...' : `✨ Add ${unimportedCount} Predefined Memories`}</span>
            </button>
          )}

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
          <div className="flex flex-col items-center justify-center py-10 text-center">
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full">
                <div className="rounded-2xl border border-accent/25 bg-accent-soft/30 p-6 shadow-sm w-full">
                  <div className="text-3xl mb-2">📖✨</div>
                  <h3 className="font-serif text-xl font-medium text-text">Your Story Timeline Ready</h3>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    All 23 of your dates, movies, park walks, and milestones from 5th July to 29th September are ready to add in one click!
                  </p>
                  <button
                    type="button"
                    disabled={importing}
                    onClick={handleImportDefaultMemories}
                    className="mt-5 w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-surface shadow-xs transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  >
                    <span>{importing ? 'Adding all 23 memories...' : '✨ Add All 23 Memories (1-Click)'}</span>
                  </button>
                </div>

                <div className="my-6 flex items-center gap-3 w-full">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-xs text-muted">or start blank</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingMemory(null)
                    setModalOpen(true)
                  }}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs font-medium text-text transition hover:bg-surface-elevated"
                >
                  <span>＋ Save a custom memory</span>
                </button>
              </div>
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
