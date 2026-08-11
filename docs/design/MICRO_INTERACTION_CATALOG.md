# Micro Interaction Catalog

**Sprint:** AX-1  
**Status:** Draft — awaiting approval  
**Companions:** [`MOTION_SYSTEM.md`](./MOTION_SYSTEM.md) · [`DESIGN_MANIFESTO.md`](./DESIGN_MANIFESTO.md)

Every interaction below is documented so implementation (later) never invents one-off motion.  
**Frozen marketplace logic stays; this is presentation and feedback only.**

---

## How to read an entry

| Field | Meaning |
| --- | --- |
| Trigger | User or system event |
| Feedback | What the UI does |
| Timing | From motion scale |
| A11y | Reduced motion / SR notes |

---

## 1. Hover

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Button hover | Fill deepen / ghost fill | `motion-fast` | N/A (pointer) |
| Card hover | Image zoom 1.04 + elevation e2 | `motion-base` | Keyboard uses focus |
| Nav link hover | Opacity / indicator | `motion-fast` | Focus equivalent |
| Favorite hover | Heart stroke strengthens | `motion-fast` | — |

---

## 2. Focus

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Tab to control | Signal focus ring 2px offset | `motion-instant` | Always visible |
| Tab to card | Ring on card container | `motion-instant` | Enter activates link |
| Focus search | Ring + optional 1px grow | `motion-fast` | Announce label |

---

## 3. Click / press

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Button press | Scale 0.98 | `motion-instant` | — |
| Card press | Scale 0.985 | `motion-instant` | — |
| Chip select | Background signal-soft; check appears | `motion-fast` | `aria-pressed` |

---

## 4. Success

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Publish sent | Success screen check settle | `motion-slow` | Announce success |
| Draft saved | Toast + soft check | `motion-base` | Announce “Draft saved” |
| Profile saved | Inline check by button | `motion-base` | — |
| Copy link | Toast “Link copied” | `motion-fast` | — |

No confetti. No full-screen fireworks.

---

## 5. Delete

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Open delete confirm | Modal enter | `motion-moderate` | Focus trap; title “Delete listing?” |
| Confirm delete | Modal exit → card fade/collapse | `motion-base` | Announce removed |
| Cancel | Modal exit only | `motion-fast` | Restore focus to trigger |

Keep existing confirm **behavior** (P5-8 frozen); polish motion only.

---

## 6. Archive / status change

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Archive / pause | Status badge morph color + label | `motion-base` | Announce new status |
| Card leaves filtered tab | Fade out + grid compact | `motion-base` | — |
| Error from API | Toast error; badge unchanged | `motion-fast` | Announce error |

---

## 7. Publish

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Open confirm | Confirm strip / panel | `motion-moderate` | Focus primary |
| Working | Progress checklist ticks | `motion-fast` per step | `aria-busy` |
| Success | Success composition | `motion-slow` | Announce |
| Failure | Return to review + calm error | `motion-base` | Announce error |

Friendly copy already defined in 0.5 — keep tone.

---

## 8. Upload

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Drag over dropzone | Border signal; surface-muted | `motion-fast` | — |
| File queued | Thumbnail placeholder + progress | continuous | Announce “Uploading” |
| Processing | Soft pulse on thumb | 1.2s loop | — |
| Complete | Placeholder → image crossfade | `motion-base` | Announce “Uploaded” |
| Set cover | Star fill; item moves to index 0 (layout spring soft) | `motion-moderate` | Announce “Cover updated” |
| Remove media | Thumb fade + collapse | `motion-base` | Announce removed |
| Reject (type/size) | Shake **no**; toast + field error | `motion-fast` | Announce reason |

---

## 9. Favorite

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Add | Heart fill + 2% spring | `motion-base` + spring | `aria-pressed=true` |
| Remove | Heart outline; no sad animation | `motion-fast` | `aria-pressed=false` |

---

## 10. Search

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Focus field | Ring | `motion-fast` | — |
| Submit / debounce results | Grid crossfade | `motion-base` | Announce result count if changed |
| Add filter chip | Chip enter scale 0.96→1 | `motion-fast` | — |
| Remove chip | Chip exit | `motion-fast` | — |
| Clear all | Stagger exit | 30ms stagger | — |

URL/search logic frozen — visual feedback only.

---

## 11. Filter

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Open mobile filters | Sheet from end | `motion-moderate` | Focus first control |
| Apply | Sheet dismiss + results update | `motion-base` | — |
| Range drag | Live label update; results debounced | — | — |

---

## 12. Load more

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Click / infinite sentinel | Button progress or skeleton row | — | `aria-busy` |
| Rows arrive | Fade-up batch | `motion-base` | Optional polite count |

---

## 13. Transitions (cross-cutting)

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Route change | Fade + 8px rise | `motion-moderate` | Instant if reduced motion |
| Wizard step | Directional slide 16px + fade | `motion-base` | Announce step label |
| Theme switch | Token retint; icon crossfade | `motion-base` | Announce theme |
| Tab (My Listings status) | Indicator slide + grid crossfade | `motion-base` | `aria-selected` |

---

## 14. Navigation

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Open mobile menu | Drawer in | `motion-moderate` | Focus close/first link |
| Close menu | Drawer out | `motion-fast` | Restore trigger focus |
| Scroll header | Glass opacity increase | scroll-linked | — |

---

## 15. Forms (sell / auth)

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Field error | Border error + message fade in | `motion-fast` | `aria-invalid` |
| Field clear error | Reverse | `motion-fast` | — |
| Disabled CTA | No press motion; opacity | — | `aria-disabled` |
| Autosave (draft) | Quiet “Saved” meta pulse | `motion-fast` | Optional polite live region (debounced) |

---

## 16. Empty & error

| Trigger | Feedback | Timing | A11y |
| --- | --- | --- | --- |
| Empty enter | Illustration fade once | `motion-moderate` | — |
| Error enter | Calm EmptyState; no shake | `motion-base` | Announce error |
| Retry | Button loading → content replace | — | — |

---

## 17. Explicitly out of catalog

- Confetti / emoji bursts  
- Sound effects (unless product later mandates)  
- Haptic patterns (document later for native)  
- Any animation that changes listing status/data without user action  

---

## 18. Approval gate

Catalog is normative for future AX implementation sprints.  
**Do not implement in AX-1 documentation phase.**
