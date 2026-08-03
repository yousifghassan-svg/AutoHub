# AX-3 — Homepage Identity Implementation Notes

**Status:** Awaiting approval  
**Scope:** Homepage UI only (`/` route). No marketplace logic, API, DB, or other page changes.

---

## Files changed

| Path | Change |
| --- | --- |
| `apps/web/src/app/page.tsx` | Server entry + metadata; renders `HomePageView` |
| `apps/web/src/features/home/**` | New homepage feature (hero, sections, card language) |
| `apps/web/next.config.ts` | Allow `images.unsplash.com` for hero/doorway photography |
| `docs/design/AX3_HOMEPAGE_NOTES.md` | This document |

Frozen surfaces (auth, search product pages, marketplace listings flows, ListingCard elsewhere) were **not** modified.

---

## What shipped on `/`

- Cinematic full-bleed hero; AutoHub brand as largest type  
- Spotlight-style search (primary action) → `/vehicles/search?q=`  
- Existing suggestions API for combobox list (UI only)  
- Sections: Featured, Latest, Recommended, Luxury, Electric, SUV  
- Homepage-scoped `HomeVehicleCard` (price on image, minimal meta)  
- Vehicles / Plates doorways + graphite sell band  
- Framer Motion with `prefers-reduced-motion` respect  
- Empty sections hide (no “No featured” empty copy)

---

## Performance notes

- Below-fold sections fetch only when near viewport (`IntersectionObserver`, ~280px rootMargin). Featured is eager.  
- Section queries use `staleTime: 60_000` to avoid refetch churn.  
- Hero image: `priority` + `sizes="100vw"`. Cards use responsive `sizes`; first featured card may be priority.  
- Catalog filters load once for Electric/SUV id resolution.  
- Homepage remains a client island for react-query + motion; server `page.tsx` only hosts metadata + the island.  
- External Unsplash hero is a temporary brand photograph until owned assets exist — prefer CDN/R2 hero later for Lighthouse.

---

## Accessibility notes

- Landmark: root layout already provides `<main>`; hero `aria-label="Welcome"`; sections `aria-labelledby`.  
- Search: `role="search"`, labeled input, combobox + listbox for suggestions.  
- Focus-visible rings on cards, doorways, and “View all” links.  
- Decorative images use empty `alt`; vehicle cards use listing title.  
- `useReducedMotion()` disables hero rise, card lift, image scale, and stagger.  
- Keyboard: search submit, suggestion buttons, all links/buttons reachable.

---

## Screenshots

| Breakpoint | File |
| --- | --- |
| Desktop 1440×900 | [`docs/design/review/ax3-homepage/homepage--desktop.png`](./review/ax3-homepage/homepage--desktop.png) |
| Tablet 768×1024 | [`docs/design/review/ax3-homepage/homepage--tablet.png`](./review/ax3-homepage/homepage--tablet.png) |
| Mobile 390×844 | [`docs/design/review/ax3-homepage/homepage--mobile.png`](./review/ax3-homepage/homepage--mobile.png) |

---

## Explicit non-goals (honored)

- No Vehicle Cards system-wide rollout  
- No Search page redesign  
- No Vehicle Details redesign  
- No API / DB / business-logic changes  
