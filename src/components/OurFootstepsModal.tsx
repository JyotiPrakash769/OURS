import { useState, useRef, useEffect } from 'react'
import { FOOTSTEP_SPOTS, type FootstepSpot } from '../lib/footsteps'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const MIN_LON = 84.7
const MAX_LON = 86.0
const MIN_LAT = 20.0
const MAX_LAT = 22.4

function projectCoords(lat: number, lon: number): { x: number; y: number } {
  const normX = Math.max(0, Math.min(1, (lon - MIN_LON) / (MAX_LON - MIN_LON)))
  const normY = Math.max(0, Math.min(1, 1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)))
  return {
    x: 50 + normX * (800 - 100),
    y: 50 + normY * (500 - 100),
  }
}

export function OurFootstepsModal({ isOpen, onClose }: Props) {
  const [selectedSpot, setSelectedSpot] = useState<FootstepSpot>(FOOTSTEP_SPOTS[0])
  const [filter, setFilter] = useState<string>('All')

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const handleZoomIn = () => setZoom((z) => Math.min(3.5, +(z + 0.3).toFixed(1)))
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, +(z - 0.3).toFixed(1)))
  const handleResetZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (!isOpen) return
    const el = mapContainerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.15 : -0.15
      setZoom((z) => Math.max(0.6, Math.min(3.5, +(z + delta).toFixed(2))))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [isOpen])

  if (!isOpen) return null

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y })
    }
  }

  const handleTouchEnd = () => setIsDragging(false)

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
              From Sector 7, Rourkela, to Janaki Ballav Pattnaik Park and PJ Veena Hall in Khordha.
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
            <p className="font-serif text-base font-medium text-text">10 Spots</p>
            <p className="text-[11px] text-muted">Explored Together</p>
          </div>
          <div>
            <p className="font-serif text-base font-medium text-accent">7.5 Hours</p>
            <p className="text-[11px] text-muted">Longest Park Date</p>
          </div>
          <div>
            <p className="font-serif text-base font-medium text-text">10 Movies</p>
            <p className="text-[11px] text-muted">PJ Veena Hall</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="no-scrollbar flex gap-2 border-b border-border/50 px-6 py-2 overflow-x-auto bg-surface/60">
          {['All', 'Milestone', 'Kiss', 'Cinema', 'Sacred', 'Moment'].map((cat) => (
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

        {/* Map Canvas Container with Zoom & Pan */}
        <div className="relative flex-1 overflow-hidden bg-bg/40 min-h-[300px] sm:min-h-[380px]">
          {/* Floating Zoom & Pan Controls */}
          <div className="absolute top-3 right-3 z-20 flex flex-col items-center gap-1 rounded-2xl border border-border/80 bg-surface/90 p-1.5 shadow-md backdrop-blur-md">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-text hover:bg-surface-elevated active:scale-95 transition text-base font-bold"
            >
              ＋
            </button>
            <div className="px-1 text-[10px] font-mono font-medium text-muted select-none">
              {Math.round(zoom * 100)}%
            </div>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-text hover:bg-surface-elevated active:scale-95 transition text-base font-bold"
            >
              －
            </button>
            {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Map View"
                aria-label="Reset Map View"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated text-xs text-muted hover:text-text transition mt-0.5"
              >
                ⟲
              </button>
            )}
          </div>

          <div
            ref={mapContainerRef}
            className={`h-full w-full touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <svg
              viewBox="0 0 800 500"
              className="h-full w-full select-none"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.05))' }}
            >
              <defs>
                <radialGradient id="modalPinGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
              </defs>

              <g
                transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}
                style={{
                  transformOrigin: '400px 250px',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
              >
                {/* Background Atmosphere */}
                <circle cx="200" cy="300" r="140" fill="currentColor" className="text-accent/5" />
                <circle cx="580" cy="220" r="190" fill="currentColor" className="text-accent/5" />

                {/* Region Labels */}
                <text x="220" y="440" fill="currentColor" className="text-muted/40 font-serif text-xs">
                  Khurda & Bhubaneswar Corridor
                </text>
                <text x="240" y="100" fill="currentColor" className="text-muted/40 font-serif text-xs">
                  Rourkela (Sector 7)
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSpot(spot)
                      }}
                    >
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="24"
                          fill="url(#modalPinGlow)"
                          className="animate-pulse"
                        />
                      )}

                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 16 : 12}
                        fill={isSelected ? '#e11d48' : '#ffffff'}
                        stroke={isSelected ? '#ffffff' : '#f43f5e'}
                        strokeWidth="2.5"
                        className="shadow-md transition-all"
                      />

                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fontSize={isSelected ? '14' : '11'}
                        className="select-none pointer-events-none"
                      >
                        {spot.icon}
                      </text>

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
              </g>
            </svg>
          </div>
        </div>

        {/* Selected Spot Detail Drawer */}
        <div className="border-t border-border/70 bg-surface p-5 sm:p-6 transition-all duration-300 text-left">
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
