# Release 0.2 — Authentication

**Version:** `0.2.x`  
**Codename:** Authentication  
**Production intent:** Secure identity for all subsequent product releases  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

---

## Goals

- Ship Firebase Phone Authentication integrated with NestJS.  
- Issue API **JWT access** + rotating **refresh** tokens; persist users in Postgres.  
- Enforce RBAC (roles + fine-grained permissions) on protected routes.  
- Provide client auth flows (web, mobile) with explicit mock/dev bypass **off** in staging/prod.  
- Capture auth audit events for login/refresh/logout.  

### Phase status

| Phase | Status |
| --- | --- |
| 0 — Auth cleanup | Done |
| A — API hardening | Done (prod JWT/Firebase validation, auth throttles, gate tests) |
| B — Profile API | Not started |
| C/D — Web/Mobile Firebase | Not started |
| E — Route protection polish | Not started |

---

## Features

| Area | Deliverable |
| --- | --- |
| API auth domain | `POST /v1/auth/login`, refresh, logout, `GET /v1/auth/me` |
| Tokens | Access JWT (HS256); opaque refresh hashed at rest; family revoke on reuse |
| Users | Upsert by `firebaseUid`; `UserRole` + `Permission` map |
| Guards | JWT, roles, permissions; active-user reload from DB |
| Web | Login/OTP/profile-setup paths; auth provider; mock mode for local only |
| Mobile | Expo auth feature; secure token storage patterns |
| ADR | ADR 004 Firebase Auth + Postgres Users |
| Hardening | Safe exception mapping; refresh rotation transactional (sprint 13 class fixes) |

---

## Acceptance Criteria

- [ ] Real Firebase ID token exchanges for access + refresh on staging  
- [ ] Protected route without Bearer → 401  
- [ ] Suspended/inactive user cannot use valid-looking tokens after DB status change  
- [ ] Refresh rotation succeeds; reuse of old refresh revokes family  
- [ ] Logout revokes refresh token(s) and writes audit log  
- [ ] `@Permissions` / `@Roles` enforced on sample guarded mutations  
- [ ] Production: staff/dev login always 403; client production builds require Firebase auth mode (admin must not use staff)  
- [ ] Staging/dev may use `AUTH_ALLOW_DEV_LOGIN` / `AUTH_ALLOW_STAFF_LOGIN` (or deprecated `ALLOW_STAFF_DEV_LOGIN`)  
 
- [ ] Web unauthenticated users redirected away from sell/account protected pages  
- [ ] Mobile can complete phone auth in API mode (or documented device limitation acknowledged)  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Dev bypass left enabled | Critical | Release checklist + deploy config review |
| Refresh reuse / race | High | Transactional rotate; integration tests |
| Firebase project mix-up (prod keys on staging) | High | Separate projects per [`../deployment.md`](../deployment.md) |
| Expo Go Firebase gaps | Medium | Document mock vs api for testers; EAS builds for real OTP |
| JWT secret leak | Critical | Secrets manager; rotate on suspicion |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| Release 0.1 Foundation | Users table, API shell, Postgres |
| Firebase project(s) | Phone auth enabled |
| Client env | `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*` API URLs; auth mode flags |
| Security standard | [`../SECURITY_STANDARD.md`](../SECURITY_STANDARD.md) |

**Blocks:** Trusted 0.3+ writes, 0.4 sell/publish, 0.5 messaging authz, 1.0 launch  

---

## QA Checklist

- [ ] New user login creates Postgres user once (no duplicates on repeat login)  
- [ ] `/auth/me` returns role + permissions  
- [ ] Access token expiry forces refresh path; UI recovers session  
- [ ] Forced logout / revoked refresh → client returns to login  
- [ ] Moderator/Admin role accounts can hit `/v1/admin/*` smoke route; USER cannot  
- [ ] Web mock mode clearly fails protected listing publish (expected)  
- [ ] Auth audit rows present for login/refresh/logout  
- [ ] RTL login screens usable on mobile/web  

---

## Rollback Plan

1. **Disable traffic** to new auth build if login broken.  
2. **Redeploy previous API** build known-good for auth.  
3. **Do not** drop `User` / `RefreshToken` tables. If a bad migration touched auth tables, restore DB snapshot from pre-deploy.  
4. **Firebase:** revert client config to previous project only if keys were rotated incorrectly — coordinate with mobile/web redeploy.  
5. **Emergency:** rotate `JWT` secret only with full session invalidation plan (all users re-login).  
6. Keep production staff/dev login hard-disabled during rollback.  
