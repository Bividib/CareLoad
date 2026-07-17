# CareLoad Remaining Work Audit and Release-Closure Plan

> Closure note (17 July 2026): this file records the pre-closure baseline.
> Action results supersede its counts and current-state statements; see
> `RELEASE_CLOSURE_STATUS.md` and `DEPENDENCY_AUDIT.md`.

**Audit date:** 17 July 2026
**Purpose:** Reconcile all supplied CareLoad milestone, acceptance, demo, UI, and submission Markdown files into one authoritative statement of what is complete, what remains unverified, and what work should still be performed before submission.

## 1. Executive conclusion

CareLoad does **not** appear to have any remaining product-feature milestone.

The supplied documentation states that:

- Milestones 1–8 are complete.
- The full patient-only workflow passes automated end-to-end testing.
- The deterministic planner and Care Plan Stress Test are implemented.
- Functional onboarding, source-grounded document extraction, Daily Signal, delayed simulated responses, plan simulation, and versioned acceptance are implemented.
- The no-key fixture path works.
- Live OpenAI document and Daily Signal extraction have been tested successfully.
- The final status is **READY WITH KNOWN LIMITATIONS**.
- There are no open P0 or P1 defects recorded.

Therefore, the next work should **not** be another feature-building milestone. It should be a narrowly scoped release-closure pass covering:

1. Real microphone verification.
2. Dependency-advisory triage.
3. Non-fatal Next.js warning investigation.
4. Live-AI latency handling and demo-mode confirmation.
5. Documentation reconciliation.
6. Fresh-environment and manual rehearsal evidence.
7. Git, secrets, screenshots, recording, and submission preparation.

Do not add new product features unless a final verification step exposes a genuine demo-blocking defect.

---

# 2. Documents audited

The following supplied files were reconciled:

- `DEMO_CHECKLIST.md`
- `FINAL_ACCEPTANCE_AUDIT.md`
- `FINAL_DEMO_RUNBOOK.md`
- `IMPLEMENTATION_STATUS.md`
- `MILESTONE_1_3_AUDIT.md`
- `MILESTONE_4_AUDIT.md`
- `MILESTONE_5_AUDIT.md`
- `MILESTONE_6_AUDIT.md`
- `MILESTONE_7_AUDIT.md`
- `MILESTONE_8_AUDIT.md`
- `SUBMISSION_CHECKLIST.md`
- `UI_REFERENCE_MAP.md`

The audits collectively contain:

- 121 recorded `PASS` results;
- 2 recorded `NOT TESTED` results;
- 1 recorded `FAIL`.

The non-pass items are:

1. Real browser microphone capture was not tested with physical microphone hardware.
2. Two additional manual browser rehearsals were not recorded.
3. `npm audit` reports five dependency advisories.

---

# 3. Reconciled implementation status

## 3.1 Milestone 1 — Foundation

**Status: Complete**

Recorded capabilities include:

- Next.js App Router.
- Strict TypeScript.
- Prisma and SQLite.
- Deterministic Eleanor seed.
- Repeatable database reset.
- Route structure.
- Vitest and Playwright setup.
- Synthetic-data boundary.
- Patient-only architecture.

No remaining Milestone 1 implementation is indicated.

## 3.2 Milestone 2 — Patient UI

**Status: Complete**

Recorded capabilities include:

- All 12 visual references mapped.
- Shared 390–430 px mobile shell.
- Consistent five-item bottom navigation.
- Today, Care Plan, Life Map, Messages, onboarding, Daily Signal, and update states.
- Accessibility and overflow testing at both required mobile widths.

No remaining Milestone 2 feature is indicated.

## 3.3 Milestone 3 — Deterministic planner

**Status: Complete**

Recorded capabilities include:

- Recurrence expansion.
- Fixed-first placement.
- Flexible scheduling inside approved windows.
- Protected anchors.
- Location and equipment constraints.
- Delegation.
- Bundling.
- Metrics and explanations.
- `NEEDS_CLARIFICATION` conservation rule.
- Proposed-versus-active plan boundary.
- No OpenAI dependency in planner code.

No remaining Milestone 3 feature is indicated.

## 3.4 Milestone 4 — Onboarding and document extraction

**Status: Complete**

Recorded capabilities include:

- Persisted consent.
- Multiple onboarding sources.
- Safe PDF, TXT, and Markdown upload.
- Three fictional sample PDFs.
- Server-side OpenAI Responses API extraction.
- Structured schema validation.
- Deterministic no-key fallback.
- Source quotes, confidence, uncertainty, and provenance.
- Deterministic verified-template matching.
- Unmatched task preservation.
- Life Map confirmation.
- Initial plan preview and acceptance.
- Redirect and refresh persistence.

The milestone audit originally stated that a live request was not tested because no key was available. The later final acceptance audit supersedes this and reports successful live `gpt-5` PDF extraction.

No remaining Milestone 4 feature is indicated.

## 3.5 Milestone 5 — Daily Signal

**Status: Functionally complete; one real-device verification remains**

Recorded capabilities include:

- Typed Daily Signal.
- Exact raw text persistence.
- Browser MediaRecorder implementation.
- Transcription route.
- Editable transcript.
- Typed fallback.
- Personalised stored context.
- Schema-constrained extraction.
- Approved question catalogue.
- Maximum two questions.
- Source evidence and uncertainty.
- Same, Skip, and record-only flows.
- Patient confirmation.
- Deterministic synthetic urgent rule.
- No diagnosis or medication recommendation output.

The final acceptance audit leaves the physical microphone path as `NOT TESTED`.

This is the only recorded unverified product interaction.

## 3.6 Milestone 6 — Delayed simulated messages

**Status: Complete**

Recorded capabilities include:

- Transactional send.
- Persisted due job.
- Four response-job states.
- Due-time enforcement.
- Idempotent processing.
- Polling that stops.
- Deterministic response families.
- Simulated labels.
- Read and unread behaviour.
- Reusable clarification flow.
- Refresh-safe pending state.
- No clinician-facing application.

No remaining Milestone 6 feature is indicated.

## 3.7 Milestone 7 — Care Plan Stress Test

**Status: Complete**

Recorded capabilities include:

- Synthetic cardiology update.
- Twice-daily, 14-day recurrence.
- Calculated 28 actions and 140 minutes.
- Proposed-plan isolation.
- Morning and evening windows.
- Legal moves, bundling, and delegation.
- Persisted unresolved work.
- Metrics and explanations.
- Delayed clarification reuse.
- Preview.
- Transactional acceptance.
- Updated Today and Care Plan.
- No AI-based clinical scheduling decisions.

No remaining Milestone 7 feature is indicated.

## 3.8 Milestone 8 — Demo hardening

**Status: Complete**

Recorded capabilities include:

- Fresh reset and onboarding.
- Complete typed Daily Signal flow.
- Refresh-safe delayed response.
- Stress Test preview and acceptance.
- Eight presenter checkpoints.
- Complete no-key fixture coverage.
- Input-preserving errors.
- Honest loading states.
- Accessibility and responsive shell.
- Patient-only safety boundary.
- Complete documentation.
- Ten passing Playwright tests across both target widths.

No remaining Milestone 8 feature is indicated.

---

# 4. Remaining work overview

| Priority | Work item | Type | Current evidence | Required outcome |
|---|---|---|---|---|
| P0 | None currently recorded | — | Final audit reports no P0 findings | Do not invent work |
| P1 conditional | Test real microphone and live transcription | Verification / possible bug fixing | Implemented but physical hardware not tested | One successful real recording, transcript, edit, analysis, and fallback test |
| P1 operational | Complete three manual fixture rehearsals | Manual release validation | Automated flow passed; rehearsals not recorded | Three complete timed runs with defects logged |
| P1 operational | Fresh-machine or fresh-clone reproducibility | Release validation | Fresh migration/seed tested; clean-clone evidence not explicit | Clean install, env setup, reset, build, and demo start |
| P2 | Triage five dependency advisories | Security maintenance | `npm audit` fails | Upgrade safe dependencies or document accepted residual risk |
| P2 | Investigate Next.js trace warning | Build-tool maintenance | Non-fatal warning recorded | Remove warning or document exact harmless cause |
| P2 | Protect demo from live-AI latency | Reliability | Live calls took about 67 and 76 seconds | Fixture mode is default demo path; optionally add timeout/fallback |
| P2 | Reconcile stale Markdown statements | Documentation | Some milestone-era notes are now outdated | All docs describe final behaviour consistently |
| Release | Complete submission checklist | Submission operations | Every checkbox remains unchecked | Verify and mark each item truthfully |
| Release | Prepare screenshots and backup recording | Submission operations | Not evidenced | Final assets selected and playable |
| Release | Final Git and secret hygiene | Submission operations | Partially audited | Clean status, pushed commit, no secrets/runtime files |
| Release | Record final command results | Submission evidence | Commands passed in audit | Save final timestamped results |

---

# 5. Required task 1 — Test the real microphone path

## Why this remains

The implementation status says browser microphone capture exists and typing is a safe fallback, but physical microphone hardware was unavailable during final automated acceptance.

This should be verified on the exact laptop and browser used for the event.

## Steps

1. Use the current supported Chromium browser.
2. Start from the `DAILY_SIGNAL_READY` checkpoint.
3. Open the Daily Signal screen.
4. Choose Speak.
5. Grant microphone permission.
6. Record this synthetic statement:

   > My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.

7. Stop the recording.
8. Confirm:
   - a valid browser audio file is produced;
   - the upload route accepts the MIME type;
   - the transcription request succeeds;
   - the transcript appears;
   - the transcript is editable;
   - editing does not lose the original draft state;
   - continuing produces the expected structured observations;
   - no more than two approved questions appear.
9. Repeat after denying microphone permission.
10. Confirm the typed fallback is immediate and understandable.
11. Refresh during a saved draft and confirm progress persists.

## Acceptance criteria

- [ ] Chrome or Edge prompts for microphone permission.
- [ ] Recording starts and stops correctly.
- [ ] Timer and controls remain usable.
- [ ] WebM or browser-supported audio is accepted.
- [ ] OpenAI transcription succeeds in live mode.
- [ ] Fixture transcription succeeds in no-key mode.
- [ ] Transcript is editable.
- [ ] Denial produces a clear typed fallback.
- [ ] No audio file remains unnecessarily after transcription.
- [ ] No real patient information is used.
- [ ] Result is recorded in `FINAL_ACCEPTANCE_AUDIT.md`.

## If it fails

Fix only the concrete failure:

- browser MIME mismatch;
- multipart upload issue;
- file-size validation;
- MediaRecorder state handling;
- permissions error handling;
- temporary-file cleanup;
- transcription model configuration.

Do not replace the voice system or add another speech framework unless the current implementation cannot be repaired simply.

---

# 6. Required task 2 — Perform and record three complete rehearsals

## Why this remains

The final acceptance audit marks extra manual browser rehearsals as `NOT TESTED`, while the runbook explicitly asks for three complete fixture rehearsals.

Automated E2E coverage is strong, but it does not prove presenter timing, clarity, or recovery under real interaction.

## Rehearsal procedure

Run the exact fixture-mode demo three times:

1. Reset or seed `INITIAL_PLAN_READY`.
2. Show Today.
3. Complete typed Daily Signal.
4. Answer two questions.
5. Review and send.
6. Show waiting state.
7. Navigate away and back.
8. Show simulated response.
9. Trigger cardiology update.
10. Show +28 actions and unresolved conflict.
11. Preview and accept.
12. Show updated Today.

For one run, deliberately test recovery:

- refresh during response wait;
- use Process response jobs;
- restart from `SIMULATION_READY`.

## Record

Create:

```text
docs/FINAL_REHEARSAL_LOG.md
```

Suggested format:

```markdown
| Run | Mode | Duration | Completed | Recovery used | Defects |
|---|---|---:|---|---|---|
| 1 | Fixture | 03:14 | Yes | None | ... |
| 2 | Fixture | 02:58 | Yes | Refresh during response | ... |
| 3 | Fixture | 03:05 | Yes | SIMULATION_READY checkpoint | ... |
```

## Acceptance criteria

- [ ] Three fixture rehearsals complete.
- [ ] At least one refresh/recovery path is exercised.
- [ ] No P0 defect occurs.
- [ ] Any P1 defect is fixed and rerun.
- [ ] Demonstration can be delivered without reading developer notes.
- [ ] Results are added to the final audit.
- [ ] The submission checklist item is marked complete.

---

# 7. Required task 3 — Verify fresh-clone reproducibility

## Why this is useful

The documents prove clean database reset, migrations, build, and testing. They do not explicitly prove setup from a new clone with no existing modules, database, generated files, or local environment.

## Steps

Use a clean directory or temporary clone.

1. Clone or copy the repository without:
   - `node_modules`;
   - `.next`;
   - database file;
   - uploads;
   - audio recordings;
   - `.env`.
2. Follow only `README.md`.
3. Create the environment file from `.env.example`.
4. Use fixture mode.
5. Run:

```bash
npm install
npm run db:reset
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run dev
```

6. Open `/demo`.
7. Seed `INITIAL_PLAN_READY`.
8. Verify the patient application loads.

## Acceptance criteria

- [ ] README is sufficient without hidden knowledge.
- [ ] No undeclared global dependency is required.
- [ ] Database directory and file are created correctly.
- [ ] Sample documents are present.
- [ ] Fixture mode requires no OpenAI key.
- [ ] All quality gates pass.
- [ ] Application starts.
- [ ] Any platform-specific command is documented for Windows.

---

# 8. Required task 4 — Dependency-advisory triage

## Current state

The final audit records five upstream advisories:

- two moderate;
- three high.

The documentation says none is exercised by the local synthetic demo path, but `npm audit` still fails.

## Instructions

Run:

```bash
npm audit --json
npm outdated
```

For each advisory, document:

- package;
- direct or transitive dependency;
- severity;
- vulnerable range;
- patched version;
- whether runtime or development-only;
- whether reachable in CareLoad’s demo path;
- whether a non-breaking upgrade exists.

## Remediation policy

1. Apply safe patch or minor upgrades first.
2. Run all quality gates after each dependency group.
3. Do not run `npm audit fix --force` blindly.
4. Do not introduce a breaking Next.js, Prisma, React, or testing upgrade hours before submission unless required.
5. If an advisory cannot safely be resolved, record a time-bounded risk acceptance.

Create or update:

```text
docs/DEPENDENCY_AUDIT.md
```

Suggested table:

```markdown
| Package | Severity | Direct? | Demo reachable? | Fix available? | Action |
|---|---|---|---|---|---|
```

## Acceptance criteria

One of the following is required:

### Preferred

- [ ] `npm audit` has no high-severity finding.
- [ ] All tests and build still pass.

### Acceptable for hackathon

- [ ] Every remaining advisory is documented.
- [ ] None is exposed through the demonstrated synthetic local path.
- [ ] No safe non-breaking upgrade is available.
- [ ] Risk is explicitly accepted for the prototype.
- [ ] The final audit no longer leaves the result unexplained.

---

# 9. Required task 5 — Investigate the Next.js trace warning

## Current state

Milestone 8 and final acceptance mention a non-fatal production trace warning.

## Steps

1. Run a clean build:

```bash
rm -rf .next
npm run build
```

Use the Windows equivalent where required.

2. Capture the complete warning.
3. Identify:
   - affected route or dependency;
   - whether the warning is caused by a dynamically resolved file;
   - whether Prisma, uploaded files, SQLite, or fixture paths are involved;
   - whether the warning changes deployed output;
   - whether the warning appears only in local tracing.

4. Apply a small, documented fix if one exists.
5. Rebuild and rerun the demo.
6. If no safe fix exists, document why it is harmless for the local demonstration.

## Acceptance criteria

- [ ] Exact warning is recorded.
- [ ] Root cause is identified or bounded.
- [ ] It does not hide a missing runtime asset.
- [ ] It does not affect fixture files, Prisma, PDFs, or the database.
- [ ] Build succeeds.
- [ ] Result is documented in the final audit.

---

# 10. Required task 6 — Confirm live-AI latency strategy

## Current state

The final implementation status reports approximately:

- 67 seconds for live document extraction;
- 76 seconds for live Daily Signal extraction.

That is too slow for the primary short demo.

Fixture mode is already the recommended presentation path and has complete end-to-end coverage.

## Mandatory decision

Use fixture mode for the timed live presentation unless organisers explicitly require live model inference.

Recommended demo configuration:

```text
DEMO_AI_FALLBACK=true
DEMO_RESPONSE_DELAY_MS=10000
```

## Optional implementation hardening

Only implement this if there is enough time and it can be tested safely:

- Add `DEMO_AI_TIMEOUT_MS`.
- Abort or stop waiting after a bounded duration.
- Preserve all patient input.
- Offer:
  - Retry live AI;
  - Use demo extraction.
- Never silently switch while claiming a live result.
- Show the current processing mode on `/demo`.

Do not spend significant time trying multiple models solely to reduce latency unless the event credits expose an approved faster model and output quality remains adequate.

## Acceptance criteria

- [ ] Fixture mode is the default rehearsal path.
- [ ] The presenter knows how to toggle modes.
- [ ] Live mode has been tested once with event credentials where possible.
- [ ] Slow live AI cannot block the final demonstration.
- [ ] Fallback does not lose documents or Daily Signal text.
- [ ] The demo narration accurately describes whether the current result is live or fixture-backed.

---

# 11. Required task 7 — Reconcile stale documentation

Several documents describe the state at the time of an earlier milestone and are now outdated.

## Known stale statements

### `UI_REFERENCE_MAP.md`

Update milestone-era notes such as:

- Daily Signal described as static from Milestones 1–3.
- Send action described as a later non-functional affordance.
- Care-update metrics described as fixtures until the simulation milestone.
- Updated-plan preview described as later functionality.

These features are now implemented according to later audits.

Keep the safety clarifications, including:

- simulated care-team response;
- synthetic verified tasks;
- active plan changes only after acceptance;
- work begins at the authoritative seeded time rather than the image time.

### Earlier milestone audit notes

`MILESTONE_4_AUDIT.md` and `MILESTONE_5_AUDIT.md` state live AI was not tested at that point.

Do not rewrite historical evidence deceptively. Add a small note such as:

> “Superseded verification: live extraction was subsequently tested during final acceptance; see `FINAL_ACCEPTANCE_AUDIT.md`.”

### Script naming

The documents use both:

```text
npm run typecheck
npm run typecheck
```

Determine the actual package script and use one name consistently in:

- README;
- demo checklist;
- runbook;
- audits;
- generated prompts.

### Environment-file naming

Confirm whether the project uses:

- `.env`;
- `.env.local`;
- both.

Document the actual supported setup consistently.

## Acceptance criteria

- [ ] UI map describes current functionality.
- [ ] Historical audits remain honest but point to superseding verification.
- [ ] Command names match `package.json`.
- [ ] Environment instructions match runtime behaviour.
- [ ] No documentation implies a real clinician connection.
- [ ] No documentation encourages real medical-data upload.
- [ ] README, runbook, checklist, and status agree.

---

# 12. Required task 8 — Complete the submission checklist

The supplied `SUBMISSION_CHECKLIST.md` has every item unchecked, even where other files provide evidence.

Do not mark items automatically without checking the current repository and presentation environment.

## Checklist reconciliation

### Repository and code

- [ ] Repository clean.
- [ ] Final commit pushed.
- [ ] README checked.
- [ ] `.env` and secrets excluded.
- [ ] Runtime uploads excluded.
- [ ] Recordings excluded.
- [ ] Database journals excluded.
- [ ] Temporary files excluded.
- [ ] Final commands recorded.

### Product and safety

- [ ] Synthetic-data disclaimer visible.
- [ ] Fixture mode tested.
- [ ] Live mode tested where possible.
- [ ] Reset tested twice.
- [ ] Presenter controls available.

### Presentation

- [ ] Screenshots selected.
- [ ] Backup video prepared.
- [ ] Three rehearsals complete.
- [ ] Browser notifications disabled.
- [ ] Unnecessary tabs closed.
- [ ] Charger connected.

## Important

Some items are machine-state or event-day tasks and should remain unchecked until actually completed.

---

# 13. Recommended final Codex task

Use the following scope for the final implementation agent:

```text
Perform release closure only.

Read:
- AGENTS.md
- IMPLEMENTATION_STATUS.md
- FINAL_ACCEPTANCE_AUDIT.md
- CARELOAD_REMAINING_WORK_AUDIT.md
- FINAL_DEMO_RUNBOOK.md
- SUBMISSION_CHECKLIST.md

Do not add product features.

Complete these tasks in order:
1. Test the real microphone path on available hardware.
2. Reproduce and triage npm audit advisories.
3. Reproduce the Next.js trace warning.
4. Reconcile stale documentation.
5. Verify a clean-clone setup in fixture mode.
6. Run the full quality-gate suite.
7. Create FINAL_REHEARSAL_LOG.md, but do not fabricate manual rehearsal results.
8. Update FINAL_ACCEPTANCE_AUDIT.md and IMPLEMENTATION_STATUS.md truthfully.
9. Update SUBMISSION_CHECKLIST.md only for items actually verified.

For every code change:
- add or update tests;
- run lint, type-check, tests, build, and E2E;
- avoid breaking dependency upgrades;
- preserve fixture fallback;
- preserve the patient-only safety boundary.

Do not implement:
- clinician UI;
- authentication;
- new conditions;
- new AI agents;
- real NHS integration;
- wearable integration;
- new planning features;
- architecture rewrites.

Return:
- defects found;
- defects fixed;
- unresolved risks;
- command results;
- exact files changed;
- final readiness status.
```

---

# 14. Final quality-gate sequence

Run from the repository root:

```bash
npm run db:reset
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm audit
```

Then manually verify:

1. Fresh onboarding.
2. Initial plan acceptance.
3. Typed Daily Signal.
4. Real microphone Daily Signal.
5. Microphone-denied fallback.
6. Delayed response with refresh.
7. Care update.
8. Stress Test.
9. Clarification.
10. Plan acceptance.
11. Updated Today.
12. Fixture mode without a key.
13. Live mode once, if connectivity and credits allow.
14. Reset checkpoints.

---

# 15. Do not implement

The documentation gives no evidence that the following are required before submission:

- clinician dashboard;
- clinician authentication;
- patient accounts;
- multiple patient profiles;
- real NHS records;
- real prescription integration;
- real urgent-care routing;
- autonomous diagnosis;
- autonomous medication changes;
- social or community features;
- rewards or gamification;
- wearable integration;
- LangGraph or multi-agent orchestration;
- a second planner;
- arbitrary multimorbidity support;
- production deployment architecture.

Adding these now would increase risk without strengthening the demonstrated core.

---

# 16. Final readiness decision

## Current documentary status

**READY WITH KNOWN LIMITATIONS**

## Product implementation remaining

No documented core feature remains unimplemented.

## Verification remaining

- real physical microphone path;
- three manual fixture rehearsals;
- fresh-clone reproducibility evidence.

## Technical cleanup remaining

- five dependency advisories;
- one non-fatal Next.js trace warning;
- live-AI latency strategy;
- stale documentation reconciliation.

## Submission work remaining

- Git and secret hygiene;
- screenshots;
- backup recording;
- checklist completion;
- final push and rehearsal.

The correct next move is a controlled release-closure session, not another product milestone.
