# Sprint 12 — My Listings & Listing Management

Status: **approved**

## Goal

Let sellers manage the full lifecycle of their listings on mobile.

## Screens

- **My Listings** (`app/my-listings/index.tsx`) with status tabs:
  All · Drafts · Pending · Active · Reserved · Sold · Archived

Entry: Profile → **My listings**

## Actions

| Action | Behavior |
| --- | --- |
| Edit | `PATCH /v1/listings/:id` (title, description, price) |
| Duplicate | `POST /v1/listings` with copied fields → new DRAFT |
| Archive | `PATCH .../status` → `ARCHIVED` |
| Delete (soft) | `DELETE /v1/listings/:id` |
| Renew | No API — creates a fresh DRAFT copy |
| Mark as Sold | `PATCH .../status` → `SOLD` |
| Reserve / Unreserve | `RESERVED` / `ACTIVE` |
| Submit for review | `PENDING` (from DRAFT) |
| View statistics | Sheet: views, favorites (+ placeholders for phone/WhatsApp/shares) |

## APIs

| Method | Path |
| --- | --- |
| GET | `/v1/listings?mine=true` (+ optional `status`, pagination) |
| PATCH | `/v1/listings/:id` |
| PATCH | `/v1/listings/:id/status` |
| DELETE | `/v1/listings/:id` |

## Stats

| Field | Source |
| --- | --- |
| Views | `viewsCount` |
| Favorites | `favoritesCount` |
| Phone / WhatsApp / Shares | DB only — UI shows `—` until API exposes them |

## Requirements

Pull to refresh · infinite pagination · skeletons · offline cache · empty states

## Architecture

`features/my-listings/` — repository, cache, hooks, reusable `StatusTabs` + `ManagedListingCard`.

## Tests

```bash
npx pnpm@9.15.0 --filter @autohub/mobile test
npx pnpm@9.15.0 --filter @autohub/mobile typecheck
```

## Docs

[`docs/mobile-my-listings-architecture.md`](./mobile-my-listings-architecture.md)
