# Release 0.5 — Production Report

**Status:** Normative freeze record  
**Date:** 2026-08-04  
**Release:** [`RELEASE_0.5_MARKETPLACE.md`](./RELEASE_0.5_MARKETPLACE.md)  
**Tag:** `marketplace-0.5-freeze`

---

## Architecture summary

Release 0.5 hardened the closed-beta marketplace **without rebuilding** the listing hub.

| Pillar | Outcome |
| --- | --- |
| Sell host | Listing-generic `SellWizard` + vehicle/plate plugins |
| Modes | `create` \| `edit` only — edit reuses the same steps/validators/media |
| Draft | `@autohub/utils` listing-draft engine; create key vs edit-scoped keys |
| Quality | `@autohub/utils` listing-quality; `canPublish` gates PENDING |
| Media | Platform `MediaUploader`; seller attach by READY owned `mediaAssetId` |
| Manage | My Listings dashboard + Action Registry; delete confirm |
| Lifecycle | Shared `listingContentEditBlockedMessage` for vehicle + plate content PATCH |

**Debt (non-blocking):** edit boot still probes vehicle/plate repos in the host; see tech debt TD-05-01.

---

## Security summary

| Area | Result |
| --- | --- |
| Ownership on manage/PATCH/media/status/delete | **PASS** (API `assertCanManage`) |
| Media trust (no seller bare `r2Key`) | **PASS** |
| Open redirect (`safe-next-path`) | **PASS** |
| JSON-LD stored XSS (SEC-001) | **PASS** — script-safe serialize |
| Plate SOLD/ARCHIVED content edit (SEC-002) | **PASS** — shared lifecycle rule |
| Status smuggling via content PATCH | **PASS** |
| Auth freeze integrity | **PASS** + written waiver for P5-1 `next` only |
| Search freeze integrity | **PASS** (untouched) |

Deferred hardening: base64 body caps, production AV beyond noop, fail-closed edit when `sellerId` null.

---

## Performance summary

| Area | Assessment |
| --- | --- |
| Draft autosave | 500ms debounce to localStorage — acceptable |
| Media sync | Attach/remove + reorder; may issue reorder even when unchanged |
| My Listings | Infinite query `pageSize` 20 — fine for seller volumes |
| Mine keyword | ILIKE contains — debt for large seller catalogs |
| Bundle | No new heavy frameworks; reuses media/sell host |

---

## Testing summary

| Suite | Scope |
| --- | --- |
| Web | `test:json-ld`, `test:edit-listing`, draft/quality/media/publish/my-listings/vehicle-sell |
| API | `listing-status`, `listings.service`, `plates.service` (incl. SEC-002 matrix) |
| Typecheck | Web + API green at freeze |
| Lint | Web: pre-existing warnings only; API: pre-existing `users.service` lint outside 0.5 |

Missing (deferred): Playwright e2e for ownership/media remove/status smuggling; staging smoke evidence.

---

## Known deferred items

See full numbered list in [`RELEASE_0.5_MARKETPLACE.md`](./RELEASE_0.5_MARKETPLACE.md) §Deferred and [`RELEASE_0.5_TECH_DEBT.md`](./RELEASE_0.5_TECH_DEBT.md).

Highlights: Expo sell host parity, quality persistence / search boost, AV productization, cross-device drafts, plugin-owned edit hydrate, e2e coverage.

---

## Production prerequisites (ops)

1. Staging smoke: vehicle/plate create → PENDING → ACTIVE; edit ACTIVE; delete confirm; media reorder/remove; login `?next=`.  
2. Confirm production env: Firebase/R2/DB; no auth bypass.  
3. Monitor `/v1/health`; keep Auth/Search freeze builds.  
4. Accept or schedule AV scanner beyond noop.  
5. Hotfixes only under `marketplace-0.5-freeze` discipline.

---

## Immutability

After tag push, Release 0.5 is **immutable except production hotfixes**. Enhancements go to later trains (0.6+) or explicit unfreeze.
