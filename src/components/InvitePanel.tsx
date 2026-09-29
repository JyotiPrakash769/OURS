import { useState } from 'react'
import { createInvite } from '../lib/relationship'

export function InvitePanel() {
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function generate() {
    setBusy(true)
    setError(null)
    try {
      setLink(`${window.location.origin}/invite/${await createInvite()}`)
    } catch {
      setError("Couldn't create the invite. Try again.")
    }
    setBusy(false)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link!)
      setCopied(true)
    } catch {
      setError('Copy failed. Select the link and copy it manually.')
    }
  }

  return (
    <section aria-label="Invite your person" className="mt-12 flex max-w-xs flex-col items-center gap-3 text-sm">
      <p className="font-serif text-2xl">Invite your person.</p>
      {link ? (
        <>
          <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Invite link" className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-xs" />
          <button onClick={copy} className="min-h-11 rounded-xl bg-accent px-6 font-medium text-white">
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <p className="text-muted">Send it to them. It works for 7 days.</p>
        </>
      ) : (
        <button onClick={generate} disabled={busy} className="min-h-11 rounded-xl bg-accent px-6 font-medium text-white disabled:opacity-50">
          {busy ? 'Creating…' : 'Generate invite'}
        </button>
      )}
      {error && (
        <p role="alert" className="text-accent">
          {error}
        </p>
      )}
    </section>
  )
}
