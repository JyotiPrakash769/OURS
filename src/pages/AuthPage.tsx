import { useState, type SyntheticEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { isConfigured } from '../lib/supabase'

const field = 'min-h-11 w-full rounded-xl border border-border bg-surface px-4'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { status, signIn, signUp } = useAuth()
  const [params] = useSearchParams()
  const raw = params.get('next')
  // Only allow same-site paths as the post-login destination.
  const next = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/app'
  const suffix = raw ? `?next=${encodeURIComponent(raw)}` : ''

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (status === 'in') return <Navigate to={next} replace />

  async function submit(e: SyntheticEvent) {
    e.preventDefault()
    setError(null)
    if (mode === 'register') {
      if (!name.trim() || name.trim().length > 40) return setError('Enter your name (up to 40 characters).')
      if (password.length < 6) return setError('Use a password with at least 6 characters.')
    }
    setBusy(true)
    if (mode === 'login') {
      setError(await signIn(email.trim(), password))
    } else {
      const r = await signUp(email.trim(), password, name.trim())
      setError(r.error)
      if (!r.error && r.needsConfirmation) setNotice('Check your email to confirm your account, then log in.')
    }
    setBusy(false)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-6xl tracking-wide">
        OURS <span className="text-accent">♡</span>
      </p>
      <p className="mt-4 text-muted">Your little corner of the internet.</p>

      {!isConfigured ? (
        <p role="alert" className="mt-10 max-w-sm text-sm text-muted">
          Supabase isn't configured yet. Copy <code>.env.example</code> to <code>.env</code>, fill in the two
          values, then restart <code>npm run dev</code>.
        </p>
      ) : status === 'loading' ? null : (
        <form onSubmit={submit} className="mt-10 flex w-full max-w-xs flex-col gap-3 text-left text-sm">
          {mode === 'register' && (
            <label className="flex flex-col gap-1">
              Your name
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="given-name" />
            </label>
          )}
          <label className="flex flex-col gap-1">
            Email
            <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
          <label className="flex flex-col gap-1">
            Password
            <input
              className={field}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>
          <button type="submit" disabled={busy} className="mt-2 min-h-11 rounded-xl bg-accent px-4 font-medium text-white disabled:opacity-50">
            {busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
          {error && (
            <p role="alert" className="text-accent">
              {error}
            </p>
          )}
          {notice && <p role="status">{notice}</p>}
          <p className="text-center text-muted">
            {mode === 'login' ? (
              <>
                New here? <Link className="text-accent underline" to={`/register${suffix}`}>Create an account</Link>
              </>
            ) : (
              <>
                Already have an account? <Link className="text-accent underline" to={`/login${suffix}`}>Log in</Link>
              </>
            )}
          </p>
        </form>
      )}
    </main>
  )
}
