# OURS ♡ — Complete Product & Development Specification
## Claude Code / Claude prompt — Android-first relationship memory PWA

> **Purpose:** Give Claude a complete, opinionated specification for designing and building OURS, a private two-person relationship memory website that feels like a native Android app when installed and like a beautiful interactive scrapbook on a laptop.

---

# 1. PRODUCT DEFINITION

## Product name

**OURS ♡**

## One-line concept

> A private digital scrapbook for two people that counts how long they have been together, preserves their memories, and gives them a place to imagine what comes next.

## Core emotional promise

The product is not a social network, chat app, dating app, or relationship tracker.

It should answer only five questions:

1. **How long have we been together?** → Relationship Counter
2. **What have we experienced?** → Our Story
3. **What do we remember?** → Memory Wall
4. **What do we want to do together?** → Our Future
5. **What do I want to tell you?** → Letters

Do not expand the product into a generic couples platform.

---

# 2. NON-NEGOTIABLE PRODUCT PRINCIPLES

1. **Private by default.**
2. **Two-person experience.**
3. **Android-first.**
4. **Installable as a PWA.**
5. **Mobile feels like an app.**
6. **Laptop feels like an interactive scrapbook.**
7. **Warm, intimate, nostalgic, minimal.**
8. **Photos and memories are more important than statistics.**
9. **Very few features, executed deeply.**
10. **No unnecessary gamification.**
11. **No public social features.**
12. **No ads.**
13. **No AI relationship gimmicks.**
14. **Do not overuse hearts, pink, gradients, or emojis.**
15. **Do not build a SaaS dashboard aesthetic.**

---

# 3. FEATURES — ONLY THESE FIVE

## Feature 1 — Home / Relationship Counter

The homepage is the emotional center.

Display:

- Couple names
- Couple photo
- Live relationship duration
- Relationship start date
- Next meaningful milestone
- "On This Day" memory when one exists
- Small invitation to explore the story

Example:

```text
                         OURS ♡

                    Jyotirmayee + You

                       2 YEARS
                      4 MONTHS
                       17 DAYS

                    08 : 42 : 19

                  Since 12 May 2024

                       ↓

                 ON THIS DAY

                    [photo]

               "That rainy evening..."
```

### Counter requirements

Calculate accurately:

- Years
- Months
- Days
- Hours
- Minutes
- Seconds

Do NOT approximate months as 30 days for the primary display.

Use calendar-aware date arithmetic for years/months/days, then calculate the remaining hours/minutes/seconds.

Store the relationship start as a timezone-aware timestamp.

### Milestones

Support meaningful milestones such as:

- 100 days
- 365 days
- 500 days
- 1000 days
- Anniversary

Do not create dozens of arbitrary milestones.

### On This Day

Search memories from the same calendar date in previous years.

If no memory exists, do not display an empty card.

---

# 4. FEATURE 2 — OUR STORY

A chronological relationship timeline.

Every important memory belongs here.

A memory contains:

- id
- relationship_id
- creator_id
- title
- short description
- memory date
- optional time
- optional location name
- optional latitude/longitude
- category
- created_at
- updated_at

Categories:

- Moment
- Date
- Trip
- Milestone

Do not add 20 categories.

### Timeline example

```text
2024

❤️ The Beginning
12 May 2024

"The day we became us."

       ↓

☕ First Date
20 May 2024

       ↓

🌧️ That Rainy Evening
17 August 2024

       ↓

2025

✈️ Our First Trip
```

### Timeline behavior

Mobile:
- Vertical timeline
- Thumb-friendly
- Smooth scrolling
- Expandable memory cards

Laptop:
- More visual
- Horizontal/immersive timeline may be used
- Larger photographs
- More whitespace
- Asymmetric scrapbook composition

Same underlying data; presentation changes responsively.

---

# 5. FEATURE 3 — MEMORY WALL

A visual gallery of shared memories.

Use:

- Masonry layout
- Polaroid-inspired cards
- Subtle rotation
- Different image sizes
- Large photography
- Date and short caption

Do NOT make every image identical.

The Memory Wall should feel like a digital scrapbook.

## Random Memory

A button:

> ✨ Take me somewhere

opens a randomly selected past memory.

This is an important emotional feature.

The random selection should not repeatedly show the same memory when avoidable.

---

# 6. FEATURE 4 — OUR FUTURE

A very simple shared bucket list.

Example:

```text
OUR FUTURE ♡

☑ Watch a sunrise together
☑ Have a beach date

☐ Take a road trip
☐ Visit Kashmir
☐ Cook dinner together
☐ Take a photo booth picture
```

Each item:

- id
- relationship_id
- creator_id
- title
- completed
- completed_at
- created_at

When completed:

```text
☑ Take a road trip
Completed 18 September 2026
```

Do not turn this into a task manager.

No:
- priorities
- deadlines
- productivity scores
- assignees
- Kanban
- reminders by default

This is a list of experiences, not work.

---

# 7. FEATURE 5 — LETTERS

The intimate feature.

One partner can write a letter to the other.

Fields:

- id
- relationship_id
- sender_id
- recipient_id
- title
- body
- unlock_at
- opened_at
- created_at

Letters can be:

- Open now
- Locked until a date

Example:

```text
                 💌 FOR YOU

       "Something I want you
          to read someday."

                  🔒

              Opens on
            12 May 2027
```

Before unlock:
- Show title
- Show lock state
- Show unlock date
- Never expose the body

After unlock:
- Beautiful letter-reading screen
- Paper-like visual treatment
- Soft opening animation
- Mark as opened

Do not add chat.

WhatsApp/Instagram already handle instant communication.

Letters are intentionally slower.

---

# 8. EXPLICITLY DO NOT BUILD

Do not implement these in the initial product:

- Chat
- Comments
- Likes/reactions
- Followers
- Public profiles
- Relationship score
- Mood tracker
- Daily streaks
- Generic social feed
- Complex map
- Music streaming
- Weather
- Calendar integration
- AI girlfriend/boyfriend
- AI-generated romantic messages
- Ads
- Subscription/payment system
- Public discovery
- Gamification
- 50 relationship statistics
- Complex notification system

If a feature is not in the five core features, do not add it unless specifically requested later.

---

# 9. DESIGN LANGUAGE

## Overall aesthetic

> **Quiet digital scrapbook.**

Keywords:

- Warm
- Intimate
- Nostalgic
- Tactile
- Minimal
- Elegant
- Human
- Slightly imperfect

Avoid:

- Corporate
- SaaS
- Neon
- Glassmorphism everywhere
- Excessive gradients
- Candy pink
- Excessive rounded pills
- Generic dashboard cards

---

# 10. COLOR SYSTEM

Use CSS variables/design tokens.

```css
:root {
  --bg: #F7F3EC;
  --surface: #FFFDF8;
  --text: #292522;
  --muted: #81786F;
  --accent: #A6535B;
  --accent-soft: #E9CBCD;
  --border: #DED7CD;
  --shadow: rgba(50, 40, 30, 0.06);
}
```

Dark mode:

```css
[data-theme="dark"] {
  --bg: #191715;
  --surface: #24211E;
  --text: #F3EEE6;
  --muted: #AAA098;
  --accent: #C47A80;
  --accent-soft: #5B383C;
  --border: #3A3530;
  --shadow: rgba(0, 0, 0, 0.20);
}
```

### Rule

Rose is an accent, not the main background.

The interface should primarily be ivory/charcoal with restrained rose accents.

---

# 11. TYPOGRAPHY

Use two primary fonts.

## Display

Preferred:

- Cormorant Garamond

Alternative:
- DM Serif Display

Use for:
- Large counter
- Section titles
- Emotional headings
- Letters

## UI

Preferred:

- Inter

Alternative:
- DM Sans
- Manrope

Use for:
- Navigation
- Buttons
- Dates
- Forms
- Descriptions
- Metadata

Optional handwritten font may be used sparingly for tiny annotations only.

Never use a handwritten font for the whole UI.

---

# 12. TYPOGRAPHY HIERARCHY

Example:

```text
OUR STORY
```

Small/medium serif.

```text
2 YEARS
4 MONTHS
17 DAYS
```

Very large serif.

```text
Since 12 May 2024
```

Small clean sans.

The contrast between elegant serif and modern sans is a core part of the visual identity.

---

# 13. PHOTOGRAPHY LANGUAGE

Photography is the most important visual element.

Use:

- Polaroid-like framing
- Natural crops
- Occasional slight rotation
- Soft paper edges
- Large image surfaces
- Minimal overlays

Rotation:
- approximately -2deg to +2deg
- never exaggerated

Photos should look like physical memories placed onto a digital page.

---

# 14. CARDS

Avoid generic SaaS cards.

Prefer:

- paper-like surfaces
- thin warm borders
- subtle shadows
- generous whitespace
- minimal metadata
- visual hierarchy based on photography

Border radius:

```text
Buttons: 10–12px
Cards: 14–18px
Modals: 20px
Images: 2–8px
```

Do not use pill-shaped containers for everything.

---

# 15. ANIMATION LANGUAGE

Animation should be calm.

Use:

- fade
- gentle slide
- subtle scale
- image reveal
- page transitions
- counter transitions
- soft hover movement

Avoid:

- bouncing hearts
- constant floating emojis
- confetti everywhere
- aggressive parallax
- rapid transitions
- excessive motion

Typical duration:
- UI: 200–400ms
- Emotional transitions: 500–800ms

Respect `prefers-reduced-motion`.

---

# 16. ANDROID-FIRST UX

Design primarily for:

- 360px
- 390px
- 412px
- 430px

The mobile experience should feel like a native Android app.

Use:

- bottom navigation
- bottom sheets
- swipeable galleries
- full-screen image viewer
- large touch targets
- thumb-friendly controls
- safe-area handling
- no tiny desktop links
- no hover-dependent functionality

Minimum practical touch target:
- approximately 44px

---

# 17. MOBILE NAVIGATION

Bottom navigation:

```text
Home   Story   Memories   Future
```

Letters should be reachable from Home and relevant contexts rather than becoming a fifth bottom-nav item.

Top bar:

```text
OURS ♡                                  avatar
```

Keep navigation visually quiet.

---

# 18. DESKTOP/LAPTOP EXPERIENCE

Do not simply stretch the mobile layout.

Desktop should feel like an interactive scrapbook.

Use:

- larger typography
- large photography
- asymmetric layouts
- more whitespace
- immersive timeline
- horizontal storytelling where appropriate
- subtle mouse interactions
- larger visual compositions

Do not fill empty desktop space with unnecessary widgets.

More space should make existing content more beautiful, not introduce more features.

---

# 19. RESPONSIVE BREAKPOINTS

Suggested:

```text
Mobile:       320–767px
Tablet:       768–1023px
Laptop:       1024–1439px
Large:        1440px+
```

Mobile:
- vertical
- app-like
- focused

Laptop:
- scrapbook canvas
- larger photography
- immersive layouts

---

# 20. PWA REQUIREMENTS

The site MUST be installable on Android.

Implement:

- Web App Manifest
- Service Worker
- HTTPS in production
- app icons
- maskable icon
- splash/loading behavior
- standalone display mode
- theme/background colors
- offline app shell
- install prompt where supported

Manifest should include:

```json
{
  "name": "OURS ♡",
  "short_name": "OURS",
  "description": "Our little story.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F7F3EC",
  "theme_color": "#F7F3EC",
  "orientation": "portrait"
}
```

Use appropriate 192px, 512px and maskable icons.

Do not falsely claim that every browser exposes the same install prompt. Detect installation capability and provide a manual fallback message where needed.

---

# 21. PWA INSTALL EXPERIENCE

Do not immediately interrupt the user with an install dialog.

After meaningful interaction, show a tasteful prompt:

```text
Keep OURS with you ♡

Add OURS to your home screen
and keep your memories close.

[ Add to Home Screen ]

Later
```

If the browser does not support programmatic installation:
- explain how to use browser menu → Add to Home screen

The app should still function normally without installation.

---

# 22. APP ICON

Do not use a generic heart emoji as the icon.

Create a minimal proper icon.

Direction:

- warm ivory or muted rose background
- simple heart/OURS mark
- clean silhouette
- readable at 48px

Need:
- standard icon
- maskable icon
- favicon
- Apple touch icon

---

# 23. SPLASH / APP LAUNCH

Simple:

```text
             ♡

            OURS

       Our little story.
```

Keep it short.

No long loading screen.

---

# 24. AUTHENTICATION MODEL

The product is private.

A user can:

1. Register/login
2. Create a relationship
3. Invite partner
4. Partner accepts
5. Both access the same private relationship

A relationship has exactly two active members in the initial implementation.

Do not build multi-user groups.

---

# 25. DATA MODEL

Use a relational database.

Recommended entities:

## users

```text
id
email
display_name
avatar_url
created_at
updated_at
```

## relationships

```text
id
user_a_id
user_b_id
relationship_start_at
anniversary_date
created_at
updated_at
```

Constraints:
- user_a_id != user_b_id
- each user should not accidentally belong to multiple active relationships unless explicitly supported later

## relationship_invites

```text
id
relationship_id
inviter_id
invitee_email
token
expires_at
accepted_at
created_at
```

## memories

```text
id
relationship_id
creator_id
title
description
memory_date
memory_time
location_name
latitude
longitude
category
created_at
updated_at
```

## memory_media

```text
id
memory_id
storage_key
media_type
sort_order
created_at
```

## future_items

```text
id
relationship_id
creator_id
title
completed
completed_at
created_at
updated_at
```

## letters

```text
id
relationship_id
sender_id
recipient_id
title
body
unlock_at
opened_at
created_at
updated_at
```

---

# 26. DATABASE SECURITY

Every relationship-scoped query MUST verify membership.

Never trust a relationship ID sent from the client.

Conceptually:

```text
authenticated user
        ↓
verify membership
        ↓
relationship access
        ↓
read/write resource
```

A user must never be able to:
- read another relationship's memories
- read another person's locked letter
- upload media into another relationship
- modify another relationship's future items

Implement authorization at the server/database policy layer, not only in React.

---

# 27. LETTER SECURITY

This is especially important.

A locked letter's body should never be sent to the client before unlock.

Bad:

```text
GET /letters/123
{
  body: "secret message",
  unlock_at: "2027-05-12"
}
```

The user can inspect the network response.

Better:

```text
GET /letters/123
{
  title: "For you",
  locked: true,
  unlock_at: "2027-05-12"
}
```

Only after server-side unlock validation should the body be returned.

---

# 28. MEDIA STORAGE

Do not store raw image binaries directly inside normal database rows.

Use object storage.

Database stores:

```text
memory_media.storage_key
```

Storage contains actual media.

Use:
- signed URLs where appropriate
- server-side authorization
- image size validation
- MIME validation
- reasonable upload limits
- image compression/resizing

Generate responsive image sizes to keep the site fast.

---

# 29. RECOMMENDED STACK

Use a modern TypeScript stack.

Preferred:

### Frontend / full-stack

**Next.js + TypeScript**

### Styling

**Tailwind CSS**

Use Tailwind for layout but create custom design tokens rather than default-looking Tailwind UI.

### UI

Use:
- custom components
- Radix primitives only where useful
- Lucide icons

Do not import a giant UI kit and let it dictate the visual identity.

### Database/Auth

Recommended:

**Supabase**
- PostgreSQL
- Auth
- Storage
- Row Level Security

Alternative architecture is acceptable if there is a strong reason.

### PWA

Use a maintained Next.js PWA/service-worker solution compatible with the selected Next.js version.

Do not invent a custom service worker unless necessary.

### Validation

Zod.

### Forms

React Hook Form + Zod where forms become non-trivial.

---

# 30. PROJECT STRUCTURE

Suggested structure:

```text
ours/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── invite/
│   │
│   ├── app/
│   │   ├── page.tsx
│   │   ├── story/
│   │   ├── memories/
│   │   ├── future/
│   │   └── letters/
│   │
│   ├── api/
│   │   ├── memories/
│   │   ├── letters/
│   │   ├── future/
│   │   └── relationship/
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── home/
│   ├── story/
│   ├── memories/
│   ├── future/
│   ├── letters/
│   ├── navigation/
│   ├── pwa/
│   └── ui/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── storage/
│   ├── dates/
│   ├── milestones/
│   ├── permissions/
│   └── utils/
│
├── types/
├── public/
│   ├── icons/
│   └── manifest.webmanifest
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── tests/
│
├── .env.example
├── README.md
└── package.json
```

Adjust to the actual framework conventions if needed.

---

# 31. ROUTES

Suggested:

```text
/
```

Landing/login entry.

```text
/login
/register
/invite/[token]
```

Authentication/onboarding.

Authenticated:

```text
/app
/app/story
/app/memories
/app/future
/app/letters
```

Memory:

```text
/app/story/[memoryId]
```

Letter:

```text
/app/letters/[letterId]
```

Do not expose sensitive content through public URLs.

---

# 32. HOME PAGE DESIGN

Mobile:

```text
              OURS ♡

         Jyotirmayee + You

             2 YEARS
            4 MONTHS
             17 DAYS

           08:42:19

        Since 12 May 2024

       ┌──────────────────┐
       │   ON THIS DAY    │
       │                  │
       │      PHOTO       │
       │                  │
       │  One year ago    │
       └──────────────────┘

             ↓
```

Keep large empty areas.

Do not turn the homepage into a dashboard.

---

# 33. STORY PAGE DESIGN

Mobile:
- vertical timeline
- memory cards
- photos
- dates

Desktop:
- visual timeline
- large image cards
- horizontal scroll may be used
- elegant chapter separators for years

Year separators should feel editorial:

```text
2024

The beginning.
```

---

# 34. MEMORY WALL DESIGN

Mobile:
- two-column masonry where practical
- large touch targets
- tap opens full-screen viewer

Desktop:
- 3–5 column masonry depending on viewport
- controlled asymmetry
- occasional larger featured memory

Do not allow visual chaos.

---

# 35. FUTURE PAGE

Keep it extremely simple.

Top:

```text
OUR FUTURE ♡

Things we still want to do.
```

Then list.

Completion should trigger a subtle animation.

Do not use gamification.

---

# 36. LETTER PAGE

Inbox-like list:

```text
FOR YOU

💌 From Jyotirmayee
"Something for you"
🔒 Opens 12 May 2027

💌 From You
"Read this when..."
✓ Opened
```

Reading view should feel like opening physical stationery.

---

# 37. EMPTY STATES

Never use generic:

> No data found.

Use emotionally appropriate but restrained copy.

Example:

Story:

> Nothing here yet.
> Your story is waiting for its first page.

Memories:

> No memories yet.
> Save the next little moment.

Future:

> Nothing planned yet.
> What should we do someday?

Letters:

> No letters yet.
> Maybe write one for a future version of them.

Do not overdo romantic language.

---

# 38. ERROR STATES

Errors should remain clear and functional.

Example:

> Something went wrong while saving this memory.
> Your changes were not saved.

Buttons:
- Try again
- Cancel

Never hide technical failures behind fake romantic copy.

---

# 39. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- alt text for photos
- reduced-motion support
- screen-reader labels
- touch targets ≥44px
- no color-only meaning
- accessible modals/sheets
- accessible form errors

Do not sacrifice accessibility for aesthetic effects.

---

# 40. PERFORMANCE

Priorities:

1. Fast first load
2. Fast mobile navigation
3. Optimized images
4. Lazy loading
5. Minimal JavaScript where possible
6. Good Core Web Vitals

Use:
- responsive images
- modern formats such as WebP/AVIF when supported
- lazy loading
- route-level code splitting
- cached static assets
- optimized fonts

Do not load all memories/photos on the initial homepage.

---

# 41. SECURITY CHECKLIST

Implement:

- secure authentication
- server-side authorization
- database row-level security where supported
- protected storage
- signed media URLs where appropriate
- input validation
- MIME validation
- upload size limits
- rate limiting for sensitive endpoints
- secure cookies
- CSRF protection where applicable
- XSS-safe rendering
- no secret keys in client bundles
- no service-role database key in browser
- no letter body exposure before unlock

Never trust client-provided:
- user ID
- relationship ID
- creator ID
- ownership
- unlock state

Derive/verify these on the server.

---

# 42. PRIVACY

The application contains intimate personal data.

Therefore:

- private by default
- no indexing of authenticated pages
- no public memory URLs
- no public profiles
- no third-party analytics that unnecessarily collect private content
- don't send photo contents to AI services
- don't sell/share data
- provide account deletion
- provide relationship deletion with confirmation

---

# 43. ONBOARDING

Keep onboarding under a few screens.

### Screen 1

```text
OURS ♡

Your little corner of the internet.
```

### Screen 2

```text
What's your name?
```

### Screen 3

```text
When did your story begin?
```

### Screen 4

```text
Invite your person.

[ Generate Invite ]
```

After partner joins:

```text
You're officially connected. ♡
```

Then Home.

Do not ask for unnecessary profile information.

---

# 44. DATE/TIME HANDLING

This needs careful implementation.

Store timestamps in UTC where appropriate, while preserving the relationship's relevant timezone.

For the relationship start:
- save exact timestamp
- save timezone identifier if required
- render according to relationship/user context

For memory dates:
- date-only memories should not accidentally shift one day because of UTC conversion

Distinguish:
- `date`
- `timestamp`

A birthday/anniversary-like date should generally be represented as a calendar date rather than a UTC timestamp.

---

# 45. COUNTER LOGIC

Do not calculate:

```text
days = milliseconds / 86400000
months = days / 30
years = days / 365
```

for the main human-readable relationship counter.

Use calendar-aware calculations.

Example:

```text
start: 2024-05-12 18:30
now:   2026-09-29 11:15

→ calculate complete calendar years
→ calculate remaining complete months
→ calculate remaining calendar days
→ calculate remaining hours/minutes/seconds
```

Write unit tests for:
- leap years
- month-end dates
- daylight-saving changes where relevant
- timezone differences
- anniversary dates
- exact boundary times

---

# 46. TESTING

Minimum tests:

## Unit
- counter calculations
- milestone calculations
- random memory selection
- letter unlock logic
- permission helpers
- date handling

## Integration
- register
- login
- create relationship
- invite partner
- accept invite
- create memory
- upload media
- create future item
- create locked letter
- unlock letter
- authorization failures

## E2E
Test at least:
- Android Chrome viewport
- desktop Chrome
- mobile Safari if possible

---

# 47. PWA TESTING

Verify:

- manifest is valid
- icons load
- standalone mode works
- service worker registers
- app shell loads
- offline fallback works
- install prompt works where supported
- manual installation instructions work
- update strategy does not trap users on stale builds

---

# 48. VISUAL QUALITY BAR

Before calling the project complete, compare every page against these questions:

### Does it look like a SaaS dashboard?
If yes → redesign.

### Is everything pink?
If yes → reduce accent usage.

### Are there too many cards?
If yes → remove containers.

### Is there too much empty space on mobile?
If yes → improve composition, not add features.

### Is desktop just a stretched mobile layout?
If yes → redesign desktop composition.

### Does the scrapbook feel fake because of excessive effects?
If yes → reduce effects.

### Are photographs visually dominant?
They should be.

### Does it still feel beautiful with zero photos?
The typography/layout should still work.

---

# 49. DEVELOPMENT ORDER

Build in this order.

## Phase 1 — Foundation

- Next.js
- TypeScript
- styling
- design tokens
- typography
- layout
- PWA setup
- responsive navigation

## Phase 2 — Auth

- register
- login
- session
- logout
- onboarding
- relationship creation
- invitation

## Phase 3 — Home

- relationship counter
- anniversary
- milestone
- on-this-day

## Phase 4 — Story

- memory CRUD
- timeline
- categories
- photos

## Phase 5 — Memory Wall

- masonry
- image viewer
- random memory

## Phase 6 — Future

- create item
- complete item
- uncomplete item

## Phase 7 — Letters

- compose
- lock
- unlock
- reading experience

## Phase 8 — Security/performance

- RLS
- authorization audit
- upload security
- optimization
- caching
- accessibility

## Phase 9 — Polish

- animations
- responsive refinement
- desktop scrapbook layouts
- empty states
- error states
- PWA install UX

---

# 50. CLAUDE DEVELOPMENT RULES

When implementing:

1. Do not invent additional product features.
2. Do not redesign the product concept without permission.
3. Prefer simple architecture over clever architecture.
4. Keep business logic separate from UI.
5. Keep components reusable but do not over-engineer.
6. Validate all input.
7. Enforce permissions server-side.
8. Never trust client ownership fields.
9. Never expose locked letter content.
10. Optimize images.
11. Test date calculations.
12. Test mobile first.
13. Test desktop after mobile works.
14. Keep animations subtle.
15. Use semantic accessible HTML.
16. Do not use placeholder content in production screens.
17. Do not use fake loading states when real loading is fast.
18. Do not add dependencies without a reason.
19. Keep secrets out of the client.
20. Explain important architectural decisions in code comments/docs where useful.

---

# 51. CLAUDE EXECUTION PROMPT

Use the following as the main instruction when giving this specification to Claude Code:

---

You are the lead product engineer and UI/UX engineer responsible for building **OURS ♡**, a private two-person relationship memory PWA.

The attached/project specification is authoritative.

Build the application from the specification rather than creating a generic couples website.

Your priorities, in order:

1. Correct product behavior
2. Privacy/security
3. Mobile UX
4. Visual quality
5. Performance
6. Accessibility
7. Maintainable architecture

The application must be Android-first and installable as a PWA, while providing a substantially more visually immersive experience on laptops.

Do not add features outside the five defined product areas:
- Home/Relationship Counter
- Our Story
- Memory Wall
- Our Future
- Letters

Do not add chat, social features, gamification, relationship scoring, AI romantic features, ads, or unnecessary dashboards.

Before coding:

1. Inspect the existing repository.
2. Identify the framework and existing architecture.
3. If a project does not exist, scaffold the recommended stack.
4. Create a short implementation plan.
5. Create the database schema/migrations.
6. Define environment variables in `.env.example`.
7. Define the design tokens.
8. Define the core routes and components.

Then implement incrementally.

For every feature:
- build the server/data layer
- implement authorization
- implement UI
- implement responsive behavior
- implement loading/empty/error states
- test it
- then move to the next feature

Do not merely create mock screens.

The final result must be a working application with real authentication, real persistence, real media handling, real relationship membership authorization, and real PWA installation behavior.

Use realistic sample data only in development/demo seed data.

The visual direction must follow:

**warm ivory + muted rose + charcoal + elegant serif + clean sans + subtle paper texture + Polaroid photography + generous whitespace + restrained animation.**

The mobile experience should feel like a native Android application.

The desktop experience should feel like an interactive digital scrapbook.

Do not make the desktop version a stretched mobile UI.

When a design decision is ambiguous, choose the simpler solution that preserves the emotional character of the product.

Do not optimize for feature count.

Optimize for emotional clarity.

---

# 52. DEFINITION OF DONE

The project is not complete until:

- [ ] User can register
- [ ] User can log in/out
- [ ] User can create a relationship
- [ ] User can invite partner
- [ ] Partner can accept invite
- [ ] Both users can access only their relationship
- [ ] Relationship counter updates live
- [ ] Counter handles calendar dates correctly
- [ ] Milestones calculate correctly
- [ ] On This Day works
- [ ] Users can create/edit/delete memories
- [ ] Users can upload photos
- [ ] Photos are securely stored
- [ ] Story timeline works
- [ ] Memory Wall works
- [ ] Random Memory works
- [ ] Future items can be added/completed
- [ ] Letters can be created
- [ ] Locked letters stay server-side locked
- [ ] Letters unlock correctly
- [ ] PWA manifest works
- [ ] Service worker works
- [ ] Android installation works where supported
- [ ] Manual installation fallback exists
- [ ] App icon exists
- [ ] Mobile navigation works
- [ ] Desktop layout is visually distinct
- [ ] Dark mode works if included
- [ ] Accessibility basics pass
- [ ] Authorization is tested
- [ ] Upload validation is tested
- [ ] Counter logic is tested
- [ ] Production build succeeds
- [ ] No secrets are committed
- [ ] `.env.example` is complete
- [ ] README contains setup/deployment instructions

---

# 53. FINAL CREATIVE DIRECTION

The final product should feel like:

> **A private scrapbook that happens to be alive.**

Not:

> a relationship tracker.

The counter tells you **how long**.

The Story tells you **what happened**.

The Memory Wall lets you **see it**.

The Future tells you **what is still ahead**.

The Letters let you **leave something for the future**.

Everything else is noise.

Build those five things exceptionally well.
