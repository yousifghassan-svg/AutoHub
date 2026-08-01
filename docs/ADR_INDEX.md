# AutoHub ADR Index

**Status:** Normative index  
**Location of ADRs:** [`docs/adr/`](./adr/)

Architecture Decision Records capture durable decisions. Sprint notes are historical delivery logs; ADRs are the decision source of truth when they conflict with informal commentary.

---

## How to use ADRs

1. Read this index before proposing structural changes.  
2. If a change reverses an Accepted ADR, write a new ADR (superseding) — do not silently violate the old one.  
3. Keep ADRs short: Context → Decision → Consequences.  
4. Link normative standards when operationalizing a decision (`standards/ARCHITECTURE.md`, `DATABASE_STANDARD.md`, etc.).

---

## Accepted ADRs

| ID | Title | Status | Summary | Document |
| --- | --- | --- | --- | --- |
| 001 | Hybrid Marketplace | Accepted | Ship v1 as classifieds; model payments/escrow/auctions/subscriptions as overlays on `Listing`, not a rewrite. | [`adr/001-hybrid-marketplace.md`](./adr/001-hybrid-marketplace.md) |
| 002 | Listing Hub + Category Details | Accepted | Single `Listing` hub with class-table inheritance detail models per category. | [`adr/002-listing-hub.md`](./adr/002-listing-hub.md) |
| 003 | Dual Currency & i18n | Accepted (revised) | `Currency` table + primary/optional secondary price FKs; locales `ar`/`ku`/`en` via translations. | [`adr/003-dual-currency-i18n.md`](./adr/003-dual-currency-i18n.md) |
| 004 | Firebase Auth + Postgres Users | Accepted | Firebase phone identity; Nest verifies tokens and upserts `User`; Postgres owns roles/authz; staff/dev login non-prod only. | [`adr/004-firebase-auth.md`](./adr/004-firebase-auth.md) |
| 005 | Web Bearer Tokens in localStorage | Accepted (temporary) | Keep web/admin JWTs in localStorage for 0.2; revisit httpOnly/BFF before 1.0. | [`adr/005-web-bearer-localstorage.md`](./adr/005-web-bearer-localstorage.md) |

---

## Decisions captured outside `/adr` (candidates to promote)

These are documented in sprint/architecture notes and should be treated as **binding practice** until formalized as ADRs:

| Topic | Where documented | Practical decision |
| --- | --- | --- |
| Vehicles vs plates domain separation | [`sprint-20-domain-separation.md`](./sprint-20-domain-separation.md) | Independent Nest domains + APIs; shared listing hub + `MarketplaceDomain` |
| Financial foundation / currency-scoped search | [`sprint-24-financial-foundation.md`](./sprint-24-financial-foundation.md) | No FX conversion in sort/filter; payment providers interfaces-only |
| API DDD modular monolith | [`api-ddd-architecture.md`](./api-ddd-architecture.md) | Domain folders + envelope + composition root |
| Web dynamic sell wizard plugins | `apps/web/src/features/sell` (+ vehicle/plate plugins) | Domain-agnostic wizard host; domains own steps/validators/submit |
| Media pipeline hardening needed | [`sprint-13-architecture-review.md`](./sprint-13-architecture-review.md), [`sprint-13-security-report.md`](./sprint-13-security-report.md) | Dual media systems are tech debt; attach via validated MediaAsset |

When these are challenged, prefer writing the next free `adr/00N-…` rather than scattering new rules only in chat.

---

## Suggested next ADR numbers

Use the next free integer filename:

| Proposed ID | Candidate topic |
| --- | --- |
| 006 | MarketplaceDomain split (VEHICLE/PLATE) as durable boundary |
| 007 | Media attach must use validated `mediaAssetId` |
| 008 | Currency-scoped search/sort without implicit FX |
| 009 | Domain-plugin sell/create architecture for new verticals |
| 010 | httpOnly cookie / BFF session (supersedes ADR 005) |

---

## Related normative docs

- [`standards/ARCHITECTURE.md`](./standards/ARCHITECTURE.md)  
- [`BUSINESS_RULES.md`](./BUSINESS_RULES.md)  
- [`DATABASE_STANDARD.md`](./DATABASE_STANDARD.md)  
- [`API_STANDARD.md`](./API_STANDARD.md)  
- [`SECURITY_STANDARD.md`](./SECURITY_STANDARD.md)  
- [`AI_GUIDELINES.md`](./AI_GUIDELINES.md)  

---

## Historical note

Older overview docs [`architecture.md`](./architecture.md) and [`roadmap.md`](./roadmap.md) remain for historical reference and are **not** overwritten by the engineering standards pack. Canonical planning/architecture standards live under [`standards/`](./standards/).
