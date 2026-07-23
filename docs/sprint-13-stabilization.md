# Sprint 13 — Stabilization & Production Readiness

Status: **implemented — awaiting approval**

## Goal

Prepare AutoHub Alpha for internal production testing. **No new user features** — quality, reliability, security, and documentation only.

## What shipped

### Backend
- Standardized error responses (no Prisma/internal message leaks)
- Atomic refresh-token rotation
- Listing visibility enforced in SQL (correct pagination totals)
- Atomic listing update (translation + core fields)
- Lean list projection for `GET /listings`
- Search `trending`/`recent` DTOs
- Search analytics off the critical path
- Listing media R2 cleanup on remove; media delete soft-deletes first
- `MediaCleanupService` hourly reap of stale `PENDING_UPLOAD` + soft-deleted storage
- Index: `Listing(status, publishedAt DESC)`; dropped redundant unique-backed indexes

### Frontend
- Auth session sync on refresh failure (`auth-events`)
- Foreground session refresh
- Media upload retry + `failed` upload status persistence
- Safe back navigation for deep links
- Gallery video pause when inactive + FlatList window tuning
- Error states (not false empties) on Explore / Search / My Listings
- Accessibility: AppBar, Button busy/disabled, Input labels, key icon buttons
- `ListingCard` memoized; removed dead `ComingSoon`

### Testing
- Exception filter, auth refresh rotation, media cleanup, media upload retry, auth-events

## Deliverables

| Report | Path |
| --- | --- |
| Performance | [`sprint-13-performance-report.md`](./sprint-13-performance-report.md) |
| Security | [`sprint-13-security-report.md`](./sprint-13-security-report.md) |
| Architecture review | [`sprint-13-architecture-review.md`](./sprint-13-architecture-review.md) |
| Technical debt | [`sprint-13-technical-debt.md`](./sprint-13-technical-debt.md) |
| Production checklist | [`sprint-13-production-readiness-checklist.md`](./sprint-13-production-readiness-checklist.md) |

## Verify

```bash
npx pnpm@9.15.0 --filter @autohub/api test
npx pnpm@9.15.0 --filter @autohub/api typecheck
npx pnpm@9.15.0 --filter @autohub/mobile test
npx pnpm@9.15.0 --filter @autohub/mobile typecheck
```

Apply DB migration: `packages/database/prisma/migrations/20260723180000_sprint13_listing_indexes`
