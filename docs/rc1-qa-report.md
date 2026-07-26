# Sprint RC-1 — End-to-End QA & Release Candidate Report

> **Superseded.** This report is no longer authoritative after DB schema recovery.  
> See **[`docs/rc1-qa-refresh-report.md`](./rc1-qa-refresh-report.md)** for the current RC-1 decision.

**Date:** 2026-07-25  
**Scope:** Verify production readiness only. No features, refactors, business-logic changes, or bug fixes were applied.  
**Verdict:** **Not release-ready.** RC is **blocked** by Critical defects (DB schema drift for chat/notifications; Web client hydration broken by missing Next static chunks).

---

## 1. Environment under test

| Service | URL / port | Observed |
| --- | --- | --- |
| API (Nest) | `http://localhost:4000` | Up |
| Web (Next) | `http://localhost:3000` | Up; client bundles partially 404 |
| Admin (Next) | `http://localhost:3001` | Up (staff session usable) |
| Mobile (Expo Metro) | `http://localhost:8081` | Up; deep device E2E not fully executed |
| Database | local Postgres via Prisma | Sprint 23 communication tables **missing** |

**Method**

- API probe suite (auth, authz, validation, pagination, filters, refresh, rate burst) → `docs/rc1-api-results.json`
- Browser E2E on Web + Admin (Cursor browser)
- Prisma / API log confirmation for missing tables
- Mobile: code + structure verification (Metro live; no full device OTP/chat run in this pass)

---

## 2. Status legend

| Status | Meaning |
| --- | --- |
| **PASS** | Verified working in this environment |
| **FAIL** | Broken / errors observed |
| **PARTIAL** | Implemented but incomplete vs checklist |
| **MISSING** | No product surface found |
| **BLOCKED** | Could not complete due to upstream defect |
| **CODE** | Present in codebase; not fully runtime-verified |
| **N/A** | Not applicable / not observable under test load |

---

## 3. Checklist matrices

### 3.1 Web

| Workflow | Status | Evidence / notes |
| --- | --- | --- |
| Register | **BLOCKED** | OTP route stuck on Suspense “Loading…”; `main-app` / chunks **404** → no client hydration |
| Login | **BLOCKED** | Same client-bundle failure on `/otp` |
| Logout | **CODE** / **BLOCKED** | Auth provider logout exists; full login session not established in browser this pass |
| Forgot Password | **MISSING** | No route/UI/API usage for password reset (phone-OTP auth model; no recovery UX) |
| Create Vehicle | **CODE** / **BLOCKED** | `/sell` wizard exists; auth-gated create not completed due to OTP/hydration |
| Create Plate | **CODE** / **BLOCKED** | Same sell flow |
| Edit Vehicle | **MISSING** / **PARTIAL** | No dedicated web edit flow; my-listings only Mark sold / Archive |
| Edit Plate | **MISSING** / **PARTIAL** | Same |
| Delete Listing | **PARTIAL** | My listings “Archive / delete” soft-delete; blocked by auth for live E2E |
| Republish Listing | **MISSING** (web) | No republish UI on web (mobile has path) |
| Pause Listing | **MISSING** (web) | No pause; only Mark sold / Archive |
| Activate Listing | **MISSING** (web) | Owner cannot activate PENDING→ACTIVE (by design); no web republish path |
| Search | **PASS** | `/search` returns results (~300 in UI) |
| Filters | **PASS** | Search filters usable |
| Favourites | **PARTIAL** | Device `localStorage` only; page states “no favorites API yet” |
| Share Listing | **PARTIAL** | Vehicles: share/call/WhatsApp; plates: mailto-style stub |
| Contact Seller | **PARTIAL** | Call/WhatsApp on vehicles; plate contact incomplete |
| Chat | **MISSING** (web) + **FAIL** (API) | No web chat UI; API conversations **500** (missing tables) |
| Notifications | **MISSING** (web) + **FAIL** (API) | No web notifications UI; API notifications **500** |

**Additional Web route issue**

| Check | Status | Notes |
| --- | --- | --- |
| `/vehicles/search` | **FAIL** | Next **404** against running server (source exists under `apps/web/src/app/vehicles/search/`; likely stale/mismatched `.next`) |
| `/search` | **PASS** | Canonical search works |

### 3.2 Admin

| Workflow | Status | Evidence / notes |
| --- | --- | --- |
| Login | **PASS** | Staff login (`SUPER_ADMIN` / `ADMIN`) via API; Admin UI session usable |
| Dashboard | **PASS** | Loads KPIs (e.g. users=15, cars=100) |
| Vehicles | **PASS** | List + pagination/filter; detail has Approve/Reject |
| Plates | **PARTIAL** | List/CRUD catalog pages exist; **no plate Approve/Reject** moderation actions (unlike vehicles) |
| Users | **PASS** | List + Suspend / Activate / Verify dealer / Delete UI present |
| Dealers | **PASS** | API list OK; Admin Dealers page available |
| Reports | **PASS** | List endpoint OK (total=0 in seed); UI present |
| Communication | **FAIL** | UI “Could not load stats”; `GET /v1/admin/communication/stats` → **500** |
| Statistics | **PASS** | API + page load |
| Audit Logs | **PASS** | API total=3; page present |
| Approve Listing | **PARTIAL** / **BLOCKED** | Vehicle approve UI+API exist; **0 PENDING** vehicles at test time — happy-path approve not exercised live |
| Reject Listing | **PARTIAL** / **BLOCKED** | Same as approve (vehicles only) |
| Suspend User | **PASS** (UI) | Confirm dialog path present on Users |
| Verify Dealer | **PASS** (UI) | Action present on Users |

### 3.3 Mobile

| Workflow | Status | Evidence / notes |
| --- | --- | --- |
| Login | **CODE** | Auth screens + JWT/secure storage |
| OTP | **CODE** | Mock OTP (`123456`) + Firebase path |
| Vehicle Wizard | **CODE** | Sell wizard present |
| Plate Wizard | **CODE** | Present |
| Upload Images | **CODE** | Media upload flows present |
| Edit | **CODE** | My-listings edit sheet; sold/archived blocked |
| Delete | **CODE** | Archive / status transitions |
| Favourites | **PARTIAL** | Local AsyncStorage; comment: no favorites API yet; offline toggle queue |
| Notifications | **CODE** / **FAIL** (API) | Local store + screens; live API notifications **500** until migration |
| Chat | **CODE** / **FAIL** (API) | Socket sync + offline queue; REST/DB **500** until migration |
| Offline Mode | **PARTIAL** | Offline banners, chat queue, listing cache — not full-app offline |

### 3.4 API

| Check | Status | Detail |
| --- | --- | --- |
| Authentication | **PASS** | Staff login, token refresh rotation |
| Authorization | **PASS** | Unauth admin → 401; SUPPORT settings → **403** |
| Validation | **PASS** | Empty staff-login → **400** |
| Rate limiting | **PARTIAL** | Throttler configured globally; 40-burst trending → **0× 429** (limit likely high / not hit) |
| Pagination | **PASS** | Admin vehicles `page/size/total` |
| Sorting | **PARTIAL** | Search/list APIs exist; dedicated sort matrix not exhaustively probed |
| Filtering | **PASS** | Vehicles `ACTIVE` filter; public search |
| Errors | **PARTIAL** | Validation/auth errors OK; communication/chat return opaque **500** / `DATABASE_ERROR` |
| Permissions | **PASS** | Role/permission guards observed for staff vs support |

**Failed API probes**

- `GET /v1/admin/communication/stats` → **500**
- `GET /v1/notifications` → **500** (`DATABASE_ERROR`)
- `GET /v1/conversations` → **500** (`DATABASE_ERROR`)

**Root cause (confirmed):** Prisma tables missing: `Conversation`, `ChatMessage`, `UserBlock`, `ConversationReport` (and related notification schema). Migration folder exists: `packages/database/prisma/migrations/20260725140000_sprint23_communication/` — **not applied** to the running DB.

### 3.5 UI

| Check | Status | Notes |
| --- | --- | --- |
| Responsive layout | **PARTIAL** | Admin/web shells respond; full matrix not exhaustive |
| Dark mode | **PASS** (admin) | Theme toggle present/working in Admin shell |
| Loading states | **PARTIAL** | Skeletons present; Web OTP stuck forever on “Loading…” (bug) |
| Empty states | **PASS** | Favorites, my-listings, admin tables have empty/error patterns |
| Error states | **PASS** / **FAIL** | Retry patterns exist; Communication hard-fails on 500 |
| Success messages | **PARTIAL** | Toasts/confirm dialogs in Admin; web sell success not E2E’d |
| Animations | **PARTIAL** | Present in polished admin UI; not a release blocker |

### 3.6 Performance

| Check | Status | Notes |
| --- | --- | --- |
| Slow pages | **PARTIAL** | Search SSR OK; OTP never hydrates |
| Duplicate requests | **N/A** | No systematic network profiler pass |
| Console errors | **FAIL** (web) | Chunk **404**s for `/_next/static/chunks/*` including `main-app` |
| Memory leaks | **N/A** | Not profiled this sprint |

---

## 4. Bug report

### Critical

#### BUG-C1 — Sprint 23 communication schema not applied (chat, notifications, admin communication 500)

- **Area:** API / Database / Admin Communication / Mobile Chat & Notifications  
- **Steps to reproduce:**
  1. Ensure API is running against current local DB.
  2. Authenticate as a user/staff.
  3. Call `GET /v1/admin/communication/stats` (or `/v1/conversations`, `/v1/notifications`).
  4. Open Admin → Communication.
- **Expected:** Stats and lists return 200; Admin Communication loads.
- **Actual:** **500** / `DATABASE_ERROR`. API logs: `The table public.Conversation does not exist` (same class of error for related tables). Admin UI shows “Could not load stats”.
- **Suggested fix:** Apply pending migration `20260725140000_sprint23_communication` (and any dependent notification migrations) to the target DB; restart API; re-seed if needed. Add deploy checklist gate: fail startup or CI if required tables missing. **Do not ship chat/notifications until migration is verified in every environment.**

#### BUG-C2 — Web Next.js client bundles 404; OTP / auth client stuck on “Loading…”

- **Area:** Web runtime (`.next` artifacts)  
- **Steps to reproduce:**
  1. Open `http://localhost:3000/otp?phone=…` (or complete register/login to OTP).
  2. Observe page remains on Suspense “Loading…”.
  3. Request `http://localhost:3000/_next/static/chunks/main-app.js` (and related chunks).
- **Expected:** Client JS loads; OTP form hydrates; login/register completes.
- **Actual:** Chunks return **404** (e.g. `main-app` size ~9); `hasReact: false`; auth client flows unusable. SSR pages like home/search may still render.
- **Suggested fix:** Stop web `next` process; delete `apps/web/.next`; restart `next dev` (or clean production build). Avoid concurrent `next build` while `next dev` shares the same `.next`. Re-verify OTP hydration and `/vehicles/search` after clean rebuild. Treat as release blocker for Web RC.

---

### High

#### BUG-H1 — Forgot Password workflow missing

- **Area:** Web (and product checklist)  
- **Steps:** Look for Forgot Password / reset links on login and related API.
- **Expected:** User can recover account access.
- **Actual:** No forgot-password UI or flow found (phone OTP auth; no recovery UX).
- **Suggested fix:** Either implement OTP re-login recovery UX and document as intentional “no password”, or add explicit account recovery. Update RC checklist if password reset is out of scope for phone-auth.

#### BUG-H2 — Web seller lifecycle incomplete (edit / pause / republish / activate)

- **Area:** Web My Listings  
- **Steps:** Authenticate → `/my-listings` → inspect actions on ACTIVE/PENDING/ARCHIVED items.
- **Expected:** Edit, pause, republish, activate (per product checklist).
- **Actual:** Only **Mark sold** and **Archive / delete**. No edit/pause/republish/activate on web (mobile has richer manage flows).
- **Suggested fix:** Port mobile manage actions to web against existing status APIs, or explicitly scope Web RC without seller lifecycle and route sellers to mobile.

#### BUG-H3 — Web Chat & Notifications not implemented (API also broken)

- **Area:** Web product surface  
- **Steps:** Browse web nav/routes for chat/inbox/notifications.
- **Expected:** End-to-end chat and notifications on web.
- **Actual:** No web chat/notifications app routes; API backends currently **500** (see BUG-C1).
- **Suggested fix:** After schema migration, ship minimal web inbox + notification bell, or mark Web chat/notifications as deferred for this RC with mobile-only support.

#### BUG-H4 — Admin plate listing moderation gap (approve/reject)

- **Area:** Admin Plates  
- **Steps:** Open Admin → Plates → open a PENDING plate listing; look for Approve/Reject (compare Vehicles detail).
- **Expected:** Same moderation capability as vehicles.
- **Actual:** Vehicle detail has Approve/Reject; plate admin surfaces lack equivalent approve/reject actions (API vehicle/listing approve exists; plates admin path incomplete).
- **Suggested fix:** Wire plate detail/list moderation to existing admin listing approve/reject endpoints (or plate-specific ones), with audit logging.

#### BUG-H5 — `/vehicles/search` returns Next 404 while `/search` works

- **Area:** Web routing / build  
- **Steps:** Navigate to `http://localhost:3000/vehicles/search`.
- **Expected:** Vehicle search UI (source under `apps/web/src/app/vehicles/search/`).
- **Actual:** Next **404**. `/search` works.
- **Suggested fix:** Same clean `.next` rebuild as BUG-C2; verify route registration; add e2e smoke for both search entry points.

---

### Medium

#### BUG-M1 — Favourites are device-local only (web + mobile)

- **Area:** Web `/favorites`, Mobile favorites store  
- **Steps:** Favorite a listing on one browser/device; open another session/device.
- **Expected:** Favourites sync with account.
- **Actual:** `localStorage` / AsyncStorage only; UI copy admits “no favorites API yet”.
- **Suggested fix:** Add server-backed favorites API + migrate clients; keep local cache as offline layer.

#### BUG-M2 — Contact seller / share incomplete for plates

- **Area:** Web plate detail  
- **Steps:** Open a plate listing → Share / Contact.
- **Expected:** Parity with vehicle call/WhatsApp/share.
- **Actual:** Plate contact uses weaker mailto/stub patterns vs vehicle flows.
- **Suggested fix:** Reuse vehicle contact/share components with plate listing seller fields.

#### BUG-M3 — Rate limiting not observed under burst

- **Area:** API Throttler  
- **Steps:** Burst 40 requests to a public trending/search endpoint.
- **Expected:** Eventually **429** if limits are production-tight.
- **Actual:** `ok=40`, `blocked429=0`. Throttler is configured; default limits appear too high for meaningful protection in this env.
- **Suggested fix:** Confirm `THROTTLE_LIMIT` / `THROTTLE_TTL_MS` for production; add auth/OTP/media-specific lower limits; verify 429 shape in staging load test.

#### BUG-M4 — Approve/Reject happy path not exercised (no PENDING inventory)

- **Area:** Admin moderation E2E  
- **Steps:** Filter admin vehicles by PENDING; approve/reject.
- **Expected:** At least one PENDING listing for QA.
- **Actual:** 0 PENDING vehicles at test time; approve/reject UI/API exist but live success path unverified.
- **Suggested fix:** Seed PENDING fixtures for QA; add integration test already present for listings approve; run browser E2E once seed exists.

#### BUG-M5 — “Pause” vs Archive naming inconsistency

- **Area:** Product language (web/mobile)  
- **Steps:** Compare checklist “Pause” with UI labels.
- **Expected:** Clear pause/unpause semantics.
- **Actual:** Mobile maps pause-like behavior to **ARCHIVED**; web uses “Archive / delete”. Checklist “Pause/Activate” does not match UX copy.
- **Suggested fix:** Align product terms (Pause = temporary hide vs Archive = soft delete) in UI and docs before RC marketing.

---

### Low

#### BUG-L1 — Web mock-auth banner blocks protected seller management

- **Area:** Web `/my-listings`  
- **Steps:** Run web with default mock auth; open My listings.
- **Expected:** Clear path to manage listings in local QA.
- **Actual:** Banner warns mock auth cannot call protected APIs; pushes Firebase/API mode or Expo.
- **Suggested fix:** Document required `NEXT_PUBLIC_AUTH_MODE=api` for RC web seller QA; optional staff/dev login for web sellers in non-prod.

#### BUG-L2 — Admin Communication empty-state vs hard error

- **Area:** Admin UI  
- **Steps:** Open Communication while API returns 500.
- **Expected:** Actionable empty/error with ops hint (migrate DB).
- **Actual:** Generic “Could not load stats” + Retry (correct pattern, weak ops guidance).
- **Suggested fix:** After BUG-C1 fixed, optionally surface `DATABASE_ERROR` code in admin toast for faster triage.

#### BUG-L3 — Mobile offline is partial

- **Area:** Mobile  
- **Steps:** Toggle airplane mode across home, chat, favorites, create listing.
- **Expected:** Full offline mode per checklist.
- **Actual:** Offline banners, chat queue, caches — create/browse still network-dependent.
- **Suggested fix:** Document supported offline subset for RC; defer full offline as post-RC.

---

## 5. What passed (release strengths)

- Admin shell: login, dashboard, vehicles, users (suspend/verify UI), dealers, reports, statistics, audit logs, dark mode.
- API foundation: staff auth, refresh, authz (401/403), validation 400, pagination, status filtering, public search, permissions for SUPPORT vs ADMIN.
- Web discovery: `/search` + filters functional when SSR path works.
- Mobile codebase coverage for wizards, manage listings, chat/offline queue scaffolding (blocked on DB for live chat).

---

## 6. Release recommendation

| Gate | Result |
| --- | --- |
| Critical bugs closed | **FAIL** (BUG-C1, BUG-C2) |
| Checklist coverage | **Incomplete** — Web auth E2E, chat/notifications, forgot password, web lifecycle, plate approve |
| RC-1 ship decision | **No-Go** |

**Minimum before re-test (RC-1.1):**

1. Apply Sprint 23 communication migration; verify conversations/notifications/admin communication **200**.  
2. Clean rebuild Web `.next`; verify OTP hydration and register/login/logout.  
3. Re-run blocked Web seller flows + Admin approve/reject with PENDING fixtures.  
4. Decide scope: ship without web chat/forgot-password **or** implement before RC.

---

## 7. Artifacts

- API probe dump: [`docs/rc1-api-results.json`](./rc1-api-results.json)
- Migration present but unapplied: `packages/database/prisma/migrations/20260725140000_sprint23_communication/`

---

*End of RC-1 QA report. No code fixes were made in this sprint.*
