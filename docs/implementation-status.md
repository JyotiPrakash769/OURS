# Current status

Stack: Vite + React + TypeScript + Tailwind 4 + react-router + vite-plugin-pwa + Supabase.
Auth model (original spec plan): real accounts (email + password), one relationship with two members, invite link (token, 7 days). Shared-password experiment was dropped because it cannot tell the partners apart (needed for Letters).

Completed:
- Phase 1: foundation (tokens, fonts, manifest, icons, nav, service worker for app shell)
- Phase 2: register / login / logout, route protection, invite acceptance page
- Phase 3: profiles + relationships + invites schema (migration 0002, drops unused `couple` from 0001), RLS, invite RPCs; start-moment onboarding; invite panel on Home while pending
- Phase 4 (partial): live counter, next milestone. "On This Day" waits for memories.
- Phase 5: Our Story — memories CRUD + timeline, migration 0003_memories.sql, category filters (Moment, Date, Trip, Milestone), year separators, MemoryFormModal, TimelineCard, Story page.
- Phase 6: Photos & Storage — migration 0004_photos.sql, private storage bucket configuration, client-side WebP compression, photo uploads, signed URLs, MemoryPhoto component, photo attachment in modal and timeline card.
- Phase 7: Memory Wall — responsive Polaroid masonry gallery, subtle deterministic tilts (±2° max), MemoryViewerModal full-screen lightbox, "✨ Take me somewhere" random memory button.
- Phase 8: On This Day — Home screen anniversary card displaying matching memories from previous years in the relationship timezone ("render nothing if none").
- Phase 9: Our Future — shared bucket list, migration 0005_future_items.sql, add/edit/delete dreams, optimistic completion toggle, completed date tracking ("Completed 18 September 2026"), no deadlines or gamification per spec.
- Phase 10: Letters — time-locked partner letters, migration 0006_letters.sql, security definer read_letter RPC (body strictly hidden before unlock_at), sealed envelope UI, WriteLetterModal, LetterReaderModal with stationery paper styling, desktop TopBar & Home shortcuts.
- Tests: 12 date tests + 33 RLS/authorization tests (45 total, running all 6 migrations on PGlite; mutation-checked)

Next:
- Security audit & final polish (PWA offline check, physical Android layout checks)

Not verified:
- Migration 0003_memories.sql needs to be executed once in the live Supabase SQL editor
- Android install/offline; mobile layout at 360-430px
- Deviations from spec: `anniversary_date` column omitted (derived from start date); invite step is a panel on Home instead of a separate onboarding screen; account deletion not built yet
