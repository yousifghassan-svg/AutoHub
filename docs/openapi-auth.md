# OpenAPI — Auth endpoints

Live document: `http://localhost:4000/docs`  
Machine-readable: `http://localhost:4000/docs/json` · `http://localhost:4000/docs/yaml`

Security scheme: `access-token` (HTTP Bearer JWT)

## POST /v1/auth/login

Request:

```json
{ "idToken": "<firebase-id-token>" }
```

Response `data`:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "...",
    "firebaseUid": "...",
    "phone": "+964...",
    "email": null,
    "displayName": null,
    "role": "USER",
    "permissions": ["profile:read", "profile:write"],
    "status": "ACTIVE",
    "preferredLanguage": "ar",
    "cityId": null,
    "city": null,
    "governorate": null,
    "avatarUrl": null,
    "dateOfBirth": null,
    "identityStatus": "needs_profile"
  }
}
```

## POST /v1/auth/refresh

Request: `{ "refreshToken": "..." }`  
Response: same shape as login.

## POST /v1/auth/logout

Headers: `Authorization: Bearer <accessToken>`  
Body (optional): `{ "refreshToken": "...", "revokeAll": false }`

## GET /v1/auth/me

Headers: `Authorization: Bearer <accessToken>`  
Response `data`: authenticated user profile including `identityStatus` (`needs_profile` | `authenticated`).

## PATCH /v1/auth/me

Headers: `Authorization: Bearer <accessToken>`  
Permission: `profile:write`

Request (partial):

```json
{
  "displayName": "Sara Ali",
  "cityId": "<city-id>",
  "preferredLanguage": "ar",
  "email": "sara@example.com",
  "avatarUrl": "https://cdn.example.com/a.jpg",
  "dateOfBirth": "1990-05-15"
}
```

- `displayName` / `cityId` cannot be `null`.  
- Optional fields may be cleared with `null`.  
- Governorate is derived from `cityId`.  
Response `data`: updated authenticated user (same shape as `GET /me`).
