-- OURS: Our Future (Phase 9 — Shared Bucket List)
-- Simple list of things to do together. No priorities, no deadlines, no gamification.

create table public.future_items (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  creator_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index future_items_relationship_idx on public.future_items (relationship_id, completed asc, created_at desc);

create trigger future_items_updated before update on public.future_items
  for each row execute function public.set_updated_at();

alter table public.future_items enable row level security;
revoke all on public.future_items from anon, authenticated;

grant select on public.future_items to authenticated;
grant insert (relationship_id, title) on public.future_items to authenticated;
grant update (title, completed, completed_at) on public.future_items to authenticated;
grant delete on public.future_items to authenticated;

create policy "future_items: read members" on public.future_items for select to authenticated
  using (public.is_relationship_member(relationship_id));

create policy "future_items: insert members" on public.future_items for insert to authenticated
  with check (
    creator_id = (select auth.uid()) and
    public.is_relationship_member(relationship_id)
  );

create policy "future_items: update members" on public.future_items for update to authenticated
  using (public.is_relationship_member(relationship_id))
  with check (public.is_relationship_member(relationship_id));

create policy "future_items: delete members" on public.future_items for delete to authenticated
  using (public.is_relationship_member(relationship_id));
