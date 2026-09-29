// Runs the real migrations on an in-process Postgres (PGlite) with a minimal stand-in for Supabase's auth schema.
import { readFileSync, readdirSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'

const db = new PGlite()
const [alice, bob, carol, dave] = [1, 2, 3, 4].map((n) => `00000000-0000-0000-0000-00000000000${n}`)

async function as(uid: string | null, sql: string, params: unknown[] = []) {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ''])
  await db.exec(`set role ${uid ? 'authenticated' : 'anon'}`)
  try {
    return await db.query<Record<string, unknown>>(sql, params)
  } finally {
    await db.exec('reset role')
  }
}
const asAdmin = async (sql: string, params: unknown[] = []) => {
  await db.exec('reset role')
  return db.query<Record<string, unknown>>(sql, params)
}

beforeAll(async () => {
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    -- mimic Supabase default privileges (everything granted; migrations must revoke)
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on functions to anon, authenticated;
  `)
  const dir = new URL('../migrations/', import.meta.url)
  for (const f of readdirSync(dir).sort()) await db.exec(readFileSync(new URL(f, dir), 'utf8'))
  for (const [id, email, name] of [
    [alice, 'a@x.test', 'Alice'],
    [bob, 'b@x.test', 'Bob'],
    [carol, 'c@x.test', 'Carol'],
    [dave, 'd@x.test', 'Dave'],
  ])
    await asAdmin('insert into auth.users (id,email,raw_user_meta_data) values ($1,$2,$3::jsonb)', [
      id, email, JSON.stringify({ display_name: name }),
    ])
})

describe('relationship authorization', () => {
  let token = ''

  it('creates profiles from sign-up metadata', async () => {
    const r = await asAdmin('select display_name from public.profiles where id = $1', [alice])
    expect(r.rows[0].display_name).toBe('Alice')
  })

  it('lets a user create a relationship only as first member', async () => {
    await as(alice, `insert into public.relationships (user_a_id, relationship_start_at, timezone)
                     values ($1, '2024-05-12T13:00:00Z', 'Asia/Kolkata')`, [alice])
    await expect(
      as(carol, `insert into public.relationships (user_a_id, relationship_start_at, timezone)
                 values ($1, now(), 'UTC')`, [alice]),
    ).rejects.toThrow()
  })

  it('hides the relationship and profiles from non-members', async () => {
    expect((await as(bob, 'select * from public.relationships')).rows).toHaveLength(0)
    expect((await as(bob, 'select id from public.profiles where id = $1', [alice])).rows).toHaveLength(0)
    expect((await as(alice, 'select * from public.relationships')).rows).toHaveLength(1)
  })

  it('denies anonymous access', async () => {
    await expect(as(null, 'select * from public.relationships')).rejects.toThrow(/permission denied/)
    await expect(as(null, 'select * from public.profiles')).rejects.toThrow(/permission denied/)
  })

  it('denies direct access to invites, even for members', async () => {
    await expect(as(alice, 'select * from public.relationship_invites')).rejects.toThrow(/permission denied/)
  })

  it('only the creator of a pending relationship can create invites', async () => {
    await expect(as(bob, 'select public.create_invite()')).rejects.toThrow(/no pending relationship/)
    const r = await as(alice, 'select public.create_invite() as t')
    token = r.rows[0].t as string
    expect(token).toHaveLength(64)
  })

  it('rejects the inviter accepting their own invite and unknown tokens', async () => {
    await expect(as(alice, 'select public.accept_invite($1)', [token])).rejects.toThrow(/created this invite/)
    await expect(as(bob, "select public.accept_invite('nope')")).rejects.toThrow(/invalid or has expired/)
  })

  it('rejects expired invites', async () => {
    await asAdmin("update public.relationship_invites set expires_at = now() - interval '1 day' where token = $1", [token])
    await expect(as(bob, 'select public.accept_invite($1)', [token])).rejects.toThrow(/invalid or has expired/)
    await asAdmin("update public.relationship_invites set expires_at = now() + interval '1 day' where token = $1", [token])
  })

  it('lets the partner join and then both see the relationship and each other', async () => {
    await as(bob, 'select public.accept_invite($1)', [token])
    expect((await as(bob, 'select * from public.relationships')).rows).toHaveLength(1)
    const names = await as(bob, 'select display_name from public.profiles order by display_name')
    expect(names.rows.map((r) => r.display_name)).toEqual(['Alice', 'Bob'])
  })

  it('keeps strangers out after the relationship is full', async () => {
    expect((await as(carol, 'select * from public.relationships')).rows).toHaveLength(0)
    expect((await as(carol, 'select id from public.profiles')).rows.map((r) => r.id)).toEqual([carol])
  })

  it('rejects reusing an invite and creating more invites', async () => {
    await expect(as(carol, 'select public.accept_invite($1)', [token])).rejects.toThrow(/invalid or has expired/)
    await expect(as(alice, 'select public.create_invite()')).rejects.toThrow(/no pending relationship/)
  })

  it('stops a member from re-assigning users, but allows editing the start moment', async () => {
    await expect(as(alice, 'update public.relationships set user_b_id = $1', [carol])).rejects.toThrow(/permission denied/)
    await expect(as(alice, 'update public.relationships set user_a_id = $1', [carol])).rejects.toThrow(/permission denied/)
    await as(alice, "update public.relationships set timezone = 'Asia/Kolkata', relationship_start_at = '2024-05-12T14:00:00Z'")
    const r = await as(bob, 'select relationship_start_at from public.relationships')
    expect(new Date(r.rows[0].relationship_start_at as string).toISOString()).toBe('2024-05-12T14:00:00.000Z')
  })

  it('lets a non-member update nothing in someone else\'s relationship', async () => {
    const r = await as(carol, "update public.relationships set timezone = 'UTC'")
    expect(r.affectedRows).toBe(0)
  })

  it('does not let a person join two relationships', async () => {
    await expect(
      as(bob, `insert into public.relationships (user_a_id, relationship_start_at, timezone)
               values ($1, now(), 'UTC')`, [bob]),
    ).rejects.toThrow()
  })

  it('does not let users edit other people\'s profiles', async () => {
    const r = await as(alice, "update public.profiles set display_name = 'Hacked' where id = $1", [bob])
    expect(r.affectedRows).toBe(0)
  })
})

describe('memories authorization', () => {
  let relId: string
  let memoryId: string

  it('allows relationship member to insert a memory', async () => {
    const rel = await as(alice, 'select id from public.relationships')
    relId = rel.rows[0].id as string
    const res = await as(
      alice,
      `insert into public.memories (relationship_id, title, description, memory_date, category)
       values ($1, 'First Trip', 'Went to Paris', '2024-06-15', 'Trip')
       returning id, creator_id`,
      [relId],
    )
    expect(res.rows).toHaveLength(1)
    memoryId = res.rows[0].id as string
    expect(res.rows[0].creator_id).toBe(alice)
  })

  it('allows partner (Bob) to read and update the memory', async () => {
    const memories = await as(bob, 'select * from public.memories where relationship_id = $1', [relId])
    expect(memories.rows).toHaveLength(1)
    expect(memories.rows[0].title).toBe('First Trip')

    await as(bob, `update public.memories set title = 'First Trip to Paris' where id = $1`, [memoryId])
    const updated = await as(alice, 'select title from public.memories where id = $1', [memoryId])
    expect(updated.rows[0].title).toBe('First Trip to Paris')
  })

  it('blocks non-members (Carol) from reading, inserting, or modifying memories', async () => {
    const memories = await as(carol, 'select * from public.memories where relationship_id = $1', [relId])
    expect(memories.rows).toHaveLength(0)

    await expect(
      as(carol, `insert into public.memories (relationship_id, title, memory_date, category)
                 values ($1, 'Sneak', '2024-07-01', 'Moment')`, [relId]),
    ).rejects.toThrow(/row-level security/)

    const updateRes = await as(carol, `update public.memories set title = 'Hacked' where id = $1`, [memoryId])
    expect(updateRes.affectedRows).toBe(0)

    const deleteRes = await as(carol, `delete from public.memories where id = $1`, [memoryId])
    expect(deleteRes.affectedRows).toBe(0)
  })

  it('rejects invalid category constraint', async () => {
    await expect(
      as(alice, `insert into public.memories (relationship_id, title, memory_date, category)
                 values ($1, 'Bad Category', '2024-06-15', 'Anniversary')`, [relId]),
    ).rejects.toThrow(/violates check constraint/)
  })

  it('prevents tampering with relationship_id or creator_id on update', async () => {
    await expect(
      as(alice, `update public.memories set creator_id = $1 where id = $2`, [bob, memoryId]),
    ).rejects.toThrow(/permission denied/)
    await expect(
      as(alice, `update public.memories set relationship_id = $1 where id = $2`, [relId, memoryId]),
    ).rejects.toThrow(/permission denied/)
  })

  it('allows partner to delete the memory', async () => {
    const del = await as(bob, 'delete from public.memories where id = $1', [memoryId])
    expect(del.affectedRows).toBe(1)
    const check = await as(alice, 'select * from public.memories where id = $1', [memoryId])
    expect(check.rows).toHaveLength(0)
  })
})

describe('memory media authorization', () => {
  let relId: string
  let memoryId: string
  let mediaId: string

  it('allows member to attach media to a memory and cascade deletes on memory removal', async () => {
    const rel = await as(alice, 'select id from public.relationships')
    relId = rel.rows[0].id as string

    // Create a new memory
    const memRes = await as(
      alice,
      `insert into public.memories (relationship_id, title, memory_date, category)
       values ($1, 'Beach Day', '2024-08-10', 'Moment')
       returning id`,
      [relId],
    )
    memoryId = memRes.rows[0].id as string

    // Insert media
    const mediaRes = await as(
      alice,
      `insert into public.memory_media (memory_id, relationship_id, storage_key, media_type, sort_order)
       values ($1, $2, 'rel1/photo1.webp', 'image/webp', 0)
       returning id`,
      [memoryId, relId],
    )
    expect(mediaRes.rows).toHaveLength(1)
    mediaId = mediaRes.rows[0].id as string

    // Partner (Bob) can read media
    const bobRead = await as(bob, 'select * from public.memory_media where memory_id = $1', [memoryId])
    expect(bobRead.rows).toHaveLength(1)
    expect(bobRead.rows[0].storage_key).toBe('rel1/photo1.webp')

    // Stranger (Carol) cannot read or insert
    const carolRead = await as(carol, 'select * from public.memory_media where memory_id = $1', [memoryId])
    expect(carolRead.rows).toHaveLength(0)

    await expect(
      as(carol, `insert into public.memory_media (memory_id, relationship_id, storage_key)
                 values ($1, $2, 'rel1/evil.webp')`, [memoryId, relId]),
    ).rejects.toThrow(/row-level security/)

    // Deleting the memory cascades to delete memory_media
    await as(bob, 'delete from public.memories where id = $1', [memoryId])
    const mediaCheck = await as(alice, 'select * from public.memory_media where id = $1', [mediaId])
    expect(mediaCheck.rows).toHaveLength(0)
  })
})

describe('future items authorization', () => {
  let relId: string
  let itemId: string

  it('allows member to add a future bucket item', async () => {
    const rel = await as(alice, 'select id from public.relationships')
    relId = rel.rows[0].id as string

    const res = await as(
      alice,
      `insert into public.future_items (relationship_id, title)
       values ($1, 'See the Northern Lights')
       returning id, creator_id, completed`,
      [relId],
    )
    expect(res.rows).toHaveLength(1)
    itemId = res.rows[0].id as string
    expect(res.rows[0].creator_id).toBe(alice)
    expect(res.rows[0].completed).toBe(false)
  })

  it('allows partner (Bob) to read and complete the item', async () => {
    const items = await as(bob, 'select * from public.future_items where relationship_id = $1', [relId])
    expect(items.rows).toHaveLength(1)
    expect(items.rows[0].title).toBe('See the Northern Lights')

    // Bob marks as completed
    await as(bob, 'update public.future_items set completed = true, completed_at = now() where id = $1', [itemId])
    const updated = await as(alice, 'select completed, completed_at from public.future_items where id = $1', [itemId])
    expect(updated.rows[0].completed).toBe(true)
    expect(updated.rows[0].completed_at).toBeTruthy()
  })

  it('blocks strangers (Carol) from viewing or modifying future items', async () => {
    const items = await as(carol, 'select * from public.future_items where relationship_id = $1', [relId])
    expect(items.rows).toHaveLength(0)

    await expect(
      as(carol, `insert into public.future_items (relationship_id, title)
                 values ($1, 'Crash relationship')`, [relId]),
    ).rejects.toThrow(/row-level security/)

    const updateRes = await as(carol, `update public.future_items set title = 'Hacked' where id = $1`, [itemId])
    expect(updateRes.affectedRows).toBe(0)

    const deleteRes = await as(carol, `delete from public.future_items where id = $1`, [itemId])
    expect(deleteRes.affectedRows).toBe(0)
  })

  it('prevents tampering with relationship_id or creator_id on update', async () => {
    await expect(
      as(alice, `update public.future_items set creator_id = $1 where id = $2`, [bob, itemId]),
    ).rejects.toThrow(/permission denied/)
  })

  it('allows partner to delete the future item', async () => {
    const del = await as(bob, 'delete from public.future_items where id = $1', [itemId])
    expect(del.affectedRows).toBe(1)
    const check = await as(alice, 'select * from public.future_items where id = $1', [itemId])
    expect(check.rows).toHaveLength(0)
  })
})

describe('letters authorization', () => {
  let relId: string
  let lockedLetterId: string
  let unlockedLetterId: string

  it('allows sender to create a time-locked letter to partner', async () => {
    const rel = await as(alice, 'select id from public.relationships')
    relId = rel.rows[0].id as string

    // Alice creates locked letter to Bob
    const res = await as(
      alice,
      `insert into public.letters (relationship_id, recipient_id, title, body, unlock_at)
       values ($1, $2, 'Our First Anniversary', 'Secret love letter body...', now() + interval '30 days')
       returning id, sender_id, recipient_id`,
      [relId, bob],
    )
    expect(res.rows).toHaveLength(1)
    lockedLetterId = res.rows[0].id as string
    expect(res.rows[0].sender_id).toBe(alice)
    expect(res.rows[0].recipient_id).toBe(bob)
  })

  it('strictly blocks direct table select on letter body column', async () => {
    // Both Alice and Bob cannot select 'body' column directly from table
    await expect(as(bob, 'select body from public.letters where id = $1', [lockedLetterId])).rejects.toThrow(
      /permission denied for table letters/,
    )
    await expect(as(alice, 'select body from public.letters where id = $1', [lockedLetterId])).rejects.toThrow(
      /permission denied for table letters/,
    )

    // Direct select on allowed metadata columns works
    const meta = await as(bob, 'select id, title, unlock_at from public.letters where id = $1', [lockedLetterId])
    expect(meta.rows).toHaveLength(1)
    expect(meta.rows[0].title).toBe('Our First Anniversary')
  })

  it('prevents recipient from reading letter body via RPC before unlock_at', async () => {
    await expect(as(bob, 'select * from public.read_letter($1)', [lockedLetterId])).rejects.toThrow(
      /this letter is locked until/,
    )
  })

  it('allows the author (Alice) to preview her own locked letter', async () => {
    const res = await as(alice, 'select * from public.read_letter($1)', [lockedLetterId])
    expect(res.rows).toHaveLength(1)
    expect(res.rows[0].body).toBe('Secret love letter body...')
  })

  it('allows recipient to read letter body once unlock_at is reached and marks opened_at', async () => {
    // Insert an already-unlocked letter
    const res = await as(
      alice,
      `insert into public.letters (relationship_id, recipient_id, title, body, unlock_at)
       values ($1, $2, 'Open Now', 'Welcome to Paris!', now() - interval '1 hour')
       returning id`,
      [relId, bob],
    )
    unlockedLetterId = res.rows[0].id as string

    // Bob reads the unlocked letter
    const readRes = await as(bob, 'select * from public.read_letter($1)', [unlockedLetterId])
    expect(readRes.rows).toHaveLength(1)
    expect(readRes.rows[0].body).toBe('Welcome to Paris!')
    expect(readRes.rows[0].opened_at).toBeTruthy()
  })

  it('blocks non-members (Carol) from reading envelopes or calling read_letter', async () => {
    const envelope = await as(carol, 'select id, title from public.letters where relationship_id = $1', [relId])
    expect(envelope.rows).toHaveLength(0)

    await expect(as(carol, 'select * from public.read_letter($1)', [unlockedLetterId])).rejects.toThrow(
      /access denied/,
    )
  })

  it('manages push subscriptions and allows partner lookup', async () => {
    // Alice inserts her subscription
    await as(
      alice,
      `insert into public.push_subscriptions (user_id, relationship_id, endpoint, p256dh, auth)
       values ($1, $2, 'https://push.example.com/alice', 'p256_alice', 'auth_alice')`,
      [alice, relId],
    )

    // Bob inserts his subscription
    await as(
      bob,
      `insert into public.push_subscriptions (user_id, relationship_id, endpoint, p256dh, auth)
       values ($1, $2, 'https://push.example.com/bob', 'p256_bob', 'auth_bob')`,
      [bob, relId],
    )

    // Carol cannot see Alice's subscription
    const carolQuery = await as(carol, 'select * from public.push_subscriptions where user_id = $1', [alice])
    expect(carolQuery.rows).toHaveLength(0)

    // Alice queries partner push subscriptions and receives Bob's endpoint
    const partnerSubs = await as(alice, 'select * from public.get_partner_push_subscriptions($1)', [relId])
    expect(partnerSubs.rows).toHaveLength(1)
    expect(partnerSubs.rows[0].endpoint).toBe('https://push.example.com/bob')

    // Carol calling get_partner_push_subscriptions is rejected
    await expect(as(carol, 'select * from public.get_partner_push_subscriptions($1)', [relId])).rejects.toThrow(
      /unauthorized/,
    )
  })
})




