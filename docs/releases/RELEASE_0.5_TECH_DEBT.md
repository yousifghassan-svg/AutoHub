# Release 0.5 — Technical Debt Report

**Companion:** [`RELEASE_0.5_MARKETPLACE.md`](./RELEASE_0.5_MARKETPLACE.md) · [`RELEASE_0.5_PRODUCTION_REPORT.md`](./RELEASE_0.5_PRODUCTION_REPORT.md)  
**Rule:** Debt items are not automatic commit work; schedule under approved later trains. Do not reopen the 0.5 freeze for enhancements.

| ID | Debt | Severity | Why it matters | Suggested timing | Owner |
| --- | --- | --- | --- | --- | --- |
| TD-05-01 | Plugin-owned edit hydrate (remove host vehicle/plate imports) | Medium | Keeps sell host domain-agnostic for future verticals | Post-0.5 polish | Web |
| TD-05-02 | Edit draft freshness / revision vs server | Medium | Stale local edit draft can override newer server fields | Post-0.5 | Web |
| TD-05-03 | Fail-closed edit when `sellerId` missing | Low | Client UX; API already blocks writes | Hotfix if abused | Web |
| TD-05-04 | Cap base64 lengths on AddMedia / CompleteMedia | Medium | Upload abuse / memory | Media hardening | API |
| TD-05-05 | Unify plate vs vehicle title/description length rules | Low | API consistency | DTO polish | API |
| TD-05-06 | Forbid-status decorator on listing/vehicle update DTOs | Low | Defense-in-depth (whitelist already protects) | Anytime | API |
| TD-05-07 | Media sync skip reorder when unchanged | Low | Extra PATCH chatter | Perf polish | Web |
| TD-05-08 | Broad query invalidation on media mutations | Low | Refetch storms during multi-attach | Perf polish | Web |
| TD-05-09 | Dead `useListingMutations.create` → `/v1/listings` | Medium | Accidental legacy create path | Cleanup | Web |
| TD-05-10 | `validateMediaStep` noop | Low | Photos gated by quality only | Optional | Web |
| TD-05-11 | Dual vehicle step validators vs quality-rules | Medium | Drift risk | Consistency pass | Web |
| TD-05-12 | Mine listings keyword ILIKE | Medium | Scales poorly for large seller catalogs | Search/manage later | API |
| TD-05-13 | Sell / My Listings ARIA polish | Low | a11y bar | a11y pass | Web |
| TD-05-14 | Playwright marketplace e2e | Medium | Catch ownership/media/status regressions | CI | Platform |
| TD-05-15 | Legacy media without `mediaAssetId` not editable | Medium | Seller must re-upload old gallery rows | Document / migrate tool | Web + API |
| TD-05-16 | Pre-existing API lint (`users.service` no-dupe-else-if) | Low | Outside 0.5; blocks clean API lint | Auth/users cleanup | API |

### Closed by 0.5 (was 0.4 debt)

| Prior | Resolution |
| --- | --- |
| TD-08 Edit → sell-wizard reuse | Closed by P5-9 |
| Media trust pipeline | Closed by P5-4 |
| BUG-004 / BUG-006 / BUG-014 | Closed (see bug backlog) |

### Explicitly not 0.5 debt (later products)

Messaging (0.6), Payments (0.7), Trust (0.8), Dealers (0.9), Search boost (needs Search unfreeze).
