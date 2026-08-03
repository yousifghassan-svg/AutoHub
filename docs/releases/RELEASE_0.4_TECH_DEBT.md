# Release 0.4 — Technical Debt Report

**Companion:** [`RELEASE_0.4_RC_GO_NO_GO.md`](./RELEASE_0.4_RC_GO_NO_GO.md) · [`RELEASE_0.4_BUG_BACKLOG.md`](./RELEASE_0.4_BUG_BACKLOG.md)  
**Rule:** Debt items are not automatic commit work; schedule under approved sprints.

| ID | Debt | Severity | Why it matters | Suggested timing | Owner |
| --- | --- | --- | --- | --- | --- |
| TD-01 | Extract shared `ListingVisitorActions` (vehicle/plate parity) | Medium | Stops feature drift (message/report/analytics) | Next marketplace polish sprint | Web |
| TD-02 | Action Registry + recommendation unit tests | Medium | Prevents status-matrix regressions | With polish or CI hardening | Web |
| TD-03 | Domain-agnostic admin listing moderation | Medium | Plate approve/reject shipped via thin plates → listings bridge; full domain-agnostic surface still nicer long-term | Post–closed-beta polish | API + Admin |
| TD-04 | Search state ↔ URL sync utility | Medium | Shareable filtered searches | P1 fix sprint | Web |
| TD-05 | Owner-only analytics gating | Medium | Privacy + clearer seller dashboard later | P2 fix or 0.4.x | API/Web |
| TD-06 | Status copy variants (owner vs visitor) | Low | Cleaner public UX | P3 | Web |
| TD-07 | Multi-status seed fixtures for QA | Medium | Faster RC sign-off | Internal testing prep | Platform |
| TD-08 | Edit listing → deeper sell-wizard reuse | Medium | ~~Avoid dual edit models~~ **CLOSED in 0.5 / P5-9** | — | Web |
| TD-09 | Favorites server sync architecture | High | Required for public “saved” UX | Before public beta | API + Web |
| TD-10 | Mobile nav a11y + touch carousel | Low | Accessibility bar | P3 / a11y pass | Web |
| TD-11 | Remove or gate `/media/demo` | Low | Cleaner prod surface | Anytime | Web |
| TD-12 | Windows Next `.next` lock between dev/build | Low | Local DX | Docs/runbook | Platform |
| TD-13 | Full epic backlog files (`EPIC_001`…) | Low | Planning clarity | Backlog sprint | Product |
| TD-14 | Playwright CI marketplace smoke | Medium | Catch P0 visibility/auth regressions | Infra/CI | Platform |

### Explicitly not debt of 0.4 (deferred products)

Payments (0.7), AI, dealer platform (0.9), chat/notifications (0.6), media trust pipeline (absorbed by Release **0.5**), Firebase C–E — see Go/No-Go **Deferred** section and [`RELEASE_0.5_MARKETPLACE.md`](./RELEASE_0.5_MARKETPLACE.md).
