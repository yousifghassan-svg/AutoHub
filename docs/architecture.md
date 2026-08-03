# AutoHub Architecture

AutoHub is a hybrid vehicle marketplace for Iraq. Version 1 ships as classifieds (listings + inquiry). The database and API are designed for future payments, escrow, auctions, dealers, and adjacent verticals without rewriting the listing hub.

## Stack

- Mobile: React Native + Expo
- Web / Admin: Next.js App Router
- API: NestJS modular monolith (`/v1`) with DDD domain modules
- DB: PostgreSQL + Prisma (`packages/database`)
- Auth: Firebase Phone Authentication → API JWT access + refresh (Sprint 3)
- Media: Cloudflare R2 signed uploads — client prepared

## Monorepo

See repository root.

- API DDD: [`docs/api-ddd-architecture.md`](./api-ddd-architecture.md)
- Sprint 2 foundation: [`docs/sprint-2-backend-foundation.md`](./sprint-2-backend-foundation.md)
- Sprint 3 auth: [`docs/sprint-3-auth.md`](./sprint-3-auth.md), [`docs/auth-architecture.md`](./auth-architecture.md)
- **Release 0.5 Marketplace & Listings (normative):** [`docs/releases/RELEASE_0.5_MARKETPLACE.md`](./releases/RELEASE_0.5_MARKETPLACE.md), [`docs/architecture/`](./architecture/)
- Sprint 4 listings: [`docs/sprint-4-listings.md`](./sprint-4-listings.md), [`docs/listings-architecture.md`](./listings-architecture.md)
- Sprint 5 search: [`docs/sprint-5-search.md`](./sprint-5-search.md), [`docs/search-architecture.md`](./search-architecture.md)
- Sprint 6 media: [`docs/sprint-6-media.md`](./sprint-6-media.md), [`docs/media-architecture.md`](./media-architecture.md)
- Sprint 7 mobile design system: [`docs/sprint-7-mobile-design-system.md`](./sprint-7-mobile-design-system.md), [`docs/mobile-design-system.md`](./mobile-design-system.md) (Dealer Platform deferred)
- Sprint 8 mobile auth: [`docs/sprint-8-mobile-auth.md`](./sprint-8-mobile-auth.md), [`docs/mobile-auth-architecture.md`](./mobile-auth-architecture.md)
- Sprint 9 home: [`docs/sprint-9-home.md`](./sprint-9-home.md), [`docs/mobile-home-architecture.md`](./mobile-home-architecture.md)
- Sprint 10 listing details: [`docs/sprint-10-listing-details.md`](./sprint-10-listing-details.md), [`docs/mobile-listing-details-architecture.md`](./mobile-listing-details-architecture.md)
- Sprint 11 create listing: [`docs/sprint-11-create-listing.md`](./sprint-11-create-listing.md), [`docs/mobile-create-listing-architecture.md`](./mobile-create-listing-architecture.md)
- Sprint 12 my listings: [`docs/sprint-12-my-listings.md`](./sprint-12-my-listings.md), [`docs/mobile-my-listings-architecture.md`](./mobile-my-listings-architecture.md)
- Sprint 13 stabilization: [`docs/sprint-13-stabilization.md`](./sprint-13-stabilization.md), [`docs/sprint-13-architecture-review.md`](./sprint-13-architecture-review.md), [`docs/sprint-13-production-readiness-checklist.md`](./sprint-13-production-readiness-checklist.md)
- Sprint 14 web marketplace: [`docs/sprint-14-web-marketplace.md`](./sprint-14-web-marketplace.md)
- Roadmap: [`docs/roadmap.md`](./roadmap.md)

## Listing hub

Every marketplace item is a `Listing` row with a category-specific details table (`CarDetails`, `PlateDetails`, etc.). Future verticals add a category + details table + Nest module.

## Dual currency

Prices use a `Currency` table with listing `primaryPrice`/`primaryCurrencyId` and optional secondary price pair, plus optional `fxRateSnapshot`.

## Events

`DomainEventOutbox` captures domain events for analytics and future async workers.
