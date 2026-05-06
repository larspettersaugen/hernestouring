-- Supabase Security Advisor flags public._prisma_migrations when RLS is off.
-- The bulk migration skipped this table; enable RLS here so PostgREST roles cannot
-- read migration history. Prisma Migrate uses the database role that owns this table,
-- which bypasses RLS in PostgreSQL.

ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM authenticated;
  END IF;
END $$;
