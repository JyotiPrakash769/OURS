import { useEffect, useState, type FormEvent } from 'react'
import { MEMORY_CATEGORIES, type Memory, type MemoryCategory, type MemoryInput } from '../lib/memories'
import { MemoryPhoto } from './MemoryPhoto'
import type { MemoryMedia } from '../lib/storage'

type Props = {
  initial?: Memory | null
  existingMedia?: MemoryMedia[]
  onSave: (input: MemoryInput, file?: File | null) => Promise<void>
  onDeleteMedia?: (mediaId: string, storageKey: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}

export function MemoryFormModal({
  initial,
  existingMedia = [],
  onSave,
  onDeleteMedia,
  onDelete,
  onClose,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState<MemoryCategory>(initial?.category ?? 'Moment')
  const [memoryDate, setMemoryDate] = useState(() => {
    if (initial?.memory_date) return initial.memory_date
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [memoryTime, setMemoryTime] = useState(initial?.memory_time?.slice(0, 5) ?? '')
  const [locationName, setLocationName] = useState(initial?.location_name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  // Photo attachment
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (!file) {
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please give your memory a title.')
      return
    }
    if (!memoryDate) {
      setError('Please choose a date.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave(
        {
          title: title.trim(),
          category,
          memory_date: memoryDate,
          memory_time: memoryTime ? `${memoryTime}:00` : null,
          location_name: locationName.trim() || null,
          description: description.trim() || null,
        },
        selectedFile,
      )
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Failed to save memory.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initial || !onDelete) return
    if (!window.confirm('Delete this memory? This cannot be undone.')) return
    setDeleting(true)
    try {
      await onDelete(initial.id)
      onClose()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Failed to delete memory.'
      setError(msg)
    } finally {
      setDeleting(false)
    }
  }

  const handleRemoveExistingMedia = async (media: MemoryMedia) => {
    if (!onDeleteMedia) return
    if (!window.confirm('Remove this photo?')) return
    setDeletingMediaId(media.id)
    try {
      await onDeleteMedia(media.id, media.storage_key)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove photo.')
    } finally {
      setDeletingMediaId(null)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-xs"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 id="modal-title" className="font-serif text-xl font-medium text-text">
            {initial ? 'Edit Memory' : 'New Memory'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-text"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-accent/30 bg-accent-soft/30 p-3 text-sm text-accent">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="memory-title" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
              Title
            </label>
            <input
              id="memory-title"
              type="text"
              required
              maxLength={120}
              placeholder="The day we met, That rainy coffee, ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-text placeholder:text-muted/60 focus:border-accent focus:outline-hidden"
            />
          </div>

          {/* Category selection */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {MEMORY_CATEGORIES.map((cat) => {
                const isSelected = category === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex h-11 flex-col items-center justify-center rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'border-accent bg-accent-soft/40 text-accent font-semibold shadow-xs'
                        : 'border-border/80 bg-bg text-muted hover:border-border hover:text-text'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="mt-0.5 text-[11px]">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="memory-date" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
                Date
              </label>
              <input
                id="memory-date"
                type="date"
                required
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-text focus:border-accent focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="memory-time" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
                Time (optional)
              </label>
              <input
                id="memory-time"
                type="time"
                value={memoryTime}
                onChange={(e) => setMemoryTime(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-text focus:border-accent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label htmlFor="memory-location" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
              Location (optional)
            </label>
            <input
              id="memory-location"
              type="text"
              maxLength={120}
              placeholder="Café de Flore, Paris or Central Park"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-bg px-3.5 text-text placeholder:text-muted/60 focus:border-accent focus:outline-hidden"
            />
          </div>

          {/* Photo upload / Preview section */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
              Photo (optional)
            </label>

            {/* Existing photos if editing */}
            {existingMedia.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {existingMedia.map((media) => (
                  <div key={media.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                    <MemoryPhoto storageKey={media.storage_key} alt={title} className="h-full w-full object-cover" />
                    {onDeleteMedia && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingMedia(media)}
                        disabled={deletingMediaId === media.id}
                        aria-label="Remove photo"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New selected file preview */}
            {previewUrl ? (
              <div className="relative mb-2 h-36 w-full overflow-hidden rounded-xl border border-border bg-black/5">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleFileChange(null)}
                  aria-label="Remove selected photo"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white hover:bg-black"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/50 px-4 transition hover:border-accent hover:bg-bg">
                <span className="text-xs text-muted">📷 Click to choose a photo</span>
                <span className="mt-0.5 text-[10px] text-muted/70">Compressed automatically to WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label htmlFor="memory-desc" className="mb-1.5 block text-xs font-medium tracking-wide uppercase text-muted">
              Story / Notes (optional)
            </label>
            <textarea
              id="memory-desc"
              rows={3}
              maxLength={2000}
              placeholder="What made this moment unforgettable?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-bg p-3.5 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            {initial && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="h-11 px-4 text-xs font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || deleting}
                className="h-11 rounded-xl border border-border px-4 text-xs font-medium text-muted transition hover:bg-bg hover:text-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="h-11 rounded-xl bg-accent px-5 text-xs font-medium text-surface shadow-xs transition hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Memory'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
