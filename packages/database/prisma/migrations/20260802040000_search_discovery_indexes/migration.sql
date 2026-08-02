-- Priority 4: Search & Discovery — Postgres FTS / filter indexes

-- Align FTS GIN with ts_rank / websearch_to_tsquery path (title + description)
DROP INDEX IF EXISTS "ListingTranslation_fts_idx";
CREATE INDEX "ListingTranslation_fts_idx"
ON "ListingTranslation"
USING GIN (
  to_tsvector(
    'simple',
    coalesce("title", '') || ' ' || coalesce("description", '')
  )
);

-- Common discovery filter/sort paths
CREATE INDEX IF NOT EXISTS "Listing_status_domain_publishedAt_idx"
ON "Listing" ("status", "domain", "publishedAt" DESC NULLS LAST)
WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "Listing_status_cityId_idx"
ON "Listing" ("status", "cityId")
WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "Listing_status_primaryPrice_currency_idx"
ON "Listing" ("status", "primaryCurrencyId", "primaryPrice")
WHERE "deletedAt" IS NULL;

-- Plate digit-length filter support
CREATE INDEX IF NOT EXISTS "PlateDetails_number_idx"
ON "PlateDetails" ("number")
WHERE "deletedAt" IS NULL;
