# RC-1 DB Schema Recovery

**Date:** 2026-07-25  
**Scope:** Restore missing Sprint 23 Communication/Notification PostgreSQL schema only (no API/business-logic changes).

## Root cause

Sprint 23 communication migration `20260725140000_sprint23_communication` existed under `packages/database/prisma/migrations/` but had **not been applied** to the local PostgreSQL database (`autohub` on `localhost:5433`). Communication/Notification APIs queried missing tables/enums and returned HTTP 500.

## Missing tables (before)

Prisma models present in schema but absent from DB (9):

- `Conversation`
- `ConversationParticipant`
- `ChatMessage`
- `UserBlock`
- `ConversationReport`
- `DealerFollow`
- `UserPresence`
- `DevicePushToken`
- `AppNotification`

Missing enums:

- `ChatMessageType`
- `ChatMessageStatus`
- `ConversationStatus`
- `AppNotificationType`
- `PushPlatform`

Schema-diff before: `prismaModelCount=57`, `dbTableCount=49`, `sprint23Applied=false`.

## Migrations applied

```
npx prisma migrate deploy
```

Applied:

- `20260725140000_sprint23_communication`

## Files changed

- **None** in application/API/business logic.
- **Added:** `packages/database/scripts/schema-diff.mjs` (read-only schema vs DB comparison helper used for this recovery).
- **Added:** `docs/rc1-db-schema-recovery.md` (this report).

## Database status after

- `node scripts/schema-diff.mjs`: `missingModels=[]`, communication `missingTables=[]`, `missingEnums=[]`, `sprint23Applied=true`, `dbTableCount=58`
- `npx prisma migrate status`: Database schema is up to date (exit 0)
- `npx prisma validate`: schema valid (exit 0)

## Seed

- Inspected `packages/database/prisma/seed.ts`: **no** communication/notification reference seed data.
- **Reseed skipped** (not required for empty table queries / list endpoints).

## Confirmation HTTP 500s resolved

API base: `http://localhost:4000`  
Auth: `POST /v1/auth/staff-login` with seed admin phone `+9647700090002` (Bearer JWT).  
Regular Firebase `POST /v1/auth/login` unavailable in this env (`idToken` → 503); staff JWT used for user-scoped routes (same tables).

| Endpoint | Auth | Status | Notes |
|----------|------|--------|-------|
| `GET /v1/admin/communication/stats` | staff Bearer | **200** | empty counters |
| `GET /v1/admin/communication/reports` | staff Bearer | **200** | empty page |
| `GET /v1/admin/communication/blocks` | staff Bearer | **200** | empty page |
| `GET /v1/notifications` | staff Bearer (user JWT) | **200** | empty page |
| `GET /v1/conversations` | staff Bearer (user JWT) | **200** | empty page |
| `GET /v1/users/me/blocks` | staff Bearer (user JWT) | **200** | empty items |

Unauthenticated user probes returned **401** (expected when no Bearer token), not 500.

## Command exit codes

| Step | Command | Exit code |
|------|---------|-----------|
| 1 | Load `DATABASE_URL` from `apps/api/.env` | 0 |
| 2a | `node scripts/schema-diff.mjs` (before) | 0 |
| 2b | `npx prisma validate` (before) | 0 |
| 2c | `npx prisma migrate status` (before) | **1** (pending migration reported) |
| 3 | `npx prisma migrate deploy` | 0 |
| 4a | `node scripts/schema-diff.mjs` (after) | 0 |
| 4b | `npx prisma migrate status` (after) | 0 |
| 4c | `npx prisma validate` (after) | 0 |
| 5 | Seed decision / skip | 0 (no seed run) |
| 6 | HTTP verification script | 0 |

