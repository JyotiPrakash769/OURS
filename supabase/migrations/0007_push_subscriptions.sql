-- 0007_push_subscriptions.sql
-- Stores browser Web Push API subscriptions for partners

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship_id uuid references public.relationships(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create index if not exists idx_push_subs_user on public.push_subscriptions (user_id);
create index if not exists idx_push_subs_rel on public.push_subscriptions (relationship_id);

-- RLS: Users can only manage their own subscriptions
create policy "users can manage their own push subscriptions"
  on public.push_subscriptions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Secure RPC to get partner's push subscription endpoints (only callable by a member of the relationship)
create or replace function public.get_partner_push_subscriptions(p_relationship_id uuid)
returns table (
  endpoint text,
  p256dh text,
  auth text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rel public.relationships%rowtype;
begin
  select * into v_rel
  from public.relationships
  where id = p_relationship_id;

  if v_rel.id is null then
    return;
  end if;

  -- Only authorized if caller is user_a or user_b
  if auth.uid() <> v_rel.user_a_id and auth.uid() <> coalesce(v_rel.user_b_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'unauthorized';
  end if;

  return query
  select ps.endpoint, ps.p256dh, ps.auth
  from public.push_subscriptions ps
  where ps.relationship_id = p_relationship_id
    and ps.user_id <> auth.uid();
end;
$$;

revoke all on function public.get_partner_push_subscriptions(uuid) from public;
grant execute on function public.get_partner_push_subscriptions(uuid) to authenticated;
