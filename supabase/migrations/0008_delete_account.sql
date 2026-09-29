-- 0008_delete_account.sql
-- Enables users to permanently delete their account and associated profile/data

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- If the user is the primary relationship creator (user_a), delete the relationship first
  -- to ensure clean cascading to memories, photos, letters, and future items.
  delete from public.relationships where user_a_id = v_uid;

  -- Delete the user from auth.users (cascades to profile, push_subscriptions, etc.)
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_user_account() from public;
grant execute on function public.delete_user_account() to authenticated;
