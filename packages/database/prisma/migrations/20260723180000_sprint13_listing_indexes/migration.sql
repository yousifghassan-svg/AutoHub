-- Sprint 13: browse sort index + drop redundant unique-backed indexes
CREATE INDEX IF NOT EXISTS "Listing_status_publishedAt_idx" ON "Listing"("status", "publishedAt" DESC);

DROP INDEX IF EXISTS "Listing_slug_idx";
DROP INDEX IF EXISTS "User_firebaseUid_idx";
DROP INDEX IF EXISTS "User_phone_idx";
