# RC-1 QA Refresh Report

> **Superseded for the four RC-2 blockers.** See [`docs/rc2-go-report.md`](./rc2-go-report.md) for the current **GO** decision on Login/OTP, Chat/Notifications, listing lifecycle, and Admin Approve/Reject.

**Date:** 2026-07-25  
**Supersedes:** [`docs/rc1-qa-report.md`](./rc1-qa-report.md) (pre-recovery No-Go)  
**Scope:** Re-test after Sprint 23 DB schema recovery. No new features implemented.  
**Method:** API probe suite, Cursor Browser (Admin + Web), Prisma migrate/schema-diff, Mobile code inventory. Playwright deferred (environment issue; not a release blocker).

---

## Final release decision (historical)

# ❌ NO-GO

**Justification:** Database recovery cleared the previous Critical API/Communication/Notification **500**s. Admin Communication and Notification APIs now work. However, AutoHub is still **not** a full Release Candidate because:

1. **Web OTP step fails** — Login navigates to `/otp`, but the OTP form does not render (shell only). Register/Login/Logout E2E cannot complete on Web.
2. **Web Chat & Notifications product surfaces are missing** — API works; Web has no inbox/notifications UX.
3. **Multi-currency IQD + USD is incomplete** — Schema/API support dual primary/secondary pricing for vehicles; Web/Admin/Mobile sell UIs and most displays remain primary-only (typically IQD).
4. **Seller lifecycle gaps on Web** — No edit / pause / republish / activate; only Mark sold / Archive.
5. **Admin plate Approve/Reject gap** and **0 PENDING** inventory block live moderation happy-path.

API + Admin shells are largely healthy; full-platform RC still fails Web auth completion and several checklist workflows.

---

## Previously failed items — retest

| Prior failure | Refresh result |
| --- | --- |
| `GET /v1/admin/communication/stats` → 500 | **PASS** (200) |
| `GET /v1/notifications` → 500 | **PASS** (200) |
| `GET /v1/conversations` → 500 | **PASS** (200) |
| Admin Communication UI “Could not load stats” | **PASS** (stats/empty states load) |
| Prisma missing Conversation* tables | **PASS** (migrate up to date; `missingTables=[]`) |
| Web `/_next` chunk / OTP stuck | **FAIL** remains for OTP form render; search/favorites client interactions work on `/search` |
| `/vehicles/search` 404 | **FAIL** (still 404; use `/search`) |

Artifacts: [`docs/rc1-refresh-api-results.json`](./rc1-refresh-api-results.json), [`docs/rc1-refresh-web-smoke.json`](./rc1-refresh-web-smoke.json), [`docs/rc1-db-schema-recovery.md`](./rc1-db-schema-recovery.md)

---

## Status legend

| Status | Meaning |
| --- | --- |
| **PASS** | Verified working this refresh |
| **FAIL** | Broken or missing vs checklist |
| **BLOCKED** | Cannot complete due to upstream defect / missing fixture |

---

## 1. Web workflows

| Workflow | Status | Notes |
| --- | --- | --- |
| Register | **FAIL** | Depends on OTP; OTP page does not show verification form |
| Login | **FAIL** | Login form **PASS**; continue reaches `/otp` but OTP UI missing → cannot finish |
| Logout | **BLOCKED** | No authenticated Web session established |
| Forgot Password | **FAIL** | Not implemented |
| Create Vehicle | **BLOCKED** | Sell page loads; auth-gated create not completable without login |
| Create Plate | **BLOCKED** | Same |
| Edit Vehicle | **FAIL** | No web edit flow |
| Edit Plate | **FAIL** | No web edit flow |
| Delete Listing | **BLOCKED** | Soft-delete UI exists on `/my-listings`; needs auth |
| Republish Listing | **FAIL** | Not on web |
| Pause Listing | **FAIL** | Not on web |
| Activate Listing | **FAIL** | Not on web |
| Search | **PASS** | `/search` ~300 results; interactive filters |
| Filters | **PASS** | Brand/city/price/year/category filters present |
| Favourites | **PASS*** | Toggle works locally (`Favorites (1)`); *device-local only |
| Share Listing | **FAIL** / partial | Vehicles have share/contact patterns; not fully re-verified after auth block |
| Contact Seller | **FAIL** / partial | Call/WhatsApp on vehicles; plates weaker |
| Chat | **FAIL** | No Web chat UI (API OK) |
| Notifications | **FAIL** | No Web notifications UI (API OK) |

\*Favourites marked PASS for local UX; product sync is incomplete (see Medium bugs).

---

## 2. Admin workflows

| Workflow | Status | Notes |
| --- | --- | --- |
| Login | **PASS** | Staff login API + Admin session |
| Dashboard | **PASS** | KPIs load (vehicles 100, plates 200, users 15, conversations 0) |
| Vehicles | **PASS** | List, filters, sort, pagination |
| Plates | **PASS** | List/management pages load (moderation gap below) |
| Users | **PASS** | Suspend / Activate / Verify dealer UI present |
| Dealers | **PASS** | API + page available |
| Reports | **PASS** | Page/API (empty queue OK) |
| Communication | **PASS** | Stats, empty reports/blocks, moderation tools render (no 500) |
| Statistics | **PASS** | API + page |
| Audit Logs | **PASS** | API + page |
| Approve Listing | **BLOCKED** | Vehicle approve UI/API exist; **Pending approvals = 0** |
| Reject Listing | **BLOCKED** | Same |
| Suspend User | **PASS** | Confirm flow available on Users |
| Verify Dealer | **PASS** | Action available on Users |

---

## 3. Mobile workflows

| Workflow | Status | Notes |
| --- | --- | --- |
| Login | **PASS*** | Wired to API; *mock OTP default without Firebase |
| OTP | **PASS*** | Mock `123456`; Firebase path needs native SMS |
| Vehicle Wizard | **PASS** | API create/patch |
| Plate Wizard | **PASS** | API create |
| Upload Images | **PASS** | Media upload + attach |
| Edit | **PASS** | Manage → wizard resume / PATCH |
| Delete | **PASS** | Soft delete |
| Favourites | **FAIL** / partial | Local only; no server favorites API |
| Notifications | **PASS** | Hits `/v1/notifications` (now 200) |
| Chat | **PASS** | REST + socket + offline queue (API tables present) |
| Offline Mode | **FAIL** / partial | Banner, drafts, chat queue — not full offline |

\*Runtime device E2E not fully exercised; statuses from code + API readiness. Metro was available earlier in RC window.

---

## 4. API

| Check | Status | Notes |
| --- | --- | --- |
| Authentication | **PASS** | Staff login 201; refresh OK |
| Authorization | **PASS** | 401 unauth; SUPPORT settings 403 |
| Validation | **PASS** | Empty staff-login 400 |
| Rate limiting | **PASS*** | Configured; 40-burst → 0×429 (*limits may be loose) |
| Pagination | **PASS** | Admin lists |
| Sorting | **PASS** | Vehicles sort options / search sorts |
| Filtering | **PASS** | Status/category filters |
| Errors | **PASS** | Expected 4xx; **0 HTTP 500** in refresh suite |
| Permissions | **PASS** | Role guards verified |
| Communication E2E | **PASS** | Stats/reports/blocks; create conversation 201; messages 200 |
| Notifications E2E | **PASS** | List 200; device register path non-500 |
| Prisma schema/runtime | **PASS** | `migrate status` 0; no missing communication tables |

Refresh suite: **36/36 PASS**, **http500Count = 0**.

---

## 5. UI / Performance

| Check | Status | Notes |
| --- | --- | --- |
| Responsive layout | **PASS** | Admin + Web search usable |
| Dark mode | **PASS** | Admin + Web theme toggles present |
| Loading states | **PASS** / mixed | Admin skeletons OK; OTP Suspense path broken |
| Empty states | **PASS** | Communication empty reports/blocks |
| Error states | **PASS** | Admin error/retry patterns |
| Success messages | **PASS** | Admin toasts/confirms |
| Animations | **PASS** | Admin polish present |
| Console / chunk errors | **FAIL** / mixed | OTP route fails to paint form; external smoke saw buildId mismatch — browser fetch of search chunks returned 200 |
| Duplicate requests / leaks | **BLOCKED** | Not profiled this pass |

---

## 6. Multi-currency (IQD + USD) — priority check

| Check | Status | Notes |
| --- | --- | --- |
| Schema dual price fields | **PASS** | `primaryPrice`/`secondaryPrice` + currency IDs (not literally `priceIqd`/`priceUsd`) |
| API vehicle dual price | **PASS** / partial | Vehicles map secondary; plates primary-only |
| Web dual display | **FAIL** | Cards/detail show primary (IQD) only |
| Admin dual display | **FAIL** | Single price display/forms |
| Mobile dual entry | **FAIL** | One amount + currency toggle |
| Sell both currencies | **FAIL** | No secondary price capture on Web/Mobile sell |

---

## 7. Remaining bugs

### Critical

#### BUG-C1 — Web OTP page does not render verification form
- **Steps:** Open `/login` → enter phone → Continue → land on `/otp?phone=…`
- **Expected:** “Enter OTP” form with code field (mock `123456`)
- **Actual:** Site chrome only; no OTP form / no Suspense “Loading…” visible
- **Suggested fix:** Diagnose client Suspense/`useSearchParams` failure on `/otp`; ensure client bundles for that route hydrate; clean restart of `apps/web` if buildId drift persists. Re-verify end-to-end login.

### High

#### BUG-H1 — Web Chat missing
- API conversations work; no Web inbox/chat UI.
- **Suggested fix:** Ship minimal Web inbox against existing `/v1/conversations*` or defer Web chat explicitly out of RC scope.

#### BUG-H2 — Web Notifications missing
- API notifications work; no Web notifications UI.
- **Suggested fix:** Notification bell + list page, or scope RC to Mobile-only notifications.

#### BUG-H3 — Forgot Password missing
- No recovery UX (phone-OTP product may intentionally omit passwords — still checklist FAIL).
- **Suggested fix:** Document “OTP re-login is recovery” or add account recovery flow.

#### BUG-H4 — Web seller lifecycle incomplete
- Missing edit / pause / republish / activate.
- **Suggested fix:** Port mobile manage actions to `/my-listings`.

#### BUG-H5 — Multi-currency UX incomplete
- Dual fields exist in schema/API for vehicles; clients do not collect or consistently display IQD+USD.
- **Suggested fix:** Secondary price on sell forms + dual display on cards/detail/admin.

#### BUG-H6 — `/vehicles/search` 404
- Canonical `/search` works.
- **Suggested fix:** Fix route registration or redirect `/vehicles/search` → `/search`.

#### BUG-H7 — Admin plate Approve/Reject gap
- Vehicles have approve/reject; plates moderation parity missing.
- **Suggested fix:** Wire plate moderation to listing approve/reject endpoints.

### Medium

#### BUG-M1 — Favourites not server-backed (Web + Mobile)
- Local storage only; cross-device sync fails.

#### BUG-M2 — Approve/Reject happy path BLOCKED (0 PENDING)
- Seed/create PENDING fixtures for moderation QA.

#### BUG-M3 — Rate limit not observed under light burst
- Confirm production `THROTTLE_*` values.

#### BUG-M4 — Mobile offline incomplete
- Partial offline only.

#### BUG-M5 — Plate contact/share weaker than vehicles
- Align contact CTAs.

### Low

#### BUG-L1 — Web mock-auth / Firebase mode confusion for seller APIs
- Document required auth mode for seller E2E.

#### BUG-L2 — Playwright Chromium install failure
- Environment/cache lock; **not** an application defect; deferred post-RC.

#### BUG-L3 — External web smoke buildId mismatch noise
- Cursor Browser could load search interactivity; still clean/restart Web before production packaging.

---

## 8. Resolved since prior No-Go (do not re-open)

- Sprint 23 communication migration applied
- Conversation / Notification tables exist
- Admin Communication UI loads
- Communication & Notification HTTP **500**s cleared
- Prisma migrate status clean

---

## 9. Minimum for GO

1. Fix Web OTP render + complete Login/Register/Logout E2E.  
2. Decide scope for Web Chat/Notifications (implement or explicit deferral with Mobile-only).  
3. Dual-currency sell + display for IQD+USD (or explicit RC waiver).  
4. Seed PENDING listings; verify Admin Approve/Reject.  
5. Clean Web production build (no buildId drift) and re-smoke `/vehicles/search`.

---

*End of RC-1 QA Refresh. No product features were implemented in this phase.*
