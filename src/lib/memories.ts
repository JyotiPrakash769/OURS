import { db } from './supabase'

export type MemoryCategory = 'Moment' | 'Date' | 'Trip' | 'Milestone'

export const MEMORY_CATEGORIES: { value: MemoryCategory; label: string; icon: string }[] = [
  { value: 'Moment', label: 'Moment', icon: '✨' },
  { value: 'Date', label: 'Date', icon: '☕' },
  { value: 'Trip', label: 'Trip', icon: '✈️' },
  { value: 'Milestone', label: 'Milestone', icon: '❤️' },
]

export type Memory = {
  id: string
  relationship_id: string
  creator_id: string
  title: string
  description: string | null
  memory_date: string // YYYY-MM-DD
  memory_time: string | null
  location_name: string | null
  latitude: number | null
  longitude: number | null
  category: MemoryCategory
  created_at: string
  updated_at: string
}

export type MemoryInput = {
  title: string
  description?: string | null
  memory_date: string
  memory_time?: string | null
  location_name?: string | null
  latitude?: number | null
  longitude?: number | null
  category: MemoryCategory
}

export async function loadMemories(relationshipId: string): Promise<Memory[]> {
  const { data, error } = await db()
    .from('memories')
    .select('*')
    .eq('relationship_id', relationshipId)
    .order('memory_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Memory[]
}

export async function createMemory(relationshipId: string, input: MemoryInput): Promise<Memory> {
  const { data, error } = await db()
    .from('memories')
    .insert({
      relationship_id: relationshipId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      memory_date: input.memory_date,
      memory_time: input.memory_time || null,
      location_name: input.location_name?.trim() || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      category: input.category,
    })
    .select()
    .single()

  if (error) throw error
  return data as Memory
}

export async function updateMemory(id: string, input: Partial<MemoryInput>): Promise<Memory> {
  const payload: Record<string, unknown> = {}
  if (input.title !== undefined) payload.title = input.title.trim()
  if (input.description !== undefined) payload.description = input.description?.trim() || null
  if (input.memory_date !== undefined) payload.memory_date = input.memory_date
  if (input.memory_time !== undefined) payload.memory_time = input.memory_time || null
  if (input.location_name !== undefined) payload.location_name = input.location_name?.trim() || null
  if (input.category !== undefined) payload.category = input.category

  const { data, error } = await db().from('memories').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as Memory
}

export async function deleteMemory(id: string): Promise<void> {
  const { error } = await db().from('memories').delete().eq('id', id)
  if (error) throw error
}
