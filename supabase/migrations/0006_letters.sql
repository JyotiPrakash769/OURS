-- OURS: Letters (Phase 10 — Time-Locked Letters)
-- Write letters to your partner, sealed until a future date.
-- Strict security: The body column is never exposed to select before unlock_at.

create table public.letters (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 10000),
  unlock_at timestamptz not null,
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create index letters_relationship_idx on public.letters (relationship_id, unlock_at desc);

create trigger letters_updated before update on public.letters
  for each row execute function public.set_updated_at();

alter table public.letters enable row level security;
revoke all on public.letters from anon, authenticated;

-- The 'body' column is deliberately NOT granted to select for authenticated users.
grant select (id, relationship_id, sender_id, recipient_id, title, unlock_at, opened_at, created_at, updated_at)
  on public.letters to authenticated;

grant insert (relationship_id, recipient_id, title, body, unlock_at)
  on public.letters to authenticated;

grant delete on public.letters to authenticated;

create policy "letters: read envelope for members" on public.letters for select to authenticated
  using (public.is_relationship_member(relationship_id));

create policy "letters: insert for sender" on public.letters for insert to authenticated
  with check (
    sender_id = (select auth.uid()) and
    public.is_relationship_member(relationship_id)
  );

create policy "letters: delete sender" on public.letters for delete to authenticated
  using (
    sender_id = (select auth.uid()) and
    public.is_relationship_member(relationship_id)
  );

-- Secure RPC to read letter body only when unlocked or caller is the author
create or replace function public.read_letter(p_letter_id uuid)
returns table (
  id uuid,
  title text,
  body text,
  unlock_at timestamptz,
  opened_at timestamptz,
  sender_id uuid,
  recipient_id uuid,
  created_at timestamptz
)
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_letter public.letters%rowtype;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select * into v_letter from public.letters where public.letters.id = p_letter_id;
  if not found then raise exception 'letter not found'; end if;

  if not (v_letter.sender_id = v_uid or v_letter.recipient_id = v_uid) then
    raise exception 'access denied';
  end if;

  -- If caller is recipient, must be past unlock_at
  if v_letter.recipient_id = v_uid and now() < v_letter.unlock_at then
    raise exception 'this letter is locked until %', v_letter.unlock_at;
  end if;

  -- Record opened_at if recipient opens for first time
  if v_letter.recipient_id = v_uid and v_letter.opened_at is null then
    update public.letters set opened_at = now() where public.letters.id = p_letter_id;
    v_letter.opened_at := now();
  end if;

  return query select
    v_letter.id,
    v_letter.title,
    v_letter.body,
    v_letter.unlock_at,
    v_letter.opened_at,
    v_letter.sender_id,
    v_letter.recipient_id,
    v_letter.created_at;
end $$;

revoke all on function public.read_letter(uuid) from public, anon;
grant execute on function public.read_letter(uuid) to authenticated;
