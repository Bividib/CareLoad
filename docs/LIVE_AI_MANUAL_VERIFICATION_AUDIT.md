# CareLoad Live AI Manual Verification Audit

## 1. Executive verdict

- Commit: `56bb47fdc49d91a1164116246b66cf68a95435d5`
- Date: 18 July 2026, 02:33–03:45 BST
- Browser: current Chromium in the Codex in-app browser
- Viewport: primary `390 × 844`; critical accepted-plan screen repeated at `430 × 932`
- OpenAI text model: `gpt-5`
- OpenAI transcription model: environment override unset; route default is `gpt-4o-mini-transcribe`
- Effective fixture mode: OFF during attempted live calls and the Stress Test
- Final status: **NOT READY**

The timed live-AI demo is not ready. Both attempted live text-model workflows failed almost immediately: document extraction returned an HTTP 200 envelope with all three document results failed in 319 ms server time, and Daily Signal extraction returned HTTP 502 in 127 ms. Neither was a timeout and neither silently fell back to fixture data. Physical microphone verification could not progress because the in-app Chromium surface did not expose a permission decision or begin recording.

The deterministic Care Plan Stress Test was independently exercised from a documented recovery checkpoint. It preserved the old active plan until acceptance, activated the proposed plan only after acceptance, and persisted valid 07:00 and 17:00 blood-pressure placements. However, the UI omitted the required 28-action/140-minute impact, did not expose a keep-current action, returned an irrelevant canned clarification response, and clipped content at both required mobile widths.

No application code was changed during this audit. The only tracked file added by the verifier is this report. The working tree was already dirty before verification.

## 2. Environment evidence

### Git status

Starting commit:

```text
56bb47f Merge pull request #1 from Bividib/dev
```

Starting tree state: **dirty**. The following changes existed before this audit and were preserved:

```text
 M app/globals.css
 M app/onboarding/[step]/page.tsx
 M app/patient/messages/[threadId]/today/page.tsx
 M app/patient/updates/[changeId]/page.tsx
 M app/patient/updates/[changeId]/preview/page.tsx
 M components/MessagingClient.tsx
 M components/OnboardingScreens.tsx
 M components/OnboardingSources.test.tsx
 M components/PatientScreens.tsx
 M components/StressTestActions.tsx
 M domain/messages/responses.ts
 M next.config.ts
 M package-lock.json
 M tests/e2e/complete-demo.spec.ts
 M tests/e2e/smoke.spec.ts
 M tests/messages/responses.test.ts
?? app/onboarding/loading.tsx
?? app/patient/loading.tsx
?? app/patient/updates/[changeId]/clarify/
?? components/UpdateScreen.tsx
```

Recent history:

```text
56bb47f Merge pull request #1 from Bividib/dev
885f44d fix: complete Daily Signal outcome screens
c7cf07f fix: correct Daily Signal sharing and monitoring flows
4b9f342 fix: close CareLoad release and submission risks
db08cee fix: complete final CareLoad acceptance and demo hardening
```

### Server command

```text
npm run dev
```

Next.js 16.2.10 reported ready in 1.309 seconds.

### Base URL

```text
http://localhost:3000
```

### Environment settings without secret values

```text
OPENAI_API_KEY=<present, redacted>
OPENAI_TEXT_MODEL=gpt-5
OPENAI_TRANSCRIPTION_MODEL=<unset; route default gpt-4o-mini-transcribe>
DEMO_AI_FALLBACK=false
DEMO_AI_TIMEOUT_MS=25000
DEMO_RESPONSE_DELAY_MS=10000
```

The ignored local `.env` initially contained `DEMO_AI_FALLBACK=true`. It was explicitly changed to `false` as test setup before server launch. No key value was printed, copied, exposed to the browser, or included in a screenshot.

### Proof that fixture mode was off

- `/demo` visibly stated **Current AI processing mode: live OpenAI** after the persisted presenter toggle was turned off.
- The toggle then read **Turn fixture mode on**, proving the persisted state was off.
- `/api/daily-signals/extract` returned HTTP 502 instead of a fixture result.
- The document-processing UI offered **Use demo extraction** only after the live attempt failed; it was not selected.
- The typed Daily Signal UI offered **Use demo extraction** only after the live attempt failed; it was not selected.
- The Stress Test was triggered while `/demo` still showed the toggle as **Turn fixture mode on**.

### Console baseline

The in-app browser console had no warning or error entries before testing and remained empty after the document, Daily Signal, microphone, messaging, and Stress Test checks.

### Network baseline

The in-app browser surface did not provide a stable Network-panel export. Route, status, and server duration were therefore taken from the live Next.js terminal while all initiating actions were performed in the browser UI. This limitation is called out rather than substituting scripted endpoint calls.

### Screenshot evidence

Screenshots were captured as in-app browser image attachments during this audit. The browser connector returned embedded images without stable workspace paths, so evidence is referenced by descriptive attachment name:

1. `live-mode setup evidence` — `/demo` states live OpenAI.
2. `onboarding welcome screen` — 390 px welcome page and disabled consent state.
3. `onboarding explanation` — modal content.
4. `simulated record evidence` — fictional medication list.
5. `upload safety warning` — real-data warning and selected samples.
6. `live extraction progress` — named stages and all-document failure banner.
7. `live Daily Signal failure` — exact input preserved after HTTP 502.
8. `microphone result` — voice screen remained at “Tap to record”.
9. `care update notification` — update banner and old active schedule.
10. `original cardiology instruction` — expanded instruction.
11. `simulated clarification response` — submitted conflict and unrelated cuff-position response.
12. `updated plan preview` — windows and affected dates.
13. `unresolved conflict and acceptance control` — visible unplaced occurrence.
14. `original plan before acceptance` — no new BP task in the active plan.
15. `accepted updated plan` and `accepted plan after refresh` — new BP work persisted.
16. `accepted Care Plan schedule` and `evening accepted schedule` — 07:00 and 17:00 occurrences.
17. `accepted Today at 430×932` — visible right-edge clipping.

## 3. Flow summary

| Flow | Status | Live AI confirmed | Persistence passed | Main finding |
|---|---|---|---|---|
| 1. Onboarding and documents | FAIL | Attempted live; all documents failed | Consent and source narrative persisted; failed banner did not | `/api/documents/extract` returned 200 with three failed results in 319 ms |
| 2. Typed Daily Signal sharing | FAIL | Attempted live; HTTP 502 | Input stayed in the browser during failure | `/api/daily-signals/extract` failed in 127 ms; no review/disposition/message could be reached |
| 3. Voice and record only | BLOCKED | No transcription request occurred | Not testable | Start recording exposed no permission prompt, timer, error, or recording state |
| 4. Life Map replanning | BLOCKED | N/A for planning | Not testable end to end | Recovery active plan initially had no Today moments; native time fields could not be changed through the available manual browser surface |
| 5. Care update Stress Test | PARTIAL | N/A for planning | PASS for clarification and accepted-plan persistence | Isolation/acceptance worked, but impact metrics and relevant clarification did not |

## 4. Flow 1 detailed record

### Step-by-step record

| Step | Action | Expected | Observed | Status | Evidence |
|---|---|---|---|---|---|
| 1 | Open `/demo`, turn fixture mode off | Effective mode is live | `/demo` stated live OpenAI; toggle changed to “Turn fixture mode on” | PASS | Attachment 1 |
| 2 | Select Reset database | Clean synthetic state | Reset route returned 200 in 508 ms | PASS | Server log |
| 3 | Open `/` | Redirect to welcome | Redirected to `/onboarding/welcome` | PASS | Browser URL |
| 4 | Inspect Get started before consent | Disabled | Disabled | PASS | Attachment 2 |
| 5 | Open Learn how it works | Explain synthetic data, confirmation, Life Map, acceptance | All four concepts visible | PASS | Attachment 3 |
| 6 | Close modal, select consent, Get started | Consent saved; source selection opens | `/api/onboarding/consent` 200; build screen opened | PASS | Browser and server log |
| 7 | Connect health record | Clearly simulated | “Riverside Health demo record”; no real service contacted | PASS | Attachment 4 |
| 8 | Use sample document | Fictional medication list appears | `diabetes-medication-list.pdf` appeared | PASS | Attachment 4 |
| 9 | Save record | Return with source complete | Returned to build screen | PASS | Browser |
| 10 | Open Talk it through and type supplied text | Persist Life Map-only narrative | Exact text accepted and saved | PASS | Browser |
| 11 | Reopen Talk it through | Text persists | Exact supplied text remained | PASS | Browser DOM |
| 12 | Open Upload documents | Real-data warning visible | “Never upload real patient information” visible | PASS | Attachment 5 |
| 13 | Use all three sample documents | Three synthetic files appear | Cardiology, diabetes, and GP files appeared | PASS | Browser DOM |
| 14 | Save and Continue | Processing page opens | Opened `/onboarding/processing` | PASS | Browser |
| 15 | Select Start extraction | Live request; no fixture | Live path attempted; no fallback control selected | PASS | Server environment and post-failure fallback control |
| 16 | Observe processing stages | Named stages visible | Uploading, reading, finding candidates, linking sources, preparing review visible | PASS | Attachment 6 |
| 17 | Observe extraction response | All documents extract and navigate to review | Route returned 200 in 319 ms, but all three documents failed | FAIL | Attachment 6; server log |
| 18 | Refresh failed processing page | Failure remains understandable | Failure banner disappeared; page returned to initial extraction state | FAIL | Refreshed processing attachment |
| 19 | Inspect five candidates | At least five source-grounded candidates | No candidates produced | BLOCKED | Upstream failure |
| 20 | Edit Life Map and generate initial preview | Deterministic proposal | Not reachable | BLOCKED | Upstream failure |
| 21 | Accept and refresh active plan | Active plan persists | Not reachable through Flow 1 | BLOCKED | Upstream failure |

### Extraction request

| Field | Observed |
|---|---|
| Route | `POST /api/documents/extract` |
| Start | 2026-07-18 02:33:27.768 BST browser clock context |
| HTTP status | 200 |
| Server duration | 319 ms |
| Intended mode | LIVE |
| Fixture used | No fallback was selected; environment forced fixtures off |
| Retry | None observed |
| Timeout | No |
| Input preservation | Documents remained selected, but failure banner did not survive refresh |
| Result | Three failed document results; no validated extraction |

The route hides the underlying exception inside per-document failure objects and returns an HTTP 200 envelope. The visible UI collapses all reasons into “could not be extracted,” so model availability, authentication, file handling, and schema failures cannot be distinguished from the manual evidence.

### Candidate-task table

No task row could be inspected because live extraction produced no candidates.

| Requested field | Observed |
|---|---|
| Candidate count | 0 produced |
| Matched templates | Not available |
| Unresolved candidates | Not available |
| Hallucinated information | None observed because no model output reached the UI |
| Model used | Configured `gpt-5`; request failed before validated output |

### Initial scheduling table

Not reachable. No initial plan metrics or rule-by-rule placements may be claimed as passed.

### Flow 1 result

**FAIL.** Pre-extraction onboarding was manually usable and clearly synthetic, but the defining live extraction and deterministic-plan handoff could not complete.

## 5. Flow 2 detailed record

Because Flow 1 could not produce an active plan, `/demo` `DAILY_SIGNAL_READY` was used only as a documented recovery prerequisite. This does not change Flow 1’s status.

### Exact input

> My stomach has felt very uncomfortable for three days and it is worse today. It is affecting my normal activities, but I am still eating and drinking.

### Step record

| Step | Action | Expected | Observed | Status |
|---|---|---|---|---|
| 1 | Open Today, select Check in, Type | Typed input screen | Opened successfully | PASS |
| 2 | Enter exact text | Text preserved | Exact text visible | PASS |
| 3 | Select Review what CareLoad understood | Live extraction and review | HTTP 502; remained on input | FAIL |
| 4 | Inspect error recovery | Input retained; fallback explicit | Exact text remained; explicit “Use demo extraction” appeared | PASS |
| 5 | Inspect observation/evidence/questions | Stomach, worse, three days, activity impact, max two approved questions | No extraction result | BLOCKED |
| 6 | Confirm answers and disposition | Deterministic `SHARE_SUGGESTED` | Not reachable | BLOCKED |
| 7 | Send and inspect Messages | Persisted patient message and delayed response | Not reachable without using fixture extraction | BLOCKED |

### Live request

| Field | Observed |
|---|---|
| Route | `POST /api/daily-signals/extract` |
| Start | 2026-07-18 02:35:08.836 BST browser clock context |
| Status | 502 |
| Server duration | 127 ms |
| Intended model | `gpt-5` |
| Fixture used | No |
| Retry | None observed |
| Timeout | No |
| Input preserved | Yes |
| Visible error | “Daily Signal analysis failed. Your text is still in this browser; retry or use demo extraction.” |

### Observations, questions, answers, and disposition

None were generated. It would be false to infer them from fixtures or tests.

### Message persistence

Not testable from this flow. No patient message or response job was created by the failed live request.

### Flow 2 result

**FAIL.** The live interpretation boundary failed before the review screen.

## 6. Flow 3 detailed record

### Microphone result

1. Opened Daily Signal.
2. Selected **Speak**.
3. Selected **Start recording**.
4. The UI remained at “Tap to record.”
5. No permission prompt became available in the controlled Chromium tab.
6. No timer appeared.
7. No Stop recording control appeared.
8. No error appeared.
9. The browser console remained empty.
10. No `/api/audio/transcribe` request occurred.

No audio was captured, stored, uploaded, or transcribed.

### Requested branches

| Branch | Result | Status |
|---|---|---|
| Physical microphone and live transcription | Permission/capture could not begin | BLOCKED |
| Transcript correction | No transcript | BLOCKED |
| Live energy interpretation | No transcription or text extraction | BLOCKED |
| Record-only disposition | Not reachable | BLOCKED |
| Return to Today with no message | Not reachable | BLOCKED |
| Send anyway | Not reachable | BLOCKED |
| Permission denied | No permission decision surface was exposed | BLOCKED |

### Transcription inventory

| Field | Observed |
|---|---|
| Route | No request |
| MIME type | Not produced |
| File size | 0 / not produced |
| Status | N/A |
| Duration | N/A |
| Model | Route default would be `gpt-4o-mini-transcribe` |
| Live | Not established |

### Flow 3 result

**BLOCKED.** This is a test-environment limitation plus a UX concern: a pending or unavailable permission request left the screen unchanged with no explanatory state.

## 7. Flow 4 detailed record

### Before edit

The recovered active state initially showed verified tasks in Care Plan but no Today care moments. Today displayed:

> Your generated care moments will appear after reset completes.

The expected action, moment, unresolved, and start-time baseline was therefore unavailable. After the later Stress Test trigger regenerated plans, Today did show normal schedule items; that later state was not substituted for the required Flow 4 baseline.

### Manual edit attempts

1. Opened `/patient/life-map`.
2. Verified existing School run `07:30–08:15`, Part-time work `08:30–14:00`, Granddaughter care `15:00–18:30`, and Evening walk `19:00–19:30`.
3. Attempted to change School run to `07:20`.
4. Direct editing of the native Chromium time control either cleared the controlled field or left `07:30` unchanged.
5. Reloaded to restore the original value rather than save corrupt input.
6. Selected **Add another routine**.
7. Entered **Lunch break**.
8. The new routine defaulted to `12:00–12:30`.
9. Attempts to change the native times to `12:30–13:00` did not change the values.
10. No save was submitted with incorrect times.
11. No API endpoint or script was used to bypass the UI.

### Before-and-after schedule table

| Task | Before | Proposed | Accepted | Fixed/flexible | Valid window | Result |
|---|---|---|---|---|---|---|
| All active tasks | No Today moments rendered in recovery state | Not generated | Not generated | Not inspectable | Not inspectable | BLOCKED |

### Deterministic boundary

No OpenAI scheduling call was observed. The relevant implementation path is local `/api/life-map` plus deterministic plan generation, but the browser workflow could not reach save/proposal review with the requested values.

### Flow 4 result

**BLOCKED.** Active-plan isolation, proposal persistence, moved-task validation, and acceptance were not personally observed and are not marked passed.

## 8. Flow 5 detailed record

### Step record

| Step | Expected | Observed | Status |
|---|---|---|---|
| Confirm fixture mode off | Live toggle off | `/demo` showed “Turn fixture mode on” | PASS |
| Trigger synthetic update | Persisted cardiology update | `POST /api/care-plan-changes/trigger` 200 in 349 ms | PASS |
| Today update notification | Cardiology badge/banner | Badge and “New update from cardiology” appeared | PASS |
| Expand original instruction | Recurrence, windows, duration, cuff, no delegation | Recurrence, windows, duration and cuff visible; no non-delegation statement | PARTIAL |
| Review impact | 28 actions, 140 minutes, interruption/conflict metrics | None of these metrics were displayed | FAIL |
| Keep current branch | Explicit keep-current action | No such control on update or preview | FAIL |
| Active isolation before accept | Old plan remains active | Old Today contained no twice-daily BP task | PASS |
| Ask for clarification | Conflict-specific patient message and delayed job | Patient conflict text persisted; response arrived after polling | PASS |
| Clarification response | Address operational conflict | Response gave cuff-position instructions and did not address timing conflict | FAIL |
| Preview windows | Morning 07:00–10:00; evening 17:00–20:00 | Both visible with five minutes and home cuff | PASS |
| Unresolved occurrence | Impossible occurrence visible with reason | Thursday 23 July remained visible with generic constraint reason | PASS |
| Preview task conservation | All 28 occurrences and before/after changes inspectable | UI summarized “Every day” and did not expose 28 occurrences or comparison | FAIL |
| Accept update | Activate only now | Accept endpoint returned 200; navigated to Today | PASS |
| Accepted Today | Plan updated banner and new task | Banner visible; BP task at 07:00 | PASS |
| Accepted Care Plan | Morning and evening occurrences | 07:00 and 17:00 occurrences visible | PASS |
| Refresh | Accepted plan persists | Banner and new schedule persisted | PASS |
| Exactly one active plan | One active schedule exposed | UI showed one schedule; database cardinality is not exposed in UI | PARTIAL |

### Workload and acceptance table

| Metric | Expected | Observed | Pass? |
|---|---:|---:|---|
| Added actions | 28 | Not displayed | No |
| Added minutes | 140 | Not displayed | No |
| Morning window | 07:00–10:00 | 07:00–10:00 preview; accepted at 07:00 | Yes |
| Evening window | 17:00–20:00 | 17:00–20:00 preview; accepted at 17:00 | Yes |
| Delegation allowed | No | Not stated in UI | No |
| Active plan changed before acceptance | No | No new twice-daily BP task in old Today | Yes |
| Active plan changed after acceptance | Yes | New 07:00 and 17:00 tasks visible and persistent | Yes |

### Unresolved conflict

The preview showed:

> Thursday 23 July needs review

and:

> All permitted slots overlap a protected anchor, another incompatible task, or a required location. This reading remains visible and has not been omitted.

This is appropriately non-skipping wording, but it is too generic to identify which specific constraint caused the impossible occurrence.

### Clarification result

Submitted:

> The Thursday evening reading conflicts with childcare from 17:00 to 20:00. When should it be taken within the verified window?

Received:

> For this demo measurement, sit quietly for five minutes with your back supported and feet flat. Place the cuff on your bare upper arm, then take the reading as shown in the supplied instructions.

The response was clearly labelled **Care Response Team** and **Dr Ahmed · fictional demo response**, persisted after refresh, and did not duplicate. It did not answer the question and risks implying that the operational conflict was resolved when it was not.

### Persistence and idempotency

- Patient clarification message persisted after refresh.
- Exactly one simulated response was visible after refresh.
- Accepted plan persisted after refresh.
- The update badge disappeared after acceptance.
- “Plan updated today” appeared after acceptance.

### Timing

| Request | Status | Server duration |
|---|---:|---:|
| `POST /api/care-plan-changes/trigger` | 200 | 349 ms |
| `POST /api/clarifications/send` | 200 | 128 ms |
| First clarification thread request/poll window | 200 | 16.660 s |
| `POST /api/care-plan-changes/demo-update/accept` | 200 | 1.555 s |

### Visual result

At both 390 px and 430 px, right-side content was visibly clipped:

- care-update pill text;
- “View plan” action;
- duration badges;
- long status-banner copy.

No browser console errors accompanied the overflow.

### Flow 5 result

**PARTIAL.** The deterministic acceptance boundary and valid windows worked, but the Stress Test does not present enough calculated evidence for the required demo claim, and clarification is semantically wrong.

## 9. OpenAI call inventory

| Route | Purpose | Model | Live/fixture | Status | Duration | Schema valid | Notes |
|---|---|---|---|---:|---:|---|---|
| `POST /api/documents/extract` | Three synthetic documents | `gpt-5` | Live intended; no fixture selected | 200 envelope, all items failed | 319 ms | No output | No retry; no timeout; visible reason generic |
| `POST /api/daily-signals/extract` | Typed stomach update | `gpt-5` | Live; no fixture selected | 502 | 127 ms | No output | Input preserved; no retry; no timeout |
| `POST /api/audio/transcribe` | Physical voice transcript | `gpt-4o-mini-transcribe` default | Not reached | N/A | N/A | N/A | Recording never began |

Measured successful live-AI latency: **none**, because no intended live OpenAI request succeeded.

## 10. Deterministic-boundary audit

| Boundary | Evidence | Result |
|---|---|---|
| Template matching | No live candidates reached matching | BLOCKED |
| Scheduling | Stress Test used only local app routes; no OpenAI call observed | PASS for Flow 5 only |
| Recurrence | Preview stated every day for 14 days; UI did not expose/calculably prove 28 instances | PARTIAL |
| Constraints | 07:00 and 17:00 accepted times were within windows; one impossible occurrence stayed visible | PASS for inspected occurrences |
| Daily Signal disposition | Live extraction failed before answers | BLOCKED |
| Stress Test | Local trigger produced separate proposal and visible unresolved occurrence | PARTIAL |
| Plan acceptance | Old plan unchanged before acceptance; new plan persisted after acceptance | PASS |

No evidence suggested that OpenAI chose a schedule time. No fixed task was observed moving. Full task conservation could not be established from the UI.

## 11. Defects

### P0

No P0 defects were observed.

### P1

#### CL-AI-001 — Live document extraction fails for every source

- Severity: P1
- Flow and step: Flow 1, Start extraction
- Route: `/onboarding/processing`; `POST /api/documents/extract`
- Reproduction:
  1. Set `DEMO_AI_FALLBACK=false`.
  2. Turn persisted fixture mode off.
  3. Reset database.
  4. Add the three sample documents.
  5. Select Start extraction.
- Expected: validated live candidates and navigation to review.
- Actual: all three documents failed in a 200 response after 319 ms.
- Screenshot: attachment `live extraction progress`.
- Console: no errors.
- Request/status: 200; 319 ms; result-level failures.
- Persistence impact: failure banner disappeared after refresh.
- Safety impact: no unsafe output; demo cannot prove source grounding or template matching.
- Likely subsystem: `app/api/documents/extract/route.ts`, `lib/document-extraction.ts`, OpenAI project/model/file compatibility.
- Recommended fix: expose a redacted failure code per document, log a safe server-side diagnostic category, and verify the configured model/file input/structured output path against the supplied project.
- Acceptance criteria: all three sample documents return `mode: LIVE`, schema-valid candidates, source quotes, and persisted `LIVE` extraction mode; no fixture result.
- Regression test: route integration test for live-client success/failure mapping with redacted diagnostic codes; manual event-day live smoke.

#### CL-AI-002 — Live Daily Signal extraction returns HTTP 502 immediately

- Severity: P1
- Flow and step: Flow 2, Review what CareLoad understood
- Route: `/patient/daily-signal`; `POST /api/daily-signals/extract`
- Reproduction: enter the exact stomach text in live mode and select Review.
- Expected: schema-valid stomach observation and approved questions.
- Actual: HTTP 502 in 127 ms.
- Screenshot: attachment `live Daily Signal failure`.
- Console: no errors.
- Request/status: 502; 127 ms.
- Persistence impact: no Daily Signal record created; browser input remained.
- Safety impact: safe failure, but the central live-AI demo cannot continue.
- Likely subsystem: `lib/daily-signal.ts`, OpenAI model/project compatibility, structured response parsing.
- Recommended fix: surface a redacted error category and validate the exact model/schema request with the supplied project.
- Acceptance criteria: exact input yields stomach-domain evidence, `WORSE`, source-supported duration, and at most two catalogue questions in live mode.
- Regression test: mocked SDK integration for validation and error categories plus manual live smoke.

#### CL-PLAN-001 — Recovery active plan initially renders no Today moments

- Severity: P1
- Flow and step: Flow 4 baseline
- Route: `/patient/today`
- Reproduction: load `DAILY_SIGNAL_READY` recovery state and open Today.
- Expected: active initial plan with visible care moments.
- Actual: “Your generated care moments will appear after reset completes.”
- Screenshot: attachment `active plan before Life Map edit`.
- Console: no errors.
- Request/status: Today 200.
- Persistence impact: same empty Today state on navigation; later Stress Test regeneration populated items.
- Safety impact: the patient cannot see scheduled work in an allegedly active plan.
- Likely subsystem: checkpoint/reset plan generation, plan range/task activation, or checkpoint completion sequencing.
- Recommended fix: make checkpoint completion atomic and verify scheduled item count before returning success.
- Acceptance criteria: `DAILY_SIGNAL_READY` always exposes non-empty July 17 care moments immediately and after refresh.
- Regression test: checkpoint integration test asserting one active plan and non-empty scheduled items for the Today date.

#### CL-STRESS-001 — Stress Test omits calculated workload and comparison evidence

- Severity: P1
- Flow and step: Flow 5 impact and preview
- Route: `/patient/updates/demo-update` and `/preview`
- Reproduction: trigger update and open update/preview.
- Expected: 28 added actions, 140 added minutes, interruption before/after, conflicts, moves, bundles, unplaced work.
- Actual: only a prose recurrence summary, two generic window cards, and one conflict banner.
- Screenshot: attachments `original cardiology instruction`, `updated plan preview`, and `unresolved conflict`.
- Console: no errors.
- Request/status: trigger 200.
- Persistence impact: calculated data may exist server-side but is not inspectable through UI.
- Safety impact: judges cannot verify task conservation or that burden was calculated rather than copied.
- Likely subsystem: `components/UpdateScreen.tsx`, simulation-result presentation.
- Recommended fix: render persisted `metricsJson`, before/after plan metrics, moved/bundled item details, and explicit non-delegation.
- Acceptance criteria: UI displays and reconciles 28 actions/140 minutes and all required impact categories before acceptance.
- Regression test: component/integration assertions derived from persisted simulation metrics, not static copy.

#### CL-STRESS-002 — Clarification response ignores the submitted operational conflict

- Severity: P1
- Flow and step: Flow 5 clarification branch
- Route: `/patient/messages/thread-clarification-...`
- Reproduction: ask when the Thursday 17:00–20:00 reading can occur around childcare.
- Expected: predefined response acknowledges unresolved timing conflict or states original window remains required.
- Actual: canned cuff-position instructions.
- Screenshot: attachment `simulated clarification response`.
- Console: no errors.
- Request/status: send 200 in 128 ms; response after persisted polling.
- Persistence impact: irrelevant response persists and may look authoritative.
- Safety impact: can imply resolution while the actual scheduling conflict remains.
- Likely subsystem: `domain/messages/responses.ts`, `lib/simulated-responses.ts`, clarification classification.
- Recommended fix: classify conflict/timing questions to `CLARIFICATION_NO_CHANGE` or a dedicated operational-conflict template; do not use cuff technique as a universal clarification.
- Acceptance criteria: the exact submitted question receives conflict-relevant, clearly fictional wording and explicitly preserves the unresolved occurrence/active plan.
- Regression test: response-family unit test using timing-conflict text plus browser-level message persistence check.

### P2

#### CL-OBS-001 — Live document failures are hidden inside a successful HTTP envelope

- Severity: P2
- Flow: 1
- Route: `POST /api/documents/extract`
- Actual: HTTP 200 despite all items failing; UI shows no failure category.
- Impact: poor demo/operator diagnosis; no safety leak.
- Recommended fix: use a non-2xx response when all documents fail, retain per-item redacted codes for partial failure, and show a safe actionable message.
- Acceptance criteria: operator can distinguish configuration/model, timeout, validation, and file-read categories without raw patient-style content.
- Regression test: all-failed and partial-failed route cases.

#### CL-STATE-001 — Extraction failure state is not refresh-safe

- Severity: P2
- Flow: 1
- Route: `/onboarding/processing`
- Actual: after refresh the failure banner vanished and stages reset.
- Persistence impact: operator loses failure evidence.
- Recommended fix: render persisted document `FAILED` state and redacted reason on initial page load.
- Acceptance criteria: refresh retains each failed filename and retry action.
- Regression test: server-rendered failed-document state.

#### CL-STRESS-003 — No explicit Keep current plan action

- Severity: P2
- Flow: 5 keep-current branch
- Route: update and preview pages
- Actual: only Preview and Ask a question before preview; only Accept in preview.
- Impact: patient choice is less explicit, though navigation away leaves the old plan active.
- Recommended fix: add a clearly labelled “Keep current plan for now” action returning to Today without changing proposal state.
- Acceptance criteria: action preserves active version and leaves update available.
- Regression test: component and route-state test.

#### CL-UI-001 — Right-edge content clips at both required mobile widths

- Severity: P2
- Flows: 5 and cross-flow visual review
- Routes: Today, update, preview, Messages
- Reproduction: inspect at 390×844 or 430×932.
- Actual: update pill, actions, status text, and duration badges extend beyond the visible right edge.
- Persistence impact: none.
- Safety impact: important update wording may be hidden.
- Likely subsystem: `app/globals.css`, mobile shell/card min-width and flex overflow.
- Recommended fix: constrain flex children with `min-width: 0`, allow wrapping, remove fixed/min content widths, and keep badges inside the card.
- Acceptance criteria: `scrollWidth` equals viewport width and all text/actions are visible at 390 and 430 px.
- Regression test: targeted responsive visual assertions in a separate implementation session.

#### CL-MSG-001 — Message framing can imply a real care relationship

- Severity: P2
- Flow: 5 clarification
- Route: Messages
- Actual: subtitle says “Secure messages with your care team” while the author line says “Dr Ahmed · fictional demo response.”
- Safety impact: the fictional label helps, but the headline can still mislead a fast-moving judge.
- Recommended fix: headline with “Simulated messages” or “Fictional Care Response Team”; keep the fictional label adjacent to every response.
- Acceptance criteria: no unqualified “your care team” wording.
- Regression test: wording assertion for Messages header and response author.

### P3

No P3 work is recommended before the demo.

## 12. Remediation plan for the implementation agent

### Work package 1 — Restore live OpenAI compatibility and diagnostics

- Defects addressed: CL-AI-001, CL-AI-002, CL-OBS-001
- Goal: make the two required live `gpt-5` structured requests succeed with the supplied project and fail transparently without fixtures.
- Likely files: `lib/document-extraction.ts`, `lib/daily-signal.ts`, `app/api/documents/extract/route.ts`, `app/api/daily-signals/extract/route.ts`, shared AI error mapping.
- Required behaviour:
  - validate configured model availability at startup or `/demo`;
  - keep API keys server-side;
  - keep retries at the intended bounded value;
  - preserve schema validation and uncertainty;
  - return safe diagnostic categories;
  - never turn on fixtures automatically.
- Safety constraints: no raw document/Daily Signal logging; no model-derived clinical constraints; no key exposure.
- Acceptance criteria:
  - three documents complete in LIVE mode;
  - typed stomach input completes in LIVE mode;
  - both persist LIVE provenance;
  - all-failed extraction is non-2xx or explicitly represented;
  - timeout, authentication/model, and schema errors are distinguishable.
- Manual verification: repeat only the live extraction boundaries first, then rerun Flows 1 and 2.
- Automated regression tests the next agent should add: mocked OpenAI success, no-output, schema-invalid, timeout, and project/model-error cases.
- Risks: model/file support differences and latency near the 25-second limit.
- Out of scope: changing deterministic scheduling or clinical rules.

### Work package 2 — Make demo checkpoints atomic and schedule-complete

- Defects addressed: CL-PLAN-001
- Goal: every recovery checkpoint must finish with a usable persisted state before reporting Done.
- Likely files: `lib/demo-checkpoints.ts`, `lib/stress-test.ts`, `lib/plan-service.ts`, demo reset/checkpoint route.
- Required behaviour: transactionally seed/activate tasks, generate plan items, verify an active-plan item exists for 2026-07-17, then return success.
- Safety constraints: exactly one active plan; no acceptance bypass in patient workflows.
- Acceptance criteria: immediate and refreshed Today show the same non-empty initial moments.
- Manual verification: select `DAILY_SIGNAL_READY`, open Today twice, refresh.
- Automated regression tests: checkpoint-by-checkpoint state cardinality and scheduled-item assertions.
- Risks: long transactions during reset.
- Out of scope: using checkpoints to claim core onboarding passes.

### Work package 3 — Expose complete Stress Test evidence

- Defects addressed: CL-STRESS-001, CL-STRESS-003
- Goal: make deterministic workload, conflicts, conservation, and choice legible before acceptance.
- Likely files: `components/UpdateScreen.tsx`, update pages, simulation-result query/presentation.
- Required behaviour:
  - display 28 actions and 140 minutes from persisted calculation;
  - display interruptions before/after;
  - show moved, bundled, delegated, and unplaced counts/details;
  - identify non-delegation and equipment/location requirements;
  - provide Keep current plan for now;
  - preserve proposal availability.
- Safety constraints: no skip/delay advice; unresolved occurrence remains visible; active plan unchanged until acceptance.
- Acceptance criteria: every Flow 5 metric is inspectable and reconciles with the proposal.
- Manual verification: repeat Flow 5 before acceptance and compare old Today.
- Automated regression tests: calculated metric rendering, conservation, keep-current isolation, and acceptance transition.
- Risks: overwhelming a mobile screen; use progressive disclosure without hiding required totals.
- Out of scope: new optimisation logic.

### Work package 4 — Route clarifications to relevant fictional templates

- Defects addressed: CL-STRESS-002, CL-MSG-001
- Goal: ensure an operational scheduling conflict receives an operationally relevant, conspicuously simulated response.
- Likely files: `domain/messages/responses.ts`, `lib/simulated-responses.ts`, clarification-send metadata, `components/MessagingClient.tsx`.
- Required behaviour: persist clarification category or safely classify from approved categories; map timing conflicts away from cuff-position guidance; qualify all care-team wording.
- Safety constraints: no real-clinician implication, diagnosis, medication change, or plan contradiction.
- Acceptance criteria: exact audit question receives wording that retains the verified window and unresolved conflict; one response only after refresh.
- Manual verification: submit the same question and wait through the normal delay.
- Automated regression tests: conflict, technique, and generic clarification template routing plus idempotency.
- Risks: uncontrolled natural-language classification; prefer deterministic approved category selection.
- Out of scope: clinician UI or live clinician messaging.

### Work package 5 — Repair mobile overflow and retained error state

- Defects addressed: CL-UI-001, CL-STATE-001
- Goal: keep every required screen readable and every recoverable failure refresh-safe.
- Likely files: `app/globals.css`, mobile cards/banners, processing server page/component.
- Required behaviour: wrap status/action text, constrain flex children, retain failed document status from persistence.
- Safety constraints: never hide unresolved work or synthetic labels to reduce layout height.
- Acceptance criteria: no horizontal clipping at 390×844 and 430×932; extraction failure persists after refresh.
- Manual verification: capture Today, Messages, update, preview, and failed processing at both widths.
- Automated regression tests: focused component state tests and responsive checks in a separate non-manual session.
- Risks: regressions from existing dirty CSS changes.
- Out of scope: visual redesign.

### Work package 6 — Re-run physical microphone verification on hardware

- Defects addressed: Flow 3 test blocker
- Goal: verify real permission, MediaRecorder, upload, transcription, editing, record-only, override, and denial.
- Likely files if a product defect reproduces: `components/DailySignalFlow.tsx`, `app/api/audio/transcribe/route.ts`, audio validation.
- Required behaviour: explicit requesting/recording/transcribing/error states and typed fallback.
- Safety constraints: no retained audio after completion/failure; live mode only for this verification.
- Acceptance criteria: all three Flow 3 branches observed on physical hardware.
- Manual verification: current Chrome with microphone attached; capture MIME type, file size, model, and latency from Network.
- Automated regression tests: retain existing mocked coverage; do not substitute it for the hardware rerun.
- Risks: OS permission state and hardware availability.
- Out of scope: mocked media as evidence for manual completion.

## 13. Demo-readiness decision

- Can all five flows be demonstrated? **No.**
- Unreliable flows: Flows 1 and 2 fail at live OpenAI; Flow 3 is blocked; Flow 4 could not be completed; Flow 5 is only partial.
- Is live AI suitable for the timed demo? **No.** There were no successful live requests.
- Measured live latency:
  - document extraction failure: 319 ms server time;
  - Daily Signal failure: 127 ms server time;
  - transcription: no request.
- Should fixture mode remain recommended? For a rehearsal or visual walkthrough, yes, but it must be explicitly labelled fixture mode. It cannot be used as evidence that this live-AI audit passed.
- Remaining manual steps:
  1. fix and rerun live document extraction;
  2. complete candidate and initial-plan review;
  3. fix and rerun live typed Daily Signal through messaging;
  4. rerun physical microphone branches on attached hardware;
  5. rerun Life Map proposal/acceptance;
  6. rerun complete Stress Test metrics and relevant clarification;
  7. repeat critical screens at both widths.
- Exact P0 blockers: none.
- Exact P1 blockers:
  1. CL-AI-001 live document extraction failure;
  2. CL-AI-002 live Daily Signal extraction failure;
  3. CL-PLAN-001 empty Today schedule in recovery active plan;
  4. CL-STRESS-001 missing calculated Stress Test evidence;
  5. CL-STRESS-002 irrelevant clarification response.

Final verdict: **NOT READY**.
