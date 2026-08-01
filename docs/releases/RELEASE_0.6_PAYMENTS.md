# Release 0.6 — Payments

**Version:** `0.6.x`  
**Codename:** Payments  
**Production intent:** First **live** monetization / payment capture (future — not enabled in classifieds v1)  
**Current repo state:** Schema scaffolding + `payments` **provider interfaces only**; no live charges  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

---

## Goals

- Activate Order / Payment / Escrow (and optionally Subscription) overlays **on top of** the listing hub (ADR 001).  
- Support Iraq-relevant providers (e.g. Zain Cash, Qi Card) alongside cards/wallets via the provider registry.  
- Enforce currency safety (Money VO; no mixed-currency settlement without explicit FX policy).  
- Keep classifieds contact/chat working when billing features are off.  
- Ship admin/ops tooling for payment states, refunds, and disputes.

---

## Features

| Area | Planned deliverable |
| --- | --- |
| API | Real `PaymentProvider` implementations; webhook endpoints; idempotent capture |
| Domain | Order lifecycle, escrow hold/release/refund/dispute, subscription entitlement → featured flags |
| Web/Mobile | Checkout / pay deposit / subscription purchase UX (product-designed) |
| Admin | Payment search, refund controls, reconciliation views |
| Flags | `BILLING_ENABLED` (or equivalent) default false until go-live |
| Security | Webhook signature verification, PCI scope minimization (prefer hosted widgets) |
| Ledger-ish audit | Immutable payment attempts + admin audit |

> Until this release is explicitly scheduled and implemented, production must keep payment flags **off** and treat provider classes as stubs.

---

## Acceptance Criteria

- [ ] Feature flag off → zero charge paths reachable from public clients  
- [ ] Flag on (staging) → sandbox provider can authorize + capture test payment  
- [ ] Webhooks verified; replay/idempotency safe  
- [ ] Escrow transitions only via server policy (no client-set `RELEASED`)  
- [ ] Mixed-currency pay attempt rejected or converted only under documented FX rules  
- [ ] Failed payment leaves listing/order in a recoverable state  
- [ ] Refund path updates `PaymentStatus` / escrow consistently  
- [ ] Subscription expiry removes paid privileges (e.g. featured)  
- [ ] PCI: no raw card PAN stored in AutoHub DB  
- [ ] Runbook updated for payment incidents  
- [ ] Security review signed for this release  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Real-money loss / double capture | Critical | Idempotency keys; provider sandbox drills; dual control refunds |
| Webhook forgery | Critical | Signatures + IP allowlists where applicable |
| Regulatory / KYC gaps in Iraq | High | Legal review before enablement |
| Partial implementation left half-on | High | Hard flag; checklist go/no-go |
| Currency bugs | High | Money VO; exhaustive tests |
| Trust shift (chat vs pay) | Medium | Clear UX copy; escrow states visible |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| 0.2 Authentication | Payer identity |
| 0.4 Marketplace | Listings/orders reference |
| 0.5 Messaging (recommended) | Dispute communication |
| Provider contracts | Zain Cash / Qi / Stripe (or chosen set) sandbox + prod keys |
| Legal/compliance sign-off | Before prod flag on |
| ADR 001 + BUSINESS_RULES payments section | Overlay model |

**Blocks:** Monetized 1.0 variants; not required for classifieds-only soft launch if 1.0 explicitly waives payments  

---

## QA Checklist

- [ ] Flag off matrix: every client build proves no charge API success  
- [ ] Sandbox purchase happy path (vehicle and/or featured subscription — per scope)  
- [ ] Cancel mid-checkout  
- [ ] Webhook delayed / duplicated  
- [ ] Refund + escrow release  
- [ ] Dispute state visible to admin  
- [ ] Currency IQD and USD paths (if both offered)  
- [ ] Load/failure: provider 500 → user-safe error, no double order  
- [ ] Mobile + web parity for scoped flows  

---

## Rollback Plan

1. **Immediate:** set billing/payments feature flag **false** on API and clients (OTA/config).  
2. Stop processing webhooks (disable endpoint auth keys / return 503) after draining in-flight with care.  
3. Redeploy previous API/web/mobile without provider side effects.  
4. **Money movement:** do not automate mass refunds without finance approval; use provider dashboard + runbook.  
5. DB: keep payment rows for audit; restore snapshot only if schema corruption — never delete ledger history casually.  
6. Public status page / in-app banner: “Payments temporarily unavailable.”  
