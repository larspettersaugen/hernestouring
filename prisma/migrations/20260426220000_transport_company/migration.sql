-- CreateTable
CREATE TABLE "TransportCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TransportCompany_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Transport" ADD COLUMN "transportCompanyId" TEXT;
ALTER TABLE "Transport" ADD COLUMN "bookingRef" TEXT;

-- CreateIndex
CREATE INDEX "Transport_transportCompanyId_idx" ON "Transport"("transportCompanyId");

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_transportCompanyId_fkey" FOREIGN KEY ("transportCompanyId") REFERENCES "TransportCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Supabase: enable RLS on the new public table and revoke Data API roles (matches existing pattern).
DO $$
DECLARE
  has_anon boolean;
  has_auth boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') INTO has_anon;
  SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') INTO has_auth;

  EXECUTE 'ALTER TABLE public."TransportCompany" ENABLE ROW LEVEL SECURITY;';
  IF has_anon THEN
    EXECUTE 'REVOKE ALL ON TABLE public."TransportCompany" FROM anon;';
  END IF;
  IF has_auth THEN
    EXECUTE 'REVOKE ALL ON TABLE public."TransportCompany" FROM authenticated;';
  END IF;
END $$;
