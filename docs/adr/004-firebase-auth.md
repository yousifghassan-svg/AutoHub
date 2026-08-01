# ADR 004: Firebase Auth + Postgres Users

## Status

Accepted

## Context

Phone OTP is the primary auth method for Iraq. Business roles and seller profiles must live in our database.

## Decision

Firebase issues identity tokens. Nest verifies tokens and upserts `User` by `firebaseUid`.

Non-Firebase login for local/staging:

- `AUTH_ALLOW_DEV_LOGIN` → `POST /v1/auth/dev-login`
- `AUTH_ALLOW_STAFF_LOGIN` → `POST /v1/auth/staff-login`

Both are **forced off** when `NODE_ENV=production` (cannot override). Legacy `ALLOW_STAFF_DEV_LOGIN` is dual-read in Release 0.2 with a deprecation warning and will be removed in Release 0.3.

There is no `AUTH_DEV_BYPASS` flag in the API.

## Consequences

No custom OTP stack in v1; Postgres remains source of truth for authorization.
