# Prototype Spec — Premium Vehicle Card

**ID:** AX-1.1 / VC  
**Component:** Marketplace `ListingCard` (manage shares DNA)  
**Fidelity:** High · all states

---

## Memory test

Tomorrow they remember the **photo zoom** and the **price** — not a wall of badges.

---

## 1. Dimensions

| Viewport | Width | Image | Radius |
| --- | --- | --- | --- |
| Desktop grid | fluid (~360–380) | 4:3 | 16px overall |
| Mobile carousel | 78vw | 4:3 | 16px |
| Skeleton | same | same | same |

Padding caption: 16px 16px 18px. Gap title→meta 6px; meta→price 12px.

---

## 2. Structure (light rest)

```
┌─────────────────────────────┐
│ ░░░░░░░░░ PHOTO ░░░░░░░░░░  │  glass ♡ 40×40 top-end
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░  │  badges top-start (max 2)
├─────────────────────────────┤
│ 2021 Toyota Camry SE        │  17px/22 semibold ink · 1 line
│ 2021 · 45,000 km · Baghdad  │  13px/18 ink-secondary
│                             │
│ 18,500,000                  │  22px/28 bold tabular
│ IQD                         │  12px secondary beside or below
│ Al-Noor Motors        ✓     │  12px secondary + 14px check
└─────────────────────────────┘
```

Surface: `surface` · Border: 1px `border` · Shadow: `e1`.

---

## 3. Hover (desktop pointer)

| Layer | Change |
| --- | --- |
| Image | Scale 1.04, clip to top radius, 200ms ease-out-premium |
| Card | Shadow → `e2`; border → `border-strong` (dark: stronger hairline) |
| Title | Remains ink (no underline) |
| Cursor | pointer on card link |

No Y-translate. No glow.

---

## 4. Featured

- Pill top-start: “Featured” · 11px semibold · signal-soft fill · signal text · radius-full · padding 4×10.
- Optional 1px signal edge on card **left** only (2px) — desktop; omit on mobile if busy.

---

## 5. Verified

- Prefer: small success check **beside dealer name** (14px).
- If no dealer line: second pill “Verified” success-soft — only if Featured absent; if both, Featured pill + check by seller.

---

## 6. Dealer

- Line: optional 20px circular logo + name ellipsis.
- Verified dealer: check after name.
- Never overlay logo on photo.

---

## 7. Favorite

| State | Visual |
| --- | --- |
| Rest | Glass chip · heart outline white/ink |
| Hover chip | Background +10% opacity |
| Active | Heart filled signal (light) / `#E11D48` (dark) |
| Motion | Spring 2% once on activate |

Separate control from card navigation (hit 44×44).

---

## 8. Loading

```
┌─────────────────────────────┐
│ ▓▓▓▓▓ shimmer 4:3 ▓▓▓▓▓▓▓▓ │
├─────────────────────────────┤
│ �▓▓▓▓ shimmer 4:3 ▓▓▓▓▓▓▓▓ │
├─────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓               │
│ ▓▓▓▓▓▓▓▓▓                   │
│ ▓▓▓▓▓▓▓                     │
└─────────────────────────────┘
```

Shimmer 1.2s · skeleton tokens · no brand-colored bones.

---

## 9. Dark mode

| Element | Spec |
| --- | --- |
| Card | `#171B21` · border `#2A313A` |
| Photo | Full color |
| Favorite glass | Blur 8px · surface @ 70% |
| Price | `#F2F4F7` |
| Meta | `#A8B0BA` |
| Hover | Border `#3A4350` · ambient shadow soft |

---

## 10. Plate variant

- Hero: rendered plate centered on graphite matte `#1E242C` (not photo).
- Title: plate display string.
- Meta: governorate · type.
- Same caption / price / favorite rules.

---

## 11. Press & focus

- Press: scale 0.985 / 100ms.
- Focus-visible: 2px signal ring offset 2px around card.

---

## 12. Anti-patterns

- 3+ badges  
- Spec grid on card  
- Yellow “negotiable” burst  
- Ribbon corners  
- Different radius than gallery siblings  
