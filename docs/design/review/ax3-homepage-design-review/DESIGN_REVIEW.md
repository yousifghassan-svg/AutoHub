# AX-3 Homepage — Design Review Package

**Status:** Ready for visual approval  
**Scope:** Homepage (`/`) only  
**Constraint:** No implementation changes until this review is approved  
**Source commit:** `f29ebfc` (AX-3 homepage identity)

---

## Artifacts

| # | Artifact | Path |
| --- | --- | --- |
| 1 | Full-page desktop (1440px) | [`screenshots/01-desktop-fullpage-1440.png`](./screenshots/01-desktop-fullpage-1440.png) |
| 2 | Full-page tablet | [`screenshots/02-tablet-fullpage.png`](./screenshots/02-tablet-fullpage.png) |
| 3 | Full-page mobile | [`screenshots/03-mobile-fullpage.png`](./screenshots/03-mobile-fullpage.png) |
| 4 | ~15s screen recording | [`recording/homepage-15s.webm`](./recording/homepage-15s.webm) |
| 5 | Metrics capture (JSON) | [`metrics-captured.json`](./metrics-captured.json) |

### Recording script (what it covers)

`record-homepage.mjs` (~15s @ 1440×900):

1. Initial page load  
2. Hero enter (brand + search settle)  
3. Search focus + type “Toyota”  
4. Clear search  
5. Smooth scroll through sections (motion / stagger opportunity)  
6. Return toward top  

---

## Performance environment note

All Lighthouse / Web Vitals numbers below were measured against **`next dev` on localhost**, after a warm compile.

They are **not** production Lighthouse scores. Concurrent `next build` could not complete while the dev server held `.next` (EPERM on `.next/trace`). Treat numbers as **directional for review**, then re-run on a production build before any ship gate.

---

## Lighthouse / Web Vitals

### Core metrics (warm `next dev`)

| Metric | Mobile | Desktop |
| --- | --- | --- |
| **First Contentful Paint (FCP)** | **2.0 s** | **0.5 s** |
| **Largest Contentful Paint (LCP)** | **7.3 s** | **0.5 s** |
| **Cumulative Layout Shift (CLS)** | **0** | **0** |
| Speed Index | 9.6 s | 1.8 s |
| Total Blocking Time | 17.2 s | 3.9 s |
| Time to Interactive | 28.6 s | 6.1 s |

### Category scores

| Category | Result |
| --- | --- |
| Performance | **Not rollup-scored in JSON** (CLI category flag collapsed under PowerShell). Directionally **poor on mobile** in this env (LCP 7.3s + extreme TBT). Desktop paint metrics look strong; TBT still heavy under dev. |
| Accessibility | **Near-pass on binary audits** in the successful run; desktop flagged `label-content-name-mismatch`. Re-verify with axe on production. |
| Best Practices | Issues: `errors-in-console`, `valid-source-maps` (dev), `bf-cache`. |
| SEO | Title/viewport/robots OK; Lighthouse reported **missing meta description** in this run (investigate on prod — `page.tsx` exports `metadata.description`). |

Raw attempt files: `lighthouse-mobile.json`, `lighthouse-desktop.json` (later runs hit NO_FCP / 500 when `.next` corrupted — prefer `metrics-captured.json`).

### What the metrics imply for identity review

- **CLS ≈ 0** — layout feels stable; good for a premium first impression.  
- **Mobile LCP is the risk** — hero photography (remote Unsplash) is the likely LCP element; owned/CDN hero + production build should be required before launch.  
- **Dev TBT is not diagnostic of final JS cost** — still a warning that the homepage client island + Motion + query hydration deserves a production bundle check next.

---

## Bundle impact

| Item | Finding |
| --- | --- |
| `framer-motion` on disk (web) | ~**4.6 MB** package tree (source/dist on disk, not transferred bytes) |
| Homepage architecture | Client island (`HomePageView`) + Framer Motion + react-query section fetches |
| Lazy behavior | Below-fold sections enable fetches near viewport; Featured eager |
| Production First Load JS for `/` | **Unavailable this session** (build locked by live `.next`) |
| Qualitative delta vs pre-AX-3 | Adds Motion dependency (also used by Design Lab); replaces dense multi-widget homepage with fewer, heavier media-led surfaces |

**Review ask (post-approval, not now):** run `next build` with server stopped and record `/` First Load JS + shared chunks.

---

## Design review answers

### 1. Does the homepage pass the Screenshot Test?

**Mostly yes — with one caveat.**

Tomorrow’s memory from the first viewport is: **a cinematic car**, the word **AutoHub**, and a **single search** that feels like a showroom door. That is the intended memory test, and the desktop/mobile first screens achieve it.

Caveat: when inventory APIs return empty, below-fold sections become skeleton rows or hide — the *first viewport* still passes; the *full-page* screenshot can look unfinished if Featured/Latest have no cards. Identity judgment should weight the hero first.

### 2. Does it still look like a marketplace?

**Structurally yes; tonally less so.**

It still has browse sections, View all links, Vehicles/Plates doorways, and a sell band — marketplace bones. But the first screen no longer reads as a classifieds index (no category tiles, stats strip, or “why us” cards competing with the car). It looks like a **premium automotive destination that happens to list inventory**, not OpenSooq with a new coat of paint.

### 3. What feels premium?

- Full-bleed cinematic hero with graphite scrim  
- Brand wordmark as the largest type on the photograph  
- Spotlight-style glass search as the primary action  
- Quiet Search / ghost Sell hierarchy  
- Breathing section rhythm (large titles, short support lines)  
- Price-on-image card language (when inventory renders)  
- Graphite sell band — luxury material, not neon dark mode  
- Near-zero CLS — the page doesn’t “jump” while settling  

### 4. What still feels generic?

- Default SiteHeader chrome above the hero (competent product nav, not yet showroom-native)  
- Stock Unsplash hero / doorway photography (premium treatment, not AutoHub’s own Iraq truth)  
- Skeleton grids when data is loading/empty — standard product UI  
- “View all” + repeated section headers can still read as catalog IA  
- Primary button radius/weight still close to generic design-system pills  
- Footer remains a conventional multi-column marketplace footer  

### 5. Which three visual elements should become permanent AutoHub identity?

1. **Showroom door hero** — Full-bleed vehicle photography + **AutoHub** as largest type + one support line. Nothing else in the first mental frame.  
2. **Spotlight search** — Centered glass search as the first interaction; filters and categories come after intent.  
3. **Photograph-with-price card** — Large media, price in the scrim, minimal metadata, at most one quiet trust mark.

*(Secondary keepers if a fourth is allowed later: graphite sell band; signal-red primary only.)*

---

## Recommendation

**Approve the visual direction of AX-3 Homepage** for identity — especially the three signature elements above — **before** any Vehicle Cards / Search / Details work.

Do **not** treat current mobile Lighthouse numbers as a ship gate; schedule a production-build perf pass after approval, without redesigning the identity.

---

## Explicit holds

- No Vehicle Cards system rollout  
- No Search page redesign  
- No Vehicle Details redesign  
- No implementation edits until this review is approved  
