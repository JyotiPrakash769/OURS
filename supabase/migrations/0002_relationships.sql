-- OURS: real accounts, two-person relationships, invite links.
-- Replaces the unused single-row `couple` table from 0001.
drop table if exists public.couple;

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (
    new.id,
    coalesce(
      nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 40), ''),
      nullif(left(split_part(new.email, '@', 1), 40), ''),
      'Me'
    )
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- relationships ----------
create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid references public.profiles(id) on delete set null, -- null until the partner accepts
  relationship_start_at timestamptz not null,
  timezone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_a_id <> user_b_id)
);
create unique index relationships_user_a_key on public.relationships (user_a_id);
create unique index relationships_user_b_key on public.relationships (user_b_id);
create trigger relationships_updated before update on public.relationships
  for each row execute function public.set_updated_at();

-- A person belongs to at most one relationship, in either slot.
create function public.enforce_single_relationship() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (
    select 1 from public.relationships r
    where r.id <> new.id
      and (r.user_a_id in (new.user_a_id, new.user_b_id) or r.user_b_id in (new.user_a_id, new.user_b_id))
  ) then
    raise exception 'That person already belongs to a relationship';
  end if;
  return new;
end $$;
create trigger relationships_single before insert or update on public.relationships
  for each row execute function public.enforce_single_relationship();

-- ---------- invites (only reachable through the functions below) ----------
create table public.relationship_invites (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_email text,
  token text not null unique
    default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- privileges + RLS ----------
revoke all on table public.profiles, public.relationships, public.relationship_invites from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant select, insert on public.relationships to authenticated;
grant update (relationship_start_at, timezone) on public.relationships to authenticated; -- members can never re-assign users

alter table public.profiles enable row level security;
alter table public.relationships enable row level security;
alter table public.relationship_invites enable row level security; -- no policies: no direct access

create policy "profiles: self or partner" on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or exists (select 1 from public.relationships r where profiles.id in (r.user_a_id, r.user_b_id))
  );
create policy "profiles: update self" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "relationships: members read" on public.relationships for select to authenticated
  using ((select auth.uid()) in (user_a_id, user_b_id));
create policy "relationships: create as first member" on public.relationships for insert to authenticated
  with check (user_a_id = (select auth.uid()) and user_b_id is null);
create policy "relationships: members update" on public.relationships for update to authenticated
  using ((select auth.uid()) in (user_a_id, user_b_id))
  with check ((select auth.uid()) in (user_a_id, user_b_id));

-- ---------- invite functions ----------
create function public.create_invite() returns text
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); rel uuid; tok text;
begin
  select id into rel from public.relationships where user_a_id = uid and user_b_id is null;
  if rel is null then raise exception 'There is no pending relationship to invite someone to'; end if;
  update public.relationship_invites set expires_at = now()
    where relationship_id = rel and accepted_at is null and expires_at > now();
  insert into public.relationship_invites (relationship_id, inviter_id) values (rel, uid) returning token into tok;
  return tok;
end $$;

create function public.accept_invite(p_token text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); inv public.relationship_invites;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into inv from public.relationship_invites where token = p_token for update;
  if not found or inv.accepted_at is not null or inv.expires_at < now() then
    raise exception 'This invite is invalid or has expired';
  end if;
  if inv.inviter_id = uid then raise exception 'You created this invite'; end if;
  update public.relationships set user_b_id = uid where id = inv.relationship_id and user_b_id is null;
  if not found then raise exception 'This relationship already has two people'; end if;
  update public.relationship_invites set accepted_at = now() where id = inv.id;
  return inv.relationship_id;
end $$;

revoke all on function public.create_invite() from public, anon;
revoke all on function public.accept_invite(text) from public, anon;
grant execute on function public.create_invite() to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
