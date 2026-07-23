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
    "role": "USER",
    "permissions": ["profile:read", "profile:write"],
    "status": "ACTIVE"
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
Response `data`: authenticated user profile.
