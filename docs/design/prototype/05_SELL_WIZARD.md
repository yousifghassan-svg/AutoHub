# Prototype Spec — Sell Wizard

**ID:** AX-1.1 / SW  
**Fidelity:** High  
**Constraint:** Steps, validation, draft, quality, edit mode **FROZEN**

---

## Memory test

Tomorrow they remember selling felt like a **guided studio** — progress, calm review, quiet success — not a tax form.

---

## 1. Desktop shell (max-width 720)

```
← optional back to My listings (edit mode)

Create listing | Edit listing     32/display
Support line                      15 secondary

┌ progress track 4px ────────────────────────────┐  brand fill
Step 2 of 5 · Vehicle details          Saved      13 secondary

┌─ surface panel radius-lg padding 32 e1 ────────┐
│  Step content                                   │
│                                                 │
│                                                 │
│  [ Back ]                        [ Next ]       │
└─────────────────────────────────────────────────┘
```

- Progress track: graphite track · signal fill · no candy stripes.
- “Saved” pulses opacity once on autosave (debounced) — never a toast storm.
- Panel: avoid double card-in-card; inputs sit on panel directly.

---

## 2. Mobile shell

- Full-bleed canvas; panel edge-to-edge with padding 16.
- Progress under title.
- Sticky footer actions: Back | Next (safe-area).
- Step title sticky under header optional if long forms.

---

## 3. Step atmospheres

| Step | Visual note |
| --- | --- |
| Category | Large selectable tiles (photo or strong glyph) · selected = signal border 2px + soft fill · **locked look in edit** (opacity 0.7, no press) |
| Details | Grouped fields with 12px section labels · 16px gaps |
| Media | Dropzone dashed border-strong · cover star obvious · thumb 88px · drag ghost e2 |
| Sale | Price as large input · currency segmented IQD/USD |
| Review | Media gallery cinematic · summary tiles quiet · quality panel as “instrument” |

---

## 4. Quality panel (review)

```
Listing strength          82
████████████░░░░  required
██████████░░░░░░  recommended

○ Must-have
  ✓ Price set
  ○ Add at least one photo
● Suggested
  …
```

- Score: display 40 tabular.
- Bars: 6px height · track muted · fill ink/signal (required = signal).
- No gamified trophies.

---

## 5. Confirm / progress / success

| Phase | Spec |
| --- | --- |
| Confirm | Soft panel replace · title + city + score · Cancel / Confirm |
| Progress | Centered checklist · active row opacity pulse · spinner 20px |
| Success | Single check in signal-soft circle 80 · headline · two CTAs · **no confetti** |

Edit ACTIVE: “Save changes” primary; success mode “Changes saved” per existing copy intent.

---

## 6. Dark mode

- Panel `#171B21`.
- Inputs `#1E242C`.
- Progress track `#2A313A` · fill `#E11D48`.
- Dropzone border `#3A4350`.

---

## 7. Motion

- Step change: 16px directional slide + fade 200ms (RTL-aware).
- Next disabled: no shake; rely on quiet helper text.
- Publish success: check settle 400ms.

---

## 8. Anti-patterns

- Multi-column dense forms on mobile  
- Sticky “Boost your listing” upsell mid-wizard  
- Red error walls before submit  
- Different wizard chrome for edit vs create (must feel identical)  
