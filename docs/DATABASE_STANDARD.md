# AutoHub Database Standard

**Status:** Normative  
**Package:** `@autohub/database` (`packages/database`)  
**Engine:** PostgreSQL 16 + Prisma  
**Related:** [`database-er.md`](./database-er.md), [`standards/ARCHITECTURE.md`](./standards/ARCHITECTURE.md)

---

## 1. Ownership

- All schema changes happen in `packages/database/prisma/schema.prisma`.  
- Migrations live in `packages/database/prisma/migrations/`.  
- Seed data in `packages/database/prisma/seed.ts`.  
- Apps must consume the generated client via `@autohub/database` — do not embed a second Prisma schema.

---

## 2. Core modeling rules

### Listing hub (ADR 002)

- Every marketplace item is one `Listing` row.  
- Category-specific attributes go in detail tables (`CarDetails`, `PlateDetails`, …).  
- Shared commerce/search/media/moderation attach to `Listing`, not to detail tables alone.

### Marketplace domain (Sprint 20)

- `Listing.domain` is `VEHICLE` | `PLATE`.  
- Domain APIs must not write the wrong domain value.  
- Future verticals either extend `MarketplaceDomain` carefully or follow an approved ADR before diverging from the hub.

### Currency (ADR 003 + financial foundation)

- Currencies are rows in `Currency` (code, localized names, symbol, decimalPlaces, `isDefault`, `sortOrder`).  
- Listings store `primaryPrice` + `primaryCurrencyId` (required in product practice); optional secondary pair + `fxRateSnapshot`.  
- **Never** hard-code IQD/USD-only columns for new price fields.  
- Seed keeps IQD as default market currency.

### i18n

- Listing copy variants use `ListingTranslation` with `LanguageCode` (`ar`, `ku`, `en`).  
- Reference entities that need localization follow existing `nameEn` / `nameAr` / `nameKu` patterns.

### Audit & soft delete

Important tables should include:

- `createdAt`, `updatedAt`  
- `createdById` / `updatedById` where already patterned  
- `deletedAt` for soft delete  

Do not hard-delete user content in product paths unless an existing admin hard-delete path already defines it.

---

## 3. Enums & status fields

Prefer Prisma enums already in schema:

- `ListingStatus`, `MarketplaceDomain`, `UserRole`, `VerificationStatus`, `PlateVerificationStatus`, commerce enums (`OrderStatus`, `PaymentStatus`, `EscrowStatus`, `AuctionStatus`, `SubscriptionStatus`), media enums, chat enums.

**Do not** introduce parallel stringly-typed status columns when an enum exists.

Note: product docs sometimes say `PENDING_REVIEW` / `EXPIRED` / `REMOVED`; **schema truth** uses `PENDING`, `ARCHIVED`, `REJECTED`, `SOLD`, etc. New code must follow **schema enums**.

---

## 4. Migrations

### Local

```bash
pnpm docker:up
pnpm db:generate
pnpm --filter @autohub/database exec prisma migrate dev
pnpm db:seed
```

Local Postgres URL uses host port **5433** (see `.env.example`).

### Production / CI

- CI runs `prisma migrate deploy` against service Postgres.  
- Use `migrate deploy` in staging/prod — not `migrate dev`.  
- Seed is for reference data (currencies, geo, catalogs) — never assume seed creates real users in production without an explicit ops step.

### Rules

1. One logical change per migration when possible.  
2. Expansive additive migrations preferred over destructive ones.  
3. Backfill data in migration/seed when adding required FKs (see currency backfill precedent).  
4. Do not reset local DB without explicit human approval.

---

## 5. Indexing & search

- Keep indexes that support public discovery: category/domain, city, price, status, featured, createdAt, brand/model on detail tables.  
- Visibility rules for public search belong in query layers (ACTIVE for anonymous); indexes must support those filters.  
- Do not add unbounded free-text columns without length constraints at the API edge.

---

## 6. Future commerce tables

Schema already includes `Order`, `OrderItem`, `Payment`, `Escrow`, `Auction`, `AuctionBid`, `Subscription`, `SubscriptionPlan`, `DealerOrganization`, `DealerMember`.

**Standard**

- Treat these as **scaffolding** until a product sprint activates them.  
- Do not partially wire live payments in random domains.  
- Keep listing hub stable; commerce overlays reference `Listing`.

---

## 7. Seed content expectations

Current seed provides:

- Currencies (IQD default, USD, …)  
- Categories (car, plate, motorcycle, truck, heavy equipment; schema may also list PARTS/RENTAL)  
- Iraq + governorates/cities  
- Spec reference rows (fuel, transmission, drive, body, color, engine, condition)  
- Common brands/models  

If sell UI does not expose a category yet (e.g. PARTS/RENTAL), do not invent API write paths for it without product approval.

---

## 8. Inconsistencies → standard

| Finding | Standard |
| --- | --- |
| Older docs mention `DomainEventOutbox` / workers | Do not document as implemented until present in schema + code |
| Lifecycle names differ between `domain.md` and Prisma enums | Prisma enums win |
| Dual media tables | Prefer MediaAsset as source of truth for upload validation |
| PARTS/RENTAL in enum, absent from sell UIs | Keep dormant until a domain + UI plugin ships |

---

## 9. Checklist for schema PRs

- [ ] Migration included and named clearly  
- [ ] Seed updated if reference data required  
- [ ] `@autohub/database` generate/build still works  
- [ ] API/client types updated if exported shapes change  
- [ ] No destructive drop without explicit approval  
