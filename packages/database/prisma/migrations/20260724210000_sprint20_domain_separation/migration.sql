-- Sprint 20: Marketplace domain separation (Vehicles vs Plates)
-- Preserves all Listing rows; adds domain discriminator + plate catalog tables.

-- Enums
DO $$ BEGIN
  CREATE TYPE "MarketplaceDomain" AS ENUM ('VEHICLE', 'PLATE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PlateVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Listing.domain
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "domain" "MarketplaceDomain" NOT NULL DEFAULT 'VEHICLE';

UPDATE "Listing"
SET "domain" = CASE
  WHEN "categoryCode" = 'PLATE' THEN 'PLATE'::"MarketplaceDomain"
  ELSE 'VEHICLE'::"MarketplaceDomain"
END;

CREATE INDEX IF NOT EXISTS "Listing_domain_status_publishedAt_idx"
  ON "Listing"("domain", "status", "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "Listing_domain_status_cityId_idx"
  ON "Listing"("domain", "status", "cityId");

-- Plate catalog
CREATE TABLE IF NOT EXISTS "PlateCategory" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "PlateCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PlateCategory_code_key" ON "PlateCategory"("code");
CREATE INDEX IF NOT EXISTS "PlateCategory_active_sortOrder_idx" ON "PlateCategory"("active", "sortOrder");

CREATE TABLE IF NOT EXISTS "PlatePrefix" (
  "id" TEXT NOT NULL,
  "formatCode" TEXT NOT NULL,
  "letter" TEXT NOT NULL,
  "label" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "PlatePrefix_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PlatePrefix_formatCode_letter_key" ON "PlatePrefix"("formatCode", "letter");
CREATE INDEX IF NOT EXISTS "PlatePrefix_formatCode_active_idx" ON "PlatePrefix"("formatCode", "active");

CREATE TABLE IF NOT EXISTS "PlateVerification" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "status" "PlateVerificationStatus" NOT NULL,
  "note" TEXT,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlateVerification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PlateVerification_listingId_createdAt_idx" ON "PlateVerification"("listingId", "createdAt");
CREATE INDEX IF NOT EXISTS "PlateVerification_status_idx" ON "PlateVerification"("status");

-- PlateDetails extensions
ALTER TABLE "PlateDetails" ADD COLUMN IF NOT EXISTS "plateCategoryId" TEXT;
ALTER TABLE "PlateDetails" ADD COLUMN IF NOT EXISTS "platePrefixId" TEXT;
ALTER TABLE "PlateDetails" ADD COLUMN IF NOT EXISTS "verificationStatus" "PlateVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "PlateDetails" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "PlateDetails" ADD COLUMN IF NOT EXISTS "verifiedById" TEXT;

CREATE INDEX IF NOT EXISTS "PlateDetails_verificationStatus_idx" ON "PlateDetails"("verificationStatus");
CREATE INDEX IF NOT EXISTS "PlateDetails_plateCategoryId_idx" ON "PlateDetails"("plateCategoryId");
CREATE INDEX IF NOT EXISTS "PlateDetails_platePrefixId_idx" ON "PlateDetails"("platePrefixId");

DO $$ BEGIN
  ALTER TABLE "PlateDetails"
    ADD CONSTRAINT "PlateDetails_plateCategoryId_fkey"
    FOREIGN KEY ("plateCategoryId") REFERENCES "PlateCategory"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "PlateDetails"
    ADD CONSTRAINT "PlateDetails_platePrefixId_fkey"
    FOREIGN KEY ("platePrefixId") REFERENCES "PlatePrefix"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Seed default plate categories (idempotent)
INSERT INTO "PlateCategory" ("id", "code", "nameEn", "nameAr", "sortOrder", "active", "updatedAt")
VALUES
  ('pcat_private', 'PRIVATE', 'Private', 'خصوصي', 1, true, CURRENT_TIMESTAMP),
  ('pcat_taxi', 'TAXI', 'Taxi', 'أجرة', 2, true, CURRENT_TIMESTAMP),
  ('pcat_government', 'GOVERNMENT', 'Government', 'حكومي', 3, true, CURRENT_TIMESTAMP),
  ('pcat_commercial', 'COMMERCIAL', 'Commercial', 'تجاري', 4, true, CURRENT_TIMESTAMP),
  ('pcat_diplomatic', 'DIPLOMATIC', 'Diplomatic', 'دبلوماسي', 5, true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- Backfill plate category from plateType text
UPDATE "PlateDetails" pd
SET "plateCategoryId" = pc."id"
FROM "PlateCategory" pc
WHERE pd."plateCategoryId" IS NULL
  AND UPPER(COALESCE(pd."plateType", 'PRIVATE')) = pc."code";

-- Domain read models (documentation / reporting; not Prisma-managed)
CREATE OR REPLACE VIEW "vehicle_market_v" AS
SELECT l.*
FROM "Listing" l
WHERE l."domain" = 'VEHICLE' AND l."deletedAt" IS NULL;

CREATE OR REPLACE VIEW "plate_market_v" AS
SELECT l.*
FROM "Listing" l
WHERE l."domain" = 'PLATE' AND l."deletedAt" IS NULL;
