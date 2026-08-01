# AutoHub Coding Standard

**Status:** Normative  
**Applies to:** `apps/*`, `packages/*`  
**Related:** [`standards/ARCHITECTURE.md`](./standards/ARCHITECTURE.md), [`AI_GUIDELINES.md`](./AI_GUIDELINES.md)

---

## 1. Principles

1. **Match existing architecture** — extend domain modules and feature folders; do not invent parallel stacks.  
2. **TypeScript is mandatory** — no implicit `any`; prefer explicit DTOs/models at boundaries.  
3. **One feature at a time** — do not bundle unrelated refactors with product work.  
4. **Preserve behavior** — no removals or breaking URL/API changes unless explicitly requested.  
5. **Reuse before create** — never duplicate UI components, repositories, or validators that already exist.

---

## 2. Monorepo conventions

| Rule | Detail |
| --- | --- |
| Package manager | pnpm `9.15.0` only (`packageManager` field) |
| Workspaces | `apps/*`, `packages/*` |
| Internal deps | `workspace:*` |
| Shared TS base | Root `tsconfig.base.json` |
| Scripts | Prefer root Turbo/`pnpm --filter @autohub/<pkg>` |

### Validation gates (required before merge)

For every touched package/app:

```bash
pnpm --filter @autohub/<name> typecheck
pnpm --filter @autohub/<name> lint
pnpm --filter @autohub/<name> build   # or package-equivalent
```

Do not skip lint or typecheck. CI currently builds shared packages + api/web/admin after Prisma migrate; mobile is not fully covered — still run mobile checks locally when touching mobile.

---

## 3. TypeScript rules

- Keep `strict` settings as configured per package; do not weaken them.  
- Public functions and React props must be typed.  
- Prefer `unknown` + narrowing over `any` at JSON boundaries.  
- Shared cross-app types belong in `@autohub/types` (or domain-local types if not shared).  
- Money/currency logic belongs in `@autohub/utils` `Money` — do not reimplement compare/format ad hoc.

---

## 4. API (`apps/api`) coding rules

### Folder layout (required for domains)

```
domains/<name>/
  domain/
  application/
  infrastructure/
  presentation/
  <name>.module.ts
```

### Must

- Put lifecycle/policy rules in `domain/` (e.g. listing status transitions).  
- Controllers stay thin: validate input, call application service, return DTO-shaped data.  
- Use existing response interceptor / exception filter — do not invent alternate envelopes.  
- Guard mutations with auth + `@Roles` / `@Permissions` as neighboring routes do.  
- Prefer domain routes (`/v1/vehicles`, `/v1/plates`) for new marketplace work.

### Must not

- Put Prisma calls directly in controllers.  
- Branch vehicle vs plate logic inside a shared controller when a domain module already owns it.  
- Add live payment side effects in `payments` without an explicit product sprint (interfaces only today).

---

## 5. Web / Admin (`apps/web`, `apps/admin`)

### Structure

- Routes: `src/app/**`  
- Features: `src/features/<feature>/{components,data,domain,hooks,lib}`  
- Shared chrome/UI: `@/components/ui` and `@autohub/ui` — extend, don’t fork  

### Must

- Use TanStack Query for server state.  
- Call existing repositories; do not sprinkle raw `fetch` with divergent error handling.  
- Sell flow: domain-agnostic host in `features/sell`; domain plugins own steps/validators/submit.  
- Keep URLs stable (`/sell`, `/vehicles`, `/plates`, …).

### Must not

- Grow monolithic pages when a feature folder extract exists (sell wizard is the reference).  
- Duplicate `Button`/`Input`/plate editors — import from existing modules.  
- Introduce a second design system.

---

## 6. Mobile (`apps/mobile`)

### Structure

- Routes: `app/**` (Expo Router) — keep thin  
- Features: prefer `src/features/<feature>` for new work  
- Design system: `@autohub/mobile-ui` only for pure UI (no network/storage/domain imports inside the package)

### Must

- New listing creation uses domain create flow (`src/features/create`, `/sell/vehicle`, `/sell/plate`) and domain APIs.  
- Validate with existing Zod/step validators patterns.  
- Respect RTL + theme tokens (`useTheme`, locale).

### Must not

- Build new product flows on legacy `features/sell` + `/v1/listings` wizard.  
- Import web `@autohub/ui` into React Native.

---

## 7. Shared packages

| Package | Allowed contents |
| --- | --- |
| `@autohub/database` | Prisma schema, migrations, seed, client export |
| `@autohub/types` | Cross-app types only |
| `@autohub/utils` | Pure helpers / Money |
| `@autohub/config` | Shared config parsing |
| `@autohub/ui` | Web/admin presentational building blocks |
| `@autohub/mobile-ui` | RN presentational building blocks |

Do not put Nest providers or Next route handlers inside shared UI packages.

---

## 8. Naming

| Kind | Convention |
| --- | --- |
| Files (TS/TSX) | `kebab-case` or existing folder local pattern — match neighbors |
| React components | `PascalCase` |
| Prisma models | `PascalCase` singular |
| HTTP paths | plural nouns under `/v1` |
| Permissions | `resource:action` strings in `Permission` enum |

---

## 9. Testing

- Prefer colocated `*.spec.ts` next to domain logic (API already does this).  
- Integration specs that hit Nest testing module should follow existing domain `presentation/*.integration.spec.ts` style.  
- Do not delete tests to make CI green.

---

## 10. Inconsistencies → standard

| Inconsistency | Standard going forward |
| --- | --- |
| Legacy mobile sell vs domain create | Domain create only for new work |
| Web sell was monolithic; now pluginized | Keep plugin host; domains own steps |
| Mixed React majors | Accept RN/web split; don’t share React internals across |
| Temp QA artifacts at repo root (`.tmp-*`) | Never commit; delete locally when done |

---

## 11. Checklist (author)

- [ ] Touches one feature only  
- [ ] Uses existing modules/components  
- [ ] Types strict; no new `any`  
- [ ] typecheck + lint + build passed  
- [ ] No invented APIs  
- [ ] Backward compatible  
