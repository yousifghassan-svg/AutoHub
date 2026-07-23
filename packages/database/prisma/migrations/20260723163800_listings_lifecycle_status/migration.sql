-- Remap ListingStatus for listings lifecycle
-- PENDING_REVIEW -> PENDING
-- EXPIRED / REMOVED / AUCTION_LIVE -> ARCHIVED

BEGIN;
CREATE TYPE "ListingStatus_new" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED');
ALTER TABLE "public"."Listing" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Listing" ALTER COLUMN "status" TYPE "ListingStatus_new" USING (
  CASE ("status"::text)
    WHEN 'PENDING_REVIEW' THEN 'PENDING'
    WHEN 'EXPIRED' THEN 'ARCHIVED'
    WHEN 'REMOVED' THEN 'ARCHIVED'
    WHEN 'AUCTION_LIVE' THEN 'ARCHIVED'
    ELSE "status"::text
  END
)::"ListingStatus_new";
ALTER TYPE "ListingStatus" RENAME TO "ListingStatus_old";
ALTER TYPE "ListingStatus_new" RENAME TO "ListingStatus";
DROP TYPE "public"."ListingStatus_old";
ALTER TABLE "Listing" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"ListingStatus";
COMMIT;

-- AlterTable
ALTER TABLE "ListingMedia" ADD COLUMN "byteSize" INTEGER,
ADD COLUMN "height" INTEGER,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "thumbnailKey" TEXT,
ADD COLUMN "width" INTEGER;

-- CreateIndex
CREATE INDEX "ListingMedia_listingId_deletedAt_idx" ON "ListingMedia"("listingId", "deletedAt");