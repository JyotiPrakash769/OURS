import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../lib/appContext'
import { formatDateOnly } from '../lib/dates/zone'
import {
  createFutureItem,
  deleteFutureItem,
  loadFutureItems,
  toggleFutureItem,
  updateFutureItem,
  type FutureItem,
} from '../lib/future'

export function FuturePage() {
  const { relationship } = useApp()
  const [items, setItems] = useState<FutureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newTitle, setNewTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    let ignore = false
    loadFutureItems(relationship.id)
      .then((data) => {
        if (!ignore) {
          setItems(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
              ? (err as { message: string }).message
              : err instanceof Error
                ? err.message
                : 'Could not load your bucket list.'
          setError(msg)
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [relationship.id])

  const { activeItems, completedItems } = useMemo(() => {
    const active: FutureItem[] = []
    const completed: FutureItem[] = []
    for (const item of items) {
      if (item.completed) {
        completed.push(item)
      } else {
        active.push(item)
      }
    }
    return { activeItems: active, completedItems: completed }
  }, [items])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const created = await createFutureItem(relationship.id, newTitle)
      setItems((prev) => [created, ...prev])
      setNewTitle('')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Could not add item.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (item: FutureItem) => {
    const nextCompleted = !item.completed
    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              completed: nextCompleted,
              completed_at: nextCompleted ? new Date().toISOString() : null,
            }
          : i,
      ),
    )

    try {
      const updated = await toggleFutureItem(item.id, nextCompleted)
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch {
      // Revert on failure
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
    }
  }

  const handleSaveEdit = async (id: string) => {
    if (!editingText.trim()) {
      setEditingId(null)
      return
    }
    try {
      const updated = await updateFutureItem(id, editingText)
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this dream from your list?')) return
    try {
      await deleteFutureItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Could not delete item.'
      setError(msg)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-text sm:text-4xl">
          Our Future
        </h1>
        <p className="mt-1 text-sm text-muted">
          Dreams, adventures, and quiet moments to share someday.
        </p>
      </div>

      {/* Add Item Bar */}
      <form onSubmit={handleAdd} className="mt-6 flex gap-2">
        <input
          type="text"
          maxLength={200}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What should we do someday? e.g. See the Northern Lights..."
          className="h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-sm text-text placeholder:text-muted/60 shadow-2xs focus:border-accent focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={submitting || !newTitle.trim()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-surface shadow-xs transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? 'Adding…' : '＋ Add'}
        </button>
      </form>

      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-accent/30 bg-accent-soft/20 p-3 text-sm text-accent">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="mt-8 flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <p className="animate-pulse text-sm text-muted">Reading our dreams...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <EmptyState title="Nothing planned yet." line="What should we do someday?" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Dreams */}
            {activeItems.length > 0 && (
              <ul className="space-y-2.5">
                {activeItems.map((item) => {
                  const isEditing = editingId === item.id
                  return (
                    <li
                      key={item.id}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface px-4 py-3.5 shadow-2xs transition hover:border-accent/40"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        {/* Custom romantic check button */}
                        <button
                          type="button"
                          onClick={() => handleToggle(item)}
                          aria-label={`Mark "${item.title}" complete`}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/90 bg-bg text-transparent transition hover:border-accent hover:text-accent/60"
                        >
                          <span className="text-xs">✓</span>
                        </button>

                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={() => handleSaveEdit(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(item.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="h-8 flex-1 rounded-md border border-accent bg-bg px-2 text-sm text-text focus:outline-hidden"
                          />
                        ) : (
                          <span
                            onClick={() => {
                              setEditingId(item.id)
                              setEditingText(item.title)
                            }}
                            className="cursor-pointer text-sm leading-relaxed text-text select-none"
                          >
                            {item.title}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete "${item.title}"`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted/40 opacity-0 transition group-hover:opacity-100 hover:bg-bg hover:text-red-600 focus:opacity-100"
                      >
                        ✕
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Completed Section */}
            {completedItems.length > 0 && (
              <section aria-labelledby="completed-heading" className="pt-2">
                <h2
                  id="completed-heading"
                  className="mb-3 font-serif text-base font-normal tracking-wide text-muted"
                >
                  Completed Together ({completedItems.length})
                </h2>

                <ul className="space-y-2">
                  {completedItems.map((item) => {
                    const completedDateText = item.completed_at
                      ? formatDateOnly(new Date(item.completed_at))
                      : null

                    return (
                      <li
                        key={item.id}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-surface/50 px-4 py-3 transition hover:bg-surface"
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggle(item)}
                            aria-label={`Unmark "${item.title}"`}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent bg-accent text-surface transition hover:opacity-80"
                          >
                            <span className="text-xs">✓</span>
                          </button>

                          <div className="flex flex-col">
                            <span className="text-sm text-muted line-through decoration-border">
                              {item.title}
                            </span>
                            {completedDateText && (
                              <span className="text-[11px] text-muted/70">
                                Completed {completedDateText}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Delete "${item.title}"`}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted/40 opacity-0 transition group-hover:opacity-100 hover:bg-bg hover:text-red-600 focus:opacity-100"
                        >
                          ✕
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
