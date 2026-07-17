# CareLoad implementation status

Last updated: 17 July 2026

Allowed statuses: `DONE`, `IN PROGRESS`, `BLOCKED`, `DEFERRED`, `NOT STARTED`.
Milestones 1–8 were re-verified during final acceptance.

| Milestone | Status | Evidence |
|---|---|---|
| 1 — Foundation | DONE | Next.js strict TypeScript foundation, Prisma/SQLite migration, 12-task synthetic Eleanor seed, idempotent reset, route shells, validation, Vitest and Playwright configuration. |
| 2 — Patient UI | DONE | All 12 visual references mapped; shared 390–430 px mobile system; Today, Care Plan, Life Map, Messages, onboarding, Daily Signal, and update fixture screens; persisted Life Map editing. |
| 3 — Deterministic Care Planner | DONE | Pure TypeScript recurrence, slot generation, protected anchors, fixed-first placement, bundling, delegation, unplaced work, explanations, metrics, persisted versions, proposal and acceptance boundary. |
| 4 — Functional onboarding and synthetic document extraction | DONE | Persisted consent and sources; safe document upload; schema-constrained server-side OpenAI extraction with explicit fixture fallback; source-grounded candidate review; deterministic template matching; Life Map confirmation; proposed-plan preview and acceptance. See `MILESTONE_4_AUDIT.md`. |
| 5 — Full Daily Signal processing | DONE | Persisted typed/voice entry, schema-constrained extraction, personalised approved questions, evidence review, record-only flow, and one deterministic synthetic urgent rule. See `MILESTONE_5_AUDIT.md`. |
| 6 — Delayed simulated messaging | DONE | Transactional patient sending, persisted due jobs, idempotent poll processing, deterministic fictional response families, unread state, and reusable clarification messaging. See `MILESTONE_6_AUDIT.md`. |
| 7 — Care Plan Stress Test | DONE | Persisted cardiology fixture, deterministic 14-day simulation and metrics, proposed-plan isolation, unresolved work, clarification reuse, preview, and transactional acceptance. See `MILESTONE_7_AUDIT.md`. |
| 8 — Demo hardening and release | DONE | Eight deterministic checkpoints, persisted fixture control, complete E2E flow, error/loading/accessibility hardening, presenter checklist, README, and final demo-path audit. See `MILESTONE_8_AUDIT.md`. |

## Current limitations

- Dates are intentionally fixed to the July 2026 synthetic demo week.
- Playwright uses installed local Chromium; other browser engines are not part
  of the current acceptance scope.
- Live `gpt-5` document and Daily Signal extraction passed with the supplied
  server-side key, but took about 67 and 76 seconds respectively; fixture mode
  is recommended for a time-bounded presentation.
- Browser microphone capture is implemented with a typed fallback, but physical
  microphone hardware was not available during the final automated audit.
- `npm audit` reports five upstream dependency advisories (two moderate, three
  high); none is exercised by the local synthetic demo path.

## Final demo readiness

**READY WITH KNOWN LIMITATIONS**

Evidence: clean reset/migrations/seed, lint, strict type-check, 40/40 Vitest
tests, production build, and 10/10 Playwright tests across 390 × 844 and
430 × 932 passed. Live server-side OpenAI structured extraction passed after
correcting the default model to one available to the supplied project. The
complete persisted workflow, delayed-response refresh path, fixture fallback,
and accepted-plan Today state passed in Playwright.
