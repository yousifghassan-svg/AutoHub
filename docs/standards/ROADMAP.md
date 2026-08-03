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
| Search & discovery | **FROZEN** — Postgres FTS vehicle web path + URL SSOT (`RELEASE_0.4_SEARCH_DISCOVERY.md`, tag `search-0.4-freeze`) |
| Marketplace & listings (production harden) | **FROZEN** — Sell/draft/quality/media trust/edit/manage (`RELEASE_0.5_MARKETPLACE.md`, tag `marketplace-0.5-freeze`) |
| Media platform | MediaAsset + R2 + listing attach |
| Mobile consumer app | Expo design system, auth, home, detail, create, manage |
| Web marketplace | Browse/search/sell/chat/favorites/notifications |
| Web owner/visitor UX (Sprint 4) | Preview Mode, Action Registry, status badges, shared listing chrome under `features/listings/shared/` |
| Admin operations | Dashboard, vehicles/plates, users, reports, communication, settings |
| Realtime communication | Conversations, Socket.IO, notifications |
| Financial foundation | Currency catalog, Money VO, currency-scoped search; payment **interfaces only** |
| Dynamic sell wizard (web) | Domain-agnostic host + vehicle/plate plugins |

---

## 3. Release train (normative)

| Release | Codename | Status |
| --- | --- | --- |
| 0.2 | Authentication | **FROZEN** (`auth-0.2-freeze`) |
| 0.3 | Media | Shipped; trust gap closed under **0.5** |
| 0.4 | Marketplace (closed beta) | Closed-beta GO; Search sub-freeze **FROZEN** |
| **0.5** | **Marketplace & Listings** | **FROZEN** (`marketplace-0.5-freeze`) |
| 0.6 | Messaging | **Current** next product train (was 0.5) |
| 0.7 | Payments | Future (was 0.6) |
| 0.8 | Trust & Verification | Stub |
| 0.9 | Dealer Platform | Stub |
| 1.0 | Public Launch | Gate |

---

## 4. Near-term engineering (current focus)

| Priority | Item | Outcome |
| --- | --- | --- |
| P0 | Keep frozen Auth + Search + Marketplace 0.5 stable | No drive-by refactors; hotfixes only |
| P1 | **Release 0.6 — Messaging** | Chat, notifications, moderation hooks on real listings |
| P1 | Staging smoke for 0.5 marketplace | Ops prerequisite recorded in production report |
| P2 | Mobile Firebase phone auth (0.2 Phase D) | Deferred — do not reopen web auth freeze |
| P2 | Outbox / async workers | Replace Alpha in-process timers where needed |
| P2 | CI completeness | Add mobile lint/typecheck (and tests where stable) to CI |
| P2 | Mobile sell host = web plugin parity | Deferred (0.5 freeze backlog) |

---

## 5. Product candidates (after 0.5+)

Ordered by dependency, not commitment:

1. **Messaging (0.6)** — listing chat, notifications, moderation hooks  
2. **Trust & Verification (0.8)** — stronger report queues, verification workflows  
3. **Dealer platform (0.9)** — multi-user orgs (schema exists; product deferred historically)  
4. **Billing / featured listings** — subscriptions overlay on listings  
5. **Payments & escrow (0.7)** — activate `payments` providers behind flags; never mix currencies silently  
6. **Auctions** — `Auction` / bids overlay; reserved listing statuses already modeled  
7. **New marketplace domains** — Real Estate, Boats, Jobs, Services via listing-hub + domain modules + sell plugins  

Feature flags / env gates (concept from deployment docs): keep billing/auctions/dealers **off** until modules are product-ready.

---

## 6. Explicitly deferred / out of scope (for now)

- Rewriting the listing hub into per-vertical databases  
- Custom OTP stack replacing Firebase for v1  
- Live payment capture in production  
- FX conversion across currencies in search sort  
- Treating legacy mobile `/sell/wizard` (`/v1/listings`) as the future create path  
- **Authentication refactors** while Release 0.2 is **FROZEN** (see deferred list in `RELEASE_0.2_AUTHENTICATION.md`)  
- **Search & Discovery refactors** while Priority 4 is **FROZEN** (see deferred list in `RELEASE_0.4_SEARCH_DISCOVERY.md`)  
- **Marketplace & Listings refactors** while Release 0.5 is **FROZEN** (see deferred list in `RELEASE_0.5_MARKETPLACE.md`)  
- **Marketplace rebuild** — Release 0.5 extended existing sell/listings; does not replace the hub  

---

## 7. Definition of “done” for a sprint

1. Plan approved before code (see [`../AI_GUIDELINES.md`](../AI_GUIDELINES.md))  
2. One feature per change set  
3. Typecheck + lint + build for touched apps  
4. Backward compatible APIs and drafts/URLs unless migration is explicit  
5. Docs updated when architecture or business rules change  

---

## 8. Related links

- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)  
- Business rules: [`../BUSINESS_RULES.md`](../BUSINESS_RULES.md)  
- ADRs: [`../ADR_INDEX.md`](../ADR_INDEX.md)  
- Deployment: [`../deployment.md`](../deployment.md)  
- Runbook: [`../runbook.md`](../runbook.md)  
