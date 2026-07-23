# Mobile Authentication Architecture

## Layers

```
Screens (app/(auth)/*, app/(tabs)/*)
        │  no fetch / no SecureStore
        ▼
Hooks + AuthProvider  (React Query mutations, session state)
        │
        ▼
AuthRepository        (login / refresh / me / logout / profile)
        │
   ┌────┴────┐
   ▼         ▼
HttpClient  PhoneAuthGateway
   │         │
   ▼         ▼
/v1/auth/*  Firebase | Mock OTP
   │
   ▼
TokenStorage (expo-secure-store)
```

Screens never call the API. They use `useAuth` / mutation hooks only.

## Session restore

1. Splash (`app/index.tsx`) waits for `status !== 'bootstrapping'`.
2. `AuthProvider` calls `repository.restoreSession()`:
   - Load secure session
   - If access token still valid → `GET /v1/auth/me`
   - Else → `POST /v1/auth/refresh` (rotation)
3. Redirect:
   - `authenticated` → tabs
   - `needs_profile` → profile setup
   - `unauthenticated` → welcome

## Token refresh

`createHttpClient` intercepts `401` on authenticated requests:

1. Single-flight `POST /v1/auth/refresh`
2. Persist rotated tokens
3. Retry original request once
4. On refresh failure → clear storage (`onAuthFailure`)

## Offline / network errors

- Preflight `expo-network` check → `ApiError` with `code: OFFLINE`
- Fetch failures → `code: NETWORK`
- UI: `OfflineBanner` + mutation error text on auth forms

## Key paths

| Path | Role |
| --- | --- |
| `features/auth/data/auth.repository.ts` | Repository (API + mock) |
| `features/auth/data/token-storage.ts` | Secure / memory storage |
| `features/auth/data/*-phone-auth.gateway.ts` | OTP providers |
| `features/auth/context/AuthProvider.tsx` | Session state machine |
| `features/auth/hooks/useAuthMutations.ts` | React Query hooks |
| `lib/api/http-client.ts` | Envelope unwrap + refresh |
| `lib/config.ts` | Env / auth mode |
