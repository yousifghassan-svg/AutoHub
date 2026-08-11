# Prototype Spec — Dark Theme Across Screens

**ID:** AX-1.1 / DK  
**Fidelity:** High · cross-cutting  
**Base:** [`../DARK_THEME_2.md`](../DARK_THEME_2.md)

This spec shows how Dark Theme 2.0 lands on **each prototype screen** so the product feels one graphite showroom — not inverted light mode.

---

## Memory test

Tomorrow they remember AutoHub at night as **graphite and red** — like a dealership after hours, lights on the cars.

---

## 1. Global chrome

| Element | Dark prototype |
| --- | --- |
| Canvas | `#0E1114` |
| Header | Glass `#171B21`@78% · blur 14 · hairline bottom `#2A313A` |
| Wordmark | `#F2F4F7` · optional signal accent mark |
| Nav links | `#A8B0BA` → `#F2F4F7` hover |
| Footer | `#0E1114` with top hairline · links secondary |
| Theme control | Moon active state · quiet |

---

## 2. Homepage

| Zone | Treatment |
| --- | --- |
| Hero photo | Natural color · scrim →65% |
| Search glass | `#171B21`@75% · text white · placeholder white@50% |
| Featured | Cards on `#171B21` · gap shows canvas |
| Categories | Stronger bottom scrim on tiles |
| Sell band | Merge with canvas · top hairline only |

---

## 3. Vehicle card

Per [`02_VEHICLE_CARD.md`](./02_VEHICLE_CARD.md) § Dark mode.  
Favorite glass must remain readable on bright headlights in photos (inner 40% black@20% behind chip if needed).

---

## 4. Search

| Zone | Treatment |
| --- | --- |
| Sticky bar | Glass continuous with header |
| Filter rail | `#171B21` · end border |
| Inputs | `#1E242C` |
| Empty silhouette | Stroke `#3A4350` |

---

## 5. My Listings

| Zone | Treatment |
| --- | --- |
| Segments track | `#1E242C` |
| Active segment | `#171B21` + border |
| Status pills | Soft tints @14% |
| Create CTA | Signal `#E11D48` |

---

## 6. Sell Wizard

| Zone | Treatment |
| --- | --- |
| Panel | `#171B21` |
| Progress track | `#2A313A` · fill `#E11D48` |
| Quality bars | Required signal · recommended `#A8B0BA` |
| Success check | Signal-soft circle |

---

## 7. Vehicle details

| Zone | Treatment |
| --- | --- |
| Gallery | On canvas — photos pop |
| Purchase column | `#171B21` sticky |
| Mobile CTA bar | Glass `#171B21`@90% |
| Specs rows | Hairline `#2A313A` |

---

## 8. Dealer profile

| Zone | Treatment |
| --- | --- |
| Hero | Graphite or dimmed cover |
| Identity card | `#171B21` e2 |
| Inventory | Standard dark cards |

---

## 9. Elevation & focus (all screens)

- Prefer border lift over heavy shadows.
- Focus ring: `#E11D48` @ 90% · offset 2px — visible on graphite.
- Selection / chips: `#E11D48` @ 14% fill.

---

## 10. Pairing matrix (QA for future impl)

| Screen | Light hero? | Dark hero? | Pass if |
| --- | --- | --- | --- |
| Home | Photo | Photo+scrim | Brand legible |
| Search | — | Glass sticky | Field contrast AA |
| Detail | Photo | Photo | Price AA |
| Sell | — | Panel | Inputs obvious |
| Manage | — | Segments | Active segment clear |
| Dealer | Cover/graphite | Same | Logo visible |

---

## 11. Anti-patterns

- Pure `#000` canvas  
- Neon signal glow  
- Gray-on-gray body text  
- Different dark palette per feature team  

---

## 12. Delivery note

AX-1.1 documents the prototype only. Implementation maps CSS variables in a later approved UI sprint — **without** marketplace logic changes.
