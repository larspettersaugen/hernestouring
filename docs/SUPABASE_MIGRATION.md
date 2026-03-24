# Migrating toward Supabase

This app today: **Next.js** + **Prisma** + **NextAuth** + **Postgres** (Neon) + **Resend**. There is **no Supabase** dependency yet.

“Use Supabase” can mean three very different levels of work:

| Tier | What changes | Effort | Risk |
|------|----------------|--------|------|
| **A – Supabase Postgres only** | Host DB on Supabase instead of Neon. **Keep Prisma + NextAuth + all API routes.** | **Low** (mostly ops + data copy + env) | Low |
| **B – + Supabase client** | Add `@supabase/supabase-js` for some features (e.g. Storage, Realtime) while Prisma stays for main data. | Medium | Medium |
| **C – Full Supabase stack** | Replace NextAuth with **Supabase Auth**, replace Prisma queries with **Supabase client** (and often **RLS**). | **Very high** (70+ files use Prisma today) | High (user passwords, sessions, invites, every API) |

**Recommendation:** Do **Tier A first**. You get a Supabase project, dashboard, backups, and optional future features—without rewriting the app. Tier C is a **multi-week** project and should be planned as its own initiative.

---

## Tier A – Supabase as Postgres host (keep Prisma + NextAuth)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Choose region, set a strong DB password, wait until the project is **Healthy**.

### 2. Get connection strings (same pattern as Neon)

In Supabase: **Project Settings → Database → Connection string**.

You need **two** URLs for Prisma (like `DATABASE_URL` + `DIRECT_URL` today):

- **Pooled / transaction mode** (for serverless / Vercel runtime):  
  Often **Session pooler** or **Transaction** URI, port **6543**, includes `?pgbouncer=true` (or use the UI’s “Transaction” / “Pooler” tab—wording changes over time).
- **Direct** (for `prisma migrate deploy` and migrations):  
  **Direct connection**, port **5432**, no pooler.

Copy exactly what Supabase shows for **Prisma** if they offer a Prisma-specific snippet.

Set in `.env.local` / Vercel:

- `DATABASE_URL` = **pooled** connection string (append `sslmode=require` if not present).
- `DIRECT_URL` = **direct** connection string (migrations).

Prisma `schema.prisma` already has `directUrl = env("DIRECT_URL")` — **no schema change required** for Tier A.

### 3. Move data from Neon → Supabase (choose one)

**Option 1 – Dump / restore (typical)**  
From Neon (or local with Neon URL):

```bash
# Example: logical dump (run with your real Neon URL; use pg_dump installed locally)
pg_dump "$NEON_DIRECT_URL" --no-owner --format=custom -f backup.dump
```

Restore into Supabase (use Supabase **direct** connection string):

```bash
pg_restore --dbname="$SUPABASE_DIRECT_URL" --no-owner --clean --if-exists backup.dump
```

Adjust flags if you hit extension/permission errors; Supabase enables common extensions in dashboard.

**Option 2 – Empty Supabase + Prisma migrate**  
If you **don’t** need old data:

1. Point `DATABASE_URL` / `DIRECT_URL` at Supabase.
2. Run `npx prisma migrate deploy` (applies all migrations in `prisma/migrations/` to the new DB).
3. Run seed if needed: `npm run db:seed`.

### 4. Point the app at Supabase

1. Update **Vercel** env: `DATABASE_URL`, `DIRECT_URL` (and keep `NEXTAUTH_*`, `RESEND_*`, etc.).
2. Redeploy.
3. Local: `.env` / `.env.local` same URLs; `npm run dev` and smoke-test login and one tour flow.

### 5. Optional cleanup

- Remove or archive Neon project once you’re confident.
- Update internal docs / `DEPLOY.md` to say “Postgres on Supabase” instead of Neon where relevant.

**What stays the same:** All `src/app/api/**` routes, Prisma models, NextAuth, Resend, `proxy.ts` auth gate—**no code rewrites** for Tier A.

---

## Tier B – Add Supabase client (optional, later)

1. `npm install @supabase/supabase-js` and (for Next.js App Router) `@supabase/ssr` per [Supabase Next.js docs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs).
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and server-only `SUPABASE_SERVICE_ROLE_KEY` only in server code—never expose to client).
3. Use Supabase for **new** features (e.g. file storage, realtime) while Prisma remains the source of truth for tours/people/etc.—or gradually introduce RLS-backed tables for new domains only.

---

## Tier C – Supabase Auth + replace Prisma (major rewrite)

Rough outline only:

1. **Auth:** Migrate from NextAuth to Supabase Auth (email/password, Google OAuth). Map `User.role` and `Person.userId` to a strategy (e.g. `user_metadata`, `app_metadata`, or a `profiles` table keyed by `auth.users.id`).
2. **Passwords:** Existing bcrypt hashes in `User.password` do **not** match Supabase Auth’s storage; you need a **one-time migration** (invite users to reset password, or custom import—Supabase documents limitations).
3. **Data access:** Replace `prisma.*` across **70+** call sites with Supabase client or raw SQL; define **RLS policies** so the DB enforces access, not only API code.
4. **Remove or narrow Prisma:** Often Prisma is removed or kept only for migrations during transition.

Do not start Tier C until Tier A is stable and you have a test Supabase project.

---

## Checklist (Tier A)

- [ ] Supabase project created  
- [ ] `DATABASE_URL` (pooler) + `DIRECT_URL` (direct) copied and tested with `npx prisma db pull` or `migrate deploy`  
- [ ] Data migrated (dump/restore) **or** fresh `migrate deploy` + seed  
- [ ] Vercel env vars updated + redeploy  
- [ ] Smoke test: login, dashboard, one API mutation  
- [ ] Decommission Neon when happy  

---

## References

- [Supabase + Prisma](https://supabase.com/docs/guides/database/prisma)  
- [Supabase connection pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)  
- [Next.js on Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)  

If you want **Agent mode** to apply **Tier A** file edits (e.g. `DEPLOY.md` / `.env.example` wording only), say so; **data migration and Supabase dashboard steps** you still perform in the browser.
