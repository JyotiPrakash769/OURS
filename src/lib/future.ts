import { db } from './supabase'

export type FutureItem = {
  id: string
  relationship_id: string
  creator_id: string
  title: string
  completed: boolean
  completed_at: string | null
  target_at: string | null
  created_at: string
  updated_at: string
}

export async function loadFutureItems(relationshipId: string): Promise<FutureItem[]> {
  const { data, error } = await db()
    .from('future_items')
    .select('*')
    .eq('relationship_id', relationshipId)
    .order('completed', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as FutureItem[]
}

export async function createFutureItem(
  relationshipId: string,
  title: string,
  targetAt?: string | null,
): Promise<FutureItem> {
  const trimmed = title.trim()
  if (!trimmed) throw new Error('Title cannot be empty')

  const { data, error } = await db()
    .from('future_items')
    .insert({
      relationship_id: relationshipId,
      title: trimmed,
      target_at: targetAt || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as FutureItem
}

export async function toggleFutureItem(id: string, completed: boolean): Promise<FutureItem> {
  const { data, error } = await db()
    .from('future_items')
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as FutureItem
}

export async function updateFutureItem(
  id: string,
  title: string,
  targetAt?: string | null,
): Promise<FutureItem> {
  const trimmed = title.trim()
  if (!trimmed) throw new Error('Title cannot be empty')

  const updates: Record<string, unknown> = { title: trimmed }
  if (targetAt !== undefined) {
    updates.target_at = targetAt || null
  }

  const { data, error } = await db()
    .from('future_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as FutureItem
}

export async function deleteFutureItem(id: string): Promise<void> {
  const { error } = await db().from('future_items').delete().eq('id', id)
  if (error) throw error
}
