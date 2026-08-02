-- P4-0 Path B rerun (no HeavyEquipment brandId — schema uses makeName)
-- Also probe whether ListingTranslation_fts_idx is usable

\pset pager off

\echo '=== B2 KEYWORD + BRAND (FTS + ILIKE) ==='
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT l.id
FROM "Listing" l
WHERE l.domain = 'VEHICLE'
  AND l.status = 'ACTIVE'
  AND l."deletedAt" IS NULL
  AND (
    EXISTS (
      SELECT 1 FROM "ListingTranslation" lt
      WHERE lt."listingId" = l.id
        AND (
          to_tsvector('simple', coalesce(lt.title, '') || ' ' || coalesce(lt.description, ''))
            @@ plainto_tsquery('simple', 'bmw')
          OR lt.title ILIKE '%bmw%'
          OR lt.description ILIKE '%bmw%'
        )
    )
    OR l.slug ILIKE '%bmw%'
    OR l."metaTitle" ILIKE '%bmw%'
  )
  AND (
    EXISTS (SELECT 1 FROM "CarDetails" cd WHERE cd."listingId" = l.id AND cd."brandId" = 'cmrxj7fif003xehjgo6otf1sd')
    OR EXISTS (SELECT 1 FROM "MotorcycleDetails" md WHERE md."listingId" = l.id AND md."brandId" = 'cmrxj7fif003xehjgo6otf1sd')
    OR EXISTS (SELECT 1 FROM "TruckDetails" td WHERE td."listingId" = l.id AND td."brandId" = 'cmrxj7fif003xehjgo6otf1sd')
  )
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 20;

\echo ''
\echo '=== B4 KEYWORD + BRAND + PRICE (FTS + ILIKE, IQD) ==='
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT l.id
FROM "Listing" l
JOIN "Currency" c ON c.id = l."primaryCurrencyId"
WHERE l.domain = 'VEHICLE'
  AND l.status = 'ACTIVE'
  AND l."deletedAt" IS NULL
  AND c.code = 'IQD'
  AND l."primaryPrice" >= 10000000
  AND l."primaryPrice" <= 80000000
  AND (
    EXISTS (
      SELECT 1 FROM "ListingTranslation" lt
      WHERE lt."listingId" = l.id
        AND (
          to_tsvector('simple', coalesce(lt.title, '') || ' ' || coalesce(lt.description, ''))
            @@ plainto_tsquery('simple', 'toyota')
          OR lt.title ILIKE '%toyota%'
          OR lt.description ILIKE '%toyota%'
        )
    )
    OR l.slug ILIKE '%toyota%'
    OR l."metaTitle" ILIKE '%toyota%'
  )
  AND EXISTS (
    SELECT 1 FROM "CarDetails" cd
    WHERE cd."listingId" = l.id
      AND cd."brandId" = 'cmrxj7fgi0036ehjgyqtw2n7t'
  )
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 20;

\echo ''
\echo '=== B1b FTS-ONLY (expression matches GIN index; no ILIKE OR) ==='
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT lt."listingId"
FROM "ListingTranslation" lt
JOIN "Listing" l ON l.id = lt."listingId"
WHERE l.domain = 'VEHICLE'
  AND l.status = 'ACTIVE'
  AND l."deletedAt" IS NULL
  AND to_tsvector('simple', coalesce(lt.title, '') || ' ' || coalesce(lt.description, ''))
      @@ plainto_tsquery('simple', 'tesla')
LIMIT 20;

\echo ''
\echo '=== Prisma-like per-field search (title.search / description.search shape) ==='
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT lt."listingId"
FROM "ListingTranslation" lt
JOIN "Listing" l ON l.id = lt."listingId"
WHERE l.domain = 'VEHICLE'
  AND l.status = 'ACTIVE'
  AND l."deletedAt" IS NULL
  AND (
    to_tsvector('simple', lt.title) @@ plainto_tsquery('simple', 'tesla')
    OR to_tsvector('simple', coalesce(lt.description, '')) @@ plainto_tsquery('simple', 'tesla')
  )
LIMIT 20;
