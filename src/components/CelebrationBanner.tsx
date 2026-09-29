import { Link } from 'react-router-dom'
import type { CelebrationInfo } from '../lib/celebrations'

type Props = {
  celebration: CelebrationInfo
  onReplay: () => void
  onDismiss?: () => void
  isCustomPreview?: boolean
  onResetPreview?: () => void
}

export function CelebrationBanner({
  celebration,
  onReplay,
  onDismiss,
  isCustomPreview,
  onResetPreview,
}: Props) {
  return (
    <section
      aria-label="Anniversary Celebration"
      className={`relative mb-8 w-full max-w-xl overflow-hidden rounded-3xl border bg-gradient-to-b ${celebration.accentGradient} p-6 sm:p-8 text-center shadow-lg transition-all duration-300 backdrop-blur-md ${celebration.borderColor}`}
      style={{
        boxShadow: `0 20px 40px -15px ${celebration.bgGlow}`,
      }}
    >
      {/* Top right dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          title="Dismiss celebration for today"
          aria-label="Dismiss celebration"
          className="absolute top-3.5 right-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface/70 text-xs text-muted hover:bg-surface hover:text-text transition backdrop-blur-xs shadow-2xs"
        >
          ✕
        </button>
      )}

      {/* Decorative background glow circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-72 rounded-full blur-3xl opacity-60"
        style={{ background: celebration.bgGlow }}
      />

      {/* Top Badge & Optional Preview Reset */}
      <div className="relative mb-3 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-surface/30 bg-surface/70 px-3.5 py-1 text-xs font-semibold tracking-wide uppercase shadow-xs backdrop-blur-md">
          {celebration.badgeLabel}
        </span>
        {isCustomPreview && onResetPreview && (
          <button
            type="button"
            onClick={onResetPreview}
            className="rounded-full bg-surface/80 px-2.5 py-0.5 text-[10px] text-muted hover:text-text transition"
            title="Reset to today's real date"
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* Headline */}
      <p className="text-xs font-medium uppercase tracking-widest text-muted/90">
        {celebration.headline}
      </p>

      {/* Main Title */}
      <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-text sm:text-3xl md:text-4xl">
        {celebration.title}
      </h2>

      {/* The Romantic Couple Wish */}
      <div className="mx-auto mt-3 max-w-lg rounded-2xl border border-surface/40 bg-surface/85 p-4 shadow-xs backdrop-blur-md">
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
      </div>
    </section>
  )
}
