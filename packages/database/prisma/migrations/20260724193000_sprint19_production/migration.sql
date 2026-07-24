-- AlterEnum
DO $$ BEGIN
  ALTER TYPE "ListingStatus" ADD VALUE 'REJECTED';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable Listing
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "features" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable DealerOrganization
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "DealerOrganization" ADD COLUMN IF NOT EXISTS "openingHours" TEXT;
