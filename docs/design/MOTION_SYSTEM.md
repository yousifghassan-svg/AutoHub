# AutoHub Motion Design System

**Sprint:** AX-1  
**Status:** Draft — awaiting approval  
**Companion:** [`DESIGN_MANIFESTO.md`](./DESIGN_MANIFESTO.md)

Motion is choreography for attention. No random animation. No decorative bounce.

---

## 1. Foundations

### Duration scale

| Token | ms | Use |
| --- | --- | --- |
| `motion-instant` | 0–80 | Toggles, checkbox, reduced-motion fallback |
| `motion-fast` | 120–160 | Hover color, focus ring, button press |
| `motion-base` | 180–240 | Cards, chips, nav underline |
| `motion-moderate` | 260–320 | Modals, sheets, page section enter |
| `motion-slow` | 400–520 | Hero crossfade, success settle |
| `motion-deliberate` | 600–800 | Rare: gallery cinematic, onboarding only |

### Easing

| Token | Curve | Use |
| --- | --- | --- |
| `ease-out-premium` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, expands |
| `ease-in-premium` | `cubic-bezier(0.7, 0, 0.84, 0)` | Exits, dismiss |
| `ease-inout-soft` | `cubic-bezier(0.45, 0, 0.55, 1)` | Crossfades, progress |
| `ease-spring-soft` | spring (stiffness ~380, damping ~32) | Card lift, favorite burst (subtle) |

Avoid linear for UI. Avoid elastic overshoot except a **2–4%** favorite pop.

### Reduced motion

When `prefers-reduced-motion: reduce`:

- Replace transforms with opacity or instant state.
- Disable parallax, Ken Burns, and staggered lists.
- Keep focus and loading indicators accessible (opacity pulse ≤ 1Hz or static).

---

## 2. Page transitions

| Transition | Behavior | Timing |
| --- | --- | --- |
| Route enter | Content fades + rises 8–12px | `motion-moderate` + `ease-out-premium` |
| Route exit | Fade only (no slide fight with next) | `motion-fast` + `ease-in-premium` |
| Tab / status filter | Crossfade grid; preserve scroll when possible | `motion-base` |
| Sell wizard step | Horizontal slide 16px toward reading direction + fade | `motion-base` |
| Auth → return (`?next=`) | Soft fade into destination; no flash of empty shell | Skeleton until ready |

**Rule:** One shared page transition family sitewide. Do not invent per-route gimmicks.

---

## 3. Hover animations

| Target | Motion | Notes |
| --- | --- | --- |
| Primary button | Background deepen 4–6%; optional 1px lift | No scale > 1.02 |
| Ghost / secondary | Background fill `surface-muted` | Instant color + `motion-fast` |
| Listing card | Image scale 1.03–1.05 (overflow clip); shadow → lift | See vehicle card doc |
| Text link | Underline draws from start (RTL-aware) | `motion-fast` |
| Nav item | Opacity 0.72 → 1 or hairline indicator | No bounce |
| Favorite heart | Fill + 2% spring | One shot |

**Rule:** Hover never moves layout (no margin jump). Prefer transform and opacity.

---

## 4. Card animations

| Event | Motion |
| --- | --- |
| Enter (grid) | Stagger 30–40ms per card; max 6 staggered then batch |
| Hover | Image zoom inside mask; elevation token step-up |
| Press | Scale 0.985 for 100ms |
| Remove / archive | Fade + collapse height (manage views) |
| Favorite | Heart morph; card does not bounce |

---

## 5. Loading animations

| Pattern | Spec |
| --- | --- |
| Skeleton | Soft shimmer 1.2s loop; graphite/light tokens — never harsh white flash |
| Spinner | Use only for short indeterminate actions (<3s expected) |
| Progress steps (publish) | Checklist checkmarks appear with `motion-fast`; active row subtle pulse |
| Image load | LQIP / blur → sharp; no empty gray pop if blurhash available |

**Rule:** Prefer skeletons that match final layout geometry (card grid, detail split).

---

## 6. Skeleton animations

- Direction: subtle left→right shimmer (mirror for RTL).
- Contrast: skeleton token only; avoid brand-colored skeletons.
- Shape: match corners of final component (`radius-md` / `radius-lg`).

---

## 7. Dialogs & modals

| Phase | Motion |
| --- | --- |
| Overlay in | Opacity 0 → dim (0.4–0.55) `motion-base` |
| Panel in | Fade + scale 0.98 → 1 + rise 8px `motion-moderate` |
| Panel out | Reverse, faster (`motion-fast`) |
| Confirm delete | Same family; danger button does **not** shake |

Focus trap engages after enter completes. Escape triggers exit motion then unmount.

---

## 8. Buttons

| State | Motion |
| --- | --- |
| Hover | Color / elevation `motion-fast` |
| Active / press | Scale 0.98 `motion-instant` |
| Loading | Label → spinner crossfade; width stable (no layout jump) |
| Success (inline) | Optional check morph 200ms then revert or navigate |

---

## 9. Navigation

| Element | Motion |
| --- | --- |
| Sticky header | Background blur intensifies on scroll (opacity of scrim) |
| Mobile drawer | Sheet from end edge; 280ms `ease-out-premium` |
| Active route | Indicator slide between items (shared layout feel) |
| Theme toggle | Icon crossfade sun/moon `motion-base` |

---

## 10. Search interactions

| Interaction | Motion |
| --- | --- |
| Focus search | Soft ring; optional 1px expand of field |
| Typeahead / chips | Chips enter with fade+scale 0.96→1 |
| Apply filter | Results crossfade; count updates with tabular tick |
| Clear all | Chips exit stagger reverse |
| Load more | New rows fade-up; button shows progress |

No full-page reload animation for filter changes.

---

## 11. Hero transitions

| Moment | Spec |
| --- | --- |
| Home hero enter | Image Ken Burns max 3% over 12s **or** static if reduced-motion |
| Headline | Fade+rise after image is ready (avoid FOIT on copy) |
| CTA group | Delay 80–120ms after headline |
| Category tiles | Hover: image brightness +1 stop, title opacity full |

Hero never uses floating badge stickers in motion.

---

## 12. Success animations

| Context | Motion |
| --- | --- |
| Publish success | Existing burst language refined: single check settle, no confetti |
| Draft saved | Soft check in toast; wizard stays calm |
| Favorite | Heart fill only |
| Upload complete | Thumbnail fades from placeholder to image |

**Rule:** Success is **quiet confidence**, not celebration spam.

---

## 13. Empty state animations

- Illustration or photography fades in once.
- Primary CTA gently draws attention (one pulse max, then static).
- No looping character animations.

---

## 14. Forbidden motions

- Infinite bouncing CTAs  
- Parallax that fights scroll performance  
- Layout-shifting skeletons  
- Simultaneous page + modal + toast choreography  
- Brand-colored full-screen loaders  

---

## 15. Implementation note (future AX sprints)

When approved for code: prefer CSS variables for durations/easings; shared `motion` tokens in Tailwind theme; one React motion helper — not per-feature libraries. **No marketplace logic changes.**
