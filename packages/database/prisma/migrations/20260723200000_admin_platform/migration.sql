-- AlterEnum UserRole
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'UserRole' AND e.enumlabel = 'DEALER_MANAGER'
  ) THEN
    ALTER TYPE "UserRole" ADD VALUE 'DEALER_MANAGER';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'UserRole' AND e.enumlabel = 'SUPPORT'
  ) THEN
    ALTER TYPE "UserRole" ADD VALUE 'SUPPORT';
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'FRAUD', 'INAPPROPRIATE', 'DUPLICATE', 'WRONG_CATEGORY', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable DealerOrganization
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "cityId" TEXT;
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "followersCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "viewsCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "DealerOrganization_verified_deletedAt_idx" ON "DealerOrganization"("verified", "deletedAt");
CREATE INDEX IF NOT EXISTS "DealerOrganization_cityId_idx" ON "DealerOrganization"("cityId");

DO $$ BEGIN
  ALTER TABLE "DealerOrganization" ADD CONSTRAINT "DealerOrganization_cityId_fkey"
    FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable ListingReport
CREATE TABLE IF NOT EXISTS "ListingReport" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "ListingReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ListingReport_status_createdAt_idx" ON "ListingReport"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ListingReport_listingId_status_idx" ON "ListingReport"("listingId", "status");
CREATE INDEX IF NOT EXISTS "ListingReport_reporterId_idx" ON "ListingReport"("reporterId");

DO $$ BEGIN
  ALTER TABLE "ListingReport" ADD CONSTRAINT "ListingReport_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ListingReport" ADD CONSTRAINT "ListingReport_reporterId_fkey"
    FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ListingReport" ADD CONSTRAINT "ListingReport_resolvedById_fkey"
    FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable AdminAuditLog
CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entityId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_module_createdAt_idx" ON "AdminAuditLog"("module", "createdAt");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_actorId_createdAt_idx" ON "AdminAuditLog"("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_entityId_idx" ON "AdminAuditLog"("entityId");

DO $$ BEGIN
  ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable SiteSettings
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'AutoHub',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "featuredLimit" INTEGER NOT NULL DEFAULT 12,
    "maxImages" INTEGER NOT NULL DEFAULT 20,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'IQD',
    "contactInfo" JSONB,
    "socialLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "siteName", "maintenanceMode", "featuredLimit", "maxImages", "defaultCurrency", "createdAt", "updatedAt")
VALUES ('default', 'AutoHub', false, 12, 20, 'IQD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
