# Sprint 5 — Search & Discovery Engine

Status: **implemented — awaiting approval**

## Scope

High-performance listing search and discovery. **No AI recommendations.**

## Endpoints

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/v1/search` | Public* |
| GET | `/v1/search/suggestions` | Public |
| GET | `/v1/search/trending` | Public |
| GET | `/v1/search/recent` | Bearer |
| POST | `/v1/search/save` | Bearer |
| GET | `/v1/search/saved` | Bearer |
| DELETE | `/v1/search/saved/:id` | Bearer |

\* Optional Bearer attaches analytics to the user.

## Filters

Keyword (FTS) · category · brand · model · governorate · city · price · year · mileage · fuel · transmission · body · drive · condition · featured · verified

## Sorting

`NEWEST` · `OLDEST` · `PRICE_LOW` · `PRICE_HIGH` · `MOST_VIEWED` · `MOST_RELEVANT`

## Migration

`packages/database/prisma/migrations/20260723164854_search_discovery_engine`

Adds `SavedSearch`, `SearchEvent`, `PopularKeyword`, discovery indexes, and Postgres GIN FTS on listing translations.

## Docs

- Architecture / query strategy: [`docs/search-architecture.md`](./search-architecture.md)
- OpenAPI notes: [`docs/openapi-search.md`](./openapi-search.md)
- Swagger: `/docs`
