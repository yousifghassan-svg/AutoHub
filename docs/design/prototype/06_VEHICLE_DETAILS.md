# Prototype Spec — Vehicle Details

**ID:** AX-1.1 / VD  
**Fidelity:** High  
**Constraint:** Data, ownership actions, contact APIs **FROZEN**

---

## Memory test

Tomorrow they remember the **gallery** and the **price** — as if they stood in front of the car.

---

## 1. Desktop layout (1440)

```
Breadcrumbs (quiet)

┌─────────────────────────────┬──────────────────────┐
│                             │ Title 36/display     │
│   GALLERY                   │ Price 40 tabular     │
│   main 16:10 radius-xl      │ Badges (max 2)       │
│   thumbs row gap 8          │ Meta year·km·city    │
│                             │                      │
│                             │ [ Call ] signal      │
│                             │ [ WhatsApp ] second  │
│                             │ ♡  Share  Message    │
│                             │                      │
│                             │ Seller card          │
└─────────────────────────────┴──────────────────────┘
   ~58% width                    ~42% width  sticky until gallery end

Description
Specifications  (quiet 2-col definition list — not loud tiles)
Equipment chips
Location
Related  (card grid)
```

### Gallery

- Main image edge-aware; click → lightbox (fade, no circus).
- Thumbs: 72px · active 2px signal border.
- No sticker overlays on main image.

### Purchase column

- Sticky top offset below header.
- One primary contact CTA; others ghost/icon.
- Owner: Manage card replaces visitor CTAs (existing actions).

---

## 2. Mobile layout

```
Gallery full-bleed width · 4:3 or 16:10
Thumbs horizontal
Title + price block padding 16
Badge row
CTA bar sticky bottom: Call | WhatsApp | ♡
Seller accordion
Description…
Related carousel
```

Sticky bottom CTA: glass · safe-area · height 64.

---

## 3. Typography

| Element | Size |
| --- | --- |
| Title | 36 desktop / 28 mobile |
| Price | 40 / 32 tabular |
| Section H2 | 22 display |
| Body | 16/28 |

---

## 4. Specs presentation

Prefer **definition list**:

```
Fuel            Petrol
Transmission    Automatic
…
```

Label secondary 13 · value ink 15 · row padding 12 · hairline dividers optional.

Avoid rainbow icon+label grids.

---

## 5. Dark mode

- Gallery on canvas (photo full color).
- Sticky CTA column `surface`.
- Lightbox pure graphite with white controls.

---

## 6. Motion

- Thumb → main: crossfade 180ms.
- Sticky CTA bar mobile: slide up on enter.
- Related: stagger once.

---

## 7. JSON-LD / security note

Structured data remains; escaping per SEC-001 — not a visual concern but do not regress.

---

## 8. Anti-patterns

- Equal 50/50 columns that shrink the car  
- Floating “Limited time” chips on gallery  
- Contact buttons all same weight  
- Specs as 12 icon tiles  
