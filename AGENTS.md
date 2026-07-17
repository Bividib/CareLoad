# CareLoad engineering guide

This file is the repository-level instruction set for contributors and coding
agents. `CareLoad_Full_Implementation_Plan.md` is the authoritative product
specification. If this guide and the plan appear to conflict, preserve the
safer behaviour and update this guide before implementation proceeds.

## Product definition

CareLoad is a mobile-first, patient-facing treatment-burden planner for a
hackathon prototype. It compiles fragmented synthetic care instructions into a
source-grounded Care Work Graph, combines them with the patient's Life Map, and
uses deterministic planning to fit verified work around real-life constraints.
It also supports an optional patient-confirmed Daily Signal, delayed and clearly
labelled simulated care-team responses, and a Care Plan Stress Test for one
synthetic care update.

The prototype supports one fictional patient, Eleanor Reed, and synthetic data
only. External healthcare organisations and responses are simulated, but every
visible application state transition must be real, persisted, and refresh-safe.
There is one active care plan, with previews and versioned proposed updates.

## Non-negotiable safety boundaries

- This is not a medical device and must never be presented as suitable for real
  patient care.
- Use synthetic information only. Never add or process real patient data.
- Do not diagnose, triage, prescribe, recommend medication changes, or claim
  that an action is clinically safe to skip, delay, or stop.
- Never provide false reassurance such as "you are safe", "this is normal", or
  "AI found no risk".
- AI output is candidate information, never the source of active clinical
  constraints. Active tasks must match a pre-verified task template.
- Preserve source document, exact supporting text, confidence, uncertainty, and
  verification status for every AI-extracted care instruction.
- Do not schedule an unmatched or ambiguous candidate task. Retain it visibly
  as `NEEDS_CLINICAL_VERIFICATION` or `NEEDS_CLARIFICATION`.
- Never silently discard a task or conflict. Unplaceable work remains visible
  with a deterministic reason.
- The patient must approve candidate facts, Life Map entries, routine updates,
  and proposed plan versions. Routine Daily Signals are optional.
- "Today is difficult" may only move already-flexible work within verified
  windows, bundle permitted work, reduce notifications, delegate explicitly
  delegable non-clinical work, or expose conflicts. It must not create a second
  or "minimum safe" plan.
- Simulated care-team content must be conspicuously labelled and must not
  diagnose, alter medication, contradict the active plan, or imply a real care
  relationship.
- Urgent behaviour is limited to the single explicitly synthetic,
  deterministic demonstration rule and its predefined fictional template. It
  is not deployable clinical guidance.
- OpenAI calls are server-side, schema-constrained, validated, retry-limited,
  uncertainty-preserving, and backed by deterministic fixtures.
- Keep secrets out of client bundles and `NEXT_PUBLIC_*` variables. Do not log
  raw patient-style content.

## Architecture decisions

- Next.js App Router, React, and strict TypeScript form one responsive web app.
- Tailwind CSS and CSS custom properties provide a mobile-first design system.
  The patient shell targets a maximum content width of about 430 px.
- SQLite through Prisma is the eventual source of truth for server state.
  Avoid a large global client store; use server components, route handlers,
  `router.refresh()`, local React state, and limited polling.
- Domain logic lives outside React in pure TypeScript modules. The planner,
  constraint matching, safety rules, scheduling, simulation, versioning, and
  metrics are deterministic and independently testable.
- Probabilistic language understanding is separated from deterministic policy.
  Zod schemas are shared by API validation and structured AI output validation.
- There is exactly one active care plan. Proposed changes use versioned,
  transactional state transitions and become active only after acceptance.
- Delayed simulated responses use persisted `dueAt` jobs processed
  idempotently during message polling. Do not use in-memory timers, WebSockets,
  queues, cron, or background infrastructure for the prototype.
- Every mutation that matters to the demo creates an audit event.
- Fixture fallback must preserve the same UI and stored state transitions as
  live AI mode.
- Route handlers and domain services own mutations. UI components do not embed
  database, AI, or clinical-constraint decisions.

## Coding conventions

- Keep TypeScript strict. Do not use `any`; prefer `unknown` plus validation.
- Use named domain types and discriminated unions for statuses and results.
- Prefer pure functions, explicit inputs, immutable outputs, and deterministic
  clocks/IDs injected at boundaries where tests require control.
- Validate every API request and external/AI response with Zod before use.
- Use server components by default and add `"use client"` only for genuine
  browser interaction.
- Keep components focused and reusable; place product rules in `domain/`, not
  JSX or route handlers.
- Use accessible semantic HTML, visible focus styles, 44 px minimum touch
  targets, plain language, and text alternatives. Never encode meaning by
  colour alone.
- Preserve user input across recoverable errors and provide loading, success,
  error, and retry states for asynchronous work.
- Use lower-case kebab-case for route folders, PascalCase for React component
  files/exports, and lower-case kebab-case for non-component module files.
- Use path alias `@/*` for repository-root imports.
- Co-locate small component tests with their source; place domain, integration,
  and end-to-end suites under `tests/`.
- Tests must assert safety invariants and state transitions, not only snapshots.
- Comments should explain constraints or intent, not restate code.
- Do not edit generated artifacts such as `.next/`, coverage output, Prisma
  client output, or the SQLite database into source control.

## Required verification commands

Run all of these before handing off or committing:

```bash
npm run lint
npm run type-check
npm test
npm run build
```

For a foundation or runtime change, also prove the application starts:

```bash
npm run dev
```

Then request `/` and at least one scaffolded patient route and confirm successful
HTTP responses. When end-to-end coverage exists, also run `npm run test:e2e`.
When Prisma is introduced, run schema validation and the repository's reset/seed
verification before committing.

## Explicitly out of scope

- Full application implementation during the foundation milestone.
- Clinician, pharmacist, employer, provider, or administrator-facing products.
- Real authentication, authorisation, NHS/EHR integration, or external
  healthcare messaging.
- Real patient data, real medical documents, or production medical use.
- Multiple patients, additional disease pathways, arbitrary condition support,
  caregivers' applications, or social features.
- Diagnosis, autonomous triage, prescribing, adherence scoring, or clinical
  safety decisions.
- Real emergency-contact or urgent-care workflows.
- Wearables, calendars, notifications infrastructure, background workers,
  WebSockets, Redis, queues, or cron.
- A second predictive, lifestyle, reduced-care, or "minimum safe" plan.
- General-purpose calendar/to-do features, gamification, streaks, or mandatory
  daily logging.
- Formal optimisation solvers, provider analytics, multilingual voice, and
  other future-direction items listed in the implementation plan.

