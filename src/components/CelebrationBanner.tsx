import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CelebrationInfo, CelebrationType } from '../lib/celebrations'

type Props = {
  celebration: CelebrationInfo
  onReplay: () => void
  onSelectPreview?: (type: CelebrationType) => void
  currentPreview?: CelebrationType
}

export function CelebrationBanner({
  celebration,
  onReplay,
  onSelectPreview,
  currentPreview,
}: Props) {
  const [showPreviewMenu, setShowPreviewMenu] = useState(false)

  return (
    <section
      aria-label="Anniversary Celebration"
      className={`relative mb-8 w-full max-w-xl overflow-hidden rounded-3xl border bg-gradient-to-b ${celebration.accentGradient} p-6 sm:p-8 text-center shadow-lg transition-all duration-300 backdrop-blur-md ${celebration.borderColor}`}
      style={{
        boxShadow: `0 20px 40px -15px ${celebration.bgGlow}`,
      }}
    >
      {/* Decorative background glow circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-72 rounded-full blur-3xl opacity-60"
        style={{ background: celebration.bgGlow }}
      />

      {/* Top Badge */}
      <div className="relative mb-3 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-surface/30 bg-surface/70 px-3.5 py-1 text-xs font-semibold tracking-wide uppercase shadow-xs backdrop-blur-md">
          {celebration.badgeLabel}
        </span>
      </div>

      {/* Headline */}
      <p className="text-xs font-medium uppercase tracking-widest text-muted/90">
        {celebration.headline}
      </p>

      {/* Main Title */}
      <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-text sm:text-3xl md:text-4xl">
        {celebration.title}
      </h2>

      {/* The Specific Wish requested by user */}
      <div className="mx-auto mt-3 max-w-lg rounded-2xl border border-surface/40 bg-surface/80 p-4 shadow-xs backdrop-blur-md">
        <p className="font-serif text-base font-medium text-text sm:text-lg leading-snug">
          {celebration.wish}
        </p>
        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
          {celebration.details}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-surface shadow-xs transition hover:opacity-90 active:scale-[0.98]"
        >
          <span>✨</span>
          <span>Replay Celebration</span>
        </button>

        <Link
          to="/app/letters"
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-border/80 bg-surface/90 px-4 py-2 text-xs font-medium text-text transition hover:border-accent hover:text-accent shadow-xs"
        >
          <span>💌</span>
          <span>Write Love Letter</span>
        </Link>

        {onSelectPreview && (
          <button
            type="button"
            onClick={() => setShowPreviewMenu((v) => !v)}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-border/60 bg-surface/60 px-3 py-2 text-xs font-medium text-muted transition hover:bg-surface hover:text-text"
            title="Preview all 4 anniversary milestone designs"
          >
            <span>🔮</span>
            <span>{showPreviewMenu ? 'Close Preview' : 'Preview Modes'}</span>
          </button>
        )}
      </div>

      {/* Preview Mode Selector Dropdown */}
      {showPreviewMenu && onSelectPreview && (
        <div className="mt-5 rounded-2xl border border-border/80 bg-surface/95 p-3 text-left shadow-md backdrop-blur-md animate-in fade-in">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted px-2 mb-2">
            Preview Celebration Themes:
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => onSelectPreview('kiss_day')}
              className={`rounded-lg px-2.5 py-2 text-xs font-medium text-center transition ${
                currentPreview === 'kiss_day'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-surface-elevated hover:bg-border/40 text-text'
              }`}
            >
              💋 25th Kiss Day
            </button>
            <button
              type="button"
              onClick={() => onSelectPreview('monthly_anniversary')}
              className={`rounded-lg px-2.5 py-2 text-xs font-medium text-center transition ${
                currentPreview === 'monthly_anniversary'
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-surface-elevated hover:bg-border/40 text-text'
              }`}
            >
              🎉 29th Monthly
            </button>
            <button
              type="button"
              onClick={() => onSelectPreview('half_year_jubilee')}
              className={`rounded-lg px-2.5 py-2 text-xs font-medium text-center transition ${
                currentPreview === 'half_year_jubilee'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-surface-elevated hover:bg-border/40 text-text'
              }`}
            >
              🌸 6-Month Mark
            </button>
            <button
              type="button"
              onClick={() => onSelectPreview('annual_grand_gala')}
              className={`rounded-lg px-2.5 py-2 text-xs font-medium text-center transition ${
                currentPreview === 'annual_grand_gala'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-surface-elevated hover:bg-border/40 text-text'
              }`}
            >
              👑 29 July Grand
            </button>
          </div>
          {currentPreview && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => onSelectPreview('none')}
                className="text-[11px] text-muted underline hover:text-text"
              >
                Reset to today's real date
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
