# AutoHub Component Audit (AX-1)

**Sprint:** AX-1  
**Status:** Draft — awaiting approval  
**Scope:** Web UI only (`apps/web`). No marketplace logic changes.  
**Legend:**

| Class | Meaning |
| --- | --- |
| **Excellent** | Keep structure; only token polish later |
| **Needs Polish** | Sound pattern; refine spacing, motion, type, a11y |
| **Needs Redesign** | Competes with hero / feels generic / blocks premium bar |
| **Duplicate** | Consolidate into one system |

Source inventory: `components/ui.tsx`, site chrome, listings shared, sell wizard, my-listings, vehicle detail.

---

## 1. Primitives (`components/ui.tsx`)

| Component | Class | Notes |
| --- | --- | --- |
| `Button` | Needs Polish | Solid variants OK; add loading width-stable state; reduce “full pill” temptation; refine danger |
| `Input` | Needs Polish | Clear focus ring; error state typography; denser sell-wizard spacing |
| `TextArea` | Needs Polish | Same as Input; resize policy |
| `Select` | Needs Polish | Native select limits premium feel — long-term custom listbox (later AX); for now polish focus |
| `RangeField` | Needs Polish | a11y names; visual weight of dual thumbs |
| `Badge` | Needs Polish | Too many tones risk sticker clutter — cap usage rules |
| `Card` | Needs Redesign | Default bordered+shadow card is overused; make optional / quieter |
| `SectionHeader` | Excellent | Clear hierarchy pattern |
| `EmptyState` | Needs Polish | Add photography/illustration slot; calmer CTA |
| `Skeleton` | Needs Polish | Match card geometry; graphite shimmer per motion system |
| `Modal` | Needs Polish | Enter/exit motion; focus; delete confirm already calm — keep |
| `TextLink` | Excellent | Simple, correct |
| `cn` | Excellent | Utility |

---

## 2. Navigation & shell

| Component | Path | Class | Notes |
| --- | --- | --- | --- |
| `SiteHeader` | `components/SiteHeader.tsx` | Needs Polish | Glass + scroll state; mobile drawer motion; brand weight |
| `SiteFooter` | `components/SiteFooter.tsx` | Needs Polish | Always-charcoal OK; align with Dark Theme 2.0 graphite |
| `Breadcrumbs` | `components/Breadcrumbs.tsx` | Needs Polish | Quieter type; RTL separators |
| `ThemeProvider` | `components/ThemeProvider.tsx` | Excellent | Behavior keep; visuals via Dark Theme 2.0 |
| `ToastProvider` | `components/ToastProvider.tsx` | Needs Polish | Position, duration, success/error motion |
| Root layout fonts | `app/layout.tsx` | Excellent | Outfit + IBM Plex Arabic direction correct |

---

## 3. Cards & listing surfaces

| Component | Path | Class | Notes |
| --- | --- | --- | --- |
| `ListingCard` | `components/ListingCard.tsx` | Needs Redesign | Core of premium perception — see [`VEHICLE_CARD_REDESIGN.md`](./VEHICLE_CARD_REDESIGN.md) |
| `ManagedListingCard` | `features/listings/components/ManagedListingCard.tsx` | Needs Polish | Align image ratio & type with new card language; keep actions |
| `ListingSellerCard` | `features/listings/shared/ListingSellerCard.tsx` | Needs Polish | Quieter border; trust hierarchy |
| `ListingStatusBadge` | `features/listings/shared/` | Needs Polish | Single badge system with `Badge` |
| `ListingStats` | `features/listings/shared/` | Needs Polish | Tabular nums; owner-only clarity |
| `ListingOwnerActions` | `features/listings/shared/` | Excellent | Behavior frozen (delete confirm) — visual polish only |
| `ListingPreviewBanner` | `features/listings/shared/` | Needs Polish | Less “admin bar,” more quiet strip |
| `ReviewSummaryCards` | `features/sell/components/` | Needs Polish | Soft tiles OK; reduce card chrome |

---

## 4. Search

| Surface | Class | Notes |
| --- | --- | --- |
| Vehicle search page chrome | Needs Redesign | Feels form-heavy; progressive disclosure + calmer filters |
| Plate search filters | Needs Polish | Same language as vehicles |
| Filter chips / clear | Needs Polish | Motion per motion system |
| Infinite load / sentinel | Excellent | Pattern keep; loading motion polish |

**Constraint:** Search logic & URL SSOT are **FROZEN** (`search-0.4-freeze`). Visual only.

---

## 5. Sell Wizard

| Component | Class | Notes |
| --- | --- | --- |
| `SellWizard` shell | Needs Polish | Progress bar a11y; step transitions; less “boxed form” |
| Category / Media / Sale steps | Needs Polish | Spacing rhythm; category tiles more editorial |
| Domain detail steps | Needs Polish | Dense forms — respectful grouping |
| `PublishStep` / preview | Needs Polish | Already calm — elevate media gallery |
| `PublishConfirm` | Excellent | Tone matches manifesto |
| `PublishProgress` | Needs Polish | Checklist motion |
| `PublishSuccess` | Needs Polish | Quiet success (no confetti escalation) |
| `ListingQualityPanel` | Needs Polish | Score as instrument cluster, not progress toy |
| `MediaUploader` | Needs Polish | Cover star affordance; drag ghost |

**Constraint:** Wizard modes, validation, draft, quality gates **FROZEN**.

---

## 6. My Listings

| Piece | Class | Notes |
| --- | --- | --- |
| Page header / Create CTA | Needs Polish | Stronger seller “cockpit” calm |
| Search + sort toolbar | Needs Polish | Align with search filter language |
| Status tabs | Needs Redesign | Real tablist semantics + premium segmented control look |
| Grid / empty / error | Needs Polish | Empty state aspiration |
| Edit route host | Excellent | Thin mount of wizard — keep |

**Constraint:** Actions registry & APIs **FROZEN**.

---

## 7. Vehicle & plate detail

| Piece | Class | Notes |
| --- | --- | --- |
| Gallery / hero split | Needs Redesign | More cinematic; less equal columns fighting the car |
| Title / price / badges | Needs Polish | Price gravity; badge cap |
| Visitor contact stack | Needs Polish | Primary Call vs secondary actions hierarchy |
| Specs grid | Needs Polish | Quieter tiles |
| Related rail | Needs Polish | Uses ListingCard — inherits card redesign |
| Plate SVG hero | Excellent | Unique — protect and light carefully |
| Report modal | Needs Polish | Same modal system |

---

## 8. Homepage

| Piece | Class | Notes |
| --- | --- | --- |
| Current home composition | Needs Redesign | Functional but not “not a normal marketplace” — see [`HOMEPAGE_REDESIGN.md`](./HOMEPAGE_REDESIGN.md) |
| Category entry tiles | Needs Redesign | Become photographic doorways |
| Featured / dealers strips | Needs Polish | After hero language lands |
| Sell CTA band | Needs Polish | One confident band, not banner spam |

---

## 9. Auth & account (visual only)

| Surface | Class | Notes |
| --- | --- | --- |
| Login / OTP / profile-setup | Needs Polish | Same card language; calm trust |
| Profile page | Needs Polish | Reduce generic bordered box |

**Constraint:** Auth **FROZEN** — presentation only; keep `?next=` behavior.

---

## 10. Duplicates & consolidations

| Issue | Class | Action |
| --- | --- | --- |
| Ad-hoc `rounded-xl border … shadow-card` repeated in pages | Duplicate | Prefer primitive `Surface` / quiet `Card` variants |
| Status pills vs `Badge` vs listing badges | Duplicate | One badge taxonomy |
| Multiple “section title” class patterns | Duplicate | Standardize on `SectionHeader` / display styles |
| Manage card vs marketplace card visual drift | Duplicate | Shared image/type tokens; different action slots |

---

## 11. Priority for future implementation (not AX-1 code)

1. **ListingCard** redesign (highest brand impact)  
2. **Homepage** hero composition  
3. **Dark Theme 2.0** tokens  
4. **Detail gallery** cinematic layout  
5. **Search chrome** progressive disclosure  
6. Primitive Card/Button polish  

---

## 12. Explicit non-touch (frozen)

Marketplace business logic, media trust rules, draft/quality engines, search URL/API, auth contracts — **out of scope** for visual AX work beyond skinning.
