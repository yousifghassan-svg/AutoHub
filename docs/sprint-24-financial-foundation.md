# Sprint 24 — Financial Foundation (Multi-Currency)

**Date:** 2026-07-25  
**Phase 1 currencies:** IQD (default), USD  
**Architecture ready for:** AED, EUR, SAR, TRY, GBP (DB catalog — no refactor)

---

## Decision summary

- Single required **primary price** + **currencyCode** (default IQD).
- `secondaryPrice` retained for future dual-display (not required in UI).
- Search/sort are **currency-scoped** (no FX conversion).
- Payment providers: **interfaces only** (no live charges).

---

## Database

Migration: `packages/database/prisma/migrations/20260725190000_financial_foundation_currency`

| Change | Detail |
| --- | --- |
| `Currency.isDefault` | Boolean; IQD = true |
| `Currency.sortOrder` | IQD=10, USD=20 |
| Seed / upsert | Localized names (ar/ku/en) |
| Backfill | Null `Listing.primaryCurrencyId` → IQD |

Existing dual-price FKs (`primaryPrice`, `primaryCurrencyId`, `secondary*`, `fxRateSnapshot`) unchanged.

---

## Architecture

| Layer | Change |
| --- | --- |
| `@autohub/utils` | `Money` VO: format, compare, validate; never compare mixed currencies |
| API `CurrenciesModule` | `GET /v1/currencies` |
| API `PaymentsModule` | `PaymentProvider` + registry (Stripe, Zain Cash, Qi Card, Mastercard, Visa, Apple Pay, Google Pay) — unimplemented |
| Listings / Vehicles / Plates / Search | Accept `currencyCode`; expose `currencyCode` + nested currency; currency-aware price filters |
| Admin dashboard | Vehicles/plates/avg price by currency |

---

## API changes

- `GET /v1/currencies` — public catalog (`isActive`, `isDefault`, `sortOrder`, localized names).
- Create/update vehicle & plate: `primaryPrice` required (vehicle/plate DTOs); `currencyCode` preferred (falls back to `primaryCurrencyId`, then IQD).
- List/search query: `currencyCode` (auto IQD when min/max/sort by price without currency).
- Responses: `price`, `currencyCode`, `primaryCurrency { code, symbol, decimalPlaces }`.
- Admin dashboard summary: `currency.vehiclesByCurrency`, `platesByCurrency`, `averagePriceByCurrency`.

---

## Client changes

### Web
- Currency selector on sell, edit, vehicle/plate search.
- Locale-aware `formatMoney` via `@autohub/utils`.
- Search ranges: IQD max 200M / USD max 200k.

### Admin
- Vehicle/plate forms send `currencyCode`.
- Tables show price with currency.
- Currency filter on vehicles list.
- Dashboard currency breakdown cards.

### Mobile
- Create / duplicate / edit payloads send `currencyCode` (no mock `curr-iqd` / `curr-usd` IDs).
- Search: IQD/USD chips + min/max price.
- My-listings edit sheet: currency chips.
- Manage edit drafts preserve `currencyCode`.
- Locale-aware `formatPrice` (ar/ku/en → `ar-IQ` / `ckb-IQ` / `en-IQ`).

---

## Key files

| Area | Paths |
| --- | --- |
| Migration | `packages/database/prisma/migrations/20260725190000_financial_foundation_currency/` |
| Schema / seed | `packages/database/prisma/schema.prisma`, `seed.ts` |
| Money VO | `packages/utils/src/money.ts` |
| Types | `packages/types/src/index.ts` (`CurrencyCode`) |
| Currencies API | `apps/api/src/domains/currencies/` |
| Payments iface | `apps/api/src/domains/payments/` |
| Listings/search | `apps/api/src/domains/listings/`, search/vehicles/plates controllers |
| Admin dashboard | `apps/api/src/domains/admin/application/admin-dashboard.service.ts` |
| Web | `apps/web/src/features/currencies/`, sell/search/edit pages |
| Admin UI | VehicleForm, vehicles/plates pages, dashboard, `ui.tsx` `formatPrice` |
| Mobile | sell StepPrice, search, create repos, my-listings edit, home mappers |

---

## Tests

- `Money` VO unit tests (`apps/api/.../money.spec.ts`)
- `CurrenciesService` unit tests
- Admin dashboard currency stats (updated spec)
- Existing listing/search tests updated for `CurrenciesService` DI

---

## QA

See [`docs/sprint-24-qa.md`](./sprint-24-qa.md). Summary: all gates exit `0` (mobile typecheck re-run after payload type fix).

### Screenshots

| File | What |
| --- | --- |
| [`screenshots/sprint24-web-search-usd.png`](./screenshots/sprint24-web-search-usd.png) | Web search USD + price bounds |
| [`screenshots/sprint24-web-sell-currency.png`](./screenshots/sprint24-web-sell-currency.png) | Sell wizard price step currency select |
| [`screenshots/sprint24-admin-dashboard-currency.png`](./screenshots/sprint24-admin-dashboard-currency.png) | Dashboard by-currency stats |
| [`screenshots/sprint24-admin-vehicles-currency.png`](./screenshots/sprint24-admin-vehicles-currency.png) | Vehicles table IQD price + currency filter |

---

## Future (not in this sprint)

- Live payment adapters
- FX rates / dual-price requirement
- Featured listing / subscription plan pricing UI (schema already has `SubscriptionPlan.currencyId`)
