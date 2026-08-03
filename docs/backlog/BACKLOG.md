# AutoHub Product Backlog

**Status:** Living index  
**Related:** [`../standards/ROADMAP.md`](../standards/ROADMAP.md), [`../releases/RELEASE_CHECKLIST.md`](../releases/RELEASE_CHECKLIST.md)

This file tracks engineering sprints against release trains. Full epic files may be added later; until then, use this index plus the release docs.

---

## Release 0.4 — Marketplace (closed beta)

| Sprint | Focus | Status | Summary |
| --- | --- | --- | --- |
| 4 | Marketplace UX & Owner Experience (web) | **Completed** | Owner vs visitor listing detail; full Preview Mode; Action Registry; status badge + help; shared listing UI (`ListingSellerCard`, `ListingStats`, `ListingDescription`, breadcrumbs, share, recommendation strategies); My Listings wired to the same registry. No API/DB changes. Deferred: seller member-since, listing count, MediaAsset avatars. |
| RC | Release 0.4 Go / No-Go readiness | **Completed (docs)** | Reassessment after BUG-008: **GO FOR CLOSED BETA** (75% overall). Closed-beta marketplace P0 = 0. |
| 5 | P0/P1 remediation | **In progress / absorbed by 0.5** | Closed: plate approve/reject (BUG-001), admin plate create PENDING (BUG-008), lifecycle content-update hardening, **BUG-002 web auth (Release 0.2 FROZEN)**, **BUG-005 search URL + Priority 4 Search FROZEN**, **BUG-004 sell `?next=` (P5-1)**. Remaining: delete confirm, admin listing redirect, favorites strategy (+ other 0.5 slices). |

### Auth freeze note

Release **0.2 Authentication** is **FROZEN** (web + API). Do not refactor auth unless a production bug is found. Deferred auth items live only in [`../releases/RELEASE_0.2_AUTHENTICATION.md`](../releases/RELEASE_0.2_AUTHENTICATION.md) (backlog). Mobile Firebase Phase D is a separate future item.

### Search freeze note

Priority **4 Search & Discovery** is **FROZEN** (vehicle web path). Do not refactor search unless a production bug is found. Deferred items live only in [`../releases/RELEASE_0.4_SEARCH_DISCOVERY.md`](../releases/RELEASE_0.4_SEARCH_DISCOVERY.md). Tag: `search-0.4-freeze`.

Evidence: `apps/web/src/features/listings/shared/`, vehicle/plate detail pages, `my-listings`.  
Release notes: [`../releases/RELEASE_0.4_MARKETPLACE.md`](../releases/RELEASE_0.4_MARKETPLACE.md).  
Go/No-Go: [`../releases/RELEASE_0.4_RC_GO_NO_GO.md`](../releases/RELEASE_0.4_RC_GO_NO_GO.md) · Bugs: [`../releases/RELEASE_0.4_BUG_BACKLOG.md`](../releases/RELEASE_0.4_BUG_BACKLOG.md).

---

## Release 0.5 — Marketplace & Listings (current)

| Item | Status | Summary |
| --- | --- | --- |
| Architecture (P5-0) | **Docs landed — awaiting approval** | Extend 0.4 baseline; capability matrix + slices P5-1…P5-10 |
| Implementation | **Blocked on architecture approval** | No production code until approved |

Release: [`../releases/RELEASE_0.5_MARKETPLACE.md`](../releases/RELEASE_0.5_MARKETPLACE.md)  
Architecture: [`../architecture/`](../architecture/)

**Train renumber:** Messaging → **0.6**, Payments → **0.7**, Trust → **0.8**, Dealers → **0.9**.

---

## Conventions

- Mark a sprint **Completed** only after lint/typecheck/build for touched apps and product acceptance.
- Do not invent APIs or DB fields in client-only sprints; defer when payloads lack data.
- Prefer one feature (or one approved sprint slice) per change set.

---

## Epic portfolio (placeholder)

Planned epic docs (`EPIC_001` …) were scoped but not yet authored. Until they land, prioritize from release docs and this sprint table.
