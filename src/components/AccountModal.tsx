import { useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function AccountModal({ isOpen, onClose }: Props) {
  const { deleteAccount, signOut } = useAuth()
  const [confirming, setConfirming] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault()
    if (confirmInput.trim().toUpperCase() !== 'DELETE') return

    setLoading(true)
    setError(null)
    try {
      await deleteAccount()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete account. Please try again.')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirming(false)
    setConfirmInput('')
    setError(null)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 id="account-modal-title" className="font-serif text-lg font-medium text-text">
            Account Settings
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-text"
          >
            ✕
          </button>
        </header>

        <div className="space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Session Actions */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg/50 p-4">
            <div>
              <p className="text-sm font-medium text-text">Sign Out</p>
              <p className="text-xs text-muted">Log out of this device session</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:bg-surface hover:text-text"
            >
              Log out
            </button>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Danger Zone
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Permanently delete your user account and profile. If you created this relationship, all shared memories,
              polaroids, letters, and dreams will also be irreversibly deleted.
            </p>

            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-500/20 dark:text-red-400"
              >
                Delete Account
              </button>
            ) : (
              <form onSubmit={handleDelete} className="mt-4 space-y-3 rounded-lg border border-red-500/30 bg-bg p-3">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm permanent deletion:
                </p>
                <input
                  type="text"
                  autoFocus
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-lg border border-red-500/40 bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-red-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || confirmInput.trim().toUpperCase() !== 'DELETE'}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(false)
                      setConfirmInput('')
                    }}
                    className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-text"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
