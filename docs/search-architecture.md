# Search Architecture (Sprint 5)

## Goals

- Fast multi-filter discovery over **ACTIVE** listings
- Autocomplete + trending + saved searches
- Avoid N+1; lean card projections
- No AI ranking/recommendations

## Priority 4 (vehicle web path)

**Tracking + performance baseline:** [`releases/PRIORITY_4_SEARCH_DISCOVERY.md`](./releases/PRIORITY_4_SEARCH_DISCOVERY.md)

Web product search is `GET /v1/vehicles/search` (`domain = VEHICLE`). Legacy `GET /v1/search` remains for trending / suggestions / saved-search.

### Vehicle keyword strategy (P4-1)

1. FTS via indexed expression `to_tsvector('simple', title || description)` → uses `ListingTranslation_fts_idx`
2. Separate ILIKE pass on title/description/slug/meta for partial tokens
3. Union listing IDs into `where.id.in` (avoids OR that defeats GIN)
4. Heavy equipment: keyword parity on translations; year/makeName/modelName when filters are HE-expressible (no `brandId` FK on HE)

### Relevance + analytics (P4-2)

- `sortBy=relevance` → `isFeatured DESC`, `isVerified DESC`, `viewsCount DESC`, `publishedAt DESC` (no `ts_rank`)
- Default `sortBy` becomes `relevance` when `keyword` is present and sort omitted
- Web: unspecified URL sort omits `sortBy`/`sortOrder`; explicit user sort always sent
- `SearchService.recordAnalytics` called from vehicle search (feeds trending)

**Freeze:** [`releases/RELEASE_0.4_SEARCH_DISCOVERY.md`](./releases/RELEASE_0.4_SEARCH_DISCOVERY.md) · tag `search-0.4-freeze`

## Components

```
presentation/   SearchController + DTOs
application/    SearchService
domain/         SearchSort, filter types
infrastructure/ DiscoveryRepository (Prisma)
```

## Query strategy

### Main search (`GET /search`)

1. Build a single Prisma `where` with `AND` of:
   - `status = ACTIVE`, `deletedAt = null`
   - scalar filters (category, city, price, featured, verified, condition)
   - governorate via `city.governorateId`
   - vehicle dims via `OR` of `carDetails` / `motorcycleDetails` / `truckDetails` relation filters
2. Keyword clause combines:
   - Postgres FTS via Prisma `field.search` (preview: `fullTextSearchPostgres`)
   - ILIKE contains on title/description/slug/meta
   - plate display/normalized match
3. **One** `count` + **one** `findMany` in a transaction.
4. `include` is a **lean card shape** (max 2 translations, 1 media, selected detail fields) — no per-row follow-up queries (N+1 avoided).
5. Persist a `SearchEvent` (+ upsert `PopularKeyword`) for trending/recent.

### Relevance sort

`MOST_RELEVANT` approximates rank with `isFeatured DESC`, `isVerified DESC`, `viewsCount DESC`, `publishedAt DESC` (stable without joining `ts_rank` in this sprint). GIN FTS still improves recall/filter selectivity.

### Suggestions

Parallel `Promise.all` lookups (brands, models, cities, plates, popular keywords) with `take` limits — indexed `nameEn` / plate columns.

### Trending

`SearchEvent.groupBy` on brand/model/category for a time window, then **batch** `findMany` by IDs (2-query pattern, not N+1).

### Saved searches

JSON filter snapshot on `SavedSearch`; soft delete via `deletedAt`.

## Indexes (performance)

| Index | Purpose |
| --- | --- |
| `ListingTranslation_fts_idx` (GIN `to_tsvector`) | Full-text keyword |
| `Listing_status_isFeatured_publishedAt_idx` | Catalog sort |
| `Listing_isVerified_status_idx` / `viewsCount` | Verified + most viewed |
| `CarDetails` year/mileage/fuel/transmission/body/drive | Spec filters |
| `SearchEvent` keyword/brand/model/category + createdAt | Trending aggregates |
| `PopularKeyword_hitCount` | Autocomplete keywords |
| Brand/Model/City `nameEn` | Suggestion prefix scans |

## Out of scope

- AI recommendations
- Elasticsearch/OpenSearch cluster
- Geo radius search
- Notification delivery for saved-search alerts (`notify` flag stored only)
