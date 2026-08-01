# AutoHub API Standard

**Status:** Normative  
**Base path:** `/v1`  
**Docs UI:** `/docs` (Swagger)  
**Related:** [`standards/ARCHITECTURE.md`](./standards/ARCHITECTURE.md), [`api-ddd-architecture.md`](./api-ddd-architecture.md)

---

## 1. Goals

- Stable, versioned HTTP surface for web, admin, and mobile  
- Consistent envelopes for success and error  
- Domain-oriented routes that match Nest DDD modules  
- **Never invent client-facing endpoints that do not exist in the API**

---

## 2. Transport & cross-cutting pipeline

Order of concerns (as wired today):

1. Helmet security headers  
2. Compression  
3. CORS (`CORS_ORIGINS`)  
4. Request ID middleware  
5. Throttler guard  
6. Validation pipe (`whitelist` + `forbidNonWhitelisted`)  
7. Domain handlers  
8. Response interceptor **or** exception filter  

Health: `GET /v1/health`.

---

## 3. Response envelope (required)

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "…",
    "timestamp": "…"
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "…"
  },
  "meta": {
    "requestId": "…",
    "timestamp": "…"
  }
}
```

**Rules**

- Do not return bare payloads at the HTTP boundary.  
- Do not leak Prisma/internal stack messages to clients (map to safe status codes).  
- Known Prisma mappings used in project practice: unique conflict → 409, not found → 404, FK → 400.

---

## 4. Versioning

- All public REST routes live under `/v1`.  
- Breaking changes require a new version prefix or an additive/compatible change.  
- Prefer additive DTO fields with defaults over renames.

---

## 5. Authentication & authorization

### Auth flow

1. Client obtains Firebase ID token (phone OTP) — or local bypass in development only.  
2. `POST /v1/auth/login` with `{ idToken }` → access JWT + refresh token + user.  
3. `Authorization: Bearer <accessToken>` on protected routes.  
4. `POST /v1/auth/refresh` rotates refresh tokens (reuse of revoked token revokes family).  
5. `POST /v1/auth/logout` revokes refresh token(s).

### Token model

| Token | Type | Default lifetime |
| --- | --- | --- |
| Access | JWT HS256 | `JWT_ACCESS_TTL_SECONDS` (≈15m) |
| Refresh | Opaque; SHA-256 stored | `JWT_REFRESH_TTL_SECONDS` (≈30d) |

### Authorization

- Coarse: `@Roles(...)` against `UserRole`  
- Fine: `@Permissions(...)` against `Permission` enum (`resource:action`)  
- `SUPER_ADMIN` bypasses role checks but still carries full permission set  
- JWT guard reloads **active** user from DB (revoked/suspended users fail closed)

Deep dive: [`auth-architecture.md`](./auth-architecture.md), ADR 004.

---

## 6. Domain routing conventions

| Area | Pattern | Notes |
| --- | --- | --- |
| Vehicles | `/v1/vehicles`, `/v1/vehicles/search` | Always `MarketplaceDomain.VEHICLE` |
| Plates | `/v1/plates`, plate catalog subpaths | Always `MarketplaceDomain.PLATE` |
| Listings kernel | `/v1/listings/:id/media` etc. | Shared media bridge / compatibility |
| Media | `/v1/media/*` | MediaAsset lifecycle |
| Catalog / geo | `/v1/catalog/*`, locations/categories as implemented | Seed-backed reference data |
| Currencies | `/v1/currencies` | Public catalog |
| Auth | `/v1/auth/*` | Login/refresh/me/logout |
| Admin | `/v1/admin/*` | Staff-only |
| Communication | `/v1/…` chat/conversation routes as implemented | + Socket.IO gateway |

**Standard for new work:** put endpoints in the owning domain module. Do not pile vehicle/plate branching into unrelated controllers.

OpenAPI notes (partial, sprint-era): [`openapi-auth.md`](./openapi-auth.md), [`openapi-listings.md`](./openapi-listings.md), [`openapi-search.md`](./openapi-search.md), [`openapi-media.md`](./openapi-media.md). Swagger remains the live contract.

---

## 7. Validation

- Prefer class-validator DTOs on presentation layer.  
- Reject unknown properties (`forbidNonWhitelisted`).  
- Enforce string max lengths on free text as neighboring DTOs do.  
- Currency: accept `currencyCode` (preferred) with fallbacks documented in financial foundation notes; default market currency is IQD.

---

## 8. Pagination, filtering, sorting

Follow existing list/search query DTO patterns in vehicles/plates/search:

- Page + pageSize (or infinite-scroll cursors where already used by clients)  
- Price filters are **currency-scoped** — do not convert FX implicitly  
- Public discovery must not leak non-visible listings (ACTIVE for anonymous/public; owner/staff exceptions enforced in SQL/services)

---

## 9. Media API rules

1. Upload/process via `/v1/media` (MediaAsset).  
2. Attach to listing via listings media bridge.  
3. **Recommended standard (hardening):** attach by `mediaAssetId` after validation/virus-scan status — do not trust raw client `r2Key`/mime/size forever (known P0 backlog from security report).

---

## 10. Realtime

- Socket.IO is part of the API app (`@nestjs/websockets`).  
- Authn/authz for sockets must follow communication domain policies (participant or moderator).  
- Do not open an alternate websocket stack from clients.

---

## 11. Payments module

`domains/payments` exposes **provider interfaces/registry only** (Stripe, Zain Cash, Qi Card, cards, Apple/Google Pay placeholders).  

**Standard:** no live charge endpoints until an explicit payments sprint enables them behind flags and BUSINESS_RULES.

---

## 12. Error & status code practice

| Situation | Status |
| --- | --- |
| Validation failure | 400 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Missing resource | 404 |
| Conflict (unique) | 409 |
| Rate limited | 429 |
| Unexpected | 500 (generic message) |

Ownership vs existence (404 vs 403) is inconsistently mixed in places — prefer **not leaking existence** of others’ private drafts when changing behavior (align with neighbors; document if unifying).

---

## 13. Inconsistencies → standard

| Finding | Standard |
| --- | --- |
| Legacy `/v1/listings` create used by old mobile wizard | New clients use `/v1/vehicles` & `/v1/plates` |
| Dual media attach trust models | Move to MediaAsset-validated attach |
| Partial OpenAPI markdown vs Swagger | Swagger is source of truth; markdown is supplementary |
| Feature flags named in deployment docs not always present as code constants | Gate risky modules in config before enabling commerce |

---

## 14. Client contract rules

- Parse `success` / `error` envelope uniformly.  
- Send Bearer access token; implement refresh rotation.  
- Mock auth modes must not call protected APIs expecting success in production configuration.  
