# AutoHub engineering standards

Canonical production standards for AutoHub.

| Document | Path |
| --- | --- |
| Architecture | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Roadmap | [`ROADMAP.md`](./ROADMAP.md) |
| Coding | [`../CODING_STANDARD.md`](../CODING_STANDARD.md) |
| API | [`../API_STANDARD.md`](../API_STANDARD.md) |
| UI | [`../UI_STANDARD.md`](../UI_STANDARD.md) |
| Database | [`../DATABASE_STANDARD.md`](../DATABASE_STANDARD.md) |
| Security | [`../SECURITY_STANDARD.md`](../SECURITY_STANDARD.md) |
| Git workflow | [`../GIT_WORKFLOW.md`](../GIT_WORKFLOW.md) |
| Business rules | [`../BUSINESS_RULES.md`](../BUSINESS_RULES.md) |
| AI guidelines | [`../AI_GUIDELINES.md`](../AI_GUIDELINES.md) |
| ADR index | [`../ADR_INDEX.md`](../ADR_INDEX.md) |

## Why `ARCHITECTURE.md` and `ROADMAP.md` live here

The repository already has historical docs at:

- [`../architecture.md`](../architecture.md)
- [`../roadmap.md`](../roadmap.md)

Those files are **kept intact**. On case-insensitive filesystems (typical Windows hosts), `ARCHITECTURE.md` and `architecture.md` cannot coexist in the same directory. This `standards/` folder holds the new canonical uppercase documents without overwriting history.

AI agents and engineers should treat **`docs/standards/*` + the root `*_STANDARD.md` / business / AI / ADR docs** as normative. Historical sprint notes and lowercase overviews remain reference material.
