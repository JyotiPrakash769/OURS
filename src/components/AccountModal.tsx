import { useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'
import type { CelebrationType } from '../lib/celebrations'
import { createInvite, unlinkPartner, type Profile, type Relationship } from '../lib/relationship'

type Props = {
  isOpen: boolean
  onClose: () => void
  relationship?: Relationship | null
  me?: Profile | null
  partner?: Profile | null
  onRefresh?: () => void
}

type Tab = 'account' | 'anniversaries' | 'features'

export function AccountModal({ isOpen, onClose, relationship, me, partner, onRefresh }: Props) {
  const { deleteAccount, signOut, userId } = useAuth()
  const isCreator = Boolean(relationship && userId && relationship.user_a_id === userId)

  const [activeTab, setActiveTab] = useState<Tab>('account')
  const [confirming, setConfirming] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Partner management states (only creator can unlink/add)
  const [unlinkConfirming, setUnlinkConfirming] = useState(false)
  const [unlinkLoading, setUnlinkLoading] = useState(false)
  const [unlinkSuccess, setUnlinkSuccess] = useState<string | null>(null)

  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [inviteBusy, setInviteBusy] = useState(false)

  const [activePreview, setActivePreview] = useState<CelebrationType | null>(() => {
    return (localStorage.getItem('ours_celebration_preview') as CelebrationType) || null
  })

  if (!isOpen) return null

  const handleUnlinkPartner = async () => {
    setUnlinkLoading(true)
    setError(null)
    setUnlinkSuccess(null)
    try {
      await unlinkPartner()
      setUnlinkConfirming(false)
      setUnlinkSuccess('Partner unlinked and removed. Your partner slot is open, and you can now invite someone else!')
      onRefresh?.()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not remove partner. Please make sure database migration 0010 is applied.'
      )
    } finally {
      setUnlinkLoading(false)
    }
  }

  const handleGenerateInvite = async () => {
    setInviteBusy(true)
    setError(null)
    try {
      const token = await createInvite()
      setInviteLink(`${window.location.origin}/invite/${token}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create invite.')
    } finally {
      setInviteBusy(false)
    }
  }

  const handleCopyInvite = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 2500)
    } catch {
      setError('Could not copy automatically. Please copy the link manually.')
    }
  }

  const handleSetPreview = (type: CelebrationType) => {
    if (type === 'none') {
      localStorage.removeItem('ours_celebration_preview')
      setActivePreview(null)
    } else {
      localStorage.setItem('ours_celebration_preview', type)
      setActivePreview(type)
    }
    window.dispatchEvent(new Event('ours_celebration_change'))
  }

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 id="account-modal-title" className="font-serif text-lg font-medium text-text">
            Settings & Preferences
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

        {/* Tab Switcher */}
        <div className="flex border-b border-border/60 bg-surface-elevated/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`border-b-2 px-3 py-2 text-xs font-medium transition ${
              activeTab === 'account'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            ⚙️ Account
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('anniversaries')}
            className={`border-b-2 px-3 py-2 text-xs font-medium transition ${
              activeTab === 'anniversaries'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            ✨ Anniversaries & Themes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`border-b-2 px-3 py-2 text-xs font-medium transition ${
              activeTab === 'features'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            💡 Features Guide
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 overflow-y-auto p-6 text-left">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {unlinkSuccess && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              {unlinkSuccess}
            </div>
          )}

          {/* TAB 1: ACCOUNT & SESSION */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-xl border border-border bg-bg/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text">{me?.display_name || 'Your Profile'}</p>
                    <p className="text-xs text-muted">
                      {isCreator ? 'Space Creator (Only you can manage partners)' : 'Partner'}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                    {isCreator ? '👑 Creator' : '💖 Partner'}
                  </span>
                </div>
              </div>

              {/* Partner Management (Only Creator user_a can add/unadd) */}
              <div className="rounded-xl border border-border bg-bg/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Partner Access & Connection
                  </h3>
                  {isCreator && (
                    <span className="text-[10px] text-muted bg-surface px-2 py-0.5 rounded border border-border">
                      Admin Control: Only You
                    </span>
                  )}
                </div>

                {partner ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between rounded-lg border border-border/80 bg-surface p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">👩‍❤️‍👨</span>
                        <div>
                          <p className="text-xs font-semibold text-text">{partner.display_name}</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Connected</p>
                        </div>
                      </div>
                      {isCreator && (
                        <button
                          type="button"
                          onClick={() => setUnlinkConfirming(true)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20 dark:text-red-400 transition"
                        >
                          Unlink / Remove
                        </button>
                      )}
                    </div>

                    {isCreator && unlinkConfirming && (
                      <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3 space-y-2.5 text-left">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">
                          Remove {partner.display_name} from your space?
                        </p>
                        <p className="text-[11px] text-muted leading-relaxed">
                          This will disconnect this partner and delete the test account so your partner slot is open again. All your memories and stories remain safe.
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            disabled={unlinkLoading}
                            onClick={handleUnlinkPartner}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition"
                          >
                            {unlinkLoading ? 'Unlinking...' : 'Yes, Remove Partner'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setUnlinkConfirming(false)}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-text transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 rounded-lg border border-dashed border-border p-3 text-left">
                    <p className="text-xs text-muted">No partner is currently connected.</p>
                    {isCreator ? (
                      <div className="space-y-2 pt-1">
                        {inviteLink ? (
                          <div className="space-y-2">
                            <input
                              readOnly
                              value={inviteLink}
                              onFocus={(e) => e.target.select()}
                              aria-label="Invite link"
                              className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-mono text-text"
                            />
                            <button
                              type="button"
                              onClick={handleCopyInvite}
                              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent/90"
                            >
                              {inviteCopied ? '✓ Copied Invite Link!' : 'Copy Invite Link'}
                            </button>
                            <p className="text-[11px] text-muted">Send this link to your actual girlfriend. Valid for 7 days.</p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={inviteBusy}
                            onClick={handleGenerateInvite}
                            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent/90 disabled:opacity-50"
                          >
                            {inviteBusy ? 'Generating...' : '➕ Generate Invite Link'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted italic">Only the relationship creator can connect a partner.</p>
                    )}
                  </div>
                )}
              </div>

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
          )}

          {/* TAB 2: ANNIVERSARY CELEBRATION THEMES & PREVIEWS */}
          {activeTab === 'anniversaries' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/80 bg-surface-elevated/40 p-4">
                <h3 className="font-serif text-sm font-medium text-text">Celebration Schedule</h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  These celebrations activate automatically on the Home screen on their special dates. You can also preview what each theme looks like below!
                </p>
              </div>

              {activePreview && (
                <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent-soft/30 p-3 text-xs">
                  <span className="font-medium text-text">
                    Active Preview: <span className="text-accent uppercase font-bold">{activePreview.replace('_', ' ')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetPreview('none')}
                    className="rounded-lg bg-surface px-2.5 py-1 text-[11px] font-semibold text-text shadow-2xs hover:bg-surface-elevated"
                  >
                    Reset to Real Date
                  </button>
                </div>
              )}

              {/* Theme 1: Kiss Day */}
              <div className="rounded-xl border border-pink-500/30 bg-pink-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">💋</span>
                    <h4 className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                      25th of Every Month · First Kiss Day
                    </h4>
                  </div>
                  <p className="mt-1 text-[11px] text-muted leading-relaxed">
                    Commemorating our first kiss on 25th July. Floating rose petals, romantic blush aura, and kiss milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetPreview('kiss_day')}
                  className="shrink-0 rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-pink-700 active:scale-95"
                >
                  Preview Kiss Day
                </button>
              </div>

              {/* Theme 2: Monthly Anniversary */}
              <div className="rounded-xl border border-accent/30 bg-accent-soft/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🎉</span>
                    <h4 className="text-xs font-semibold text-accent">
                      29th of Every Month · Official Anniversary
                    </h4>
                  </div>
                  <p className="mt-1 text-[11px] text-muted leading-relaxed">
                    Celebrates our proposal milestone. Congratulates both of you on the time spent together with 3D colorful confetti.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetPreview('monthly_anniversary')}
                  className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-surface shadow-xs hover:opacity-90 active:scale-95"
                >
                  Preview Monthly
                </button>
              </div>

              {/* Theme 3: 6-Month Jubilee */}
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🌸</span>
                    <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Every 6 Months · Half-Year Milestone
                    </h4>
                  </div>
                  <p className="mt-1 text-[11px] text-muted leading-relaxed">
                    Royal elegance theme with blooming flowers and crackling sparks celebrating your major half-year milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetPreview('half_year_jubilee')}
                  className="shrink-0 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-purple-700 active:scale-95"
                >
                  Preview 6-Month
                </button>
              </div>

              {/* Theme 4: Grand Annual Gala */}
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">👑</span>
                    <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      Every 29th July · Grand Annual Anniversary
                    </h4>
                  </div>
                  <p className="mt-1 text-[11px] text-muted leading-relaxed">
                    Grand golden celebration with sky lanterns, golden skyrockets, and 365 days tribute of forever love.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetPreview('annual_grand_gala')}
                  className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-amber-700 active:scale-95"
                >
                  Preview 29 July
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURES GUIDE & PRIVACY */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-bg/50 p-3.5">
                <h4 className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span>🔔</span> Instant Partner Push Notifications
                </h4>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  Both partners receive real-time device push notifications when creating a new future date plan, posting a memory, or sending a love letter.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-bg/50 p-3.5">
                <h4 className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span>⏳</span> 3D Flip Countdown Timers
                </h4>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  In the <strong>Future</strong> tab, any item with an exact target date and time can be tapped to flip into a live ticking countdown card.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-bg/50 p-3.5">
                <h4 className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span>💌</span> Private Sealed Love Letters
                </h4>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  Write love letters to each other with custom unlock conditions (e.g. read now, or surprise them for a future date).
                </p>
              </div>

              <div className="rounded-xl border border-border bg-bg/50 p-3.5">
                <h4 className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span>🗑️</span> Shared Two-Way Management
                </h4>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  Both partners have equal permission to edit or remove memories, stories, and future plans.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-bg/50 p-3.5">
                <h4 className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <span>🗺️</span> Our Footsteps Date Map
                </h4>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  Interactive map plotting all special places across Rourkela, Khordha & Bhubaneswar (Sector 7, Janaki Ballav Pattnaik Park, PJ Veena Hall, Jaydev Vatika, Temples) with coordinates and memories.
                </p>
              </div>

              <div className="rounded-xl border border-accent/30 bg-accent-soft/20 p-3.5">
                <h4 className="text-xs font-semibold text-accent flex items-center gap-1.5">
                  <span>📱</span> Install OURS as a Phone App (PWA)
                </h4>
                <div className="mt-1.5 space-y-1.5 text-[11px] text-muted leading-relaxed">
                  <p><strong>On iPhone (Safari):</strong> Tap the Share button (📤) at the bottom, then choose <strong>Add to Home Screen (➕)</strong>.</p>
                  <p><strong>On Android (Chrome):</strong> Tap the 3 dots (⋮) in the top-right, then choose <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</p>
                  <p className="text-accent font-medium mt-1">✨ Opens without browser bars, exactly like an app from the App Store!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
