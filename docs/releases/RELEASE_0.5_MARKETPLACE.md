# Release 0.5 — Marketplace & Listings

**Version:** `0.5.x`  
**Codename:** Marketplace & Listings  
**Status:** **FROZEN** (2026-08-04)  
**Git tag:** `marketplace-0.5-freeze`  
**Baseline (auth freeze):** `auth-0.2-freeze`  
**Baseline (search freeze):** `search-0.4-freeze`  
**Freeze HEAD:** see tag `marketplace-0.5-freeze`  
**Production intent:** First **production-ready** marketplace (harden 0.4 closed-beta baseline; do not rebuild)  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)  
**Architecture:** [`../architecture/marketplace-architecture.md`](../architecture/marketplace-architecture.md)  
**Companions:** [`RELEASE_0.5_TECH_DEBT.md`](./RELEASE_0.5_TECH_DEBT.md) · [`RELEASE_0.5_LESSONS_LEARNED.md`](./RELEASE_0.5_LESSONS_LEARNED.md) · [`RELEASE_0.5_PRODUCTION_REPORT.md`](./RELEASE_0.5_PRODUCTION_REPORT.md)

> **Freeze rule:** Do not refactor Marketplace & Listings (sell wizard, draft engine, listing quality, media attach trust, My Listings manage, edit mode) unless a production bug is discovered.  
> Deferred items live only in this document’s deferred section and companion debt/lessons docs — do not reopen 0.5 for enhancements.

**Frozen dependencies (do not refactor):**

| Freeze | Tag / doc |
| --- | --- |
| Authentication | `auth-0.2-freeze` · [`RELEASE_0.2_AUTHENTICATION.md`](./RELEASE_0.2_AUTHENTICATION.md) |
| Search & Discovery | `search-0.4-freeze` · [`RELEASE_0.4_SEARCH_DISCOVERY.md`](./RELEASE_0.4_SEARCH_DISCOVERY.md) |

**Closed-beta baseline:** [`RELEASE_0.4_MARKETPLACE.md`](./RELEASE_0.4_MARKETPLACE.md) (invite-only GO; production hardening is this release).

### Written waiver — Auth surface for BUG-004 (P5-1)

Release 0.5 intentionally touched a **minimal** Auth client surface (`login-return` / OTP / profile-setup `next` passthrough) to close BUG-004. This is an approved exception to the Auth freeze for marketplace AC only. No Auth API, JWT, Firebase, or RBAC contract changes. Further Auth work remains frozen under `RELEASE_0.2_AUTHENTICATION.md`.

---

## Roadmap migration

| Prior train | New train |
| --- | --- |
| 0.4 Marketplace (closed beta) | Unchanged; Search sub-freeze remains |
| **0.5 Messaging** | **→ 0.6 Messaging** ([`RELEASE_0.6_MESSAGING.md`](./RELEASE_0.6_MESSAGING.md)) |
| **0.6 Payments** | **→ 0.7 Payments** ([`RELEASE_0.7_PAYMENTS.md`](./RELEASE_0.7_PAYMENTS.md)) |
| _(new)_ | **0.5 Marketplace & Listings** (this document) |
| _(new)_ | **0.8 Trust & Verification** ([`RELEASE_0.8_TRUST_VERIFICATION.md`](./RELEASE_0.8_TRUST_VERIFICATION.md)) |
| _(new)_ | **0.9 Dealer Platform** ([`RELEASE_0.9_DEALER_PLATFORM.md`](./RELEASE_0.9_DEALER_PLATFORM.md)) |
| 1.0 Public Launch | Updated dependencies |

Rationale: production marketplace quality is a hard prerequisite for public launch; messaging remains the next product train after listings are freeze-ready.

---

## Vision

AutoHub’s vehicle and plate marketplace is trustworthy enough for real sellers: complete listings, trusted media, correct lifecycle, and manage/edit flows that match create—built on the existing listing hub and sell plugins.

---

## Goals

- Production-grade sell → PENDING → moderate → ACTIVE.
- Trusted media attach and gallery primary/order.
- Real completeness gates + advisory quality score.
- Coherent draft story (client + `Listing.status=DRAFT`; no Draft table).
- Edit parity via reuse of sell fields.
- My Listings production polish (delete confirm, action fidelity).
- Freeze 0.5 with the same discipline as Auth and Search.

---

## Scope

Hardening and targeted refactor of existing marketplace surfaces (web-first, mobile-compatible). See capability matrix below.

## Out of scope

- Auth / Search refactors  
- Messaging (0.6), Payments (0.7), Trust (0.8), Dealers (0.9)  
- Prisma `Draft` table  
- Rebuild sell host / listing hub  
- ES / geo / AI ranking or AI copy  
- New verticals  

---

## Capability baseline

| Capability | Classification | 0.5 action |
| --- | --- | --- |
| Web sell host + VEHICLE/PLATE plugins | **Complete** | Keep; plugins-only extension |
| Price & location | **Complete** | Validation polish |
| Review & publish → PENDING | **Complete** | Gate on completeness |
| My Listings + Action Registry | **Complete** | Confirm / polish |
| Lifecycle API | **Complete** | No rebuild |
| Admin approve/reject | **Complete** | Optional UX later |
| Vehicle details (web vs mobile) | **Needs Hardening** | CAR catalog specs parity |
| Media manager | **Needs Hardening** | Primary = sortOrder 0; sync |
| Draft engine | **Needs Hardening** | Unify; no Draft table |
| Completeness / publish validators | **Needs Hardening** | Shared checklist; remove noop |
| Media `r2Key` trust | **Needs Hardening** | Prefer `mediaAssetId` |
| Sell `?next=` | **Needs Hardening** | `/login?next=/sell` |
| Delete confirmation (web) | **Needs Hardening** | Match mobile |
| Preview fidelity | **Needs Hardening** | Align sell ↔ detail |
| Edit listing vs sell wizard | **Needs Refactor** | Reuse sell fields |
| Mobile legacy `/sell/wizard` | **Needs Refactor** | Redirect/deprecate |
| Listing quality score | **Missing** | Derived score + tips |

---

## User journeys

Documented in [`marketplace-architecture.md`](../architecture/marketplace-architecture.md). Summary: seller create/manage; buyer browse via frozen search; moderator approve/reject.

---

## Domain / API / DB / clients

See architecture pack:

| Doc | Topic |
| --- | --- |
| [`marketplace-architecture.md`](../architecture/marketplace-architecture.md) | System map |
| [`listing-lifecycle.md`](../architecture/listing-lifecycle.md) | Status machine |
| [`sell-wizard.md`](../architecture/sell-wizard.md) | Host + plugins + edit |
| [`media-pipeline.md`](../architecture/media-pipeline.md) | Trust + gallery |
| [`draft-engine.md`](../architecture/draft-engine.md) | Client + DRAFT |
| [`listing-quality.md`](../architecture/listing-quality.md) | Completeness + score |

**DB:** Prefer zero migrations; no Draft model.  
**API:** Extend existing vehicles/plates/media/listings-media/status only.

---

## Web / mobile / AI / security / performance / testing

Covered in each architecture doc (cross-cutting). Normative freeze rules mirror Auth/Search: no temp flags, no debug logging, deferred list only.

---

## Implementation slices

Complexity: **S** ≤0.5d · **M** 0.5–2d · **L** 2–5d

### P5-0 — Architecture

| Field | Detail |
| --- | --- |
| Objective | Land docs + roadmap renumber; lock baseline |
| Deliverables | Architecture pack; this release; train renumber; 0.8/0.9 stubs |
| Files | `docs/releases/*`, `docs/architecture/*`, roadmap/backlog/checklist |
| API / DB | None |
| Test plan | Grep for stale 0.5 Messaging / 0.6 Payments links |
| Acceptance | Train matches migration table; freezes untouched |
| Risks | Missed references |
| Complexity | **S** |

### P5-1 — Sell Wizard Foundation

| Field | Detail |
| --- | --- |
| Objective | Harden host auth return without redesign |
| Deliverables | `?next=/sell` (BUG-004); draft restore smoke |
| Files | `apps/web/src/features/sell/SellWizard.tsx`, safe-next helpers |
| API / DB | None |
| Test plan | Unit safe-next; manual unauth→login→return |
| Acceptance | Return to `/sell`; drafts intact |
| Risks | Open redirect — use `safe-next-path` |
| Complexity | **S** |

### P5-2 — Vehicle Details

| Field | Detail |
| --- | --- |
| Objective | Web/mobile CAR field parity (catalog specs) |
| Deliverables | Fuel/transmission/body (etc. as API allows) on web step + validators |
| Files | `apps/web/src/features/vehicles/sell/*` |
| API | Existing `POST/PATCH /v1/vehicles` — no new endpoints preferred |
| DB | None if columns exist |
| Test plan | Validator units; submit payload fixture |
| Acceptance | Web CAR create sends same core specs as mobile |
| Risks | Over-scoping HE/truck — CAR-first |
| Complexity | **M** |

### P5-3 — Price & Location

| Field | Detail |
| --- | --- |
| Objective | Harden price/currency/city∈gov validation |
| Deliverables | Shared validators; clearer errors |
| Files | Sell step validators; optional API alignment |
| API / DB | None new |
| Test plan | IQD/USD matrix |
| Acceptance | Invalid price/location cannot advance/submit |
| Risks | Low |
| Complexity | **S** |

### P5-4 — Media Manager

| Field | Detail |
| --- | --- |
| Status | **Implemented — awaiting approval** |
| Objective | Trusted attach + gallery correctness (listing-generic platform media) |
| Deliverables | Primary = sortOrder 0; seller `mediaAssetId` only; staff-only r2Key; reuse `MediaUploader` |
| Files | `features/media/*`, `MediaStep`, listings `addMedia`, mobile sell attach |
| API | Tighten `POST /v1/listings/:id/media` (READY + ownership) |
| DB | None |
| Test plan | Ownership; primary/order; reject r2Key for sellers; client validation |
| Acceptance | No seller raw r2Key; cover image correct; no vehicle-only uploader |
| Risks | Legacy clients — staff-only escape |
| Complexity | **L** |

### P5-5 — Draft Engine

| Field | Detail |
| --- | --- |
| Status | **Implemented — awaiting approval** |
| Objective | One coherent listing-generic Draft Engine (platform service) |
| Deliverables | `@autohub/utils` listing-draft engine; web envelope + listingId sync; clear only on PENDING; deprecate mobile legacy wizard |
| Files | `packages/utils/src/listing-draft/*`, web draft-store/SellWizard, mobile create draft-store + wizard redirect |
| API | Existing create/update DRAFT (PATCH when listingId present) |
| DB | None (no Draft table) |
| Test plan | Engine migrate/revision; web adapter round-trip; v1 remap |
| Acceptance | Refresh/login safe; dual stores not used for new flows |
| Risks | Data loss on bad clear — careful publish cleanup |
| Complexity | **M** |

### P5-6 — Listing Quality & Completeness

| Field | Detail |
| --- | --- |
| Status | **Implemented — awaiting approval** |
| Objective | Listing-generic quality score + required/recommended/premium guidance |
| Deliverables | `@autohub/utils` listing-quality engine; plugin rule packs; publish checklist UI; PENDING gated on required only |
| Files | `packages/utils/src/listing-quality/*`, sell quality adapter/panel, vehicle/plate `quality-rules`, `canSubmit`, PublishStep |
| API / DB | None |
| Test plan | Required matrix; score tips; plate vs vehicle rule isolation |
| Acceptance | Cannot PENDING when required missing; draft save allowed; tips shown |
| Risks | Plate vs vehicle rule bleed |
| Complexity | **M** |

### P5-7 — Review & Publish

| Field | Detail |
| --- | --- |
| Status | **Implemented — awaiting approval** |
| Objective | Premium final-inspection review + calm publish flow |
| Deliverables | Review media/price/location/domain summary; quality tiers; confirm → progress → success (no scary dialogs) |
| Files | `PublishStep`, review/publish UI components, vehicle/plate previews, `publish-flow` helpers |
| API | Existing create + status (unchanged) |
| DB | None |
| Test plan | Friendly error copy; work-step helpers |
| Acceptance | Preview critical fields; send for review → success screen; draft save friendly |
| Risks | Partial attach on failure — clear friendly errors |
| Complexity | **M** |

### P5-8 — My Listings

| Field | Detail |
| --- | --- |
| Status | **Implemented — awaiting approval** |
| Objective | Modern seller manage dashboard (reuse list/status/delete APIs) |
| Deliverables | Status filters; manage cards (cover/price/status/updated/views/fav); search/sort; delete confirm (BUG-006); Preview/Continue draft/Archive; Duplicate coming-soon placeholder |
| Files | `my-listings/page.tsx`, `ManagedListingCard`, `ListingOwnerActions`, `listing-actions`, mappers/types |
| API / DB | None (existing `GET /v1/listings?mine=true`) |
| Test plan | Action registry labels; relative updated; delete confirm manual |
| Acceptance | No accidental delete; manage dashboard usable on mobile widths |
| Risks | Low |
| Complexity | **M** |

### P5-9 — Edit Listing

| Field | Detail |
| --- | --- |
| Objective | Edit parity with create |
| Deliverables | `SellWizard mode="edit"` hydrates listing → same steps → PATCH + media sync |
| Files | `SellWizard.tsx`, `my-listings/[id]/edit/page.tsx`, hydrate/sync helpers |
| API | Existing PATCH vehicles/plates + listing media (add/reorder/remove) |
| DB | None |
| Test plan | Hydrate round-trip; media sync deltas; edit submit never creates; draft key isolation |
| Acceptance | No status smuggling; lifecycle respected; create draft untouched |
| Risks | Legacy media without `mediaAssetId` not editable via uploader |
| Complexity | **L** |

### P5-10 — Production Audit & Freeze

| Field | Detail |
| --- | --- |
| Objective | Freeze like Auth/Search |
| Deliverables | Audit PASS; tag `marketplace-0.5-freeze`; deferred backlog only |
| Files | This doc freeze section; roadmap/backlog freeze note |
| API / DB | None |
| Test plan | Full P5 regression + staging smoke |
| Acceptance | Clean tree; tag pushed; freezes of 0.2/0.4 Search still intact |
| Risks | Shipping with open media trust — must close or waive in writing |
| Complexity | **M** |

---

## Slice status

| Slice | Status | Evidence |
| --- | --- | --- |
| P5-0 Architecture | **Done** | `da760d3` |
| P5-1 Sell foundation | **Done** | `514857d` (Auth waiver above) |
| P5-2 Vehicle details | **Done** | `843b45c` |
| P5-3 Price & location | **Done** | `083e637` |
| P5-4 Media Manager | **Done** | `b40bd97` |
| P5-5 Draft Engine | **Done** | `136518a` |
| P5-6 Listing quality | **Done** | `8b678cc` |
| P5-7 Review & publish | **Done** | `b0fde1f` |
| P5-8 My Listings | **Done** | `1c9c5e9` |
| P5-9 Edit Listing | **Done** | `dfe6eea` |
| P5-10 Audit blockers | **Done** | `adaa506` (SEC-001 / SEC-002) |
| P5-10 Freeze | **Done** | this commit + tag `marketplace-0.5-freeze` |

---

## Acceptance Criteria (release-level)

- [x] Architecture approved; P5-0 docs landed  
- [x] BUG-004 sell `?next=` fixed  
- [x] Seller cannot attach via bare `r2Key`  
- [x] Primary/sortOrder consistent  
- [x] Publish/completeness gates block incomplete PENDING  
- [x] Quality score advisory on web review  
- [x] Web delete confirms  
- [x] Edit covers core vehicle/plate fields (not title/price only)  
- [x] Mobile domain create still works (domain create path retained; Expo host parity deferred)  
- [x] Auth + Search freezes intact (Auth: written waiver for P5-1 `next` only; Search: untouched)  
- [x] Tag `marketplace-0.5-freeze` after audit PASS  

---

## Freeze audit (2026-08-04)

| Check | Result |
| --- | --- |
| Architecture (listing engine / plugins) | **PASS** (edit hydrate host leak = debt) |
| Security — media trust | **PASS** |
| Security — open redirect (`safe-next-path`) | **PASS** |
| Security — JSON-LD XSS (SEC-001) | **PASS** (`adaa506`) |
| Security — plate SOLD/ARCHIVED content edit (SEC-002) | **PASS** (`adaa506`) |
| Status smuggling via content PATCH | **PASS** |
| Performance (v1 seller volumes) | **PASS** |
| UX create / edit / manage / review | **PASS** |
| Code quality (TODO/FIXME/HACK in sell/media/listings) | **PASS** (none) |
| Database (no Draft table / no P5 migrations) | **PASS** |
| API consistency | **PASS** (shared content-edit lifecycle) |
| Testing (slice units + SEC specs) | **PASS** |
| Auth freeze (`auth-0.2-freeze`) | **PASS** + written waiver |
| Search freeze (`search-0.4-freeze`) | **PASS** |
| Working tree at freeze | Clean (after freeze commit) |

**Tests at freeze (engineering):** web `test:json-ld`, `test:edit-listing`, draft/quality/media/publish/my-listings suites; API `listing-status`, `listings.service`, `plates.service` (SEC matrix); web typecheck.

Full narrative: [`RELEASE_0.5_PRODUCTION_REPORT.md`](./RELEASE_0.5_PRODUCTION_REPORT.md).

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Accidental Search/Auth churn | Critical | Freeze rule; Auth waiver scoped to `next` only |
| Media trust half-fixed | High | Closed in P5-4 |
| Edit rewrite balloons | Medium | Closed in P5-9 (wizard reuse) |
| Draft data loss | Medium | Clear only on PENDING; edit draft key isolated |
| Legacy media without `mediaAssetId` | Medium | Deferred; document limitation |
| AV scan noop | Medium | Deferred / ops risk acceptance |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| 0.2 Auth | **FROZEN** — unchanged except P5-1 waiver |
| 0.3 Media platform | Presign/complete |
| 0.4 Marketplace closed beta | Baseline code |
| 0.4 Search freeze | **FROZEN** — discovery unchanged |

**Unblocks:** Confident 0.6 Messaging on real listings; 1.0 launch marketplace pillar  

---

## QA Checklist

- [x] Engineering: vehicle/plate sell validators + submit units  
- [x] Engineering: unauth sell → login `?next=` unit path  
- [x] Engineering: media trust + sync units  
- [x] Engineering: incomplete publish blocked (quality)  
- [x] Engineering: edit hydrate/sync + delete confirm actions  
- [ ] Staging smoke: create → PENDING → ACTIVE (ops)  
- [ ] Staging smoke: mobile domain create (ops)  
- [ ] Staging smoke: RTL sell/my-listings (ops)  

---

## Production freeze criteria

Mirror Auth/Search:

1. [x] All in-scope AC checked or waived in writing.  
2. [x] Related engineering tests green; staging smoke tracked as ops prerequisite.  
3. [x] No TODO/FIXME/HACK in touched sell/media/edit paths.  
4. [x] No debug logging / temp flags.  
5. [x] Deferred items only in backlog below + companions.  
6. [x] Status **FROZEN**; tag `marketplace-0.5-freeze`; `develop` synced.

---

## Deferred improvements (backlog only — do not implement during freeze)

1. Full Expo sell host = web plugin parity.  
2. Persisted quality score / Search boost (needs Search unfreeze coordination).  
3. Seller member-since / listing count / MediaAsset avatars.  
4. Virus-scan productization beyond hook.  
5. Cross-device draft sync product.  
6. Pause label ≠ ARCHIVED rename.  
7. Admin reject-reason / queue UX polish.  
8. Move edit hydrate/load into plugin contract (remove host vehicle/plate imports).  
9. Edit draft freshness / revision gate vs server.  
10. Fail-closed edit UI when `sellerId` missing.  
11. Cap base64 upload body lengths (AddMedia / CompleteMedia).  
12. Unify plate vs vehicle title/description MaxLength / MinLength.  
13. `@ForbidListingStatusOnContentUpdate` on listing/vehicle update DTOs (defense-in-depth).  
14. E2E: ownership 403, media remove round-trip, status smuggling.  
15. Sell progress / My Listings tabs ARIA polish.  
16. Duplicate listing API (UI coming-soon only).  
17. Browser history `?step=` sync for wizard.  
18. Quarantine dead `useListingMutations.create` → `POST /v1/listings`.  

---

## Rollback Plan

1. Redeploy previous web/API known-good for sell/media.  
2. Do not drop Listing/Media tables.  
3. If attach policy breaks legacy admin tools, re-enable staff r2Key escape only.  
4. Keep Auth/Search builds unchanged.  
5. Hotfix only under this freeze — no feature reopen.  
