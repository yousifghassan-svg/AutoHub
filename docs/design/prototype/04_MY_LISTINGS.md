# Prototype Spec — My Listings Dashboard

**ID:** AX-1.1 / ML  
**Fidelity:** High  
**Constraint:** Action registry / APIs **FROZEN** — skin + layout only

---

## Memory test

Tomorrow they remember a **calm seller cockpit** — status segments and covers — not a spreadsheet admin theme.

---

## 1. Desktop layout

```
page-container max 1200

[ Seller dashboard ]     12px signal-soft label / tracking
My listings              36/display
Manage drafts, live ads, and archive — one place.   15 secondary

[ Create listing ]       signal · top-end aligned with title

┌ Search listings…          ┐  ┌ Sort ▾ ┐     toolbar gap 12
└───────────────────────────┘  └────────┘

( All | Draft | Pending | Active | … )   segmented control 40h

▢ ▢ ▢   Managed cards 3-col gap 24
▢ ▢ ▢
```

---

## 2. Segmented status control

- Height 40 · `radius-md` track `surface-muted`.
- Active segment: `surface` + hairline shadow e1 · ink semibold.
- Inactive: ink-secondary.
- Counts as optional suffix “Active 12” in tabular 12px.
- a11y: `role="tablist"` / `aria-selected` (spec for later impl).

**Not:** underline tabs that feel like a browser; not colored pills per status.

---

## 3. Managed listing card

Shares image DNA with Premium Card; denser caption.

```
┌──────────────┐
│ cover 4:3    │  status pill top-start (DRAFT/…)
├──────────────┤
│ Title        │
│ Price        │
│ 👁 120  ♡ 4  · Updated 2h ago
│ [ Continue ] [ Preview ] [ … ]   action row
└──────────────┘
```

- Status pill: muted semantics (draft gray, pending amber-soft, active success-soft) — soft fills only.
- Actions: secondary/ghost; destructive in overflow or confirm modal (existing).
- Hover: same image zoom language, lighter than marketplace (seller context).

---

## 4. Mobile

```
Title stack
Create — full width signal under title
Search full width
Sort full width
Segments — horizontal scroll snap chips
Cards — 1 col
```

Sticky Create FAB optional only if scroll > 2 screens — prefer top CTA to avoid covering cards.

---

## 5. Empty / error / loading

| State | Spec |
| --- | --- |
| Empty all | Photography-led empty · “Create your first listing” · signal CTA |
| Empty tab | “No active listings” · switch tab link |
| Loading | 6 managed skeletons |
| Error | Calm EmptyState + Retry |

---

## 6. Dark mode

- Canvas graphite · segments on `surface-raised`.
- Active segment `surface` elevated.
- Status pills retain soft tints at 14% opacity.

---

## 7. Motion

- Tab change: indicator slide + grid crossfade 200ms.
- Delete confirm: modal system.
- Archive success: card fade-out 200ms.

---

## 8. Anti-patterns

- Data-table with 12 columns  
- Traffic-light dots everywhere  
- Duplicate “Dashboard / Analytics / Boost” nav chrome  
- Rainbow status tabs  
