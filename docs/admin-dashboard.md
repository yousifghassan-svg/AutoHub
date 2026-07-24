# AutoHub Admin Dashboard

Sprint 16 Next.js admin app at `apps/admin` (port **3001**).

## Prerequisites

1. API running: `pnpm --filter @autohub/api dev` → `http://localhost:4000`
2. Database seeded: `pnpm db:seed` (creates staff accounts)
3. Copy env: `cp apps/admin/.env.example apps/admin/.env.local`

## Login (staff dev mode)

Open **http://localhost:3001/login** and sign in with a seed phone:

| Role | Phone |
|------|-------|
| Super Admin | `+9647700090001` |
| Admin | `+9647700090002` |
| Moderator | `+9647700090003` |
| Dealer Manager | `+9647700090004` |
| Support | `+9647700090005` |

Quick-pick buttons on the login page fill these numbers. Successful login requires the `admin:access` permission (all seed staff roles have it).

Set `NEXT_PUBLIC_AUTH_MODE=staff` (default) for phone login via `POST /v1/auth/staff-login`.

## Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | KPI cards, top brands/cities/dealers charts, recent audit activity |
| `/listings` | Paginated table, status filter, bulk approve/reject/archive/feature/delete |
| `/listings/[id]` | Detail view, PATCH edit form, moderation actions |
| `/plates` | CRUD table with filters, create/edit drawer with live plate SVG preview + PNG/PDF export |
| `/dealers` | Dealer org list, create modal, soft delete |
| `/dealers/[id]` | Detail, edit form, statistics |
| `/users` | Search, role/status filters, suspend/activate/verify-dealer/delete, inline role PATCH |
| `/reports` | List reports, resolve/reject/ban-listing |
| `/statistics` | Daily/weekly/monthly range toggle, tops charts |
| `/settings` | GET/PATCH site settings |
| `/audit-logs` | Filterable audit timeline (module, action, actor, date range) |

## Keyboard shortcuts

- `g` then `d` / `l` / `p` / `e` / `u` / `r` / `s` / `t` / `a` — navigate sidebar
- `/` — focus search on list pages

## Screenshots

- `docs/screenshots/admin-login.png`
- `docs/screenshots/admin-dashboard.png`
- `docs/screenshots/admin-listings.png`
- `docs/screenshots/admin-plates.png`

## Run locally

```bash
pnpm --filter @autohub/api start   # or dev — must include staff-login
pnpm --filter @autohub/admin dev   # http://localhost:3001
```

Quality checks:

```bash
pnpm --filter @autohub/admin lint
pnpm --filter @autohub/admin typecheck
pnpm --filter @autohub/admin build
```
