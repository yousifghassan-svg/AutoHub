# Sprint 10 — Listing Details Experience

Status: **approved**

## Goal

Complete vehicle details experience on mobile using existing backend listing APIs.

## Screens

| Screen | Route |
| --- | --- |
| Listing details | `app/listing/[id].tsx` |
| Full-screen gallery | `app/listing/gallery.tsx` |

Gallery supports image pinch/double-tap zoom, swipe pages, video playback (`expo-av`), and a **360 viewer placeholder**.

## APIs

| Method | Path | Use |
| --- | --- | --- |
| GET | `/v1/listings/:id` | Full detail + `ListingMedia[]` |
| GET | `/v1/listings` | Similar listings (same category) |

Related media = `media` on the listing detail response (R2 keys → `EXPO_PUBLIC_MEDIA_BASE_URL`).  
`GET /v1/media/:id` is **not** used — that ID space is `MediaAsset`, not `ListingMedia`.

## Sections / actions

Gallery · Price · Vehicle info · Description · Specs · Seller card · Location · Safety tips · Similar listings  

Call · WhatsApp · Share · Favorite (placeholder) · Report (local queue)

## Gaps (API)

- No seller phone/profile on listing detail → Call/WhatsApp enabled in **mock** mode only; production shows a short note.
- No report / favorite endpoints → favorite alert + local report queue.

## Architecture

`features/listing-detail/` — repository, mappers, cache, hooks, reusable gallery / seller / spec components. Screens stay thin.

## Tests

```bash
npx pnpm@9.15.0 --filter @autohub/mobile test
npx pnpm@9.15.0 --filter @autohub/mobile typecheck
```

## Docs

[`docs/mobile-listing-details-architecture.md`](./mobile-listing-details-architecture.md)
