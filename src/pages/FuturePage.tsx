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

const QUICK_IDEAS = [
  { label: '🍕 Date Night', value: 'Date Night Dinner' },
  { label: '✈️ Next Vacation', value: 'Our Next Vacation Trip' },
  { label: '🎬 Movie & Cozy Evening', value: 'Movie & Blanket Night' },
  { label: '🎂 Anniversary Celebration', value: 'Anniversary Celebration' },
]

export function FuturePage() {
  const { relationship, me } = useApp()
  const [items, setItems] = useState<FutureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [isEventMode, setIsEventMode] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTargetAt, setNewTargetAt] = useState('')
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
      const targetIso = isEventMode && newTargetAt ? new Date(newTargetAt).toISOString() : null
      const created = await createFutureItem(relationship.id, newTitle, targetIso)
      setItems((prev) => [created, ...prev])

      if (targetIso) {
        const d = new Date(targetIso)
        const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
        const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        sendNotificationToPartner({
          relationshipId: relationship.id,
          title: '⏳ New Countdown Event!',
          body: `${me?.display_name || 'Your partner'} scheduled "${newTitle}" for ${dateStr} at ${timeStr}. Tap to see the countdown!`,
          url: '/app/future',
        })
      } else {
        sendNotificationToPartner({
          relationshipId: relationship.id,
          title: '🧭 New Bucket List Goal',
          body: `${me?.display_name || 'Your partner'} added "${newTitle}" to Our Future.`,
          url: '/app/future',
        })
      }

      setNewTitle('')
      setNewTargetAt('')
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

      if (targetAt) {
        const d = new Date(targetAt)
        const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
        const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        sendNotificationToPartner({
          relationshipId: relationship.id,
          title: '⏳ Countdown Event Updated!',
          body: `${me?.display_name || 'Your partner'} updated "${title}" to ${dateStr} at ${timeStr}.`,
          url: '/app/future',
        })
      }
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
          Bucket list dreams to chase & upcoming moments to count down together.
        </p>
      </header>

      {/* Helpful, Sweet Explanatory Card */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent-soft/20 p-4 text-xs shadow-xs">
        <span className="text-2xl shrink-0 mt-0.5">⏳</span>
        <div className="leading-relaxed">
          <p className="font-semibold text-accent text-sm">
            Live Flip Countdowns!
          </p>
          <p className="text-muted mt-1">
            Pick <strong>"Planned Event (Countdown)"</strong> below to set an exact date & time for a date night, trip, or milestone. A live clock will tick down every second until the moment arrives!
          </p>
        </div>
      </div>

      {/* Add New Dream / Event Form */}
      <form onSubmit={handleAdd} className="rounded-2xl border border-border/80 bg-surface p-4 shadow-sm sm:p-5">
        {/* Clear Selector: Someday Dream vs Planned Event */}
        <div className="flex rounded-xl bg-bg p-1 border border-border/70 mb-4">
          <button
            type="button"
            onClick={() => setIsEventMode(false)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              !isEventMode
                ? 'bg-surface text-accent shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            <span>✨</span>
            <span>Someday Dream</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEventMode(true)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              isEventMode
                ? 'bg-surface text-accent shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            <span>⏳</span>
            <span>Planned Event</span>
            <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
              Countdown
            </span>
          </button>
        </div>

        {/* Input & Add Button */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={
              isEventMode
                ? 'What are we looking forward to? (e.g. Flight to Rome)'
                : 'What should we do someday? (e.g. Learn pottery together)'
            }
            maxLength={200}
            className="flex-1 rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !newTitle.trim()}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Add'}
          </button>
        </div>

        {/* Date & Time Picker Section (Highlighted when Planned Event is chosen) */}
        {isEventMode && (
          <div className="mt-3.5 rounded-xl border border-accent/30 bg-accent-soft/10 p-3.5 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label htmlFor="event-target-input" className="text-xs font-medium text-text flex items-center gap-1.5">
                <span>🗓️</span>
                <span>Select Target Date & Time:</span>
              </label>
              {newTargetAt && (
                <button
                  type="button"
                  onClick={() => setNewTargetAt('')}
                  className="text-[11px] text-muted hover:text-red-500"
                >
                  Clear date
                </button>
              )}
            </div>

            <input
              id="event-target-input"
              type="datetime-local"
              value={newTargetAt}
              onChange={(e) => setNewTargetAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
            />
            <p className="text-[11px] text-muted">
              ✨ A live flip clock counting down days, hours, and seconds will appear on your card!
            </p>
          </div>
        )}

        {/* Cute Quick Idea Chips */}
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <span className="text-[11px]">Quick ideas:</span>
          {QUICK_IDEAS.map((idea) => (
            <button
              key={idea.label}
              type="button"
              onClick={() => {
                setNewTitle(idea.value)
                if (idea.value.includes('Trip') || idea.value.includes('Celebration')) {
                  setIsEventMode(true)
                }
              }}
              className="rounded-full border border-border/80 bg-bg px-2.5 py-0.5 text-[11px] transition hover:border-accent hover:text-accent"
            >
              {idea.label}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-600 dark:text-red-400">
          {error.includes('target_at') ? (
            <span>
              ⚠️ The <code>target_at</code> column needs to be created in your Supabase SQL editor. Please run the SQL migration 0009 in your Supabase dashboard!
            </span>
          ) : (
            error
          )}
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
