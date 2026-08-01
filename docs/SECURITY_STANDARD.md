# AutoHub Security Standard

**Status:** Normative  
**Related:** [`auth-architecture.md`](./auth-architecture.md), [`sprint-13-security-report.md`](./sprint-13-security-report.md), [`API_STANDARD.md`](./API_STANDARD.md), ADR 004

---

## 1. Security objectives

- Protect user accounts and sessions (phone-auth marketplace)  
- Enforce least-privilege RBAC on mutations and admin surfaces  
- Prevent listing/media data leaks across sellers  
- Keep secrets and bypasses out of production  
- Fail closed on authz and token reuse

---

## 2. Authentication

### Production model

- Identity: **Firebase Phone Authentication**  
- Authorization source of truth: **Postgres `User`** (role, status, permissions derived from role)  
- API issues short-lived **JWT access** + rotating **refresh** tokens  

### Development-only escapes

| Mechanism | Allowed | Forbidden |
| --- | --- | --- |
| `AUTH_ALLOW_DEV_LOGIN` / `AUTH_ALLOW_STAFF_LOGIN` | Development & staging | Production (hard-off; env cannot enable) |
| Legacy `ALLOW_STAFF_DEV_LOGIN` | Dual-read in 0.2 only (deprecated) | Production; remove in 0.3 |
| Web/Mobile `NEXT_PUBLIC_AUTH_MODE` / `EXPO_PUBLIC_AUTH_MODE=dev` | Local/staging with API | Production builds (fail closed; must be `firebase`) |
| Admin `NEXT_PUBLIC_AUTH_MODE=staff` | Local/staging | Production builds (fail closed) |

Staging/production must use separate Firebase projects and real credentials ([`deployment.md`](./deployment.md)).

---

## 3. Session security

- Access JWT carries `sub`, `role`, `permissions`, `firebaseUid`, `phone` — treat as bearer secret.  
- Refresh tokens stored hashed (SHA-256); rotation must be transactional.  
- Reuse of a revoked refresh token → revoke the token **family**.  
- Logout revokes refresh token(s) and writes audit (`AuthAuditLog`).  
- Guards reload user from DB and must reject suspended/inactive users.

---

## 4. Authorization (RBAC)

Roles (`UserRole`): `USER`, `DEALER`, `MODERATOR`, `DEALER_MANAGER`, `SUPPORT`, `ADMIN`, `SUPER_ADMIN`.

Permissions are fine-grained (`Permission` enum, `resource:action`). See [`BUSINESS_RULES.md`](./BUSINESS_RULES.md) for role intent.

**Rules**

- Protect mutations with `@Permissions` / `@Roles` consistent with neighboring routes.  
- Owner checks (`assertCanManage` pattern) on listing/media update/delete.  
- `PENDING → ACTIVE` / `PENDING → REJECTED` require moderation privileges.  
- Admin routes under `/v1/admin/*` require admin access permission.  
- Do not trust client-supplied `sellerId` / `userId` for ownership.

---

## 5. Listing visibility

- Public/anonymous search and detail must not expose non-ACTIVE listings.  
- Visibility filtering must happen in **query/SQL**, not only after pagination (fixed class of bug in sprint 13).  
- Owners and staff may see their non-public listings through explicit “mine”/admin paths.

---

## 6. Input validation & output safety

- Global validation: `whitelist` + `forbidNonWhitelisted`.  
- Exception filter returns generic 500 messages — never raw Prisma/Error strings.  
- Apply `@MaxLength` (and equivalents) on free-text fields when extending DTOs.  
- File uploads: reject missing/invalid files with 400s; use existing media type checks.

---

## 7. Media & storage

- Private write path uses signed/multipart upload to R2 via media domain.  
- Soft-delete DB rows before or with best-effort storage delete (ordering lessons from sprint 13).  
- **Hardening standard:** do not permanently trust client-provided `r2Key`/mime/size on listing attach — prefer validated `MediaAsset` completion + scan status.

---

## 8. Transport & edge protections

- Helmet enabled on API  
- CORS restricted to configured origins (web `:3000`, admin `:3001` locally)  
- Global throttling enabled; sensitive routes should keep or tighten `@Throttle` where neighbors do (media uploads are a reference)  
- TLS termination at the host/platform in staging/prod  

---

## 9. Secrets management

**Never commit**

- `.env`, `.env.local`, Firebase private keys, R2 keys, JWT secrets  

**Do**

- Use `.env.example` with non-secret placeholders only  
- Store production secrets in host secret managers / Doppler (per deployment doc)  
- Rotate JWT secrets and Firebase keys on suspected leak  

---

## 10. Content abuse & ops

Follow [`content-policy.md`](./content-policy.md) and [`runbook.md`](./runbook.md):

- Reports queue review  
- Remove listings / suspend users via admin APIs  
- Plate format updates without redeploy where admin APIs exist  

---

## 11. Production checklist (security slice)

1. Production API: staff/dev login always disabled  
2. Production client builds: web/mobile `firebase`, admin not `staff`  
3. Distinct Firebase projects for staging/prod  
4. CORS origins = real web/admin domains only  
5. `prisma migrate deploy` applied  
6. Observability (Sentry/OTel) planned before scale  
7. Commerce feature flags remain off until payment threat model is reviewed  

---

## 12. Inconsistencies → standard

| Finding | Standard |
| --- | --- |
| Listing media attach may trust `r2Key` | Migrate to MediaAsset-validated attach |
| Rate limits uneven across create endpoints | Add throttle on listing/domain creates similar to media |
| 403 vs 404 ownership disclosure mixed | Prefer consistent non-leak behavior on private resources |
| Expo Go Firebase wiring gaps | Document mock vs api for testers; never ship mock to store |

---

## 13. Incident posture

- Auth audit logs exist for login/refresh/logout — preserve them.  
- Admin audit logs for privileged actions — use them for new admin mutations.  
- On suspected refresh-token theft: revoke family, force re-login, rotate JWT secret if needed.  
