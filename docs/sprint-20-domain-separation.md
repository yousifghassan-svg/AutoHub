# Sprint 20 — Domain Separation (Vehicles & Plates)

Architectural refactor so Vehicles and Plates are independent business domains while sharing authentication, users, permissions, media, dealers, notifications, settings, and audit.

## Architecture changes

### Strategy (data-preserving)

Physical `Listing` rows remain the **shared commerce hub** (price, status, seller, geo, slug, media, translations). This avoids FK breakage and data loss.

Sprint 20 adds:

1. **`MarketplaceDomain`** discriminator on `Listing` (`VEHICLE` | `PLATE`)
2. Independent Nest domains that **never branch on the other product**
3. Independent public/admin APIs
4. Independent Admin IA and Web marketplaces
5. Plate catalog tables owned by the plates domain

Views `vehicle_market_v` / `plate_market_v` document the two markets for reporting.

### New folder structure (API)

```
apps/api/src/domains/
  vehicles/
    application/          VehiclesService, VehicleSearchService
    domain/               constants, policies (+ specs)
    infrastructure/       VehicleRepository (always domain=VEHICLE)
    presentation/         VehiclesController + DTOs
    vehicles.module.ts
  plates/
    application/          PlatesService, PlateSearchService, PlateCatalogService
    domain/               constants, policies
    infrastructure/       PlateRepository (always domain=PLATE)
    presentation/         PlatesController + DTOs
    plates.module.ts
  admin/
    ... AdminVehiclesController/Service
    ... AdminPlatesController (catalog + verification)
  listings/               Shared marketplace kernel (compat + media bridge)
```

Shared infra unchanged: `auth`, `users`, `media`, `dealers`, `notifications`, `search` (legacy), `admin` audit/settings.

---

## API changes

### Vehicles

| Method | Path |
| --- | --- |
| GET | `/v1/vehicles` |
| GET | `/v1/vehicles/search` |
| GET | `/v1/vehicles/:id` |
| POST | `/v1/vehicles` |
| PATCH | `/v1/vehicles/:id` |
| DELETE | `/v1/vehicles/:id` |
| PATCH | `/v1/vehicles/:id/status` |
| POST | `/v1/vehicles/:id/contact-click` |
| * | `/v1/admin/vehicles/*` (full moderation mirror) |

### Plates

| Method | Path |
| --- | --- |
| GET | `/v1/plates` |
| GET | `/v1/plates/search` |
| GET | `/v1/plates/catalog/categories` |
| GET | `/v1/plates/catalog/prefixes` |
| GET | `/v1/plates/catalog/provinces` |
| GET | `/v1/plates/:id` |
| POST | `/v1/plates` |
| PATCH | `/v1/plates/:id` |
| DELETE | `/v1/plates/:id` |
| POST | `/v1/plates/:id/verify` |
| * | `/v1/admin/plates/*` (+ catalog CRUD, verifications) |

### Compatibility

- `/v1/listings/*` remains for media bridge and legacy clients
- Create path sets `Listing.domain` from category (`PLATE` → PLATE, else VEHICLE)

---

## Database changes

Migration: `20260724210000_sprint20_domain_separation`

| Change | Notes |
| --- | --- |
| Enum `MarketplaceDomain` | VEHICLE, PLATE |
| Enum `PlateVerificationStatus` | UNVERIFIED, PENDING, VERIFIED, REJECTED |
| `Listing.domain` | Backfilled from `categoryCode` |
| `PlateCategory` | Seeded Private/Taxi/Government/Commercial/Diplomatic |
| `PlatePrefix` | Catalog for letter/series prefixes |
| `PlateVerification` | Verification audit events |
| `PlateDetails` | `plateCategoryId`, `platePrefixId`, `verificationStatus`, `verifiedAt`, `verifiedById` |
| Views | `vehicle_market_v`, `plate_market_v` |

**No Listing rows deleted or IDs changed.**

---

## Admin changes

Sidebar groups:

- **Platform** — Dashboard  
- **Vehicles** — Vehicles, Categories, Brands, Models, Features, Reports  
- **Plates** — Plates, Categories, Provinces, Prefixes, Verification, Reports  
- **Administration** — Dealers, Users, Media, Reports, Statistics, Settings, Audit  

Routes:

- `/vehicles/**` — primary vehicle management (API `/v1/admin/vehicles`)
- `/listings/**` → redirects to `/vehicles/**`
- `/plates/**` — plates + catalog/verification pages

---

## Web changes

| Route | Role |
| --- | --- |
| `/` | Dual-product homepage (Vehicles + Plates CTAs) |
| `/vehicles` | Vehicle marketplace home |
| `/vehicles/search` | Vehicle-only filters |
| `/vehicles/[id]` | Vehicle detail + SEO |
| `/plates` | Plate marketplace home |
| `/plates/search` | Plate-only filters |
| `/plates/[id]` | Plate detail (not vehicle layout) |
| `/search` | Chooser / redirect to domain search (no mixed engine) |
| `/listings/[id]` | Thin redirect to `/vehicles/:id` or `/plates/:id` |

Nav: Vehicles, Plates, Dealers, Sell, Favorites.

Sell / my-listings / contact-click use `/v1/vehicles` or `/v1/plates` (media still on shared `/v1/listings/:id/media`).

---

## Search

| Engine | Endpoint | Filters |
| --- | --- | --- |
| Vehicle | `/v1/vehicles/search` | make/model/year/mileage/fuel/transmission/body/location/price |
| Plate | `/v1/plates/search` | province/format, prefix/series, number, price |

No vehicle UI calls plate filters; no plate UI calls vehicle brand/model filters.
`/search` no longer queries `/v1/search` for marketplace results.

---

## Migration summary

1. Applied `20260724210000_sprint20_domain_separation`
2. Backfilled `Listing.domain` for all existing rows
3. Seeded plate categories; linked `PlateDetails.plateCategoryId` from `plateType` where possible
4. Prisma client regenerated

---

## Hardening pass (continued Sprint 20)

| Area | Change |
| --- | --- |
| Web URLs | `ListingCard` + sitemap use domain paths; no dual `/listings` sitemap entries |
| Web mutations | `useDomainMutations` → create/status/delete on vehicles/plates APIs |
| Admin vehicles | Plate attach UI removed from `VehicleForm`; preview → `/vehicles/:id` |
| Admin plates | Category/prefix create forms; provinces from `/v1/plates/catalog/provinces` |
| Reports | `domain` filter on admin reports; vehicle/plate report pages wired |
| Dashboard | Counts by `MarketplaceDomain` (not `categoryCode`) |
| Plates API | `PATCH /v1/plates/:id/status`, `POST /v1/plates/:id/contact-click` |

---

## Test results

| Package | lint | typecheck | build |
| --- | --- | --- | --- |
| `@autohub/api` | ✅ | ✅ | ✅ |
| `@autohub/admin` | ✅ | ✅ | ✅ |
| `@autohub/web` | ✅* | ✅ | ✅ |

\* Web may emit existing `@next/next/no-img-element` warnings on dealer cover/logo.

Unit tests: `admin-dashboard.service.spec`, `vehicles.service.spec`, `plates.service.spec` ✅

---

## Known follow-ups

1. Media attach still uses `/v1/listings/:id/media` (shared infra by design)
2. Legacy `/v1/listings` remains for media bridge / compatibility; `/v1/search` unused by web marketplaces
3. Full physical split of Vehicle/Plate root tables (instead of Listing hub) deferred — would require polymorphic media/FK migration
4. Vehicle catalog admin CRUD (brands/models) still read-only against public catalog filters
5. Restart API after deploy so new plate status/contact-click routes are live
