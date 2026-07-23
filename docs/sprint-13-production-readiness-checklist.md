# Sprint 13 — Production Readiness Checklist (Alpha)

Use this before inviting internal testers.

## Environment

- [ ] `DATABASE_URL` points to Alpha Postgres (migrations applied including Sprint 13 indexes)
- [ ] JWT secrets set (`ACCESS` / refresh TTL documented)
- [ ] Firebase Admin credentials configured on API
- [ ] Cloudflare R2 credentials + public base URL configured
- [ ] Redis optional but recommended (health checks)
- [ ] API `NODE_ENV=production`, helmet/throttle enabled
- [ ] Mobile `EXPO_PUBLIC_API_URL` points to Alpha API
- [ ] Mobile `EXPO_PUBLIC_AUTH_MODE=api` only on builds with Firebase phone wired; else `mock` for Expo Go smoke

## Security

- [x] Error responses do not leak Prisma internals
- [x] Refresh rotation is transactional
- [x] Listing visibility enforced in query for non-owners
- [ ] Confirm R2 buckets are private by default; public URLs only for PUBLIC assets
- [ ] Rotate any secrets used in local `.env` samples before sharing builds
- [ ] Review Firebase authorized domains / App Check plan for beta

## Data & media

- [x] Soft-delete listing media triggers R2 best-effort cleanup
- [x] Stale `PENDING_UPLOAD` reaper registered (`MediaCleanupService`)
- [ ] Seed catalog IDs exist for create-listing in API mode
- [ ] Spot-check orphan R2 keys after a day of Alpha traffic

## Functional smoke (critical flows)

- [ ] Login → OTP → profile setup → home
- [ ] Browse / search / listing detail / gallery (video pause on swipe)
- [ ] Create listing wizard → submit PENDING
- [ ] My listings: edit, archive, soft-delete, mark sold, stats sheet
- [ ] Logout clears session; killed app restores session when refresh valid
- [ ] Force expired refresh → user lands unauthenticated (no stuck authenticated UI)

## Observability

- [ ] API logs include `requestId`
- [ ] Capture p95 for `/v1/search` and `/v1/listings?mine=true` once under load
- [ ] Alert on 5xx rate (even a simple log drain)

## Docs for testers

- [ ] Share mock vs API auth mode expectations
- [ ] Known gaps: listing engagement stats placeholders; notifications stub; dealer deferred

## Sign-off

| Role | Name | Date |
| --- | --- | --- |
| Eng | | |
| Product | | |
