import { useEffect, useState } from 'react'
import { formatDateOnly } from '../lib/dates/zone'
import { readLetter, type LetterDetail, type LetterEnvelope } from '../lib/letters'

type Props = {
  envelope: LetterEnvelope
  senderName: string
  currentUserId: string
  onClose: () => void
  onOpened?: () => void
}

export function LetterReaderModal({
  envelope,
  senderName,
  currentUserId,
  onClose,
  onOpened,
}: Props) {
  const isAuthor = envelope.sender_id === currentUserId
  const unlockDate = new Date(envelope.unlock_at)
  const [now] = useState(() => new Date())
  const isLocked = !isAuthor && now < unlockDate

  const [detail, setDetail] = useState<LetterDetail | null>(null)
  const [loading, setLoading] = useState(() => !isLocked)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (isLocked) return

    let ignore = false
    readLetter(envelope.id)
      .then((res) => {
        if (!ignore) {
          setDetail(res)
          setLoading(false)
          if (onOpened && !envelope.opened_at) onOpened()
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
              ? (err as { message: string }).message
              : err instanceof Error
                ? err.message
                : 'Could not open this letter.'
          setError(msg)
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [envelope.id, envelope.opened_at, isLocked, onOpened])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="letter-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-[#FCFAF6] shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/60 bg-surface/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-lg">💌</span>
            <span className="font-serif text-sm text-muted">
              {isAuthor ? 'Letter you wrote' : `Letter from ${senderName}`}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close letter"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-text"
          >
            ✕
          </button>
        </header>

        {/* Letter Body or Sealed View */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          {isLocked ? (
            /* Sealed Envelope Screen */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent/40 bg-accent-soft/30 text-3xl shadow-inner">
                🔒
              </div>
              <h2 id="letter-modal-title" className="mt-6 font-serif text-2xl font-normal text-text">
                {envelope.title}
              </h2>
              <p className="mt-2 text-sm text-muted">
                This letter is sealed with love by {senderName}.
              </p>
              <div className="mt-6 rounded-xl border border-accent/30 bg-accent-soft/20 px-5 py-3 text-xs font-medium text-accent">
                Opens on {formatDateOnly(unlockDate)}
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <p className="animate-pulse font-serif text-sm text-muted">Unfolding letter…</p>
            </div>
          ) : error ? (
            <div role="alert" className="rounded-xl border border-accent/30 bg-accent-soft/30 p-4 text-center text-sm text-accent">
              <p>{error}</p>
            </div>
          ) : detail ? (
            /* Unfolded Stationery Letter */
            <article className="mx-auto flex max-w-md flex-col">
              <h2 id="letter-modal-title" className="font-serif text-2xl font-normal tracking-wide text-text sm:text-3xl">
                {detail.title}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                <span>Written {formatDateOnly(new Date(detail.created_at))}</span>
                {detail.opened_at && !isAuthor && (
                  <span>· Opened {formatDateOnly(new Date(detail.opened_at))}</span>
                )}
              </div>

              <div className="mt-8 border-t border-border/60 pt-6">
                <p className="whitespace-pre-wrap font-serif text-base leading-loose text-text/90 sm:text-lg">
                  {detail.body}
                </p>
              </div>

              <div className="mt-12 flex justify-end">
                <span className="font-serif text-xl italic text-accent">
                  — {isAuthor ? 'You' : senderName}
                </span>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </div>
  )
}
