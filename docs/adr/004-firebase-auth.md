# ADR 004: Firebase Auth + Postgres Users

## Status

Accepted

## Context

Phone OTP is the primary auth method for Iraq. Business roles and seller profiles must live in our database.

## Decision

Firebase issues identity tokens. Nest verifies tokens and upserts `User` by `firebaseUid`. Local `AUTH_DEV_BYPASS` enables development without Firebase credentials.

## Consequences

No custom OTP stack in v1; Postgres remains source of truth for authorization.
