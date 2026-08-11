# AutoHub Visual Language

**Sprint:** AX-1  
**Status:** Draft — awaiting approval  
**Companion:** [`DESIGN_MANIFESTO.md`](./DESIGN_MANIFESTO.md)

This document defines how AutoHub looks: color, material, elevation, and how vehicles are shown. It evolves today’s tokens (`brand` ≈ `#C8102E`, Outfit / IBM Plex Arabic) into a **premium automotive** language — graphite, signal red, photography-first.

---

## 1. Brand pillars (visual)

| Pillar | Expression |
| --- | --- |
| Signal | Restrained red for primary action and brand marks |
| Graphite | Dark and light neutrals with depth, not pure black/white |
| Metal | Cool gray borders and hairlines — “machined,” not plastic |
| Light | Soft directional light on cards; never neon glow |

---

## 2. Colors

### Core palette (proposed AX evolution)

| Role | Light | Dark (see Dark Theme 2.0) | Notes |
| --- | --- | --- | --- |
| `signal` / brand | `#C8102E` | `#E11D48` (slightly lifted) | Primary CTA, wordmark accent |
| `signal-pressed` | `#9F0C24` | `#BE123C` | Active press |
| `signal-soft` | `#C8102E` @ 10–12% | `#E11D48` @ 14% | Badges, soft fills |
| `ink` | `#0F1419` | `#F2F4F7` | Primary text |
| `ink-secondary` | `#5C6570` | `#A8B0BA` | Meta, labels |
| `canvas` | `#F4F5F7` | `#0E1114` | Page background (not flat white) |
| `surface` | `#FFFFFF` | `#171B21` | Cards, sheets |
| `surface-muted` | `#EBEEF2` | `#1E242C` | Nested wells |
| `border` | `#D5DAE1` | `#2A313A` | Hairlines |
| `success` | `#0F7A4B` | `#3DDC97` | Verified / success — use sparingly |
| `warning` | `#B45309` | `#FBBF24` | Caution |
| `error` | `#B91C1C` | `#FB7185` | Destructive |

**Rules**

- Do **not** introduce purple/indigo “AI SaaS” gradients as brand.
- Do **not** default to warm cream + terracotta editorial clichés.
- Status colors never outrank the vehicle image.

### Semantic mapping

| Meaning | Color |
| --- | --- |
| Primary action | Signal |
| Featured | Signal-soft pill + optional thin signal edge |
| Verified | Success soft + check icon |
| Destructive | Error |
| Neutral meta | Ink-secondary |

---

## 3. Gradients

Use rarely.

| Name | Spec | Use |
| --- | --- | --- |
| `hero-scrim` | Vertical transparent → graphite 55% | Text legibility over photography |
| `rail-fade` | Horizontal edge fade | Carousel edges |
| `surface-sheen` | 3% white diagonal on dark surfaces | Optional dark luxury (subtle) |

**Forbidden:** Purple-to-pink mesh, rainbow CTAs, glossy button gradients.

---

## 4. Glass effects

| Token | Spec | Use |
| --- | --- | --- |
| `glass-header` | `backdrop-blur: 12–16px` + surface @ 72–85% | Sticky header |
| `glass-overlay` | Blur 8px + dim 40–55% | Modal scrim companion |
| `glass-chip` | Blur 8px + surface @ 80% | Favorite control on images |

Glass must remain **readable** in RTL and on busy photography. Prefer graphite tint over pure white frost on dark hero images.

---

## 5. Elevation

Four levels — no more.

| Level | Light | Dark | Use |
| --- | --- | --- | --- |
| `e0` | Flat | Flat | Page canvas |
| `e1` | Soft card shadow (current `shadow-card` refined) | 1px border + faint lift | Cards at rest |
| `e2` | `shadow-lift` | Stronger border + soft glow 4% | Hover / sticky CTA |
| `e3` | Modal lift | Modal lift | Dialogs, drawers |

**Rule:** Elevation changes on interaction; don’t stack e2 on e2.

---

## 6. Borders

- Default: `1px` `border` token.
- Focus: `2px` signal ring with offset — never remove without replacement.
- Dividers: prefer spacing over lines; when needed, hairline `border` at 60% opacity.

---

## 7. Corner radius

| Token | Value | Use |
| --- | --- | --- |
| `radius-sm` | 6px | Inputs, chips, small controls |
| `radius-md` | 10–12px | Buttons, small cards |
| `radius-lg` | 16px | Listing cards, wizard shell |
| `radius-xl` | 20–24px | Hero media masks, large sheets |
| `radius-full` | pill | Badges only — **not** every button |

**Rule:** Avoid “pill everything.” Primary buttons use `radius-md`.

---

## 8. Shadows

Refine existing `card` / `lift`:

- Light card: `0 1px 2px rgba(15,20,25,0.06), 0 8px 24px rgba(15,20,25,0.06)`
- Lift: increase y-blur modestly; no colored brand glow.
- Dark: prefer border + ambient `0 0 0 1px` over heavy black shadows.

---

## 9. Blur

| Use | Radius |
| --- | --- |
| Header glass | 12–16px |
| Image placeholder | 20px on LQIP |
| Modal behind | 0–4px (dim matters more than blur) |

---

## 10. Icons

- Stroke-based, 1.5–2px optical weight, 20/24px grid.
- Prefer a single set (e.g. Lucide-compatible) — no mixed emoji.
- Status icons: verified check, featured spark (minimal), favorite heart.
- Directional icons flip in RTL.

---

## 11. Illustrations

- Empty states: quiet line art or desaturated vehicle silhouettes — not cartoon mascots.
- Prefer photography when emotion is required.
- One accent stroke in signal red maximum per illustration.

---

## 12. Photography style

**The brand is the car.**

| Rule | Spec |
| --- | --- |
| Subject | ¾ front or clean side profile; plates legible when plate listing |
| Background | Neutral pavement, studio, or soft bokeh — avoid cluttered lots when possible |
| Crop | Vehicle fills frame; minimal sky unless cinematic hero |
| Color | Natural; slight contrast; no HDR neon |
| Aspect | Cards: **4:3** or **3:2**; detail hero: **16:10** / cinematic |
| Cover | Always index 0 / primary — motion and badges never obscure plate/face |

Seller education (copy only, frozen logic): encourage bright, uncluttered photos — quality engine already nudges this.

---

## 13. Vehicle presentation rules

1. **Image first** — Title and price secondary to the photo stack.
2. **No sticker chaos** — Max two badges visible on card (e.g. Featured + Verified).
3. **Price gravity** — Large, tabular-friendly numerals; currency quiet beside.
4. **Dealer mark** — Small, trustworthy; never a billboard logo on the image.
5. **Plate listings** — Rendered plate component is the hero art; treat as sacred geometry.
6. **Detail gallery** — Full-bleed or near full-bleed; thumbnails below, not a tiled collage in the first viewport.
7. **Related rail** — Same card language; no smaller “widget” cards with different radii.

---

## 14. Do / Don’t summary

| Do | Don’t |
| --- | --- |
| Graphite surfaces | Pure black voids |
| Signal red CTAs | Purple gradients |
| Hairline metal borders | Thick gray boxes |
| Photography-led layouts | Icon-row marketing strips |
| Quiet badges | Floating promo chips on heroes |

---

## 15. Related

- Dark specifics: [`DARK_THEME_2.md`](./DARK_THEME_2.md)  
- Card application: [`VEHICLE_CARD_REDESIGN.md`](./VEHICLE_CARD_REDESIGN.md)  
- Motion of materials: [`MOTION_SYSTEM.md`](./MOTION_SYSTEM.md)
