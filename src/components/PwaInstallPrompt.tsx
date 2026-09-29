import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true)
    )
  })
  const [isIos] = useState(() => {
    if (typeof window === 'undefined') return false
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
  })
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('ours_pwa_prompt_dismissed') === 'true'
  })

  useEffect(() => {
    // Listen for display mode change
    const media = window.matchMedia('(display-mode: standalone)')
    const handleModeChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches)
    media.addEventListener('change', handleModeChange)

    // Capture Chrome/Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => {
      media.removeEventListener('change', handleModeChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      setShowModal(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('ours_pwa_prompt_dismissed', 'true')
  }

  // If already installed or dismissed, do not show floating banner
  if (isStandalone) return null

  return (
    <>
      {/* Floating Bottom Install Badge */}
      {!dismissed && (
        <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-in slide-in-from-bottom-4 md:bottom-6">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-surface/95 p-3.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-surface text-lg font-serif font-bold shadow-xs">
                ♡
              </div>
              <div className="text-left">
                <p className="font-serif text-xs font-semibold text-text">Install OURS App</p>
                <p className="text-[11px] text-muted">Add to your home screen for full screen love</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-surface shadow-xs transition hover:opacity-90 active:scale-95"
              >
                Install
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss install banner"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:text-text text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS / Manual Install Guide Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft/30 text-2xl mb-3">
              📱
            </div>
            <h3 className="font-serif text-lg font-medium text-text">Install on Your Phone</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Add OURS directly to your phone screen so it opens in true full-screen like a native app.
            </p>

            <div className="mt-5 space-y-3 rounded-xl border border-border/70 bg-surface-elevated/40 p-4 text-left text-xs text-text">
              {isIos ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-surface text-[11px] font-bold">
                      1
                    </span>
                    <span>Tap the <strong>Share</strong> button (📤) in Safari toolbar.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-surface text-[11px] font-bold">
                      2
                    </span>
                    <span>Scroll down and tap <strong>Add to Home Screen (➕)</strong>.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-surface text-[11px] font-bold">
                      1
                    </span>
                    <span>Tap the <strong>three dots menu (⋮)</strong> in Chrome / browser.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-surface text-[11px] font-bold">
                      2
                    </span>
                    <span>Tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.</span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-5 w-full rounded-xl bg-accent py-2.5 text-xs font-medium text-surface shadow-xs transition hover:opacity-90"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
