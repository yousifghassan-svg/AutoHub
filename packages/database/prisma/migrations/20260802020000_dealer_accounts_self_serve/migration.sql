-- Priority 2: self-serve dealer accounts — verification status, member roles, media, KYC docs

CREATE TYPE "DealerVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE "DealerMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');
CREATE TYPE "DealerDocumentReviewStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

ALTER TABLE "DealerOrganization"
  ADD COLUMN IF NOT EXISTS "verificationStatus" "DealerVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verifiedById" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "logoMediaId" TEXT,
  ADD COLUMN IF NOT EXISTS "coverMediaId" TEXT;

UPDATE "DealerOrganization"
SET "verificationStatus" = CASE WHEN "verified" = true THEN 'VERIFIED'::"DealerVerificationStatus" ELSE 'UNVERIFIED'::"DealerVerificationStatus" END,
    "verifiedAt" = CASE WHEN "verified" = true THEN COALESCE("verifiedAt", "updatedAt") ELSE "verifiedAt" END;

CREATE UNIQUE INDEX IF NOT EXISTS "DealerOrganization_logoMediaId_key" ON "DealerOrganization"("logoMediaId");
CREATE UNIQUE INDEX IF NOT EXISTS "DealerOrganization_coverMediaId_key" ON "DealerOrganization"("coverMediaId");
CREATE INDEX IF NOT EXISTS "DealerOrganization_verificationStatus_deletedAt_idx" ON "DealerOrganization"("verificationStatus", "deletedAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DealerOrganization_verifiedById_fkey') THEN
    ALTER TABLE "DealerOrganization"
      ADD CONSTRAINT "DealerOrganization_verifiedById_fkey"
      FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DealerOrganization_logoMediaId_fkey') THEN
    ALTER TABLE "DealerOrganization"
      ADD CONSTRAINT "DealerOrganization_logoMediaId_fkey"
      FOREIGN KEY ("logoMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DealerOrganization_coverMediaId_fkey') THEN
    ALTER TABLE "DealerOrganization"
      ADD CONSTRAINT "DealerOrganization_coverMediaId_fkey"
      FOREIGN KEY ("coverMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- DealerMember.role: String → enum
ALTER TABLE "DealerMember" ADD COLUMN IF NOT EXISTS "role_new" "DealerMemberRole";

UPDATE "DealerMember"
SET "role_new" = CASE
  WHEN UPPER("role") = 'OWNER' THEN 'OWNER'::"DealerMemberRole"
  WHEN UPPER("role") = 'MANAGER' THEN 'MANAGER'::"DealerMemberRole"
  ELSE 'STAFF'::"DealerMemberRole"
END;

ALTER TABLE "DealerMember" ALTER COLUMN "role_new" SET NOT NULL;
ALTER TABLE "DealerMember" ALTER COLUMN "role_new" SET DEFAULT 'STAFF'::"DealerMemberRole";
ALTER TABLE "DealerMember" DROP COLUMN "role";
ALTER TABLE "DealerMember" RENAME COLUMN "role_new" TO "role";

CREATE INDEX IF NOT EXISTS "DealerMember_userId_deletedAt_idx" ON "DealerMember"("userId", "deletedAt");
CREATE INDEX IF NOT EXISTS "DealerMember_organizationId_deletedAt_idx" ON "DealerMember"("organizationId", "deletedAt");

CREATE TABLE IF NOT EXISTS "DealerVerificationDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "DealerDocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    CONSTRAINT "DealerVerificationDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DealerVerificationDocument_organizationId_status_idx"
  ON "DealerVerificationDocument"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "DealerVerificationDocument_mediaAssetId_idx"
  ON "DealerVerificationDocument"("mediaAssetId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DealerVerificationDocument_organizationId_fkey') THEN
    ALTER TABLE "DealerVerificationDocument"
      ADD CONSTRAINT "DealerVerificationDocument_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "DealerOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DealerVerificationDocument_mediaAssetId_fkey') THEN
    ALTER TABLE "DealerVerificationDocument"
      ADD CONSTRAINT "DealerVerificationDocument_mediaAssetId_fkey"
      FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DealerVerificationDocument_reviewedById_fkey') THEN
    ALTER TABLE "DealerVerificationDocument"
      ADD CONSTRAINT "DealerVerificationDocument_reviewedById_fkey"
      FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
