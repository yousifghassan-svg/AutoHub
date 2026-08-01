# Release 0.1 — Foundation

**Version:** `0.1.x`  
**Codename:** Foundation  
**Production intent:** Internal / local platform baseline (not a public consumer launch)  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

---

## Goals

- Establish the AutoHub monorepo (pnpm + Turborepo) with runnable apps.  
- Deliver the PostgreSQL **listing hub** schema, migrations, and seed.  
- Stand up the NestJS DDD API shell (`/v1`, health, envelope, infra adapters).  
- Provide local Docker Postgres + Redis and documented developer bootstrap.  
- Encode hybrid-marketplace ADRs so later releases extend rather than rewrite.

---

## Features

| Area | Deliverable |
| --- | --- |
| Monorepo | `apps/api`, `apps/web`, `apps/admin`, `apps/mobile` scaffolds; `packages/*` |
| Database | Prisma schema: `Listing` hub, category details, geo, currencies, catalogs, soft-delete/audit fields; commerce tables as scaffolding |
| Seed | IQD/USD, Iraq geo, categories, vehicle specs/brands |
| API shell | Nest modules composition root, Swagger `/docs`, `GET /v1/health`, response envelope |
| Infra local | `tooling/docker` Postgres **5433** + Redis **6379** |
| Docs/ADRs | ADR 001–003 (hybrid marketplace, listing hub, dual currency/i18n) |

---

## Acceptance Criteria

- [ ] `pnpm docker:up` yields healthy Postgres + Redis  
- [ ] `pnpm db:generate` + migrate + `pnpm db:seed` succeed on empty DB  
- [ ] API starts and `GET /v1/health` returns success envelope  
- [ ] Swagger UI loads at `/docs`  
- [ ] Seed contains default currency IQD and Iraq geo/catalog rows  
- [ ] Listing hub models exist for cars/plates/motorcycles/trucks/heavy equipment detail tables  
- [ ] No production secrets committed; `.env.example` documents `DATABASE_URL` / `REDIS_URL`  
- [ ] CI can install, generate client, migrate deploy, and build foundation packages/apps as configured  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Early schema includes unused commerce tables | Medium | Treat as scaffolding; don’t expose live APIs yet |
| Migration rewrites during early iteration | High locally | Prefer additive migrations once shared; document resets as explicit ops only |
| Docs drift vs schema enum names | Medium | Prisma enums are source of truth ([`../BUSINESS_RULES.md`](../BUSINESS_RULES.md)) |
| Port conflicts (5433/6379/4000) | Low | Document in README / `.env.example` |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| Node `>=20`, pnpm `9.15.0` | Toolchain |
| Docker | Local Postgres/Redis |
| No Firebase/R2 required | Auth/media deferred to 0.2 / 0.3 |
| ADRs 001–003 accepted | Modeling constraints |

**Blocks:** Release 0.2+  

---

## QA Checklist

- [ ] Fresh clone → install → docker up → migrate → seed  
- [ ] API health + Swagger smoke  
- [ ] Prisma Studio (optional) shows seeded currencies/categories/cities  
- [ ] Web/admin/mobile **boot** (may be stubs) without crashing against documented env  
- [ ] Confirm `DomainEventOutbox` / workers are **not** assumed implemented  
- [ ] Confirm PARTS/RENTAL (if present in enum) are not required for this release’s UX  

---

## Rollback Plan

1. **App rollback:** Redeploy previous API/web/admin images/builds; foundation has minimal user traffic expectations.  
2. **Database:** If migration not applied to shared prod — drop/recreate only with explicit approval. If applied to a shared environment — restore Postgres from snapshot taken **before** migrate deploy; do not `migrate reset` in shared envs.  
3. **Data:** Seed is idempotent reference data; re-seed only after restore if needed.  
4. **Communication:** Announce environment unavailable; no consumer notification required for 0.1.  
