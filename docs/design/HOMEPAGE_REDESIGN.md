# Homepage Redesign Proposal

**Sprint:** AX-1  
**Status:** Proposal — **no code**  
**Goal:** First viewport proves AutoHub is not a normal marketplace.

---

## 1. Design intent

The homepage is a **showroom entrance**, not a dashboard.

- Brand is hero-level (wordmark scale equals or beats the headline).
- One dominant photographic plane (vehicles), edge-to-edge.
- One headline, one supporting sentence, one CTA group.
- No stats strips, schedule widgets, or promo sticker clusters in the first viewport.

**Brand test:** Remove the nav. The viewport must still feel like AutoHub.

---

## 2. Hero

### Composition (desktop)

```
┌─────────────────────────────────────────────────────────┐
│  [glass header]                                         │
│                                                         │
│   AUTOHUB                    full-bleed vehicle still   │
│   Iraq’s premium marketplace                            │
│   Find your next car with confidence.                   │
│                                                         │
│   [ Search cars ]   [ Sell ]                            │
│                                                         │
│   ──────────────── soft scrim ────────────────          │
└─────────────────────────────────────────────────────────┘
```

### Rules

- **Full-bleed hero only** — image is the background plane, not an inset card.
- No floating badges on the image.
- Scrim only where type needs legibility (`hero-scrim`).
- Headline does not overpower the wordmark.
- Optional slow Ken Burns (≤3%, 12s) — disabled for reduced motion.

### Mobile

- Same hierarchy; CTAs stack full-width.
- Hero height ~72–85vh — enough drama without trapping scroll.
- Search remains thumb-reachable.

---

## 3. Search experience

Search is the **primary doorway**.

| Element | Proposal |
| --- | --- |
| Hero field | Single prominent search — keyword placeholder in AR/EN |
| Secondary | “Advanced filters” link → `/vehicles/search` (frozen URL behavior) |
| Suggestion chips | 3–5 quiet chips (e.g. SUV, under 20M IQD) — visual only, map to existing search params later |
| Focus | Soft signal ring; field elevates slightly |

Do not rebuild Search logic. Visual gateway only.

---

## 4. Featured vehicles

- Section title: short (“Featured”) + one line support.
- Grid of **redesigned vehicle cards** (see vehicle card doc).
- 3 desktop / 1.1 peek carousel mobile (peek suggests more without dots circus).
- Motion: stagger enter on scroll into view (once).

No “Featured” sticker storm on the section header.

---

## 5. Categories

Photographic doorways — not icon grids.

| Tile | Content |
| --- | --- |
| Vehicles | Cropped car photography + label |
| Plates | Plate art / road texture + label |
| Optional future | Heavy / motorcycle — only if inventory warrants |

Hover: brightness + label opacity (motion system).  
Tap: existing routes (`/vehicles`, `/plates`).

---

## 6. Animations

| Moment | Spec |
| --- | --- |
| Load | Hero image ready → type fade-up → CTA delay 100ms |
| Scroll | Featured cards stagger once |
| Hover | Card image zoom; category brightness |
| Theme toggle | Header glass retints without layout jump |

No parallax stacks. No scroll-jacking.

---

## 7. Scrolling behavior

1. Hero (brand + search + CTAs)  
2. Featured vehicles  
3. Categories (if not in hero)  
4. Trusted dealers (quiet logos / names — no card farm)  
5. Sell CTA band (graphite, one sentence, one button)  
6. Footer  

**Section jobs:** one purpose, one headline, one supporting line each.

---

## 8. Mobile experience

- Sticky glass header with compact wordmark.
- Hero CTAs: Search primary, Sell secondary.
- Featured: horizontal snap carousel with peek.
- Category tiles: 2-up.
- Thumb-friendly spacing (`space-5`+).

---

## 9. Call-to-action

| Priority | CTA | Style |
| --- | --- | --- |
| 1 | Search / Browse vehicles | Signal primary |
| 2 | Sell | Secondary / ghost on hero (high contrast) |
| 3 | Mid-page Sell band | Primary on graphite |

Never more than two CTAs in the hero.

---

## 10. Visual hierarchy

1. Brand wordmark  
2. Hero photography  
3. Search  
4. Featured inventory  
5. Categories  
6. Sell  

Type scale: display for brand; restrained supporting sentence; avoid H1 fighting AutoHub.

---

## 11. What we remove from today’s home

- Competing mid-page “app-like” tiles that dilute the hero.
- Dense multi-card first viewport.
- Any promo chips over hero media.
- Generic icon rows.

---

## 12. Success criteria (qualitative)

- 5-second brand test passes.  
- User understands “cars + plates, Iraq, premium” without reading a paragraph.  
- Featured cars feel desirable, not listed.  
- Zero frozen marketplace behavior changes.
