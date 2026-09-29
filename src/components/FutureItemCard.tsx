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
    <div className="perspective-1000 w-full select-none">
      <div
        className={`relative w-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE */}
        <div className="backface-hidden flex w-full flex-col rounded-2xl border border-border/80 bg-surface p-4 shadow-xs transition hover:border-accent/40 hover:shadow-md">
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
                      className="w-full rounded-lg border border-accent bg-bg px-2.5 py-1 text-sm text-text focus:outline-none"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="datetime-local"
                        value={editTargetAt}
                        onChange={(e) => setEditTargetAt(e.target.value)}
                        className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditTitle(item.title)
                          setIsEditing(false)
                        }}
                        className="rounded-lg border border-border px-2 py-1 text-xs text-muted hover:text-text"
                      >
                        Cancel
                      </button>
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

                    {/* Target Date & Countdown Pill */}
                    {item.target_at && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] text-muted">
                          🗓️ {formatTargetDateTime(item.target_at)}
                        </span>

                        {!item.completed && countdown && (
                          <button
                            type="button"
                            onClick={() => setIsFlipped(true)}
                            title="Flip to view live countdown clock"
                            className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent transition hover:bg-accent/20"
                          >
                            <span>⏳</span>
                            {countdown.isPast ? (
                              <span>The day is here! ↺</span>
                            ) : (
                              <span>
                                {countdown.days}d {countdown.hours}h left · ↺ Flip
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons (Edit & Delete) - Always visible on mobile, slick hover on desktop */}
            <div className="flex items-center gap-1">
              {hasTarget && !item.completed && (
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  title="Flip to countdown"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted/70 transition hover:bg-bg hover:text-accent"
                >
                  ⏳
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                title="Edit item"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted/70 transition hover:bg-bg hover:text-text"
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
                title="Delete item"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted/70 transition hover:bg-bg hover:text-red-500"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* BACK SIDE (Flip Countdown Clock) */}
        {hasTarget && (
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-2xl border border-accent/40 bg-surface p-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="truncate pr-2 font-serif text-xs font-medium text-text">
                ⏳ Countdown: {item.title}
              </span>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                title="Flip back"
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted hover:text-text"
              >
                ↺ Back
              </button>
            </div>

            {/* Live Ticking Countdown Units */}
            <div className="my-auto py-2">
              {countdown && countdown.isPast ? (
                <div className="text-center py-2">
                  <p className="font-serif text-lg text-accent">🎉 The day has arrived!</p>
                  <p className="text-xs text-muted mt-1">{formatTargetDateTime(item.target_at!)}</p>
                </div>
              ) : countdown ? (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl border border-border/80 bg-bg p-2 shadow-inner">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-accent">
                      {countdown.days}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted">Days</span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-bg p-2 shadow-inner">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-accent">
                      {String(countdown.hours).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted">Hours</span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-bg p-2 shadow-inner">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-accent">
                      {String(countdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted">Mins</span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-bg p-2 shadow-inner">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-accent">
                      {String(countdown.seconds).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted">Secs</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Back footer */}
            <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs text-muted">
              <span>{formatTargetDateTime(item.target_at!)}</span>
              <button
                type="button"
                onClick={() => onToggle(item)}
                className="text-xs text-accent hover:underline"
              >
                Mark completed ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
