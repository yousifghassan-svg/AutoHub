# Priority 4 — Search & Discovery

**Status:** P4-0…P4-6 implemented on clean `develop` (quality gate **PASS**, no `ts_rank`)  
**Baseline commit:** `9173fa7` (Release 0.2 Authentication **FROZEN**)  
**Branch policy:** Do **not** restore `wip/pre-priority-4-mixed`.

---

## Approved decisions

| Decision | Detail |
| --- | --- |
| Engine | Postgres Full-Text Search only (no ES/OpenSearch) |
| Surface | Web-first: `/vehicles/search` → `GET /v1/vehicles/search` |
| Scope | `domain = VEHICLE` only; plates unchanged |
| Style | Reuse existing vehicle + discovery patterns; no new search-engine abstraction |
| Relevance | Featured → verified → views → publishedAt heuristic; **no `ts_rank`** unless quality validation proves heuristic insufficient |
| Facet counts | Deferred |
| URL sync | In scope (BUG-005) |
| Saved-search UI | Deferred |

### Required adjustments (locked)

1. **P4-0 performance baseline** — record execution/planning time, rows scanned, rows returned, indexes used for four representative queries (not EXPLAIN-only notes).
2. **P4-1 quality gate** — validate exact/partial/AR+EN/filter stability/HE parity on a representative dataset before calling P4-1 done.

---

## Slice plan

| Slice | Scope | Exit |
| --- | --- | --- |
| **P4-0** | Baseline metrics + architecture lock + quality plan | This document |
| **P4-1** | FTS + ILIKE on `VehicleRepository`; HE keyword/year parity; quality validation | Gate checklist green; no `ts_rank` unless failed |
| **P4-2** | Relevance sort under keyword; `SearchEvent` / `PopularKeyword` from vehicle search | Trending fed by vehicle path |
| **P4-3** | DTO/filter parity required by web UI | **Done** — `IsIn` sort enums; `brandId`↔`makeId` alias; mapper tests for web filter surface; client omits default sort params so API keyword→relevance can apply |
| **P4-4** | Web URL ↔ state (BUG-005) | **Done** — `url-search-state.ts` + `/vehicles/search` |
| **P4-5** | Web UX polish | **Done** — Clear keyword, Relevance sort option, empty/error states retained |
| **P4-6** | Tests + finalize `docs/search-architecture.md` | **Done** — vehicle-search unit tests + docs |

---

## Current architecture (clean baseline)

```
Web /vehicles/search  →  GET /v1/vehicles/search  →  VehicleRepository (ILIKE only)
Home trending         →  GET /v1/search/trending  →  SearchEvent aggregates
Legacy GET /v1/search →  DiscoveryRepository (FTS + ILIKE + plates) — unused by web result lists
GIN ListingTranslation_fts_idx already migrated (Sprint 5)
```

**Product path for P4:** extend `VehicleSearchService` / `VehicleRepository`.  
**Compat path:** leave `/v1/search` for trending/suggestions/saved; do not use it for web vehicle results.

---

## Schema notes affecting P4-1

| Finding | Impact |
| --- | --- |
| `HeavyEquipmentDetails` has `makeName` / `modelName` / `year` — **no** `brandId` / `modelId` | Brand/model catalog filters cannot mirror Cars via FK. HE parity for P4 = **keyword + year** (and make/model **name** match if filters provide names). Do not invent a `brandId` column in P4. |
| Local seed: 88 ACTIVE vehicles, all `CAR`; `language=ar` rows use **Latin** titles | Quality validation **must** seed Arabic-script + HE fixtures (see below). |
| Combined GIN expression is used only when the predicate matches it without defeating ORs | See performance findings. |

---

## P4-0 — Performance baseline

**When:** 2026-08-02  
**DB:** local Docker `autohub-postgres` (`localhost:5433` / db `autohub`)  
**Dataset:** 88 ACTIVE `VEHICLE` listings · 176 translations · 0 Arabic-script titles · 0 HE listings  
**Scripts:**  
- `packages/database/scripts/p4-0-performance-baseline.sql`  
- `packages/database/scripts/p4-0-performance-baseline-b.sql`  
- `packages/database/scripts/p4-0-baseline-setup.sql`  
**Raw plans:** `docs/releases/p4-0-explain-raw.txt`, `docs/releases/p4-0-explain-b-raw.txt`

### Filter fixtures used

| Role | Value |
| --- | --- |
| Keyword set | `tesla` / `bmw` / `nissan` / `toyota` |
| Brand (BMW) | `cmrxj7fif003xehjgo6otf1sd` |
| Brand (Toyota) | `cmrxj7fgi0036ehjgyqtw2n7t` |
| City (Baghdad) | `cmrxj7fcs001behjg0jlul5b5` |
| Price | `primaryPrice` 10M–80M IQD |

### Metric definitions

| Metric | Source |
| --- | --- |
| Planning time | `EXPLAIN ANALYZE` → Planning Time |
| Execution time | `EXPLAIN ANALYZE` → Execution Time |
| Rows scanned | Primary access path actual rows (index/heap) before final LIMIT; noted per query |
| Rows returned | Actual rows from LIMIT node (= page size capped match count) |
| Indexes used | Named index scans in the plan |

### Path A — current web baseline (ILIKE only)

Mirrors `VehicleRepository.buildKeywordFilter` today (`contains` / ILIKE on slug, metaTitle, translations).

| Query | Planning | Execution | Rows scanned (notable) | Rows returned | Indexes used |
| --- | --- | --- | --- | --- | --- |
| **A1 Keyword only** (`tesla`) | 3.939 ms | 4.407 ms | Listing bitmap ≈101 candidates; translation Seq Scan → 16 hit rows → 8 listings | 8 | `Listing_domain_status_cityId_idx` (Bitmap); **no** FTS GIN; translation **Seq Scan** |
| **A2 Keyword + brand** (`bmw` + BMW id) | 6.596 ms | 2.735 ms | Listing bitmap ≈101; translation Seq Scan → 20; CarDetails Seq Scan → 10 BMW | 8 | `Listing_domain_status_cityId_idx`; `MotorcycleDetails_brandId_idx` / `TruckDetails_brandId_idx` (planned, not executed) |
| **A3 Keyword + city** (`nissan` + Baghdad) | 3.901 ms | 3.184 ms | City index → 8 Baghdad vehicles; filter → 2 | 2 | `Listing_domain_status_cityId_idx` (Index Scan) |
| **A4 Keyword + brand + price** (`toyota` + Toyota + IQD range) | 6.153 ms | 5.005 ms | BitmapAnd domain/status + `Listing_primaryPrice_idx` (~191 price hits ∩ ~101 vehicles) → 6 | 6 | `Listing_domain_status_cityId_idx`, `Listing_primaryPrice_idx`, `Currency_pkey` |

**Match counts (unlimited):** A1=8 · A2=8 · A3=2 · A4=6

### Path B — target P4-1 shape (FTS expression + ILIKE OR)

| Query | Planning | Execution | Rows scanned (notable) | Rows returned | Indexes used |
| --- | --- | --- | --- | --- | --- |
| **B1 Keyword only** | 10.647 ms | 26.996 ms | Listing bitmap ≈101; translation **Seq Scan** with FTS+ILIKE filter → 16 | 8 | `Listing_domain_status_cityId_idx`; **GIN not used** (OR with ILIKE) |
| **B2 Keyword + brand** | 32.800 ms | 42.489 ms | Same pattern; brand via CarDetails | 8 | `Listing_domain_status_cityId_idx`; brand btree planned on moto/truck |
| **B3 Keyword + city** | 4.225 ms | 2.370 ms | City index → 8; per-listing translation lookup | 2 | `Listing_domain_status_cityId_idx`, `ListingTranslation_listingId_language_key` |
| **B4 Keyword + brand + price** | 6.443 ms | 0.850 ms | Brand-first nest (15 Toyota cars) → 6 after keyword+price | 6 | `Listing_pkey`, `ListingTranslation_listingId_language_key`, `Currency_pkey` |

### Probe — GIN usability (critical)

| Probe | Planning | Execution | Result |
| --- | --- | --- | --- |
| **B1b** FTS-only with **exact** GIN expression (no ILIKE OR) | 1.359 ms | 5.791 ms | **`ListingTranslation_fts_idx` used** (Bitmap Index Scan, 16 rows) |
| Prisma-like **per-field** `to_tsvector(title)` / `description` | 1.134 ms | 24.564 ms | **GIN not used** — Seq Scan on `ListingTranslation` |

### Baseline conclusions (objective)

1. Local dataset is tiny (88 vehicles); absolute ms are not production scale — metrics exist to **diff after P4-1** and on larger staging data.
2. Current web ILIKE path never touches `ListingTranslation_fts_idx`.
3. Naive `FTS OR ILIKE` in one predicate often **defeats** the GIN (planner Seq Scans translations).
4. Expression matching the existing GIN **does** use the index when not OR-merged with ILIKE.
5. Prisma `field.search` (per-field tsvector) **does not** match `ListingTranslation_fts_idx` (combined title\|\|description). Reusing discovery’s Prisma `search` alone would **not** utilize the existing GIN.

### P4-1 implementation implication (from baseline)

To honor “Postgres FTS” **and** the existing GIN:

1. Primary keyword recall via the **indexed expression** (Prisma `$queryRaw` candidate IDs **or** equivalent), scoped to ACTIVE VEHICLE.
2. ILIKE fallback as a **separate** OR branch / second pass for partial tokens — acceptable if measured; avoid a single filter that forces Seq Scan if staging shows regression.
3. Do **not** add `ts_rank` in P4-1 unless the quality gate fails.
4. Re-run this baseline script after P4-1 and attach a comparison table.

No new migration required for P4-0. Optional later: per-field GIN indexes if we standardize on Prisma `search` only — **not** chosen for P4-1 given existing combined GIN.

---

## P4-1 — Search quality validation plan (gate)

Complete **before** marking P4-1 done. Seed a small fixture set (script under `packages/database/scripts/` in P4-1), then exercise `GET /v1/vehicles/search`.

### Required fixtures (representative titles / descriptions)

| ID | Category | Title EN | Title AR (script) | Description notes | Specs |
| --- | --- | --- | --- | --- | --- |
| Q1 | CAR | `2020 Toyota Camry SE` | `تويوتا كامري 2020` | Contains `Camry` / `كامري` | Toyota, Baghdad |
| Q2 | CAR | `BMW X5 M Sport` | `بي ام دبليو اكس فايف` | Partial token target: `X5` | BMW |
| Q3 | CAR | `Clean Nissan Patrol Safari` | `نيسان باترول` | Exact `Patrol` | Nissan, Basra |
| Q4 | HEAVY_EQUIPMENT | `Caterpillar 320 Excavator` | `حفارة كاتربيلر 320` | HE keyword parity | year 2019, makeName Caterpillar |
| Q5 | HEAVY_EQUIPMENT | `Komatsu Bulldozer D65` | `بلدوزر كوماتسو` | HE + year filter | year 2015 |
| Q6 | CAR | `Tesla Model 3 Long Range` | `تيسلا موديل 3` | Latin + Arabic brand forms | Featured preferred for heuristic check |

Use distinct slug prefixes `p4-quality-*` and soft-delete/cleanup after validation if desired.

### Gate checklist

| # | Check | Pass criteria |
| --- | --- | --- |
| Q-1 | Exact keyword | `q=Camry` / `q=كامري` returns Q1 in the result set; with relevance/default sort under keyword, exact-title hits appear at or above weaker partials when heuristic ties break on featured/verified/views |
| Q-2 | Partial ILIKE fallback | `q=X5` and `q=Patro` (partial) still return the intended listings via ILIKE when FTS tokenization would miss |
| Q-3 | English | `q=toyota` / `q=Tesla` returns EN-titled rows |
| Q-4 | Arabic | `q=تويوتا` / `q=تيسلا` returns AR-script rows (`simple` config tokenizes on whitespace; no Arabic stemmer — document behavior) |
| Q-5 | Combined filters | `q=toyota` + brandId=Toyota + city + price range remains stable (no empty flapping; no plates) |
| Q-6 | HE parity | `q=Caterpillar` / `q=كاتربيلر` returns HE rows the same way Cars match on title/description; year filter applies to `HeavyEquipmentDetails.year` like car year |

**`ts_rank` decision:** introduce only if Q-1 fails after heuristic sort (featured/verified/views/publishedAt) on this fixture set.

### P4-1 quality results (2026-08-03 local)

**Scripts:** `packages/database/scripts/p4-1-quality-fixtures.mjs`, `packages/database/scripts/p4-1-quality-validate.mjs`  
**API:** `GET /v1/vehicles/search` after GIN-aware FTS + ILIKE union in `VehicleRepository`

| Check | Result | Notes |
| --- | --- | --- |
| Q-1 exact EN `Camry` | **PASS** | Fixture `p4-quality-q1-camry` returned |
| Q-1 exact AR `كامري` | **PASS** | total=1 |
| Q-2 partial `X5` | **PASS** | ILIKE fallback |
| Q-2 partial `Patro` | **PASS** | ILIKE fallback → Patrol |
| Q-3 English `toyota` / `Tesla` | **PASS** | |
| Q-4 Arabic `تويوتا` / `تيسلا` | **PASS** | `simple` config; whitespace tokens |
| Q-5 combined keyword+make+city+price | **PASS** | total=1, only Camry fixture |
| Q-6 HE EN/AR + year | **PASS** | Caterpillar / كاتربيلر; Komatsu year band |
| Heuristic smoke (featured Tesla present) | **PASS** | Full relevance sort lands in **P4-2** |
| **`ts_rank`** | **Not introduced** | Heuristic sufficient for gate |

**P4-1 code:** `VehicleRepository.resolveKeywordListingIds` (FTS GIN expression + separate ILIKE union); HE year/makeName/modelName branch when dimensions are HE-expressible.

---

## Out of scope (unchanged)

- Elasticsearch / OpenSearch  
- Geo radius  
- AI ranking  
- Saved-search notification delivery  
- Plate search rewrite  
- Restoring mixed WIP branch  
- Auth changes (Release 0.2 frozen)

---

## Reproducibility

```powershell
# From repo root (Postgres container running)
Get-Content -Raw packages/database/scripts/p4-0-baseline-setup.sql |
  docker exec -i autohub-postgres psql -U autohub -d autohub

Get-Content -Raw packages/database/scripts/p4-0-performance-baseline.sql |
  docker exec -i autohub-postgres psql -U autohub -d autohub

Get-Content -Raw packages/database/scripts/p4-0-performance-baseline-b.sql |
  docker exec -i autohub-postgres psql -U autohub -d autohub
```
