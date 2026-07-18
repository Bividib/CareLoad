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

## Daily Signal disposition correction — 18 July 2026

- Fixed the fixture classifier that allowed “very bad, upset tummy” to fall
  through to the generic fatigue fixture. Normalised GI synonym matching now
  preserves the exact patient phrase as stomach-observation evidence.
- The final disposition is now deterministic and calculated after approved
  follow-up answers are saved. It produces `SHARE_SUGGESTED`, `RECORD_ONLY`,
  or the existing separate `URGENT_DEMO` outcome.
- Share-suggested and record-only states have distinct, non-dead-end actions.
  Record-only preserves patient choice through **Send anyway** without creating
  a message or response job when the patient returns to Today.
- The supplied two-outcome UI sequence is represented as separate input-choice,
  editable-transcript, question, answer-confirmation, disposition, response
  waiting, and **What this means for today** screens.
- Unit and component coverage includes the original regression, GI priority,
  question selection, both routine dispositions, and the urgent demonstration
  rule. Live-mode extraction was also verified for “very bad, upset tummy”:
  it returned the stomach domain, the exact evidence phrase, and the approved
  duration/activity questions.
- Playwright verified both Share Suggested and Record Only from Today at
  390 px and 430 px, including delayed response persistence and the absence of
  a message thread for Return to Today. Physical microphone hardware remains a
  manual verification item; automated MediaRecorder/transcription parity is
  covered with browser mocks.

## Explainable longitudinal patient evidence graph — 18 July 2026

- Daily Signals were already persisted in Prisma/SQLite; this enhancement
  derives a longitudinal patient evidence graph from the stored report,
  extraction, displayed questions, editable confirmed answers, recent context,
  and deterministic disposition.
- Live mode uses OpenAI structured extraction. Fixture mode uses an immediate
  validated extraction fixture and preselects the two editable stomach-demo
  answers.
- The final workflow outcome remains deterministic. The graph is reconstructed
  from persisted data after refresh and is an explanation mechanism, not a
  clinical prediction model.
- No graph database, Prisma migration, background task, or additional AI
  explanation call was added.

## Current limitations

### Match frontend scaffold — 18 July 2026

- Match is a frontend-only peer-support demonstration using fictional composite
  profile and conversation fixtures.
- Read state, the revealed Marcus fixture, and locally sent replies are retained
  in versioned browser storage for demo continuity. No real matching or message
  delivery occurs, and clearing browser storage resets the Match prototype.
- Backend matching, authentication, persistence, safety operations, privacy,
  moderation, blocking, reporting, and notifications remain out of scope.
- This scaffold is not production-ready peer messaging, and peer experiences
  are not medical advice.

- Dates are intentionally fixed to the July 2026 synthetic demo week.
- Playwright uses installed local Chromium; other browser engines are not part
  of the current acceptance scope.
- Live `gpt-5` document and Daily Signal extraction passed with the supplied
  server-side key, but took about 67 and 76 seconds respectively; fixture mode
  is recommended for a time-bounded presentation.
- Browser microphone capture is implemented with a typed fallback, but physical
  microphone hardware was not available during the final automated audit.
  Automated coverage includes permission denial, unsupported recording,
  validation, transcription failure/success and transcript editing.
- `npm audit` reports two moderate Next-bundled PostCSS findings after the safe
  Prisma 6.19.3 patch removed all three high CLI findings. The remaining path is
  not exercised by CareLoad’s authored-CSS-only local demo.
- Clean production builds retain a non-fatal Turbopack NFT trace warning around
  Prisma’s generated CommonJS client; every route and required runtime asset is
  emitted.

## Final demo readiness

**READY WITH KNOWN LIMITATIONS**

Evidence: clean reset/migrations/seed, lint, strict type-check, 49/49 Vitest
tests, production build, and 10/10 Playwright tests across 390 × 844 and
430 × 932 passed. Live server-side OpenAI structured extraction passed after
correcting the default model to one available to the supplied project. The
complete persisted workflow, delayed-response refresh path, fixture fallback,
and accepted-plan Today state passed in Playwright.

Live requests are bounded by `DEMO_AI_TIMEOUT_MS` (25 seconds by default) and
do not silently switch to fixture output. `/demo` states the effective mode.
See `docs/RELEASE_CLOSURE_STATUS.md` for closure evidence and remaining manual
or event-day tasks.
