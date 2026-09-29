-- OURS: memories (Feature 2 — Our Story)
-- A chronological relationship timeline with 4 categories: Moment, Date, Trip, Milestone.

-- Helper function: checks if auth.uid() is a member of relationship
create or replace function public.is_relationship_member(p_rel_id uuid) returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.relationships
    where id = p_rel_id and (user_a_id = auth.uid() or user_b_id = auth.uid())
  );
$$;

revoke all on function public.is_relationship_member(uuid) from public, anon;
grant execute on function public.is_relationship_member(uuid) to authenticated;

-- ---------- memories ----------
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  creator_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  memory_date date not null,
  memory_time time null,
  location_name text check (location_name is null or char_length(location_name) <= 120),
  latitude double precision,
  longitude double precision,
  category text not null check (category in ('Moment', 'Date', 'Trip', 'Milestone')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index memories_relationship_date_idx on public.memories (relationship_id, memory_date desc, created_at desc);

create trigger memories_updated before update on public.memories
  for each row execute function public.set_updated_at();

-- ---------- RLS & Privileges ----------
alter table public.memories enable row level security;
revoke all on public.memories from anon, authenticated;

grant select on public.memories to authenticated;
grant insert (relationship_id, title, description, memory_date, memory_time, location_name, latitude, longitude, category) on public.memories to authenticated;
grant update (title, description, memory_date, memory_time, location_name, latitude, longitude, category) on public.memories to authenticated;
grant delete on public.memories to authenticated;

create policy "memories: read relationship members" on public.memories for select to authenticated
  using (public.is_relationship_member(relationship_id));

create policy "memories: insert relationship members" on public.memories for insert to authenticated
  with check (
    creator_id = (select auth.uid()) and
    public.is_relationship_member(relationship_id)
  );

create policy "memories: update relationship members" on public.memories for update to authenticated
  using (public.is_relationship_member(relationship_id))
  with check (public.is_relationship_member(relationship_id));

create policy "memories: delete relationship members" on public.memories for delete to authenticated
  using (public.is_relationship_member(relationship_id));
