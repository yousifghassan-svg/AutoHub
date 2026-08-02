-- Arabic token probe under 'simple' config
SELECT lt.language, lt.title,
  to_tsvector('simple', coalesce(lt.title, '') || ' ' || coalesce(lt.description, '')) AS tsv
FROM "ListingTranslation" lt
JOIN "Listing" l ON l.id = lt."listingId"
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE' AND lt.language = 'ar'
LIMIT 5;

-- Does plainto_tsquery match Latin brand names stored in AR titles?
SELECT COUNT(*) AS ar_tesla_fts
FROM "ListingTranslation" lt
JOIN "Listing" l ON l.id = lt."listingId"
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE'
  AND lt.language = 'ar'
  AND to_tsvector('simple', coalesce(lt.title, '') || ' ' || coalesce(lt.description, ''))
      @@ plainto_tsquery('simple', 'tesla');

SELECT COUNT(*) AS ar_tesla_ilike
FROM "ListingTranslation" lt
JOIN "Listing" l ON l.id = lt."listingId"
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE'
  AND lt.language = 'ar'
  AND lt.title ILIKE '%tesla%';

-- Any Arabic-script titles?
SELECT COUNT(*) AS ar_script_titles
FROM "ListingTranslation" lt
JOIN "Listing" l ON l.id = lt."listingId"
WHERE l.domain = 'VEHICLE' AND l.status = 'ACTIVE'
  AND lt.language = 'ar'
  AND lt.title ~ '[ء-ي]';
