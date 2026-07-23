# Sprint 13 — Technical Debt Report

## Must address before public beta

| ID | Item | Area |
| --- | --- | --- |
| TD-01 | Unify `ListingMedia` attach with `MediaAsset` validation/virus scan | Media / Security |
| TD-02 | Replace in-process media cleanup with Redis/Bull (or cron worker) | Media |
| TD-03 | Add `pg_trgm` (or FTS-only keyword path) for search ILIKE | Search |
| TD-04 | Real Firebase phone auth verifier for production builds | Auth / Mobile |
| TD-05 | Coverage thresholds + at least one real-Postgres integration suite | Testing |

## Should address in next quality sprint

| ID | Item | Area |
| --- | --- | --- |
| TD-06 | Lift `OfflineBanner` to app-level network provider | Mobile |
| TD-07 | `@MaxLength` on free-text / base64 DTO fields | API validation |
| TD-08 | Explicit `@Throttle` on listing create/update | API |
| TD-09 | `ts_rank` for MOST_RELEVANT sort | Search |
| TD-10 | Convert repository `this` method shorthand to closures | Mobile |
| TD-11 | Partial indexes `WHERE deletedAt IS NULL` | Database |
| TD-12 | App-level AuthGate to replace duplicated bootstrap screens | Mobile |

## Acceptable for Alpha

- Notifications tab placeholder
- Dealer platform deferred
- Mock auth mode default for Expo Go
- Phone/WhatsApp/share listing stats not in API responses yet
- No Elasticsearch / AI ranking

## Dead code removed this sprint

- `apps/mobile/components/ComingSoon.tsx`
