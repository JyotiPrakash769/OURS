import { db } from './supabase'

export type Relationship = {
  id: string
  user_a_id: string
  user_b_id: string | null
  relationship_start_at: string
  timezone: string
}
export type Profile = { id: string; display_name: string }

/** RLS guarantees this only ever returns the caller's own relationship. */
export async function loadMyRelationship(): Promise<Relationship | null> {
  const { data, error } = await db().from('relationships').select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function loadProfiles(ids: string[]): Promise<Profile[]> {
  const { data, error } = await db().from('profiles').select('id, display_name').in('id', ids)
  if (error) throw error
  return data ?? []
}

export async function createRelationship(userId: string, startAt: Date, timezone: string) {
  const { error } = await db()
    .from('relationships')
    .insert({ user_a_id: userId, relationship_start_at: startAt.toISOString(), timezone })
  if (error) throw error
}

export async function createInvite(): Promise<string> {
  const { data, error } = await db().rpc('create_invite')
  if (error) throw error
  return data as string
}

export async function acceptInvite(token: string): Promise<void> {
  const { error } = await db().rpc('accept_invite', { p_token: token })
  if (error) throw error
}
