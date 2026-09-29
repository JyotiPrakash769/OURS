-- OURS: Seed all 23 memories for ALL relationships and ensure memory_media exists

-- 1. Ensure memory_media table exists (resolves the 404 error seen in console)
create table if not exists public.memory_media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  storage_key text not null check (char_length(storage_key) between 5 and 255),
  media_type text not null default 'image/webp',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.memory_media enable row level security;
grant select, insert, update, delete on public.memory_media to authenticated;

drop policy if exists "memory_media: select all" on public.memory_media;
create policy "memory_media: select all" on public.memory_media for select to authenticated using (true);
drop policy if exists "memory_media: insert all" on public.memory_media;
create policy "memory_media: insert all" on public.memory_media for insert to authenticated with check (true);
drop policy if exists "memory_media: delete all" on public.memory_media;
create policy "memory_media: delete all" on public.memory_media for delete to authenticated using (true);

-- 2. Insert all 23 memories for every relationship in the database
do $$
declare
  r record;
begin
  for r in (select id, user_a_id from public.relationships) loop
    -- Clear any previous memories for this relationship to ensure a clean sync
    delete from public.memories where relationship_id = r.id;

    -- 1. 5th July: First meet after 702 days
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, location_name, category)
    values (r.id, r.user_a_id, 'First Meet After 702 Days ❤️', 'Our first meet after 702 long days apart. An unforgettable beginning to our story.', '2026-07-05', 'First Meeting', 'Milestone');

    -- 2. 12th July: 1st official date Kala Bhoomi (11:30 AM - 2:15 PM)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '1st Official Date at Kala Bhoomi', 'Our very first official date together exploring Kala Bhoomi crafts museum. (11:30 AM – 2:15 PM)', '2026-07-12', '11:30:00', 'Kala Bhoomi', 'Date');

    -- 3. 17th July: Lingaraj and Rajarani temple (4:00 PM - 8:30 PM)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Lingaraj & Rajarani Temple Visit', 'Peaceful and divine evening visiting Lingaraj and Rajarani temples together. (4:00 PM – 8:30 PM)', '2026-07-17', '16:00:00', 'Lingaraj & Rajarani Temple', 'Date');

    -- 4. 19th July: 1st movie together - Evil Dead Burn (3:00 PM - 5:50 PM)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '1st Movie Together: Evil Dead Burn 🎬', 'Our very first movie date together watching Evil Dead Burn. (3:00 PM – 5:50 PM)', '2026-07-19', '15:00:00', 'Cinema', 'Date');

    -- 5. 22nd July: 2nd movie together - Dhamaal 4 (3:00 PM - 6:25 PM)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '2nd Movie Together: Dhamaal 4 🍿', 'Laughed through our 2nd movie date watching Dhamaal 4. (3:00 PM – 6:25 PM)', '2026-07-22', '15:00:00', 'Cinema', 'Date');

    -- 6. 25th July: Jaydev Vatika (5:00 PM - 8:00 PM)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Serene Walk at Jaydev Vatika 🌿', 'A beautiful relaxing evening strolling through Jaydev Vatika park. (5:00 PM – 8:00 PM)', '2026-07-25', '17:00:00', 'Jaydev Vatika', 'Moment');

    -- 7. 29th July: Proposal at The Park in Khordha (4:00 PM - 9:15 PM)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Proposal Day at Khordha Park 💍❤️', 'The magical moment at the park in Khordha where we said yes to forever. The most special day! (4:00 PM – 9:15 PM)', '2026-07-29', '16:00:00', 'The Park in Khordha', 'Milestone');

    -- 8. 31st July: 1st date as couples - ISKCON & Botanical Garden (4:15 PM - 9:45 PM)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '1st Date as a Couple: ISKCON & Botanical Garden 🌸', 'Our official first date as a couple! Visiting ISKCON Nayapalli and walking through Botanical Garden Nayapalli. (4:15 PM – 9:45 PM)', '2026-07-31', '16:15:00', 'ISKCON & Botanical Garden, Nayapalli', 'Date');

    -- 9. 2nd August: The park in Khordha (5:30 PM - 8:30 PM)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Back to Khordha Park 🌳', 'Revisiting our special park in Khordha for a sweet sunset conversation. (5:30 PM – 8:30 PM)', '2026-08-02', '17:30:00', 'The Park in Khordha', 'Moment');

    -- 10. 4th August: 3rd movie (1st as couple) - Jan Neta
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '3rd Movie (1st as Couple): Jan Neta 🎬', 'Our first movie together as an official couple watching Jan Neta. (3 hr 3 mins + 1 hr extra time)', '2026-08-04', '14:00:00', 'Cinema', 'Date');

    -- 11. 7th August: Park date (3.5 - 4 hours)
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Lovely Afternoon Park Date 🍃', 'A sweet 4-hour peaceful afternoon together in the park holding hands and talking.', '2026-08-07', '16:00:00', 'Park', 'Moment');

    -- 12. 8th August: 4th movie - Jan Neta
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '4th Movie Date: Jan Neta Round 2', 'Movie session #4 enjoying Jan Neta once again. (3.3 hrs + 1 hr)', '2026-08-08', '14:30:00', 'Cinema', 'Date');

    -- 13. 9th August: 5th movie - Jan Neta
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '5th Movie Date: Jan Neta Again!', 'Movie session #5 with our favorite movie companion. (3.3 hrs + 1 hr)', '2026-08-09', '14:30:00', 'Cinema', 'Date');

    -- 14. 11th August: 6th movie - Spiderman
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '6th Movie Date: Spiderman 🕷️', 'Action-packed movie date watching Spiderman together. (1 hr 45 min + 30 min)', '2026-08-11', '15:00:00', 'Cinema', 'Date');

    -- 15. 15th August: 7th movie - Awaarapan
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Independence Day & Movie 7: Awarapan 🇮🇳', 'Special Independence Day together watching Awarapan and enjoying long conversations. (2 hr 20 min + 1 hr + 1.5 hr)', '2026-08-15', '13:00:00', 'Cinema', 'Date');

    -- 16. 19th August: Park 5 hours
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '5-Hour Park Date 🏞️', 'A wonderful 5-hour escape in nature surrounded by greenery and each other.', '2026-08-19', '15:00:00', 'Park', 'Moment');

    -- 17. 22nd August: 8th movie Insidious & 9th movie Batwara + lunch
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Double Feature Movie Day & Lunch: Insidious + Batwara 🎥', 'An epic movie marathon day! Watched Insidious (1 hr 46 min + 20 min) and Batwara (2 hr 24 min) with a 1.5 hr lunch date.', '2026-08-22', '12:00:00', 'Cinema & Lunch', 'Date');

    -- 18. 26th August: ISKCON & Ram Mandir
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Devotional Evening: ISKCON & Ram Mandir 🛕', 'Seeking blessings together on a serene tour of ISKCON and Ram Mandir.', '2026-08-26', '16:30:00', 'ISKCON & Ram Mandir', 'Date');

    -- 19. 27th August: Park date - longest time spent 7.5 hrs
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Longest Date Ever: 7.5 Hours Together in the Park ⏳💖', 'Our record-setting park date! Spent 7.5 uninterrupted hours talking, laughing, and simply being together.', '2026-08-27', '13:00:00', 'Park', 'Moment');

    -- 20. 28th August: Movie 10 - Toxic
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '10th Movie Milestone: Toxic 🎞️', 'Double-digit movie milestone! Celebrated our 10th cinema date watching Toxic.', '2026-08-28', '16:00:00', 'Cinema', 'Date');

    -- 21. 29th August: 1 Month Anniversary
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '1 Month Anniversary ❤️', 'One magical month since our proposal day on 29th July. 31 days of pure love and happiness.', '2026-08-29', '18:00:00', 'Our Special Place', 'Milestone');

    -- 22. 14th September: Sweet reunion, movie & Ganesh Puja Mela
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, 'Sweet Reunion, Movie & Ganesh Puja Mela 🎪❤️', 'A heartwarming reunion! Watched a movie together and visited the vibrant, festive Ganesh Puja Mela at Khudupur Field near IIT Road.', '2026-09-14', '15:30:00', 'Khudupur Field, Near IIT Road', 'Trip');

    -- 23. 29th September: 2nd Month Anniversary
    insert into public.memories (relationship_id, creator_id, title, description, memory_date, memory_time, location_name, category)
    values (r.id, r.user_a_id, '2nd Month Anniversary ❤️ Today!', 'Two months of loving each other more and more every single day. Here is to a lifetime more.', '2026-09-29', '18:00:00', 'Together', 'Milestone');
  end loop;
end $$;

-- 3. Confirm rows inserted
select count(*) as total_memories_added, relationship_id from public.memories group by relationship_id;
