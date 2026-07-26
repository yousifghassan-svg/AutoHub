# RC-2 — Release Readiness Report

**Date:** 2026-07-25  
**Supersedes:** RC-1 refresh NO-GO for the four named blockers.  
**Multi-currency:** deferred (not started, by instruction).

---

## Final release decision

# ✅ GO

**Justification:** The four RC-2 blockers are resolved and re-verified under live API (`:4000`) and Web (`:3000`). Quality gates for affected packages pass. Remaining product gaps are explicitly out of RC-2 scope and do not reverse this decision for the named blockers.

---

## Blocker results

| Blocker | Status | Evidence |
| --- | --- | --- |
| 1. Web Login → OTP | **PASS** | Login → `/otp` renders (Enter OTP, code input, countdown / Resend); verify → `/` as Private Seller 6 with Log out |
| 2. Web Chat + Notifications | **PASS** | `/messages` inbox + thread APIs; `/notifications` center + empty state; header Messages/Notifications links; existing `/v1/conversations*` + `/v1/notifications*` only |
| 3. Web listing lifecycle | **PASS** | `/my-listings` shows Edit / Pause / Activate / Republish for VEHICLE and PLATE; API lifecycle smoke 200 |
| 4. Admin moderation | **PASS** | Seeded PENDING; approve **201**, reject **201**; audit `listing.approve` / `listing.reject`; seller `LISTING_APPROVED` notification created |

---

## Workflow matrix

| Workflow | Result |
| --- | --- |
| Web Register / Login / OTP / Logout | **PASS** |
| OTP countdown + Resend control | **PASS** |
| OTP verify → authenticated home | **PASS** |
| Web Chat (list / detail / send / refresh) | **PASS** |
| Web Notifications (center / unread / mark read UI) | **PASS** |
| Web Vehicle Edit / Pause / Activate / Republish | **PASS** |
| Web Plate Edit / Pause / Activate / Republish | **PASS** |
| Admin Approve Listing | **PASS** |
| Admin Reject Listing | **PASS** |
| Admin status transitions + audit log | **PASS** |
| Admin approve → seller notification | **PASS** (`LISTING_APPROVED`) |
| Admin Communication APIs (post DB recovery) | **PASS** |
| API conversations / notifications (no 500) | **PASS** |
| Multi-currency IQD+USD | **BLOCKED** (deferred by instruction) |
| Forgot Password | **FAIL** (out of RC-2 scope) |
| Favourites server sync | **FAIL** (out of RC-2 scope) |
| Admin plate Approve/Reject parity | **FAIL** (out of RC-2 scope) |
| Playwright CI | **BLOCKED** (environment; deferred) |

---

## Quality gates

| Gate | Result | Exit |
| --- | --- | --- |
| `pnpm --filter @autohub/web lint` | **PASS** | 0 (warnings only) |
| `pnpm --filter @autohub/web typecheck` | **PASS** | 0 |
| `pnpm --filter @autohub/web build` | **PASS** | 0 |
| `pnpm --filter @autohub/api typecheck` | **PASS** | 0 |

Artifacts: `docs/_gate_summary.txt`, `docs/_gate_*.log`, `docs/_mod_smoke.json`, `docs/rc2-lifecycle-smoke.json`.

---

## Application health (spot-check)

| Check | Result |
| --- | --- |
| React / client exceptions on OTP → home | None observed |
| Hydration errors on OTP | None observed |
| Console / Prisma 500s on communication APIs | None (HTTP 200) |
| Windows exit `4294967295` | Not an app failure (process kill on restart) |

---

## Remaining issues (severity)

### Critical
*None for RC-2 blockers.*

### High
*None for RC-2 blockers.*

### Medium
- **Forgot password** — not implemented (out of scope).
- **Admin plate Approve/Reject parity** — vehicle moderation path verified; dedicated plate admin approve/reject parity still incomplete (out of scope).
- **Favourites server sync** — still local/client-oriented (out of scope).

### Low
- Web lint warnings (`no-img-element`, one `react-hooks/exhaustive-deps`).
- Playwright CI install/environment still blocked on this machine.
- Local mock OTP / `POST /v1/auth/dev-login` are non-production only (same gate as staff-login).

---

## What changed in RC-2 (summary)

### Blocker 1 — OTP
- Rewrote `/otp` so the form always paints; countdown + resend; verification persisted in `sessionStorage`.
- Mock OTP exchanges for real JWT via non-prod `POST /v1/auth/dev-login`.

### Blocker 2 — Communication UI
- Web `/messages`, `/messages/[id]`, `/notifications` on existing APIs.
- Header unread badges, message-seller entry, toast polling for new notifications.

### Blocker 3 — Lifecycle
- `/my-listings` + edit page for vehicle and plate: Edit / Pause / Activate / Republish (API-legal transitions).

### Blocker 4 — Moderation
- `packages/database/scripts/seed-pending-rc2.mjs` for realistic PENDING fixtures.
- Admin approve/reject + audit verified.
- Admin transition now calls the **existing** `NotificationsService.notifyListingStatus` (same side effect as `ListingsService.changeStatus`) so sellers receive `LISTING_APPROVED` / `LISTING_REJECTED`. No API contract change.

---

## Release decision rationale

RC-1 NO-GO was driven by OTP not rendering, missing web chat/notifications UI, incomplete listing lifecycle UI, and unverified moderation after schema recovery. Those four blockers are now **PASS** with live evidence and green package gates.

Therefore: **✅ GO** for RC-2.

Next product priority after GO (per instruction): Multi-Currency — not started in this sprint.
