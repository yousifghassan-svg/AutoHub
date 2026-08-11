# Prototype Spec — Search Experience

**ID:** AX-1.1 / SR  
**Fidelity:** High  
**Constraint:** Search URL/API **FROZEN** — visual shell only

---

## Memory test

Tomorrow they remember search as a **quiet instrument** — results felt like a gallery, filters never a wall.

---

## 1. Homepage search

See [`01_HOMEPAGE.md`](./01_HOMEPAGE.md).

Additional:

| Element | Spec |
| --- | --- |
| Placeholder | AR/EN locale-appropriate; calm, not SEO spam |
| Submit | Enter or Search CTA → `/vehicles/search?q=…` (existing contract) |
| Suggestions (optional overlay) | Below field, glass panel, 5 rows max |

### Suggestion panel (homepage)

```
┌──────────────────────────────────────┐
│ Recent                               │  11px uppercase tracking
│  Camry                               │  15px rows · 44h hit
│  Erbil                               │
│ Trending                             │
│  SUV · under 20M                     │  quiet chips row
└──────────────────────────────────────┘
```

No logos, no ad units.

---

## 2. Sticky search

### When

Appears after hero scrolls away (home) or always on `/vehicles/search` below header.

### Desktop bar (48–52px content)

```
[ glass sticky under header ]
┌────────────────────────────────────────────────────────────┐
│ 🔍 [ query ……………………………… ]  [ Filters ]  Sort ▾  128 results │
└────────────────────────────────────────────────────────────┘
```

- Height 56 including padding; blur header-aligned.
- Filters opens side panel / sheet — not a mega-form dump.
- Result count tabular, ink-secondary.

### Mobile

- Compact sticky: field + filter icon button.
- Sort in filter sheet.

---

## 3. Search results page

### Desktop layout (1440)

```
┌─ sticky search bar ───────────────────────────────────────┐
├──────────────┬────────────────────────────────────────────┤
│ Filters      │  Active chips: Camry ×  · Baghdad ×  Clear │
│ rail 280px   │                                            │
│              │  ▢ ▢ ▢   Premium card grid 3-col gap 24   │
│ Make         │  ▢ ▢ ▢                                     │
│ Price        │  ▢ ▢ ▢                                     │
│ Year …       │                                            │
│              │  [ Load more ]  quiet                      │
└──────────────┴────────────────────────────────────────────┘
```

### Filter rail aesthetic

- Not a dense Bootstrap form.
- Section labels 12px secondary.
- Controls with `space-4` rhythm.
- Apply is live (existing behavior) — no giant green Apply at bottom on desktop.
- Mobile: full-height sheet, primary “Done” at bottom.

### Results

- Cards: [`02_VEHICLE_CARD.md`](./02_VEHICLE_CARD.md).
- First paint: skeleton grid matching card geometry.
- No left “sponsored” column.

---

## 4. Search suggestions (results page)

As-you-type dropdown under sticky field:

| Row type | Visual |
| --- | --- |
| Query completion | Magnifier + bold match suffix |
| Make/model entity | Subtle car glyph + name |
| Location | Pin glyph + city |

Max 7 rows · Enter selects first · Esc closes.

---

## 5. Empty state

```
        [ quiet line-art car silhouette ]
        No vehicles match

        Try a broader keyword or clear filters.
        [ Clear filters ]   [ Browse featured ]
```

- Centered in results column.
- No sad illustration mascot.
- Dark: silhouette in border-strong stroke.

---

## 6. Loading & error

| State | Spec |
| --- | --- |
| Loading | 6–9 card skeletons; filter rail static |
| Error | EmptyState tone calm · Retry CTA · no red full-page |

---

## 7. Dark mode

- Sticky bar: glass on `#0E1114`.
- Rail: `surface` with hairline end border.
- Chips: `surface-raised` · remove × ink-secondary.

---

## 8. Motion

- Filter chip add/remove: 160ms scale fade.
- Results replace: 200ms crossfade (no layout thrash).
- Sheet: 280ms ease-out-premium.

---

## 9. Anti-patterns

- 20 visible filters on mobile first open  
- Yellow highlight blocks on keywords  
- Map+list split that shrinks photos to stamps  
- “Sponsored” cards with different chrome  
