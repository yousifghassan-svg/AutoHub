# OpenAPI — Search

Live: `http://localhost:4000/docs`  
JSON: `http://localhost:4000/docs/json`

## GET /v1/search

Example:

```
GET /v1/search?q=camry&brandId=...&cityId=...&minPrice=5000&maxPrice=20000&minYear=2018&maxYear=2024&featuredOnly=true&sort=MOST_RELEVANT&page=1&pageSize=20
```

Sort enum: `NEWEST` | `OLDEST` | `PRICE_LOW` | `PRICE_HIGH` | `MOST_VIEWED` | `MOST_RELEVANT`

## GET /v1/search/suggestions?q=toy

Returns mixed suggestion objects: `BRAND` | `MODEL` | `CITY` | `PLATE` | `KEYWORD`.

## GET /v1/search/trending?days=7&limit=10

Returns `{ brands, models, categories }` with `searchCount`.

## Saved searches

`POST /v1/search/save` body:

```json
{
  "name": "Erbil Camry",
  "query": "camry",
  "filters": { "q": "camry", "cityId": "...", "brandId": "..." },
  "sort": "NEWEST",
  "notify": false
}
```
