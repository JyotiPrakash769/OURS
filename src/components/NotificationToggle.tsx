import { useState } from 'react'
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from '../lib/notifications'

export function NotificationToggle({ relationshipId }: { relationshipId?: string }) {
  const [supported] = useState(() => isPushSupported())
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission(),
  )
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    setMessage(null)
    const res = await subscribeToPush(relationshipId)
    setPermission(getNotificationPermission())
    setLoading(false)
    if (res.success) {
      setMessage('🔔 Push notifications enabled!')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ ${res.error || 'Failed to enable notifications'}`)
    }
  }

  const handleUnsubscribe = async () => {
    setLoading(true)
    setMessage(null)
    const res = await unsubscribeFromPush()
    setPermission(getNotificationPermission())
    setLoading(false)
    if (res.success) {
      setMessage('🔕 Notifications disabled.')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ ${res.error}`)
    }
  }

  const handleSendTest = async () => {
    setLoading(true)
    setMessage(null)
    try {
      if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        const reg = await navigator.serviceWorker.ready
        await reg.showNotification('OURS ♡', {
          body: '✨ Test notification! Your private scrapbook notifications are working perfectly.',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        })
        setMessage('✨ Test notification delivered!')
      } else {
        setMessage('⚠️ Enable notifications first.')
      }
    } catch (e) {
      setMessage(`Failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  if (!supported) return null

  const isEnabled = permission === 'granted'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={isEnabled ? 'Notifications active' : 'Enable notifications'}
        aria-label="Notification settings"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-text"
      >
        {isEnabled ? (
          <span className="text-base">🔔</span>
        ) : (
          <span className="text-base opacity-60">🔕</span>
        )}
        {isEnabled && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl border border-border bg-surface p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="font-serif font-medium text-text">Notifications</h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${isEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted/10 text-muted'}`}
              >
                {isEnabled ? 'Active' : 'Off'}
              </span>
            </div>

            <p className="py-3 text-xs leading-relaxed text-muted">
              Get notified on lock screen when your partner seals a secret love letter, adds a memory, or checks off a dream.
            </p>

            {message && (
              <div className="mb-3 rounded-xl bg-bg p-2 text-center text-xs text-text border border-border">
                {message}
              </div>
            )}

            <div className="space-y-2">
              {!isEnabled ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubscribe}
                  className="w-full rounded-xl bg-accent py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Enabling...' : 'Enable Notifications'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendTest}
                    className="w-full rounded-xl border border-border bg-bg py-2 text-xs font-medium text-text transition hover:bg-surface disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : '✨ Send Test Notification'}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleUnsubscribe}
                    className="w-full rounded-xl py-1.5 text-xs text-muted transition hover:text-red-500"
                  >
                    Disable on this device
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
