import { useEffect, useState } from 'react'
import type { FutureItem } from '../lib/future'
import { formatDateOnly } from '../lib/dates/zone'

type Props = {
  item: FutureItem
  onToggle: (item: FutureItem) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, title: string, targetAt?: string | null) => void
}

function formatTargetDateTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    const dateStr = formatDateOnly(d)
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    return `${dateStr} at ${timeStr}`
  } catch {
    return isoString
  }
}

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function calculateCountdown(targetIso: string): Countdown {
  const target = new Date(targetIso).getTime()
  const now = Date.now()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds, isPast: false }
}

export function FutureItemCard({ item, onToggle, onDelete, onUpdate }: Props) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editTargetAt, setEditTargetAt] = useState(
    item.target_at ? new Date(item.target_at).toISOString().slice(0, 16) : '',
  )

  const [countdown, setCountdown] = useState<Countdown | null>(() =>
    item.target_at ? calculateCountdown(item.target_at) : null,
  )

  useEffect(() => {
    if (!item.target_at || item.completed) {
      return
    }
    const update = () => setCountdown(calculateCountdown(item.target_at!))
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [item.target_at, item.completed])

  const handleSaveEdit = () => {
    const trimmed = editTitle.trim()
    if (!trimmed) {
      setEditTitle(item.title)
      setIsEditing(false)
      return
    }
    const targetIso = editTargetAt ? new Date(editTargetAt).toISOString() : null
    onUpdate(item.id, trimmed, targetIso)
    setIsEditing(false)
  }

  const hasTarget = Boolean(item.target_at)

  return (
    <div className="w-full">
      {!isFlipped ? (
        /* FRONT VIEW: Event Details & Action Buttons */
        <div className="flex w-full flex-col rounded-2xl border border-border/80 bg-surface p-4 shadow-xs transition hover:border-accent/40 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-start gap-3">
              {/* Checkbox complete button */}
              <button
                type="button"
                onClick={() => onToggle(item)}
                aria-label={`Mark "${item.title}" complete`}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                  item.completed
                    ? 'border-accent bg-accent text-white'
                    : 'border-border/90 bg-bg text-transparent hover:border-accent hover:text-accent/60'
                }`}
              >
                <span className="text-xs font-bold">✓</span>
              </button>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2 py-1">
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Event title..."
                      className="w-full rounded-lg border border-accent bg-bg px-2.5 py-1 text-sm text-text focus:outline-none"
                    />
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <span>🗓️</span>
                        <input
                          type="datetime-local"
                          value={editTargetAt}
                          onChange={(e) => setEditTargetAt(e.target.value)}
                          className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditTitle(item.title)
                            setEditTargetAt(
                              item.target_at ? new Date(item.target_at).toISOString().slice(0, 16) : '',
                            )
                            setIsEditing(false)
                          }}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted hover:text-text"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span
                      onClick={() => setIsEditing(true)}
                      className={`block text-sm font-medium leading-relaxed cursor-pointer hover:text-accent transition ${
                        item.completed ? 'line-through text-muted' : 'text-text'
                      }`}
                    >
                      {item.title}
                    </span>

                    {/* Target Date & Flip Countdown Button */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.target_at ? (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-2.5 py-0.5 text-xs text-muted">
                            🗓️ {formatTargetDateTime(item.target_at)}
                          </span>

                          {!item.completed && countdown && (
                            <button
                              type="button"
                              onClick={() => setIsFlipped(true)}
                              title="Click to view live countdown timer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft/30 px-3 py-1 text-xs font-medium text-accent transition hover:bg-accent hover:text-white active:scale-95"
                            >
                              <span>⏳</span>
                              <span>
                                {countdown.isPast ? 'Day is here!' : `${countdown.days}d ${countdown.hours}h left`}
                              </span>
                              <span className="font-semibold underline ml-1">View Countdown ➔</span>
                            </button>
                          )}
                        </>
                      ) : (
                        !item.completed && (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-accent transition"
                          >
                            <span>+ Set date & countdown</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Edit & Delete (Always visible for both partners) */}
            <div className="flex items-center gap-1">
              {hasTarget && !item.completed && (
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  title="View live countdown"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-accent transition hover:bg-accent/10"
                >
                  ⏳
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                title="Edit event"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-text"
              >
                ✎
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${item.title}"?`)) {
                    onDelete(item.id)
                  }
                }}
                title="Delete event"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-red-500"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* BACK VIEW: Live Digital Countdown Flip Clock */
        <div className="flex w-full flex-col rounded-2xl border-2 border-accent/50 bg-surface p-5 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <h3 className="font-serif text-sm font-semibold text-text truncate max-w-[200px] sm:max-w-md">
                {item.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-bg px-3 py-1 text-xs font-medium text-text transition hover:border-accent hover:text-accent"
            >
              <span>↺</span>
              <span>Back to Details</span>
            </button>
          </div>

          {/* Big Live Ticking Clock */}
          <div className="py-4">
            {countdown && countdown.isPast ? (
              <div className="text-center py-3">
                <p className="font-serif text-2xl text-accent">🎉 The moment is here!</p>
                <p className="text-xs text-muted mt-1">{formatTargetDateTime(item.target_at!)}</p>
              </div>
            ) : countdown ? (
              <div>
                <p className="text-center text-xs text-muted mb-3 font-serif">
                  Counting down to {formatTargetDateTime(item.target_at!)}:
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                  <div className="rounded-xl border border-border/80 bg-bg p-2.5 sm:p-3 shadow-inner">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-accent">
                      {countdown.days}
                    </span>
                    <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-muted font-medium mt-1">
                      Days
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-bg p-2.5 sm:p-3 shadow-inner">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-accent">
                      {String(countdown.hours).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-muted font-medium mt-1">
                      Hours
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-bg p-2.5 sm:p-3 shadow-inner">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-accent">
                      {String(countdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-muted font-medium mt-1">
                      Mins
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-bg p-2.5 sm:p-3 shadow-inner">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-accent">
                      {String(countdown.seconds).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-muted font-medium mt-1">
                      Secs
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${item.title}"?`)) {
                  onDelete(item.id)
                }
              }}
              className="text-muted hover:text-red-500 transition"
            >
              Delete event 🗑️
            </button>
            <button
              type="button"
              onClick={() => {
                onToggle(item)
                setIsFlipped(false)
              }}
              className="rounded-lg bg-accent px-3 py-1 font-medium text-white hover:opacity-90 transition"
            >
              Mark Completed ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
