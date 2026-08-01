# Release 1.0 — Public Launch

**Version:** `1.0.0`  
**Codename:** Public Launch  
**Production intent:** Iraq public marketplace launch (classifieds-first)  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

---

## Goals

- Open AutoHub to real users in Iraq with production-grade reliability and security.  
- Launch **classifieds** for vehicles and plates: browse, search, sell, message, moderate.  
- Meet operational readiness (backups, monitoring, runbooks, store listings).  
- Explicitly decide whether 0.6 Payments is **in** launch scope or **waived** (default: waived — off-platform payment).  
- Freeze scope; ship a trustworthy MVP, not every future vertical.

---

## Features

### Must ship (launch MVP)

| Area | Capability |
| --- | --- |
| Auth (0.2) | Firebase phone → JWT; no dev bypass |
| Media (0.3) | Upload + attach; known P0 media-trust items closed or explicitly accepted with compensating controls |
| Marketplace (0.4) | Vehicles + plates; sell; search; my listings; admin moderation |
| Messaging (0.5) | Listing chat + reports/blocks + basic notifications |
| Platforms | Production web + API + admin; mobile on App Store / Play (or staged soft launch plan) |
| Locale/money | Arabic-primary RTL; IQD default; USD supported where built |
| Ops | Health checks, backups, CORS, separate Firebase/R2/DB, on-call |

### Explicitly out of launch MVP (unless re-scoped in writing)

- Live payments / escrow (0.6) — remain flagged off  
- Auctions live bidding  
- Full dealer multi-user platform  
- New verticals (Real Estate, Boats, Jobs, …)  
- Perfect search ranking (`ts_rank`)  

---

## Acceptance Criteria

### Product

- [ ] New user can register via phone OTP on production  
- [ ] User can publish a vehicle and a plate listing through review to ACTIVE (or documented auto-path)  
- [ ] Guests can discover ACTIVE listings on web and mobile  
- [ ] Buyer can message seller; seller can reply  
- [ ] Moderator can remove abusive listing and suspend user per runbook  
- [ ] Dual currency display correct; search currency-scoped  

### Engineering / security

- [ ] All prior release ACs for 0.1–0.5 either satisfied or waived with owner  
- [ ] [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md) fully checked  
- [ ] Production staff/dev login hard-disabled; all prod clients use Firebase auth modes (no staff/dev/mock)  
- [ ] Penetration/smoke security pass (authz, visibility, upload)  
- [ ] `/v1/health` monitored with alert  
- [ ] Postgres PITR/backups verified with a restore drill on staging  
- [ ] Error tracking (e.g. Sentry) receiving events from API/web  

### Legal / go-to-market

- [ ] Content policy published/linked  
- [ ] Store listings + privacy text approved  
- [ ] Support contact / on-call rotation documented  

### Payments decision

- [ ] **Either** 0.6 AC satisfied and flag on **or** written waiver: “1.0 classifieds-only; payments off”  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Auth outage (Firebase) | Critical | Status monitoring; support playbook; status comms |
| Spam flood at launch | High | Throttle, moderation staffing, report queue SLAs |
| Media trust backlog unfixed | High | Must close or compensate before launch |
| Mobile store rejection delay | Medium | Web-first soft launch contingency |
| Scope creep (payments/dealers) | High | This document’s out-of-scope list |
| Data loss | Critical | Backups + restore drill |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| Releases 0.1–0.5 | Completed and production-hardened |
| 0.6 Payments | Optional; default waived |
| Hosting | API + web + admin + Postgres + Redis + R2 per [`../deployment.md`](../deployment.md) |
| EAS / stores | Mobile binaries |
| Staffing | Moderators + on-call for first 72h |
| Standards pack | Architecture, security, business rules current |

---

## QA Checklist

### End-to-end (production-like staging first, then prod smoke)

- [ ] OTP login on iOS + Android + web  
- [ ] Sell vehicle with photos → pending → admin approve → public search  
- [ ] Sell plate → public plate search  
- [ ] Message thread realtime  
- [ ] Report listing → moderator remove  
- [ ] Suspend user → cannot login/create  
- [ ] Currency IQD + USD paths  
- [ ] RTL ar + ku smoke; en LTR smoke  
- [ ] Admin dashboard stats load under seed/prod-like data  
- [ ] Performance smoke: home/search p95 acceptable for launch traffic assumption  

### Ops

- [ ] Backup restore drill evidence attached to release record  
- [ ] Alert fires on intentional health fail test  
- [ ] Rollback rehearsal documented (see below)  

---

## Rollback Plan

### Severity S1 (launch broken: auth, data corruption, security incident)

1. Take marketplace write paths to maintenance (API feature flag / maintenance page on web; mobile force-update or disable sell).  
2. Redeploy last known-good API + web + admin tags (`v0.5.x` or prior `v1.0.0-rc`).  
3. If migration caused corruption: restore Postgres to pre-launch snapshot; re-play only safe migrations with DBA approval.  
4. Invalidate sessions if auth secret compromised (JWT rotate + force re-login).  
5. Incident channel + public status update within agreed SLA.  

### Severity S2 (single feature broken: chat or upload)

1. Disable the feature via config/flag or prior client build.  
2. Keep browse + auth up if safe.  
3. Hotfix forward preferred over full DB rollback.  

### Severity S3 (cosmetic / minor)

1. Forward fix in patch `1.0.x`.  
2. No full rollback.  

### Post-rollback

- [ ] Preserve forensic logs and payment/audit tables if any  
- [ ] Write incident summary  
- [ ] Re-run go/no-go before reopening sell or signup  

---

## Go / no-go record

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Engineering lead | | GO / NO-GO | |
| Product | | GO / NO-GO | |
| Security / ops | | GO / NO-GO | |

**Launch version tag:** `v1.0.0`  
**Payments in launch:** YES / NO (default NO)  
