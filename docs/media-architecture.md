# Media Platform Architecture (Sprint 6)

## Independence

`MediaAsset` / `MediaVariant` live outside the Listing aggregate. Any domain can own media via:

- `ownerModule` (string, e.g. `listings`, `dealers`, `users`)
- `ownerEntityId` (string FK-like reference in the owning module)

Listings’ existing `ListingMedia` remains for listing-specific gallery rows; the platform service is the reusable upload/processing layer.

## Flow

```mermaid
sequenceDiagram
  participant Client
  participant API as Media API
  participant R2 as Cloudflare R2
  participant DB as PostgreSQL

  Client->>API: POST /media/presign
  API->>DB: MediaAsset PENDING_UPLOAD
  API-->>Client: signed PUT URL + asset id
  Client->>R2: PUT bytes
  Client->>API: POST /media/complete
  API->>R2: GET object (optional)
  API->>API: virus scan hook
  API->>API: image/video processing
  API->>R2: PUT variants
  API->>DB: READY + MediaVariant rows
```

Alternate: `POST /media/upload` streams multipart through the API (direct upload).

## Storage

`R2StorageService`:

- `putObject` / `deleteObject` / `getObjectBuffer`
- `createPresignedUploadUrl` / `createPresignedDownloadUrl`
- `getPublicUrl` for `PUBLIC` assets

## Security

| Control | Implementation |
| --- | --- |
| AuthZ | JWT + `MEDIA_UPLOAD` / `MEDIA_READ` / `MEDIA_DELETE` |
| Ownership | Owner or ADMIN/SUPER_ADMIN |
| MIME allow-list | Per media type |
| Max size | Per media type |
| Rate limit | `@Throttle` on mutating routes |
| Virus scan | `VIRUS_SCANNER` DI token (default no-op) |

## Image pipeline

sharp: rotate (EXIF orientation) → resize variants → JPEG mozjpeg + WebP → metadata stripped by default.

## Video pipeline

- Validate MIME/size
- Duration via MP4 `mvhd` parse or client `durationSeconds`
- `extractPoster` hook ready for ffmpeg later
