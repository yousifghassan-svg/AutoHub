# AutoHub Product & Engineering Roadmap

**Status:** Normative planning view  
**Historical sprint table (unchanged):** [`../roadmap.md`](../roadmap.md)

This roadmap reflects **what the repository has actually shipped**, plus near-term engineering priorities. It supersedes the stale “awaiting approval at sprint 14” narrative in the historical roadmap for planning purposes; the historical file remains for archive context.

---

## 1. North star

Launch a trusted Iraq marketplace for **vehicles and plates** as classifieds, with architecture ready for dealers, payments, auctions, and new verticals.

---

## 2. Shipped foundation (completed)

| Theme | Evidence in repo |
| --- | --- |
| Database listing hub | `packages/database` — currencies, categories, geo, detail tables, commerce placeholders |
| API DDD monolith | `apps/api` domains + envelope + Swagger |
| Auth + RBAC | **FROZEN** — Web Firebase phone → Nest JWT/refresh; permissions enum (`RELEASE_0.2`) |
| Vehicles & plates domain split | Sprint 20 APIs + admin/web surfaces |
| Search & discovery | Search domain + client filters |
| Media platform | MediaAsset + R2 + listing attach |
| Mobile consumer app | Expo design system, auth, home, detail, create, manage |
| Web marketplace | Browse/search/sell/chat/favorites/notifications |
| Web owner/visitor UX (Sprint 4) | Preview Mode, Action Registry, status badges, shared listing chrome under `features/listings/shared/` |
| Admin operations | Dashboard, vehicles/plates, users, reports, communication, settings |
| Realtime communication | Conversations, Socket.IO, notifications |
| Financial foundation | Currency catalog, Money VO, currency-scoped search; payment **interfaces only** |
| Dynamic sell wizard (web) | Domain-agnostic host + vehicle/plate plugins |

---

## 3. Near-term engineering (current focus)

| Priority | Item | Outcome |
| --- | --- | --- |
| P0 | Keep production classifieds stable | No drive-by refactors; one feature at a time |
| P1 | **Priority 4 — Search & Discovery** | Postgres FTS on vehicle web path; URL sync; quality gate — see `docs/releases/PRIORITY_4_SEARCH_DISCOVERY.md` (P4-0 baseline recorded) |
| P1 | Release 0.4 RC follow-up | Go/No-Go: **GO FOR CLOSED BETA** (75%); remaining P1 polish + staging smoke before invites — see `docs/releases/RELEASE_0.4_RC_GO_NO_GO.md` |
| P1 | Media attach unification | Close `r2Key` trust gap; single validated attach path |
| P2 | Mobile Firebase phone auth (0.2 Phase D) | Deferred backlog — do not reopen web auth freeze |
| P2 | Outbox / async workers | Replace Alpha in-process timers where needed |
| P2 | CI completeness | Add mobile lint/typecheck (and tests where stable) to CI |
| P2 | Mobile sell alignment | Config/plugin approach parity with web sell host (separate feature) |

---

## 4. Product candidates (after stability)

Ordered by dependency, not commitment:

1. **Moderation & trust UX** — stronger report queues, verification workflows for listings/plates/dealers  
2. **Dealer platform** — multi-user orgs (schema exists; product deferred historically)  
3. **Billing / featured listings** — subscriptions overlay on listings  
4. **Payments & escrow** — activate `payments` providers behind flags; never mix currencies silently  
5. **Auctions** — `Auction` / bids overlay; reserved listing statuses already modeled  
6. **New marketplace domains** — Real Estate, Boats, Jobs, Services via listing-hub + domain modules + sell plugins  

Feature flags / env gates (concept from deployment docs): keep billing/auctions/dealers **off** until modules are product-ready.

---

## 5. Explicitly deferred / out of scope (for now)

- Rewriting the listing hub into per-vertical databases  
- Custom OTP stack replacing Firebase for v1  
- Live payment capture in production  
- FX conversion across currencies in search sort  
- Treating legacy mobile `/sell/wizard` (`/v1/listings`) as the future create path  
- **Authentication refactors** while Release 0.2 is **FROZEN** (see deferred list in `RELEASE_0.2_AUTHENTICATION.md`)  

---

## 6. Definition of “done” for a sprint

1. Plan approved before code (see [`../AI_GUIDELINES.md`](../AI_GUIDELINES.md))  
2. One feature per change set  
3. Typecheck + lint + build for touched apps  
4. Backward compatible APIs and drafts/URLs unless migration is explicit  
5. Docs updated when architecture or business rules change  

---

## 7. Related links

- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)  
- Business rules: [`../BUSINESS_RULES.md`](../BUSINESS_RULES.md)  
- ADRs: [`../ADR_INDEX.md`](../ADR_INDEX.md)  
- Deployment: [`../deployment.md`](../deployment.md)  
- Runbook: [`../runbook.md`](../runbook.md)  
