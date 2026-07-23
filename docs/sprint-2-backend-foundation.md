# Sprint 2 — Backend Foundation

Status: **implemented — awaiting approval before business endpoints**

## Scope

NestJS API foundation using Domain-Driven Design. No business CRUD. No domain controllers.

## Folder structure

```
apps/api/src/
  main.ts
  app.module.ts
  config/                      # Zod environment validation
  shared/                      # Filters, interceptors, middleware, pipes
  infrastructure/
    config/                    # ConfigModule + AppConfigService
    logger/                    # AppLoggerService
    database/                  # Prisma / PostgreSQL
    redis/                     # Redis (+ memory fallback)
    firebase/                  # Firebase Admin (prepared)
    storage/                   # Cloudflare R2 (prepared)
    health/                    # Only HTTP endpoint in this sprint
    swagger/                   # OpenAPI setup
  domains/
    common|auth|users|listings|categories|locations|
    vehicle-catalog|media|search|notifications|dealers|admin
```

## Domain modules (shells)

| Module | Responsibility (later) |
| --- | --- |
| Common | Shared domain primitives |
| Auth | Firebase token verification / session |
| Users | Profiles & preferences |
| Listings | Listing hub aggregate |
| Categories | Category catalog |
| Locations | Country / governorate / city |
| VehicleCatalog | Brands, models, spec refs |
| Media | Media orchestration via R2 |
| Search | Listing search / filters |
| Notifications | Notification ports |
| Dealers | Dealer orgs |
| Admin | Moderation / back-office |

## Shared infrastructure delivered

- Config module + Zod env validation
- Logger (`AppLoggerService`)
- Global exception filter
- Global validation pipe
- Global response interceptor (`success` / `data` / `meta`)
- Request ID middleware (`x-request-id` + `x-correlation-id`)
- Rate limiting (`@nestjs/throttler`)
- Security headers (`helmet`)
- CORS + compression
- Health check module (`GET /v1/health`)
- Swagger / OpenAPI (`/docs`, `/docs/json`, `/docs/yaml`)

## Integrations (prepared only)

| Integration | Status |
| --- | --- |
| PostgreSQL / Prisma | Connected via `PrismaService` |
| Redis | Connected when `REDIS_URL` set; else memory fallback |
| Firebase Auth | Initializes Admin SDK when credentials present; idle otherwise |
| Cloudflare R2 | Initializes S3 client when credentials present; idle otherwise |

## Explicitly out of scope

- Domain controllers / routes
- CRUD use cases
- Auth guards on business routes
- Signed upload APIs
- Search indexing workers

## Verify locally

```bash
npx pnpm@9.15.0 --filter @autohub/api typecheck
npx pnpm@9.15.0 --filter @autohub/api test
npx pnpm@9.15.0 --filter @autohub/api dev
# GET http://localhost:4000/v1/health
# OpenAPI http://localhost:4000/docs
```
