# Sprint 8 — Mobile Authentication

Status: **approved**

## Goal

First functional AutoHub mobile experience: phone login against the existing Auth API, secure session persistence, and profile setup on first login.

## Screens

| Screen | Route |
| --- | --- |
| Splash / session restore | `app/index.tsx` |
| Welcome | `app/(auth)/welcome.tsx` |
| Phone number (login) | `app/(auth)/login.tsx` |
| OTP verification | `app/(auth)/otp.tsx` |
| Profile setup (first login) | `app/(auth)/profile-setup.tsx` |
| Authenticated tabs | `app/(tabs)/*` |

## APIs used

| Method | Path |
| --- | --- |
| POST | `/v1/auth/login` |
| POST | `/v1/auth/refresh` |
| POST | `/v1/auth/logout` |
| GET | `/v1/auth/me` |

## Stack

- Expo Router (React Navigation)
- TanStack React Query
- React Hook Form + Zod
- `expo-secure-store` for JWT / refresh persistence
- Repository pattern under `apps/mobile/features/auth/`

## Auth modes

| `EXPO_PUBLIC_AUTH_MODE` | Behavior |
| --- | --- |
| `mock` (default without Firebase) | Local OTP `123456`, in-app session, no API required |
| `api` | Firebase phone ID token → real `/v1/auth/*` |

## Profile setup

There is no profile PATCH on the API yet. When `displayName` is empty after login, the app shows Profile Setup, stores the name in secure session storage, and calls Firebase `updateProfile` when available so a later login can sync the claim.

## Tests

```bash
npx pnpm@9.15.0 --filter @autohub/mobile test
npx pnpm@9.15.0 --filter @autohub/mobile typecheck
```

## Docs

- Architecture: [`docs/mobile-auth-architecture.md`](./mobile-auth-architecture.md)
- Env: `apps/mobile/.env.example`
