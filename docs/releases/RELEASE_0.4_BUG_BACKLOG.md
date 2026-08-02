# Release 0.4 — Bug Backlog (Go / No-Go)

**Source review:** [`RELEASE_0.4_RC_GO_NO_GO.md`](./RELEASE_0.4_RC_GO_NO_GO.md)  
**Evidence tags:** CODE = confirmed in source · RUNTIME = needs live re-verify · PRIOR = earlier RC evidence  
**Reassessment:** 2026-08-01 — BUG-001 and BUG-008 closed; closed-beta marketplace P0 = 0.

Effort key: **S** ≤ 0.5 day · **M** 0.5–2 days · **L** 2–5 days · **XL** > 5 days

---

## Closed

### BUG-001 — Plate PENDING has no admin approve/reject path
| Field | Detail |
| --- | --- |
| Class | P0 |
| Status | **CLOSED** |
| Fix | `7c52aac` — `fix(admin): add plate listing approve and reject moderation` |
| Notes | Thin admin plates approve/reject → `AdminListingsService`; UI Approve/Reject when PENDING. |

### BUG-008 — Admin-created plates default to ACTIVE
| Field | Detail |
| --- | --- |
| Class | P1 |
| Status | **CLOSED** |
| Fix | `a8869f1` — `fix(api): align admin plate creation with moderation workflow` |
| Notes | Default `PENDING`; `publishedAt` only when status is `ACTIVE`. Policy: Create does not imply Publish. |

### BUG-005 — Search filters not written to URL
| Field | Detail |
| --- | --- |
| Class | P1 |
| Status | **CLOSED** (Priority 4 / P4-4) |
| Fix | URL SSOT via `url-search-state` + `useVehicleSearchUrlState` on `/vehicles/search` |
| Notes | Back/Forward/refresh/share; see `PRIORITY_4_SEARCH_DISCOVERY.md` |

---

## Critical (P0)

### BUG-002 — Production consumer authentication incomplete
| Field | Detail |
| --- | --- |
| Class | P0 (for **public** beta only) |
| Status | **CLOSED** (web+API Firebase path) — 2026-08-02 |
| Impact | ~~Cannot safely onboard real public users on Firebase phone auth~~ Web phone OTP → Nest JWT verified; Release 0.2 **FROZEN**. |
| Reproduction | n/a — superseded by freeze audit in `RELEASE_0.2_AUTHENTICATION.md`. |
| Root cause | Phases C/E completed for web; production gates block dev/phone-testing. |
| Residual | Mobile Expo Firebase production path remains **deferred backlog** (Phase D), not a reopen of web auth. |
| Owner | Auth |
| Effort | — |
| Evidence | Commits `b968ec8`, `751c635`; `RELEASE_0.2_AUTHENTICATION.md` |

---

## High (P1)

### BUG-003 — Favorites are device-local only
| Field | Detail |
| --- | --- |
| Class | P1 |
| Impact | Users lose favorites across devices/browsers; public expectation of “saved” listings not met. |
| Reproduction | Favorite a listing → clear site data or other browser → empty. UI states “no favorites API yet”. |
| Root cause | `favorites-store` persists to `localStorage` only. |
| Recommended fix | Account-backed favorites API + migrate local IDs on login; until then keep disclosure and exclude from public beta claims. |
| Owner | Web + API |
| Effort | L |
| Evidence | CODE |

### BUG-004 — Sell wizard login drops return path
| Field | Detail |
| --- | --- |
| Class | P1 |
| Impact | Unauthenticated sellers sent to `/login` without `?next=/sell`; friction and abandoned drafts. |
| Reproduction | Logged out → `/sell` → redirected to `/login` (no next). After login, not returned to sell. |
| Root cause | `SellWizard` uses `router.replace('/login')` without next param (unlike my-listings/messages). |
| Recommended fix | Redirect to `/login?next=/sell` (preserve query if any). |
| Owner | Web |
| Effort | S |
| Evidence | CODE |

### BUG-006 — Owner delete has no confirmation
| Field | Detail |
| --- | --- |
| Class | P1 |
| Impact | Accidental soft-delete of listings from detail or My Listings. |
| Reproduction | Owner → Delete on `ListingOwnerActions` → immediate mutate, no dialog. |
| Root cause | `ListingOwnerActions` runs delete action without confirm step. |
| Recommended fix | Confirm dialog (“Delete this listing?”) before `softDelete`. |
| Owner | Web |
| Effort | S |
| Evidence | CODE |

### BUG-007 — Admin `/listings/[id]` always redirects to vehicles
| Field | Detail |
| --- | --- |
| Class | P1 |
| Impact | Moderators opening a plate via listings path land on wrong domain UI. |
| Reproduction | Navigate admin `/listings/{plateId}` → redirected to `/vehicles/{id}`. |
| Root cause | Listings admin routes alias/redirect to vehicles without domain detection. |
| Recommended fix | Resolve listing domain and redirect to `/vehicles/:id` or `/plates` detail; or shared listing moderation page. |
| Owner | Admin |
| Effort | M |
| Evidence | CODE |

---

## Medium (P2)

### BUG-009 — Preview Mode is not anonymous-equivalent for non-ACTIVE
| Field | Detail |
| --- | --- |
| Class | P2 |
| Impact | Owner Preview still uses authenticated payload (status badge, non-public fields); not byte-identical to logged-out visitor. |
| Reproduction | Owner opens DRAFT/PENDING → Preview as visitor → still sees non-public listing content that guests would 404. |
| Root cause | Preview toggles chrome only; no anonymous re-fetch / visibility simulation. |
| Recommended fix | Document limitation for internal QA; later simulate public GET or hide non-public chrome/fields in preview. |
| Owner | Web |
| Effort | M |
| Evidence | CODE |

### BUG-010 — Plate detail missing visitor actions present on vehicles
| Field | Detail |
| --- | --- |
| Class | P2 |
| Impact | Inconsistent buyer UX; no Message/Report/contact-click tracking on plates. |
| Reproduction | Compare ACTIVE vehicle detail vs plate detail visitor chrome. |
| Root cause | Plate page never gained vehicle-parity visitor features after domain split. |
| Recommended fix | Shared visitor actions component; wire plate contact-click + report/message where APIs allow. |
| Owner | Web |
| Effort | M |
| Evidence | CODE |

### BUG-011 — Home / vehicles hub lack API error states
| Field | Detail |
| --- | --- |
| Class | P2 |
| Impact | API down looks like “no listings” instead of failure. |
| Reproduction | Stop API → load `/` or `/vehicles` → empty/skeleton without error CTA. |
| Root cause | Pages omit `isError` EmptyState/retry. |
| Recommended fix | Mirror plates hub / search error EmptyState. |
| Owner | Web |
| Effort | S |
| Evidence | CODE |

### BUG-012 — Phone/WhatsApp click counts visible on public detail
| Field | Detail |
| --- | --- |
| Class | P2 |
| Impact | Seller analytics leak to visitors when API returns counts. |
| Reproduction | Open public ACTIVE detail → `ListingStats` may show Calls/WhatsApp if payload includes values. |
| Root cause | API includes click fields on public listing DTO; UI does not owner-gate metrics. |
| Recommended fix | Omit clicks from public DTO **or** show contact metrics only when `isListingOwner`. |
| Owner | API and/or Web |
| Effort | S |
| Evidence | CODE |

### BUG-013 — Ban listing control inconsistent on report pages
| Field | Detail |
| --- | --- |
| Class | P2 |
| Impact | Moderators cannot ban from domain report pages even though handler branches exist. |
| Reproduction | `/vehicles/reports` or `/plates/reports` — Resolve/Reject only; Ban on global `/reports`. |
| Root cause | UI incomplete vs `act('ban-listing')` support. |
| Recommended fix | Add Ban control or remove dead code path. |
| Owner | Admin |
| Effort | S |
| Evidence | CODE |

### BUG-014 — Edit listing weak error UX / limited fields
| Field | Detail |
| --- | --- |
| Class | P2 |
| Impact | Failed load can show blank form; edit is not full sell-wizard parity. |
| Reproduction | Force edit GET failure → weak/missing error EmptyState; only title/description/price editable. |
| Root cause | Edit page error handling incomplete; scope intentionally narrow. |
| Recommended fix | Dedicated error EmptyState; document limited edit scope for 0.4. |
| Owner | Web |
| Effort | S (error) / L (full edit) |
| Evidence | CODE |

### BUG-015 — Dashboard pending approvals not deep-linked
| Field | Detail |
| --- | --- |
| Class | P2 |
| Impact | Moderators see KPI but must manually filter vehicles by PENDING. |
| Reproduction | Admin dashboard “Pending” → no link to `/vehicles?status=PENDING`. |
| Root cause | KPI display only. |
| Recommended fix | Link KPI to filtered vehicles (and plates when moderation exists). |
| Owner | Admin |
| Effort | S |
| Evidence | CODE |

### BUG-016 — Favorites silently drops failed listing fetches
| Field | Detail |
| --- | --- |
| Class | P2 |
| Impact | Sold/deleted/non-visible favorites disappear without explanation. |
| Reproduction | Favorite then soft-delete/make non-visible → favorites page omits ID with no error. |
| Root cause | Failed `getById` results filtered out; no partial-error UI. |
| Recommended fix | Show “Unavailable” cards with remove action. |
| Owner | Web |
| Effort | S |
| Evidence | CODE |

---

## Low (P3)

### BUG-017 — Pre-existing web lint warnings
| Field | Detail |
| --- | --- |
| Class | P3 |
| Impact | Noise in CI/review; minor perf/a11y hygiene. |
| Reproduction | `pnpm --filter @autohub/web lint` → dealers `<img>`, messages exhaustive-deps. |
| Root cause | Legacy pages. |
| Recommended fix | Next/Image + hook deps cleanup. |
| Owner | Web |
| Effort | S |
| Evidence | RUNTIME (lint) |

### BUG-018 — `/media/demo` development surface
| Field | Detail |
| --- | --- |
| Class | P3 |
| Impact | Non-product route may confuse staging demos. |
| Reproduction | Visit `/media/demo`. |
| Root cause | Sprint 17 demo left in app router. |
| Recommended fix | Gate behind non-production or remove from prod builds. |
| Owner | Web |
| Effort | S |
| Evidence | CODE |

### BUG-019 — Share QR / deeplink channels stubbed
| Field | Detail |
| --- | --- |
| Class | P3 |
| Impact | Preferred channel returns “not available yet”. |
| Reproduction | Call `shareListing` with `preferred: 'qr' \| 'deeplink'`. |
| Root cause | Intentional stub in share abstraction. |
| Recommended fix | Implement later or hide from UI until ready. |
| Owner | Web |
| Effort | M |
| Evidence | CODE |

### BUG-020 — Mobile nav accessibility gaps
| Field | Detail |
| --- | --- |
| Class | P3 |
| Impact | Screen-reader/keyboard users get weaker mobile menu UX. |
| Reproduction | Inspect `SiteHeader` mobile menu — missing `aria-expanded` / focus trap. |
| Root cause | Menu implementation incomplete for a11y. |
| Recommended fix | Add aria + focus management. |
| Owner | Web |
| Effort | S–M |
| Evidence | CODE |

### BUG-021 — Status badge help text owner-flavored on public pages
| Field | Detail |
| --- | --- |
| Class | P3 |
| Impact | Buyers see seller-oriented copy (“You can republish later”). |
| Reproduction | Any detail with `ListingStatusBadge`. |
| Root cause | Single copy set for all audiences. |
| Recommended fix | Visitor vs owner description variants; hide help on ACTIVE public. |
| Owner | Web |
| Effort | S |
| Evidence | CODE |

### BUG-022 — Pause label maps to ARCHIVED
| Field | Detail |
| --- | --- |
| Class | P3 |
| Impact | Wording may confuse sellers expecting temporary pause vs archive. |
| Reproduction | ACTIVE → Pause → status ARCHIVED. |
| Root cause | Product/lifecycle naming in Action Registry. |
| Recommended fix | Rename to “Archive” or introduce true PAUSED if API supports later. |
| Owner | Product + Web |
| Effort | S |
| Evidence | CODE |

---

## Sorting note

Ordered by **business impact** (external trust → seller conversion → moderator ops → polish), not by app package.
