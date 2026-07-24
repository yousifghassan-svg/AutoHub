# Sprint 17 — Media Platform

Enterprise media across API, web, and admin. Builds on the Sprint 6 platform (`MediaAsset` / `MediaVariant` / R2) and bridges it to listing galleries.

## Endpoints

### Owner media (`/v1/media`)

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/v1/media` | `media:read` | List own assets (page, pageSize, mediaType, status) |
| `POST` | `/v1/media/presign` | `media:upload` | Pending asset + signed PUT URL |
| `POST` | `/v1/media/upload` | `media:upload` | Multipart upload + process |
| `POST` | `/v1/media/complete` | `media:upload` | Finalize presigned upload |
| `POST` | `/v1/media/:id/replace` | `media:upload` | Re-upload bytes; keep asset id |
| `POST` | `/v1/media/:id/restore` | `media:delete` | Restore within 72h soft-delete window |
| `GET` | `/v1/media/:id` | `media:read` | Metadata + variant URLs |
| `DELETE` | `/v1/media/:id` | `media:delete` | Soft-delete only (R2 kept for 72h) |

### Admin library (`/v1/admin/media`)

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/v1/admin/media` | `admin:access` + `media:read` | Library with filters + `storageUsage` |
| `DELETE` | `/v1/admin/media/:id` | `admin:access` + `media:delete` | Soft-delete |
| `POST` | `/v1/admin/media/:id/restore` | `admin:access` + `media:delete` | Restore |

Admin list query params: `page`, `pageSize`, `q`, `mediaType`, `status`, `unused` (no `ownerEntityId`), `duplicates` (checksum groups), `includeDeleted`.

Response includes `storageUsage: { totalBytes, assetCount }`.

### Listing media bridge

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/v1/listings/:id/media` | Attach via `mediaAssetId` and/or `r2Key`; supports `DOCUMENT` + `documentPurpose` |
| `PATCH` | `/v1/listings/:id/media/reorder` | `{ orderedIds: string[] }` — index 0 is primary |
| `POST` | `/v1/listings/:id/media/:mediaId/primary` | Set `sortOrder = 0`, shift others |
| `DELETE` | `/v1/listings/:id/media/:mediaId` | Soft-delete listing row only |

Listing media cap: **100** items. Primary is always `sortOrder === 0` (no separate `isPrimary` column).

`documentPurpose` values: `REGISTRATION` | `INSPECTION` | `OWNERSHIP` | `OTHER`.

## Client features

### Web (`apps/web`)

- `src/features/media/MediaUploader.tsx` — multi-file, drag & drop, client compress, progress/retry/cancel, primary + reorder
- `VehicleGallery.tsx` — thumbs, 360 badge, lightbox, zoom, keyboard, swipe, blur placeholders
- `MediaImage.tsx` — responsive `srcset` from variants
- Demo: `/media/demo`
- Listing detail uses `VehicleGallery` for non-plate listings

### Admin (`apps/admin`)

- Sidebar **Media** → `/media` (shortcut `g m`)
- Table: filename, type, status, size, owner, created
- Filters: search, type, status, unused, duplicates
- Storage usage card
- Delete / restore + thumbnail preview

## Soft-delete & restore

1. `DELETE` sets `deletedAt` + `status=DELETED` — **does not** remove R2 objects immediately.
2. `MediaCleanupService` reaps R2 after **72 hours**.
3. `POST .../restore` clears `deletedAt` and sets `status=READY` only inside that window.

## Virus scanner

`VIRUS_SCANNER` DI token remains; default provider is `NoOpVirusScanner` (returns `SKIPPED`). Replace with a real scanner in production without changing call sites.

## Image pipeline

sharp: EXIF rotate → JPEG/WebP variants (thumbnail/small/medium/large/webp) → ~20px JPEG `blurDataUrl` stored on `MediaAsset`.

## Acceptance screenshots

- `docs/screenshots/media-demo.png` — web uploader + gallery demo (`/media/demo`)
- `docs/screenshots/admin-media.png` — admin Media library (`/media`)
- `docs/screenshots/vehicle-gallery.png` — listing detail `VehicleGallery`
