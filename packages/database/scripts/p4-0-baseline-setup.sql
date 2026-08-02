-- P4-0: dataset stats + sample filter IDs for performance baseline
\pset tuples_only off
\pset format aligned

SELECT COUNT(*) AS vehicle_active
FROM "Listing"
WHERE domain = 'VEHICLE' AND status = 'ACTIVE' AND "deletedAt" IS NULL;

SELECT COUNT(*) AS vehicle_translations
FROM "ListingTranslation" lt
JOIN "Listing" l ON l.id = lt."listingId"
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND l."deletedAt" IS NULL;

SELECT id AS brand_id, "nameEn" AS brand_name
FROM "VehicleBrand"
WHERE active = true
ORDER BY "nameEn"
LIMIT 8;

SELECT id AS city_id, "nameEn" AS city_name
FROM "City"
WHERE active = true
ORDER BY "nameEn"
LIMIT 8;

SELECT l."categoryCode", COUNT(*) AS n
FROM "Listing" l
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND l."deletedAt" IS NULL
GROUP BY l."categoryCode"
ORDER BY n DESC;

SELECT LEFT(lt.title, 80) AS sample_title, lt.language
FROM "ListingTranslation" lt
JOIN "Listing" l ON l.id = lt."listingId"
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND l."deletedAt" IS NULL
ORDER BY l."publishedAt" DESC NULLS LAST
LIMIT 12;
