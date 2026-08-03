# Release 0.6 — Messaging

**Version:** `0.6.x`  
**Codename:** Messaging  
**Production intent:** Listing-scoped inquiry chat + notifications for marketplace trust  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

> **Roadmap note (2026-08-03):** Formerly numbered **0.5**. Renumbered to **0.6** so Release **0.5** can mean production Marketplace & Listings.  
> **Dependency:** Release **0.5 Marketplace & Listings** is **FROZEN** (`marketplace-0.5-freeze`) — see [`RELEASE_0.5_MARKETPLACE.md`](./RELEASE_0.5_MARKETPLACE.md).

---

## Goals

- Enable buyers and sellers to communicate in-app about listings.  
- Deliver realtime delivery (Socket.IO) with authenticated participants.  
- Support notifications (in-app; push token registration where shipped).  
- Give moderators tools to handle abuse (blocks, conversation reports, message moderate).  
- Keep payments off-platform; messaging must not imply escrow.

---

## Features

| Area | Deliverable |
| --- | --- |
| Communication domain | Conversations, participants, messages, blocks, conversation reports |
| Realtime | Nest Socket.IO gateway; client `socket.io-client` (web/mobile) |
| Notifications | `AppNotification` + device push token registration paths as implemented |
| Web | `/messages`, thread view, notifications page |
| Mobile | Inbox / chat surfaces as shipped |
| Admin | Communication moderation views |
| Policies | Participant-only access; `MESSAGES_MODERATE` for staff |

---

## Acceptance Criteria

- [ ] Authenticated buyer can open/create a conversation for an ACTIVE listing  
- [ ] Seller receives messages; both see shared history  
- [ ] Non-participants cannot read the thread (403/404 per API standard)  
- [ ] Realtime message appears without full page reload (web + mobile smoke)  
- [ ] User can block another user; further messaging prevented per policy  
- [ ] Conversation or message report creates moderator-visible record  
- [ ] Moderator with permission can act on reported conversations  
- [ ] Notifications list shows new message (or documented push caveat on Expo Go)  
- [ ] Listing soft-delete/ARCHIVE does not leak message bodies to unauthorized users  
- [ ] No payment/checkout UI implied inside chat for this release  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Unauthorized socket subscription | Critical | Auth handshake + participant checks |
| Spam / harassment | High | Blocks, reports, throttle, content policy, suspend |
| Presence leakage | Medium | Minimize presence payload; policy review |
| Offline/message ordering | Medium | Persist first; realtime is acceleration |
| Push reliability on Expo | Medium | In-app notifications as source of truth for 0.6 |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| 0.2 Authentication | Identity + permissions (FROZEN) |
| 0.5 Marketplace & Listings | **FROZEN** — listings for listing-scoped threads (`marketplace-0.5-freeze`) |
| 0.4 Search freeze | Discovery unchanged |
| Redis (optional/as used) | Adapter/support if presence/pubsub relies on it |
| Content policy / runbook | Abuse response |

**Blocks:** Higher-trust 1.0 launch; supports dealer follow-ups later  

---

## QA Checklist

- [ ] Two real users (or test accounts) exchange messages on a vehicle listing  
- [ ] Same on a plate listing  
- [ ] Guest cannot open messages UI beyond login redirect  
- [ ] Block user → attempt message fails gracefully  
- [ ] Report conversation → appears for staff  
- [ ] Admin communication page loads; moderate action smoke  
- [ ] Kill socket (network off) → reconnect restores send  
- [ ] Notification badge/list updates after message  
- [ ] RTL chat layout smoke  

---

## Rollback Plan

1. Redeploy previous API (disable gateway if needed) + prior web/mobile builds.  
2. Leave `Conversation` / `ChatMessage` data intact — do not drop tables on rollback.  
3. If a buggy migration altered chat schema, restore DB snapshot; re-deploy last good API.  
4. Optionally put UI in read-only “messaging temporarily unavailable” by shipping prior clients quickly.  
5. Notify moderators; export open abuse reports before schema restore if applicable.  
