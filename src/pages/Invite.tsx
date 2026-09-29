import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { acceptInvite } from '../lib/relationship'

export function Invite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function join() {
    setBusy(true)
    setError(null)
    try {
      await acceptInvite(token ?? '')
      navigate('/app', { replace: true })
    } catch (e: unknown) {
      const raw =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string'
          ? (e as { message: string }).message
          : e instanceof Error
            ? e.message
            : ''
      const msg = raw.includes('cannot accept own invite')
        ? 'You created this invite! Open this link in an Incognito window or have your partner sign in to accept.'
        : raw || "Couldn't join. Check your connection and try again."
      setError(msg)
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-5xl">
        OURS <span className="text-accent">♡</span>
      </p>
      <p className="mt-4 text-muted">Someone invited you to share their story.</p>
      <button onClick={join} disabled={busy} className="mt-8 min-h-11 rounded-xl bg-accent px-8 font-medium text-white disabled:opacity-50">
        {busy ? 'Joining…' : 'Join'}
      </button>
      {error && (
        <p role="alert" className="mt-4 max-w-xs text-sm text-accent">
          {error}
        </p>
      )}
    </main>
  )
}
