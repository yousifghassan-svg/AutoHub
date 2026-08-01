# AutoHub Business Rules

**Status:** Normative product/domain rules  
**Sources:** Prisma schema, API domain policies, ADRs, content policy  
**Related:** [`domain.md`](./domain.md) (historical summary), [`standards/ARCHITECTURE.md`](./standards/ARCHITECTURE.md)

Where narrative docs disagree with schema/code, **schema + domain policy code win**.

---

## 1. Marketplace domains

### Current domains

| Domain | Meaning | Primary categories |
| --- | --- | --- |
| `VEHICLE` | Vehicle classifieds | `CAR`, `MOTORCYCLE`, `TRUCK`, `HEAVY_EQUIPMENT` |
| `PLATE` | Iraqi plate classifieds | `PLATE` |

### Rules

1. Every `Listing` has exactly one `MarketplaceDomain`.  
2. Vehicle APIs may only create/update `VEHICLE` listings; plate APIs only `PLATE`.  
3. Domain modules must not branch into the other product’s business rules.  
4. Shared concerns (auth, media bridge, messaging, moderation, currencies) stay shared.  
5. Future domains (Real Estate, Boats, Jobs, Services, …) require: data model decision, Nest domain module, client surfaces, and sell/create plugin — without rewriting the listing hub.

### Dormant categories

Schema may include `PARTS`, `RENTAL` (and similar). Until a product sprint ships UI + API write support, they are **not sellable**.

---

## 2. Listings

### Definition

A listing is a sellable classified item: hub row + category detail row(s) + optional media + optional translations.

### Rules

1. **Seller ownership** — `Listing` belongs to a user (seller). Only owner (or privileged staff with proper permission) may mutate/delete.  
2. **Location required** for publishable listings — city (and country via geo model) must be present.  
3. **Primary price** — product practice requires a positive primary price and currency (default IQD). Secondary price is optional.  
4. **Currency scoping** — search/min/max/sort by price are within a single currency; no silent FX conversion.  
5. **Slug/SEO** — listings have unique `slug`; clients must not forge collisions.  
6. **Contact model (v1)** — sellers expose call, WhatsApp, and/or in-app message. **Payment is off-platform** for classifieds v1 (ADR 001).  
7. **Content policy** — no fraud, stolen goods, misleading photos/prices, spam, harassment ([`content-policy.md`](./content-policy.md)).  
8. **Stats** — views/favorites/shares/click counters are system-maintained; clients must not arbitrarily set them.

### Vehicle-specific

- Detail fields (year, mileage, brand/model, specs) live in vehicle detail tables.  
- Create/update goes through vehicles domain APIs.

### Plate-specific

- Plate identity fields (format/region/series/number/type) must satisfy plate format rules (Erbil strict vs soft formats per admin configuration).  
- Plate verification workflow uses `PlateVerification` / `PlateVerificationStatus` separately from listing verification flags when applicable.

---

## 3. Listing lifecycle

### Canonical statuses (`ListingStatus`)

`DRAFT` → `PENDING` → `ACTIVE` → (`RESERVED`) → `SOLD` | `ARCHIVED`  
Also: `REJECTED` (from moderation), with return paths to `DRAFT` / `PENDING` / `ARCHIVED` per transition map.

Implemented transitions (`apps/api/.../listing-status.ts`):

| From | Allowed to |
| --- | --- |
| `DRAFT` | `PENDING`, `ARCHIVED` |
| `PENDING` | `DRAFT`, `ACTIVE`, `REJECTED`, `ARCHIVED` |
| `ACTIVE` | `RESERVED`, `SOLD`, `ARCHIVED` |
| `RESERVED` | `ACTIVE`, `SOLD`, `ARCHIVED` |
| `SOLD` | `ARCHIVED` |
| `ARCHIVED` | `DRAFT` |
| `REJECTED` | `DRAFT`, `PENDING`, `ARCHIVED` |

### Moderation rules

1. Seller may submit `DRAFT → PENDING`.  
2. `PENDING → ACTIVE` and `PENDING → REJECTED` require **moderation** permission (admin/moderator paths).  
3. Public discovery shows **ACTIVE** (and enforced in query layer).  
4. Reserved status supports hold-like flows; auction-live style behavior is reserved for future auction overlays (do not overload without product design).

> Historical `domain.md` names (`PENDING_REVIEW`, `EXPIRED`, `REMOVED`) are **not** schema enums — use the table above in new work.

---

## 4. User roles

| Role | Business intent |
| --- | --- |
| `USER` | Consumer/seller: create listings, message, report |
| `DEALER` | Seller with dealer capabilities (`DEALERS_MANAGE`) |
| `SUPPORT` | Staff read/help; limited admin access |
| `DEALER_MANAGER` | Staff managing dealer orgs |
| `MODERATOR` | Listing/message moderation, plate tools, reports |
| `ADMIN` | Broad operations: users, settings, dealers, deletes |
| `SUPER_ADMIN` | Full system manage |

Permissions are fine-grained (`profile:*`, `listings:*`, `media:*`, `messages:*`, `admin:access`, …). Role → permission sets live in API `permissions.ts`.

### Actor shortcuts (product language)

- **Guest** — unauthenticated browse of public ACTIVE listings  
- **Seller** — authenticated USER/DEALER creating listings  
- **Moderator / Admin** — staff roles above  

---

## 5. Ownership rules

1. A user may manage only their own listings/media unless they hold moderation/admin permissions.  
2. Conversation participants may read/write their threads; moderators may moderate with `MESSAGES_MODERATE`.  
3. Refresh tokens and devices belong to the authenticated user; no cross-user session access.  
4. Dealer organization resources (when enabled) are constrained by membership + `DEALERS_MANAGE`.  
5. Admin audit logs should record privileged mutations.

---

## 6. Verification

Multiple verification concepts exist — do not collapse them:

| Concept | Field / model | Meaning |
| --- | --- | --- |
| Listing verification | `Listing.verificationStatus`, `isVerified` | Trust badge on listing |
| Featured | `isFeatured`, `featuredUntil` | Editorial/paid highlight (productized later) |
| Plate verification | `PlateVerification` / `PlateVerificationStatus` | Plate authenticity workflow |
| Seller/dealer verification | dealer/org verification flags | Org trust |

**Rules**

1. Users cannot self-set `isVerified` / moderation outcomes via public APIs.  
2. Verification state changes are staff/system actions.  
3. Unverified listings may still be ACTIVE depending on product policy; verification is an additive trust signal unless a sprint says otherwise.

---

## 7. Dealers

### Current state

- Schema: `DealerOrganization`, `DealerMember`, follow relations.  
- API domain `dealers` exists; full **Dealer Platform** historically deferred as a product program.  
- `SellerType` distinguishes `INDIVIDUAL` vs `DEALER`.  
- Role `DEALER` gains `DEALERS_MANAGE` permission.

### Rules (when using dealer features)

1. A dealer org has members with membership roles; do not allow arbitrary users to claim org ownership.  
2. Listings may be attributed to a dealer profile/org when product wiring says so — still one `Listing` hub row.  
3. Keep `DEALERS_ENABLED`-style gating off until the platform sprint completes (deployment guidance).

---

## 8. Auctions

### Current state

- Schema: `Auction`, `AuctionBid`, `AuctionStatus` (`SCHEDULED`, `LIVE`, `ENDED`, `CANCELLED`).  
- Not a shipped consumer product flow.

### Rules (future activation)

1. Auction is an **overlay** on a `Listing`, not a separate catalog rewrite (ADR 001).  
2. Bidding/payment settlement must use explicit statuses; do not silently convert ACTIVE classifieds into LIVE auctions without seller action.  
3. Keep auctions disabled in production until product + threat model + API are approved.

---

## 9. Payments & escrow

### Current state

- Schema: `Order`, `OrderItem`, `Payment`, `Escrow` + status enums.  
- API `payments` module: **provider interfaces only** — no live charges.  
- Classifieds v1: payment off-platform between buyer and seller.

### Rules

1. Do not capture real money without an explicit payments launch sprint.  
2. Orders/payments reference listings/items; they do not replace the listing hub.  
3. Escrow states (`HELD`, `RELEASED`, `REFUNDED`, `DISPUTED`) must be transitioned by trusted server logic only.  
4. Multi-currency: never compare or settle mixed currencies without an explicit FX policy (Money VO throws on mismatch).

---

## 10. Subscriptions

### Current state

- Schema: `SubscriptionPlan`, `Subscription` (`ACTIVE`, `PAST_DUE`, `CANCELLED`, `EXPIRED`).  
- Intended for featured placement / dealer billing style products later.

### Rules

1. Subscription entitlement changes are system/billing driven — not free client toggles of `isFeatured` forever.  
2. Expired/past-due subscriptions must remove paid privileges according to plan rules when implemented.  
3. Keep billing flags off until launch checklist is complete.

---

## 11. Communication & trust adjacent rules

1. Conversations are listing-scoped (and optionally dealer-scoped) inquiry threads.  
2. Users may block other users; blocked pairs cannot continue normal messaging.  
3. Conversation/listing reports feed moderator queues (`ReportStatus`: OPEN/RESOLVED/REJECTED).  
4. Spam/harassment → remove content and/or suspend user (`UserStatus`).

---

## 12. Sell / publish rules (clients)

Aligned with current web sell wizard + mobile create flows:

| Domain | Required before submit (typical) |
| --- | --- |
| Vehicle | Category + location, vehicle details (title/year/description), sale information (price/currency); media optional unless a flow requires it |
| Plate | Category + location, plate details + description, sale information; media optional |

Publish actions:

- **Save draft** — create remote `DRAFT` (and attach media if any).  
- **Submit for review** — move toward `PENDING` for moderation.

Local drafts (web localStorage / mobile AsyncStorage) must remain restorable across wizard refactors (backward compatible draft mapping).

---

## 13. Inconsistencies to be aware of

| Topic | Guidance |
| --- | --- |
| Lifecycle naming in older docs | Use Prisma `ListingStatus` |
| Dealer/Auction/Payment tables vs product | Schema ≠ enabled product |
| Dual media attach | Business rule hardening: only attach validated media assets |

---

## 14. Change control

Business rule changes that affect lifecycle, money, ownership, or authz require:

1. Update this document  
2. Update domain policy code + tests  
3. ADR when the decision is architectural  
