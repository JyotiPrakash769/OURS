import { compressImage } from './images'
import { db } from './supabase'

export type MemoryMedia = {
  id: string
  memory_id: string
  relationship_id: string
  storage_key: string
  media_type: string
  sort_order: number
  created_at: string
}

const BUCKET = 'memory-media'

// In-memory cache for signed URLs to avoid repeating network requests during render
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>()

export async function getSignedPhotoUrl(storageKey: string): Promise<string> {
  const cached = signedUrlCache.get(storageKey)
  const now = Date.now()
  // If cached and valid for at least 5 more minutes
  if (cached && cached.expiresAt > now + 300_000) {
    return cached.url
  }

  const { data, error } = await db().storage.from(BUCKET).createSignedUrl(storageKey, 3600)
  if (error || !data?.signedUrl) {
    throw error ?? new Error('Could not get photo URL')
  }

  signedUrlCache.set(storageKey, { url: data.signedUrl, expiresAt: now + 3600_000 })
  return data.signedUrl
}

export async function uploadMemoryPhoto(
  relationshipId: string,
  memoryId: string,
  file: File,
  sortOrder = 0,
): Promise<MemoryMedia> {
  // 1. Compress to WebP
  const { blob, mimeType } = await compressImage(file)

  // 2. Generate unique storage path: {relationship_id}/{uuid}.webp
  const fileExt = mimeType === 'image/webp' ? 'webp' : 'jpg'
  const storageKey = `${relationshipId}/${crypto.randomUUID()}.${fileExt}`

  // 3. Upload to Supabase Storage
  const { error: uploadError } = await db()
    .storage.from(BUCKET)
    .upload(storageKey, blob, { contentType: mimeType, upsert: false })

  if (uploadError) throw uploadError

  // 4. Save metadata in memory_media table
  const { data, error: dbError } = await db()
    .from('memory_media')
    .insert({
      memory_id: memoryId,
      relationship_id: relationshipId,
      storage_key: storageKey,
      media_type: mimeType,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (dbError) {
    // If DB insert failed, clean up the uploaded storage object
    await db().storage.from(BUCKET).remove([storageKey])
    throw dbError
  }

  return data as MemoryMedia
}

export async function loadMediaForMemories(relationshipId: string): Promise<Record<string, MemoryMedia[]>> {
  try {
    const { data, error } = await db()
      .from('memory_media')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('sort_order', { ascending: true })

    if (error) return {}

    const map: Record<string, MemoryMedia[]> = {}
    for (const item of (data ?? []) as MemoryMedia[]) {
      if (!map[item.memory_id]) map[item.memory_id] = []
      map[item.memory_id].push(item)
    }
    return map
  } catch {
    return {}
  }
}

export async function deleteMemoryMedia(id: string, storageKey: string): Promise<void> {
  await db().storage.from(BUCKET).remove([storageKey])
  const { error } = await db().from('memory_media').delete().eq('id', id)
  if (error) throw error
}
