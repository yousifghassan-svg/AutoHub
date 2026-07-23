# Sprint 9 — Home Experience

Status: **approved**

## Goal

Main AutoHub home experience on mobile using existing listings/search APIs. No chat, payments, AI, or dealer features.

## Screens

| Screen | Route |
| --- | --- |
| Home | `app/(tabs)/index.tsx` |
| Explore | `app/(tabs)/explore.tsx` |
| Search Entry | `app/(tabs)/search.tsx` |
| Notifications Placeholder | `app/(tabs)/notifications.tsx` |
| Profile Placeholder | `app/(tabs)/account.tsx` |

## Home sections

Search bar · Categories · Featured · Latest (infinite) · Recently viewed (local) · Recommended placeholder · Quick actions

## APIs

| Method | Path | Use |
| --- | --- | --- |
| GET | `/v1/listings` | Featured (`isFeatured=true`), latest, explore, search keyword |
| GET | `/v1/search/trending` | Categories (no categories CRUD API) |
| GET | `/v1/search/recent` | Recent search chips (Bearer; empty if unavailable) |

## Listing card

Image (`expo-image` cache) · price · currency · title · location · mileage · year · verified · featured · favorite placeholder

## Architecture

`features/home/` — repository, mappers, React Query hooks, reusable `ListingCard` / rails / sections. Screens stay thin.

Mock mode (`EXPO_PUBLIC_AUTH_MODE=mock`) serves local demo listings so Home works without the API.

## Tests

```bash
npx pnpm@9.15.0 --filter @autohub/mobile test
npx pnpm@9.15.0 --filter @autohub/mobile typecheck
```

## Docs

[`docs/mobile-home-architecture.md`](./mobile-home-architecture.md)
