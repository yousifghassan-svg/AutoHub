# Release 0.4 — Search & Discovery (Priority 4)

**Version:** Search freeze on `0.4.x` train  
**Codename:** Search & Discovery  
**Status:** **FROZEN** (2026-08-03)  
**Git tag:** `search-0.4-freeze`  
**Baseline (auth freeze):** `9173fa7` / `auth-0.2-freeze`  
**Freeze HEAD:** see tag `search-0.4-freeze`  
**Tracking:** [`PRIORITY_4_SEARCH_DISCOVERY.md`](./PRIORITY_4_SEARCH_DISCOVERY.md)  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

> **Freeze rule:** Do not refactor Search & Discovery (vehicle web path) unless a production bug is discovered.  
> Deferred items live only in this document’s backlog section — do not reopen Priority 4 for enhancements.

---

## Goals

- Postgres FTS on the product vehicle search path (`GET /v1/vehicles/search`).  
- Keyword relevance heuristic (no `ts_rank` unless quality fails).  
- Search analytics feeding trending from the vehicle path.  
- Web URL as single source of truth for `/vehicles/search`.  
- Search UX polish (loading / empty / error / chips / load more / a11y).  

---

## Slice status

| Slice | Status |
| --- | --- |
| P4-0 Performance baseline | **Done** |
| P4-1 Postgres FTS + quality gate | **Done** (gate PASS; no `ts_rank`) |
| P4-2 Relevance + analytics | **Done** |
| P4-3 DTO / API alignment | **Done** |
| P4-4 URL SSOT | **Done** (BUG-005) |
| P4-5 Search UX | **Done** |
| Freeze blocker — keyword sort omit | **Done** (`1cfe763`) |

---

## Features

| Area | Deliverable |
| --- | --- |
| Keyword | GIN-aligned FTS + separate ILIKE union on ACTIVE VEHICLE |
| HE parity | Keyword + year / makeName / modelName (no HE `brandId` FK) |
| Relevance | Featured → verified → views → publishedAt when `sortBy=relevance` or keyword + omitted sort |
| Analytics | `SearchEvent` / `PopularKeyword` via vehicle search |
| DTO | `relevance` sort; `brandId`↔`makeId`; validated sort enums |
| Web URL | Parse/serialize + `useVehicleSearchUrlState`; Back/Forward/share |
| Web sort | Unspecified sort omitted from API; explicit sort always sent |
| UX | Skeletons, chips, clear all, mobile filters, load more, a11y |

---

## Acceptance Criteria

- [x] Keyword EN/AR + partial ILIKE quality gate PASS  
- [x] HE keyword/year parity PASS  
- [x] Keyword + unspecified sort → API omits `sortBy` / `sortOrder` (relevance default)  
- [x] Explicit sort always sent (`createdAt`, `relevance`, etc.)  
- [x] URL SSOT for filters; Back/Forward/refresh/share  
- [x] Analytics recorded from vehicle search  
- [x] Public search returns ACTIVE only  
- [x] No auth/API/FTS contract changes in freeze-blocker fix  
- [ ] Facet counts (deferred)  
- [ ] Saved-search UI (deferred)  
- [ ] Plate search rewrite (out of scope)  

---

## Freeze audit (2026-08-03)

| Check | Result |
| --- | --- |
| Search correctness | **PASS** |
| Search relevance (web → API) | **PASS** (blocker fixed in `1cfe763`) |
| FTS behavior | **PASS** |
| URL synchronization | **PASS** |
| Back / Forward | **PASS** |
| Shared URL reproducibility | **PASS** |
| API compatibility | **PASS** |
| Performance | **PASS** (local baseline recorded; staging re-measure recommended) |
| Accessibility | **PASS** |
| Mobile responsiveness | **PASS** |
| Error / loading / empty | **PASS** |
| Pagination / Load more | **PASS** |
| Analytics recording | **PASS** |
| Security (injection / public ACTIVE scope) | **PASS** |
| TODO / FIXME / HACK in search domains | None |
| Debug logging | None |
| Temporary feature flags | None |
| Uncommitted changes at freeze | Clean (after freeze commit) |

**Tests at freeze:** web `test:search` (16); API search-related Jest (6 suites / 22); web + API typecheck.

Evidence commits: `5917e03` … `50efbba`, `1cfe763`, freeze docs commit.

---

## Deferred improvements (backlog only — do not implement during freeze)

1. Facet counts on search results.  
2. Saved-search UI / notification delivery.  
3. Keyword `@MaxLength` + tighter search-specific throttle.  
4. Vehicle analytics `sessionId` parity with legacy discovery.  
5. Clear pending range-debounce on immediate filter writes.  
6. Remove unused marketplace infinite/saved/suggestions client paths (legacy `/v1/search` list).  
7. RangeField accessible names.  
8. Staging-scale EXPLAIN re-baseline after larger datasets.  
9. Plate search rewrite (separate initiative).  
10. Elasticsearch / OpenSearch / geo / AI ranking (explicitly out of scope).  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| GIN defeated if FTS∨ILIKE re-merged | High | Keep separate union; covered by P4-0 notes |
| Large keyword DoS | Medium | Global throttle; MaxLength deferred |
| Relevance ≠ lexical rank | Medium | Heuristic locked; `ts_rank` only if product demands |
| Dual discovery vs vehicle path drift | Medium | Web results use vehicle path only; document compat |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| Release 0.2 Authentication | **FROZEN** — unchanged |
| Postgres + `ListingTranslation_fts_idx` | Deployed migration (Sprint 5) |
| Release 0.4 Marketplace | Vehicle/plate domains |

---

## QA Checklist

- [x] `q=Camry` / Arabic fixtures (P4-1 scripts)  
- [x] Partial token ILIKE (`X5`, `Patro`)  
- [x] Combined filters stable  
- [x] Keyword without sort params → relevance ordering path  
- [x] Explicit Newest → `sortBy=createdAt` in request  
- [x] Share URL restores filters  
- [x] Load more + page in URL (`replace`)  
- [ ] Staging smoke with production-like data volume (ops)  

---

## Rollback Plan

1. Redeploy previous web+API pair known-good for search.  
2. **Do not** drop FTS GIN index.  
3. If relevance ranking is wrong, clients can force `sortBy=createdAt` via URL.  
4. Analytics failures are best-effort — search results still return if `SearchEvent` write fails.  
