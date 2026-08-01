# AutoHub Git Workflow

**Status:** Normative  
**Related:** [`CODING_STANDARD.md`](./CODING_STANDARD.md), [`AI_GUIDELINES.md`](./AI_GUIDELINES.md), [`standards/ROADMAP.md`](./standards/ROADMAP.md)

---

## 1. Branching

| Branch | Purpose |
| --- | --- |
| `main` | Production-track; must stay green |
| `feature/<short-name>` | Single feature or docs pack |
| `fix/<short-name>` | Bugfix only |
| `chore/<short-name>` | Tooling/docs with no product behavior change |

**Rules**

- One feature per branch / PR.  
- Do not mix refactors with unrelated product changes.  
- Prefer rebase/merge strategies already used by the team; do not force-push `main`.

---

## 2. Commits

### Message style

Use concise, imperative, scoped messages (Conventional Commit style preferred):

```
feat(web): add domain-agnostic sell wizard host
fix(api): enforce ACTIVE filter in listing search SQL
docs: add engineering standards pack
chore(ci): install pnpm 9.15 in workflow
```

Scopes commonly used: `api`, `web`, `admin`, `mobile`, `database`, `ci`, or omit for pure docs.

### Rules

- Commit only when explicitly asked (human or release process) — agents must not auto-commit.  
- Never commit secrets (`.env`, key files, `google-services` production overrides if sensitive).  
- Never commit root `.tmp-*` QA dumps, `.turbo` caches, or `node_modules`.  
- Do not use `--no-verify` unless a human explicitly requests it.  
- Avoid `git commit --amend` unless the human requests it and the amend safety conditions are met.  
- No `git push --force` to `main`/`master`.

---

## 3. Pull requests

### Before opening

1. `pnpm --filter <touched> typecheck`  
2. `pnpm --filter <touched> lint`  
3. `pnpm --filter <touched> build` (or package equivalent)  
4. Manual smoke for the feature path  

### PR content

- Summary of **why**  
- Test plan checklist  
- Note any migration / env changes  
- Link ADR or standards updates when architecture shifts  

### CI reality (`.github/workflows/ci.yml`)

On PR/push to `main`, CI currently:

- Starts Postgres service  
- `pnpm install`  
- `db:generate` + `prisma migrate deploy`  
- Builds `@autohub/types`, `utils`, `config`, `ui`, `database`, `api`, `web`, `admin`  

**Gap:** mobile is not in the main build matrix — still validate mobile locally when touched. Prefer adding mobile checks in a future chore rather than ignoring failures locally.

---

## 4. Reviews

Reviewers / agents should check:

1. Architecture fit (domain boundaries, no invented APIs)  
2. Backward compatibility (URLs, drafts, DTOs)  
3. Security (authz, validation, no secret leak)  
4. Types/lint/build evidence  
5. No duplicate components or parallel abstractions  
6. Docs updated when rules/architecture change  

Defect-first review: report findings by severity; do not “pass” with unresolved P0s.

---

## 5. Database changes in Git

- Schema + migration files commit together.  
- Do not rewrite already-applied migration history on shared branches.  
- Call out seed changes in the PR body.

---

## 6. Documentation commits

Engineering standards live under `docs/` and `docs/standards/`.

- Historical lowercase `architecture.md` / `roadmap.md` stay untouched unless a human explicitly requests archival edits.  
- Normative updates go to `docs/standards/ARCHITECTURE.md`, `docs/standards/ROADMAP.md`, and the `*_STANDARD.md` / business / AI / ADR index docs.

---

## 7. Local hygiene

```bash
pnpm docker:up
pnpm install
cp .env.example .env   # and apps/api/.env as needed
pnpm db:generate && pnpm db:migrate && pnpm db:seed
```

Do not leave credentials in shell history paste bins or commit hooks that print secrets.

---

## 8. Inconsistencies → standard

| Finding | Standard |
| --- | --- |
| Many root `.tmp-*` QA artifacts | Gitignore/clean locally; never commit |
| README/app status drift | Update README in the same PR that changes app readiness |
| Mobile not in CI | Required local gate; schedule CI expansion |

---

## 9. Agent-specific git rules

AI agents working in Cursor:

- Never update git config  
- Never push unless the user explicitly asks  
- Never commit unless the user explicitly asks  
- When asked to commit: status + diff + log first; stage only relevant files; use HEREDOC message format  
