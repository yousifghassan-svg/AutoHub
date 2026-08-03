# Release 0.4 RC — Go / No-Go Readiness Review

**Release:** `0.4.x` Marketplace  
**Review type:** Formal Go / No-Go (documentation only)  
**Branch baseline:** `develop` @ post–BUG-008 remediation (`a8869f1`)  
**Initial review date:** 2026-08-01  
**Reassessment date:** 2026-08-01 (after plate moderation + lifecycle + BUG-008)  
**Method:** Code inspection + prior RC-2 evidence + Sprint 4 stabilization + remediation commits. Live browser E2E for this pack remains **NOT TESTED** unless noted.  
**Related:** [`RELEASE_0.4_MARKETPLACE.md`](./RELEASE_0.4_MARKETPLACE.md) · [`RELEASE_0.4_BUG_BACKLOG.md`](./RELEASE_0.4_BUG_BACKLOG.md) · [`RELEASE_0.4_TECH_DEBT.md`](./RELEASE_0.4_TECH_DEBT.md) · [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

**Status legend**

| Status | Meaning |
| --- | --- |
| PASS | Verified working (code + prior runtime and/or this review) |
| FAIL | Broken or missing vs Release 0.4 intent |
| PARTIAL | Present but incomplete / parity gap |
| NOT TESTED | Not executed in this RC pass |

---

## 1. Executive summary

**Can AutoHub be demonstrated today?**  
**Yes.** Web browse (vehicles/plates), search, listing detail (Sprint 4 owner/visitor chrome), sell wizard, my-listings actions, and admin vehicle **and plate** moderation are present for a live demo on a local/staging stack.

**Can internal users test it?**  
**Yes.** Dev/staff login paths and seeded data support internal QA. Remaining caveats are mostly P1 UX (favorites local-only, sell login `next`, delete confirm, search URL sync) and thin multi-status seed fixtures.

**Can selected dealers / invited sellers use it?**  
**Yes — as a closed beta cohort on staging**, with conditions below. Vehicle and plate publish→PENDING→approve→ACTIVE paths exist in admin. Dealer multi-user platform remains out of 0.4; use hand-picked seller accounts.

**Can the public use it?**  
**No.** Production Firebase auth phases (C–E) are incomplete; favorites are not account-backed; public-beta checklist items remain open.

**What absolutely must be fixed before public use?**  
1. Production-capable consumer authentication (Firebase Phases C–E — Release 0.2; **BUG-002**).  
2. Live sign-off of visibility rules, sell→publish→approve→public, and owner lifecycle on staging.  
3. Favorites/account expectations clarified or server sync if promised to public users (**BUG-003**).  
4. Remaining P1 seller/moderator UX gaps as product requires.

### Decision history

| When | Decision | Overall |
| --- | --- | --- |
| Initial RC (Sprint 4) | **GO FOR INTERNAL TESTING** | 62% |
| After plate moderation + lifecycle enforcement | Internal testing retained; marketplace P0s clearing | ~72% (interim) |
| **This reassessment (BUG-008 closed)** | **GO FOR CLOSED BETA** | **75%** |

### Decision (this reassessment)

# GO FOR CLOSED BETA

| Score | Value | Δ vs initial RC |
| --- | --- | --- |
| **Overall readiness** | **75%** | +13 |
| Marketplace readiness | **86%** | +14 |
| Authentication readiness | **48%** | — |
| Admin readiness | **83%** | +25 |
| Mobile readiness | **55%** | — |
| Infrastructure readiness | **70%** | — |

**Not** NO-GO.  
**Not** GO FOR INTERNAL TESTING only (marketplace closed-beta P0s cleared).  
**Not** READY FOR PUBLIC BETA (auth + trust + live public checklist).

### Closed-beta conditions (required)

1. **Invite-only** staging (or equivalent non-public) environment — no open signup marketing.  
2. **Auth story agreed:** cohort uses approved staging auth (staff/dev and/or limited Firebase). Production public phone auth remains **BUG-002** / Release 0.2.  
3. **Smoke before first invite:** sell→PENDING→approve→public for **vehicle and plate**; owner cannot self-activate PENDING; non-ACTIVE hidden from guests.  
4. **Disclose known P1s** to the cohort (favorites local, sell `next`, delete confirm, search URL, admin listing redirect).  
5. **Re-issue Go/No-Go** before any public beta.

---

## 2. Go / No-Go decision detail

| Dimension | Score | Rationale |
| --- | --- | --- |
| Marketplace | 86% | Domains, search, sell, Sprint 4 owner UX; plate moderation path complete; P1 UX gaps remain |
| Authentication | 48% | JWT/RBAC + profile identity; prod Firebase client path incomplete; closed beta OK on staging modes |
| Admin | 83% | Vehicle + plate approve/reject; create≠publish for plates (PENDING); listing redirect + queue UX remain |
| Mobile | 55% | Prior sprints shipped create/manage; not re-validated in this RC pack |
| Infrastructure | 70% | Monorepo, Postgres, Redis patterns, health; ops/monitoring for public not fully proven here |
| **Overall** | **75%** | Marketplace/admin remediations landed; auth still caps public readiness |

### Recommendation

**GO FOR CLOSED BETA**

Invite a small seller/moderator cohort on staging under the conditions above. Do **not** open to the public until **BUG-002** and public-beta P1 gates are cleared and a follow-up Go/No-Go is recorded.

---

## 3. Release gates

Classification:

| Class | Meaning |
| --- | --- |
| **P0** | Release blocker for *any* external exposure beyond internal eng *(closed beta)* |
| **P0-public** | Blocks public beta only (may accept for closed beta with staging auth) |
| **P1** | Must fix before public beta |
| **P2** | Can ship closed beta with mitigation / disclosure |
| **P3** | Future improvement |

Full issue records: [`RELEASE_0.4_BUG_BACKLOG.md`](./RELEASE_0.4_BUG_BACKLOG.md).

### Gate summary

| ID | Class | Title | Status | Blocks |
| --- | --- | --- | --- | --- |
| G-01 | P0 | Plate PENDING has no admin approve/reject path | **CLOSED** (`7c52aac`) | — |
| G-02 | P0-public | Production consumer auth incomplete (Firebase C–E) | **OPEN** | Public beta |
| G-03 | P1 | Favorites device-local only | OPEN | Public beta trust |
| G-04 | P1 | Sell unauthenticated redirect drops return URL | OPEN | Seller conversion |
| G-05 | P1 | Search filters not synced to URL | OPEN | Shareable search |
| G-06 | P1 | Owner delete has no confirmation | OPEN | Accidental data loss |
| G-07 | P1 | Admin `/listings/[id]` always → vehicles (plates wrong) | OPEN | Moderator ops |
| G-08 | P1 | Admin-created plates default ACTIVE (bypass review) | **CLOSED** (`a8869f1`) | — |
| G-09 | P2 | Preview Mode does not anonymous-refetch | OPEN | Owner preview fidelity |
| G-10 | P2 | Plate detail missing Message/Report/contact analytics | OPEN | Domain parity |
| G-11 | P2 | Home / vehicles hub missing API error states | OPEN | Ops clarity |
| G-12 | P2 | Public listing payloads expose contact click metrics | OPEN | Privacy |
| G-13 | P3 | Lint / demo route / share stubs / a11y polish | OPEN | Polish |

**Related lifecycle fixes (not separate backlog IDs):** content PATCH cannot set listing status (`0250e9e`); admin vehicle/listing content updates cannot set status/`publishedAt` (`d3b6e3f`).

### P0 blocker count (this reassessment)

| Scope | Open P0 | Notes |
| --- | --- | --- |
| **Closed beta (0.4 marketplace)** | **0** | G-01 closed; G-08 closed |
| **Public beta** | **1** | G-02 / BUG-002 (tracked under Release 0.2) |

**Internal testing gate:** Open (superseded by closed beta).  
**Closed beta gate:** **Open** — GO with conditions in §1.  
**Public beta gate:** Closed until G-02, G-03 (+ live checklist PASS).

---

## 4. Release 0.4 checklist

| Area | Item | Status | Notes |
| --- | --- | --- | --- |
| **Infrastructure** | Local API + Postgres + Redis runnable | PARTIAL | Commonly used; this pass did not re-run full stack matrix |
| **Infrastructure** | Health endpoint `/v1/health` | PASS | Prior RC evidence |
| **Infrastructure** | Migrations deployable | PARTIAL | Present; staging dry-run NOT TESTED this pack |
| **Infrastructure** | Secrets not in git / env examples | PASS | Process exists; spot-check only |
| **Infrastructure** | Production deploy runbook | PARTIAL | Docs exist; prod drill NOT TESTED |
| **Authentication** | Dev login for internal QA | PASS | Flag-gated |
| **Authentication** | Staff login for admin | PASS | Flag-gated; prod hard-off designed |
| **Authentication** | Profile completion / `identityStatus` | PASS | Phase B shipped |
| **Authentication** | Web Firebase phone production path | FAIL | Phases C–E not done (public blocker) |
| **Authentication** | Mobile Firebase production path | FAIL | Phases C–E not done |
| **Authentication** | Route protection (sell, my-listings) | PARTIAL | Gated; sell loses `next` |
| **Marketplace** | Guest browse ACTIVE vehicles/plates | PASS | CODE + prior smoke |
| **Marketplace** | Search + filters (vehicles/plates) | PARTIAL | Works; URL sync FAIL |
| **Marketplace** | Currency-scoped price filters | NOT TESTED | AC open |
| **Marketplace** | Vehicle detail visitor UX | PASS | Sprint 4 |
| **Marketplace** | Plate detail visitor UX | PARTIAL | Share/favorite; no message/report |
| **Marketplace** | Owner chrome + Preview Mode | PASS | Sprint 4; fidelity caveat G-09 |
| **Marketplace** | Action Registry lifecycle | PASS | CODE matrix; live multi-status PARTIAL |
| **Marketplace** | Sell create vehicle | PARTIAL | CODE; live E2E NOT TESTED this pack |
| **Marketplace** | Sell create plate | PARTIAL | CODE; admin moderation path now exists |
| **Marketplace** | Draft save / resume | PARTIAL | Implemented; live NOT TESTED this pack |
| **Marketplace** | Favorites | PARTIAL | Local only |
| **Marketplace** | Share | PASS | Native/clipboard abstraction |
| **Marketplace** | Non-ACTIVE hidden from public | PASS | API `canView` / search ACTIVE-only (CODE) |
| **Admin** | Staff login | PASS | |
| **Admin** | Vehicle list/detail | PASS | |
| **Admin** | Vehicle approve/reject | PASS | Prior RC-2 + CODE |
| **Admin** | Plate list/CRUD | PASS | Create defaults PENDING (BUG-008) |
| **Admin** | Plate approve/reject | PASS | G-01 closed (`7c52aac`) |
| **Admin** | Reports resolve/reject | PARTIAL | Ban listing inconsistent across pages |
| **Admin** | Pending queue deep link | FAIL | Dashboard KPI only |
| **Media** | Upload/attach on sell/detail | PARTIAL | Exists; trust gap deferred |
| **Media** | R2 signed attach trust | FAIL | Tracked 0.3; deferred from 0.4 public |
| **Performance** | Web production build | PASS | Post Sprint 4 |
| **Performance** | Search pagination correctness | NOT TESTED | |
| **Performance** | LCP/image optimization | PARTIAL | Known `no-img-element` warnings |
| **Security** | Staff/dev login off in production config | PASS | Designed; deploy verify NOT TESTED |
| **Security** | Owner-only mutations | PASS | API `assertCanManage` (CODE) |
| **Security** | Contact on non-ACTIVE | PASS | `sellerContact` null when not ACTIVE (CODE) |
| **Security** | Listing status only via lifecycle APIs | PASS | Content PATCH forbids status; admin content updates same |
| **Security** | Create does not imply Publish (plates) | PASS | Admin plate create → PENDING; `publishedAt` only when ACTIVE |
| **Security** | Public click metrics exposure | PARTIAL | G-12 |
| **Accessibility** | Forms/labels basics | PARTIAL | Inputs labeled; mobile nav gaps |
| **Accessibility** | Keyboard/focus trap mobile menu | FAIL | CODE gap |
| **Accessibility** | Touch carousel controls | PARTIAL | Hover-only controls suspected |
| **Documentation** | Release 0.4 doc + Sprint 4 notes | PASS | |
| **Documentation** | This Go/No-Go pack | PASS | Reassessment after BUG-008 |
| **Documentation** | Full epic backlog | PARTIAL | Index only |
| **Monitoring** | Health check | PARTIAL | Exists; alerting NOT TESTED |
| **Monitoring** | Error tracking (Sentry etc.) | NOT TESTED | |
| **Monitoring** | Audit logs for approve/reject | PASS | Vehicles + plates path |

---

## 5. Test coverage matrix

### Visitor

| Journey | Status | Evidence |
| --- | --- | --- |
| Home | PARTIAL | CODE; error state missing |
| Vehicles hub | PARTIAL | CODE; error state missing |
| Plates hub | PASS | Loading/empty/error present |
| Search chooser `/search` | PASS | CODE |
| Vehicle search + filters | PARTIAL | Results UX OK; URL sync FAIL |
| Plate search + filters | PARTIAL | Same |
| Vehicle details | PASS | Sprint 4 |
| Plate details | PARTIAL | Parity gaps |
| Favorites | PARTIAL | Local; silent failures |
| Share | PASS | CODE |
| Dealers browse | NOT TESTED | Out of deep RC focus |
| Non-ACTIVE URL when logged out | PASS | API 404 (CODE); live NOT TESTED |

### Seller

| Journey | Status | Evidence |
| --- | --- | --- |
| Login / OTP | PARTIAL | Dev path PASS; Firebase prod FAIL |
| Profile setup | PASS | Phase B |
| Create vehicle | NOT TESTED | CODE present |
| Create plate | NOT TESTED | CODE present |
| Save draft | NOT TESTED | CODE present |
| Publish / submit review | NOT TESTED | CODE → PENDING |
| My Listings | PASS | Action Registry |
| Edit | PARTIAL | Limited fields; weak error UI |
| Pause | PASS | Registry → ARCHIVED |
| Activate (RESERVED→ACTIVE) | PASS | Registry (CODE) |
| Republish | PASS | Registry (CODE) |
| Delete | PARTIAL | Works; no confirm |
| Preview Mode | PASS | Sprint 4; anonymous fidelity PARTIAL |
| Owner cannot PENDING→ACTIVE | PASS | API rule (CODE) |

### Moderator / Administrator

| Journey | Status | Evidence |
| --- | --- | --- |
| Admin login | PASS | |
| Review pending vehicle | PASS | Filter + detail |
| Approve vehicle | PASS | RC-2 + CODE |
| Reject vehicle | PASS | RC-2 + CODE |
| Vehicle status / feature / archive | PASS | CODE |
| Review pending plate | PASS | Status filter + PENDING actions (`7c52aac`) |
| Approve plate | PASS | Admin plates → listings approve |
| Reject plate | PASS | Admin plates → listings reject |
| Admin create plate | PASS | Defaults PENDING; no auto `publishedAt` (`a8869f1`) |
| Report resolve/reject | PARTIAL | |
| Ban listing from reports | PARTIAL | Global reports only |
| Visibility rules awareness in UI | PARTIAL | Actions not status-gated |
| Dashboard → pending queue | FAIL | No deep link |

### Mobile (consumer)

| Journey | Status | Evidence |
| --- | --- | --- |
| Browse / search / detail | NOT TESTED | Prior sprints shipped |
| Sell vehicle / plate | NOT TESTED | |
| My listings manage | NOT TESTED | |
| Auth production path | FAIL | Same 0.2 gap |

---

## 6. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- |
| Closed-beta invite before live smoke of plate approve path | Medium | High | Mandatory vehicle+plate smoke before first external invite | QA + Admin |
| Public launch with dev/mock auth | Medium | Critical | Keep prod flags hard-off; complete Firebase C–E before public | Auth |
| Visibility regression (non-ACTIVE leaked) | Low | Critical | Keep SQL-level ACTIVE enforcement; add staging regression tests | API |
| Accidental listing delete by owner | Medium | Medium | Add confirm dialog before soft-delete | Web |
| Sellers lose sell draft context after login | High | Medium | `?next=/sell` on redirect | Web |
| Shared search links wrong/empty | High | Medium | Persist filters in URL | Web |
| Admin moderates plate via wrong redirect | Medium | Medium | Domain-aware listing redirect; disable broken path | Admin |
| Media attach trust abuse | Medium | High | Deferred to media trust work; limit in prod | Media |
| Favorites lost across devices | High | Medium | Disclose local-only in closed beta; sync before public | Web + API |
| Concurrent Next build/dev lock (Windows) | Medium | Low | Stop dev before build; document | Platform |

---

## 7. Deferred items — **Not part of Release 0.4**

Explicitly out of scope for 0.4 Marketplace release intent (track elsewhere):

| Item | Track |
| --- | --- |
| Firebase Phases C–E (web/mobile production phone auth) | Release 0.2 |
| Media trust pipeline (`r2Key` attach hardening) | Release 0.3 |
| Notifications product completeness | Release **0.6** (Messaging; formerly numbered 0.5) |
| Chat / messaging product completeness | Release **0.6** (Messaging; formerly numbered 0.5) |
| Marketplace production harden (sell/media/edit) | Release **0.5** Marketplace & Listings |
| Payments / escrow / billing | Release 0.6 |
| AI features | Future |
| Dealer platform (multi-user orgs, dealer ops) | Deferred product |

Seller “member since”, listing count, and MediaAsset avatars remain deferred (no API fields) as decided in Sprint 4.

---

## 8. Bug backlog (index)

Sorted by business impact. Full records in [`RELEASE_0.4_BUG_BACKLOG.md`](./RELEASE_0.4_BUG_BACKLOG.md).

### Closed (marketplace P0 / related P1)
1. ~~Plate PENDING moderation path missing~~ — **CLOSED** (`7c52aac`)  
2. ~~Admin plate create defaults to ACTIVE~~ — **CLOSED** (`a8869f1`)  

### Critical open (public beta)
3. Production consumer authentication incomplete for public use (**BUG-002** / G-02)

### High (P1) — open
4. Favorites not account-backed  
5. Sell login drops return path  
6. Search filters not URL-persisted  
7. Delete without confirmation  
8. Admin listing redirect ignores plate domain  

### Medium (P2)
9. Preview Mode fidelity (no anonymous refetch)  
10. Plate detail visitor parity (message/report/analytics)  
11. Home/hub API error UX  
12. Public exposure of phone/WhatsApp click counts  
13. Report ban-listing control inconsistent  
14. Edit page weak error / limited fields  
15. Pending approvals dashboard not linked  

### Low (P3)
16. Web lint warnings  
17. `/media/demo` residue  
18. Share QR/deeplink stubs  
19. Mobile nav a11y  
20. Status badge owner-flavored copy on public pages  

---

## 9. Technical debt

See [`RELEASE_0.4_TECH_DEBT.md`](./RELEASE_0.4_TECH_DEBT.md).

---

## 10. Next actions

1. Product/eng accept **GO FOR CLOSED BETA** and the conditions in §1.  
2. Run mandatory staging smoke (vehicle + plate publish→approve→public) before first invite.  
3. Continue P1 remediation (BUG-004 → BUG-007, then BUG-003 strategy) under separate approvals.  
4. Keep **BUG-002** on the Release 0.2 track; re-issue Go/No-Go before public beta.
