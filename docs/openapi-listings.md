# OpenAPI — Listings

Live: `http://localhost:4000/docs`  
JSON: `http://localhost:4000/docs/json`

## Create

`POST /v1/listings`

```json
{
  "categoryId": "...",
  "cityId": "...",
  "title": "Toyota Camry 2020",
  "description": "Clean car...",
  "primaryPrice": 15000,
  "primaryCurrencyId": "...",
  "carDetails": { "brandId": "...", "modelId": "...", "year": 2020 }
}
```

## Search

`GET /v1/listings?page=1&pageSize=20&cityId=...&brandId=...&minPrice=0&maxPrice=20000&keyword=camry&sortBy=createdAt&sortOrder=desc&isFeatured=true&mine=false`

## Status

`PATCH /v1/listings/:id/status`

```json
{ "status": "PENDING" }
```

## Media

`POST /v1/listings/:id/media`

```json
{
  "mediaType": "IMAGE",
  "r2Key": "listings/abc/1.jpg",
  "sortOrder": 0,
  "imageBase64": optional
}
```

`DELETE /v1/listings/:id/media/:mediaId`
