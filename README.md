<div align="center">

# OURS ♡
### A Private Digital Sanctuary for Two

[![Live App](https://img.shields.io/badge/Live_App-ours--story.vercel.app-E11D48?style=for-the-badge&logo=vercel&logoColor=white)](https://ours-story.vercel.app)
<br /><br />
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-FF6F61?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

<br />

<img src="./public/images/ours-hero.jpg" alt="OURS Relationship App Hero Banner" width="100%" style="border-radius: 16px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15);" />

<br />
<br />

**OURS** is a private, two-person progressive web app (PWA) designed to preserve your shared journey.  
No public feeds. No algorithms. No likes. No follower counts. Just you, your partner, and your memories.

### 🌐 [**Visit Live App: https://ours-story.vercel.app**](https://ours-story.vercel.app)

[Why OURS?](#-why-ours-was-made) •
[Features](#-the-five-core-spaces) •
[Architecture](#-architecture--security) •
[Getting Started](#-getting-started) •
[Deploy for Free](#-deploy-free-forever)

</div>

---

## 💭 Why OURS Was Made

Modern social media platforms are optimized for engagement, metrics, and public consumption. Relationship milestones get reduced to temporary stories or performative posts curated for an audience of acquaintances.

**OURS was built on an opposite philosophy:**

1. **Intimate by Design**: The application only ever supports **two users** per relationship. There are no search engines, no public profiles, and no external feeds.
2. **Permanent & Intentional**: Unlike ephemeral messaging apps where photos and sentimental notes disappear into endless scroll history, OURS organizes your memories into an heirloom-quality digital scrapbook.
3. **Hardened Privacy**: Your memories belong only to you and your partner. Security is enforced at the database layer through PostgreSQL Row Level Security (RLS). Not even an API request can leak memories across relationship boundaries.
4. **Calm Aesthetics**: Crafted with warm editorial typography (*Playfair Display*, *Plus Jakarta Sans*, and *Caveat*), subtle tactile Polaroid tilts, warm terracotta and champagne tones, and full dark/light mode support.

---

## ✨ The Five Core Spaces

<div align="center">
  <img src="./public/images/ours-features.jpg" alt="OURS Feature Flat-lay Showcase" width="100%" style="border-radius: 16px; margin-bottom: 2rem;" />
</div>

### 1. ⏳ Home & Live Relationship Counter
- **Live Ticker**: Accurate, calendar-aware counter displaying how long you've been together in years, months, days, hours, minutes, and seconds (correctly accounting for leap years).
- **Milestone Countdown**: Automatically calculates your next milestone (100 days, 6 months, 1 year, 1,000 days, etc.) and provides a live countdown.
- **On This Day Throwbacks**: Whenever you open the app on an anniversary date, an *On This Day* card surfaces memories made on that exact calendar day in years past.

### 2. 📖 Our Story (Chronological Timeline)
- **Year-by-Year Storyline**: Browse your shared life in an organized timeline grouped by year.
- **Categorized Memories**: Tag memories as **Moments**, **Dates**, **Trips**, or **Milestones**.
- **Contextual Details**: Add dates, locations, emotional stories, and attached photo collections to every entry.

### 3. 🖼️ The Memory Wall (Polaroids & Lightbox)
- **Masonry Polaroid Gallery**: Photos rendered in vintage Polaroid frames with organic tilts and handwritten captions.
- **Full-Screen Lightbox**: High-resolution image zoom, slideshow navigation, and story inspection.
- **"✨ Take Me Somewhere"**: Tap a single button to pull up a random serendipitous memory from any time in your relationship.

### 4. 🧭 Our Future (Shared Bucket List)
- **Dream Together**: Maintain a collaborative bucket list of trips to take, skills to learn, meals to cook, and dreams to achieve.
- **Celebration of Completion**: Check off goals together; completed dreams track the date accomplished and celebrate shared growth.

### 5. 💌 Time-Locked Love Letters
- **Sealed With Wax**: Write heartfelt letters to your partner that are cryptographically locked until a chosen future anniversary, birthday, or milestone.
- **True Database-Level Secrecy**: The Postgres database explicitly revokes access to unopened letter contents before the unlock timestamp arrives. No inspection of browser network requests can spoil the surprise.

---

## 🛡️ Architecture & Security

```
┌────────────────────────────────────────────────────────┐
│                   OURS PWA Client                      │
│      React 19 • Tailwind 4 • Canvas WebP Compression   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / JWT
┌───────────────────────────▼────────────────────────────┐
│                    Supabase Backend                    │
│                                                        │
│  ┌────────────────────┐      ┌──────────────────────┐  │
│  │  Postgres 15 + RLS │      │   Encrypted Storage  │  │
│  │  (Zero-leak rows)  │      │  (Private WebP Media)│  │
│  └────────────────────┘      └──────────────────────┘  │
│               │                         │              │
│               ▼                         ▼              │
│  [Only Partner A & Partner B hold authorized keys]     │
└────────────────────────────────────────────────────────┘
```

- **Client-Side Optimization**: Uploaded photos are compressed client-side to clean WebP format before upload, saving bandwidth and keeping your free Supabase storage quota tiny.
- **Postgres Row Level Security (RLS)**: Enforced via `auth.uid() = ANY(ARRAY[partner_1_id, partner_2_id])`. Direct table queries from outside your relationship return 0 rows.
- **Time-Lock Function Security**: Unlocked letters are decrypted and served strictly through a server-side PostgreSQL function `read_letter(letter_id)` which rejects queries if `now() < unlock_date`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- A free [Supabase](https://supabase.com) account

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ours.git
cd ours
npm install
```

### 2. Configure Supabase
1. Create a new free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Run the migration files located in `supabase/migrations/` in ascending order:
   - `0001_couple.sql`
   - `0002_relationships.sql`
   - `0003_memories.sql`
   - `0004_photos.sql`
   - `0005_future_items.sql`
   - `0006_letters.sql`
4. Under **Authentication** -> **Providers** -> **Email**:
   - Turn **OFF** "Confirm email" (makes setup seamless for two people).
5. Under **Storage**:
   - Verify that the private bucket `memory-media` was created by migration `0004`.

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 Coupling Your Accounts

1. **Partner 1**: Register your account, set your anniversary / relationship start date, and click **"Generate Invite Link"**.
2. **Partner 2**: Open the invite link in their browser (or on their phone), create their account, and tap **"Accept Invite"**.
3. **Lock Registration** (Optional for 100% Peace of Mind): Once both of you have joined, go to Supabase Dashboard -> **Authentication** -> **Settings** and disable **"Allow new users to sign up"**. No one else can ever register on your instance.

---

## 🌐 Deploy Free Forever

You can host OURS **100% free forever** on Vercel, Netlify, or Cloudflare Pages.

### Option A: Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically detect Vite and configure the `vercel.json` SPA rewrite rules.

### Option B: Deploy to Netlify
1. Connect your repository at [netlify.com](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. In **Site Settings** -> **Environment variables**, add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Deploy! Netlify automatically honors the `public/_redirects` SPA rule included in the repo.

---

## 📲 Install on Your Phone (PWA)

OURS is fully PWA-enabled with service worker caching and home-screen icons:

- **iOS (iPhone)**: Open your deployed URL in **Safari**, tap the **Share** button (box with upward arrow), and select **"Add to Home Screen"**.
- **Android**: Open your deployed URL in **Chrome**, tap the three-dot menu, and select **"Install app"** or **"Add to Home screen"**.

It will launch full-screen with no browser address bars, just like a native iOS/Android app.

---

## 🧪 Testing & Verification

The codebase includes comprehensive test suites running against an embedded PostgreSQL engine (`pglite`):

```bash
# Run unit & database RLS security tests
npm test

# Run linter
npm run lint

# Check type errors & build production bundle
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built with love for couples who want their memories to remain theirs alone.
