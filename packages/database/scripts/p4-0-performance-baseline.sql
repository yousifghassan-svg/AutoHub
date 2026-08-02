-- P4-0 Performance Baseline
-- Environment: local Docker autohub-postgres @ 2026-08-02
-- Dataset: ACTIVE VEHICLE listings only
-- Keyword: 'tesla' (present in EN/AR titles)
-- Brand: BMW (cmrxj7fif003xehjgo6otf1sd)
-- City: Baghdad (cmrxj7fcs001behjg0jlul5b5)
-- Price: primaryPrice BETWEEN 10000000 AND 80000000 AND IQD currency

\timing off
\pset pager off

-- Warm caches lightly
SELECT COUNT(*) FROM "Listing" WHERE domain = 'VEHICLE' AND status = 'ACTIVE';

\echo '=== DATASET SNAPSHOT ==='
SELECT
  (SELECT COUNT(*) FROM "Listing" WHERE domain = 'VEHICLE' AND status = 'ACTIVE' AND "deletedAt" IS NULL) AS vehicle_active,
  (SELECT COUNT(*) FROM "ListingTranslation" lt JOIN "Listing" l ON l.id = lt."listingId" WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND l."deletedAt" IS NULL) AS translations,
  (SELECT COUNT(*) FROM "Listing" WHERE domain = 'VEHICLE' AND status = 'ACTIVE' AND "deletedAt" IS NULL AND "cityId" = 'cmrxj7fcs001behjg0jlul5b5') AS baghdad_vehicles,
  (SELECT COUNT(*) FROM "CarDetails" cd JOIN "Listing" l ON l.id = cd."listingId" WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND cd."brandId" = 'cmrxj7fif003xehjgo6otf1sd') AS bmw_vehicles;

\echo ''
\echo '################################################################'
\echo '# PATH A — CURRENT WEB BASELINE (ILIKE only, vehicle-scoped)  #'
\echo '################################################################'

\echo ''
\echo '=== A1 KEYWORD ONLY (ILIKE) ==='
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT l.id
FROM "Listing" l
WHERE l.domain = 'VEHICLE'
  AND l.status = 'ACTIVE'
  AND l."deletedAt" IS NULL
  AND (
    l.slug ILIKE '%tesla%'
    OR l."metaTitle" ILIKE '%tesla%'
    OR EXISTS (
      SELECT 1 FROM "ListingTranslation" lt
      WHERE lt."listingId" = l.id
        AND (lt.title ILIKE '%tesla%' OR lt.description ILIKE '%tesla%')
    )
  )
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 20;

\echo ''
\echo '=== A2 KEYWORD + BRAND (ILIKE) ==='
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT l.id
FROM "Listing" l
WHERE l.domain = 'VEHICLE'
  AND l.status = 'ACTIVE'
  AND l."deletedAt" IS NULL
  AND (
    l.slug ILIKE '%bmw%'
    OR l."metaTitle" ILIKE '%bmw%'
    OR EXISTS (
      SELECT 1 FROM "ListingTranslation" lt
      WHERE lt."listingId" = l.id
        AND (lt.title ILIKE '%bmw%' OR lt.description ILIKE '%bmw%')
    )
  )
  AND (
    EXISTS (SELECT 1 FROM "CarDetails" cd WHERE cd."listingId" = l.id AND cd."brandId" = 'cmrxj7fif003xehjgo6otf1sd')
    OR EXISTS (SELECT 1 FROM "MotorcycleDetails" md WHERE md."listingId" = l.id AND md."brandId" = 'cmrxj7fif003xehjgo6otf1sd')
    OR EXISTS (SELECT 1 FROM "TruckDetails" td WHERE td."listingId" = l.id AND td."brandId" = 'cmrxj7fif003xehjgo6otf1sd')
  )
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 20;

\echo ''
\echo '=== A3 KEYWORD + CITY (ILIKE) ==='
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT l.id
FROM "Listing" l
WHERE l.domain = 'VEHICLE'
  AND l.status = 'ACTIVE'
  AND l."deletedAt" IS NULL
  AND l."cityId" = 'cmrxj7fcs001behjg0jlul5b5'
  AND (
    l.slug ILIKE '%nissan%'
    OR l."metaTitle" ILIKE '%nissan%'
    OR EXISTS (
      SELECT 1 FROM "ListingTranslation" lt
      WHERE lt."listingId" = l.id
        AND (lt.title ILIKE '%nissan%' OR lt.description ILIKE '%nissan%')
    )
  )
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 20;

\echo ''
\echo '=== A4 KEYWORD + BRAND + PRICE (ILIKE, IQD) ==='
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
    l.slug ILIKE '%toyota%'
    OR l."metaTitle" ILIKE '%toyota%'
    OR EXISTS (
      SELECT 1 FROM "ListingTranslation" lt
      WHERE lt."listingId" = l.id
        AND (lt.title ILIKE '%toyota%' OR lt.description ILIKE '%toyota%')
    )
  )
  AND (
    EXISTS (
      SELECT 1 FROM "CarDetails" cd
      JOIN "VehicleBrand" vb ON vb.id = cd."brandId"
      WHERE cd."listingId" = l.id AND vb."nameEn" ILIKE 'Toyota'
    )
    OR EXISTS (
      SELECT 1 FROM "MotorcycleDetails" md
      JOIN "VehicleBrand" vb ON vb.id = md."brandId"
      WHERE md."listingId" = l.id AND vb."nameEn" ILIKE 'Toyota'
    )
    OR EXISTS (
      SELECT 1 FROM "TruckDetails" td
      JOIN "VehicleBrand" vb ON vb.id = td."brandId"
      WHERE td."listingId" = l.id AND vb."nameEn" ILIKE 'Toyota'
    )
  )
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 20;

-- Resolve Toyota brand id for cleaner A4b and B4
\echo ''
\echo '=== Toyota brand id ==='
SELECT id, "nameEn" FROM "VehicleBrand" WHERE "nameEn" ILIKE 'Toyota' LIMIT 1;

\echo ''
\echo '################################################################'
\echo '# PATH B — TARGET P4-1 SHAPE (FTS + ILIKE fallback)            #'
\echo '################################################################'

\echo ''
\echo '=== B1 KEYWORD ONLY (FTS + ILIKE) ==='
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
            @@ plainto_tsquery('simple', 'tesla')
          OR lt.title ILIKE '%tesla%'
          OR lt.description ILIKE '%tesla%'
        )
    )
    OR l.slug ILIKE '%tesla%'
    OR l."metaTitle" ILIKE '%tesla%'
  )
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 20;

\echo ''
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
\echo '=== B3 KEYWORD + CITY (FTS + ILIKE) ==='
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT l.id
FROM "Listing" l
WHERE l.domain = 'VEHICLE'
  AND l.status = 'ACTIVE'
  AND l."deletedAt" IS NULL
  AND l."cityId" = 'cmrxj7fcs001behjg0jlul5b5'
  AND (
    EXISTS (
      SELECT 1 FROM "ListingTranslation" lt
      WHERE lt."listingId" = l.id
        AND (
          to_tsvector('simple', coalesce(lt.title, '') || ' ' || coalesce(lt.description, ''))
            @@ plainto_tsquery('simple', 'nissan')
          OR lt.title ILIKE '%nissan%'
          OR lt.description ILIKE '%nissan%'
        )
    )
    OR l.slug ILIKE '%nissan%'
    OR l."metaTitle" ILIKE '%nissan%'
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
  AND (
    EXISTS (
      SELECT 1 FROM "CarDetails" cd
      WHERE cd."listingId" = l.id
        AND cd."brandId" = (SELECT id FROM "VehicleBrand" WHERE "nameEn" = 'Toyota' LIMIT 1)
    )
    OR EXISTS (
      SELECT 1 FROM "MotorcycleDetails" md
      WHERE md."listingId" = l.id
        AND md."brandId" = (SELECT id FROM "VehicleBrand" WHERE "nameEn" = 'Toyota' LIMIT 1)
    )
    OR EXISTS (
      SELECT 1 FROM "TruckDetails" td
      WHERE td."listingId" = l.id
        AND td."brandId" = (SELECT id FROM "VehicleBrand" WHERE "nameEn" = 'Toyota' LIMIT 1)
    )
  )
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 20;

\echo ''
\echo '=== RESULT COUNTS (for rows-returned column) ==='
SELECT 'A1/B1 tesla' AS q, COUNT(*) AS rows_matched FROM "Listing" l
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND l."deletedAt" IS NULL
  AND (l.slug ILIKE '%tesla%' OR l."metaTitle" ILIKE '%tesla%'
    OR EXISTS (SELECT 1 FROM "ListingTranslation" lt WHERE lt."listingId" = l.id AND (lt.title ILIKE '%tesla%' OR lt.description ILIKE '%tesla%')));

SELECT 'A2/B2 bmw+brand' AS q, COUNT(*) AS rows_matched FROM "Listing" l
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND l."deletedAt" IS NULL
  AND (l.slug ILIKE '%bmw%' OR l."metaTitle" ILIKE '%bmw%'
    OR EXISTS (SELECT 1 FROM "ListingTranslation" lt WHERE lt."listingId" = l.id AND (lt.title ILIKE '%bmw%' OR lt.description ILIKE '%bmw%')))
  AND (EXISTS (SELECT 1 FROM "CarDetails" cd WHERE cd."listingId" = l.id AND cd."brandId" = 'cmrxj7fif003xehjgo6otf1sd')
    OR EXISTS (SELECT 1 FROM "MotorcycleDetails" md WHERE md."listingId" = l.id AND md."brandId" = 'cmrxj7fif003xehjgo6otf1sd')
    OR EXISTS (SELECT 1 FROM "TruckDetails" td WHERE td."listingId" = l.id AND td."brandId" = 'cmrxj7fif003xehjgo6otf1sd'));

SELECT 'A3/B3 nissan+baghdad' AS q, COUNT(*) AS rows_matched FROM "Listing" l
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND l."deletedAt" IS NULL
  AND l."cityId" = 'cmrxj7fcs001behjg0jlul5b5'
  AND (l.slug ILIKE '%nissan%' OR l."metaTitle" ILIKE '%nissan%'
    OR EXISTS (SELECT 1 FROM "ListingTranslation" lt WHERE lt."listingId" = l.id AND (lt.title ILIKE '%nissan%' OR lt.description ILIKE '%nissan%')));

SELECT 'A4/B4 toyota+brand+price' AS q, COUNT(*) AS rows_matched FROM "Listing" l
JOIN "Currency" c ON c.id = l."primaryCurrencyId"
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND l."deletedAt" IS NULL
  AND c.code = 'IQD' AND l."primaryPrice" >= 10000000 AND l."primaryPrice" <= 80000000
  AND (l.slug ILIKE '%toyota%' OR l."metaTitle" ILIKE '%toyota%'
    OR EXISTS (SELECT 1 FROM "ListingTranslation" lt WHERE lt."listingId" = l.id AND (lt.title ILIKE '%toyota%' OR lt.description ILIKE '%toyota%')))
  AND EXISTS (
    SELECT 1 FROM "CarDetails" cd
    WHERE cd."listingId" = l.id
      AND cd."brandId" = (SELECT id FROM "VehicleBrand" WHERE "nameEn" = 'Toyota' LIMIT 1)
  );
