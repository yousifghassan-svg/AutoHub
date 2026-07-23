# Sprint 13 — Security Report

## Fixed this sprint

| Issue | Severity | Fix |
| --- | --- | --- |
| Exception filter leaked Prisma/Error messages | P0 | Generic 500 + mapped Prisma codes (P2002→409, P2025→404, P2003→400) |
| Missing file on upload returned 500 via raw `Error` | P0 | `BadRequestException` |
| Refresh token rotation non-atomic | P0 | `RefreshTokenRepository.rotate` transaction |
| Listing visibility filtered after pagination | P0 | Status forced to ACTIVE in SQL for non-owner/non-staff |
| Listing media delete left R2 objects | P0 | Best-effort R2 delete after soft-delete |
| Media delete R2-then-DB ordering | P1 | Soft-delete first, then storage |

## AuthZ review (status: OK for Alpha)

- JWT guard reloads active user from DB
- Permissions guard on mutations
- `assertCanManage` on listing/media owner paths
- Moderator-only `PENDING → ACTIVE`

## Remaining risks (tracked)

| Risk | Severity | Mitigation plan |
| --- | --- | --- |
| `ListingMedia.addMedia` trusts client `r2Key` / mime / size | P0 backlog | Route through `MediaAsset` complete + virus scan, or HEAD-validate object |
| Dual media systems (`MediaAsset` vs `ListingMedia`) | P1 | Unify attach path |
| No rate-limit override on listing create | P2 | Add `@Throttle` like media |
| Existence vs ownership (404 vs 403) | P2 | Optional unify to 404 |
| Firebase phone auth not wired in Expo Go | Ops | Document mock vs api modes for Alpha testers |

## Validation

- Global `whitelist` + `forbidNonWhitelisted`
- Search trending/recent now DTO-validated
- Free-text `@MaxLength` still incomplete — see tech debt
