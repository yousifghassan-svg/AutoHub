# Release 0.5 — Marketplace & Listings

**Version:** `0.5.x`  
**Codename:** Marketplace & Listings  
**Status:** Architecture complete — **awaiting approval** before implementation (P5-1+)  
**Production intent:** First **production-ready** marketplace (harden 0.4 closed-beta baseline; do not rebuild)  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)  
**Architecture:** [`../architecture/marketplace-architecture.md`](../architecture/marketplace-architecture.md)

**Frozen dependencies (do not refactor):**

| Freeze | Tag / doc |
| --- | --- |
| Authentication | `auth-0.2-freeze` · [`RELEASE_0.2_AUTHENTICATION.md`](./RELEASE_0.2_AUTHENTICATION.md) |
| Search & Discovery | `search-0.4-freeze` · [`RELEASE_0.4_SEARCH_DISCOVERY.md`](./RELEASE_0.4_SEARCH_DISCOVERY.md) |

**Closed-beta baseline:** [`RELEASE_0.4_MARKETPLACE.md`](./RELEASE_0.4_MARKETPLACE.md) (invite-only GO; production hardening is this release).

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
| Objective | One coherent draft story |
| Deliverables | Align web optional server DRAFT with mobile create; deprecate duplicate sell draft store usage |
| Files | Web/mobile draft stores; docs |
| API | Existing create/update DRAFT |
| DB | None (no Draft table) |
| Test plan | v2 round-trip; v1 remap; DRAFT not public |
| Acceptance | Refresh/login safe; dual stores not used for new flows |
| Risks | Data loss on bad clear — careful publish cleanup |
| Complexity | **M** |

### P5-6 — Listing Completeness

| Field | Detail |
| --- | --- |
| Objective | Real publish gates + checklist |
| Deliverables | Replace noop publish validator; shared Next/Publish checklist |
| Files | `validators/publish.ts`, plugin `canSubmit`, publish UI |
| API / DB | None |
| Test plan | Completeness matrix vehicle/plate |
| Acceptance | Cannot PENDING when required missing |
| Risks | Plate vs vehicle rule bleed |
| Complexity | **M** |

### P5-7 — Review & Publish

| Field | Detail |
| --- | --- |
| Objective | Production review + reliable PENDING |
| Deliverables | Preview closer to detail; submit error/retry; quality tips |
| Files | `PublishStep.tsx`, previews, submit helpers |
| API | Existing create + status |
| DB | None |
| Test plan | Happy path + failure messaging |
| Acceptance | Preview critical fields; submit → PENDING; approve works |
| Risks | Partial attach on failure — clear errors |
| Complexity | **M** |

### P5-8 — My Listings

| Field | Detail |
| --- | --- |
| Objective | Manage UX polish |
| Deliverables | Web delete confirm (BUG-006); Action Registry unchanged |
| Files | `ListingOwnerActions.tsx`, `my-listings/page.tsx` |
| API / DB | None |
| Test plan | Confirm cancel/confirm; soft-delete |
| Acceptance | No accidental delete |
| Risks | Low |
| Complexity | **S** |

### P5-9 — Edit Listing

| Field | Detail |
| --- | --- |
| Objective | Edit parity with create |
| Deliverables | Edit loads listing → sell field sections → PATCH + media APIs |
| Files | `my-listings/[id]/edit/page.tsx`, shared sell fields |
| API | Existing PATCH vehicles/plates + media |
| DB | None |
| Test plan | Round-trip title/price/specs/media |
| Acceptance | No status smuggling; lifecycle respected |
| Risks | Scope creep into full wizard clone — reuse sections only |
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

## Acceptance Criteria (release-level)

- [ ] Architecture approved; P5-0 docs landed  
- [ ] BUG-004 sell `?next=` fixed  
- [ ] Seller cannot attach via bare `r2Key`  
- [ ] Primary/sortOrder consistent  
- [ ] Publish/completeness gates block incomplete PENDING  
- [ ] Quality score advisory on web review  
- [ ] Web delete confirms  
- [ ] Edit covers core vehicle/plate fields (not title/price only)  
- [ ] Mobile domain create still works  
- [ ] Auth + Search freezes untouched  
- [ ] Tag `marketplace-0.5-freeze` after audit PASS  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Accidental Search/Auth churn | Critical | Freeze rule; review diffs |
| Media trust half-fixed | High | P5-4 AC mandatory for freeze |
| Edit rewrite balloons | Medium | Reuse sections only (P5-9) |
| Draft data loss | Medium | Tests + careful clear-on-publish |
| Roadmap reference drift | Low | Grep pass in P5-0 |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| 0.2 Auth | Frozen identity |
| 0.3 Media platform | Presign/complete |
| 0.4 Marketplace closed beta | Baseline code |
| 0.4 Search freeze | Discovery unchanged |

**Blocks:** Confident 0.6 Messaging on real listings; 1.0 launch marketplace pillar  

---

## QA Checklist

- [ ] Vehicle sell → PENDING → approve → ACTIVE in search  
- [ ] Plate sell path  
- [ ] Unauth sell → login → return  
- [ ] Media reorder/primary  
- [ ] Incomplete publish blocked  
- [ ] Edit + delete confirm  
- [ ] Mobile domain create smoke  
- [ ] RTL smoke on sell/my-listings  

---

## Production freeze criteria

Mirror Auth/Search:

1. All in-scope AC checked or waived in writing.  
2. Related tests green; staging smoke done.  
3. No TODO/FIXME/HACK in touched sell/media/edit paths.  
4. No debug logging / temp flags.  
5. Deferred items only in backlog below.  
6. Status **FROZEN**; tag `marketplace-0.5-freeze`; `develop` synced.

---

## Deferred improvements (backlog only after freeze)

1. Full Expo sell host = web plugin parity.  
2. Persisted quality score / Search boost (needs Search unfreeze coordination).  
3. Seller member-since / listing count / MediaAsset avatars.  
4. Virus-scan productization beyond hook.  
5. Cross-device draft sync product.  
6. Pause label ≠ ARCHIVED rename.  
7. Admin reject-reason / queue UX polish.  

---

## Rollback Plan

1. Redeploy previous web/API known-good for sell/media.  
2. Do not drop Listing/Media tables.  
3. If attach policy breaks legacy admin tools, re-enable staff r2Key escape only.  
4. Keep Auth/Search builds unchanged.  
