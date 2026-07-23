# OpenAPI — Media

Live: `http://localhost:4000/docs`

## POST /v1/media/presign

```json
{
  "mediaType": "IMAGE",
  "mimeType": "image/jpeg",
  "byteSize": 204800,
  "filename": "car.jpg",
  "visibility": "PRIVATE",
  "ownerModule": "listings",
  "ownerEntityId": "..."
}
```

## POST /v1/media/upload

`multipart/form-data` with `file`, `mediaType`, optional `visibility`, `ownerModule`, `ownerEntityId`.

## POST /v1/media/complete

```json
{ "mediaId": "...", "fileBase64": "optional-when-r2-unavailable" }
```

## GET /v1/media/:id

Returns asset + `variants` + `urls` (public URL or signed GET).

## DELETE /v1/media/:id

Soft-deletes DB row and deletes R2 keys.
