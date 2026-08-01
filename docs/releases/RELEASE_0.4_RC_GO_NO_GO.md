# Release 0.4 RC — Go / No-Go Readiness Review

**Release:** `0.4.x` Marketplace  
**Review type:** Formal Go / No-Go (documentation only — no code changes in this pass)  
**Branch baseline:** `develop` @ Sprint 4 (`feat(web): owner and visitor marketplace UX`)  
**Date:** 2026-08-01  
**Method:** Code inspection + prior RC-2 evidence + Sprint 4 stabilization gates. Live browser E2E for this pack is recorded as **NOT TESTED** unless noted.  
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
**Yes.** Web browse (vehicles/plates), search, listing detail (including Sprint 4 owner/visitor chrome), sell wizard, my-listings actions, and admin vehicle moderation are present and suitable for a live demo on a local/staging stack.

**Can internal users test it?**  
**Yes — with caveats.** Dev/staff login paths and seeded data support internal QA. Expect gaps: plate moderation UI, favorites only on-device, sell login return path, and thin multi-status seed fixtures.

**Can selected dealers use it?**  
**Not yet as a closed dealer program.** Dealer browse/profile surfaces exist, but dealer platform (multi-user orgs, dealer ops) is out of 0.4. A hand-picked seller account can list vehicles; plate publish→approve is not operationally complete in admin.

**Can the public use it?**  
**No.** Production Firebase auth phases are incomplete, favorites are not account-backed, plate pending moderation is missing, and full public-beta checklist items remain open.

**What absolutely must be fixed before public use?**  
1. Production-capable consumer authentication (Firebase Phases C–E — tracked under 0.2, blocks public beta).  
2. Plate listing moderation path (approve/reject) equivalent to vehicles.  
3. Live sign-off of visibility rules, sell→publish→approve→public, and owner lifecycle on staging.  
4. Favorites/account expectations clarified or server sync if promised to public users.

### Decision (this review)

# GO FOR INTERNAL TESTING

| Score | Value |
| --- | --- |
| **Overall readiness** | **62%** |
| Marketplace readiness | 72% |
| Authentication readiness | 48% |
| Admin readiness | 58% |
| Mobile readiness | 55% |
| Infrastructure readiness | 70% |

**Not** NO-GO (core marketplace is demonstrable).  
**Not** GO FOR CLOSED BETA (plate moderation + auth + trust gaps).  
**Not** READY FOR PUBLIC BETA.

Fix approval is required before any remediation work.

---

## 2. Go / No-Go decision detail

| Dimension | Score | Rationale |
| --- | --- | --- |
| Marketplace | 72% | Domains, search, sell, Sprint 4 owner UX shipped; plate moderation & several UX gaps |
| Authentication | 48% | JWT/RBAC + profile identity exist; prod Firebase client path incomplete; relies on dev/staff locally |
| Admin | 58% | Vehicle approve/reject strong; plate status moderation missing; pending queue UX weak |
| Mobile | 55% | Prior sprints shipped create/manage; not re-validated in this RC pack |
| Infrastructure | 70% | Monorepo, Postgres, Redis patterns, health; ops/monitoring for public not fully proven here |
| **Overall** | **62%** | Weighted toward marketplace + auth blockers for any external audience |

### Recommendation

**GO FOR INTERNAL TESTING**

Proceed with internal QA on `develop`/staging. Do **not** invite external dealers or public users until P0/P1 release gates below are cleared and a follow-up Go/No-Go is recorded.

---

## 3. Release gates

Classification:

| Class | Meaning |
| --- | --- |
| **P0** | Release blocker for *any* external exposure beyond internal eng |
| **P1** | Must fix before public beta |
| **P2** | Can ship internal/closed with mitigation |
| **P3** | Future improvement |

Full issue records: [`RELEASE_0.4_BUG_BACKLOG.md`](./RELEASE_0.4_BUG_BACKLOG.md).

### Gate summary

| ID | Class | Title | Blocks |
| --- | --- | --- | --- |
| G-01 | P0 | Plate PENDING has no admin approve/reject path | Closed beta / public for plates |
| G-02 | P0 | Production consumer auth incomplete (Firebase C–E) | Public beta |
| G-03 | P1 | Favorites device-local only | Public beta trust |
| G-04 | P1 | Sell unauthenticated redirect drops return URL | Seller conversion |
| G-05 | P1 | Search filters not synced to URL | Shareable search |
| G-06 | P1 | Owner delete has no confirmation | Accidental data loss |
| G-07 | P1 | Admin `/listings/[id]` always → vehicles (plates wrong) | Moderator ops |
| G-08 | P1 | Admin-created plates default ACTIVE (bypass review) | Trust / moderation |
| G-09 | P2 | Preview Mode does not anonymous-refetch | Owner preview fidelity |
| G-10 | P2 | Plate detail missing Message/Report/contact analytics | Domain parity |
| G-11 | P2 | Home / vehicles hub missing API error states | Ops clarity |
| G-12 | P2 | Public listing payloads expose contact click metrics | Privacy |
| G-13 | P3 | Lint / demo route / share stubs / a11y polish | Polish |

**Internal testing gate:** Open (GO).  
**Closed beta gate:** Closed until G-01 mitigated and auth story agreed.  
**Public beta gate:** Closed until G-01, G-02, G-03 addressed + live checklist PASS.

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
| **Authentication** | Web Firebase phone production path | FAIL | Phases C–E not done |
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
| **Marketplace** | Sell create plate | PARTIAL | CODE; moderation path broken downstream |
| **Marketplace** | Draft save / resume | PARTIAL | Implemented; live NOT TESTED this pack |
| **Marketplace** | Favorites | PARTIAL | Local only |
| **Marketplace** | Share | PASS | Native/clipboard abstraction |
| **Marketplace** | Non-ACTIVE hidden from public | PASS | API `canView` / search ACTIVE-only (CODE) |
| **Admin** | Staff login | PASS | |
| **Admin** | Vehicle list/detail | PASS | |
| **Admin** | Vehicle approve/reject | PASS | Prior RC-2 + CODE |
| **Admin** | Plate list/CRUD | PARTIAL | No status approve/reject |
| **Admin** | Plate approve/reject | FAIL | G-01 |
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
| **Security** | Public click metrics exposure | PARTIAL | G-12 |
| **Accessibility** | Forms/labels basics | PARTIAL | Inputs labeled; mobile nav gaps |
| **Accessibility** | Keyboard/focus trap mobile menu | FAIL | CODE gap |
| **Accessibility** | Touch carousel controls | PARTIAL | Hover-only controls suspected |
| **Documentation** | Release 0.4 doc + Sprint 4 notes | PASS | |
| **Documentation** | This Go/No-Go pack | PASS | |
| **Documentation** | Full epic backlog | PARTIAL | Index only |
| **Monitoring** | Health check | PARTIAL | Exists; alerting NOT TESTED |
| **Monitoring** | Error tracking (Sentry etc.) | NOT TESTED | |
| **Monitoring** | Audit logs for approve/reject | PASS | Prior RC-2 vehicle path |

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
| Review pending plate | FAIL | No approve/reject UI/API on admin plates |
| Approve plate | FAIL | G-01 |
| Reject plate | FAIL | G-01 |
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
| Plate listings stuck in PENDING with no admin action | High | High | Block plate closed-beta; use vehicle path only; implement plate moderation before external plate sellers | Admin + API |
| Public launch with dev/mock auth | Medium | Critical | Keep prod flags hard-off; complete Firebase C–E before public | Auth |
| Visibility regression (non-ACTIVE leaked) | Low | Critical | Keep SQL-level ACTIVE enforcement; add staging regression tests | API |
| Accidental listing delete by owner | Medium | Medium | Add confirm dialog before soft-delete | Web |
| Sellers lose sell draft context after login | High | Medium | `?next=/sell` on redirect | Web |
| Shared search links wrong/empty | High | Medium | Persist filters in URL | Web |
| Admin moderates plate via wrong redirect | Medium | High | Domain-aware listing redirect; disable broken path | Admin |
| Media attach trust abuse | Medium | High | Deferred to media trust work; limit in prod | Media |
| Favorites lost across devices | High | Medium | Disclose local-only; or ship sync before public | Web + API |
| Concurrent Next build/dev lock (Windows) | Medium | Low | Stop dev before build; document | Platform |

---

## 7. Deferred items — **Not part of Release 0.4**

Explicitly out of scope for 0.4 Marketplace release intent (track elsewhere):

| Item | Track |
| --- | --- |
| Firebase Phases C–E (web/mobile production phone auth) | Release 0.2 |
| Media trust pipeline (`r2Key` attach hardening) | Release 0.3 |
| Notifications product completeness | Release 0.5 |
| Chat / messaging product completeness | Release 0.5 |
| Payments / escrow / billing | Release 0.6 |
| AI features | Future |
| Dealer platform (multi-user orgs, dealer ops) | Deferred product |

Seller “member since”, listing count, and MediaAsset avatars remain deferred (no API fields) as decided in Sprint 4.

---

## 8. Bug backlog (index)

Sorted by business impact. Full records in [`RELEASE_0.4_BUG_BACKLOG.md`](./RELEASE_0.4_BUG_BACKLOG.md).

### Critical (P0)
1. Plate PENDING moderation path missing (admin + API surface)  
2. Production consumer authentication incomplete for public use  

### High (P1)
3. Favorites not account-backed  
4. Sell login drops return path  
5. Search filters not URL-persisted  
6. Delete without confirmation  
7. Admin listing redirect ignores plate domain  
8. Admin plate create defaults to ACTIVE  

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

## 10. Next actions (no fixes until approved)

1. Product/eng approve this Go/No-Go decision.  
2. Prioritize P0/P1 from bug backlog for a remediation sprint (separate approval).  
3. Run live staging checklist; flip NOT TESTED → PASS/FAIL.  
4. Re-issue Go/No-Go before closed or public beta.

**Remediation is blocked until explicit approval.**
