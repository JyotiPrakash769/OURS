-- OURS: Photos & Media (Phase 6)
-- Private photo storage for memories. Path convention: {relationship_id}/{uuid}.webp

-- ---------- memory_media ----------
create table public.memory_media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  storage_key text not null check (char_length(storage_key) between 5 and 255),
  media_type text not null default 'image/webp',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index memory_media_memory_idx on public.memory_media (memory_id, sort_order asc);
create index memory_media_relationship_idx on public.memory_media (relationship_id);

-- ---------- RLS & Privileges ----------
alter table public.memory_media enable row level security;
revoke all on public.memory_media from anon, authenticated;

grant select on public.memory_media to authenticated;
grant insert (memory_id, relationship_id, storage_key, media_type, sort_order) on public.memory_media to authenticated;
grant update (sort_order) on public.memory_media to authenticated;
grant delete on public.memory_media to authenticated;

create policy "memory_media: read relationship members" on public.memory_media for select to authenticated
  using (public.is_relationship_member(relationship_id));

create policy "memory_media: insert relationship members" on public.memory_media for insert to authenticated
  with check (public.is_relationship_member(relationship_id));

create policy "memory_media: update relationship members" on public.memory_media for update to authenticated
  using (public.is_relationship_member(relationship_id))
  with check (public.is_relationship_member(relationship_id));

create policy "memory_media: delete relationship members" on public.memory_media for delete to authenticated
  using (public.is_relationship_member(relationship_id));

-- ---------- Storage bucket policy helpers (if storage schema exists) ----------
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('memory-media', 'memory-media', false, 10485760, array['image/webp', 'image/jpeg', 'image/png', 'image/heic'])
    on conflict (id) do nothing;

    -- Read policy for memory-media bucket
    create policy "storage: read memory photos" on storage.objects for select to authenticated
      using (
        bucket_id = 'memory-media' and
        public.is_relationship_member((storage.foldername(name))[1]::uuid)
      );

    -- Insert policy for memory-media bucket
    create policy "storage: upload memory photos" on storage.objects for insert to authenticated
      with check (
        bucket_id = 'memory-media' and
        public.is_relationship_member((storage.foldername(name))[1]::uuid)
      );

    -- Delete policy for memory-media bucket
    create policy "storage: delete memory photos" on storage.objects for delete to authenticated
      using (
        bucket_id = 'memory-media' and
        public.is_relationship_member((storage.foldername(name))[1]::uuid)
      );
  end if;
end $$;
