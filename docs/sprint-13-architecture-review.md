# Sprint 13 — Architecture Review

## Confirmed strengths

- Nest DDD modules (auth, listings, search, media) with repository boundaries
- Mobile feature folders + repository + React Query (no business logic in screens)
- Shared success/error API envelope
- Discovery lean projection for public search
- Soft-delete conventions and owner checks on mutations

## Structural issues

### 1. Dual media pipelines
`MediaAsset` (`/v1/media`) and `ListingMedia` (`/v1/listings/:id/media`) are disconnected. Sell wizard uploads via Media platform then attaches by `r2Key` to ListingMedia — bypassing virus/process guarantees on the listing row.

**Recommendation:** Attach by `mediaAssetId` and copy validated metadata server-side.

### 2. Workers / outbox
Docs mention `DomainEventOutbox` / async workers; schema/workers are not implemented. Media cleanup currently uses an in-process hourly timer (`MediaCleanupService`) suitable for Alpha only.

### 3. Search relevance
`MOST_RELEVANT` is heuristic (featured/verified/views), not `ts_rank`. Acceptable for Alpha; document for beta.

### 4. Mobile offline
AsyncStorage caches exist per feature; `OfflineBanner` is duplicated. Prefer a single network provider.

## Module map (Alpha)

```
apps/api
  domains/{auth,listings,search,media,users,...}
  infrastructure/{prisma,r2,redis,firebase}
  shared/{filters,interceptors,pipes}

apps/mobile
  features/{auth,home,listing-detail,sell,my-listings}
  lib/{api,auth-events,navigation}
  app/ (Expo Router screens)
```

## Decision record (Sprint 13)

| Decision | Rationale |
| --- | --- |
| In-process media cleanup | No queue infra yet; Alpha volume is low |
| Fire-and-forget search analytics | Latency > exact real-time keyword counts |
| Visibility in SQL for listings search | Correct totals; closes future sellerId leak |
