# Auth Architecture

## Components

```mermaid
sequenceDiagram
  participant Client
  participant Firebase as Firebase Phone Auth
  participant API as NestJS Auth
  participant DB as PostgreSQL

  Client->>Firebase: Phone OTP verify
  Firebase-->>Client: Firebase ID token
  Client->>API: POST /auth/login { idToken }
  API->>Firebase: verifyIdToken (Admin SDK)
  API->>DB: findOrCreate User
  API->>DB: store RefreshToken hash
  API->>DB: AuthAuditLog LOGIN
  API-->>Client: accessToken + refreshToken + user

  Client->>API: GET /auth/me (Bearer access)
  API->>DB: load active user
  API-->>Client: profile + role + permissions

  Client->>API: POST /auth/refresh { refreshToken }
  API->>DB: validate/rotate RefreshToken
  API->>DB: AuthAuditLog TOKEN_REFRESH
  API-->>Client: new token pair

  Client->>API: POST /auth/logout (Bearer)
  API->>DB: revoke RefreshToken(s)
  API->>DB: AuthAuditLog LOGOUT
```

## Token model

| Token | Format | Storage | Lifetime |
| --- | --- | --- | --- |
| Access | JWT (HS256) | Client only | `JWT_ACCESS_TTL_SECONDS` (default 15m) |
| Refresh | Opaque random | SHA-256 hash in `RefreshToken` | `JWT_REFRESH_TTL_SECONDS` (default 30d) |

Access JWT claims: `sub`, `role`, `permissions`, `firebaseUid`, `phone`.

Refresh rotation: each refresh revokes the previous token; reuse of a revoked token revokes the whole token family.

## DDD placement

```
domains/auth/
  domain/           permissions, types
  application/      AuthService
  infrastructure/   RefreshToken + AuthAudit repositories
  presentation/     AuthController, guards, DTOs

domains/users/
  application/      UsersService (profile init)
  infrastructure/   UserRepository
```

## Authorization model

- Role hierarchy for coarse checks (`@Roles`)
- Permission checks for fine-grained route protection (`@Permissions`)
- `SUPER_ADMIN` bypasses role checks; still carries full permission set

## Out of scope (later sprints)

- Social providers beyond phone
- Admin role assignment APIs
- Listing/moderation business endpoints
