# AutoHub Release Checklist

**Status:** Normative  
**Location:** `docs/releases/`  
**Related:** [`../standards/ROADMAP.md`](../standards/ROADMAP.md), [`../SECURITY_STANDARD.md`](../SECURITY_STANDARD.md), [`../GIT_WORKFLOW.md`](../GIT_WORKFLOW.md), [`../deployment.md`](../deployment.md)

Use this checklist for **every** numbered release document in this folder. A release is not “done” until the relevant boxes are checked and a go/no-go decision is recorded.

---

## 1. Release train

| Release | Codename | Intent |
| --- | --- | --- |
| [0.1](./RELEASE_0.1_FOUNDATION.md) | Foundation | Monorepo, DB hub, API shell, local infra |
| [0.2](./RELEASE_0.2_AUTHENTICATION.md) | Authentication | Firebase phone → JWT/RBAC |
| [0.3](./RELEASE_0.3_MEDIA.md) | Media | R2 / MediaAsset pipeline |
| [0.4](./RELEASE_0.4_MARKETPLACE.md) | Marketplace | Vehicles/plates, search, sell, web/admin/mobile browse |
| [0.5](./RELEASE_0.5_MESSAGING.md) | Messaging | Chat, notifications, moderation hooks |
| [0.6](./RELEASE_0.6_PAYMENTS.md) | Payments | Live payments/escrow/subscriptions (future) |
| [1.0](./RELEASE_1.0_PUBLIC_LAUNCH.md) | Public Launch | Iraq production launch gate |

Releases are **sequential for production promotion**. Later trains may be developed in parallel on branches, but production enablement follows dependencies listed in each release file.

---

## 2. Pre-release (engineering)

- [ ] Release doc updated (goals/features/AC/risks current)  
- [ ] Scope frozen — no new feature requests mid-cut  
- [ ] Migrations reviewed; `prisma migrate deploy` dry-run on staging  
- [ ] Feature flags / env defaults documented (esp. billing, auctions, dealers, auth bypass)  
- [ ] API Swagger reviewed for touched routes  
- [ ] Normative docs updated if architecture/business rules changed  
- [ ] No secrets in git; `.env.example` updated if new vars added  

### Quality gates

- [ ] `pnpm --filter @autohub/database` generate + migrate deploy (CI/staging)  
- [ ] `pnpm --filter @autohub/api` typecheck, lint, build, tests for touched domains  
- [ ] `pnpm --filter @autohub/web` typecheck, lint, build  
- [ ] `pnpm --filter @autohub/admin` typecheck, lint, build  
- [ ] `pnpm --filter @autohub/mobile` typecheck, lint (, tests) when mobile is in scope  
- [ ] CI green on the release branch  

---

## 3. Pre-release (product / QA)

- [ ] Acceptance criteria in the release doc all mapped to test cases  
- [ ] QA checklist in the release doc executed on **staging**  
- [ ] RTL + locale smoke (`ar` / `ku` / `en`) for user-facing surfaces in scope  
- [ ] Dual-currency smoke (IQD default, USD where applicable)  
- [ ] Auth modes verified: staging Firebase or explicit `AUTH_ALLOW_*`; production hard-disables staff/dev login; client prod builds are `firebase` (admin not `staff`)  
- [ ] Abuse paths considered (spam listing, report, suspend) for marketplace+ releases  

---

## 4. Security & ops

- [ ] Separate Firebase / R2 / DB credentials for staging vs production  
- [ ] CORS origins match real web/admin domains  
- [ ] JWT secrets rotated if this release touched auth crypto  
- [ ] Backups / PITR confirmed for Postgres  
- [ ] Health check `/v1/health` monitored  
- [ ] Rollback plan in the release doc reviewed by on-call  
- [ ] Runbook contacts current ([`../runbook.md`](../runbook.md))  

---

## 5. Go / no-go

| Signal | Go only if |
| --- | --- |
| P0 defects | Zero open |
| P1 defects | Waived in writing with owner + date |
| Migrations | Forward-only tested; rollback strategy clear |
| Flags | Dangerous modules default **off** until their release |
| Sign-off | Eng lead + product (and security for 0.2+ / 0.6 / 1.0) |

**Decision:** `_ GO / NO-GO _` **Date:** __________ **By:** __________

---

## 6. Deploy sequence (typical)

1. Maintenance window communicated (if migration locks expected)  
2. Deploy `@autohub/database` migrations (`migrate deploy`)  
3. Deploy `@autohub/api` (health green)  
4. Deploy `@autohub/web` / `@autohub/admin`  
5. Mobile: EAS build/submit or OTA only if release includes mobile  
6. Smoke production against the release QA subset  
7. Tag git: `v0.x.y` / `v1.0.0` matching the release doc  

---

## 7. Post-release

- [ ] Tag + release notes published (internal)  
- [ ] Monitor error rates / auth failures / upload failures for 24–72h  
- [ ] File follow-ups for waivers  
- [ ] Update [`../standards/ROADMAP.md`](../standards/ROADMAP.md) status if needed  
- [ ] If rollback occurred: incident note + ADR/tech-debt ticket  

---

## 8. Rollback authority

Any on-call engineer may trigger the release’s **Rollback Plan** if:

- Auth login broken for real users  
- Data corruption / failed migration  
- Media pipeline deleting or exposing wrong objects  
- Payment capture errors (0.6+)  

Record time, version from → to, and whether DB rollback or forward-fix was used.
