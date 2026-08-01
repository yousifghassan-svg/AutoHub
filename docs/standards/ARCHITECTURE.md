# AutoHub Architecture Standard

**Status:** Normative  
**Scope:** Current monorepo as implemented  
**Historical overview (unchanged):** [`../architecture.md`](../architecture.md)

---

## 1. Purpose

This document is the canonical system architecture for AutoHub. It describes what exists in the codebase today, the boundaries teams must respect, and known inconsistencies that standards should resolve over time.

---

## 2. Product shape

AutoHub is a **hybrid vehicle marketplace for Iraq**.

- **v1 product mode:** classifieds (listings + inquiry / chat). Payments stay off-platform for end users.
- **Platform intent:** the database and API are shaped for future payments, escrow, auctions, dealers, and adjacent verticals **without rewriting the listing hub** (see ADR 001–002).

Locales: Arabic-primary (`ar`, RTL), Kurdish (`ku`, RTL), English (`en`, LTR).

---

## 3. Monorepo topology

```
AutoHub/
├── apps/
│   ├── api/       NestJS modular monolith — HTTP /v1 + Socket.IO
│   ├── web/       Next.js 15 marketplace (port 3000)
│   ├── admin/     Next.js 15 operations UI (port 3001)
│   └── mobile/    Expo 52 / React Native consumer app
├── packages/
│   ├── database/  Prisma schema, migrations, seed
│   ├── types/     Shared TypeScript types
│   ├── utils/     Shared helpers (Money VO, etc.)
│   ├── config/    Shared config
│   ├── ui/        Web/admin UI kit
│   └── mobile-ui/ Expo design-system components
├── docs/          Standards, ADRs, sprint notes, OpenAPI notes
└── tooling/docker Postgres 16 + Redis 7
```

**Package manager:** pnpm `9.15.0` workspaces  
**Build orchestration:** Turborepo  
**Node:** `>=20`

---

## 4. Runtime stack

| Layer | Technology |
| --- | --- |
| API | NestJS 10, Passport JWT, Swagger, Throttler, Helmet, Socket.IO |
| Web / Admin | Next.js App Router, React 19, TanStack Query, Tailwind |
| Mobile | Expo Router, React 18.3 / RN 0.76, Zustand, React Query, Firebase client |
| Auth | Firebase Phone OTP → API JWT access + opaque refresh tokens |
| Data | PostgreSQL 16 + Prisma (`@autohub/database`) |
| Cache | Redis (`ioredis`) |
| Media | Cloudflare R2 (S3-compatible), Sharp processing |
| Local infra | `tooling/docker/docker-compose.yml` — Postgres **5433**, Redis **6379** |

---

## 5. API architecture (DDD modular monolith)

Composition root (`AppModule`):

1. `SharedModule` — HTTP envelope, filters, pipes, request id  
2. `InfrastructureModule` — config, logger, Prisma, Redis, Firebase, R2, health  
3. `DomainsModule` — domain Nest modules  
4. Global throttling guard  

### Layering (per domain)

```
presentation/   Controllers, DTOs, guards
application/    Use cases / services
domain/         Policies, transitions, permissions, pure rules
infrastructure/ Prisma repositories, adapters
```

**Dependency rule**

- Controllers must not contain business rules.
- Infrastructure must not depend on application services of other domains.
- Domains may share kernels (`common`) and infrastructure ports.

### Domain modules (current)

| Domain | Responsibility |
| --- | --- |
| `auth` / `users` | Login, refresh, RBAC, profiles |
| `vehicles` | Vehicle marketplace CRUD/search (domain=`VEHICLE`) |
| `plates` | Plate marketplace + plate catalog |
| `listings` | Shared listing kernel / media bridge / compatibility |
| `search` | Discovery / saved search (legacy + shared concerns) |
| `media` | MediaAsset pipeline, R2 uploads |
| `communication` | Conversations, chat, blocks, reports |
| `notifications` | In-app + push token registration |
| `dealers` | Dealer organizations / membership |
| `admin` | Dashboard, moderation, settings, audit |
| `currencies` | Public currency catalog |
| `payments` | Provider **interfaces only** (no live charges) |
| `categories` / `locations` / `vehicle-catalog` | Reference data |
| `common` | Cross-cutting domain helpers |

Deep dive: [`../api-ddd-architecture.md`](../api-ddd-architecture.md), [`../sprint-20-domain-separation.md`](../sprint-20-domain-separation.md).

---

## 6. Data architecture — listing hub

Every sellable item is a **`Listing`** row.

- Discriminator: `MarketplaceDomain` = `VEHICLE` | `PLATE`
- Category-specific details via class-table inheritance (`CarDetails`, `PlateDetails`, `MotorcycleDetails`, `TruckDetails`, `HeavyEquipmentDetails`)
- Dual currency via `Currency` FKs (`primaryPrice` / optional `secondaryPrice`)
- Soft delete + audit columns on important tables
- Future commerce tables exist in schema (`Order`, `Payment`, `Escrow`, `Auction`, `Subscription`) but are **not productized**

ER overview: [`../database-er.md`](../database-er.md)  
Standards: [`../DATABASE_STANDARD.md`](../DATABASE_STANDARD.md)

---

## 7. Client architectures

### Web (`apps/web`)

- App Router pages under `src/app/*`
- Feature folders under `src/features/*`
- Marketplace create flow: **domain-agnostic sell wizard** (`features/sell`) + domain plugins (`features/vehicles/sell`, `features/plates/sell`)
- Domain APIs preferred: `/v1/vehicles`, `/v1/plates`

### Admin (`apps/admin`)

- App Router with `(admin)` shell
- Feature folders for vehicles/plates/auth
- Consumes admin APIs under `/v1/admin/*`

### Mobile (`apps/mobile`)

- Expo Router under `app/`
- Production create flow: `src/features/create` → `/sell/vehicle`, `/sell/plate`
- Legacy unified wizard `features/sell` + `/sell/wizard` still present (listings API) — **not the target architecture**

---

## 8. Cross-cutting flows

### Auth

Firebase ID token → `POST /v1/auth/login` → access JWT + refresh token family. Postgres `User` is authorization source of truth. See [`../auth-architecture.md`](../auth-architecture.md), ADR 004.

### Media

`MediaAsset` (+ variants) via `/v1/media/*`, then attach to listings via `/v1/listings/:id/media`. Dual pipeline risk documented in sprint 13 review.

### Realtime

Socket.IO for chat/presence (communication domain). Clients use `socket.io-client`.

### Money

`@autohub/utils` `Money` VO — never compare mixed currencies; search/sort is currency-scoped (no silent FX).

---

## 9. Deployment topology (planned)

Documented in [`../deployment.md`](../deployment.md):

| Piece | Target |
| --- | --- |
| Web / Admin | Vercel (separate projects) |
| API | Railway / Fly.io — health `/v1/health` |
| Postgres | Neon / RDS `me-central-1` |
| Redis | Upstash or managed Redis |
| Mobile | EAS Build + EAS Update |

---

## 10. Inconsistencies → recommended standard

| Finding | Recommended standard |
| --- | --- |
| Dual media pipelines (`MediaAsset` vs `ListingMedia`) | Attach by validated `mediaAssetId` only; copy metadata server-side |
| Docs mention outbox/workers; async outbox not fully implemented | Treat in-process cleanup as Alpha-only; introduce outbox before scale |
| README calls admin a “shell”; admin UI is substantial | Keep README status in sync with shipped apps |
| Web/Admin React 19 vs Mobile React 18 | Do not force a single React major across RN; isolate shared UI packages |
| Legacy mobile `/sell/wizard` vs domain create wizards | New work uses `src/features/create` / domain APIs only |
| `DomainEventOutbox` mentioned in older architecture notes | Do not assume workers exist until schema + consumer ship |
| Historical `docs/architecture.md` / `docs/roadmap.md` lag shipped sprints | Use this file + [`ROADMAP.md`](./ROADMAP.md) as normative |

---

## 11. Extension rules (future domains)

To add a marketplace domain (e.g. Real Estate, Boats):

1. Add Prisma category/details (or domain discriminator) via migration — follow DATABASE_STANDARD.
2. Add Nest domain module with full DDD folders — never put rules in controllers.
3. Expose domain HTTP under `/v1/<domain>` — do not invent ad-hoc routes on unrelated modules.
4. Register a **sell plugin** on web (and equivalent mobile create feature) without modifying the sell wizard host beyond composition-root registration.
5. Keep commerce (orders/auctions/subscriptions) as overlays on `Listing`, not a rewrite of the hub.

---

## 12. Related documents

- [`../CODING_STANDARD.md`](../CODING_STANDARD.md)
- [`../API_STANDARD.md`](../API_STANDARD.md)
- [`../DATABASE_STANDARD.md`](../DATABASE_STANDARD.md)
- [`../BUSINESS_RULES.md`](../BUSINESS_RULES.md)
- [`../ADR_INDEX.md`](../ADR_INDEX.md)
- [`../AI_GUIDELINES.md`](../AI_GUIDELINES.md)
