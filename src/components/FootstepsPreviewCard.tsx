import { useState } from 'react'
import { OurFootstepsModal } from './OurFootstepsModal'

export function FootstepsPreviewCard() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="mt-8 w-full max-w-md">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="group relative w-full overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-surface via-surface-elevated to-surface p-4 text-left shadow-2xs transition hover:border-accent/40 hover:shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft/30 text-lg group-hover:scale-105 transition-transform">
                🗺️
              </div>
              <div>
                <h3 className="font-serif text-sm font-medium text-text group-hover:text-accent transition-colors">
                  Our Footsteps Map
                </h3>
                <p className="text-[11px] text-muted">
                  9 romantic spots across Bhubaneswar & Khordha
                </p>
              </div>
            </div>
            <span className="text-xs text-muted group-hover:text-accent transition-colors font-medium">
              View Map →
            </span>
          </div>
        </button>
      </div>

      <OurFootstepsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
