# Milestone 4 acceptance audit

| Criterion | Status | Implementation evidence | Test evidence |
|---|---|---|---|
| Consent is required and persisted | PASS | `/onboarding/welcome`, `/api/onboarding/consent`, Patient consent fields | Full onboarding Playwright test |
| Multiple onboarding sources persist | PASS | Build screen and `/api/onboarding/sources`; simulated connection loads the predefined record | Route exercised by UI; reset/E2E covers upload path |
| Synthetic PDF, TXT, and Markdown upload is safe and persisted | PASS | `/api/documents/upload`, `upload-validation.ts`, `CareDocument`; 3-file/5 MB, MIME and extension checks, sanitised storage | Unit tests cover valid, unsupported, oversized, and filename cases |
| Three fictional sample PDFs are available | PASS | `public/demo-documents/` and reproducible generation script | PDFs rendered and visually inspected; full E2E loads all three |
| Server-side OpenAI Responses API extraction is schema constrained | PASS | `lib/document-extraction.ts` uses `responses.parse`, `zodTextFormat`, `store: false`, server-only key and Zod revalidation | Schema accepts complete fixtures and rejects invalid structured output; live request NOT TESTED without an API key |
| Deterministic fallback preserves the same workflow | PASS | Per-document JSON fixtures and explicit `forceFixture`/`DEMO_AI_FALLBACK` routing | Unit fixture tests and full E2E without an API key |
| Extraction failure preserves documents and permits retry/fallback | PASS | Per-document failure state/error persistence; processing screen names failed documents and exposes both controls | Unknown-fixture failure unit test; per-document route isolation verified by implementation inspection |
| Candidate tasks, evidence, uncertainty, and processing state persist | PASS | `CandidateCareTask`, `CareDocument`, `persistExtraction` | Reset/migration and full onboarding E2E |
| Review shows exact evidence and persists decisions | PASS | Stored review cards, source endpoint, individual and batch decision APIs with audit events | Full onboarding E2E confirms all candidates |
| Verified constraints come only from deterministic templates | PASS | Ordered matcher and `decideCandidate`; planner filters verified active templates | Template-match and unmatched unit tests; E2E attaches templates |
| Unmatched candidates remain unresolved and unscheduled | PASS | `NEEDS_CLINICAL_VERIFICATION`, unresolved UI, active-task planner filter | Unmatched unit test; proposed plan E2E completes with unresolved candidate retained |
| Factual confirmations persist | PASS | `PatientFactConfirmation` and `/api/onboarding/facts` | Full onboarding E2E saves confirmation defaults |
| Typed Talk-it-through input is reviewed as Life Map data only | PASS | Persisted source text and deterministic Life Map draft; review context on Life Map | Type/build verification and manual implementation inspection |
| Life Map changes persist | PASS | Existing editor extended for onboarding; `/api/life-map` creates initial proposal | Existing Life Map E2E and full onboarding E2E |
| Existing deterministic planner creates the initial proposal | PASS | `createInitialProposedPlan` calls the Milestone 3 planner | Planner unit suite and full onboarding E2E |
| Preview uses proposed plan data and acceptance is transactional | PASS | Preview route/UI and `acceptProposedPlan`; prior active plan superseded, completion and audit persisted | Full onboarding E2E accepts and refreshes |
| Today, Care Plan, refresh, and root redirect use accepted state | PASS | Data-backed patient screens and persisted root redirect | Full onboarding E2E verifies Today after refresh and root redirect |
| Reset restores fresh onboarding state | PASS | Updated seed leaves templates inactive and no active plan | `npm run db:reset`; E2E resets before each flow |
| Required quality gates pass | PASS | Strict TypeScript, lint, Vitest, Playwright, production build | Final command log recorded in milestone handoff |

Milestone 5 features are intentionally out of scope.

> Superseded verification: live OpenAI extraction was subsequently tested
> during final acceptance. See `FINAL_ACCEPTANCE_AUDIT.md`.
