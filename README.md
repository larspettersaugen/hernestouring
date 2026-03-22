# Tour Me Like It's Hot

Web app for tour managers and booking agents to manage tour data (schedules, flights, transport, contacts). Crew and band use the same app on mobile (responsive + PWA). Power users (editors/admins) can edit from any device.

## Stack

- **Next.js 14** (App Router), TypeScript, Tailwind CSS
- **Prisma** + **PostgreSQL** (Neon recommended; see **Setup** below and `DEPLOY.md` for Vercel)
- **NextAuth** (credentials + optional Google OAuth, JWT, roles: viewer / editor / admin)
- **PWA** (production build): installable, optional offline via `@ducanh2912/next-pwa`
- **Theme:** Light / dark mode (`next-themes`), persisted in `localStorage`. Toggle: sun/moon in the dashboard sidebar (and mobile header), top bar when used, and on login / invite / join pages.

## Setup (from scratch)

Use **one** PostgreSQL database. **Neon** is the recommended default (free tier, no Docker).

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment file**

   ```bash
   cp .env.example .env
   ```

   Edit **`.env`**:

   - **`DATABASE_URL`** — In [Neon](https://neon.tech): create a project → copy the **connection string** (use the **pooled** / pooler host if offered). Paste it here.  
     If Prisma errors on connect, see comments in `.env.example` (`sslmode=require`, remove `channel_binding=require` if present).
   - **`NEXTAUTH_SECRET`** — Run `openssl rand -base64 32` and paste the output.
   - **`NEXTAUTH_URL`** — For local dev: `http://localhost:3000`

3. **Apply database schema**

   This creates/updates tables in the database pointed to by `DATABASE_URL`.

   **Fresh Neon database (empty):**

   ```bash
   npm run db:generate
   npm run db:migrate:deploy
   npm run db:seed
   ```

   These commands load **`.env` then `.env.local`** (same as Next.js), so your Neon URL can live in **`.env.local`** only. **Precedence:** if `DATABASE_URL` exists in **both** files, **`.env.local` wins**—a leftover example line there will override a correct `.env` and look like “still placeholder” errors.

   **Local development (creates migration files if you change `schema.prisma`):**

   ```bash
   npm run db:generate
   npx dotenv -o -e .env -e .env.local -- prisma migrate dev
   npm run db:seed
   ```

   `db seed` adds the three dev logins (admin / editor / viewer).  
   To import an old SQLite **`prisma/dev.db`** into Postgres (wipes that DB), see **`npm run db:import-sqlite`** in `DEPLOY.md`.

   **If `migrate deploy` errors** (e.g. “relation already exists”): your Neon DB may have been created with `db push` instead of migrations. Use **`npm run db:push`** once to align the schema, then talk to your team about [baselining migrations](https://www.prisma.io/docs/guides/migrate/developing-with-create-only) for the future.

   **Tasks page: “TourDateTask does not exist”:** the database is missing the latest migration. Run **`npm run db:migrate:deploy`** (or **`npm run db:push`**) after pulling new code, with `DATABASE_URL` set in `.env` or `.env.local`.

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Log in with:

   **Dev tips:** For more stable visuals while developing, avoid editing layout and root route files (`layout.tsx`, `page.tsx` in route roots) during rapid UI iteration—they trigger full reloads. Prefer editing leaf components for quicker HMR. Use `npm run dev:clean` if you need a full rebuild (e.g. after dependency updates).

   - **Admin:** admin@tour.local / admin123  
   - **Editor:** editor@tour.local / editor123  
   - **Viewer:** viewer@tour.local / viewer123

5. **“Internal Server Error” on localhost (plain black page)**

   - Check the **terminal** where `npm run dev` is running—the real error is logged there, not in the browser.
   - **`DATABASE_URL`:** Must be a real Postgres URL from Neon (or local Postgres). If the error mentions `ep-xxxx` or `USER:PASSWORD`, you still have the **`.env.example` placeholder**—replace it in `.env` or `.env.local` and restart dev.
   - **`NEXTAUTH_SECRET`:** Must be a real random string (`openssl rand -base64 32`). If you change it, old session cookies become invalid—**clear cookies** for localhost or use a private window.
   - **Stale build:** `npm run dev:kill` then `rm -rf .next` then `npm run dev` (see project stability rules).

6. **Google sign-in (optional)**

   Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env` to enable “Sign in with Google”:

   - Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
   - Create an OAuth 2.0 Client ID (Web application)
   - Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs
   - Copy Client ID and Client Secret into `.env`

## Features

- **Tours & dates:** Create tours, add show dates (venue, city, date).
- **Day schedule:** Time blocks (load-in, soundcheck, doors, show, load-out, etc.).
- **Flights:** Departure/arrival, airports, flight number, booking ref.
- **Transport:** Per-date transport (bus, car, pickup), time, driver, company.
- **Contacts:** Tour and per-date contacts (venue, promoter, driver, crew) with phone/email; tap to call/email on mobile.
- **Auth:** Email/password or Google OAuth. New Google users get viewer role by default.
- **Roles:** Viewer (read-only), Editor (create/edit), Admin (same as editor).
- **Beta signup (optional):** Set `BETA_JOIN_SECRET` in `.env` to a long random value (e.g. `openssl rand -hex 32`). Share `NEXTAUTH_URL/join/<that-secret>` with testers—they create a **viewer** account and a **Person** profile without an admin invite. Editors see a **Copy link** box on **People** when this is enabled. Rotate the secret to revoke the link; treat it like a password.
- **Mobile:** Responsive layout, bottom nav to jump to Schedule / Flights / Transport / Contacts, PWA install.
- **Print:** “Print day sheet” for the current date (schedule + flights + transport + contacts).

## Project structure

- `src/app/` – Next.js App Router (login, dashboard, tours, dates).
- `src/app/api/` – REST API (tours, dates, schedule, flights, transport, contacts, auth).
- `src/components/` – UI (DashboardNav, DatePicker, TourDayView, ScheduleSection, FlightsSection, TransportSection, ContactsSection, MobileDayNav, PrintDaySheetButton).
- `src/lib/` – Prisma client, NextAuth config, session helpers, API client.
- `prisma/` – Schema and seed.

## PWA

Set `ENABLE_PWA=true` when building to enable. PWA is off by default due to build conflicts. Add `public/icon-192.png` and `public/icon-512.png` (and optionally `public/favicon.ico`) for install icons. Install from the browser “Add to Home Screen” (or “Install app”) when visiting the deployed app.
