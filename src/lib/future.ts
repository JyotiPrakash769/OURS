import { db } from './supabase'

export type FutureItem = {
  id: string
  relationship_id: string
  creator_id: string
  title: string
  completed: boolean
  completed_at: string | null
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

export async function createFutureItem(relationshipId: string, title: string): Promise<FutureItem> {
  const trimmed = title.trim()
  if (!trimmed) throw new Error('Title cannot be empty')

  const { data, error } = await db()
    .from('future_items')
    .insert({
      relationship_id: relationshipId,
      title: trimmed,
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

export async function updateFutureItem(id: string, title: string): Promise<FutureItem> {
  const trimmed = title.trim()
  if (!trimmed) throw new Error('Title cannot be empty')

  const { data, error } = await db()
    .from('future_items')
    .update({ title: trimmed })
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
