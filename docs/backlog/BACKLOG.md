# AutoHub Product Backlog

**Status:** Living index  
**Related:** [`../standards/ROADMAP.md`](../standards/ROADMAP.md), [`../releases/RELEASE_CHECKLIST.md`](../releases/RELEASE_CHECKLIST.md)

This file tracks engineering sprints against release trains. Full epic files may be added later; until then, use this index plus the release docs.

---

## Release 0.4 — Marketplace (active)

| Sprint | Focus | Status | Summary |
| --- | --- | --- | --- |
| 4 | Marketplace UX & Owner Experience (web) | **Completed** | Owner vs visitor listing detail; full Preview Mode; Action Registry; status badge + help; shared listing UI (`ListingSellerCard`, `ListingStats`, `ListingDescription`, breadcrumbs, share, recommendation strategies); My Listings wired to the same registry. No API/DB changes. Deferred: seller member-since, listing count, MediaAsset avatars. |
| 5 | Marketplace polish / follow-ups | Not started | Candidate: shared visitor contact shell; owner-only click metrics; multi-status seed fixtures; Action Registry unit tests. |

Evidence: `apps/web/src/features/listings/shared/`, vehicle/plate detail pages, `my-listings`.  
Release notes: [`../releases/RELEASE_0.4_MARKETPLACE.md`](../releases/RELEASE_0.4_MARKETPLACE.md).

---

## Conventions

- Mark a sprint **Completed** only after lint/typecheck/build for touched apps and product acceptance.
- Do not invent APIs or DB fields in client-only sprints; defer when payloads lack data.
- Prefer one feature (or one approved sprint slice) per change set.

---

## Epic portfolio (placeholder)

Planned epic docs (`EPIC_001` …) were scoped but not yet authored. Until they land, prioritize from release docs and this sprint table.
