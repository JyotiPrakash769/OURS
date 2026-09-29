# OURS ♡ — Claude Code Execution Rules
## Anti-Hallucination, Anti-Overengineering & Token-Efficiency Guide

> This file is a **development control document**, not a product specification.
> Read this together with `OURS_Complete_Claude_Project_Spec.md`.
>
> The product specification defines **what to build**.
> This document defines **how Claude should work while building it**.

---

# 1. PRIMARY RULE

**Do not improvise. Do not hallucinate. Do not over-engineer. Do not rebuild working code unnecessarily.**

When information is missing:

1. Inspect the repository.
2. Inspect existing files/configuration.
3. Search the official documentation if required.
4. Make the smallest reasonable decision.
5. State the assumption briefly.
6. Continue only if the assumption is low-risk.

Do NOT invent:
- APIs
- package names
- database columns
- framework behavior
- environment variables
- library capabilities
- authentication behavior
- deployment configuration

If something is genuinely unknown and materially affects implementation, ask one focused question rather than generating a large speculative solution.

---

# 2. SOURCE OF TRUTH HIERARCHY

When information conflicts, use this order:

```text
1. Existing repository code/configuration
2. Explicit user instructions
3. OURS_Complete_Claude_Project_Spec.md
4. Official documentation for the selected technology
5. Your own engineering judgment
```

Never override an explicit product requirement with a personal preference.

---

# 3. DO NOT REINVENT THE STACK

If the repository already has a working stack:

**Use it.**

Do not migrate:
- Next.js → another framework
- React → another frontend
- TypeScript → JavaScript
- Supabase → another database
- Tailwind → another CSS framework

unless explicitly requested.

If the repository is empty, use the stack specified in the main specification.

---

# 4. NO FEATURE CREEP

The product has exactly five feature areas:

```text
1. Home / Relationship Counter
2. Our Story
3. Memory Wall
4. Our Future
5. Letters
```

If you think:

> "It would be cool if we also added..."

Do not implement it.

Put it in:

```text
docs/future-ideas.md
```

only if it is genuinely useful.

Do not spend implementation tokens on it.

---

# 5. DO NOT BUILD MOCK FEATURES

Do not create fake implementations such as:

```ts
const memories = [...]
```

when the feature is supposed to use the database.

Do not simulate:
- authentication
- persistence
- image uploads
- letter unlocking
- relationship membership

The application should use the real architecture.

However, development seed data is allowed for testing.

Clearly separate:

```text
seed/demo data
```

from:

```text
production behavior
```

---

# 6. WORK IN SMALL PHASES

Never attempt to generate the entire application in one response.

Use this sequence:

```text
Phase 0 — Inspect
Phase 1 — Foundation
Phase 2 — Auth
Phase 3 — Relationship
Phase 4 — Home
Phase 5 — Story
Phase 6 — Memory Wall
Phase 7 — Future
Phase 8 — Letters
Phase 9 — PWA
Phase 10 — Security
Phase 11 — Testing
Phase 12 — Visual polish
```

After each phase:

1. Run the relevant checks.
2. Fix only relevant failures.
3. Summarize what changed.
4. Continue.

Do not dump the entire repository into the conversation.

---

# 7. TOKEN BUDGET RULE

Be aggressively economical with context.

Do NOT repeatedly output:
- entire files
- entire package.json
- entire database schema
- entire directory trees
- unchanged components
- long explanations
- large code blocks
- repeated specifications

When modifying an existing file:

> Read only the relevant section → make the smallest edit → verify.

Do not rewrite an entire file if only 10 lines need changing.

---

# 8. CONTEXT MANAGEMENT

Before making a change:

### First inspect

```text
What file?
What function/component?
What existing behavior?
What dependency?
What data shape?
```

Then modify only what is necessary.

If the relevant file is large, inspect the relevant region rather than dumping the whole file.

If previous context already contains the exact information, do not repeat it.

---

# 9. RESPONSE FORMAT

After completing a small task, respond with:

```text
DONE

Changed:
- item
- item
- item

Verified:
- test/build/check

Next:
- next small step
```

Maximum useful detail: approximately 5–10 bullets.

Do not provide essays after every implementation step.

---

# 10. NEVER CLAIM SUCCESS WITHOUT VERIFICATION

Do not say:

> "The PWA works."

unless you actually verified the relevant configuration/build behavior.

Do not say:

> "Authentication is secure."

unless authorization policies and relevant paths have been inspected/tested.

Do not say:

> "The app is production ready."

unless the relevant checks have actually been performed.

Use precise language:

```text
Implemented.
Build passes.
Authorization test passes.
PWA manifest is present.
```

If something was not verified:

```text
Not verified yet: Android installation on a physical device.
```

---

# 11. BUILD AFTER MEANINGFUL CHANGES

After meaningful implementation changes, run the appropriate checks.

At minimum:

```bash
npm run lint
npm run build
```

If tests exist:

```bash
npm test
```

Do not run expensive commands repeatedly when nothing changed.

---

# 12. DEBUGGING RULE

When an error occurs:

Do NOT immediately rewrite the architecture.

Use:

```text
1. Read the exact error.
2. Identify the first relevant source location.
3. Inspect surrounding code.
4. Determine root cause.
5. Make the smallest fix.
6. Re-run the failing check.
```

Do not fix symptoms by adding unnecessary dependencies.

---

# 13. DEPENDENCY RULE

Before adding a package, ask:

> Can this be implemented safely using the existing stack in a small amount of code?

If yes:

**Do not add the dependency.**

If a package is necessary:

1. Check whether it already exists.
2. Use the official package.
3. Use the current compatible version.
4. Avoid packages that duplicate existing functionality.

Do not install five libraries for one small UI interaction.

---

# 14. DOCUMENTATION RULE

When library behavior is uncertain:

Use official documentation.

Preferred sources:

```text
Next.js official documentation
React official documentation
Supabase official documentation
MDN
Tailwind CSS official documentation
PWA/web.dev documentation
```

Do not hallucinate APIs based on memory.

If a library API differs from your expectation, adapt to the actual API.

---

# 15. DATABASE RULE

Do not silently change the schema.

Before changing database structure:

1. Inspect existing migrations.
2. Determine whether the change is actually required.
3. Create a migration.
4. Update types.
5. Update affected queries.
6. Test authorization.

Never edit an old migration that may already have been applied.

Create a new migration instead.

---

# 16. AUTHORIZATION RULE

Authentication ≠ authorization.

Always verify:

```text
Who is logged in?
        ↓
Does this user belong to this relationship?
        ↓
Is this resource inside that relationship?
        ↓
Is this action permitted?
```

Never trust:

```text
relationship_id
user_id
creator_id
recipient_id
```

provided by the client.

Derive or verify ownership server-side.

---

# 17. LETTER SECURITY RULE

Locked letters are sensitive.

Never send the body of a locked letter to the client.

The server must decide whether:

```text
now >= unlock_at
```

Only then return the body.

Do not rely on:

```tsx
if (Date.now() >= unlockAt) ...
```

as the security mechanism.

Client-side checks are for presentation only.

---

# 18. IMAGE UPLOAD RULE

Validate uploads on the server.

Check:

- MIME type
- file extension
- file size
- image dimensions where appropriate
- authenticated relationship membership

Do not trust a filename.

Do not expose private storage publicly unless the product specification explicitly requires it.

---

# 19. DATE/TIME RULE

Do not invent date arithmetic.

For the relationship counter:

Use a reliable date library or well-tested calendar-aware logic.

Never use:

```text
days / 30 = months
days / 365 = years
```

for the human-readable counter.

Write tests for:

- leap years
- month ends
- anniversary boundaries
- exact time boundaries
- timezone behavior

---

# 20. UI RULE

Do not use a generic component library as the visual design.

The UI must follow the OURS design system:

```text
Warm ivory
Muted rose
Charcoal
Elegant serif
Clean sans
Subtle paper texture
Polaroid photography
Generous whitespace
Quiet animation
```

If a prebuilt component looks like a SaaS dashboard:

**customize it or replace it.**

---

# 21. NO VISUAL OVERDESIGN

Avoid:

- excessive gradients
- excessive blur
- glassmorphism
- floating hearts everywhere
- animated emojis
- giant shadows
- excessive rounded pills
- neon colors
- constant confetti
- aggressive parallax

The visual rule is:

> **quiet, not boring.**

---

# 22. MOBILE-FIRST RULE

Always test the mobile layout first.

Primary widths:

```text
360px
390px
412px
430px
```

Controls must work without hover.

Do not depend on:
- hover
- right-click
- large desktop menus
- tiny clickable text

Use:
- bottom navigation
- bottom sheets
- full-screen image viewing
- large touch targets

---

# 23. DESKTOP RULE

Do not simply stretch the mobile layout.

Desktop should become:

> **an interactive scrapbook**

Use the additional space for:

- large photography
- asymmetric layouts
- visual timeline
- typography
- whitespace

Do not use additional desktop space to add unnecessary widgets.

---

# 24. PWA RULE

The application must be a real PWA.

Verify:

- manifest
- icons
- service worker
- HTTPS requirement for production
- standalone display
- theme colors
- app shell
- installability where supported

Do not claim:

> "Installable everywhere."

Browser support varies.

Implement capability detection and provide a manual fallback.

---

# 25. OFFLINE RULE

Do not promise that the entire private application works offline.

At minimum, cache:

- application shell
- static assets
- appropriate public/static resources

For authenticated dynamic data:

Do not invent complex offline synchronization unless explicitly requested.

Prefer:

> "The app shell loads offline; dynamic private data requires connectivity."

This is safer than building a fragile sync system.

---

# 26. PERFORMANCE RULE

Do not optimize prematurely.

First:

```text
Correct
→ Secure
→ Responsive
→ Fast
→ Polished
```

Use obvious optimizations:

- image optimization
- lazy loading
- responsive image sizes
- code splitting
- caching

Do not create complicated caching infrastructure without evidence it is necessary.

---

# 27. ERROR HANDLING RULE

Errors must be honest.

Good:

> Couldn't save the memory. Check your connection and try again.

Bad:

> Something magical went wrong with your love story. 💔

Romantic copy is fine for empty states.

Technical errors should remain understandable.

---

# 28. EMPTY STATE RULE

Empty states can be emotional but short.

Examples:

```text
Your story is waiting for its first page.
```

```text
Save the next little moment.
```

```text
What should you do someday?
```

Avoid long motivational paragraphs.

---

# 29. NO FAKE DATA IN PRODUCTION

Development can use:

```text
Demo relationship
Demo memories
Demo future items
Demo letters
```

But production must never silently fall back to demo data.

Use clear seed scripts.

---

# 30. NO PLACEHOLDER UI LEFT BEHIND

Before finalizing:

Search for:

```text
TODO
FIXME
Lorem ipsum
placeholder
example.com
test@example.com
fake
mock
dummy
```

Remove anything that should not ship.

---

# 31. NO HARDCODED USER DATA

Do not hardcode:

```text
Jyotirmayee
You
12 May 2024
```

into production components.

These should come from relationship/user data.

Demo seed data can contain examples.

---

# 32. COMPONENT RULE

Create components around real reusable concepts.

Good:

```text
RelationshipCounter
MemoryCard
MemoryTimeline
PhotoGallery
LetterCard
FutureItem
BottomNavigation
```

Avoid creating a component for every `<div>`.

Do not over-abstract early.

---

# 33. SERVER/CLIENT BOUNDARY

Keep sensitive logic on the server.

Server:
- authorization
- database access
- signed upload URLs
- letter unlock verification
- relationship membership
- secrets

Client:
- presentation
- local UI state
- animations
- optimistic UI only where safe
- non-sensitive interaction

Never put service-role keys in browser code.

---

# 34. STATE MANAGEMENT

Do not add Redux/Zustand/etc. automatically.

Start with:

- React state
- server state
- URL state
- existing framework mechanisms

Add global state only if a real problem appears.

---

# 35. API RULE

Do not create dozens of endpoints unnecessarily.

Prefer clear resource-oriented operations.

Example:

```text
GET    memories
POST   memories
PATCH  memory
DELETE memory

GET    future
POST   future
PATCH  future

GET    letters
POST   letters
GET    letter
```

Use server-side authorization in every protected operation.

---

# 36. COMMIT-SIZED WORK

If using Git, prefer small logical commits:

```text
feat: add relationship onboarding
feat: add live relationship counter
feat: add memory timeline
feat: add photo uploads
feat: add memory wall
feat: add future list
feat: add letters
feat: add PWA support
fix: enforce relationship authorization
```

Do not make one enormous "build everything" commit.

---

# 37. IF SOMETHING FAILS

Use this response pattern:

```text
Problem:
<one sentence>

Cause:
<one sentence>

Fix:
<one sentence>

Verification:
<command/result>

Next:
<one small step>
```

Do not write a long postmortem unless asked.

---

# 38. IF YOU NEED TO ASK A QUESTION

Ask only when:

- the missing information materially affects architecture/data/security
- the repository cannot answer it
- official documentation cannot answer it
- a safe default would risk data loss or rework

Ask **one focused question**.

Bad:

> "What color, database, auth provider, deployment target, storage provider, and animation style do you want?"

The specification already answers most of these.

Good:

> "The existing repository uses Firebase rather than the specified Supabase stack. Do you want me to preserve Firebase or migrate?"

---

# 39. DO NOT LOOP

If a fix fails twice:

Stop repeating the same strategy.

Inspect:
- actual error
- dependency version
- framework version
- generated output
- relevant documentation

Then change strategy based on evidence.

---

# 40. DO NOT CHURN TOKENS

Avoid producing large explanations when a short status is enough.

Instead of:

```text
Here is a 1,500-word explanation of why the button component was changed...
```

write:

```text
Updated the button to use the shared design tokens and 44px minimum touch target.
```

Code should be written to files, not repeatedly printed into chat.

---

# 41. DO NOT REPEAT THE SPECIFICATION

The main specification is already available.

Do not restate it before every phase.

Use it as a reference.

When implementing:

```text
Read relevant section
→ implement
→ verify
```

Not:

```text
repeat entire specification
→ implement
```

---

# 42. DO NOT SUMMARIZE EVERY FILE

At the end of a phase, report:

```text
Changed:
- app/app/page.tsx
- components/home/RelationshipCounter.tsx
- lib/dates/counter.ts

Verified:
- npm run lint
- npm run build
```

Do not paste the contents of all three files.

---

# 43. KEEP A SHORT PROJECT MEMORY

Maintain:

```text
docs/implementation-status.md
```

with only:

```text
# Current status

Completed:
- Foundation
- Authentication
- Relationship onboarding

In progress:
- Story timeline

Next:
- Memory Wall

Known issues:
- Physical Android install not yet tested
```

Keep this file short.

This prevents context churn in long sessions.

---

# 44. DEFINITION OF EACH SESSION

Every coding session should have a narrow objective.

Example:

```text
SESSION GOAL:
Implement authenticated relationship onboarding.

Success:
- User can create relationship.
- Invite token can be generated.
- Partner can accept invite.
- Membership is enforced.

Do not implement:
- Memories
- Letters
- PWA
- Future list
```

Finish the narrow goal before moving on.

---

# 45. STOP CONDITION

Stop a task when:

- the requested feature works
- relevant tests pass
- lint/build pass where appropriate
- no obvious security issue remains
- the implementation matches the specification

Do not keep "improving" a finished feature indefinitely.

---

# 46. FINAL AUDIT

Before saying the project is finished, perform a focused audit:

## Product
- [ ] Only five core features exist
- [ ] No accidental feature creep

## Security
- [ ] Relationship authorization
- [ ] Locked letter protection
- [ ] Secure uploads
- [ ] No client secrets

## UX
- [ ] Android-first
- [ ] Touch targets
- [ ] Bottom navigation
- [ ] Desktop scrapbook layout

## PWA
- [ ] Manifest
- [ ] Icons
- [ ] Service worker
- [ ] Standalone mode
- [ ] Install guidance

## Performance
- [ ] Optimized images
- [ ] Lazy loading
- [ ] Reasonable initial bundle

## Quality
- [ ] Build
- [ ] Lint
- [ ] Tests
- [ ] No debug code
- [ ] No placeholder content

---

# 47. MASTER INSTRUCTION TO CLAUDE

Use this exact operating principle:

> **Build less, verify more.**
>
> Do not hallucinate missing APIs or requirements.
> Do not invent features.
> Do not rewrite working code unnecessarily.
> Do not repeat the specification.
> Do not dump large amounts of code into the conversation when files can be edited directly.
> Do not claim something works without verification.
> Inspect first, modify second, test third.
>
> When uncertain, use repository evidence or official documentation.
> When ambiguity is low-risk, choose the smallest reasonable implementation.
> When ambiguity is high-risk, ask one focused question.
>
> Keep every implementation step small enough to understand, test, and undo.
>
> The goal is not to maximize code generated per response.
> The goal is to produce a secure, maintainable, beautiful application with the minimum necessary code.

---

# 48. FINAL RULE

**Never confuse more code with more progress.**

For OURS ♡, the best implementation is the one that:

- has fewer moving parts
- has fewer dependencies
- has fewer features
- has clear authorization
- has reliable date calculations
- loads quickly
- feels beautiful
- is easy to maintain
- and actually works.
