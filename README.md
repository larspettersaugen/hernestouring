# Hernes Touring

Web app for tour managers and booking agents to manage tour data (schedules, flights, transport, contacts). Crew and band use the same app on mobile (responsive + PWA). Power users (editors/admins) can edit from any device.

## Stack

- **Next.js 14** (App Router), TypeScript, Tailwind CSS
- **Prisma** + **PostgreSQL** (local Docker or hosted; see `DEPLOY.md` for Vercel + Neon)
- **NextAuth** (credentials + optional Google OAuth, JWT, roles: viewer / editor / admin)
- **PWA** (production build): installable, optional offline via `@ducanh2912/next-pwa`

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` — PostgreSQL URL (see `.env.example`; for a public beta URL see **`DEPLOY.md`**)
   - `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`)
   - `NEXTAUTH_URL="http://localhost:3000"` (or your URL)

3. **Database**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Log in with:

   **Dev tips:** For more stable visuals while developing, avoid editing layout and root route files (`layout.tsx`, `page.tsx` in route roots) during rapid UI iteration—they trigger full reloads. Prefer editing leaf components for quicker HMR. Use `npm run dev:clean` if you need a full rebuild (e.g. after dependency updates).

   - **Admin:** admin@tour.local / admin123  
   - **Editor:** editor@tour.local / editor123  
   - **Viewer:** viewer@tour.local / viewer123

5. **Google sign-in (optional)**

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
