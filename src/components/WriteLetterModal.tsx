import { useState, type FormEvent } from 'react'
import { sendLetter, type LetterInput } from '../lib/letters'

type Props = {
  relationshipId: string
  recipientId: string
  recipientName: string
  onSent: () => void
  onClose: () => void
}

export function WriteLetterModal({
  relationshipId,
  recipientId,
  recipientName,
  onSent,
  onClose,
}: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [unlockDate, setUnlockDate] = useState(() => {
    // Default to 1 week in the future
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })
  const [unlockTime, setUnlockTime] = useState('09:00')

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please give your letter a title or occasion.')
      return
    }
    if (!body.trim()) {
      setError('Please write some words for your partner.')
      return
    }

    const unlockInstant = new Date(`${unlockDate}T${unlockTime || '00:00'}:00`)
    if (Number.isNaN(unlockInstant.getTime())) {
      setError('Please choose a valid unlock date.')
      return
    }

    setSending(true)
    setError(null)

    try {
      const input: LetterInput = {
        recipient_id: recipientId,
        title: title.trim(),
        body: body.trim(),
        unlock_at: unlockInstant.toISOString(),
      }
      await sendLetter(relationshipId, input)
      onSent()
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Could not send letter.'
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-letter-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <h2 id="write-letter-title" className="font-serif text-xl font-medium text-text">
              Write to {recipientName}
            </h2>
            <p className="text-xs text-muted">This letter will be locked until the date you choose.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-text"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-accent/30 bg-accent-soft/30 p-3 text-sm text-accent">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="letter-title" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
              Occasion or Title
            </label>
            <input
              id="letter-title"
              type="text"
              required
              maxLength={120}
              placeholder="Open on our anniversary, Open when you land..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-text placeholder:text-muted/60 focus:border-accent focus:outline-hidden"
            />
          </div>

          {/* Unlock Date & Time */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="unlock-date" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
                Unlock Date
              </label>
              <input
                id="unlock-date"
                type="date"
                required
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-text focus:border-accent focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="unlock-time" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
                Unlock Time
              </label>
              <input
                id="unlock-time"
                type="time"
                value={unlockTime}
                onChange={(e) => setUnlockTime(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-text focus:border-accent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Letter Body */}
          <div className="mb-5 flex flex-1 flex-col">
            <label htmlFor="letter-body" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
              Your Letter
            </label>
            <textarea
              id="letter-body"
              required
              rows={8}
              maxLength={10000}
              placeholder="Dearest..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full flex-1 resize-none rounded-xl border border-border bg-bg p-4 font-serif text-base leading-relaxed text-text placeholder:text-muted/60 focus:border-accent focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="h-11 rounded-xl border border-border px-4 text-xs font-medium text-muted transition hover:bg-bg hover:text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-6 text-xs font-medium text-surface shadow-xs transition hover:opacity-90 disabled:opacity-50"
            >
              <span>💌</span>
              <span>{sending ? 'Sealing Letter…' : 'Seal & Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
