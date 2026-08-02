# AutoHub Product Backlog

**Status:** Living index  
**Related:** [`../standards/ROADMAP.md`](../standards/ROADMAP.md), [`../releases/RELEASE_CHECKLIST.md`](../releases/RELEASE_CHECKLIST.md)

This file tracks engineering sprints against release trains. Full epic files may be added later; until then, use this index plus the release docs.

---

## Release 0.4 — Marketplace (active)

| Sprint | Focus | Status | Summary |
| --- | --- | --- | --- |
| 4 | Marketplace UX & Owner Experience (web) | **Completed** | Owner vs visitor listing detail; full Preview Mode; Action Registry; status badge + help; shared listing UI (`ListingSellerCard`, `ListingStats`, `ListingDescription`, breadcrumbs, share, recommendation strategies); My Listings wired to the same registry. No API/DB changes. Deferred: seller member-since, listing count, MediaAsset avatars. |
| RC | Release 0.4 Go / No-Go readiness | **Completed (docs)** | Reassessment after BUG-008: **GO FOR CLOSED BETA** (75% overall). Closed-beta marketplace P0 = 0. |
| 5 | P0/P1 remediation | **In progress** | Closed: plate approve/reject (BUG-001), admin plate create PENDING (BUG-008), lifecycle content-update hardening, **BUG-002 web auth (Release 0.2 FROZEN)**. Open P1: sell `next`, search URL, delete confirm, admin listing redirect, favorites strategy. |

### Auth freeze note

Release **0.2 Authentication** is **FROZEN** (web + API). Do not refactor auth unless a production bug is found. Deferred auth items live only in [`../releases/RELEASE_0.2_AUTHENTICATION.md`](../releases/RELEASE_0.2_AUTHENTICATION.md) (backlog). Mobile Firebase Phase D is a separate future item.

Evidence: `apps/web/src/features/listings/shared/`, vehicle/plate detail pages, `my-listings`.  
Release notes: [`../releases/RELEASE_0.4_MARKETPLACE.md`](../releases/RELEASE_0.4_MARKETPLACE.md).  
Go/No-Go: [`../releases/RELEASE_0.4_RC_GO_NO_GO.md`](../releases/RELEASE_0.4_RC_GO_NO_GO.md) · Bugs: [`../releases/RELEASE_0.4_BUG_BACKLOG.md`](../releases/RELEASE_0.4_BUG_BACKLOG.md).

---

## Conventions

- Mark a sprint **Completed** only after lint/typecheck/build for touched apps and product acceptance.
- Do not invent APIs or DB fields in client-only sprints; defer when payloads lack data.
- Prefer one feature (or one approved sprint slice) per change set.

---

## Epic portfolio (placeholder)

Planned epic docs (`EPIC_001` …) were scoped but not yet authored. Until they land, prioritize from release docs and this sprint table.
