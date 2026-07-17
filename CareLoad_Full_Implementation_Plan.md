# CareLoad
## Full Product and Implementation Specification
### Patient-only hackathon prototype

**Document purpose:** This is the authoritative implementation plan for the CareLoad hackathon prototype. It is intended to contain enough product, design, architecture, domain, data, API, AI, testing, safety, demo, and delivery context that a developer or Codex agent can implement the application without reopening the original design conversation.

**Hackathon window:** Friday 17 July 2026, 19:00 to Saturday 18 July 2026, 15:00  
**Team:** One developer, optionally two  
**Primary demo environment:** Laptop browser using a mobile-sized responsive viewport  
**Data:** Entirely synthetic  
**Clinical connection:** Entirely simulated inside the patient application  
**Core build principle:** Every visible state transition should genuinely work and persist. Only the identity and behaviour of external healthcare organisations are simulated.

---

# 1. Executive summary

CareLoad is a mobile-first, AI-assisted treatment-burden planner for people living with chronic conditions.

People with multiple long-term conditions are often given individually sensible instructions by different healthcare services:

- take several medicines at different times;
- perform measurements at home;
- attend appointments;
- complete questionnaires;
- collect prescriptions;
- monitor symptoms;
- follow dietary or activity guidance;
- contact a service when a defined change occurs.

The difficulty is not merely remembering the instructions. The difficulty is fitting the combined workload of healthcare into one human life containing work, travel, family, fatigue, preferences, accessibility needs, and limited attention.

CareLoad converts fragmented care instructions into a structured and traceable **Care Work Graph**. It combines that graph with a patient-created **Life Map** describing the routines, priorities, obstacles, and support available in their actual day. A deterministic planning engine then creates one realistic daily and weekly care plan without moving tasks outside verified clinical constraints.

CareLoad also includes an optional **Daily Signal**. The patient can speak or type a brief natural-language account of how they feel. AI converts that account into patient-confirmed structured observations, selects no more than two personalised follow-up questions from an approved catalogue, and can prepare an update for the patient to send. After a short simulated delay, the app shows a clearly labelled synthetic care-team response.

When a new care instruction is introduced, CareLoad runs a **Care Plan Stress Test**. It simulates the impact of the instruction on the existing week, measures added actions and interruptions, detects work or family conflicts, replans what it is permitted to move, and identifies unresolved constraints rather than silently discarding a task.

The defining product question is:

> **Every specialist may optimise their own care instructions. Can one person realistically live all of them together?**

---

# 2. Product thesis

## 2.1 Problem statement

Current patient tools often optimise individual tasks:

- medication reminder applications remind the user to take medication;
- calendars display appointments;
- symptom diaries store observations;
- portals allow messages to be sent;
- condition-specific applications track one disease.

They rarely model the combined workload that several care pathways impose on the same person.

A patient may have 20 individually reasonable actions each week, but those actions may:

- overlap with working hours;
- require equipment that is only available at home;
- be scattered into too many separate interruptions;
- duplicate a request from another service;
- conflict with family or caring responsibilities;
- become difficult during fatigue or pain;
- depend on a family member who is unavailable;
- lack sufficient detail to be scheduled safely;
- contain advice that appears inconsistent with another instruction.

CareLoad treats the care plan itself as an object that can be compiled, measured, tested, and improved.

## 2.2 Core value proposition

> **CareLoad turns fragmented healthcare instructions into one verified workload, fits that workload around the patient’s real life, and reveals when a new instruction makes the combined plan difficult or impossible to execute.**

## 2.3 What makes CareLoad AI-native

AI is not used merely to generate encouraging text.

AI is used where probabilistic language understanding provides real value:

1. Reading heterogeneous synthetic medical documents.
2. Extracting candidate care tasks with exact source evidence.
3. Understanding a patient’s unstructured description of routines and obstacles.
4. Structuring a spoken Daily Signal while preserving uncertainty.
5. Selecting relevant follow-up questions from an approved catalogue.
6. Drafting a patient-reviewable update.
7. Explaining a deterministic schedule or simulation in plain language.

Deterministic systems are used where predictable constraints matter:

1. Clinical timing boundaries.
2. Task criticality.
3. Whether a task may move.
4. Whether a task may be delegated.
5. Care-plan scheduling.
6. Collision detection.
7. Workload simulation.
8. Care-plan versioning.
9. Safety-rule activation.
10. Delayed simulated response state transitions.

## 2.4 The product is not

CareLoad is not:

- a diagnostic chatbot;
- an autonomous triage service;
- a medication-prescribing system;
- an adherence scoring system;
- a clinician portal;
- a real NHS integration;
- an employer fitness-for-work assessor;
- a general-purpose calendar;
- a generic to-do list;
- a social network;
- a gamified health application;
- a second source of mandatory daily logging.

---

# 3. Final scope decisions

## 3.1 Patient-only experience

The prototype contains no clinician-facing screens.

The presenter demonstrates only the patient application.

When a patient sends an update:

1. the message is stored;
2. its state becomes `AWAITING_SIMULATED_RESPONSE`;
3. a response becomes due approximately ten seconds later;
4. the patient interface polls for updates;
5. the server materialises a synthetic response once the due time has passed;
6. the Messages screen displays the result.

This approach provides a convincing asynchronous flow without:

- a second browser window;
- a clinician dashboard;
- WebSockets;
- background infrastructure;
- manual presenter switching;
- authentication or role management.

## 3.2 One planner, not two plans

There is only one active care plan.

The application may replan the current day or generate a proposed new version, but it never creates a separate “predictive lifestyle plan” alongside the care plan.

Relevant states are:

- current active plan;
- temporary preview;
- proposed updated version;
- accepted updated version.

The “Today is difficult” action modifies the presentation and placement of flexible tasks in today’s active plan. It does not create a medically different reduced-care plan and does not decide that tasks are safe to omit.

## 3.3 Simulated external entities

The following are fictional:

- Eleanor Reed;
- every condition;
- every medicine;
- every care task;
- every uploaded document;
- every care organisation;
- Dr Ahmed;
- every care-team response;
- every clinical update;
- every safety rule.

All visible product behaviour should still be genuinely implemented.

## 3.4 Supported demo archetype

The prototype is designed for multimorbidity but demonstrates one controlled synthetic profile.

**Patient:** Eleanor Reed  
**Age:** 62  
**Conditions:**

- heart failure;
- type 2 diabetes;
- hypothyroidism.

**Life Map:**

- school run from 07:30 to 08:15;
- part-time work from 08:00 or 08:30 until 14:00, depending on demo configuration;
- granddaughter care on selected afternoons;
- evening walk;
- long commute;
- dislikes frequent notifications;
- prefers speech to long forms;
- occasionally needs help collecting prescriptions.

The application must not claim to support arbitrary disease combinations safely.

---

# 4. Success criteria

The prototype succeeds when it demonstrates the following complete flow:

```text
Synthetic care documents
→ AI extracts candidate care tasks
→ patient confirms factual details
→ verified constraints are attached
→ patient builds a Life Map
→ planner creates a realistic plan
→ patient sees one clear Today dashboard
→ optional Daily Signal is recorded
→ AI structures observations
→ personalised follow-up questions are asked
→ patient reviews and sends an update
→ simulated care-team response appears after a delay
→ synthetic care-plan update arrives
→ Care Plan Stress Test measures impact
→ deterministic replanner resolves permitted conflicts
→ unresolved constraints remain visible
→ patient previews and accepts the new plan
→ Today and Care Plan screens update
```

Every arrow must represent a real stored state transition.

---

# 5. Demo narrative

## 5.1 Opening problem

Eleanor receives care instructions from several services.

Each instruction is sensible in isolation, but together they produce:

- numerous weekly actions;
- many separate interruptions;
- tasks during work;
- an appointment;
- a prescription collection;
- home-monitoring requirements;
- a questionnaire;
- repeated reminders.

The opening line is:

> “Every service has created a sensible instruction. Nobody has tested whether Eleanor can actually live all of them together.”

## 5.2 Initial value

CareLoad:

1. reads the documents;
2. extracts source-grounded candidate tasks;
3. asks Eleanor to confirm facts;
4. applies pre-verified constraints;
5. learns her work, family, and preferences;
6. bundles compatible tasks into a few care moments.

## 5.3 Daily Signal

Eleanor says:

> “My stomach has felt uncomfortable for a few days and I’m more tired than usual, but I’m still eating and drinking.”

CareLoad:

- transcribes the voice;
- extracts observations;
- asks personalised questions;
- shows exactly what it understood;
- explains why sharing might be useful;
- lets Eleanor edit or send.

## 5.4 Simulated response

After approximately ten seconds:

- a notification badge appears;
- the Messages screen shows a clearly labelled simulated response;
- the reply does not diagnose or change medication;
- a care-team-authored-style checklist explains what the fictional response means for today.

## 5.5 New care instruction

A synthetic cardiology update adds twice-daily blood-pressure monitoring for 14 days.

CareLoad calculates:

- 28 actions added;
- additional care interruptions before optimisation;
- work and childcare conflicts;
- tasks that can be bundled or moved;
- one issue that requires clarification.

Eleanor previews and accepts the updated plan.

---

# 6. User experience principles

## 6.1 Reduce interaction burden

CareLoad exists to reduce treatment burden. It must not become another demanding health application.

Targets:

- optional Daily Signal;
- one or two follow-up questions, never a lengthy interview;
- few notifications;
- no requirement to confirm every completed task;
- speech input where useful;
- clear defaults;
- no repeated collection of known information;
- no guilt, streaks, scores, or failure language.

## 6.2 Patient control

The patient must approve:

- candidate tasks;
- factual profile details;
- Life Map entries;
- routine clinician-style updates;
- proposed replanned care-plan versions.

The app must not silently:

- send routine symptom updates;
- remove tasks;
- change medication timing;
- infer inability;
- accept a new plan.

## 6.3 Provenance

Any AI-extracted clinical instruction must retain:

- source document;
- exact supporting text;
- extraction confidence;
- verification status.

## 6.4 Distinguish operational and clinical statements

Operational:

> “This task conflicts with your work schedule.”

Clinical:

> “This task is safe to skip.”

CareLoad may make the first statement. It may not make the second.

## 6.5 Calm visual language

The application should feel:

- supportive;
- legible;
- adult;
- calm;
- trustworthy;
- not childish;
- not hospital-like;
- not alarmist.

Use the supplied mock-up images as the visual authority.

---

# 7. Screen and navigation map

## 7.1 Pre-onboarding routes

```text
/
└── redirects to /onboarding/welcome

/onboarding/welcome
/onboarding/build
/onboarding/upload
/onboarding/processing
/onboarding/review
/onboarding/life-map
/onboarding/preview
```

## 7.2 Main patient routes

```text
/patient/today
/patient/care-plan
/patient/care-plan/task/[taskId]
/patient/life-map
/patient/daily-signal
/patient/daily-signal/review
/patient/messages
/patient/messages/[threadId]
/patient/updates/[changeId]
/patient/updates/[changeId]/preview
/patient/help
```

## 7.3 Presenter-only route

```text
/demo
```

The presenter route may:

- reset all data;
- seed Eleanor;
- seed already-completed onboarding;
- set the application to a specific demo checkpoint;
- insert a synthetic care-plan update;
- clear pending response jobs;
- enable deterministic AI fixtures;
- inspect current state.

It should be hidden from the patient navigation.

## 7.4 Bottom navigation

Exactly five items:

1. Today
2. Care Plan
3. Add to My Life
4. Messages
5. Help

The centre Add to My Life item may use the prominent teal circular plus treatment shown in the mock-ups.

---

# 8. Detailed screen specification

# 8.1 Welcome and consent

**Route:** `/onboarding/welcome`

## Purpose

Explain the product simply and establish the prototype boundaries.

## Required content

- CareLoad logo.
- Heading: “Welcome to CareLoad”.
- Three benefits:
  - stay organised;
  - plan with confidence;
  - care that fits your life.
- Privacy and synthetic-data note.
- Document-import note.
- Optional Daily Signal note.
- Acknowledgement:
  - CareLoad supports planning;
  - CareLoad does not replace a clinician;
  - the hackathon prototype uses synthetic information.
- Primary button: Get started.
- Secondary button: Learn how it works.

## State

The acknowledgement must be selected before continuing.

---

# 8.2 Build your care plan

**Route:** `/onboarding/build`

## Options

### Upload documents

Supports synthetic:

- PDF;
- TXT;
- Markdown.

### Connect health record

Visible but marked:

> Simulated for demo

Selecting it loads a predefined synthetic record.

### Talk it through

Allows text or voice entry of routines and known care instructions.

## Behaviour

The user may use more than one source.

For the hackathon, the recommended demo path is:

1. load two or three bundled synthetic documents;
2. optionally enter one life detail conversationally.

---

# 8.3 Upload documents

**Route:** `/onboarding/upload`

## UI

- drag-and-drop zone;
- browse button;
- list of accepted file types;
- synthetic-data warning;
- provided sample-document shortcuts;
- upload progress;
- remove file;
- process documents button.

## Limits

- maximum 3 documents for normal demo;
- maximum 5 MB per document;
- reject unsupported MIME types;
- sanitise filenames;
- do not render raw HTML.

## Sample files

Store in:

```text
public/demo-documents/
```

Files:

```text
cardiology-discharge-summary.pdf
diabetes-medication-list.pdf
gp-care-notes.pdf
```

---

# 8.4 Processing documents

**Route:** `/onboarding/processing`

## UI

Show meaningful stages:

1. Uploading document.
2. Reading instructions.
3. Finding candidate tasks.
4. Linking tasks to sources.
5. Preparing review.

Do not fake progress using random percentages. Use stage completion.

## Failure behaviour

- preserve uploaded files;
- show which file failed;
- Retry;
- use deterministic fixture;
- continue with successfully processed files.

---

# 8.5 Review extracted care tasks

**Route:** `/onboarding/review`

## Candidate card fields

- task title;
- issuing service;
- source document;
- exact quote;
- explicit timing;
- explicit frequency;
- confidence;
- status.

## Patient actions

- Confirm factual detail.
- This is outdated.
- I am not sure.
- View source.
- Edit title for readability without changing meaning.

## Important distinction

Patient confirmation means:

> “Yes, this is still part of my current care.”

It does not mean:

> “I verify that this task is clinically safe.”

## Constraint attachment

After factual confirmation, match the task to a seeded `VerifiedTaskTemplate`.

If no template matches:

- mark `NEEDS_CLINICAL_VERIFICATION`;
- do not include the task in scheduling;
- show it in a clarification section.

---

# 8.6 Life Map onboarding

**Route:** `/onboarding/life-map`

This becomes the same underlying editor later accessed through Add to My Life.

## Sections

### Daily anchors

Examples:

- wake time;
- breakfast;
- work;
- school run;
- commute;
- lunch;
- caring responsibilities;
- evening walk;
- bedtime.

### Priorities to protect

The patient selects up to three, for example:

- work;
- family time;
- independence;
- rest;
- religious activity;
- social activity;
- exercise;
- a weekly appointment.

### Preferences

Examples:

- use fewer notifications;
- prefer voice;
- group tasks together;
- avoid health tasks during meals;
- avoid admin tasks in the evening;
- do not ask family for help automatically.

### Friction factors

Categories:

- time;
- location;
- physical;
- cognitive;
- emotional;
- social;
- financial.

Examples:

- long commute;
- equipment remains at home;
- fatigue after work;
- difficulty remembering multi-step tasks;
- needle anxiety;
- caregiver unavailable;
- prescription collection cost.

### Support people

For the prototype:

- Maya, daughter;
- may collect prescriptions;
- may provide transport;
- cannot access full health data.

## Save

Primary button:

> Save my Life Map

---

# 8.7 Initial plan preview

**Route:** `/onboarding/preview`

## Display

- total weekly actions;
- total estimated care minutes;
- number of care moments after bundling;
- tasks during work before and after planning;
- duplicate candidate;
- unresolved instruction;
- weekly care-plan preview;
- protected anchors.

## Actions

- Accept plan.
- Adjust Life Map.
- Review unresolved item.

Acceptance creates the first `ACTIVE` CarePlanVersion.

---

# 8.8 Today dashboard

**Route:** `/patient/today`

This is the primary home screen.

## Header

- greeting;
- current date;
- care-plan-update badge;
- notification bell.

## Today’s plan

Display a small number of bundled care moments:

- morning routine;
- midday;
- evening routine.

Each care moment shows:

- icon;
- title;
- concise task list;
- estimated duration;
- chevron.

## Daily Signal card

The card must be visible but not dominant.

Text:

> Optional check-in — tell us how you’re feeling today.

Actions:

- Speak;
- Type;
- Skip.

If skipped:

- collapse the card for the rest of the day;
- do not show guilt language;
- retain access through a small “Check in later” link.

## Protected today

Display real-life anchors such as:

- work until 14:00;
- granddaughter at 15:00;
- evening walk.

## Today is difficult

Provide a secondary action.

Behaviour:

1. ask which obstacle applies:
   - tired;
   - busy;
   - away from home;
   - support unavailable;
   - something else;
2. rerun today’s deterministic scheduler;
3. move only tasks already marked flexible;
4. group notifications;
5. expose impossible conflicts;
6. keep one active plan.

Do not label the result “minimum safe”.

Suggested label:

> Adjust today within my plan

The visual button may remain “Today is difficult” because the existing mock-up uses that phrase.

---

# 8.9 Care Plan

**Route:** `/patient/care-plan`

## Tabs

- Today;
- This week;
- Tasks.

## This week view

Each day shows:

- care moments;
- appointments;
- prescription events;
- protected anchors;
- unresolved items.

## Tasks view

Each task shows:

- title;
- source;
- owner service;
- fixed or flexible;
- timing window;
- frequency;
- next occurrence;
- verified status.

## Task detail

Display:

- readable instruction;
- exact source text;
- issuing service;
- issue date;
- timing constraint;
- whether it may move;
- whether it may be delegated;
- review date;
- relevant plan occurrences.

The patient may correct factual information but may not edit clinical constraints directly.

---

# 8.10 Add to My Life

**Route:** `/patient/life-map`

## Purpose

Allow the patient to modify non-clinical context.

## Actions

- add daily anchor;
- add protected priority;
- add preference;
- add friction factor;
- add support person;
- mark support unavailable;
- remove outdated life constraint.

Saving a material change triggers a plan simulation.

Example:

> Work shift changed from 08:00–14:00 to 10:00–18:00.

The app should:

1. calculate the impact;
2. preview moved flexible tasks;
3. expose fixed-task conflicts;
4. ask the patient to accept the updated schedule.

---

# 8.11 Daily Signal capture

**Route:** `/patient/daily-signal`

## Entry modes

- record voice;
- type;
- feel about the same;
- skip.

## Voice implementation

Use browser `MediaRecorder`.

Flow:

1. request microphone permission;
2. record WebM or supported audio;
3. display timer;
4. stop;
5. upload to transcription endpoint;
6. show editable transcript;
7. analyse only after user continues.

## Personalised opening prompt

Do not use one generic prompt for every patient.

Build the prompt from:

- active monitoring domains;
- recent care-plan changes;
- prior Daily Signal observations;
- unresolved clinician-style advice;
- patient preferences.

Example:

> “How are your energy, breathing, stomach, and usual activities today?”

For another seeded profile, it would differ.

## Maximum interaction

- one free-flowing entry;
- no more than two follow-up questions;
- one review screen.

---

# 8.12 Daily Signal follow-up questions

Questions come from a fixed approved catalogue.

The AI selects IDs. It does not invent medical questions freely.

## Example catalogue

```text
BOWEL_DURATION
BOWEL_LAST_NORMAL
ABDOMINAL_PAIN_SEVERITY
ABDOMINAL_PAIN_PERSISTENCE
PAIN_SPREADS_TO_BACK
EATING_MAINTAINED
DRINKING_MAINTAINED
RECENT_MEDICATION_CHANGE
BREATHLESSNESS_CHANGE
SWELLING_CHANGE
DIZZINESS_IMPACT
SLEEP_CHANGE
DAILY_ACTIVITY_IMPACT
URINATION_CHANGE
SUPPORT_NEEDED
```

## Question model

```text
id
domain
question
responseType
options
applicableConditions
applicableRecentChanges
safetyRuleRelevance
```

## Selection rules

- maximum two;
- prefer unanswered high-information questions;
- never repeat a question already answered that day;
- never ask a domain irrelevant to the profile unless the patient introduced it;
- deterministic safety-required questions override normal ranking.

---

# 8.13 Review your update

**Route:** `/patient/daily-signal/review`

## Sections

### CareLoad understood

For example:

- stomach discomfort present;
- bowel pattern changed;
- fatigue worse than usual;
- eating maintained;
- drinking maintained.

### Evidence

Each observation can expand to show:

- exact patient wording;
- certainty;
- whether it was stated or inferred;
- any confirmed follow-up answer.

### Why sharing is suggested

Use observational language:

> “These changes differ from your recent check-ins and may be useful for your care team to review.”

Do not say:

- likely diagnosis;
- medicine caused symptom;
- unsafe;
- clinically stable.

## Actions

- Yes, that is right.
- Edit.
- Send update.
- Keep monitoring.

The user must approve before sending a routine update.

---

# 8.14 Awaiting simulated response

After sending:

1. store the patient-approved update;
2. create a `SimulatedResponseJob`;
3. set `dueAt = now + 10 seconds`;
4. navigate to Messages;
5. show:
   - Sent;
   - Awaiting simulated care-team response;
   - approximate wait indicator.

Do not use a fake blocking spinner for ten seconds. The user should be able to navigate away.

---

# 8.15 Messages

**Route:** `/patient/messages`

## Thread card

Show:

- patient’s sent summary;
- sent time;
- status;
- synthetic care-team response;
- response time;
- clear “Simulated care-team response” label.

## Response generation

Preferred implementation:

- deterministic response family selected from scenario rules;
- optional AI wording constrained to a strict response schema;
- final response may not diagnose;
- final response may not alter medication;
- final response may suggest continued monitoring or fictional routine review;
- urgent-pathway content must come from predefined templates.

## Example

> “Thank you for the update. Please continue monitoring the symptoms described. If the discomfort worsens or the bowel changes continue, use the review option in this prototype.”

## “What this means for today”

This is a separate checklist, not hidden AI interpretation.

It should be generated from a constrained synthetic template:

- continue the existing plan as currently shown;
- keep monitoring;
- use the fictional review route if symptoms persist.

---

# 8.16 Care-plan update notification

A synthetic external update can enter the app in two ways:

1. Automatically seeded at a known demo step.
2. Triggered from `/demo`.

No clinician screen is needed.

## Example update

```text
Source: Cardiology
Instruction: Measure blood pressure twice daily for 14 days
Morning window: 07:00–10:00
Evening window: 17:00–20:00
Duration: 5 minutes
May move within window: true
May delegate: false
```

The notification appears as:

> New update from cardiology

Action:

> See impact on my week

---

# 8.17 Care Plan Stress Test

**Route:** `/patient/updates/[changeId]`

## Metrics

- actions added;
- estimated minutes added;
- interruptions before optimisation;
- interruptions after optimisation;
- work conflicts;
- family conflicts;
- equipment conflicts;
- tasks bundled;
- tasks moved;
- tasks delegated;
- unplaced tasks.

## Example display

```text
+28 actions
+18 interruptions before optimisation
4 work conflicts
```

## Resolved items

Examples:

- morning reading bundled with breakfast;
- flexible questionnaire moved to Friday;
- prescription collection delegated to Maya.

## Unresolved item

Example:

> Evening timing conflicts with childcare and no alternative approved window is available.

Actions:

- Preview updated plan.
- Ask for clarification.

Because no clinician workflow exists, Ask for clarification creates another delayed synthetic response flow.

---

# 8.18 Updated plan preview

**Route:** `/patient/updates/[changeId]/preview`

## Content

- source update;
- what changed;
- updated morning, midday, evening;
- why the changes reduce burden;
- any remaining clarification;
- before and after workload summary.

## Actions

- Accept updated plan.
- Ask for clarification.
- Keep current plan for now.

## Acceptance

Acceptance must:

1. set proposed version to `ACTIVE`;
2. set previous active version to `SUPERSEDED`;
3. update scheduled items;
4. record an audit event;
5. clear update badge;
6. display “Plan updated today” on Today;
7. display a concise What changed card.

---

# 8.19 Help

**Route:** `/patient/help`

Include:

- what CareLoad does;
- what CareLoad does not do;
- synthetic-data notice;
- how AI is used;
- how to reset demo;
- urgent-care prototype disclaimer;
- privacy explanation;
- accessibility options.

Do not include a real emergency-contact workflow.

---

# 9. Visual design system

The downloaded mock-ups are the primary visual reference.

## 9.1 Device and layout

- mobile-first;
- maximum content width around 430 px;
- on desktop, centre the mobile application in a subtle neutral background;
- full-height mobile shell;
- sticky bottom navigation;
- allow vertical scrolling;
- safe-area spacing.

## 9.2 Colour tokens

Suggested approximate palette:

```css
--navy-950: #0B1F4D;
--navy-800: #17366F;
--blue-600: #1769E0;
--blue-500: #2F7DF4;
--teal-600: #079D96;
--teal-500: #18B7A8;
--mint-100: #EAF9F6;
--blue-100: #EDF5FF;
--purple-100: #F4EEFF;
--yellow-100: #FFF6DD;
--yellow-500: #F4B82B;
--rose-100: #FFF0F2;
--green-100: #EAF8EF;
--green-600: #22A76A;
--amber-100: #FFF6DE;
--amber-700: #A65E00;
--red-100: #FFF0F0;
--red-600: #D94343;
--grey-50: #FAFCFF;
--grey-100: #F4F7FA;
--grey-300: #D8E0EA;
--grey-500: #718096;
--white: #FFFFFF;
```

Exact colours may be sampled from the images.

## 9.3 Typography

Use a clean web font with excellent readability.

Recommended:

- Inter;
- Geist Sans;
- system sans-serif fallback.

Hierarchy:

- display greeting: 40–48 px;
- page title: 32–40 px;
- card title: 20–24 px;
- body: 16–18 px;
- supporting text: 14–16 px;
- minimum interactive label: 15 px.

## 9.4 Components

Reusable components:

- `MobileShell`
- `CareLoadLogo`
- `AppHeader`
- `NotificationBell`
- `BottomNavigation`
- `RoundedCard`
- `StatusBanner`
- `CareMomentCard`
- `DurationPill`
- `TaskRow`
- `SourceEvidenceDrawer`
- `SegmentedControl`
- `LifeAnchorRow`
- `FrictionChip`
- `PrimaryButton`
- `SecondaryButton`
- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`
- `SimulationMetricCard`
- `ChangeSummaryCard`
- `MessageBubble`
- `SimulatedResponseBadge`
- `AudioRecorder`
- `TranscriptEditor`
- `ObservationReviewCard`

## 9.5 Consistency rules

- bottom navigation order never changes;
- one selected tab at a time;
- page headers use consistent spacing;
- blue is the primary action;
- teal indicates confirmed or supportive state;
- amber indicates clarification;
- red is reserved for explicit predefined safety states;
- purple indicates AI-assisted or reflective content;
- no dense data tables in the patient UI;
- cards use consistent radius and shadow;
- no more than one dominant primary button per screen.

---

# 10. Accessibility

The target audience may include people with fatigue, cognitive load, visual impairment, limited dexterity, or low confidence with digital tools.

## Requirements

- semantic HTML;
- keyboard navigation;
- visible focus rings;
- minimum 44 px touch targets;
- colour contrast compliant with WCAG AA;
- no information conveyed by colour alone;
- plain-English labels;
- screen-reader labels for icons;
- reduced-motion support;
- errors placed next to affected fields;
- voice input always has a text fallback;
- transcript editable before analysis;
- persistent navigation labels;
- no auto-disappearing critical information;
- no time-limited decisions.

## Optional accessibility preferences

- larger text;
- reduced animation;
- high contrast;
- fewer reminders;
- prefer speech;
- simplified Today view.

---

# 11. Technology architecture

# 11.1 Recommended stack

## Framework

- Next.js App Router
- React
- TypeScript

## Styling

- Tailwind CSS
- shadcn/ui primitives where helpful
- Lucide React icons
- CSS variables for design tokens

## Persistence

- SQLite
- Prisma ORM
- local database file

## AI

- OpenAI Responses API
- Structured Outputs using JSON Schema
- OpenAI speech-to-text endpoint
- server-side OpenAI SDK only

## Validation

- Zod
- shared schemas for API requests and AI outputs

## Forms

- React Hook Form

## Dates

- date-fns

## Testing

- Vitest
- React Testing Library
- Playwright

## Optional

- Recharts only for small visualisations;
- no chart library is required if cards communicate metrics adequately.

## Package manager

Use npm unless the developer already prefers pnpm.

## Runtime

Use Node.js meeting the current Next.js minimum requirement.

---

# 11.2 Why a responsive web application

A responsive web application is the lowest-risk format because:

- it runs on the laptop;
- it can be demonstrated in Chrome device emulation;
- no mobile build pipeline is required;
- microphone APIs work in modern browsers;
- backend routes can live in the same project;
- deployment is optional;
- local persistence is simple;
- screenshots match the mobile concepts.

The app may include a web manifest, but installability is not required.

---

# 11.3 High-level component architecture

```text
Patient browser
    |
    | Next.js pages and client components
    v
Next.js route handlers / server actions
    |
    +--> Domain services
    |      - care-plan compiler
    |      - constraint matcher
    |      - planner
    |      - simulator
    |      - Daily Signal processor
    |      - simulated response service
    |
    +--> OpenAI API
    |      - document extraction
    |      - speech transcription
    |      - Daily Signal extraction
    |      - optional constrained response wording
    |
    +--> Prisma
           |
           v
        SQLite
```

---

# 12. Repository structure

```text
careload/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── onboarding/
│   │   ├── welcome/page.tsx
│   │   ├── build/page.tsx
│   │   ├── upload/page.tsx
│   │   ├── processing/page.tsx
│   │   ├── review/page.tsx
│   │   ├── life-map/page.tsx
│   │   └── preview/page.tsx
│   │
│   ├── patient/
│   │   ├── layout.tsx
│   │   ├── today/page.tsx
│   │   ├── care-plan/page.tsx
│   │   ├── care-plan/task/[taskId]/page.tsx
│   │   ├── life-map/page.tsx
│   │   ├── daily-signal/page.tsx
│   │   ├── daily-signal/review/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── messages/[threadId]/page.tsx
│   │   ├── updates/[changeId]/page.tsx
│   │   ├── updates/[changeId]/preview/page.tsx
│   │   └── help/page.tsx
│   │
│   ├── demo/page.tsx
│   │
│   └── api/
│       ├── documents/upload/route.ts
│       ├── documents/extract/route.ts
│       ├── onboarding/confirm/route.ts
│       ├── life-map/route.ts
│       ├── plans/generate/route.ts
│       ├── plans/active/route.ts
│       ├── plans/adjust-today/route.ts
│       ├── audio/transcribe/route.ts
│       ├── daily-signals/extract/route.ts
│       ├── daily-signals/confirm/route.ts
│       ├── daily-signals/send/route.ts
│       ├── messages/route.ts
│       ├── simulated-responses/process/route.ts
│       ├── care-updates/route.ts
│       ├── care-updates/[changeId]/simulate/route.ts
│       ├── care-updates/[changeId]/accept/route.ts
│       ├── clarifications/send/route.ts
│       └── demo/reset/route.ts
│
├── components/
│   ├── ui/
│   ├── shell/
│   ├── onboarding/
│   ├── care-plan/
│   ├── life-map/
│   ├── daily-signal/
│   ├── messages/
│   ├── simulation/
│   └── demo/
│
├── domain/
│   ├── care-plan/
│   │   ├── types.ts
│   │   ├── planner.ts
│   │   ├── slot-generation.ts
│   │   ├── scoring.ts
│   │   ├── bundling.ts
│   │   ├── constraints.ts
│   │   ├── versioning.ts
│   │   └── metrics.ts
│   ├── compiler/
│   │   ├── types.ts
│   │   ├── extraction-schema.ts
│   │   ├── template-matcher.ts
│   │   └── verification.ts
│   ├── daily-signal/
│   │   ├── types.ts
│   │   ├── extraction-schema.ts
│   │   ├── question-catalogue.ts
│   │   ├── question-selector.ts
│   │   ├── trend-comparison.ts
│   │   └── safety-rules.ts
│   ├── simulation/
│   │   ├── simulator.ts
│   │   ├── diff.ts
│   │   └── explanation.ts
│   └── responses/
│       ├── simulated-response-service.ts
│       ├── templates.ts
│       └── response-schema.ts
│
├── lib/
│   ├── openai.ts
│   ├── prisma.ts
│   ├── env.ts
│   ├── dates.ts
│   ├── files.ts
│   ├── logger.ts
│   └── demo-mode.ts
│
├── prompts/
│   ├── document-extraction.ts
│   ├── life-map-extraction.ts
│   ├── daily-signal-extraction.ts
│   ├── update-summary.ts
│   └── simulated-response.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── migrations/
│   └── dev.db
│
├── public/
│   ├── demo-documents/
│   ├── icons/
│   ├── logo/
│   └── manifest.webmanifest
│
├── fixtures/
│   ├── document-extractions/
│   ├── daily-signals/
│   ├── simulated-responses/
│   └── care-updates/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── README.md
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

# 13. Database model

The exact Prisma syntax may be adjusted, but the following domain concepts must be preserved.

# 13.1 Patient

```text
id
firstName
lastName
dateOfBirth
demoProfile
onboardingCompleted
preferredInputMode
createdAt
updatedAt
```

# 13.2 Condition

```text
id
patientId
name
status
sourceDocumentId
verified
createdAt
```

# 13.3 CareDocument

```text
id
patientId
filename
mimeType
storagePath
sourceOrganisation
documentDate
status
errorMessage
createdAt
updatedAt
```

Statuses:

```text
UPLOADED
PROCESSING
EXTRACTED
REVIEWED
FAILED
```

# 13.4 CandidateCareTask

```text
id
patientId
documentId
title
description
sourceQuote
sourcePage
explicitFrequency
explicitTiming
explicitDuration
confidence
status
createdAt
```

Statuses:

```text
PENDING
PATIENT_CONFIRMED
PATIENT_REJECTED
PATIENT_UNSURE
NEEDS_CLINICAL_VERIFICATION
VERIFIED
```

# 13.5 VerifiedTaskTemplate

Pre-seeded clinical constraint template.

```text
id
templateKey
conditionKey
titlePattern
purpose
ownerService
criticality
timingType
windowStart
windowEnd
frequencyRule
durationMinutes
mayMove
maximumDeferralMinutes
mayDelegate
requiredLocation
requiredEquipment
bundleGroup
missedTaskInstruction
reviewPeriodDays
active
```

# 13.6 VerifiedCareTask

Patient-specific active task.

```text
id
patientId
candidateTaskId
templateId
title
purpose
ownerService
sourceDocumentId
criticality
timingType
windowStart
windowEnd
frequencyRule
durationMinutes
mayMove
maximumDeferralMinutes
mayDelegate
requiredLocation
requiredEquipment
bundleGroup
missedTaskInstruction
reviewDate
active
createdAt
updatedAt
```

# 13.7 LifeAnchor

```text
id
patientId
name
category
daysOfWeekJson
startTime
endTime
protectedPriority
location
notes
active
```

Categories:

```text
WORK
FAMILY
CAREGIVING
TRAVEL
REST
MEAL
EXERCISE
RELIGIOUS
SOCIAL
OTHER
```

# 13.8 PatientPreference

```text
id
patientId
key
valueJson
active
```

Examples:

```text
NOTIFICATION_DENSITY = LOW
PREFERRED_INPUT = VOICE
AVOID_HEALTH_TASKS_DURING_MEALS = true
PREFER_BUNDLED_TASKS = true
```

# 13.9 FrictionFactor

```text
id
patientId
category
description
severity
daysOfWeekJson
startTime
endTime
location
relatedTaskId
active
```

Categories:

```text
TIME
LOCATION
PHYSICAL
COGNITIVE
EMOTIONAL
SOCIAL
FINANCIAL
```

# 13.10 SupportPerson

```text
id
patientId
name
relationship
allowedTaskCategoriesJson
availabilityJson
active
```

# 13.11 CarePlanVersion

```text
id
patientId
versionNumber
status
generatedFromChangeId
generationReason
createdAt
acceptedAt
```

Statuses:

```text
DRAFT
PROPOSED
ACTIVE
SUPERSEDED
REJECTED
```

# 13.12 ScheduledPlanItem

```text
id
carePlanVersionId
taskId
date
startTime
endTime
bundleKey
status
placementScore
placementExplanation
createdAt
```

Statuses:

```text
SCHEDULED
COMPLETED
SKIPPED_BY_PATIENT
NEEDS_CLARIFICATION
CANCELLED
```

# 13.13 DailySignal

```text
id
patientId
signalDate
rawText
audioPath
transcript
status
differentFromRecentPattern
shareSuggested
shareReason
sentAt
createdAt
updatedAt
```

Statuses:

```text
DRAFT
TRANSCRIBED
EXTRACTED
CONFIRMED
SENT
RECORDED_ONLY
URGENT_RULE_TRIGGERED
```

# 13.14 SignalObservation

```text
id
dailySignalId
domain
value
trend
durationText
certainty
sourcePhrase
confirmed
createdAt
```

# 13.15 SignalAnswer

```text
id
dailySignalId
questionId
answerJson
createdAt
```

# 13.16 MessageThread

```text
id
patientId
subject
threadType
status
createdAt
updatedAt
```

Thread types:

```text
DAILY_SIGNAL_UPDATE
CLARIFICATION_REQUEST
SYSTEM
```

# 13.17 Message

```text
id
threadId
senderRole
messageType
body
structuredPayloadJson
status
createdAt
readAt
```

Sender roles:

```text
PATIENT
SIMULATED_CARE_TEAM
SYSTEM
```

# 13.18 SimulatedResponseJob

```text
id
threadId
triggerMessageId
scenarioKey
dueAt
status
responseTemplateKey
createdAt
processedAt
```

Statuses:

```text
PENDING
PROCESSED
FAILED
CANCELLED
```

# 13.19 CarePlanChange

```text
id
patientId
sourceService
title
description
effectiveDate
constraintsJson
status
createdAt
```

Statuses:

```text
RECEIVED
SIMULATED
AWAITING_PATIENT
ACCEPTED
NEEDS_CLARIFICATION
REJECTED
```

# 13.20 SimulationResult

```text
id
carePlanChangeId
basePlanVersionId
proposedPlanVersionId
actionsAdded
minutesAdded
interruptionsBefore
interruptionsAfter
workConflicts
familyConflicts
locationConflicts
bundledTasks
movedTasks
delegatedTasks
unplacedTasks
resultJson
createdAt
```

# 13.21 AuditEvent

```text
id
patientId
eventType
entityType
entityId
payloadJson
createdAt
```

Event types:

```text
DOCUMENT_UPLOADED
DOCUMENT_EXTRACTED
TASK_CONFIRMED
TASK_REJECTED
LIFE_MAP_UPDATED
PLAN_GENERATED
PLAN_ACCEPTED
DAILY_SIGNAL_RECORDED
DAILY_SIGNAL_SENT
SIMULATED_RESPONSE_SCHEDULED
SIMULATED_RESPONSE_DELIVERED
CARE_CHANGE_RECEIVED
SIMULATION_COMPLETED
CLARIFICATION_SENT
PLAN_VERSION_ACCEPTED
DEMO_RESET
```

---

# 14. AI integration design

# 14.1 General rules

All AI calls must:

- occur server-side;
- use Structured Outputs;
- validate output with Zod;
- use low temperature where applicable;
- preserve uncertainty;
- avoid diagnosis;
- return explicit refusal/error states;
- have deterministic fixtures;
- have retries with limits;
- never be the sole source of clinical constraints.

# 14.2 Environment variables

```text
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=
OPENAI_TRANSCRIPTION_MODEL=
DATABASE_URL=file:./prisma/dev.db
DEMO_AI_FALLBACK=false
DEMO_RESPONSE_DELAY_MS=10000
NEXT_PUBLIC_DEMO_MODE=true
```

Do not hard-code a model name that may not be available. Supply a sensible default in `.env.example` comments.

# 14.3 Document extraction schema

```ts
type DocumentExtraction = {
  documentTitle: string | null;
  issuingService: string | null;
  documentDate: string | null;
  patientFacts: Array<{
    factType: string;
    value: string;
    sourceQuote: string;
    confidence: number;
  }>;
  candidateTasks: Array<{
    title: string;
    description: string | null;
    sourceQuote: string;
    sourcePage: number | null;
    explicitFrequency: string | null;
    explicitTiming: string | null;
    explicitDuration: string | null;
    requiresPatientConfirmation: boolean;
    requiresClinicalVerification: boolean;
    confidence: number;
  }>;
  appointments: Array<{
    title: string;
    date: string | null;
    time: string | null;
    location: string | null;
    sourceQuote: string;
  }>;
  medications: Array<{
    name: string;
    instruction: string | null;
    sourceQuote: string;
  }>;
  uncertainties: Array<{
    description: string;
    sourceQuote: string;
  }>;
};
```

## System rules

```text
Extract only information explicitly supported by the document.
Include the exact supporting quote for every candidate task.
Do not infer that a task may be delayed, delegated, skipped, or omitted.
Do not infer clinical criticality.
Do not diagnose.
Use null when information is not present.
Mark ambiguity rather than resolving it.
```

# 14.4 Life Map extraction

Optional conversational input may be structured into:

```ts
type LifeMapExtraction = {
  anchors: Array<{
    name: string;
    category: string;
    days: string[];
    startTime: string | null;
    endTime: string | null;
    sourcePhrase: string;
  }>;
  priorities: Array<{
    name: string;
    sourcePhrase: string;
  }>;
  preferences: Array<{
    key: string;
    value: string;
    sourcePhrase: string;
  }>;
  frictionFactors: Array<{
    category: string;
    description: string;
    sourcePhrase: string;
  }>;
  supportNeeds: Array<{
    description: string;
    sourcePhrase: string;
  }>;
};
```

The user must review all extracted Life Map information before saving.

# 14.5 Daily Signal extraction schema

```ts
type DailySignalExtraction = {
  observations: Array<{
    domain: string;
    value: string;
    trend: "NEW" | "WORSE" | "SAME" | "BETTER" | "UNCLEAR";
    durationText: string | null;
    certainty: "CONFIRMED" | "UNCERTAIN" | "INFERRED_POSSIBILITY";
    sourcePhrase: string;
  }>;
  missingInformation: string[];
  suggestedQuestionIds: string[];
  differentFromRecentPattern: boolean;
  shareSuggested: boolean;
  shareReason: string | null;
  requiresDeterministicRuleCheck: boolean;
};
```

## Rules

```text
Do not diagnose.
Do not attribute a symptom to a medicine.
Separate stated fact from uncertainty.
Choose no more than two question IDs from the supplied catalogue.
Do not invent a question.
Do not give clinical advice.
Use observational language.
```

# 14.6 Update summary schema

```ts
type PatientUpdateSummary = {
  heading: string;
  observations: Array<{
    label: string;
    value: string;
    certainty: string;
  }>;
  relevantRecentChange: string | null;
  patientQuestion: string | null;
  sourceEvidence: string[];
};
```

Only patient-confirmed observations may be included.

# 14.7 Simulated response schema

```ts
type SimulatedCareTeamResponse = {
  scenarioKey: string;
  message: string;
  actionsForToday: string[];
  reviewSuggested: boolean;
  urgentTemplateRequired: boolean;
};
```

## Rules

```text
This is a fictional response for a hackathon prototype.
Do not diagnose.
Do not recommend medication changes.
Do not state that the patient is safe.
Do not contradict the current plan.
Use only the supplied approved response family.
If the input requires an urgent template, do not generate free text.
```

## Reliability recommendation

Use a hybrid approach:

1. deterministic scenario classifier;
2. approved response template;
3. optional AI paraphrasing;
4. final schema validation;
5. fall back to template if AI fails.

---

# 15. Simulated response implementation

This feature must survive page refreshes and not depend on an in-memory timer.

## 15.1 Sending an update

`POST /api/daily-signals/send`

Transaction:

1. validate Daily Signal is confirmed;
2. create or retrieve MessageThread;
3. create patient Message;
4. set DailySignal status to `SENT`;
5. create SimulatedResponseJob:
   - dueAt = now + configured delay;
   - status = PENDING;
   - scenarioKey derived from observations;
6. create AuditEvent;
7. return thread ID and due time.

## 15.2 Polling

The Messages screen calls:

```text
GET /api/messages
```

every two seconds while a pending response exists.

The handler should call:

```ts
processDueSimulatedResponses()
```

before returning messages.

## 15.3 Processing

`processDueSimulatedResponses()`:

1. find jobs with:
   - status PENDING;
   - dueAt <= now;
2. load triggering message and structured observations;
3. select response scenario;
4. create synthetic response from template or constrained AI;
5. create Message with sender `SIMULATED_CARE_TEAM`;
6. mark job PROCESSED;
7. create AuditEvent;
8. return.

## 15.4 Why this pattern

It avoids:

- Redis;
- cron jobs;
- job queues;
- server process dependency;
- lost `setTimeout` callbacks;
- background-service complexity.

## 15.5 Notification

When a new response appears:

- update unread badge;
- show subtle toast;
- optionally play no sound;
- mark read when opened.

---

# 16. Deterministic care-plan compiler

The Care Plan Compiler has two stages.

## 16.1 Candidate extraction

AI extracts candidate tasks from unstructured sources.

## 16.2 Constraint matching

Candidate tasks are matched to pre-seeded verified templates.

Matching order:

1. explicit template key from fixture;
2. medication name and instruction pattern;
3. task title normalisation;
4. issuing service;
5. manual selection if ambiguous.

The match score may combine:

```text
title similarity
medication exact match
service match
frequency match
timing match
```

If confidence is below a threshold:

- do not schedule;
- mark Needs clarification.

No AI-generated constraint should become active automatically.

---

# 17. Planning engine

The planner must be a pure TypeScript domain service with deterministic tests.

## 17.1 Input

```ts
type PlannerInput = {
  dateRange: { start: Date; end: Date };
  tasks: VerifiedCareTask[];
  anchors: LifeAnchor[];
  preferences: PatientPreference[];
  frictionFactors: FrictionFactor[];
  supportPeople: SupportPerson[];
  existingAppointments: Appointment[];
};
```

## 17.2 Output

```ts
type PlannerOutput = {
  scheduledItems: ScheduledItemDraft[];
  bundles: BundleDraft[];
  unplaced: UnplacedTask[];
  metrics: PlanMetrics;
  explanations: string[];
};
```

## 17.3 Algorithm

### Phase A: expand recurring tasks

Convert frequency rules into concrete occurrences.

Examples:

- daily;
- twice daily;
- selected weekdays;
- weekly within a day range;
- one-off appointment.

### Phase B: block anchors

Reserve:

- work;
- school run;
- childcare;
- appointments;
- protected activities;
- sleep boundary.

### Phase C: place fixed tasks

Fixed tasks are placed first.

If a fixed task conflicts with a protected anchor:

- keep clinical placement;
- record conflict;
- do not silently move either item.

### Phase D: generate candidate slots

For each movable task:

1. generate slots inside verified time windows;
2. use five-minute or fifteen-minute increments;
3. remove slots outside waking hours;
4. remove slots violating location or equipment requirements;
5. account for task duration.

### Phase E: score slots

Suggested scoring:

```text
+40 same bundle group within 30 minutes
+25 aligns with preferred routine
+20 equipment available
+15 support person available when needed
+10 reduces number of notifications
-50 overlaps protected anchor
-35 known time friction
-30 location mismatch
-25 creates a new care interruption
-20 high-friction period
-10 creates unnecessary travel
```

Weights should live in one config file.

### Phase F: place highest-priority task

Sort tasks by:

1. fixed criticality;
2. number of candidate slots ascending;
3. time sensitivity;
4. frequency;
5. duration.

Choose highest-scoring valid slot.

### Phase G: bundle compatible tasks

Bundle only when:

- windows remain satisfied;
- location matches;
- prerequisites do not conflict;
- combined duration is reasonable;
- patient preference supports bundling.

### Phase H: mark unplaced tasks

If no valid slot exists:

```text
status = NEEDS_CLARIFICATION
reason = NO_VALID_SLOT
```

Never drop the task.

## 17.4 Metrics

Calculate:

- actions;
- care moments;
- interruptions;
- total minutes;
- tasks during work;
- tasks away from required equipment;
- unresolved conflicts;
- delegated tasks.

## 17.5 Definition of interruption

A care interruption is a separate bundle or standalone care action more than 30 minutes from another care action.

Keep this threshold configurable.

---

# 18. Today-is-difficult adjustment

This is not a second care plan.

## Input

- today’s current schedule;
- patient-selected obstacle;
- current support availability;
- active verified tasks;
- approved movement constraints.

## Permitted changes

- move flexible items within their windows;
- group flexible tasks;
- defer administrative or informational tasks when already permitted;
- delegate allowed non-clinical tasks;
- reduce notification frequency;
- show an unresolved conflict.

## Forbidden changes

- remove medication;
- move a fixed clinical task;
- change dose;
- mark a missed task safe;
- infer capacity;
- claim a minimum-safe plan.

## Data handling

Create an adjustment record or a replacement set of today’s scheduled items under the same active CarePlanVersion.

---

# 19. Care Plan Stress Test

## 19.1 Input

- active plan;
- proposed CarePlanChange;
- current Life Map;
- current preferences and friction factors.

## 19.2 Process

1. clone active tasks;
2. add proposed tasks;
3. expand occurrences over the update duration;
4. run planner;
5. compare baseline and proposed outputs;
6. generate diff;
7. create proposed CarePlanVersion;
8. persist SimulationResult.

## 19.3 Diff calculations

```text
actionsAdded =
proposed action count - baseline action count

minutesAdded =
proposed care minutes - baseline care minutes

interruptionsAddedBeforeOptimisation =
naive new standalone actions

interruptionsAfterOptimisation =
planned care moments - baseline care moments

workConflicts =
proposed occurrences overlapping work anchors

familyConflicts =
proposed occurrences overlapping protected family anchors

bundledTasks =
new occurrences placed into existing bundles

movedTasks =
existing flexible occurrences whose time changed

delegatedTasks =
tasks assigned to a permitted support person

unplacedTasks =
occurrences with no valid slot
```

## 19.4 Explainability

Every change must have a reason.

Example:

> “Blood-pressure reading moved to 08:20 because its approved morning window includes that time and the cuff is available at home before work.”

Example unresolved:

> “Thursday evening reading could not be placed because every permitted slot overlaps childcare and the task may not be delegated.”

---

# 20. Personalised Daily Signal

## 20.1 Personalisation sources

The opening prompt and question options should be generated from:

- conditions;
- active care tasks;
- recent medication or monitoring changes;
- previous seven Daily Signals;
- last response;
- unresolved observation;
- patient’s interaction preference.

## 20.2 Prompt builder

Pure function:

```ts
buildDailySignalContext(patientId): DailySignalContext
```

Output:

```ts
{
  greetingPrompt,
  monitoringDomains,
  recentChanges,
  previousObservations,
  allowedQuestionIds,
  maxQuestions: 2
}
```

## 20.3 Trend comparison

Do not use an opaque clinical-risk score.

Compare observations with recent history:

- first reported;
- consecutive days;
- improving;
- worsening;
- unchanged;
- uncertain.

Example:

> “Stomach discomfort has been reported for three consecutive check-ins, compared with none in the previous four.”

## 20.4 Share suggestion logic

Share may be suggested when:

- a new observation persists;
- a trend worsens;
- a symptom appears after a recent care-plan change;
- a clinician-style response requested monitoring;
- the patient explicitly asks for review;
- a configured non-urgent review rule matches.

The patient still approves routine sharing.

---

# 21. Safety rules

The prototype must avoid presenting itself as a diagnostic or validated triage tool.

## 21.1 Implement one synthetic urgent demonstration

Example rule:

```text
severe persistent abdominal pain
AND pain spreads to back
```

The exact wording should be labelled as a synthetic demonstration rule, not clinical guidance for deployment.

## 21.2 Behaviour

When triggered:

- stop the normal Daily Signal review;
- show a red-accent state;
- state that a configured urgent rule matched the confirmed answers;
- display a fictional urgent-action template;
- do not create a routine delayed response as the primary action;
- allow the user to view confirmed evidence.

## 21.3 No false reassurance

Never show:

- “You are safe.”
- “Nothing serious is happening.”
- “This is normal.”
- “AI found no risk.”

Use:

> “No configured urgent demonstration rule was triggered by the information you confirmed.”

---

# 22. API contracts

# 22.1 Upload document

```text
POST /api/documents/upload
Content-Type: multipart/form-data
```

Response:

```json
{
  "documents": [
    {
      "id": "doc_1",
      "filename": "cardiology-discharge-summary.pdf",
      "status": "UPLOADED"
    }
  ]
}
```

# 22.2 Extract documents

```text
POST /api/documents/extract
```

Request:

```json
{
  "documentIds": ["doc_1", "doc_2"]
}
```

Response:

```json
{
  "candidateTaskCount": 8,
  "uncertaintyCount": 1,
  "status": "EXTRACTED"
}
```

# 22.3 Confirm onboarding tasks

```text
POST /api/onboarding/confirm
```

Request:

```json
{
  "decisions": [
    {
      "candidateTaskId": "task_1",
      "decision": "PATIENT_CONFIRMED"
    }
  ]
}
```

# 22.4 Update Life Map

```text
PUT /api/life-map
```

# 22.5 Generate plan

```text
POST /api/plans/generate
```

Request:

```json
{
  "reason": "INITIAL_ONBOARDING"
}
```

# 22.6 Transcribe audio

```text
POST /api/audio/transcribe
Content-Type: multipart/form-data
```

# 22.7 Extract Daily Signal

```text
POST /api/daily-signals/extract
```

Request:

```json
{
  "dailySignalId": "signal_1",
  "text": "My stomach has felt uncomfortable..."
}
```

# 22.8 Confirm Daily Signal

```text
POST /api/daily-signals/confirm
```

# 22.9 Send update

```text
POST /api/daily-signals/send
```

Response:

```json
{
  "threadId": "thread_1",
  "messageId": "message_1",
  "responseDueAt": "2026-07-17T20:10:10.000Z"
}
```

# 22.10 Retrieve messages

```text
GET /api/messages
```

This endpoint processes due simulated responses before returning.

# 22.11 List care updates

```text
GET /api/care-updates
```

# 22.12 Simulate update

```text
POST /api/care-updates/[changeId]/simulate
```

# 22.13 Accept update

```text
POST /api/care-updates/[changeId]/accept
```

# 22.14 Ask for clarification

```text
POST /api/clarifications/send
```

Creates a message thread and delayed synthetic response job.

# 22.15 Reset demo

```text
POST /api/demo/reset
```

Request:

```json
{
  "checkpoint": "ONBOARDING_START"
}
```

Supported checkpoints:

```text
ONBOARDING_START
INITIAL_PLAN_READY
DAILY_SIGNAL_READY
DAILY_SIGNAL_SENT
RESPONSE_RECEIVED
CARE_UPDATE_RECEIVED
SIMULATION_READY
UPDATED_PLAN_ACCEPTED
```

---

# 23. State management

Use the database as the source of truth.

Avoid a large global client store.

## Server state

- patient;
- onboarding;
- tasks;
- Life Map;
- plan versions;
- scheduled items;
- Daily Signals;
- messages;
- pending response jobs;
- care updates;
- simulations.

## Local UI state

- open drawer;
- current form values;
- audio recording;
- temporary transcript edits;
- loading state;
- selected Life Map chips.

Use React state or React Hook Form.

For data refresh:

- server components on initial load;
- `router.refresh()` after mutations;
- lightweight polling on Messages and notification badge;
- no Redux required.

---

# 24. Error handling and resilience

Every asynchronous feature requires:

- loading state;
- success state;
- recoverable error state;
- Retry;
- preserved input.

## Document errors

- unsupported type;
- file too large;
- extraction failed;
- malformed output;
- missing source evidence.

## Audio errors

- microphone denied;
- recording unsupported;
- upload failed;
- transcription failed;
- empty transcript.

## AI errors

- refusal;
- timeout;
- invalid schema;
- rate limit;
- model unavailable.

## Planner errors

- no active tasks;
- invalid time window;
- impossible plan;
- corrupted task template.

## Simulation errors

- missing active plan;
- proposed task missing constraints;
- no valid date range.

## Fallback mode

When `DEMO_AI_FALLBACK=true`, use deterministic fixtures based on scenario keys.

The UI should remain identical.

A presenter-only badge on `/demo` may reveal fallback mode. The patient UI should not misleadingly claim a live AI call if a fixture was used; a subtle “Demo processing” label is acceptable.

---

# 25. Synthetic fixtures

# 25.1 Sample cardiology document

Include:

- patient name;
- morning weight;
- morning blood-pressure measurement;
- cardiology appointment;
- contact instruction;
- source date.

# 25.2 Sample diabetes document

Include:

- Metformin with breakfast;
- evening foot check;
- questionnaire;
- diabetes review.

# 25.3 GP note

Include:

- prescription collection;
- Levothyroxine;
- Atorvastatin;
- administrative follow-up.

# 25.4 Daily Signal fixtures

Scenarios:

```text
NORMAL_SAME
GI_CHANGE_NON_URGENT
FATIGUE_AND_BUSY_DAY
BREATHLESSNESS_CHANGE
URGENT_SYNTHETIC_RULE
```

# 25.5 Response fixtures

```text
MONITOR_AND_REVIEW_IF_PERSISTENT
ROUTINE_REVIEW_OFFERED
REQUEST_MORE_INFORMATION
CLARIFICATION_APPROVED
CLARIFICATION_NO_CHANGE
URGENT_TEMPLATE
```

# 25.6 Care update fixture

```text
TWICE_DAILY_BP_14_DAYS
```

---

# 26. Testing strategy

# 26.1 Unit tests

## Planner

- fixed task stays fixed;
- flexible task remains inside approved window;
- task requiring home equipment is not placed during work;
- protected anchor is respected where possible;
- conflict is surfaced when unavoidable;
- compatible tasks bundle;
- incompatible locations do not bundle;
- delegation occurs only when permitted;
- no task silently disappears.

## Stress Test

- 14 days × 2 measurements = 28 actions;
- naive interruption count is calculated;
- optimised interruption count decreases after bundling;
- work conflict is detected;
- moved task is listed;
- unplaced task is retained;
- active plan is not replaced before acceptance.

## Daily Signal

- exact source phrase preserved;
- uncertainty preserved;
- no diagnosis field exists;
- no more than two questions;
- irrelevant questions excluded;
- recent medication change affects question choice;
- “feel the same” records without sharing;
- urgent synthetic rule activates deterministic route.

## Simulated responses

- job created with future dueAt;
- no response before dueAt;
- response created after dueAt;
- processing is idempotent;
- refresh does not lose job;
- failure falls back to template;
- unread badge increments.

# 26.2 Integration tests

- upload document → extract tasks;
- confirm tasks → attach templates;
- save Life Map → generate plan;
- Daily Signal → questions → review → send;
- polling → synthetic response;
- care update → simulation → preview → accept.

# 26.3 End-to-end Playwright flow

```text
reset to onboarding
→ accept consent
→ select sample documents
→ process
→ confirm tasks
→ create Life Map
→ accept initial plan
→ open Today
→ record or type Daily Signal
→ answer questions
→ review and send
→ wait for synthetic response
→ verify Messages
→ trigger care update from demo API
→ inspect Stress Test
→ preview plan
→ accept plan
→ verify Today changed
```

# 26.4 Visual test checklist

- all screens render at 390 × 844;
- bottom navigation remains fixed;
- content does not hide behind navigation;
- no horizontal overflow;
- long text wraps;
- keyboard does not trap form actions;
- loading states resemble final layout;
- colours remain consistent.

---

# 27. Security and privacy

Although data is synthetic, implement sensible patterns.

## Requirements

- API key server-side only;
- no secrets in `NEXT_PUBLIC_*`;
- file type and size validation;
- random stored filenames;
- path traversal prevention;
- no raw HTML rendering;
- Zod validation for every API input;
- CSRF risk limited by local demo but use same-origin routes;
- no patient content in ordinary production logs;
- no real medical documents;
- display synthetic-data warning;
- use `store: false` on supported OpenAI calls where appropriate;
- delete temporary audio after transcription if practical.

## Disclaimer

Display:

> “Hackathon prototype using synthetic information. Not a medical device and not for real patient care.”

---

# 28. Performance

Targets:

- Today screen visible in under one second with seeded local data;
- plan generation under 300 ms for the synthetic profile;
- simulation under 500 ms;
- AI loading state shown immediately;
- no blocking ten-second response spinner;
- polling every two seconds only while pending;
- stop polling when no jobs are pending.

Document extraction and transcription may take longer; show stages.

---

# 29. Logging and auditability

Use structured server logging for technical events without raw sensitive text.

Log:

- request ID;
- route;
- duration;
- success/failure;
- scenario key;
- entity ID.

Persist AuditEvent records for demo timeline.

The `/demo` page can display:

```text
20:04 Document uploaded
20:04 Candidate tasks extracted
20:05 Life Map saved
20:05 Plan generated
20:07 Daily Signal sent
20:07 Simulated response scheduled
20:07 Simulated response delivered
20:10 Care update received
20:10 Stress Test completed
20:11 Updated plan accepted
```

---

# 30. Implementation priorities

# Priority 0: Must work

- seeded Eleanor;
- patient navigation;
- initial active plan;
- Today;
- Care Plan;
- Add to My Life;
- Daily Signal typed flow;
- structured AI extraction or fixture;
- review and send;
- delayed synthetic response;
- care update;
- Stress Test;
- plan preview;
- plan acceptance;
- demo reset.

# Priority 1: Strongly desired

- document upload;
- real PDF extraction;
- voice recording;
- transcription;
- personalised question catalogue;
- source evidence;
- Today-is-difficult adjustment;
- clarification response flow.

# Priority 2: Polish

- animations;
- charts;
- PWA manifest;
- large-text setting;
- audio waveform;
- skeletons;
- detailed audit timeline.

If time is constrained, typed Daily Signal is more important than voice.

---

# 31. Overnight build schedule

## Friday 17 July 2026

### 19:00–20:00 — Bootstrap

- create Next.js project;
- configure TypeScript, Tailwind, linting;
- install Prisma and SQLite adapter;
- create schema;
- seed Eleanor;
- create design tokens;
- create route skeletons.

### 20:00–22:00 — Patient shell and core screens

- MobileShell;
- app header;
- bottom navigation;
- Today;
- Care Plan;
- Add to My Life;
- Messages;
- static seeded data.

### 22:00–23:30 — Planner domain

- task expansion;
- anchors;
- slot generation;
- scoring;
- bundling;
- metrics;
- unit tests.

### 23:30–01:00 — Onboarding

- welcome;
- build options;
- upload;
- sample documents;
- review extracted tasks;
- Life Map save;
- initial plan generation.

### 01:00–02:30 — Daily Signal

- typed entry;
- question catalogue;
- structured extraction;
- review;
- send;
- persistence.

### 02:30–03:30 — Simulated response

- message threads;
- response jobs;
- processing on poll;
- 10-second delay;
- Messages UI.

### 03:30–06:30 — Sleep

Do not eliminate all sleep. The simulation and planner require accurate reasoning.

## Saturday 18 July 2026

### 06:30–08:30 — Care update and Stress Test

- care update fixture;
- notification;
- simulation;
- metrics;
- unresolved conflict.

### 08:30–10:00 — Updated plan preview

- diff;
- proposed version;
- preview;
- accept;
- Today update.

### 10:00–11:00 — Voice

- MediaRecorder;
- transcription;
- transcript editing;
- fallback.

### 11:00–12:00 — Error and demo controls

- reset;
- checkpoints;
- fixture mode;
- error states;
- audit timeline.

### 12:00–13:00 — Testing

- unit tests;
- end-to-end run;
- refresh resilience;
- no-network fallback;
- microphone denial.

### 13:00–14:00 — Visual polish

- align with supplied images;
- responsive viewport;
- text wrapping;
- loading skeletons;
- badge consistency.

### 14:00–14:30 — Rehearsal

Run the demo three times.

### 14:30–15:00 — Submission buffer

Only fix crashes or demo blockers.

---

# 32. Optional two-person work split

## Developer A: domain and backend

- Prisma schema;
- seed;
- AI routes;
- planner;
- Stress Test;
- simulated response service;
- tests.

## Developer B: patient UI

- design system;
- onboarding;
- Today;
- Care Plan;
- Life Map;
- Daily Signal UI;
- Messages;
- responsive polish.

Integration checkpoints:

- 22:00;
- 01:00;
- 09:00;
- 12:00.

Avoid editing the same files concurrently.

---

# 33. Codex agent work packages

These can be assigned sequentially or to separate agents.

## Agent 1: Foundation

Deliver:

- scaffold;
- dependencies;
- lint and test config;
- design tokens;
- route skeletons;
- README;
- environment validation.

Acceptance:

```text
npm install
npm run dev
npm run lint
npm test
```

all execute.

## Agent 2: Database and fixtures

Deliver:

- Prisma schema;
- migrations;
- seed;
- fixture loaders;
- reset endpoint.

Acceptance:

- reset creates Eleanor and all starting data;
- reset is idempotent.

## Agent 3: UI shell

Deliver:

- MobileShell;
- header;
- bottom navigation;
- shared cards and buttons;
- all page shells.

Acceptance:

- matches reference layout at mobile size;
- no overflow.

## Agent 4: Planner

Deliver:

- domain types;
- recurrence expansion;
- slot generation;
- scoring;
- bundling;
- metrics;
- tests.

Acceptance:

- no task silently omitted;
- deterministic output.

## Agent 5: Onboarding and compiler

Deliver:

- upload;
- extraction;
- review;
- template matching;
- source evidence;
- initial plan acceptance.

Acceptance:

- sample documents produce candidate tasks and an active plan.

## Agent 6: Life Map

Deliver:

- forms;
- anchors;
- priorities;
- preferences;
- friction factors;
- plan regeneration.

Acceptance:

- changing work hours changes simulation output.

## Agent 7: Daily Signal

Deliver:

- typed and voice entry;
- transcription;
- extraction;
- question selection;
- review;
- safety rule.

Acceptance:

- no more than two questions;
- source evidence visible.

## Agent 8: Simulated messages

Deliver:

- threads;
- jobs;
- polling;
- delayed response;
- Messages UI;
- idempotency tests.

Acceptance:

- response arrives after configured delay and survives refresh.

## Agent 9: Stress Test

Deliver:

- care update;
- simulation;
- diff;
- metrics;
- preview;
- acceptance.

Acceptance:

- 28 new actions displayed for twice-daily × 14 days;
- active plan changes only on acceptance.

## Agent 10: E2E and polish

Deliver:

- Playwright demo flow;
- error states;
- loading states;
- accessibility fixes;
- final README.

---

# 34. Definition of done

## Functional

- all bottom-navigation destinations work;
- onboarding can be completed;
- documents can be processed or fixture-fallback used;
- candidate tasks can be reviewed;
- Life Map can be saved;
- plan is generated from stored data;
- Today reflects active plan;
- Daily Signal can be typed;
- voice works or degrades gracefully;
- questions are personalised;
- update can be reviewed and sent;
- response appears after delay;
- care update can be inserted;
- Stress Test works;
- preview works;
- acceptance changes plan;
- reset works.

## Safety

- no diagnosis;
- no medication-change recommendation;
- no task removed because AI decided it was safe;
- uncertain extraction remains uncertain;
- simulated responses are labelled;
- synthetic-data disclaimer visible;
- urgent rule uses deterministic template.

## Technical

- TypeScript compiles;
- lint passes;
- tests pass;
- no API key exposed;
- refresh does not lose state;
- database reset is reliable;
- no required external service other than OpenAI;
- fixture fallback supports a no-network demo.

## Visual

- mobile layout matches mock-up system;
- bottom navigation consistent;
- buttons are located consistently;
- typography legible;
- no dense screen;
- no excessively minimal screen;
- care-plan update flow visually clear.

---

# 35. Final demo script

## 0:00–0:20 — Problem

> “Eleanor manages several long-term conditions. Each healthcare service gives reasonable instructions, but no one tests whether all of them fit into her actual week.”

Show disconnected source documents briefly.

## 0:20–0:50 — Compile

Upload sample documents.

Show candidate care tasks with exact sources.

Confirm them.

## 0:50–1:15 — Personalise

Show Add to My Life:

- work;
- school run;
- family time;
- evening walk;
- long commute;
- fewer notifications.

Show initial Today plan bundled into a few care moments.

## 1:15–2:00 — Daily Signal

Speak or type:

> “My stomach has felt uncomfortable for a few days and I’m more tired than usual, but I’m still eating and drinking.”

Show:

- transcript;
- personalised questions;
- structured observations;
- patient approval;
- sent state.

Continue explaining another screen for several seconds, then open Messages and reveal the simulated response.

## 2:00–2:50 — New care instruction

Trigger the cardiology update.

Show:

- 28 actions added;
- interruption impact;
- work conflicts;
- what CareLoad can resolve;
- one unresolved conflict.

## 2:50–3:20 — Replan

Preview updated plan.

Show:

- morning reading bundled;
- questionnaire moved;
- prescription delegated;
- protected family commitment.

Accept.

Return to Today.

## Closing

> “CareLoad does not ask why Eleanor failed a care plan. It asks whether healthcare designed a plan a human being could realistically live.”

---

# 36. Risks and mitigations

## AI extraction is slow

Mitigation:

- stage-based progress;
- fixtures;
- process only two short documents;
- cache output.

## OpenAI unavailable

Mitigation:

- fixture fallback;
- no-network demo mode;
- visible presenter setting.

## Planner too complex

Mitigation:

- greedy deterministic algorithm;
- limited task types;
- one patient;
- one-week or fourteen-day horizon;
- no general optimisation solver.

## Voice permission fails

Mitigation:

- typed input is first-class;
- transcript fixture;
- test browser permissions beforehand.

## Ten-second response fails

Mitigation:

- persisted dueAt job;
- processing during poll;
- deterministic response template;
- presenter button to process due jobs.

## UI takes too long

Mitigation:

- reuse components;
- use mock-ups as authority;
- prioritise Today, Daily Signal, Stress Test, Messages;
- no custom animation framework.

## Scope expands

Mitigation:

Do not add:

- clinician dashboard;
- real authentication;
- real NHS integration;
- social features;
- more patient profiles;
- wearable integration;
- diagnosis;
- extra disease pathways.

---

# 37. Future product direction, not hackathon scope

Potential future work:

- approved healthcare-record integration;
- clinician verification workflow;
- pharmacist review;
- multi-patient support;
- caregiver application;
- calendar integration;
- care-plan burden analytics for providers;
- formal optimisation solver;
- evaluated symptom-monitoring pathways;
- accessibility research;
- multilingual voice support;
- stale-instruction detection;
- provider-facing Care Plan Stress Test before new instructions are issued.

None of these should be required for the hackathon build.

---

# 38. Authoritative final product statement

> **CareLoad is a patient-facing treatment-burden operating system. It uses AI to compile fragmented care instructions and understand optional natural-language check-ins, while deterministic constraints and planning logic organise those instructions around the patient’s real life. When something changes, CareLoad simulates the impact, replans what it is allowed to move, and exposes anything that cannot be resolved without clarification.**

# 39. Authoritative final scope statement

The prototype contains:

- one synthetic patient;
- one mobile-first patient application;
- synthetic medical documents;
- AI document extraction;
- a verified task template layer;
- a patient Life Map;
- one deterministic planner;
- one optional Daily Signal;
- personalised follow-up questions;
- one patient-approved update;
- one delayed simulated care-team response;
- one synthetic clinical update;
- one Care Plan Stress Test;
- one updated-plan preview;
- one plan-acceptance flow;
- one deterministic urgent demonstration rule;
- a hidden presenter reset route.

It contains no clinician-facing application.

# 40. Final implementation instruction to Codex agents

Implement the application from domain rules outward:

1. Establish data models and seeds.
2. Implement deterministic planner and simulation with tests.
3. Implement patient UI around stored states.
4. Add AI extraction behind strict schemas.
5. Add persisted delayed responses.
6. Add fixture fallbacks.
7. Polish against the supplied mock-ups.
8. Refuse scope expansion until the complete demo path works.

A visually polished partial mock-up is not sufficient.

A working, source-grounded, deterministic end-to-end state machine is the goal.
