# AX-1.1 — Design Prototype Index

**Phase:** Design prototype (pre-implementation)  
**Status:** Draft — awaiting approval  
**Code:** None. No React, CSS, or production UI.

Builds on approved AX-1 system docs in [`../`](../).

---

## Purpose

Define a **complete visual prototype** of AutoHub as screen specifications — high fidelity, not wireframes — so engineering later implements a remembered brand, not a generic marketplace.

**Memory test (every screen):** Would someone remember this UI tomorrow? If not, the spec fails.

---

## Spec conventions

| Term | Meaning |
| --- | --- |
| Desktop | 1280–1440px artboard; content max ~1200px unless full-bleed |
| Mobile | 390×844 reference; safe areas respected |
| Tokens | From [`../VISUAL_LANGUAGE.md`](../VISUAL_LANGUAGE.md) + [`../DARK_THEME_2.md`](../DARK_THEME_2.md) |
| Motion | From [`../MOTION_SYSTEM.md`](../MOTION_SYSTEM.md) |
| Frozen | Marketplace / Search / Auth logic unchanged — visuals only |

### Fidelity checklist (per screen)

- [ ] Photography treatment specified  
- [ ] Type sizes / weights  
- [ ] Spacing on 4px grid  
- [ ] Light + dark notes  
- [ ] Desktop + mobile  
- [ ] Empty / loading / error where relevant  
- [ ] Memory-test rationale  

---

## Deliverable map

| # | Spec | File |
| --- | --- | --- |
| 1 | Homepage | [`01_HOMEPAGE.md`](./01_HOMEPAGE.md) |
| 2 | Premium Vehicle Card | [`02_VEHICLE_CARD.md`](./02_VEHICLE_CARD.md) |
| 3 | Search Experience | [`03_SEARCH.md`](./03_SEARCH.md) |
| 4 | My Listings Dashboard | [`04_MY_LISTINGS.md`](./04_MY_LISTINGS.md) |
| 5 | Sell Wizard | [`05_SELL_WIZARD.md`](./05_SELL_WIZARD.md) |
| 6 | Vehicle Details | [`06_VEHICLE_DETAILS.md`](./06_VEHICLE_DETAILS.md) |
| 7 | Dealer Profile | [`07_DEALER_PROFILE.md`](./07_DEALER_PROFILE.md) |
| 8 | Dark Theme (cross-cutting) | [`08_DARK_THEME.md`](./08_DARK_THEME.md) |

---

## Explicit non-goals

- No OpenSooq / Dubizzle / Cars.com patterns  
- No production integration  
- No API, DB, or frozen marketplace changes  

**Next gate:** Approval of these specs before any UI implementation sprint.
