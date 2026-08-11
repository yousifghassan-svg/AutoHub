# Dark Theme 2.0 — Graphite Luxury

**Sprint:** AX-1  
**Status:** Proposal — **no code**  
**Companion:** [`VISUAL_LANGUAGE.md`](./VISUAL_LANGUAGE.md)

Dark mode is not “invert light.” It is a **graphite showroom at night**.

---

## 1. Intent

| Word | Meaning |
| --- | --- |
| Graphite | Layered near-black with cool undertones (`#0E1114` → `#1E242C`) |
| Luxury | Soft borders, restrained signal red, photographic depth |
| High contrast | Body text and prices stay crisp; chrome stays quiet |
| Elegant | No neon, no OLED pure-black crushing, no purple haze |

Think: Porsche configurator night mode, Rivian UI calm, Linear dark — not gaming RGB.

---

## 2. Surface stack

| Layer | Hex (target) | Role |
| --- | --- | --- |
| `canvas` | `#0E1114` | Page background |
| `surface` | `#171B21` | Cards, header glass base |
| `surface-raised` | `#1E242C` | Nested wells, inputs |
| `surface-overlay` | `#252B34` | Menus, popovers |
| `border` | `#2A313A` | Hairlines |
| `border-strong` | `#3A4350` | Focused containers |

**Never** default canvas to `#000000`. Pure black is for letterboxing film, not UI.

---

## 3. Text & icons

| Role | Color |
| --- | --- |
| Primary | `#F2F4F7` |
| Secondary | `#A8B0BA` |
| Tertiary | `#7B8491` |
| Disabled | `#5C6570` |
| On-signal | `#FFFFFF` |

Icons: secondary by default; primary on hover/active.

---

## 4. Signal red in the dark

| Token | Value |
| --- | --- |
| Brand | `#E11D48` (lifted for luminance) |
| Pressed | `#BE123C` |
| Soft | `#E11D48` @ 14–18% on surface |

CTAs remain red — confidence, not pastel. Soft fills for badges only.

---

## 5. Elevation in the dark

Dark UI elevates with **border + ambient**, not heavy black drop shadows.

| Level | Treatment |
| --- | --- |
| Rest card | `1px border` + optional `0 8px 24px rgba(0,0,0,0.35)` |
| Hover | Border → `border-strong`; ambient +10% |
| Modal | Overlay dim 55% + panel `surface-overlay` |

No colored glow halos around cards.

---

## 6. Glass & header

- Header: `backdrop-blur` 14px + `surface` @ 78%.
- On hero photography: deepen scrim so type stays AA.
- Theme toggle: moon/sun crossfade; persist existing `autohub.web.theme`.

---

## 7. Images & media

- Photo cards: keep natural color; do not desaturate globally.
- Plate SVG: ensure stroke/fill contrast on graphite (may need theme-aware plate frame tokens).
- Skeletons: `#1E242C` base + soft shimmer to `#252B34`.

---

## 8. Semantic colors

| Semantic | Dark |
| --- | --- |
| Success | `#3DDC97` text/icon; soft fill @ 12% |
| Warning | `#FBBF24` |
| Error | `#FB7185` |

Use sparingly — status rainbow kills luxury.

---

## 9. Component-specific notes

| Component | Dark 2.0 note |
| --- | --- |
| Listing card | Border hairline; image full color; glass favorite |
| Sell wizard | Surface panel; progress bar signal on graphite track |
| Modals | Strong dim; no blinding white sheets |
| Inputs | `surface-raised` fill; border-strong on focus |
| Footer | Merge with canvas family (already charcoal — retune to graphite stack) |
| Toasts | `surface-overlay` + border |

---

## 10. Contrast checklist

- Body text on canvas/surface: AA  
- Price on card: AAA preferred  
- Placeholder text: ≥ 3:1  
- Signal button label: white on brand  
- Focus ring: visible on graphite (signal @ 80%+)  

---

## 11. What Dark 2.0 is not

- Not pure black OLED crush  
- Not gray-on-gray low contrast  
- Not neon accents  
- Not a separate “gamer” brand  

---

## 12. Migration note (future implementation)

Map CSS variables in `globals.css` / Tailwind theme under `[data-theme='dark']` to this stack. Keep `ThemeProvider` behavior. **No marketplace logic changes.**
