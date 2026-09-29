import { useState } from 'react'
import { FOOTSTEP_SPOTS, type FootstepSpot } from '../lib/footsteps'

type Props = {
  isOpen: boolean
  onClose: () => void
}

// Coordinate bounds for projecting onto SVG viewBox (width: 800, height: 500)
// Longitude: 85.55 (West - Khordha) to 85.90 (East - Bhubaneswar)
// Latitude: 20.15 (South - Khordha) to 20.35 (North - Nayapalli / Chandrasekharpur)
const MIN_LON = 85.55
const MAX_LON = 85.9
const MIN_LAT = 20.15
const MAX_LAT = 20.35

function projectCoords(lat: number, lon: number): { x: number; y: number } {
  const normX = (lon - MIN_LON) / (MAX_LON - MIN_LON)
  // In SVG, Y is inverted (north is at top, so max lat is at y=0)
  const normY = 1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)

  // Map to SVG dimensions with padding: 800 x 500
  const x = 60 + normX * (800 - 120)
  const y = 50 + normY * (500 - 100)
  return { x, y }
}

export function OurFootstepsModal({ isOpen, onClose }: Props) {
  const [selectedSpot, setSelectedSpot] = useState<FootstepSpot>(FOOTSTEP_SPOTS[0])
  const [filter, setFilter] = useState<string>('All')

  if (!isOpen) return null

  const filteredSpots =
    filter === 'All' ? FOOTSTEP_SPOTS : FOOTSTEP_SPOTS.filter((s) => s.category === filter)

  // Connect chronological spots with a dashed romance trail
  const trailPoints = FOOTSTEP_SPOTS.map((s) => {
    const { x, y } = projectCoords(s.latitude, s.longitude)
    return `${x},${y}`
  }).join(' ')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="footsteps-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4 bg-surface/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <h2 id="footsteps-modal-title" className="font-serif text-xl font-medium text-text">
                Our Footsteps
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Every place in Bhubaneswar & Khordha where our love story has unfolded.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-bg hover:text-text"
          >
            ✕
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x divide-border/60 border-b border-border/60 bg-surface-elevated/40 text-center py-2.5 px-4 text-xs">
          <div>
            <p className="font-serif text-base font-medium text-text">9 Spots</p>
            <p className="text-[11px] text-muted">Explored Together</p>
          </div>
          <div>
            <p className="font-serif text-base font-medium text-accent">7.5 Hours</p>
            <p className="text-[11px] text-muted">Longest Park Date</p>
          </div>
          <div>
            <p className="font-serif text-base font-medium text-text">10 Movies</p>
            <p className="text-[11px] text-muted">Cinema Dates</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="no-scrollbar flex gap-2 border-b border-border/50 px-6 py-2 overflow-x-auto bg-surface/60">
          {['All', 'Milestone', 'Kiss', 'Date', 'Sacred', 'Cinema'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === cat
                  ? 'bg-accent text-surface shadow-xs'
                  : 'bg-surface-elevated text-muted hover:text-text'
              }`}
            >
              {cat === 'Kiss' ? '💋 First Kiss' : cat === 'Milestone' ? '💍 Milestones' : cat}
            </button>
          ))}
        </div>

        {/* Map Canvas Container */}
        <div className="relative flex-1 overflow-hidden bg-bg/40 min-h-[280px] sm:min-h-[360px]">
          <svg
            viewBox="0 0 800 500"
            className="h-full w-full select-none"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.05))' }}
          >
            <defs>
              {/* Radial glow for selected pin */}
              <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background Region Outlines & Atmosphere */}
            <rect width="800" height="500" fill="transparent" />

            {/* Stylized Regional Zones */}
            <circle cx="200" cy="300" r="140" fill="currentColor" className="text-accent/5" />
            <circle cx="580" cy="220" r="190" fill="currentColor" className="text-accent/5" />

            {/* Region Labels */}
            <text x="180" y="440" fill="currentColor" className="text-muted/40 font-serif text-sm">
              Khordha Region
            </text>
            <text x="540" y="80" fill="currentColor" className="text-muted/40 font-serif text-sm">
              Bhubaneswar City
            </text>

            {/* Connecting Romance Trail */}
            <polyline
              points={trailPoints}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="4 6"
              strokeOpacity="0.4"
            />

            {/* Footstep Spot Pins */}
            {filteredSpots.map((spot) => {
              const { x, y } = projectCoords(spot.latitude, spot.longitude)
              const isSelected = selectedSpot.id === spot.id

              return (
                <g
                  key={spot.id}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => setSelectedSpot(spot)}
                >
                  {/* Selected Pulse Ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="24"
                      fill="url(#pinGlow)"
                      className="animate-pulse"
                    />
                  )}

                  {/* Marker Pin Base */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 16 : 12}
                    fill={isSelected ? '#e11d48' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : '#f43f5e'}
                    strokeWidth="2.5"
                    className="shadow-md transition-all"
                  />

                  {/* Pin Emoji Icon */}
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize={isSelected ? '14' : '11'}
                    className="select-none pointer-events-none"
                  >
                    {spot.icon}
                  </text>

                  {/* Pin Name Label */}
                  <text
                    x={x}
                    y={y + (isSelected ? 26 : 22)}
                    textAnchor="middle"
                    className={`text-[10px] font-medium tracking-tight pointer-events-none select-none ${
                      isSelected
                        ? 'fill-accent font-bold drop-shadow-sm'
                        : 'fill-muted dark:fill-muted'
                    }`}
                  >
                    {spot.name.length > 18 ? spot.name.slice(0, 16) + '…' : spot.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected Spot Detail Drawer */}
        <div className="border-t border-border/70 bg-surface p-5 sm:p-6 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedSpot.icon}</span>
                <h3 className="font-serif text-lg font-medium text-text">{selectedSpot.name}</h3>
                <span className="rounded-full bg-accent-soft/30 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                  {selectedSpot.badge}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                📍 {selectedSpot.area} · 🗓️ {selectedSpot.dateStr}
              </p>
            </div>

            <a
              href={selectedSpot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text shadow-xs hover:border-accent hover:text-accent transition active:scale-95 shrink-0"
            >
              <span>🗺️</span>
              <span>Open in Google Maps ↗</span>
            </a>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-text/90 leading-relaxed bg-surface-elevated/40 rounded-xl p-3 border border-border/40">
            {selectedSpot.description}
          </p>

          {selectedSpot.highlight && (
            <p className="mt-2 text-xs font-medium text-accent">
              ✨ {selectedSpot.highlight}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
