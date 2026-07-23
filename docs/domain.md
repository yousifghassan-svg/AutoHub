# AutoHub Domain Model

## Actors

- Guest: browse public listings
- User / Seller: create listings, inquire, favorite
- Moderator: review reports, remove listings
- Admin: plate formats, feature flags, user suspension
- Dealer (future): multi-user organization

## Core aggregates

- **Listing**: sellable classified item
- **Conversation**: listing-scoped inquiry thread
- **PlateFormat**: validation rules for Iraqi plates
- **Order / Auction / Subscription** (future): commerce overlays on listings

## Listing lifecycle (v1)

`DRAFT` → `PENDING_REVIEW` (optional) → `ACTIVE` → `SOLD` | `EXPIRED` | `REMOVED`

Reserved statuses: `RESERVED`, `AUCTION_LIVE`.

## Contact model (v1)

Sellers expose call, WhatsApp, and/or in-app message. Payment is off-platform.
