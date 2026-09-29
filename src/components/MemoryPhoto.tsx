import { useEffect, useState } from 'react'
import { getSignedPhotoUrl } from '../lib/storage'

type Props = {
  storageKey: string
  alt: string
  className?: string
}

export function MemoryPhoto({ storageKey, alt, className = '' }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let ignore = false

    getSignedPhotoUrl(storageKey)
      .then((signed) => {
        if (!ignore) {
          setUrl(signed)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [storageKey])

  if (loading) {
    return (
      <div
        className={`flex aspect-4/3 w-full animate-pulse items-center justify-center rounded-xl bg-border/40 text-xs text-muted ${className}`}
      >
        <span>Loading photo...</span>
      </div>
    )
  }

  if (error || !url) {
    return null
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border/60 bg-black/5 ${className}`}>
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className="h-auto w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
      />
    </div>
  )
}
