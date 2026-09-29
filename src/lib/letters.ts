import { db } from './supabase'

export type LetterEnvelope = {
  id: string
  relationship_id: string
  sender_id: string
  recipient_id: string
  title: string
  unlock_at: string
  opened_at: string | null
  created_at: string
}

export type LetterDetail = {
  id: string
  title: string
  body: string
  unlock_at: string
  opened_at: string | null
  sender_id: string
  recipient_id: string
  created_at: string
}

export type LetterInput = {
  recipient_id: string
  title: string
  body: string
  unlock_at: string // ISO string
}

export async function loadLetterEnvelopes(relationshipId: string): Promise<LetterEnvelope[]> {
  try {
    const { data, error } = await db()
      .from('letters')
      .select('id, relationship_id, sender_id, recipient_id, title, unlock_at, opened_at, created_at')
      .eq('relationship_id', relationshipId)
      .order('unlock_at', { ascending: false })

    if (error) return []
    return (data ?? []) as LetterEnvelope[]
  } catch {
    return []
  }
}

export async function sendLetter(relationshipId: string, input: LetterInput): Promise<void> {
  const { error } = await db()
    .from('letters')
    .insert({
      relationship_id: relationshipId,
      recipient_id: input.recipient_id,
      title: input.title.trim(),
      body: input.body.trim(),
      unlock_at: input.unlock_at,
    })

  if (error) throw error
}

export async function readLetter(letterId: string): Promise<LetterDetail> {
  const { data, error } = await db().rpc('read_letter', { p_letter_id: letterId })
  if (error) throw error
  if (!data || data.length === 0) throw new Error('Letter not found')
  return data[0] as LetterDetail
}

export async function deleteLetter(letterId: string): Promise<void> {
  const { error } = await db().from('letters').delete().eq('id', letterId)
  if (error) throw error
}
