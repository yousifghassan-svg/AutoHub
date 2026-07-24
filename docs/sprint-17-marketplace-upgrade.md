# Sprint 17 — Marketplace Professional Upgrade

Upgrade of the consumer marketplace (`apps/web`) to a production-quality automotive experience, without removing existing Sprint 14–17 features (auth, sell wizard, favorites, plates, media gallery).

## Delivered

### Homepage
Premium hero with brand-forward search, categories, featured vehicles, premium dealers, popular brands/cities, recently added, latest plates, stats, why AutoHub, CTA, and professional footer.

### Listing cards
Carousel (multi-image), favorite control, featured/verified/dealer badges, price formatting, plate SVG preview, quick actions, hover lift animation.

### Vehicle details
Large gallery (dynamic import), specs grid, seller card, related vehicles, share / favorite / report / contact actions, JSON-LD `Vehicle` structured data.

### Search
Wired to `GET /v1/search` with price/year/mileage range sliders, transmission, fuel, brand, governorate, city, sort, and saved searches (auth).

### Dealers
Public pages `/dealers` and `/dealers/[slug]` backed by new read-only APIs.

### License plates
Dedicated `/plates` gallery with framed Iraqi plate previews and listing cards.

### Design system
Expanded UI kit (Card, Select, RangeField, Modal, SectionHeader), theme toggle (dark/light), footer, spacing/typography polish.

### Performance
Dynamic import for `VehicleGallery`, React Query caching for catalog/trending, lean list media already capped server-side.

### SEO
Root Open Graph / Twitter metadata, `sitemap.ts`, `robots.ts`, listing JSON-LD.

## New / extended API (additive)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/v1/dealers` | Public dealer list |
| `GET` | `/v1/dealers/:slug` | Profile + inventory |
| `GET` | `/v1/catalog/filters` | Brands, fuel, transmission, colors, governorates, cities |

Admin APIs unchanged.

## Screenshots

- `docs/screenshots/marketplace-home.png`
- `docs/screenshots/marketplace-search.png`
- `docs/screenshots/marketplace-listing.png`
- `docs/screenshots/marketplace-dealers.png`
- `docs/screenshots/marketplace-plates.png`

## Acceptance

| Check | API | Web | Admin |
| --- | --- | --- | --- |
| lint | ✅ | ✅ | ✅ |
| typecheck | ✅ | ✅ | ✅ |
| build | ✅ | ✅ | ✅ |

Runtime verified:

- `http://localhost:3000` → 200
- `http://localhost:3001/login` → 200
- `http://localhost:4000/docs` → 200
- `GET /v1/dealers` → 200
- `GET /v1/catalog/filters` → 200

Note: Color options are exposed via catalog filters; search DTO does not yet accept `colorId` (fuel/transmission/brand/location ranges are wired). Existing sell/auth/favorites/media flows were preserved.
