# CareLoad final acceptance audit

Date: 17 July 2026. Allowed statuses are `PASS`, `FAIL`, and `NOT TESTED`.
Evidence came from a fresh migration/seed, code and database inspection, live
server calls, and Playwright at both required mobile widths.

| Milestone | Criterion | Status | Implementation evidence | Test evidence |
|---|---|---|---|---|
| 1 | Strict foundation starts, migrates, seeds and builds | PASS | App Router, strict TypeScript, Prisma migrations and deterministic seed | reset, type-check and build pass |
| 1 | Synthetic-only patient boundary and no clinician application | PASS | Eleanor-only seed, warnings, patient routes | route manifest and E2E |
| 2 | Reference-aligned mobile shell, navigation and states | PASS | shared UI/CSS; all 12 images inspected | two viewport projects pass |
| 2 | No overflow; focus, landmarks, labels, touch targets and reduced motion | PASS | semantic UI and global accessibility CSS | component and overflow tests |
| 3 | Deterministic planner has no OpenAI dependency | PASS | pure recurrence, slot and planner modules | planner tests |
| 3 | Constraints, anchors, bundling, delegation and unplaced work persist | PASS | scheduled and clarification items | invariant tests |
| 3 | Proposal isolation and one accepted active plan | PASS | transactional acceptance | plan E2E |
| 4 | Consent and synthetic disclaimer required | PASS | literal consent schema | onboarding E2E |
| 4 | Sample selection and safe upload/process persist | PASS | MIME/size/name/path controls | onboarding E2E/domain tests |
| 4 | Fixture and live schema-constrained extraction | PASS | Responses parse, Zod and fixtures | fixture E2E; live `gpt-5` PDF passed |
| 4 | Quotes, confidence, uncertainty and provenance persist | PASS | candidate/document models | domain/live inspection |
| 4 | Only matched verified templates schedule; unmatched remain unresolved | PASS | deterministic matcher | domain tests |
| 4 | Life Map proposal does not replace active plan before acceptance | PASS | proposal service | persistence E2E |
| 4 | Initial accepted plan survives refresh | PASS | active version/completion flag | onboarding E2E |
| 5 | Typed, editable, Same, Skip and record-only flows | PASS | Daily Signal routes/client | unit/E2E |
| 5 | Voice recording and typed denial fallback | NOT TESTED | MediaRecorder, validation, transcription and editable transcript exist | automated denied/unsupported/empty/failure/success tests pass; no physical microphone |
| 5 | Structured output preserves phrases/uncertainty and rejects diagnosis fields | PASS | strict schema/rules | safety tests and live result |
| 5 | At most two approved personalised questions | PASS | catalogue filter and max two | tests; live result returned two |
| 5 | Confirmation and deterministic urgent rule | PASS | persisted statuses and fixed rule | unit/E2E |
| 6 | Send stores message and due job | PASS | transaction | complete E2E |
| 6 | Delay survives navigation/refresh; duplicate polling is idempotent | PASS | dueAt job and conditional claim | response tests/E2E |
| 6 | Simulated label, unread/read and template fallback | PASS | author/thread state | E2E/source inspection |
| 7 | Update notification and active-plan Stress Test | PASS | persisted change/simulation | complete E2E |
| 7 | Twice daily for 14 days produces 28 visible actions | PASS | date-limited recurrence | stress test and `+28` E2E |
| 7 | Metrics, conflicts, legal moves, bundling and unplaceable work | PASS | deterministic simulation | planner/stress tests |
| 7 | Clarification uses delayed response system | PASS | shared job family | source/tests |
| 7 | Preview isolation, transactional acceptance and updated Today/Care Plan | PASS | version transaction | complete E2E |
| 8 | Eight deterministic checkpoints and no-key fixtures | PASS | checkpoint seeder/settings | smoke E2E |
| 8 | Full demo at 390 × 844 and 430 × 932 | PASS | responsive shell | 10/10 Playwright |
| 8 | Final documentation is current | PASS | README, audit, runbook, checklist | manual review |

## Cross-cutting evidence

| Milestone | Criterion | Status | Implementation evidence | Test evidence |
|---|---|---|---|---|
| All | Key stays server-side; no `NEXT_PUBLIC_*` secret | PASS | server-only environment reads | ignore/source search |
| All | Every AI output is validated and has fixture recovery | PASS | Responses parse/Zod/fixtures | live and fixture runs |
| All | Malformed API input and unsafe files are rejected | PASS | Zod, allowlist, limits, UUID names, path root checks | tests/source audit |
| All | Audit events and foreign keys cover important transitions | PASS | event writes and relations | reset/database inspection |
| All | Production cannot call destructive demo reset | PASS | NODE_ENV guard | source audit |
| All | Invalid/missing key, timeout/output and transcription failures remain recoverable | PASS | bounded live timeout plus explicit fixture/typed fallback | controlled failure, component tests and fixture E2E |
| All | Dependency security audit | PASS | safe Prisma patch removed all high findings; two moderate risks documented | `docs/DEPENDENCY_AUDIT.md` |
| All | Two extra manual browser rehearsals beyond automated viewport runs | NOT TESTED | automation covers both widths | not separately recorded |

## Findings

- P0: none.
- P1 fixed: inaccessible `gpt-5.6` default blocked live AI; defaults now use
  project-accessible `gpt-5`. Live PDF and Daily Signal output pass.
- P1 open: none.
- P2 fixed: high-severity Prisma CLI advisories; bounded live-AI timeout and
  explicit effective-mode display; microphone empty-capture and whole-button
  activation defects.
- P2 accepted limitations: two moderate Next-bundled PostCSS advisories and a
  non-fatal Prisma/Turbopack NFT trace warning. See
  `docs/RELEASE_CLOSURE_STATUS.md`.
- P3: none implemented.

Final status: **READY WITH KNOWN LIMITATIONS**.

Release-closure superseding evidence: final commands, clean-clone
reproducibility, dependency triage, timeout hardening and microphone automated
coverage are recorded in `docs/RELEASE_CLOSURE_STATUS.md`. Physical microphone
interaction and three presenter rehearsals remain manual.
