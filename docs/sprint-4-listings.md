# Sprint 4 — Listings Engine

Status: **implemented — awaiting approval before Sprint 5**

## Scope

Listing lifecycle, media, validation, and search. No AI, payments, auctions, or chat.

## Endpoints

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/v1/listings` | Bearer | Create DRAFT |
| GET | `/v1/listings` | Public* | Search/filter/paginate |
| GET | `/v1/listings/:id` | Public* | Detail (non-ACTIVE requires owner/staff) |
| PATCH | `/v1/listings/:id` | Bearer | Owner or admin |
| DELETE | `/v1/listings/:id` | Bearer | Soft delete → ARCHIVED |
| POST | `/v1/listings/:id/media` | Bearer | IMAGE / VIDEO / 360_MEDIA |
| DELETE | `/v1/listings/:id/media/:mediaId` | Bearer | Soft delete media |
| PATCH | `/v1/listings/:id/status` | Bearer | Lifecycle transition |

\* Optional Bearer enriches visibility (`mine=true`, non-ACTIVE own listings).

## Status flow

`DRAFT → PENDING → ACTIVE → RESERVED → SOLD → ARCHIVED`

- Owner submits `DRAFT → PENDING`
- **Only moderator/admin** may `PENDING → ACTIVE`
- Soft delete sets `deletedAt` and status `ARCHIVED`

## Permissions

- Users: create/read/update/delete **own** listings
- Admins: manage all
- Moderators: `LISTINGS_MODERATE` for approval

## Media

- Types: `IMAGE`, `VIDEO`, `360_MEDIA` (DB: `MEDIA_360`)
- Thumbnail key always derived; optional `imageBase64` runs sharp resize for IMAGE
- Display order via `sortOrder`
- Soft delete only (`deletedAt`)

## Search filters

Pagination · sorting · city · governorate · category · brand · model · price range · status · featured · keyword · `mine`

## Migration

`packages/database/prisma/migrations/20260723163800_listings_lifecycle_status`

## Docs

- Architecture: [`docs/listings-architecture.md`](./listings-architecture.md)
- OpenAPI notes: [`docs/openapi-listings.md`](./openapi-listings.md)
- Swagger UI: `/docs`
