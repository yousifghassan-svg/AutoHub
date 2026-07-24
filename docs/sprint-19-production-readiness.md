# Sprint 19 — Production Readiness & Marketplace Completion

AutoHub beta-ready marketplace completion: admin vehicle lifecycle, seller wizard, marketplace surfaces, search, media, SEO.

## Completed features

### Admin vehicle lifecycle
- Create / edit / duplicate / archive / restore / soft delete / permanent delete
- Publish / unpublish / approve / reject → `REJECTED`
- Feature / unfeature, bulk actions, CSV export
- Preview on marketplace, audit timeline, listing history via audit logs

### Sell wizard
- Multi-step flow with progress indicator
- Catalog-backed category / city / brand / model
- Debounced localStorage autosave
- Step validation
- Image + video upload and attach on publish
- Preview + Save draft / Submit for review

### Marketplace
- Homepage sections (featured, dealers, plates, latest, brands, cities, stats)
- Professional footer / navigation polish
- Vehicle detail: gallery, specs, equipment, dealer card, OSM map, favorite, share, report, Call / WhatsApp
- Dealer profile: cover, logo, hours, address, contact, reviews placeholder, inventory
- Plates gallery filters + `/plates/[id]` detail with similar plates

### Search
- Price / mileage / year sliders
- Brand, model, body type, color, fuel, transmission, location
- Sorting, suggestions, full saved-search restore
- Server-side `colorId` filter

### Media
- Drag & drop, primary, sort, compression, preview, delete, replace
- Wired into sell wizard

### SEO / UX / performance
- Root OG image, robots, expanded sitemap (listings + dealers)
- `generateMetadata` layouts for listing / dealer / plate
- Skeletons, empty/error states, dark mode retained
- Dynamic gallery import, lazy images

## Pages created / upgraded

| Route | Notes |
| --- | --- |
| `/listings` (admin) | REJECTED filter, duplicate action |
| `/listings/[id]` (admin) | Publish, unpublish, reject, duplicate, preview |
| `/listings/new`, `/listings/[id]/edit` | REJECTED status |
| `/sell` (web) | Production wizard |
| `/listings/[id]` (web) | Contact, report, map, equipment, dealer |
| `/dealers/[slug]` | Cover/logo/hours/reviews placeholder |
| `/plates` | Plate search filters |
| `/plates/[id]` | **New** plate detail |
| `/search` | Model/body/color + saved restore + suggestions |

## Components / services (high level)

- Sell wizard rewrite (`apps/web/src/app/sell/page.tsx`)
- Listing mappers + contact/report repository helpers
- Media replace in `useMediaUpload` / `MediaUploader`
- Search `apply-saved-filters` helper
- SEO fetch helpers + page layouts
- Admin listings duplicate / publish / unpublish API + UI

## API endpoints added

| Method | Path |
| --- | --- |
| `POST` | `/v1/admin/listings/:id/duplicate` |
| `POST` | `/v1/admin/listings/:id/publish` |
| `POST` | `/v1/admin/listings/:id/unpublish` |
| `POST` | `/v1/listings/:id/contact-click` |

Extended: reject → `REJECTED`, search `colorId`, dealer public profile fields, listing response `sellerContact` / geo / `features`.

## Database migration

`packages/database/prisma/migrations/20260724193000_sprint19_production`

- `ListingStatus.REJECTED`
- `Listing.features String[]`
- `DealerOrganization`: `whatsapp`, `address`, `coverImageUrl`, `logoUrl`, `openingHours`

## Build status (modified packages)

| Package | lint | typecheck | build |
| --- | --- | --- | --- |
| `@autohub/api` | ✅ | ✅ | ✅ |
| `@autohub/admin` | ✅ | ✅ | ✅ |
| `@autohub/web` | ✅* | ✅ | ✅ |

\* Web lint emits `@next/next/no-img-element` warnings on dealer cover/logo (`<img>` with eslint-disable). Build succeeds.

## Screenshots

- `docs/screenshots/sprint19-search.png`
- `docs/screenshots/sprint19-plates.png`
- `docs/screenshots/sprint19-listing-detail.png`
- `docs/screenshots/sprint19-dealer-profile.png`

## Known issues

1. Favorites remain localStorage-only (no server sync API yet).
2. Dealer reviews are placeholder only (no review model).
3. Equipment tags require populating `Listing.features` (admin/API field available).
4. Sell wizard media UI does not fully restore preview thumbs from draft IDs after reload.
5. Sitemap plate URLs not dedicated (`/listings/[id]` covered; `/plates/[id]` optional follow-up).
6. Firebase / R2 remain idle until credentials configured.

## Remaining work (post-beta / mobile prep)

- Native mobile app
- Server-side favorites + notifications push
- Dealer reviews / ratings domain
- Full CDN `next/image` remotePatterns for R2
- Production observability (APM, error tracking)
- Hardening of media virus scan provider

## Estimated production readiness

**~88%** for web + admin beta (core marketplace loop complete). Remaining ~12% is integrations (R2/Firebase), favorites sync, reviews, and ops hardening before public launch.
