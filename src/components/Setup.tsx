import { useState, type SyntheticEvent } from 'react'
import { createRelationship } from '../lib/relationship'
import { wallToInstant } from '../lib/dates/zone'

export function Setup({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [start, setStart] = useState('') // datetime-local: "YYYY-MM-DDTHH:mm"
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: SyntheticEvent) {
    e.preventDefault()
    if (!start) return setError('Pick the moment your story began.')
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const [date, time] = start.split('T')
    const [y, mo, d] = date.split('-').map(Number)
    const [h, mi] = time.split(':').map(Number)
    const instant = wallToInstant({ y, mo, d, h, mi, s: 0 }, timezone)
    if (instant.getTime() > Date.now()) return setError("That moment hasn't happened yet.")

    setBusy(true)
    setError(null)
    try {
      await createRelationship(userId, instant, timezone)
      onDone()
    } catch {
      setError("Couldn't save this. Your changes were not saved. Check your connection and try again.")
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <h1 className="font-serif text-4xl">When did your story begin?</h1>
      <form onSubmit={submit} className="mt-8 flex w-full max-w-sm flex-col gap-4 text-left text-sm">
        <label className="flex flex-col gap-1">
          The moment it began
          <input
            type="datetime-local"
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-4"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <button type="submit" disabled={busy} className="mt-2 min-h-11 rounded-xl bg-accent px-4 font-medium text-white disabled:opacity-50">
          {busy ? 'Saving…' : 'Begin'}
        </button>
        {error && (
          <p role="alert" className="text-accent">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
