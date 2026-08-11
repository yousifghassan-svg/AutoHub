# Vehicle Card Redesign

**Sprint:** AX-1  
**Status:** Proposal — **no code**  
**Target component:** `ListingCard` (marketplace); manage card shares image/type language.

---

## 1. Ambition

The most premium vehicle card possible within a marketplace grid:

- The **photo is 70% of the emotional weight**.
- Information is a quiet caption, not a data table.
- Hover feels like walking closer to the car.
- Favorite, verified, and featured are whispers — not stickers.

---

## 2. Anatomy

```
┌─────────────────────────────┐
│                             │
│         PHOTO 4:3           │  ← glass favorite (top-end)
│                             │  ← max 2 badges (top-start)
├─────────────────────────────┤
│ Title            18–20px    │
│ Year · km · city   meta     │
│                             │
│ 12,500,000 IQD     price    │  ← hero number
│ Dealer / seller    quiet    │
└─────────────────────────────┘
```

**Plate cards:** Swap photo for plate render; same caption structure (`plateDisplay` as title).

---

## 3. Information hierarchy

| Priority | Content | Treatment |
| --- | --- | --- |
| 1 | Cover image | Full bleed top; `radius-lg` top corners |
| 2 | Price | Display weight, tabular nums, currency secondary |
| 3 | Title | One line ellipsis; no multi-line clamp war |
| 4 | Meta | Year · mileage · city — single line, ink-secondary |
| 5 | Seller | Tiny line or avatar+name; optional |
| — | Specs dump | **Never** on card |

---

## 4. Image presentation

- Aspect **4:3** (marketplace); consistent across grid.
- `object-fit: cover`; focal preference center-bias.
- Loading: blur/LQIP → sharp.
- Hover: scale **1.04** inside clipped mask (`motion-base`, `ease-out-premium`).
- Broken image: graphite placeholder with minimal mark — not gray void.

---

## 5. Badges

| Badge | When | Style |
| --- | --- | --- |
| Featured | `isFeatured` | Signal-soft pill, 11–12px |
| Verified | `isVerified` | Success-soft + check |
| Status (manage only) | DRAFT/PENDING/… | Manage card only — not public marketplace |

**Hard cap:** 2 badges on marketplace card. Prefer Featured over Verified if both (or combine into one compact cluster with 4px gap).

No “New”, “Hot”, “Sale” novelty badges.

---

## 6. Price

- Largest text after title (or equal to title on mobile).
- IQD / USD from existing formatting — do not invent FX.
- Negotiable: quiet suffix or small label — never a yellow burst.

---

## 7. Dealer / seller

- Individual: display name, muted.
- Dealer: optional micro logo (24px) + name; verified dealer uses same verified language as listing when applicable.
- No large logo plate over the photo.

---

## 8. Favorite

- Position: top-end over image (`glass-chip`).
- Rest: outline heart; Active: signal or ink fill per theme.
- Motion: 2% spring pop once ([`MOTION_SYSTEM.md`](./MOTION_SYSTEM.md)).
- Hit area ≥ 44px; icon 20–22px.

---

## 9. Hover (desktop)

| Layer | Change |
| --- | --- |
| Image | Zoom 1.04 |
| Elevation | `e1` → `e2` |
| Border | Optional 1px stronger hairline |
| Title | Ink full (if was soft) |

No translate-Y jump that reflows the grid. No glow rings.

---

## 10. Micro-interactions

| Event | Response |
| --- | --- |
| Press | Scale 0.985 |
| Favorite toggle | Heart morph + optional haptic later (mobile) |
| Focus (keyboard) | Visible signal ring on whole card |
| Enter grid | Stagger fade-up |

---

## 11. Verified & Featured together

```
[ Featured ] [ ✓ Verified ]   ← top-start stack or single row
```

If space tight (mobile): Featured only on image; Verified as tiny check beside seller line.

---

## 12. Manage variant (`ManagedListingCard`)

Share: image ratio, type, price gravity.  
Differ: status badge, views/favorites meta, owner action row below.  
Do not clone a second visual system.

---

## 13. Accessibility

- Card is one link (or link wraps media+title); favorite is separate button (stop propagation — already a pattern).
- Alt text: vehicle title.
- Contrast on glass favorite chip sufficient over bright photos (scrim behind chip if needed).

---

## 14. Success criteria

- Grid of 12 cards feels like a gallery, not a spreadsheet.
- User can spot price and year in <1s.
- Hover feels expensive, not playful.
- Zero API/field changes — presentation of existing `ListingCardModel` only.
