import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { FutureItemCard } from '../components/FutureItemCard'
import { useApp } from '../lib/appContext'
import {
  createFutureItem,
  deleteFutureItem,
  loadFutureItems,
  toggleFutureItem,
  updateFutureItem,
  type FutureItem,
} from '../lib/future'
import { sendNotificationToPartner } from '../lib/notifications'

export function FuturePage() {
  const { relationship, me } = useApp()
  const [items, setItems] = useState<FutureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newTitle, setNewTitle] = useState('')
  const [newTargetAt, setNewTargetAt] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      const targetIso = newTargetAt ? new Date(newTargetAt).toISOString() : null
      const created = await createFutureItem(relationship.id, newTitle, targetIso)
      setItems((prev) => [created, ...prev])
      sendNotificationToPartner({
        relationshipId: relationship.id,
        title: '🧭 New Bucket List Goal',
        body: `${me?.display_name || 'Your partner'} added "${newTitle}" to Our Future.`,
        url: '/app/future',
      })
      setNewTitle('')
      setNewTargetAt('')
      setShowDatePicker(false)
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
      if (nextCompleted) {
        sendNotificationToPartner({
          relationshipId: relationship.id,
          title: '🎉 Dream Completed!',
          body: `We just checked off "${item.title}" together! 💕`,
          url: '/app/future',
        })
      }
    } catch {
      // Revert on failure
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
    }
  }

  const handleUpdate = async (id: string, title: string, targetAt?: string | null) => {
    try {
      const updated = await updateFutureItem(id, title, targetAt)
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch {
      alert('Could not update item.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFutureItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch {
      alert('Could not delete item.')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-text sm:text-4xl">
          Our Future
        </h1>
        <p className="mt-2 text-sm text-muted">
          Trips we will take, dreams we will chase, and events we count down to.
        </p>
      </header>

      {/* Add New Dream / Event Form */}
      <form onSubmit={handleAdd} className="rounded-2xl border border-border/80 bg-surface p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new dream, trip, or event..."
            maxLength={200}
            className="flex-1 rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !newTitle.trim()}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </div>

        {/* Date & Time Countdown Option Toggle */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
          {!showDatePicker ? (
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="inline-flex items-center gap-1.5 text-muted hover:text-accent transition"
            >
              <span>🗓️</span>
              <span>Set date & time for live countdown</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 w-full">
              <span className="text-muted">Target moment:</span>
              <input
                type="datetime-local"
                value={newTargetAt}
                onChange={(e) => setNewTargetAt(e.target.value)}
                className="rounded-lg border border-border bg-bg px-2.5 py-1 text-xs text-text focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setNewTargetAt('')
                  setShowDatePicker(false)
                }}
                className="text-xs text-muted hover:text-red-500 ml-auto"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-600 dark:text-red-400">
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
            {/* Active Dreams & Events */}
            {activeItems.length > 0 && (
              <div className="space-y-3">
                {activeItems.map((item) => (
                  <FutureItemCard
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            )}

            {/* Completed Section */}
            {completedItems.length > 0 && (
              <section aria-labelledby="completed-heading" className="pt-4 border-t border-border/60">
                <h2
                  id="completed-heading"
                  className="mb-3 font-serif text-base font-normal tracking-wide text-muted"
                >
                  Completed Together ({completedItems.length})
                </h2>

                <div className="space-y-2.5">
                  {completedItems.map((item) => (
                    <FutureItemCard
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
