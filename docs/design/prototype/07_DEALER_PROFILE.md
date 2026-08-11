# Prototype Spec — Dealer Profile

**ID:** AX-1.1 / DP  
**Fidelity:** High  
**Routes:** Public dealer surface (e.g. `/dealers/[slug]`)

---

## Memory test

Tomorrow they remember a **showroom identity** — logo, name, inventory gallery — not a directory business card.

---

## 1. Desktop hero

```
FULL-BLEED soft graphite or dealer cover photo (if any)
height 280–320

┌ glass identity card overlapping bottom of hero ────────────┐
│ [ logo 72 ]  Dealer Name                    ✓ Verified     │
│              Baghdad · Vehicles                            │
│              Short bio one or two lines                    │
│              [ Message ] secondary   [ Call ] signal       │
└────────────────────────────────────────────────────────────┘
```

- Identity card: `surface` · radius-lg · e2 · max-width 960 centered · translateY(40%).
- Logo: 72 circular or rounded-md on muted well.
- No map collage in hero.

---

## 2. Inventory section

```
Inventory                         Sort ▾
support line

▢ ▢ ▢  Premium cards 3-col
▢ ▢ ▢
```

Same card spec as marketplace. Empty: “No active vehicles” calm.

---

## 3. Trust strip (optional, quiet)

Single row under identity — not a stats carnival:

`Member since 2019  ·  24 active  ·  Response usually within a day`

Tabular · ink-secondary · no big KPI cards.

*(Only show fields that exist in API — do not invent metrics in implementation.)*

---

## 4. Mobile

- Hero 200h.
- Identity card full-bleed inset 16 · stack logo+name.
- CTAs full width stacked.
- Inventory 1-col / peek carousel.

---

## 5. Dark mode

- Hero canvas `#0E1114` or darkened cover.
- Identity `surface` `#171B21`.
- Verified check success on dark.

---

## 6. Motion

- Page enter: hero fade · identity rise 12px.
- Card grid: standard stagger.

---

## 7. Anti-patterns

- Yellow “Authorized dealer” ribbons  
- Testimonial carousels with stock faces  
- Sidebar ads  
- Different card style than marketplace  
