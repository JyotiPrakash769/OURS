-- 0009_future_event_dates.sql
-- Adds target_at timestamp to future_items for planned events with live countdowns

alter table public.future_items
  add column if not exists target_at timestamptz;

grant insert (relationship_id, title, target_at) on public.future_items to authenticated;
grant update (title, completed, completed_at, target_at) on public.future_items to authenticated;
