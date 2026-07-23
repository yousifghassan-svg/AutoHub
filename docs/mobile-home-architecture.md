# Mobile Home Architecture

## Data flow

```
Home / Explore / Search screens
        │
        ▼
useHomeQueries (React Query)
        │
        ▼
HomeRepository
   ├─ GET /v1/listings
   ├─ GET /v1/search/trending
   ├─ GET /v1/search/recent
   └─ RecentlyViewedStore (AsyncStorage)
        │
        ▼
mapListingToCard → ListingCardModel
```

Screens never call `fetch`. Mapping (title locale, media key → URL, mileage/year) lives in `features/home/domain/mappers.ts`.

## Image caching

`ListingCard` uses `expo-image` with `cachePolicy="memory-disk"`.  
URLs are built as `EXPO_PUBLIC_MEDIA_BASE_URL + '/' + thumbnailKey` (API returns R2 keys only).

## Pagination

- Latest + Explore + Search use `useInfiniteQuery` (`page` / `totalPages` from listings API).
- Pull-to-refresh invalidates home query keys.

## Offline

- Shared `HttpClient` throws `ApiError` with `offline: true`.
- Home shows `OfflineBanner` + error/empty states; mock repository still works offline in mock auth mode.

## Gaps (by design this sprint)

- No listing detail route (tap records recently viewed only).
- No favorites API (heart is a placeholder).
- No AI recommendations (placeholder section).
- No categories CRUD — chips come from trending (fallback: static mock categories).
