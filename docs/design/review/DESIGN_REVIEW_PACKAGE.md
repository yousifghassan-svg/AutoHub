# AutoHub Design Review Package (AX-2)

**Status:** Ready for visual-identity decision  
**Source:** Official Design Lab (`/design-lab`) — approved sandbox  
**Constraint:** No production merge. No copy into production pages. Identity first.

This package decides **what AutoHub should look and feel like** before any implementation sprint touches frozen product surfaces.

---

## How to use this package

1. Open the live lab: `http://localhost:3000/design-lab`
2. Review screenshots in [`screenshots/`](./screenshots/) — **desktop · tablet · mobile** for every surface
3. Read the cross-cutting verdict below (sections 1–7)
4. Approve / amend the **signature candidates** before any production visual work

Viewports used for capture:

| Breakpoint | Size |
| --- | --- |
| Desktop | 1440 × 900 |
| Tablet | 768 × 1024 |
| Mobile | 390 × 844 |

---

## Screenshot index (every page × 3)

| Surface | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Lab Home | [`lab-home--desktop.png`](./screenshots/lab-home--desktop.png) | [`lab-home--tablet.png`](./screenshots/lab-home--tablet.png) | [`lab-home--mobile.png`](./screenshots/lab-home--mobile.png) |
| Homepage | [`homepage--desktop.png`](./screenshots/homepage--desktop.png) | [`homepage--tablet.png`](./screenshots/homepage--tablet.png) | [`homepage--mobile.png`](./screenshots/homepage--mobile.png) |
| Vehicle Card | [`cards--desktop.png`](./screenshots/cards--desktop.png) | [`cards--tablet.png`](./screenshots/cards--tablet.png) | [`cards--mobile.png`](./screenshots/cards--mobile.png) |
| Search | [`search--desktop.png`](./screenshots/search--desktop.png) | [`search--tablet.png`](./screenshots/search--tablet.png) | [`search--mobile.png`](./screenshots/search--mobile.png) |
| Sell Wizard | [`sell--desktop.png`](./screenshots/sell--desktop.png) | [`sell--tablet.png`](./screenshots/sell--tablet.png) | [`sell--mobile.png`](./screenshots/sell--mobile.png) |
| Vehicle Details | [`vehicle--desktop.png`](./screenshots/vehicle--desktop.png) | [`vehicle--tablet.png`](./screenshots/vehicle--tablet.png) | [`vehicle--mobile.png`](./screenshots/vehicle--mobile.png) |
| My Listings | [`my-listings--desktop.png`](./screenshots/my-listings--desktop.png) | [`my-listings--tablet.png`](./screenshots/my-listings--tablet.png) | [`my-listings--mobile.png`](./screenshots/my-listings--mobile.png) |
| Dealer Profile | [`dealer--desktop.png`](./screenshots/dealer--desktop.png) | [`dealer--tablet.png`](./screenshots/dealer--tablet.png) | [`dealer--mobile.png`](./screenshots/dealer--mobile.png) |
| Motion | [`motion--desktop.png`](./screenshots/motion--desktop.png) | [`motion--tablet.png`](./screenshots/motion--tablet.png) | [`motion--mobile.png`](./screenshots/motion--mobile.png) |
| Dark Theme | [`dark--desktop.png`](./screenshots/dark--desktop.png) | [`dark--tablet.png`](./screenshots/dark--tablet.png) | [`dark--mobile.png`](./screenshots/dark--mobile.png) |
| Components | [`components--desktop.png`](./screenshots/components--desktop.png) | [`components--tablet.png`](./screenshots/components--tablet.png) | [`components--mobile.png`](./screenshots/components--mobile.png) |

**33 screenshots total.** Lab chrome (sidebar / mobile pill nav) appears in captures — judge **prototype content**, not the sandbox chrome, when deciding product identity.

---

## 1. Design goals

What this review must lock before implementation:

| Goal | Meaning |
| --- | --- |
| **Cars are the hero** | Photography and vehicle presence outrank chrome, stats, and promo clutter |
| **Not a normal marketplace** | Memory test: full-bleed car + AutoHub wordmark + one calm entry action |
| **Signal + graphite** | One accent (signal red); deep neutrals; no purple SaaS, no cream editorial cliché |
| **Premium restraint** | Large type, generous whitespace, short motion, decisive CTAs |
| **Iraq-first, globally legible** | IQD/USD clarity, city reality, RTL-ready hierarchy (identity must not assume LTR-only beauty) |
| **Spotlight search** | Finding a car feels like focus, not filter bureaucracy |
| **Frozen product safety** | Visual language is decided here; production stays untouched until approval |

North star (from manifesto): *This is not a normal marketplace.*

---

## 2. What works well

Cross-cutting strengths visible across the lab:

1. **Homepage hero composition** — Brand wordmark is the largest type; photography is edge-to-edge; Search / Sell hierarchy is clear; first viewport passes the memory test.
2. **Premium vehicle card** — Price on media, quiet metadata below, hover lift without bounce, Featured/Verified without sticker chaos.
3. **Search as focus ritual** — Centered panel, suggestion list, results as photography grid — closer to Spotlight than classifieds.
4. **Dark graphite showcase** — Luxury without neon; signal red still readable; cards remain photographic on dark canvas.
5. **Whitespace discipline** — Sell wizard, lab index, and empty-state samples feel calm rather than dense dashboards.
6. **Motion vocabulary** — Short ease-out fades/rises; stagger capped; no spring carnival.
7. **Component honesty** — Gallery shows real primitives (buttons, badges, skeletons, empty states) so polish targets are concrete.

Per-surface highlights:

| Surface | Works |
| --- | --- |
| Homepage | Full-bleed hero; brand-first; glass search on photo |
| Cards | Large / grid / compact scales; photography-led |
| Search | Spotlight panel + live filter of prototype results |
| Sell | One job per step; quiet stepper; clear Continue |
| Vehicle | Cinema-width media; sticky price rail; sparse specs |
| My Listings | Status-at-a-glance rows; airy empty state |
| Dealer | Banner → identity → inventory using same card language |
| Dark | Graphite bands + night photography |
| Motion | Documented, restrained catalog |
| Components | Full primitive inventory for future system work |

---

## 3. What feels generic

Patterns that still read as “any modern marketplace / SaaS UI”:

1. **Default rounded form controls** — Make/Model/Year inputs and primary buttons look like stock design-system fields, not machined automotive UI.
2. **Pill badges everywhere** — Featured / Verified / Active / Draft / Pending / PROTOTYPE — pill clusters are the industry default.
3. **Standard card ring + white surface** — Soft ring-1 cards on white read as Tailwind template more than showroom material.
4. **My Listings as admin list** — Thumbnail + title + status + Edit/View is correct functionally, but visually interchangeable with any seller dashboard.
5. **Sell stepper dots** — Numbered circles connected by hairlines is a wizard cliché.
6. **Dealer “verified” + contact CTA** — Credible, but not yet distinctive vs global dealer pages.
7. **Lab index as link tiles** — Fine for a playground; not a brand surface (ignore for product identity).
8. **Component gallery density** — Useful for audit; not a brand moment.
9. **Latin-only prototype content** — Identity risk if Arabic rhythm isn’t proven in the same compositions before production.
10. **Stock Unsplash cars** — Premium *treatment*, but photography is not yet AutoHub’s own Iraq / regional truth.

---

## 4. What feels premium

Moments that already feel expensive and should be protected:

1. **Full-bleed automotive photography with scrim** — Homepage, vehicle details, dark showcase.
2. **Brand as hero type on photo** — “AutoHub” oversized, support line subordinate.
3. **Price embedded in the image** — Card and details treat money as part of the photograph, not a spreadsheet cell.
4. **Spotlight search void** — Negative space around the search panel.
5. **Graphite sell / dark bands** (`#171B21` / `#0E1116`) — Quiet luxury, not gradient theater.
6. **Hover: −4px + slow image scale** — Presence without playfulness.
7. **Sparse vehicle details column** — Specs as a short definition list, not an icon zoo.
8. **Featured grid with breathing room** — Three cards, gap, one support sentence.

These are the seeds of the signature — not the generic chrome around them.

---

## 5. What should be removed

Remove from the *eventual product language* (not necessarily delete from the lab tonight):

| Remove | Why |
| --- | --- |
| Floating promo / sticker language on heroes | Breaks memory test; manifesto forbids |
| Dense status color rainbow on consumer browse | Status must never outrank the car |
| Dashboard chrome on public surfaces | Stats strips, “this week,” multi-CTA hero clutter |
| Purple / glow / mesh aesthetics | Explicitly anti-AutoHub |
| Duplicate card systems | One Premium Vehicle Card language |
| Apology / prototype copy in product UI | Lab-only |
| Competing CTAs in the first viewport | Search leads; Sell is secondary |
| Decorative icon rows for specs | Prefer short text facts |
| Over-rounded “soft SaaS” everywhere | Soften only where touch targets need it; metal elsewhere |

Lab-only note (not a product defect): mobile captures sometimes show production header remnants under the sandbox — ignore for identity; do not “fix production” as part of this review.

---

## 6. What should be simplified

| Area | Simplify to |
| --- | --- |
| Homepage below-fold | Featured → two category doorways → one sell band. Kill extra strips until needed |
| Search | One focused field + suggestions + results. Filters as a second beat, not the first impression |
| Sell wizard | Keep four steps max for vehicles; hide advanced fields behind “More details” |
| Vehicle details | Media → title/price → contact → short facts → gallery. Collapse long description |
| My Listings | Row = photo, title, price, one status, one primary action. Secondary actions in a menu |
| Dealer | Identity block + inventory grid. No review walls or badge museums in v1 identity |
| Motion | Three verbs only for product: enter, stagger, hover-lift. Everything else optional |
| Badges | At most two on a consumer card (e.g. Featured XOR Verified emphasis) |
| Type scale | Fewer sizes; larger steps between brand / title / meta |

Simplification rule: **if removing an element makes the car feel more present, remove it.**

---

## 7. What should become AutoHub signature

Decide these as identity locks (approve / amend):

### Signature A — Showroom door (Homepage)

Full-bleed regional car · **AutoHub** as largest type · glass search · signal Search CTA · ghost Sell. Nothing else in the first viewport.

### Signature B — Photograph with price (Vehicle card)

Edge-to-edge image · price in the scrim · title + three meta facts · max one quiet trust mark. Hover is presence, not bounce.

### Signature C — Spotlight find (Search)

Centered search in calm void · suggestions · results as photography. Filters arrive after intent, not before.

### Signature D — Graphite luxury (Dark + sell band)

Deep graphite canvases · signal red only for action/brand · no neon. Dark is a material, not a theme skin.

### Signature E — Quiet seller tools (My Listings / Sell)

Seller surfaces stay airy and decisive — never shouty “growth” dashboards. Calm is the brand even when managing inventory.

### Signature F — Motion as cost of materials

240–350ms · shared ease `(0.16, 1, 0.3, 1)` · fade/rise/stagger/lift only. Expensive stillness > clever animation.

### Signature G — Signal red discipline

One red. Used for brand accent and primary action. Never for decoration walls or alert spam.

### Signature H — Iraq-first composition (to prove next)

Same compositions with Arabic-primary type, RTL, IQD-first pricing, and photography that feels local — or the identity is incomplete.

---

## Per-page review notes (quick)

### Homepage
- **Keep:** Hero brand + photo + search stack (all breakpoints).
- **Generic risk:** Category tiles and dealer logo strips can slide into marketplace template if overfilled.
- **Mobile:** Stacked Search then Sell is correct; lab pill nav is chrome noise.

### Vehicle Card
- **Keep:** Large/grid/compact system; price-on-image.
- **Simplify:** Badge count; dealer line treatment.
- **Signature candidate:** This card *is* the browse identity.

### Search
- **Keep:** Spotlight panel + suggestion list.
- **Remove later:** Anything that turns the first paint into a filter spreadsheet.
- **Tablet/mobile:** Panel still works; protect vertical breathing room.

### Sell Wizard
- **Keep:** One job per step; generous type.
- **Generic:** Numbered stepper + default inputs.
- **Signature path:** Photographer’s desk energy on Photos step; Review as final inspection, not checkout panic.

### Vehicle Details
- **Keep:** Cinema media; sticky commerce rail.
- **Simplify:** Spec grid → fewer facts; avoid icon packs.
- **Signature:** The car should feel larger than the UI chrome at every breakpoint.

### My Listings
- **Keep:** Quiet rows + empty state philosophy.
- **Generic:** Most “manage listings” UIs look like this — differentiate with typography, photo crop, and restraint, not more widgets.

### Dealer
- **Keep:** Banner → identity → same card language.
- **Remove:** Temptation to add scores, ribbons, and promo strips.

### Motion / Dark / Components
- **Motion:** Approve the short catalog as the product motion budget.
- **Dark:** Approve graphite + signal as the only dark story.
- **Components:** Use as the audit checklist for future system work — not as a consumer surface.

---

## Decision gate

**Approve** this package (or an amended signature list) before any production visual implementation.

Until then:

- Design Lab remains the official playground  
- Production pages stay frozen / untouched  
- No merge of lab UI into application routes  

**Outcome of this review:** a locked AutoHub visual identity — not a shippable production UI.
