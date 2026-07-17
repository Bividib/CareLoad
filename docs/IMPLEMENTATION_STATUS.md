# CareLoad implementation status

Last updated: 17 July 2026

Allowed statuses: `DONE`, `IN PROGRESS`, `BLOCKED`, `DEFERRED`, `NOT STARTED`.
Milestones 1–4 are complete. Later milestone fixtures remain deliberately inactive.

| Milestone | Status | Evidence |
|---|---|---|
| 1 — Foundation | DONE | Next.js strict TypeScript foundation, Prisma/SQLite migration, 12-task synthetic Eleanor seed, idempotent reset, route shells, validation, Vitest and Playwright configuration. |
| 2 — Patient UI | DONE | All 12 visual references mapped; shared 390–430 px mobile system; Today, Care Plan, Life Map, Messages, onboarding, Daily Signal, and update fixture screens; persisted Life Map editing. |
| 3 — Deterministic Care Planner | DONE | Pure TypeScript recurrence, slot generation, protected anchors, fixed-first placement, bundling, delegation, unplaced work, explanations, metrics, persisted versions, proposal and acceptance boundary. |
| 4 — Functional onboarding and synthetic document extraction | DONE | Persisted consent and sources; safe document upload; schema-constrained server-side OpenAI extraction with explicit fixture fallback; source-grounded candidate review; deterministic template matching; Life Map confirmation; proposed-plan preview and acceptance. See `MILESTONE_4_AUDIT.md`. |
| 5 — Full Daily Signal processing | DONE | Persisted typed/voice entry, schema-constrained extraction, personalised approved questions, evidence review, record-only flow, and one deterministic synthetic urgent rule. See `MILESTONE_5_AUDIT.md`. |
| 6 — Delayed simulated messaging | DONE | Transactional patient sending, persisted due jobs, idempotent poll processing, deterministic fictional response families, unread state, and reusable clarification messaging. See `MILESTONE_6_AUDIT.md`. |
| 7 — Care Plan Stress Test | DEFERRED | Fixture UI only; no later-milestone stress simulation. |
| 8 — Demo hardening and release | NOT STARTED | Recommended next milestone. |

## Current limitations

- Dates are intentionally fixed to the July 2026 synthetic demo week.
- Messaging and cardiology update screens remain labelled fixtures until their
  respective milestones are implemented.
- Playwright uses installed local Chromium; other browser engines are not part
  of the current acceptance scope.
