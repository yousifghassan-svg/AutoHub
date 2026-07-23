# Mobile My Listings Architecture

## Flow

```
Profile → /my-listings
              │
              ▼
     StatusTabs (ALL | DRAFT | … | ARCHIVED)
              │
              ▼
     useMyListingsInfinite  →  MyListingsRepository.listMine
              │
              ├─ GET /v1/listings?mine=true&status=
              └─ offline MyListingsCache (AsyncStorage)
              │
              ▼
     ManagedListingCard → Manage / Stats sheets
              │
              ├─ changeStatus / softDelete / update
              ├─ duplicate / renew (POST create)
              └─ /listing/:id
```

## Owner transitions (client-enforced, matches API)

```
DRAFT → PENDING | ARCHIVED
PENDING → DRAFT | ARCHIVED   (ACTIVE = moderator only — not offered)
ACTIVE → RESERVED | SOLD | ARCHIVED
RESERVED → ACTIVE | SOLD | ARCHIVED
SOLD → ARCHIVED
ARCHIVED → ∅
```

## Reusable pieces

| Component | Role |
| --- | --- |
| `StatusTabs` | Horizontal status filters |
| `ManagedListingCard` | Seller card with status + quick actions |
| `ManageActionsSheet` | Full action menu |
| `StatsSheet` | Views / favorites / placeholders |
| `EditListingSheet` | Inline edit form |
