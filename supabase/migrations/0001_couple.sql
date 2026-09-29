-- OURS: one shared Supabase account (the "common password"), one couple row.
-- Setup in the Supabase dashboard:
--   1. Authentication -> Sign In / Providers: turn OFF "Allow new users to sign up" (after creating the user) and "Confirm email".
--   2. Authentication -> Users -> Add user: your shared email + the common password (min 6 characters).

create table public.couple (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton), -- guarantees at most one row
  name_a text not null check (char_length(name_a) between 1 and 40),
  name_b text not null check (char_length(name_b) between 1 and 40),
  relationship_start_at timestamptz not null,
  timezone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.couple enable row level security;
revoke all on public.couple from anon;

-- Only the signed-in shared account can touch the data. No delete policy on purpose.
create policy "couple: read" on public.couple for select to authenticated using (true);
create policy "couple: insert" on public.couple for insert to authenticated with check (true);
create policy "couple: update" on public.couple for update to authenticated using (true) with check (true);
