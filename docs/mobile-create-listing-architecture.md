# Mobile Create Listing Architecture

## State machine

```
category → vehicleType → vehicleDetails → media
        → location → price → description → preview → submit
```

Events: `PATCH`, `NEXT`, `BACK`, `ADD_MEDIA`, `REMOVE_MEDIA`, `HYDRATE`, `RESET`  
Validation runs on `NEXT` via `validateStep`.

## Persistence

| Layer | Store |
| --- | --- |
| Offline draft | AsyncStorage `autohub.sell.drafts` |
| Remote draft | `POST/PATCH /v1/listings` (status DRAFT) |
| Media | `POST /v1/media/upload` → `POST /v1/listings/:id/media` |
| Submit | `PATCH /v1/listings/:id/status` `{ status: "PENDING" }` |

Autosave: WizardProvider debounces `saveDraftLocal` (~500ms) on every draft change.

## Preview

`draftToPreviewDetail` maps the wizard draft to `ListingDetailModel`, then Preview step renders the same gallery / specs / seller / safety components as Listing Details.

## Entry

- Home quick action **Sell a vehicle** → `/sell`
- `/sell` hub: start new or resume draft
- `/sell/wizard?localId=…` active wizard
