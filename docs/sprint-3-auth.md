# Sprint 3 — Authentication & Authorization Foundation

Status: **implemented — awaiting approval before Sprint 4**

## Scope

Identity only. No listings, categories, or business CRUD.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/v1/auth/login` | Public | Firebase phone ID token → JWT + refresh |
| POST | `/v1/auth/refresh` | Public | Rotate refresh token → new JWT pair |
| POST | `/v1/auth/logout` | Bearer | Revoke refresh token(s) |
| GET | `/v1/auth/me` | Bearer | Current user profile |

## Flow

1. Mobile/web completes **Firebase Phone Authentication**.
2. Client sends Firebase ID token to `POST /auth/login`.
3. API verifies token via Firebase Admin (`phone_number` required).
4. User profile is created on first login (`UsersService.findOrCreateFromFirebase`).
5. API issues:
   - **JWT access token** (short-lived, signed with `JWT_ACCESS_SECRET`)
   - **Opaque refresh token** (stored hashed in `RefreshToken`)
6. Protected routes use `Authorization: Bearer <accessToken>`.

## RBAC

Roles: `USER` · `DEALER` · `MODERATOR` · `ADMIN` · `SUPER_ADMIN`

Permissions are derived from role (see `domains/auth/domain/permissions.ts`).

Guards (global):

- `JwtAuthGuard` — validates access token (`@Public()` bypass)
- `RolesGuard` — `@Roles(...)`
- `PermissionsGuard` — `@Permissions(...)`

Decorators:

- `@CurrentUser()`
- `@Roles()`
- `@Permissions()`
- `@Public()`

## Audit

`AuthAuditLog` records:

- `LOGIN`
- `LOGOUT`
- `TOKEN_REFRESH`

## Database migration

`packages/database/prisma/migrations/20260723162813_auth_rbac_foundation`

Adds `RefreshToken`, `AuthAuditLog`, and updates `UserRole`.

## Env

See `apps/api/.env.example` for JWT + Firebase Admin variables.

## Docs / OpenAPI

- Swagger UI: `/docs`
- OpenAPI JSON: `/docs/json`
- Architecture: [`docs/auth-architecture.md`](./auth-architecture.md)
- OpenAPI notes: [`docs/openapi-auth.md`](./openapi-auth.md)

## Tests

```bash
npx pnpm@9.15.0 --filter @autohub/api test
```

Includes unit tests (permissions, guards, AuthService) and HTTP integration tests for the four auth routes.
