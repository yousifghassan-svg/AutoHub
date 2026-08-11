# Prototype Spec — Homepage

**ID:** AX-1.1 / HP  
**Fidelity:** High  
**Viewports:** Desktop 1440 · Mobile 390

---

## Memory test

Tomorrow they remember: a **full-bleed car**, the word **AutoHub**, and a single search that felt like a showroom door — not a classifieds index.

---

## 1. Desktop composition (first viewport)

### Layout

```
Y0 ────────────────────────────────────────────────────────────
    Glass header (64px): wordmark · Vehicles · Plates · Sell · theme · avatar
Y64 ───────────────────────────────────────────────────────────
    FULL-BLEED HERO (calc(100vh - 64px), min 640px)
    │
    │  Photo: ¾ front luxury sedan, cool dawn light, asphalt, shallow DOF
    │  Scrim: hero-scrim from 40% height → bottom (graphite 0→55%)
    │
    │  Content block (start-aligned, max 520px, inset 80px from start,
    │  vertically centered in lower 55% of hero):
    │
    │    AUTOHUB                    display 56/64, tracking -0.02em, white
    │    (signal red underline 32×3 under first glyph cluster — optional)
    │
    │    Iraq’s premium marketplace for cars & plates
    │                               18/28 ink-on-photo (white @ 88%)
    │
    │    ┌─────────────────────────────────────────────┐
    │    │ 🔍  Search make, model, or city…             │  height 56
    │    └─────────────────────────────────────────────┘  glass-chip on photo
    │    [ Search ]  signal filled 48h     [ Sell ] ghost white border
    │
Y100vh ────────────────────────────────────────────────────────
```

### Rules

- Brand wordmark is the largest type; headline does **not** overpower it.
- No stats, no “this week,” no floating promo badges on the photo.
- Search field: `radius-lg`, glass over photo, white text, placeholder white@55%.
- Primary CTA = Search; Sell = secondary ghost.

---

## 2. Mobile composition (first viewport)

```
Header 56px compact wordmark + menu
Hero ~78vh
  Photo full-bleed
  Content bottom stack (padding 24):
    AUTOHUB 40/48
    Support 15/22 one line
    Search field full width 52h
    Search button full width signal
    Sell text-button centered (not competing)
```

No horizontal CTA pair that squeezes type.

---

## 3. Below the fold (desktop)

| Order | Section | Spec |
| --- | --- | --- |
| A | Featured | Title “Featured” 28/display · support one line · grid 3× Premium Cards · gap 24 · page padding 80 |
| B | Categories | Two large tiles 50/50 gap 16 · Vehicles / Plates · photo doorways · label 20/display bottom-start on scrim |
| C | Dealers | Quiet strip: “Trusted dealers” · horizontal logos 40h grayscale→color on hover · no cards |
| D | Sell band | Full-bleed graphite `#171B21` · white type · one sentence · one signal CTA · padding 64/80 |
| E | Footer | Graphite stack per Dark Theme doc |

Section rhythm: `space-8` (64) between A–B; `space-9` (96) before Sell band.

---

## 4. Mobile below fold

- Featured: horizontal snap carousel, card width 78vw, peek 12px.
- Categories: stacked 16:9 tiles.
- Dealers: horizontal scroll chips.
- Sell band: padding 48/24.

---

## 5. Motion

| Moment | Spec |
| --- | --- |
| Enter | Image decode → type fade+rise 12px (240ms) → search delay +80ms |
| Scroll Featured | Cards stagger 40ms × max 3 |
| Category hover | Brightness +8%, label opacity 1 |
| Reduced motion | Static hero; no stagger |

---

## 6. Dark mode

- Hero photo unchanged (natural color).
- Scrim stronger (→65%).
- Below-fold canvas `#0E1114`; featured cards on `surface`.
- Sell band merges with canvas (slightly raised border-top hairline).

---

## 7. States

| State | Treatment |
| --- | --- |
| Loading | Hero color placeholder graphite + skeleton for featured row |
| Empty featured | Hide section (never “No featured”) |
| Search focus | Ring signal @ 80%; glass opacity +8% |

---

## 8. Anti-patterns (reject)

- Icon grid of 8 categories  
- Price ticker / inventory counters in hero  
- Carousel of promo cards with ribbons  
- White content card floating over a small hero image  
