# Release 0.4 — Marketplace

**Version:** `0.4.x`  
**Codename:** Marketplace  
**Production intent:** End-to-end classifieds for vehicles & plates (browse, search, sell, manage)  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)  
**Go / No-Go review:** [`RELEASE_0.4_RC_GO_NO_GO.md`](./RELEASE_0.4_RC_GO_NO_GO.md) · [`RELEASE_0.4_BUG_BACKLOG.md`](./RELEASE_0.4_BUG_BACKLOG.md) · [`RELEASE_0.4_TECH_DEBT.md`](./RELEASE_0.4_TECH_DEBT.md)

**RC decision (2026-08-01):** **GO FOR INTERNAL TESTING** — not closed/public beta. No fixes until explicitly approved.

---

## Goals

- Ship independent **VEHICLE** and **PLATE** marketplace domains on the shared listing hub.  
- Enable public discovery (search/filter/sort) with correct visibility (ACTIVE only for public).  
- Enable authenticated create/edit/status flows on web, mobile, and admin moderation tools.  
- Support dual currency (IQD default, USD) with currency-scoped price filters.  
- Deliver domain-agnostic web sell wizard + mobile domain create flows without breaking drafts/URLs.  
- Deliver owner vs visitor listing-detail UX with status-aware owner actions (web).

### Sprint status (Release 0.4 engineering)

| Sprint | Focus | Status |
| --- | --- | --- |
| 4 | Marketplace UX & Owner Experience (web) | **Completed** |
| RC | Full marketplace Go / No-Go validation | **Completed (docs)** — decision: GO FOR INTERNAL TESTING |
| 5 | Remediation / polish (P0–P1) | **Not started** — blocked on fix approval |

**Sprint 4 delivered (web, no API/DB changes):**

- Owner vs visitor chrome on vehicle and plate detail (`isListingOwner`, Preview Mode with Exit banner)
- Action Registry (`ListingActions.getActions`) driving Edit / Pause / Activate / Republish / Mark sold / Delete / Preview
- `ListingStatusBadge` (badge + help text) for Draft → Rejected
- Shared listing UI under `features/listings/shared/` (`ListingSellerCard`, `ListingStats`, `ListingDescription`, breadcrumbs, share, recommendations)
- My Listings uses the same owner Action Registry (`surface: manage`)
- Deferred (no API fields): seller member-since, seller listing count, MediaAsset avatars

---

## Features

| Area | Deliverable |
| --- | --- |
| API | `/v1/vehicles`, `/v1/plates`, catalog/filters, currencies, listing status transitions |
| Search | Keyword/filters; currency-scoped min/max/sort; featured/verified signals |
| Web | Home/search/detail, `/sell` plugin wizard, my-listings, dealers browse as shipped |
| Web owner UX | Owner/visitor detail split, Preview Mode, Action Registry, status badge, share, similar listings |
| Mobile | Home, search, detail, `/sell/vehicle` & `/sell/plate`, manage lists |
| Admin | Vehicles/plates CRUD-ish ops, dashboard stats, reports entry points |
| Lifecycle | `DRAFT` → `PENDING` → `ACTIVE` (+ reserved/sold/archived/rejected rules) |
| Financial foundation | Currency catalog API; Money VO; no silent FX |
| Standards | Domain separation (sprint 20), business rules, sell plugins |

---

## Acceptance Criteria

- [ ] Guest can browse ACTIVE vehicles and plates; cannot see others’ DRAFT/PENDING  
- [ ] Authenticated seller can create vehicle listing (draft + submit for review)  
- [ ] Authenticated seller can create plate listing with valid plate fields  
- [ ] `/sell` URL unchanged; legacy web drafts migrate or restore safely  
- [ ] Mobile hub opens vehicle/plate wizards (not legacy listings-only wizard for new work)  
- [ ] Search price filter with IQD vs USD does not mix currencies  
- [ ] Owner can change status along allowed transitions; non-owner cannot  
- [ ] Moderator can approve/reject PENDING → ACTIVE/REJECTED  
- [ ] Admin dashboard loads vehicle/plate summaries with currency breakdown  
- [ ] Plate formats: Erbil strictness behavior matches admin configuration  
- [ ] Contact click / WhatsApp/phone paths do not expose hidden listings  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Visibility bugs after pagination | Critical | SQL-level ACTIVE enforcement; regression tests |
| Domain bleed (vehicle code writing PLATE) | High | Domain repos always set/filter domain |
| Sell draft step remap regressions | Medium | Draft v2 + legacy mapper tests/QA |
| Search relevance weak | Low | Accept heuristic for pre-1.0; document |
| Legacy mobile `/sell/wizard` confusion | Medium | Hub links domain routes only |
| PARTS/RENTAL dormant categories | Low | Keep out of sell UI until owned |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| 0.1 Foundation | Listing hub, seed catalogs |
| 0.2 Authentication | Sellers + staff RBAC |
| 0.3 Media | Photos on listings (optional attach still allowed) |
| Redis | As used by API infra/rate limits |
| Business rules | [`../BUSINESS_RULES.md`](../BUSINESS_RULES.md) |

**Blocks:** Meaningful 0.5 listing-scoped chat; 1.0 consumer launch  

---

## QA Checklist

### Public

- [ ] Vehicles search + detail (ar/en smoke)  
- [ ] Plates search + detail + plate visual  
- [ ] Empty states and 404 for missing ids  

### Seller

- [ ] Web sell: CAR full path; PLATE path skips Media step  
- [ ] Save draft + submit for review  
- [ ] Resume local draft after refresh  
- [ ] Mobile create vehicle + plate; resume by `localId`  
- [ ] My listings / my vehicles / my plates status actions  
- [x] Owner detail: manage actions by status; no Favorite/Contact on owner chrome  
- [x] Preview Mode hides owner actions; Exit Preview restores owner view  
- [x] Visitor detail: contact / favorite / share paths (ACTIVE public listings)  

### Staff

- [ ] Admin login; vehicles list/detail; plates list  
- [ ] Approve/reject pending listing  
- [ ] Report queue smoke  

### Money / i18n

- [ ] Create with USD; search USD range  
- [ ] IQD default when currency omitted where specified  
- [ ] RTL layout smoke on web + mobile  

---

## Rollback Plan

1. Redeploy previous API + web + admin (+ mobile OTA/previous store build if needed).  
2. **Migrations:** Prefer forward-fix. If destructive migration shipped, restore Postgres snapshot from pre-deploy; re-apply last known-good migrate deploy.  
3. Feature-flag off any experimental domain routes only if flags exist; otherwise full app rollback.  
4. Local drafts may reference new step ids — document that users may need to re-enter sell wizard after rollback.  
5. Do not mass-delete listings on rollback.  
