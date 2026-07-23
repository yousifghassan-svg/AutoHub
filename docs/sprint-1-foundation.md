# Sprint 1 — Foundation

Scope: monorepo scaffolding, tooling, infra wiring. **No business logic.**

## Delivered

- pnpm + Turborepo workspace
- Apps: `api`, `web`, `admin`, `mobile`
- Packages: `ui`, `config`, `types`, `utils`, `database`
- PostgreSQL via Docker on host port **5433**
- Redis via Docker on **6379**
- Prisma listing-hub schema (revised): Currency FKs, normalized vehicle specs, MediaType, audit/SEO/stats/verification fields, search indexes
- ESLint flat config + Prettier + shared TypeScript base
- Per-app `.env.example` files

## Out of scope (later sprints)

Listings, auth, plates, messaging, admin moderation, i18n product UI, payments.
