# Sprint 6 — Media Platform

Status: **approved**

## Scope

Reusable, module-agnostic media service (Cloudflare R2). Independent of Listings.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/v1/media/presign` | Pending asset + signed PUT URL |
| POST | `/v1/media/upload` | Direct multipart upload |
| POST | `/v1/media/complete` | Finalize presign + process |
| GET | `/v1/media/:id` | Metadata + URLs |
| DELETE | `/v1/media/:id` | Soft delete + R2 cleanup |

## Types

`IMAGE` · `VIDEO` · `MEDIA_360` · `DOCUMENT`  
Visibility: `PUBLIC` | `PRIVATE`

## Processing

- Images: thumbnails (320/640/1280/1920), WebP, EXIF strip (sharp), compression
- Video: duration (MP4 mvhd / optional client), poster hook
- Virus scan: injectable hook (`VIRUS_SCANNER`, default no-op skip)
- MIME + max size validation + throttled endpoints

## Linking to other modules

Use `ownerModule` + `ownerEntityId` (e.g. `listings` / listing id). Listings can attach by media id later without Media depending on Listings.

## Migration

`packages/database/prisma/migrations/20260723165825_media_platform`

## Docs

- [`docs/media-architecture.md`](./media-architecture.md)
- [`docs/openapi-media.md`](./openapi-media.md)
- Swagger `/docs`
