# AX-2 — Design Lab Implementation Notes

**Status:** Awaiting design approval  
**Scope:** `apps/web/src/app/design-lab/**` + `framer-motion` dependency only  
**Isolation:** No production routes, marketplace logic, or frozen release surfaces modified

---

## Routes

| Section | Path |
| --- | --- |
| Lab index | `/design-lab` |
| Homepage Prototype | `/design-lab/homepage` |
| Vehicle Card Showcase | `/design-lab/cards` |
| Search Experience | `/design-lab/search` |
| Sell Wizard Prototype | `/design-lab/sell` |
| Vehicle Details Prototype | `/design-lab/vehicle` |
| My Listings Dashboard | `/design-lab/my-listings` |
| Dealer Profile | `/design-lab/dealer` |
| Motion Playground | `/design-lab/motion` |
| Dark Theme Showcase | `/design-lab/dark` |
| Component Gallery | `/design-lab/components` |

Metadata: `robots: noindex, nofollow` on the lab layout.

---

## Isolation strategy

- All UI lives under `apps/web/src/app/design-lab`.
- Root `layout.tsx` is **unchanged** (SiteHeader/Footer still mount for the app).
- `LabShell` uses `fixed inset-0 z-[100]` to cover production chrome without editing it.
- Prototype vehicle card is `PremiumVehicleCard` — not the production listing card.
- Search / sell / listings prototypes do **not** call marketplace APIs.
- Photography uses Unsplash URLs with `next/image` `unoptimized` so `next.config` image allowlists stay untouched.

---

## Implementation notes

- Reused production primitives from `@/components/ui`: Button, Badge, Input, Select, TextArea, Card, Skeleton, EmptyState, SectionHeader, RangeField, TextLink.
- Theme toggles via existing `ThemeProvider` (`useTheme`).
- Dark showcase pins `dark` on mount and restores the previous theme on leave.
- Dialog in Component Gallery mirrors `Modal` markup at `z-[110]` because production `Modal` is `z-50` and would render under the lab shell. Production `Modal` was not modified.
- Motion: Framer Motion with shared ease `[0.16, 1, 0.3, 1]`; short durations (220–400ms); hover lift −4px; staggered card reveals capped at small delays.
- Spec alignment: AX-1 / AX-1.1 docs under `docs/design/` (full-bleed hero, brand-first homepage, Spotlight-like search, graphite dark).

---

## Performance notes

- Lab routes are client-heavy (`'use client'`) for interactive prototypes — acceptable for a sandbox, not a production pattern to copy blindly.
- Images: `unoptimized` external Unsplash sources — fine for design review; production should keep optimized R2/CDN assets.
- Framer Motion adds bundle weight only when lab (or other) client trees import it; production pages were not wired to import these modules.
- Fixed full-viewport shell means production header/footer still hydrate underneath — slight wasted work while browsing the lab only. Preferable to changing root layout before approval.
- Prefer `viewport={{ once: true }}` on scroll animations to avoid re-triggers.

---

## Accessibility notes

- Lab nav: `aria-label="Design lab"`; current step marked with `aria-current` in sell wizard.
- Search field and CTAs have accessible names / labels.
- Dialog: `role="dialog"`, `aria-modal`, backdrop close control labeled “Close dialog”.
- Decorative hero images use empty `alt=""`; vehicle titles use meaningful `alt` on cards/details.
- Focus rings: rely on existing focus styles from shared inputs/buttons.
- Gaps / follow-ups for a later a11y pass: trap focus inside elevated lab dialog; restore focus on close; ensure mobile nav chips announce current page; respect `prefers-reduced-motion` by gating Framer Motion (not yet wired).

---

## Screenshots

Captured at 1440×900 into `apps/web/src/app/design-lab/screenshots/`:

| File | Route |
| --- | --- |
| `01-lab-home.png` | `/design-lab` |
| `02-homepage.png` | `/design-lab/homepage` |
| `03-cards.png` | `/design-lab/cards` |
| `04-search.png` | `/design-lab/search` |
| `05-sell.png` | `/design-lab/sell` |
| `06-vehicle.png` | `/design-lab/vehicle` |
| `07-my-listings.png` | `/design-lab/my-listings` |
| `08-dealer.png` | `/design-lab/dealer` |
| `09-motion.png` | `/design-lab/motion` |
| `10-dark.png` | `/design-lab/dark` |
| `11-components.png` | `/design-lab/components` |

Re-capture: with web dev running, `pnpm dlx playwright screenshot --viewport-size="1440,900" http://localhost:3000/design-lab/<route> <file.png>`.

---

## Explicit non-goals (honored)

- No merge into production homepage / sell / search / my-listings  
- No frozen marketplace / auth / search logic changes  
- Wait for design approval before any integration  
