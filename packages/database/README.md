# `@autohub/database`

Prisma schema, migrations, and seed for AutoHub.

## Current migration

`prisma/migrations/20260723160000_listing_hub_revisions`

This is the revised Sprint 1 foundation. It replaces the earlier `listing_hub_foundation` migration (safe locally because the DB was reset with explicit approval).

## Architecture highlights

| Area | Approach |
| --- | --- |
| Currency | `Currency` table; listings use `primaryCurrencyId` / `secondaryCurrencyId` |
| Country | `Country.defaultCurrencyId` for multi-country readiness |
| Specs | Reference tables: fuel, transmission, drive, body, color, engine, condition |
| Media | `MediaType` enum on `ListingMedia` |
| Audit | `createdAt`, `updatedAt`, `createdById`, `updatedById`, `deletedAt` on important tables |
| SEO | `Listing.slug`, `metaTitle`, `metaDescription` |
| Stats | views / favorites / shares / phone / WhatsApp click counters |
| Verification | `isFeatured`, `isVerified`, `verificationStatus` |
| Search | Indexes on category, city, price, status, featured, createdAt; brand/model on detail tables |

ER overview: [`docs/database-er.md`](../../docs/database-er.md)

## Commands (from monorepo root)

```bash
npx pnpm@9.15.0 db:generate
npx pnpm@9.15.0 db:seed
npx pnpm@9.15.0 --filter @autohub/database exec prisma migrate deploy
npx pnpm@9.15.0 --filter @autohub/database exec prisma studio
```

Local Docker Postgres (host port **5433**):

```env
DATABASE_URL=postgresql://autohub:autohub@localhost:5433/autohub?schema=public
```

## Seed contents

- Currencies: IQD, USD
- Categories: car, plate, motorcycle, truck, heavy equipment
- Iraq + 18 governorates / cities
- Spec reference rows (fuel, transmission, drive, body, color, engine, condition)
- Common vehicle brands/models

## Out of scope (for now)

No NestJS listing/auth/search APIs. Future payment/auction/dealer tables are present in the schema only.
