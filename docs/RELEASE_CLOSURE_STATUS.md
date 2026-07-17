# CareLoad release closure status

Closure date: 17 July 2026. Final readiness: **READY WITH KNOWN LIMITATIONS**.

| Work item | Status | Evidence | Action taken | Remaining manual step |
|---|---|---|---|---|
| Milestones 1–8 implementation | COMPLETE | Acceptance audits and full automated flow | No product features added | None |
| Baseline install/reset/quality gates | COMPLETE | Release command log; reset, lint, typecheck, unit, build and E2E | Stopped a workspace-owned dev server that locked Prisma’s Windows DLL, then reran install | None |
| Dependency advisories | FIXED | `docs/DEPENDENCY_AUDIT.md` | Prisma 6.19.2 → 6.19.3 removed all 3 high findings | None; 2 moderate findings accepted below |
| Next.js NFT trace warning | ACCEPTED LIMITATION | Clean build traces `generated/prisma6/index.js` via `lib/db.ts` from an App Route and reports `next.config.ts` | Confirmed all 36 pages/routes build; no SQLite, PDF, fixture, upload, or runtime asset is missing | None for local demo |
| Fixture/no-key demo path | COMPLETE | `/demo` and complete Playwright flow | `/demo` now states the effective processing mode, including environment-forced fixtures | None |
| Live-AI latency fallback | FIXED | Environment validation and recovery UI tests | Added bounded `DEMO_AI_TIMEOUT_MS=25000`, disabled SDK retries, preserved explicit Retry/demo fallback behavior | Optional live credential check |
| Uploaded document preservation on AI failure | COMPLETE | Stored `CareDocument` failure state and retry/demo controls | Reverified implementation | None |
| Daily Signal text preservation on AI failure | COMPLETE | Browser state plus explicit Retry/demo extraction controls | Reverified and tested controls | None |
| Microphone edge cases | FIXED | Component and audio validation tests | Covered denied/unsupported, empty, invalid, oversized, failure, success and editable transcript; fixed empty-capture idle state and whole-button activation | Physical microphone test required |
| Temporary audio cleanup | COMPLETE | Route accepts in-memory `File`; no filesystem write | Confirmed no server temporary file path exists | None |
| Clean-clone reproducibility | COMPLETE | Isolated no-env/no-db copy command log | Followed README in fixture mode; created database, loaded `/demo` and patient route | None |
| Documentation reconciliation | FIXED | README, UI map, audits, runbook, checklists and status | Standardised `.env` and `npm run typecheck`; retained honest historical notes | Three manual rehearsals and event-day tasks |
| Three fixture rehearsals | MANUAL VERIFICATION REQUIRED | Blank `docs/FINAL_REHEARSAL_LOG.md` | Added exact steps and recovery scenario | Presenter completes and records 3 runs |
| Event-laptop microphone | MANUAL VERIFICATION REQUIRED | `docs/MANUAL_MICROPHONE_TEST.md` | Added exact checklist | Presenter tests permission, recording and transcript |
| Screenshots/backup recording/event setup | MANUAL VERIFICATION REQUIRED | Submission checklist | Left unverified boxes blank | User selects assets, disables notifications, closes tabs and connects charger |
| Remaining PostCSS advisories | ACCEPTED LIMITATION | `npm audit`: 2 moderate, no high/critical | No breaking Next downgrade or force fix applied; path does not process user CSS | Reassess when a supported Next patch is available |

## Next.js warning determination

Exact warning: `Encountered unexpected file in NFT list`, stating that a file
indicates the whole project was traced unintentionally. The import trace is
`next.config.ts → generated/prisma6/index.js → lib/db.ts → an App Route`.
Prisma’s generated CommonJS client dynamically resolves its runtime and native
query engine, which makes Turbopack’s NFT analysis conservative. A clean build
still emits every route and the native engine remains present. Suppressing or
editing generated Prisma code would be less safe than accepting this local
prototype build-tool warning.

## Command results

| Command | Final result | Notes |
|---|---|---|
| `npm install` | PASS with warnings | Initial worktree attempt failed while a workspace dev server locked Prisma’s Windows DLL; passed after that server stopped. Windows npm also reported non-fatal optional WASM cleanup warnings. Clean copy installed 547 packages and generated Prisma 6.19.3. |
| `npm run db:reset` | PASS | Migrations and deterministic seed passed repeatedly in the worktree and isolated copy. The isolated copy’s first schema-engine invocation returned an empty transient error; immediate and subsequent script reruns passed. |
| `npm run lint` | PASS | Zero warnings. |
| `npm run typecheck` | PASS | Strict TypeScript passed. |
| `npm test` | PASS | 10 files, 49 tests. |
| `npm run build` | PASS with accepted warning | 36 routes/pages emitted; NFT warning documented above. |
| `npm run test:e2e` | PASS | Final run: 10/10 across both target widths. An earlier worktree run had 9/10 because a successful plan-acceptance request exceeded the test’s 5-second navigation assertion on the slow filesystem; the test now waits for the 200 response and allows bounded navigation time. Focused 2/2 and final full 10/10 reruns passed. |
| `npm audit` | ACCEPTED LIMITATION | 2 moderate, 0 high, 0 critical; exits 1 by npm convention. |
| `npm audit --json` | COMPLETE | Advisory details recorded in `DEPENDENCY_AUDIT.md`. |
| `npm outdated` | COMPLETE | Patch upgrade applied only where safe; major release upgrades deferred. |
| `npm run dev` plus HTTP checks | PASS | Isolated `/demo`, `INITIAL_PLAN_READY`, and `/patient/today` returned 200; `/demo` showed fixture mode. |
