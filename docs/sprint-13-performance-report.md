# Sprint 13 — Performance Report

## Listings / browse

| Area | Before | After | Notes |
| --- | --- | --- | --- |
| `GET /v1/listings` include | Full detail relations (all media/translations) | Cap media `take: 3`, translations `take: 2` | Detail still uses full `findById` include |
| Browse sort index | `status + isFeatured + publishedAt` (middle column unused on default path) | Added `@@index([status, publishedAt(sort: Desc)])` | Matches NEWEST / ACTIVE browse |
| Redundant indexes | `Listing.slug` + unique; `User.firebaseUid/phone` + unique | Dropped redundant btree indexes | Less write amplification |

## Search

| Area | Finding | Action |
| --- | --- | --- |
| FTS | GIN on `ListingTranslation` present | Verified; keep |
| Keyword ILIKE | Leading-wildcard `contains` cannot use btree | **Debt:** add `pg_trgm` or FTS-first fallback (see tech debt) |
| Analytics | `recordEvent` awaited on every search | Now fire-and-forget |
| Trending/recent params | `Number(NaN)` → Prisma 500 | Validated DTOs |

## Mobile

| Area | Change |
| --- | --- |
| Lists | `ListingCard` memoized; gallery `windowSize={3}` |
| Video | Inactive pages unmount player / pause |
| Offline polling | Still per-screen `OfflineBanner` intervals — lift in follow-up |
| Home rails | Nested horizontal lists remain; acceptable for Alpha |

## Slow-query watchlist (Alpha)

1. Search keyword with ILIKE OR FTS on large tables — monitor with `EXPLAIN ANALYZE`
2. `mine=true` without status — covered by `(sellerId, status)`
3. Price range + status — only standalone `primaryPrice` index; watch under load

## Benchmarks (manual / Alpha)

- Target p95 `GET /v1/search` < 300ms on seed data
- Target p95 `GET /v1/listings?mine=true` < 250ms
- Capture baselines after migration apply; re-run before public beta
