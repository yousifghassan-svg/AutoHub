# AutoHub Admin Backend

Sprint 15 admin platform for NestJS + Prisma. All routes are under the global prefix `/v1` and require a Bearer JWT unless noted.

## Roles & RBAC

| Role | Purpose |
|------|---------|
| `SUPER_ADMIN` | Full access (bypasses permission checks) |
| `ADMIN` | Users, listings, plates, dealers, reports, settings, stats |
| `MODERATOR` | Listing moderation, plates, reports, stats |
| `DEALER_MANAGER` | Dealer CRM + read users/listings/stats |
| `SUPPORT` | Users (read), listings (read), reports, stats |

Permissions used by admin routes:

- `admin:access` — required for all `/admin/*` routes
- `users:read` / `users:write`
- `listings:read` / `listings:moderate` / `listings:delete`
- `plates:read` / `plates:write`
- `dealers:manage`
- `reports:read` / `reports:write`
- `settings:read` / `settings:write`
- `stats:read`
- `media:*` (existing media module)

Every mutating admin action writes an `AdminAuditLog` row (`actor`, `action`, `module`, `ip`, `userAgent`, `before`, `after`, `createdAt`).

Security already wired globally: Helmet, `ValidationPipe` (whitelist + transform), throttling (`ThrottlerGuard`), JWT + `RolesGuard` + `PermissionsGuard`.

---

## Dashboard

### `GET /v1/admin/dashboard`

**Auth:** `admin:access` + `stats:read`

Returns:

```json
{
  "totalUsers": 0,
  "totalDealers": 0,
  "totalCars": 0,
  "totalPlates": 0,
  "activeListings": 0,
  "soldListings": 0,
  "pendingListings": 0,
  "archivedListings": 0,
  "todaysListings": 0,
  "thisMonthListings": 0,
  "totalViews": 0,
  "totalFavorites": 0
}
```

---

## Listings management

Base path: `/v1/admin/listings`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/` | `listings:read` | Paginated list with filters |
| `GET` | `/:id` | `listings:read` | Listing detail |
| `PATCH` | `/:id` | `listings:moderate` | Update title/price/status/featured/etc. |
| `DELETE` | `/:id` | `listings:delete` | Soft-delete |
| `POST` | `/:id/approve` | `listings:moderate` | → `ACTIVE` (+ `publishedAt`) |
| `POST` | `/:id/reject` | `listings:moderate` | → `ARCHIVED` |
| `POST` | `/:id/archive` | `listings:moderate` | → `ARCHIVED` |
| `POST` | `/:id/feature` | `listings:moderate` | Feature (respects `featuredLimit`) |
| `POST` | `/:id/unfeature` | `listings:moderate` | Remove feature |

### Filters (`GET /`)

Query params (aliases accepted):

- `city` / `cityId`
- `brand` / `brandId`
- `model` / `modelId`
- `status`
- `seller` / `sellerId`
- `dealer` / `dealerId`
- `price` / `minPrice` / `maxPrice`
- `year`
- `plate`
- `categoryCode`
- `q`, `page`, `pageSize`

---

## Plate management

Base path: `/v1/admin/plates`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/` | `plates:read` | Search plates |
| `GET` | `/:id` | `plates:read` | Plate listing detail |
| `POST` | `/` | `plates:write` | Create plate listing |
| `PATCH` | `/:id` | `plates:write` | Update plate fields |
| `DELETE` | `/:id` | `plates:write` | Soft-delete / archive |

### Search filters

- `governorate`
- `code` (region code)
- `letter` (series)
- `number`
- `plateType`
- `formatCode`
- `q`

**Duplicate rule:** creating/updating to an `ACTIVE` normalized plate that already exists returns `409 Conflict`.

---

## Dealer management

Base path: `/v1/admin/dealers`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/` | `dealers:manage` | List dealers |
| `GET` | `/:id` | `dealers:manage` | Detail + statistics |
| `POST` | `/` | `dealers:manage` | Create organization |
| `PATCH` | `/:id` | `dealers:manage` | Update |
| `DELETE` | `/:id` | `dealers:manage` | Soft-delete |

### Statistics on `GET /:id`

```json
{
  "statistics": {
    "cars": 0,
    "sold": 0,
    "followers": 0,
    "views": 0
  }
}
```

---

## User management

Base path: `/v1/admin/users`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/` | `users:read` | List/filter users |
| `GET` | `/:id` | `users:read` | User detail |
| `PATCH` | `/:id` | `users:write` | Update profile/role |
| `DELETE` | `/:id` | `users:write` | Soft-delete |
| `POST` | `/:id/suspend` | `users:write` | Suspend |
| `POST` | `/:id/activate` | `users:write` | Activate |
| `POST` | `/:id/verify-dealer` | `users:write` | Set role `DEALER`, verify org |

Query filters: `q`, `role`, `status`, `page`, `pageSize`.

---

## Reports

### User-facing

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/v1/reports` | `reports:write` | Report a listing (`listingId`, `reason`, `details?`) |

Reasons: `SPAM`, `FRAUD`, `INAPPROPRIATE`, `DUPLICATE`, `WRONG_CATEGORY`, `OTHER`.

### Admin

Base path: `/v1/admin/reports`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/` | `reports:read` | List reports (`status` filter) |
| `POST` | `/:id/resolve` | `reports:write` | Resolve (`resolution?`) |
| `POST` | `/:id/reject` | `reports:write` | Reject (`resolution?`) |
| `POST` | `/:id/ban-listing` | `reports:write` | Archive listing + resolve report |

---

## Settings

Base path: `/v1/admin/settings`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/` | `settings:read` | Get (upserts defaults) |
| `PATCH` | `/` | `settings:write` | Update |

Fields:

- `siteName`
- `maintenanceMode`
- `featuredLimit`
- `maxImages`
- `defaultCurrency`
- `contactInfo` (JSON)
- `socialLinks` (JSON)

---

## Statistics

### `GET /v1/admin/stats`

**Auth:** `admin:access` + `stats:read`

Query: `range=daily|weekly|monthly` (default `monthly`)

Returns:

- counts: `listingsCreated`, `usersCreated`, `searchEvents`, `sold`
- `topBrands`
- `topCities`
- `topSearched`
- `topDealers`

---

## Audit log

### `GET /v1/admin/audit-logs`

**Auth:** `admin:access`

Query filters: `page`, `pageSize`, `q`, `actorId`, `action` (contains, case-insensitive), `module` (exact), `from`, `to` (ISO dates).

Returns paginated `AdminAuditLog` rows with optional `actor` (id, displayName, phone, email, role).

Table: `AdminAuditLog`

Logged modules/actions include:

- `listings` — update, delete, approve, reject, archive, feature, unfeature
- `plates` — create, update, delete
- `dealers` — create, update, delete
- `users` — update, delete, suspend, activate, verify_dealer
- `reports` — resolve, reject, ban_listing
- `settings` — update

---

---

## Staff login (dev)

### `POST /v1/auth/staff-login`

**Auth:** none (public, gated by `AUTH_ALLOW_STAFF_LOGIN`; legacy `ALLOW_STAFF_DEV_LOGIN` dual-read in 0.2; always off in production)

Body: `{ "phone": "+9647700090002" }` (E.164)

Returns the same token envelope as `POST /v1/auth/login`. User must have a staff role (`SUPPORT`, `DEALER_MANAGER`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`) and `admin:access` permission.

Errors: `403` if dev login disabled or non-staff; `401` if phone not found.

---

## Seed staff accounts

`pnpm db:seed` creates:

| Role | Phone | Email |
|------|-------|-------|
| SuperAdmin | `+9647700090001` | `superadmin@seed.autohub.iq` |
| Admin | `+9647700090002` | `admin@seed.autohub.iq` |
| Moderator | `+9647700090003` | `moderator@seed.autohub.iq` |
| DealerManager | `+9647700090004` | `dealer.manager@seed.autohub.iq` |
| Support | `+9647700090005` | `support@seed.autohub.iq` |

Firebase UIDs: `seed:admin-*`. Also upserts `SiteSettings` id `default`.

---

## Migration

```
packages/database/prisma/migrations/20260723200000_admin_platform/migration.sql
```

Adds `DEALER_MANAGER` / `SUPPORT` roles, `ListingReport`, `AdminAuditLog`, `SiteSettings`, and dealer org enrichment columns.

Apply:

```bash
pnpm --filter @autohub/database exec prisma migrate deploy
pnpm --filter @autohub/database exec prisma generate
pnpm db:seed
```

---

## Swagger

With the API running (`pnpm --filter @autohub/api dev`), open:

`http://localhost:4000/docs`

Admin tags: `admin-dashboard`, `admin-listings`, `admin-plates`, `admin-dealers`, `admin-users`, `admin-reports`, `admin-settings`, `admin-stats`, `reports`.

Screenshots (captured from local Swagger UI):

- `docs/screenshots/swagger-admin-dashboard.png` — plates / dealers / users
- `docs/screenshots/swagger-admin-listings.png` — reports / settings / stats
