import { useMemo, useState } from 'react'
import { FOOTSTEP_SPOTS, type FootstepSpot, type Region } from '../lib/footsteps'

// Viewport bounds for different region modes
const BOUNDS: Record<Region, { minLon: number; maxLon: number; minLat: number; maxLat: number }> = {
  All: {
    minLon: 84.7,
    maxLon: 86.0,
    minLat: 20.0,
    maxLat: 22.4,
  },
  'Khurda & Bhubaneswar': {
    minLon: 85.55,
    maxLon: 85.9,
    minLat: 20.12,
    maxLat: 20.35,
  },
  Rourkela: {
    minLon: 84.82,
    maxLon: 84.95,
    minLat: 22.2,
    maxLat: 22.3,
  },
}

function project(
  lat: number,
  lon: number,
  region: Region
): { x: number; y: number } {
  const b = BOUNDS[region]
  const normX = Math.max(0, Math.min(1, (lon - b.minLon) / (b.maxLon - b.minLon)))
  const normY = Math.max(0, Math.min(1, 1 - (lat - b.minLat) / (b.maxLat - b.minLat)))
  return {
    x: 50 + normX * (800 - 100),
    y: 50 + normY * (500 - 100),
  }
}

export function FootstepsPage() {
  const [selectedSpot, setSelectedSpot] = useState<FootstepSpot>(FOOTSTEP_SPOTS[0])
  const [region, setRegion] = useState<Region>('All')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')

  const visibleSpots = useMemo(() => {
    return FOOTSTEP_SPOTS.filter((s) => {
      const matchRegion =
        region === 'All'
          ? true
          : region === 'Rourkela'
            ? s.region === 'Rourkela'
            : s.region === 'Khurda' || s.region === 'Bhubaneswar'
      const matchCat = categoryFilter === 'All' ? true : s.category === categoryFilter
      return matchRegion && matchCat
    })
  }, [region, categoryFilter])

  // Connecting trail line between spots
  const trailPoints = useMemo(() => {
    return visibleSpots
      .map((s) => {
        const { x, y } = project(s.latitude, s.longitude, region)
        return `${x},${y}`
      })
      .join(' ')
  }, [visibleSpots, region])

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 text-left">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-text sm:text-4xl">
            Our Footsteps
          </h1>
        </div>
        <p className="text-sm text-muted">
          From our first meet in Sector 7, Rourkela, to our proposal at Janaki Ballav Pattnaik Park and movies at PJ Veena Hall in Khordha.
        </p>
      </div>

      {/* Stats Summary Card */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/70 bg-surface p-3.5 text-center shadow-xs">
          <p className="text-xl">🚉</p>
          <p className="mt-1 font-serif text-base font-medium text-text">Rourkela Meet</p>
          <p className="text-[11px] text-muted">Sector 7 · After 702 Days</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface p-3.5 text-center shadow-xs">
          <p className="text-xl">💍</p>
          <p className="mt-1 font-serif text-base font-medium text-text">Janaki Ballav Park</p>
          <p className="text-[11px] text-muted">Proposal & 7.5h Record · Khordha</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface p-3.5 text-center shadow-xs">
          <p className="text-xl">🎬</p>
          <p className="mt-1 font-serif text-base font-medium text-text">PJ Veena Hall</p>
          <p className="text-[11px] text-muted">10 Movie Dates in Khurda</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface p-3.5 text-center shadow-xs">
          <p className="text-xl">💋</p>
          <p className="mt-1 font-serif text-base font-medium text-text">Jaydev Vatika</p>
          <p className="text-[11px] text-muted">First Kiss (25th July)</p>
        </div>
      </div>

      {/* Region & Category Controls */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Region Switcher */}
        <div className="flex rounded-xl border border-border/80 bg-surface p-1 shadow-2xs">
          {(['All', 'Khurda & Bhubaneswar', 'Rourkela'] as Region[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                region === r
                  ? 'bg-accent text-surface shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              {r === 'All' ? 'Odisha (All)' : r}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {['All', 'Milestone', 'Kiss', 'Cinema', 'Sacred', 'Date'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                categoryFilter === cat
                  ? 'bg-accent text-surface shadow-xs'
                  : 'border border-border/70 bg-surface text-muted hover:text-text'
              }`}
            >
              {cat === 'Kiss' ? '💋 First Kiss' : cat === 'Milestone' ? '💍 Milestones' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="mt-4 relative overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-md">
        <div className="relative h-[320px] sm:h-[400px] w-full bg-gradient-to-b from-bg/60 to-surface">
          <svg viewBox="0 0 800 500" className="h-full w-full select-none">
            <defs>
              <radialGradient id="mapPinGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Region outlines/labels */}
            {region === 'All' && (
              <>
                <circle cx="240" cy="120" r="80" fill="currentColor" className="text-accent/5" />
                <circle cx="620" cy="380" r="110" fill="currentColor" className="text-accent/5" />
                <text x="240" y="190" textAnchor="middle" fill="currentColor" className="text-muted/40 font-serif text-xs">
                  Northwest Odisha (Rourkela)
                </text>
                <text x="620" y="470" textAnchor="middle" fill="currentColor" className="text-muted/40 font-serif text-xs">
                  Central / Coastal Odisha (Khurda & Bhubaneswar)
                </text>
              </>
            )}

            {/* Connecting romance trail */}
            {trailPoints && (
              <polyline
                points={trailPoints}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="4 6"
                strokeOpacity="0.45"
              />
            )}

            {/* Landmark Pins */}
            {visibleSpots.map((spot) => {
              const { x, y } = project(spot.latitude, spot.longitude, region)
              const isSelected = selectedSpot.id === spot.id

              return (
                <g
                  key={spot.id}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => setSelectedSpot(spot)}
                >
                  {isSelected && (
                    <circle cx={x} cy={y} r="26" fill="url(#mapPinGlow)" className="animate-pulse" />
                  )}

                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 16 : 12}
                    fill={isSelected ? '#e11d48' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : '#f43f5e'}
                    strokeWidth="2.5"
                    className="shadow-sm"
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
                      isSelected ? 'fill-accent font-bold drop-shadow-sm' : 'fill-muted'
                    }`}
                  >
                    {spot.name.length > 20 ? spot.name.slice(0, 18) + '…' : spot.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected Landmark Detail Card */}
        <div className="border-t border-border/70 bg-surface-elevated/40 p-5 sm:p-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl">{selectedSpot.icon}</span>
                <h2 className="font-serif text-lg sm:text-xl font-medium text-text">
                  {selectedSpot.name}
                </h2>
                <span className="rounded-full bg-accent-soft/30 px-2.5 py-0.5 text-xs font-semibold text-accent">
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
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-medium text-text shadow-xs hover:border-accent hover:text-accent transition active:scale-95 shrink-0"
            >
              <span>🗺️</span>
              <span>Open in Google Maps ↗</span>
            </a>
          </div>

          <p className="mt-3 rounded-xl border border-border/50 bg-surface p-3.5 text-xs sm:text-sm text-text/90 leading-relaxed shadow-2xs">
            {selectedSpot.description}
          </p>

          {selectedSpot.highlight && (
            <p className="mt-2 text-xs font-medium text-accent">
              ✨ {selectedSpot.highlight}
            </p>
          )}
        </div>
      </div>

      {/* Spot Cards Grid */}
      <div className="mt-8 space-y-3 text-left">
        <h3 className="font-serif text-lg font-medium text-text">
          All Footstep Locations ({visibleSpots.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleSpots.map((spot) => {
            const isSelected = selectedSpot.id === spot.id
            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  isSelected
                    ? 'border-accent bg-accent-soft/20 shadow-xs'
                    : 'border-border/70 bg-surface hover:border-border hover:bg-surface-elevated'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{spot.icon}</span>
                    <div>
                      <h4 className="font-serif text-sm font-medium text-text">{spot.name}</h4>
                      <p className="text-[11px] text-muted">{spot.area}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-accent">
                    {spot.badge}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                  {spot.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
