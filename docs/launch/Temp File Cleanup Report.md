# Temporary / Audit File Cleanup Report

**Branch:** `main` @ `ecf6491`  
**Date:** 2026-07-28  
**History rewrite:** none  
**Commit/push:** not executed  

---

## 1. Verification (ecf6491 / current HEAD)

Temporary and audit artifacts **were still tracked** on `main` after `ecf6491` (`Fix development environment - migrate to Node 20 LTS`).

Root `.gitignore` on this commit was minimal and did **not** ignore `.tmp*`, `ts-out.txt`, or `docs/_*` scratch files.

---

## 2. Tracked temporary files removed from the index (staged)

These **25 paths** were removed with `git rm --cached` (index only). Legitimate source was not touched. Deletions are **staged** for the next normal commit.

### Root scratch / logs
1. `.tmp-admin-start.err`
2. `.tmp-car.json`
3. `.tmp-rc2-api-tc.txt`
4. `.tmp-rc2-audit-fix.json`
5. `.tmp-rc2-moderation.json`
6. `.tmp-rc2-plates.json`
7. `.tmp-rc2-seed.txt`
8. `.tmp-rc2-web-build.txt`
9. `.tmp-rc2-web-lint.txt`
10. `.tmp-rc2-web-tc.txt`
11. `.tmp-s23-admin-build.txt`
12. `.tmp-s23-admin-lint.txt`
13. `.tmp-s23-admin-tc.txt`
14. `.tmp-s23-api-build.txt`
15. `.tmp-s23-api-lint.txt`
16. `.tmp-s23-api-tc2.txt`
17. `.tmp-s23-mobile-build.txt`
18. `.tmp-s23-mobile-lint.txt`
19. `.tmp-s23-mobile-tc.txt`
20. `.tmp-web-start.err`
21. `ts-out.txt`

### Docs audit / scratch
22. `docs/_gate_summary.txt`
23. `docs/_mod_smoke.json`
24. `docs/_s24_admin_start.err`
25. `docs/_s24_web_start.err`

**Post-cleanup check:** `git ls-files` matches for `.tmp*`, `ts-out.txt`, and `docs/_*` → **none**.

---

## 3. `.gitignore` updates (staged)

Root `.gitignore` expanded to ignore (non-exhaustive):

- `.tmp*`, `tmp/`, `temp/`, `*.log`, `*.err`, `ts-out.txt`
- `docs/_metro-*`, `docs/_react-*`, `docs/_s*.err`, `docs/_gate_*`, `docs/_mod_*`, `docs/_*.err|txt|json`
- secrets / Firebase native configs / build outputs (as before + hardened)

`git check-ignore` confirms sample paths are ignored.

---

## 4. Intentionally kept tracked

- Production source under `apps/`, `packages/`
- Legitimate docs (e.g. `docs/launch/*`, feature docs) — **not** `docs/_*` scratch
- Config: `package.json`, lockfile, Docker, Prisma, CI, `.env.example*`
- App assets (icons/splash)
- Admin/API **audit feature source** (`admin-audit*`, `audit-logs/page.tsx`, etc.) — **not** removed

---

## 5. Next commit (for you — not run)

Staged now:

- Deletion of the 25 junk paths above  
- Updated `.gitignore`

Suggested message:

```text
chore: untrack temporary and audit scratch files

Remove .tmp-*, ts-out.txt, and docs/_ scratch artifacts from the
index and harden .gitignore so they cannot be re-committed.
```

**Do not** use reset/rebase/filter-branch/force-push. A normal forward commit is enough.

---

## 6. Status

| Item | Result |
|------|--------|
| Still tracked after staging cleanup? | **No** |
| History rewritten? | **No** |
| Commit executed? | **No** |
| Ready for clean follow-up commit? | **Yes** |
