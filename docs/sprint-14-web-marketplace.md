# Sprint 14 — Full Web Marketplace

Status: **implemented — awaiting approval**

## Goal

Ship a production-ready Next.js consumer web app that uses the existing NestJS `/v1` APIs. No duplicated business rules.

## Surfaces

| Route | Feature |
| --- | --- |
| `/` | Hero, categories, featured, latest |
| `/login`, `/register`, `/otp`, `/profile-setup` | Phone OTP auth (mock or API) |
| `/search` | Keyword + filters + infinite scroll |
| `/listings/[id]` | Listing details + local favorites |
| `/sell` | Create listing wizard → API |
| `/my-listings` | Status tabs + actions |
| `/favorites` | LocalStorage favorites + API detail fetch |
| `/profile` | Session profile |

## Architecture

`apps/web/src/features/*` repositories call Nest only. UI uses Outfit + IBM Plex Arabic and `@autohub/ui` tokens (aligned with mobile-ui brand red).

## Auth

- `NEXT_PUBLIC_AUTH_MODE=mock` (default): OTP `123456`, local session (same Alpha approach as Expo).
- `api`: expects Firebase Web phone → `POST /v1/auth/login` (wire Firebase to unlock seller mutations).

## Favorites

No Nest favorites endpoints yet. Web stores listing IDs in `localStorage` and loads details via `GET /v1/listings/:id`.

## Verify

```bash
npx pnpm@9.15.0 --filter @autohub/web typecheck
npx pnpm@9.15.0 --filter @autohub/web build
npx pnpm@9.15.0 --filter @autohub/web dev
```

Open http://localhost:3000
