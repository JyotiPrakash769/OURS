-- 0010_unlink_partner.sql
-- Enables the primary relationship creator (user_a) to remove/unlink a partner and purge test accounts
-- so they can generate a fresh invite link for their actual partner. Only user_a can invoke this.

create or replace function public.unlink_partner()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_rel_id uuid;
  v_partner_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- Verify caller is user_a (only the creator has administrative control to add/unadd partners)
  select id, user_b_id into v_rel_id, v_partner_id
  from public.relationships
  where user_a_id = v_uid;

  if v_rel_id is null then
    raise exception 'Only the relationship creator can manage partner connections.';
  end if;

  if v_partner_id is null then
    raise exception 'No partner is currently connected.';
  end if;

  -- 1. Expire all pending invites for this relationship
  update public.relationship_invites
  set expires_at = now()
  where relationship_id = v_rel_id and accepted_at is null;

  -- 2. Clear user_b_id on the relationship
  update public.relationships
  set user_b_id = null
  where id = v_rel_id;

  -- 3. Delete the disconnected user_b from auth.users (cascades to profile, tokens, push subs)
  delete from auth.users where id = v_partner_id;
end;
$$;

revoke all on function public.unlink_partner() from public;
grant execute on function public.unlink_partner() to authenticated;
