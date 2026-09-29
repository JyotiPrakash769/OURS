import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { LetterReaderModal } from '../components/LetterReaderModal'
import { WriteLetterModal } from '../components/WriteLetterModal'
import { useApp } from '../lib/appContext'
import { formatDateOnly } from '../lib/dates/zone'
import { deleteLetter, loadLetterEnvelopes, type LetterEnvelope } from '../lib/letters'

export function LettersPage() {
  const { relationship, me, partner } = useApp()
  const [letters, setLetters] = useState<LetterEnvelope[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [writeModalOpen, setWriteModalOpen] = useState(false)
  const [readingEnvelope, setReadingEnvelope] = useState<LetterEnvelope | null>(null)
  const [now] = useState(() => new Date())

  const refreshLetters = useCallback(async () => {
    try {
      setError(null)
      const data = await loadLetterEnvelopes(relationship.id)
      setLetters(data)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Could not load letters.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [relationship.id])

  useEffect(() => {
    let ignore = false
    loadLetterEnvelopes(relationship.id)
      .then((data) => {
        if (!ignore) {
          setLetters(data)
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
                : 'Could not load letters.'
          setError(msg)
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [relationship.id])

  const { receivedLetters, sentLetters } = useMemo(() => {
    const received: LetterEnvelope[] = []
    const sent: LetterEnvelope[] = []
    for (const item of letters) {
      if (item.recipient_id === me.id) {
        received.push(item)
      } else {
        sent.push(item)
      }
    }
    return { receivedLetters: received, sentLetters: sent }
  }, [letters, me.id])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Delete this letter? It cannot be recovered.')) return
    try {
      await deleteLetter(id)
      setLetters((prev) => prev.filter((l) => l.id !== id))
    } catch {
      alert('Could not delete letter.')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-text sm:text-4xl">
            Letters
          </h1>
          <p className="mt-1 text-sm text-muted">
            Words for the future, sealed until their moment arrives.
          </p>
        </div>

        {partner ? (
          <button
            type="button"
            onClick={() => setWriteModalOpen(true)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-surface shadow-xs transition hover:opacity-90 active:scale-[0.98]"
          >
            <span>✉️</span>
            <span>Write a Letter</span>
          </button>
        ) : (
          <div className="text-xs text-muted italic">
            Invite your partner to write and exchange letters.
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft/20 p-4 text-center text-sm text-accent">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="mt-8 flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <p className="animate-pulse font-serif text-sm text-muted">Checking the mailbox…</p>
          </div>
        ) : letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <EmptyState title="No letters yet." line="Write your partner words to open someday." />
            {partner && (
              <button
                type="button"
                onClick={() => setWriteModalOpen(true)}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-surface shadow-xs transition hover:opacity-90"
              >
                <span>Write our first letter</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Letters for Me */}
            <section aria-labelledby="letters-received-title">
              <h2 id="letters-received-title" className="font-serif text-xl font-normal text-text mb-4">
                Letters for You {partner ? `from ${partner.display_name}` : ''}
              </h2>

              {receivedLetters.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted">
                  No letters for you yet. Your partner may still be writing one.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {receivedLetters.map((l) => {
                    const unlockDate = new Date(l.unlock_at)
                    const isUnlocked = now >= unlockDate
                    const isUnopened = isUnlocked && !l.opened_at

                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setReadingEnvelope(l)}
                        className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition hover:scale-[1.01] hover:shadow-md ${
                          isUnopened
                            ? 'border-accent bg-accent-soft/20 shadow-xs'
                            : 'border-border/80 bg-surface'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-2xl" aria-hidden="true">
                            {isUnopened ? '✨ 💌' : isUnlocked ? '💌' : '🔒'}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              isUnopened
                                ? 'bg-accent text-surface'
                                : isUnlocked
                                  ? 'bg-border/60 text-muted'
                                  : 'bg-accent-soft/50 text-accent'
                            }`}
                          >
                            {isUnopened
                              ? 'Ready to open!'
                              : isUnlocked
                                ? 'Opened'
                                : `Opens ${formatDateOnly(unlockDate)}`}
                          </span>
                        </div>

                        <div className="mt-4">
                          <h3 className="font-serif text-lg font-normal text-text group-hover:text-accent">
                            {l.title}
                          </h3>
                          <p className="mt-1 text-xs text-muted">
                            {isUnlocked
                              ? l.opened_at
                                ? `Opened ${formatDateOnly(new Date(l.opened_at))}`
                                : 'Ready to open now'
                              : `Sealed until ${formatDateOnly(unlockDate)}`}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Letters I Wrote */}
            {sentLetters.length > 0 && (
              <section aria-labelledby="letters-sent-title" className="pt-2">
                <h2 id="letters-sent-title" className="font-serif text-xl font-normal text-text mb-4">
                  Letters You Wrote
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {sentLetters.map((l) => {
                    const unlockDate = new Date(l.unlock_at)
                    const isUnlocked = now >= unlockDate

                    return (
                      <div
                        key={l.id}
                        onClick={() => setReadingEnvelope(l)}
                        className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 text-left transition hover:scale-[1.01] hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-2xl" aria-hidden="true">
                            {isUnlocked ? '💌' : '⏳'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(l.id, e)}
                            aria-label={`Delete "${l.title}"`}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted/40 opacity-0 transition group-hover:opacity-100 hover:bg-bg hover:text-red-600 focus:opacity-100"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="mt-4">
                          <h3 className="font-serif text-lg font-normal text-text group-hover:text-accent">
                            {l.title}
                          </h3>
                          <div className="mt-1 flex items-center justify-between text-xs text-muted">
                            <span>
                              {isUnlocked
                                ? l.opened_at
                                  ? `Opened by partner`
                                  : 'Unlocked for partner'
                                : `Unlocks ${formatDateOnly(unlockDate)}`}
                            </span>
                            <span className="text-[11px] text-accent hover:underline">
                              Preview →
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Write Letter Modal */}
      {writeModalOpen && partner && (
        <WriteLetterModal
          relationshipId={relationship.id}
          recipientId={partner.id}
          recipientName={partner.display_name}
          onSent={refreshLetters}
          onClose={() => setWriteModalOpen(false)}
        />
      )}

      {/* Letter Reader Modal */}
      {readingEnvelope && (
        <LetterReaderModal
          envelope={readingEnvelope}
          senderName={readingEnvelope.sender_id === me.id ? me.display_name : (partner?.display_name ?? 'Partner')}
          currentUserId={me.id}
          onClose={() => setReadingEnvelope(null)}
          onOpened={refreshLetters}
        />
      )}
    </div>
  )
}
