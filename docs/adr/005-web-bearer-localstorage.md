# ADR 005: Web Bearer Tokens in localStorage (Temporary)

## Status

Accepted (temporary — Release 0.2)

## Context

AutoHub web (`apps/web`) and admin (`apps/admin`) authenticate against NestJS using short-lived JWT access tokens and opaque refresh tokens. Next.js App Router clients currently have no BFF session layer.

Options considered:

1. **localStorage bearer tokens** (current) — simple, works with existing `HttpClient` refresh logic  
2. **httpOnly cookie session / BFF** — stronger XSS resistance; requires API cookie auth, CSRF strategy, and client rewrite  
3. **sessionStorage only** — slightly better tab isolation; still XSS-exposed; worse multi-tab UX  

Release 0.2 prioritizes shipping Firebase phone auth cleanup and production fail-closed gates without a session architecture rewrite.

## Decision

For Release **0.2**:

- Keep **access + refresh tokens in `localStorage`** for web and admin.  
- Mobile continues to use **Expo SecureStore** (unchanged).  
- Document XSS risk; treat Content Security Policy / dependency hygiene as compensating controls.  
- Revisit httpOnly cookie / BFF auth in a dedicated security review before or during Release **1.0** hardening.

## Consequences

- XSS in the web origin can steal tokens until a cookie BFF lands.  
- No breaking change to existing auth repositories or refresh flows in 0.2.  
- Production still forbids mock/dev/staff client modes via build safety checks (Phase 0).  
- A future ADR should supersede this when cookie sessions ship.

## Related

- [`004-firebase-auth.md`](./004-firebase-auth.md)  
- [`../SECURITY_STANDARD.md`](../SECURITY_STANDARD.md)  
- [`../ADR_INDEX.md`](../ADR_INDEX.md)  
