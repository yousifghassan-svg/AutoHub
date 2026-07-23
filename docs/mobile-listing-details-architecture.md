# Mobile Listing Details Architecture

## Flow

```
Home / Explore / Search  →  /listing/:id
                                │
                                ▼
                     useListingDetail (React Query)
                                │
                                ▼
                     ListingDetailRepository
                       ├─ GET /v1/listings/:id
                       ├─ offline DetailCache (AsyncStorage)
                       ├─ getMedia() → detail.media
                       └─ GET /v1/listings?categoryCode=… (similar)
                                │
                                ▼
                     ListingDetailModel (mapped)
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   MediaGallery          SpecList / SellerCard   ActionBar
          │
          ▼
   /listing/gallery  (zoom / video / 360 placeholder)
```

## Progressive images

- List gallery uses `thumbUrl` via `expo-image` (`memory-disk` cache).
- Full-screen prefers full `url` with placeholder transition.
- Offline: last successful detail JSON is served from `DetailCache`.

## Reusable pieces

| Component | Role |
| --- | --- |
| `MediaGallery` | Swipe preview strip |
| `ZoomableImage` | Pinch + double-tap zoom |
| `VideoPlayer` | `expo-av` controls |
| `Viewer360Placeholder` | Reserved 360 slot |
| `SellerCard` | Seller summary |
| `SpecRow` / `SpecList` | Spec key/value rows |
| `ActionBar` | Call / WhatsApp / Share / Favorite / Report |
| `ReportSheet` | Local report reasons |

## Deep link

Share message uses `autohub://listing/{id}` (scheme already in `app.json`).
