# AutoHub Design Manifesto

**Sprint:** AX-1 (Experience)  
**Status:** **APPROVED** (documentation)  
**Prototype:** [`prototype/00_PROTOTYPE_INDEX.md`](./prototype/00_PROTOTYPE_INDEX.md) (AX-1.1 — awaiting approval)  
**Constraint:** Release 0.5 Marketplace is **FROZEN**. This manifesto defines identity only; it does not change marketplace logic, APIs, or data.

---

## 1. North star

When someone opens AutoHub, they should feel:

> **“This is not a normal marketplace.”**

Cars and plates are the product. The interface is the showroom floor — never the showroom manager shouting over the car.

We design for **confidence**, not clutter. For **emotion**, not novelty. For **speed**, not spectacle.

Reference spirit (not imitation): Apple’s restraint, Tesla’s stillness, Porsche’s precision, Rivian’s material honesty, Airbnb’s hospitality, Linear’s quiet velocity.

---

## 2. Design philosophy

### Cars are the hero

- Imagery leads; chrome follows.
- Type and controls exist to **clarify the vehicle**, not decorate the page.
- If removing a UI element makes the car feel more present, remove it.

### Premium, minimal, fast, confident, emotional

| Word | Meaning for AutoHub |
| --- | --- |
| Premium | Materials, spacing, and motion that feel intentional — never “startup template” |
| Minimal | One job per surface; no dashboard chrome on consumer pages |
| Fast | Perceived performance via skeletons, optimistic UI, and short motion |
| Confident | Strong hierarchy, decisive CTAs, no apology copy or visual noise |
| Emotional | Light, shadow, and photography create desire — not emoji or stickers |

### Restraint is the brand

- Prefer one accent (signal red) over a rainbow of status colors.
- Prefer silence between sections over divider soup.
- Prefer a single hero composition over a wall of cards in the first viewport.

### Iraq-first, globally legible

- Arabic-primary RTL is first-class, not a theme skin.
- Latin and Arabic typography share the same rhythm and confidence.
- Currency (IQD / USD) and geography are clear without shouting.

---

## 3. Motion philosophy

Motion is **meaning**, not decoration.

1. **Purposeful** — Every animation answers: what changed, and where should attention go?
2. **Short** — Prefer 120–280ms for UI; reserve longer curves for hero and success moments.
3. **Physical** — Ease-out for entrances; ease-in for exits; spring only where mass is implied (cards, sheets).
4. **Respectful** — Honor `prefers-reduced-motion`; reduce to opacity/instant state changes.
5. **One motion at a time** — Never choreograph five competing animations on one scroll tick.

Full specification: [`MOTION_SYSTEM.md`](./MOTION_SYSTEM.md).

---

## 4. Typography philosophy

| Role | Intent |
| --- | --- |
| Display | Vehicle titles, hero brand, section openers — confident, tight tracking |
| Body | Descriptions and forms — readable, calm, never dense walls |
| Meta | Price secondary lines, specs, timestamps — quiet, tabular where numbers align |
| Arabic | Same hierarchy as Latin; line-height generous enough for Arabic script |

Rules:

- One display family for brand moments; one text family for UI (current direction: Outfit + IBM Plex Arabic — evolve only with intent).
- Never use more than **three** type sizes in a single component.
- Price is a **hero number** on cards and detail; never bury it in a meta row.
- Avoid default “AI SaaS” stacks (Inter/Roboto/system) for marketing surfaces.

---

## 5. Spacing rules

AutoHub spacing is a **4px base grid**.

| Token | Value | Use |
| --- | --- | --- |
| `space-1` | 4px | Icon gaps, tight meta |
| `space-2` | 8px | Inline clusters |
| `space-3` | 12px | Compact stacks |
| `space-4` | 16px | Default component padding |
| `space-5` | 24px | Card internal sections |
| `space-6` | 32px | Section gaps (mobile) |
| `space-7` | 48px | Section gaps (desktop) |
| `space-8` | 64px | Hero breathing room |
| `space-9` | 96px | Major chapter breaks |

Rules:

- **Consistent inset:** Cards and dialogs use 16–24px padding; never 13px “optical hacks.”
- **Section rhythm:** Alternate dense (grids) and sparse (hero, CTA bands) — not uniform density.
- **Touch:** Primary hit targets ≥ 44×44px on mobile.
- **RTL:** Spacing mirrors; start/end — never left/right hardcoding in new work.

---

## 6. Component philosophy

Components are **tools for the car**, not products themselves.

1. **Composition over chrome** — Prefer layout and type over borders and shadows.
2. **Cards are rare** — Default: no card. Cards only when they contain a distinct interactive unit (listing, manage item, seller contact).
3. **One primary action** — Each view has one obvious next step.
4. **State is visible** — Hover, focus, loading, empty, error are designed — not afterthoughts.
5. **No duplicates** — One Button system, one Input system, one Modal system.
6. **Frozen logic, fluid skin** — Marketplace behavior stays; presentation may evolve under AX sprints.

Full inventory: [`COMPONENT_AUDIT.md`](./COMPONENT_AUDIT.md).

---

## 7. UX principles

1. **Orient in under one second** — Brand + primary intent visible without scrolling on mobile hero.
2. **Search is a doorway, not a form wall** — Progressive disclosure for filters.
3. **Trust without bureaucracy** — Verified / Featured badges are quiet signals, not stickers.
4. **Seller and buyer share one language** — Same type, color, and motion; different density.
5. **Errors are calm** — No scary dialogs for publish; soft recovery, clear next step.
6. **Empty states sell the product** — Show aspiration (what a great listing looks like), not a blank void.
7. **Never break the frozen marketplace contract** — Status, ownership, media trust, publish gates remain as shipped in 0.5.

---

## 8. Accessibility principles

Premium includes **everyone**.

- Contrast: body text meets WCAG AA; large display may use softer secondary ink.
- Focus: visible, brand-tinted rings; never `outline: none` without replacement.
- Motion: `prefers-reduced-motion` supported everywhere new motion lands.
- Semantics: tabs are tabs; dialogs are dialogs; progress has accessible values.
- RTL: full mirror; icons that imply direction flip or are replaced.
- Touch and keyboard: parity for sell wizard, search filters, and manage actions.

---

## 9. Premium experience principles

What “premium” means here — and what it does **not**:

| Do | Don’t |
| --- | --- |
| Full-bleed vehicle photography | Collage of tiny thumbnails in the hero |
| Graphite dark, deep surfaces | Pure `#000` voids or purple neon |
| Quiet elevation | Multi-layer drop shadows everywhere |
| One red signal accent | Gradient rainbow CTAs |
| Purposeful micro-interactions | Bounce, confetti, emoji reactions |
| Generous whitespace | Dense dashboard chrome |
| Confident Arabic + English | English-only “global” skin |

**The test:** Remove the navigation. If the first viewport could belong to a generic classifieds site, branding and photography are too weak.

---

## 10. Non-goals (AX-1)

- No new marketplace features or business rules.
- No API, database, or auth changes.
- No implementation in this sprint — documentation only.
- No imitation of a single OEM website; AutoHub is its own brand.

---

## 11. Related documents

| Doc | Role |
| --- | --- |
| [`MOTION_SYSTEM.md`](./MOTION_SYSTEM.md) | Timing, easing, surfaces |
| [`VISUAL_LANGUAGE.md`](./VISUAL_LANGUAGE.md) | Color, elevation, photography |
| [`COMPONENT_AUDIT.md`](./COMPONENT_AUDIT.md) | Current UI classification |
| [`HOMEPAGE_REDESIGN.md`](./HOMEPAGE_REDESIGN.md) | Home proposal |
| [`VEHICLE_CARD_REDESIGN.md`](./VEHICLE_CARD_REDESIGN.md) | Card proposal |
| [`DARK_THEME_2.md`](./DARK_THEME_2.md) | Graphite luxury dark |
| [`MICRO_INTERACTION_CATALOG.md`](./MICRO_INTERACTION_CATALOG.md) | Interaction dictionary |

---

**Approval gate:** No UI implementation until this manifesto and companion docs are approved.
