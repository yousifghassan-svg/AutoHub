-- Priority 3: wizard resume cursor on Listing (server drafts)
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "draftStep" TEXT;
