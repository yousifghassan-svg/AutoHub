# Sprint 24 QA — Financial Foundation

**Date:** 2026-07-25  
**Scope:** Multi-currency Phase 1 (IQD default, USD), Money VO, currencies API, payment interfaces only.

## Gate results

| Gate | Exit | Notes |
| --- | --- | --- |
| `@autohub/api` lint | 0 | Pass |
| `@autohub/web` lint | 0 | Pass |
| `@autohub/admin` lint | 0 | Pass |
| `@autohub/web` build | 0 | Pass |
| `@autohub/admin` build | 0 | Pass |
| `@autohub/api` build | 0 | Pass |
| `@autohub/api` test | 0 | Pass (incl. Money, currencies, dashboard currency stats) |
| `@autohub/mobile` typecheck | 0 | Pass after `CreateListingPayload.currencyCode` fix |

Initial mobile typecheck failed (`currencyCode` missing on `CreateListingPayload`); fixed and re-verified (`docs/_s24_mobile-tc2.log`).

## Smoke checks

| Check | Result |
| --- | --- |
| `GET /v1/currencies` | Returns IQD (`isDefault`, `sortOrder: 10`) + USD (`sortOrder: 20`) |
| Web vehicle search currency filter | Currency select + USD price range 0–200,000 |
| Web sell price step | Currency select default IQD |
| Admin dashboard | Vehicles/plates/avg by currency (IQD populated) |
| Admin vehicles list | Currency filter + `IQD …` formatted prices |

## Screenshots

| File | Description |
| --- | --- |
| `docs/screenshots/sprint24-web-search-usd.png` | Web search with USD currency + USD price bounds |
| `docs/screenshots/sprint24-web-sell-currency.png` | Web sell price step currency selector |
| `docs/screenshots/sprint24-admin-dashboard-currency.png` | Admin dashboard by-currency cards |
| `docs/screenshots/sprint24-admin-vehicles-currency.png` | Admin vehicles table + currency filter |

Mobile device screenshot not available in this environment; StepPrice IQD/USD chips, search currency/min-max, and edit currency verified in source + typecheck.

## Known limitations (by design)

- No FX conversion in search/sort.
- Payment providers are interfaces/registry only (unimplemented).
- Secondary dual-price not required in UI.
