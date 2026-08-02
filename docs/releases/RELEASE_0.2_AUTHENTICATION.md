# Release 0.2 — Authentication

**Version:** `0.2.x`  
**Codename:** Authentication  
**Status:** **FROZEN** (2026-08-02)  
**Production intent:** Secure identity for all subsequent product releases  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

> **Freeze rule:** Do not refactor Authentication unless a production bug is discovered.
> Local-only helpers (`NEXT_PUBLIC_AUTH_MODE=dev`, `NEXT_PUBLIC_FIREBASE_PHONE_TESTING`) remain for development and are hard-blocked in production builds/runtime.

---

## Goals

- Ship Firebase Phone Authentication integrated with NestJS.  
- Issue API **JWT access** + rotating **refresh** tokens; persist users in Postgres.  
- Enforce RBAC (roles + fine-grained permissions) on protected routes.  
- Provide client auth flows with explicit mock/dev bypass **off** in production.  
- Capture auth audit events for login/refresh/logout.  

### Phase status

| Phase | Status |
| --- | --- |
| 0 — Auth cleanup | **Done** |
| A — API hardening | **Done** (prod JWT/Firebase validation, auth throttles, gate tests) |
| B — Profile API | **Done** (`PATCH /auth/me`, `identityStatus`, web/mobile profile-setup) |
| C — Web Firebase phone | **Done** (wired + E2E verified against `autohub-v2-c039b`) |
| D — Mobile Firebase phone | **Deferred** (see backlog — Expo path not in this freeze) |
| E — Route protection polish | **Done enough to freeze** (client redirects on protected pages; middleware centralization deferred) |

---

## Features

| Area | Deliverable |
| --- | --- |
| API auth domain | `POST /v1/auth/login`, refresh, logout, `GET|PATCH /v1/auth/me` |
| Tokens | Access JWT (HS256); opaque refresh hashed at rest; family revoke on reuse |
| Users | Upsert by `firebaseUid`; `UserRole` + `Permission` map |
| Guards | JWT, roles, permissions; active-user reload from DB |
| Web | Login/OTP/profile-setup; Firebase Web SDK phone OTP; Nest JWT session |
| Mobile | Expo auth feature; secure token storage patterns (production Firebase path deferred) |
| ADR | ADR 004 Firebase Auth + Postgres Users |
| Hardening | Prod build requires Firebase env; phone-testing blocked; open-redirect guard; fail-closed login flags |

---

## Acceptance Criteria

- [x] Real Firebase ID token exchanges for access + refresh (verified locally / staging-capable)  
- [x] Protected route without Bearer → 401  
- [x] Suspended/inactive user cannot use valid-looking tokens after DB status change  
- [x] Refresh rotation succeeds; reuse of old refresh revokes family  
- [x] Logout revokes refresh token(s) and writes audit log  
- [x] `@Permissions` / `@Roles` enforced on guarded mutations  
- [x] Production: staff/dev login always 403; web production builds require Firebase auth mode  
- [x] Staging/dev may use `AUTH_ALLOW_DEV_LOGIN` / `AUTH_ALLOW_STAFF_LOGIN` (never in production)  
- [x] Web unauthenticated users redirected away from sell/account protected pages  
- [ ] Mobile production Firebase phone path (deferred — backlog)

---

## Freeze audit (2026-08-02)

| Check | Result |
| --- | --- |
| TODO/FIXME/HACK in auth domains | None |
| `PHONE_TESTING` in production | Impossible (`NODE_ENV=production` + `next build` abort) |
| Debug / temp scripts | Removed |
| Secrets in git | None (`.env.local` gitignored; examples empty) |
| Dev login reachable in production | No (`resolveAuthLoginFlags` hard-off) |
| Hardcoded test phone/OTP in prod UI | Removed (dev OTP only when `authMode=dev`) |

Evidence commits: `b968ec8`, `751c635`.

---

## Deferred improvements (backlog only — do not implement during freeze)

1. httpOnly Secure cookie for refresh tokens (reduce XSS blast radius vs `localStorage`).  
2. Rehydrate / recover OTP confirmation across full page reload.  
3. Next.js middleware (or shared `RequireAuth`) for centralized unauthorized redirects.  
4. Web auth unit + CI smoke tests for login → refresh → logout.  
5. Mobile Expo Firebase production phone auth path (Release 0.2 Phase D).  
6. Remove legacy `api`/`mock` auth-mode aliases and `ALLOW_STAFF_DEV_LOGIN`.  
7. Map Firebase Admin verify failures to ops-friendly statuses without leaking internals.  
8. Content-Security-Policy hardening around auth pages.

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Dev bypass left enabled on internet-facing non-prod | Critical | Deploy config review; prod hard-off |
| Refresh reuse / race | High | Transactional rotate; integration tests |
| Firebase project mix-up | High | Separate projects per [`../deployment.md`](../deployment.md) |
| Expo Go Firebase gaps | Medium | EAS builds for real OTP (mobile deferred) |
| JWT secret leak | Critical | Secrets manager; rotate on suspicion |
| Google SMS anti-abuse (`error-code:-39`) | Medium | Ops/Support; not an AutoHub code path |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| Release 0.1 Foundation | Users table, API shell, Postgres |
| Firebase project(s) | Phone auth enabled; Blaze for SMS |
| Client env | `NEXT_PUBLIC_*` Firebase + `AUTH_MODE=firebase` |
| Security standard | [`../SECURITY_STANDARD.md`](../SECURITY_STANDARD.md) |

**Blocks:** Trusted 0.3+ writes, 0.4 sell/publish, 0.5 messaging authz, 1.0 launch  

---

## QA Checklist

- [x] New user login creates Postgres user once (no duplicates on repeat login)  
- [x] `/auth/me` returns role + permissions  
- [x] Access token expiry forces refresh path; UI recovers session  
- [x] Forced logout / revoked refresh → client returns to login  
- [x] Moderator/Admin role accounts can hit `/v1/admin/*`; USER cannot  
- [x] Auth audit rows present for login/refresh/logout  
- [ ] Mobile RTL login screens (mobile path deferred)  

---

## Rollback Plan

1. **Disable traffic** to new auth build if login broken.  
2. **Redeploy previous API** build known-good for auth.  
3. **Do not** drop `User` / `RefreshToken` tables. If a bad migration touched auth tables, restore DB snapshot from pre-deploy.  
4. **Firebase:** revert client config to previous project only if keys were rotated incorrectly — coordinate with mobile/web redeploy.  
5. **Emergency:** rotate `JWT` secret only with full session invalidation plan (all users re-login).  
6. Keep production staff/dev login hard-disabled during rollback.  
