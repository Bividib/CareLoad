# CareLoad implementation status

Last updated: 17 July 2026

Allowed statuses: `DONE`, `IN PROGRESS`, `BLOCKED`, `DEFERRED`, `NOT STARTED`.
Only Milestones 1–3 are in the current implementation scope.

| Milestone | Status | Evidence |
|---|---|---|
| 1 — Foundation | DONE | Next.js strict TypeScript foundation, Prisma/SQLite migration, 12-task synthetic Eleanor seed, idempotent reset, route shells, validation, Vitest and Playwright configuration. |
| 2 — Patient UI | DONE | All 12 visual references mapped; shared 390–430 px mobile system; Today, Care Plan, Life Map, Messages, onboarding, Daily Signal, and update fixture screens; persisted Life Map editing. |
| 3 — Deterministic Care Planner | DONE | Pure TypeScript recurrence, slot generation, protected anchors, fixed-first placement, bundling, delegation, unplaced work, explanations, metrics, persisted versions, proposal and acceptance boundary. |
| 4 — Care instruction extraction | DEFERRED | Not in current scope. |
| 5 — Full Daily Signal processing | DEFERRED | Static Milestone 2 UI only; no AI, transcription, or sending. |
| 6 — Delayed simulated messaging | DEFERRED | Fixture UI only; no jobs or polling. |
| 7 — Care Plan Stress Test | DEFERRED | Fixture UI only; no later-milestone stress simulation. |
| 8 — Demo hardening and release | NOT STARTED | Recommended next milestone. |

## Current limitations

- Dates are intentionally fixed to the July 2026 synthetic demo week.
- Daily Signal, messaging, and cardiology update screens are labelled fixtures;
  their later milestone workflows are not implemented.
- Playwright uses installed local Chromium; other browser engines are not part
  of the current acceptance scope.
