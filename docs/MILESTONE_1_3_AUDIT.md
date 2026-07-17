# Milestones 1–3 acceptance audit

| Criterion | Status | Implementation evidence | Test evidence |
|---|---|---|---|
| Project installs, starts, compiles, and builds | PASS | Next.js App Router and required scripts in `package.json` | `npm run typecheck`, `npm run build`, runtime Playwright server |
| Prisma migrations, SQLite, Eleanor seed, repeatable reset | PASS | `prisma/schema.prisma`, migration, `seed-data.ts` | `npm run db:reset` repeated successfully |
| Required models, enums, 12 verified tasks, Life Map and support | PASS | Prisma schema and deterministic seed | Reset/seed plus rendered data-backed pages |
| Required route shells load | PASS | App Router route tree | Playwright checks onboarding and five patient routes |
| Repository guidance and status exist | PASS | `AGENTS.md`, `IMPLEMENTATION_STATUS.md` | Manual audit |
| Every supplied image inspected and mapped | PASS | `UI_REFERENCE_MAP.md` covers 12 files | Manual visual audit |
| Shared mobile design and consistent five-item navigation | PASS | `CareLoadUI.tsx`, design tokens and responsive CSS | Component order test; Playwright at 390×844 and 430×932 |
| Today and Care Plan read persisted generated schedule | PASS | `PatientScreens.tsx`, `plan-service.ts` | Reset creates plan items; route smoke tests |
| Life Map reads, writes, and triggers proposed replanning | PASS | `LifeMapEditor`, `/api/life-map`, `createProposedPlan` | Playwright edits, reloads, and finds proposed acceptance |
| Messages, onboarding, Daily Signal, update fixture UI | PASS | Shared screen components, explicitly simulated labels | Route/build checks and manual review |
| Accessible semantics, focus, touch targets, no overflow | PASS | Semantic components and global focus/touch CSS | Component tests; two-viewport Playwright overflow checks |
| Deterministic planner uses no LLM | PASS | `domain/care-plan` has pure TypeScript only | Determinism and immutability tests |
| Required recurrence types | PASS | `recurrence.ts` | Weekly and twice-daily tests; daily/selected/one-off used by seed |
| Fixed work retained and conflicts surfaced | PASS | Fixed-first planner path | Fixed/conflict unit test |
| Flexible work stays in windows and avoids protected anchors | PASS | Slot generation and deterministic scoring | Window, work, and school-run tests |
| Location/equipment and delegation constraints | PASS | Candidate rejection and explicit support permission | Home-equipment and delegation tests |
| Compatible bundling only | PASS | Bundle group and location compatibility | Compatible/incompatible tests |
| No task silently omitted | PASS | Scheduled or `NEEDS_CLARIFICATION` invariant | Impossible and conservation tests |
| Metrics and explanations generated | PASS | Planner result metrics/explanations | Action, minutes, moment metrics test |
| Active plan unchanged before acceptance | PASS | Proposed version creation is separate; transactional accept service | Life Map E2E confirms proposal and explicit accept control |
| Complete verification suite | PASS | Configured scripts | reset, lint, type-check, 20 unit/component tests, build, four E2E cases |
