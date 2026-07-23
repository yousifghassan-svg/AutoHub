# Sprint 11 — Create Listing Wizard

Status: **approved**

## Goal

Complete listing creation workflow on mobile using existing listings + media APIs.

## Flow

Category → Vehicle type → Vehicle details → Media → Location → Price → Description → Preview → Submit

## APIs

| Method | Path | Use |
| --- | --- | --- |
| POST | `/v1/listings` | Create DRAFT |
| PATCH | `/v1/listings/:id` | Autosave / update draft |
| PATCH | `/v1/listings/:id/status` | Submit `{ status: "PENDING" }` |
| POST | `/v1/media/upload` | Multipart media upload |
| POST | `/v1/listings/:id/media` | Attach `r2Key` to listing |

Presign/complete are available on the API; the mobile client prefers **multipart upload** then attach.

## Features

- Wizard state machine (`wizardReducer`)
- Offline draft store (AsyncStorage) + resume
- Debounced autosave
- Per-step validation (Zod)
- Progress indicator
- Image / video picker + 360 placeholder
- Preview reuses Listing Details section components
- Create draft → submit for review

## Architecture

`features/sell/` — domain, draft store, sell repository, state machine, WizardProvider, step UI.  
Screens under `app/sell/` stay thin.

Mock auth mode runs the full wizard offline without the API.

## Gaps

- No catalog list APIs — wizard uses stable mock catalog IDs (API mode needs real seeded IDs / future catalog endpoints).
- PLATE / HEAVY_EQUIPMENT detail write not supported by create DTO.

## Tests

```bash
npx pnpm@9.15.0 --filter @autohub/mobile test
npx pnpm@9.15.0 --filter @autohub/mobile typecheck
```

## Docs

[`docs/mobile-create-listing-architecture.md`](./mobile-create-listing-architecture.md)
