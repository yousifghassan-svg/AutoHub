# AutoHub

Iraq vehicle marketplace monorepo.

## Apps

| App | Port | Status |
| --- | --- | --- |
| `apps/api` | 4000 | NestJS `/v1` |
| `apps/web` | 3000 | **Full marketplace (Sprint 14)** |
| `apps/admin` | 3001 | Shell (admin deferred) |
| `apps/mobile` | 8081 | Expo consumer app |

## Quick start

```bash
pnpm docker:up
npx pnpm@9.15.0 install
cp .env.example .env
cp .env.example apps/api/.env

npx pnpm@9.15.0 db:generate
npx pnpm@9.15.0 --filter @autohub/database exec prisma migrate dev
npx pnpm@9.15.0 db:seed

npx pnpm@9.15.0 --filter @autohub/api --filter @autohub/web --parallel dev
```

- Web: http://localhost:3000  
- API health: http://localhost:4000/v1/health  
- Swagger: http://localhost:4000/docs  

Web auth defaults to mock OTP `123456` (`NEXT_PUBLIC_AUTH_MODE=mock`).

## Roadmap

See [`docs/roadmap.md`](./docs/roadmap.md).
