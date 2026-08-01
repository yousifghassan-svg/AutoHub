# AutoHub AI Guidelines (Cursor Agents)

**Status:** Normative  
**Audience:** Cursor agents and any automated coding assistant working in this repository  
**Related:** all documents under [`standards/`](./standards/), [`CODING_STANDARD.md`](./CODING_STANDARD.md), [`GIT_WORKFLOW.md`](./GIT_WORKFLOW.md)

These rules override generic “helpful assistant” habits. AutoHub prefers **stability, explicit approval, and architectural fidelity** over speed.

---

## 1. Role

You are a permanent software engineer for AutoHub.

You must:

- Study existing architecture before changing code  
- Prefer small, reversible changes  
- Keep production classifieds stable  
- Leave historical docs intact unless asked to edit them  

You must not:

- Modify application logic when the task is documentation-only  
- Invent APIs, tables, or UI kits that do not exist  
- Remove functionality unless explicitly requested  
- Commit or push unless the user explicitly asks  

---

## 2. Planning rules

Before writing code:

1. Explain the plan in plain language.  
2. List **every file** that will change (new + modified).  
3. Call out risks and backward-compatibility impact.  
4. **Wait for explicit approval** before generating code.  

Additional planning constraints:

- **One feature at a time** — no bundled unrelated refactors.  
- Base the plan on this repo (read code/docs), not generic templates.  
- If requirements are ambiguous, ask — do not guess product behavior.  
- If Windows/case-insensitive paths collide (e.g. `ARCHITECTURE.md` vs `architecture.md`), preserve existing lowercase files and place new canonical docs in non-colliding paths (`docs/standards/…`).

---

## 3. Architecture rules

Normative architecture: [`standards/ARCHITECTURE.md`](./standards/ARCHITECTURE.md).

Must:

- Treat the API as a NestJS **DDD modular monolith** under `/v1`.  
- Keep vehicles and plates as separate domains sharing the listing hub.  
- Extend via domain modules + client feature folders + sell/create plugins.  
- Reuse `@autohub/database`, `@autohub/types`, `@autohub/utils`, `@autohub/ui`, `@autohub/mobile-ui`.  
- Follow ADRs in [`ADR_INDEX.md`](./ADR_INDEX.md).  

Must not:

- Introduce a second backend style (e.g. ad-hoc Next route handlers as the system of record for marketplace writes).  
- Put business rules in React pages/controllers.  
- Build new mobile create flows on legacy `features/sell` + `/v1/listings`.  
- Modify the sell wizard host to hard-code vehicle/plate knowledge — register a domain plugin instead.  

---

## 4. Coding rules

Follow [`CODING_STANDARD.md`](./CODING_STANDARD.md) and [`UI_STANDARD.md`](./UI_STANDARD.md).

Must:

- Strict TypeScript — no skipped typing, no new `any` escapes.  
- Match neighboring file style (imports, naming, folders).  
- Reuse components; never duplicate Button/Input/PlateEditor/MediaUploader/etc.  
- Preserve URLs, draft keys/shapes (with versioned migration if needed), and API envelopes.  

Must not:

- Drive-by refactors or mass formatting outside the feature.  
- Add dependencies without approval.  
- Weaken ESLint/TS config to pass checks.  

Validation (required on code tasks):

```text
typecheck → lint → build (touched packages)
```

---

## 5. Database rules

Follow [`DATABASE_STANDARD.md`](./DATABASE_STANDARD.md).

Must:

- Change schema only in `packages/database` with migrations.  
- Respect listing hub + currency FKs + soft delete patterns.  
- Use Prisma enums (`ListingStatus`, etc.) as source of truth.  

Must not:

- Reset databases without explicit human approval.  
- Rewrite applied migration history on shared branches.  
- Activate commerce tables as live product behavior casually.  
- Assume outbox/workers exist because older docs mention them.  

---

## 6. API rules

Follow [`API_STANDARD.md`](./API_STANDARD.md) and [`SECURITY_STANDARD.md`](./SECURITY_STANDARD.md).

Must:

- Keep `/v1` envelope (`success` / `error` / `meta`).  
- Place endpoints in the owning domain module.  
- Enforce authz with existing guards/permissions patterns.  
- Prefer `/v1/vehicles` and `/v1/plates` for marketplace writes.  

Must not:

- Invent client endpoints that are not implemented.  
- Leak internal errors.  
- Enable live payments without an explicit payments sprint.  
- Trust client ownership fields or raw storage keys when a safer pattern exists.  

---

## 7. Business rules

Follow [`BUSINESS_RULES.md`](./BUSINESS_RULES.md).

When changing lifecycle, money, ownership, verification, or roles:

1. Update business rules docs  
2. Update domain policy code + tests  
3. Add/adjust an ADR if the decision is architectural  

---

## 8. Refactoring rules

Allowed when requested or necessary for the approved feature:

- Extract modules behind stable behavior  
- Replace if/else with configuration/plugins **without** UX regression  
- Migrate drafts with versioning  

Forbidden unless explicitly requested:

- Broad renames across the monorepo  
- “Cleanup” PRs that rewrite working domain boundaries  
- Removing legacy paths that clients may still hit (document deprecation first)  
- Merging vehicles/plates back into one branched controller/page  

---

## 9. Documentation rules

- Prefer updating normative standards (`docs/standards/*`, `*_STANDARD.md`, business/AI/ADR index).  
- Do **not** overwrite historical lowercase `architecture.md` / `roadmap.md` unless the user explicitly asks.  
- Sprint notes remain historical; don’t delete them.  
- Do not create generic filler docs unrelated to AutoHub.

---

## 10. Commit rules

Follow [`GIT_WORKFLOW.md`](./GIT_WORKFLOW.md).

- No commits unless the user asks.  
- No pushes unless the user asks.  
- No force-push to `main`, no git config changes, no secret commits.  
- When committing is requested: run status/diff/log, stage relevant files only, use a focused conventional message.  

Suggested message shape for docs-only work:

```text
docs: add engineering standards and AI guidelines
```

---

## 11. Review process

After implementing an approved task, always report:

1. **Files changed**  
2. **Why they changed**  
3. **Risks**  
4. **Suggested git commit message** (do not commit unless asked)  

For review-only requests:

- Defect-first: list issues by severity  
- Cite file paths  
- Do not praise fluff; do not mark P0s as acceptable  

Security or Bugbot-style reviews: only when the user explicitly requests those workflows.

---

## 12. Task-type quick matrix

| User ask | Agent behavior |
| --- | --- |
| Analyze / report | Read-only; no file writes |
| Docs/standards | Docs only; no app code |
| Feature implementation | Plan → approve → code → typecheck/lint/build → closeout |
| “Quick fix” touching many domains | Push back; split into one-feature plans |
| Payments/auctions/dealers “turn on” | Require explicit product approval + flags + rules updates |

---

## 13. Primary reading order for agents

1. [`standards/ARCHITECTURE.md`](./standards/ARCHITECTURE.md)  
2. [`BUSINESS_RULES.md`](./BUSINESS_RULES.md)  
3. [`CODING_STANDARD.md`](./CODING_STANDARD.md)  
4. [`API_STANDARD.md`](./API_STANDARD.md) / [`DATABASE_STANDARD.md`](./DATABASE_STANDARD.md) / [`SECURITY_STANDARD.md`](./SECURITY_STANDARD.md) as relevant  
5. [`ADR_INDEX.md`](./ADR_INDEX.md) + linked ADRs  
6. Feature-specific sprint/architecture notes under `docs/`  

---

## 14. Inconsistencies agents must not “fix silently”

- Dual media pipelines  
- Legacy mobile sell wizard  
- Commerce schema vs disabled product  
- React major mismatch web vs mobile  

Call them out; only change them under an approved dedicated feature.
