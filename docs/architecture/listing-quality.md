# Listing Quality & Completeness Architecture (Release 0.5)

**Status:** Normative for Release **0.5**  
**Master release:** [`../releases/RELEASE_0.5_MARKETPLACE.md`](../releases/RELEASE_0.5_MARKETPLACE.md)  
**Baseline gap:** `validatePublishStep` is currently a no-op; no listing quality score exists (profile `identityStatus` is unrelated).

---

## Vision

Every listing submitted for review meets a clear completeness bar, and sellers see actionable quality guidance—without a new database product or AI ranker.

---

## Goals

- Shared completeness checklist for vehicle and plate (required vs recommended).
- Block Next/Publish when required items missing.
- Derived **quality score** (0–100) from existing fields + media counts for UI hints only.
- Gate PENDING submit on required completeness (client + align with server validation).

---

## Scope

- P5-6 Listing Completeness.
- P5-7 Review surfaces checklist + score.
- Pure helpers (web first); optional shared package later—not required in 0.5.

---

## Out of scope

- Persisting score columns / Search ranking by quality (Search frozen; ranking unchanged).
- AI-written titles/descriptions.
- Moderator ML risk scores (Trust 0.8).
- Facet counts.

---

## User journeys

1. Seller on details step → checklist shows missing brand/year.
2. Seller reaches review → score “Good” with tips (add more photos).
3. Seller clicks Publish with missing price → blocked with field links.
4. After fix → PENDING succeeds.

---

## Domain architecture

### Completeness (required for PENDING)

| Domain | Required (illustrative — finalize in P5-6) |
| --- | --- |
| Vehicle | Category, city, title, description min length, brand/model or HE name fields, year, price, currency, ≥1 READY image (product policy) |
| Plate | Category, city, plate identity fields, price, currency; media per product policy |

### Quality score (derived, non-blocking)

```text
score = weighted sum of:
  required_complete (gate, not points)
  + photo_count bands
  + description_length bands
  + optional specs filled (fuel, transmission, mileage, …)
  + featured/verified are NOT seller-controlled in create — ignore
```

Clamp 0–100; expose `grade` labels (e.g. Needs work / OK / Strong) in UI only.

### Module sketch

- `computeListingCompleteness(draft | listing) → { missing[], canPublish }`
- `computeListingQualityScore(draft | listing) → { score, tips[] }`

Replace `features/sell/validators/publish.ts` noop with real checks; plugin `canSubmit` must call the same helper.

---

## Database impact

- **None** for v1 score (computed client-side and optionally echoed in API responses later).
- Do not add `qualityScore` column in 0.5 unless a later slice explicitly needs server sort (would be post-freeze / Search coordination).

---

## API contracts

- No new public quality endpoint required in 0.5.
- Server continues to enforce hard validation on create/update; client completeness must not be weaker than server for required fields.

---

## Web architecture

- Publish step shows checklist + score + tips.
- Step “Next” uses per-step validators; Publish uses full completeness.
- Edit page reuses same helpers before save when touching required fields.

---

## Mobile compatibility

- Domain create should apply equivalent required checks before submit (shared rules documented; code may be duplicated short-term).
- Score UI on mobile is optional in 0.5 if create already blocks incomplete submits.

---

## AI readiness

- Completeness + tips are structured signals for future assistive copy (“suggest description”)—not implemented now.
- Do not call external LLM APIs in 0.5.

---

## Security considerations

- Score is advisory; never grant ACTIVE from client score.
- Do not expose other sellers’ draft completeness via API.

---

## Performance considerations

- Pure functions over in-memory draft; negligible cost.
- Do not recompute on every keystroke without debounce in UI.

---

## Testing strategy

- Unit matrix: missing each required field → `canPublish=false`.
- Unit: photo/description bands move score monotonically.
- Smoke: cannot submit empty media when policy requires images.
- Regression: plate path does not require vehicle-only fields.

---

## Production freeze criteria

- Noop publish validator removed.
- Vehicle and plate cannot reach PENDING without required set.
- Quality score shown on review (web) with at least one tip path.
- Score not used for Search ordering.
