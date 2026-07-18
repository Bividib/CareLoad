# CareLoad

CareLoad is a mobile-first, patient-only hackathon prototype for Eleanor Reed, a fictional person living with several long-term conditions. It addresses the problem that individually sensible care instructions can become an unrealistic combined workload. CareLoad compiles synthetic instructions into a source-grounded Care Work Graph, fits only verified task templates around Eleanor’s Life Map with a deterministic planner, and stress-tests one synthetic cardiology update.

> Synthetic information only. Not a medical device. Not for real patient care. CareLoad does not diagnose, triage, prescribe, recommend medication changes, or connect to a real care team.

## Solution and architecture

- Next.js App Router, React, strict TypeScript and mobile-first CSS
- SQLite through Prisma as the refresh-safe state source
- Pure deterministic TypeScript for scheduling, safety rules, response scenarios and replanning
- Server-only OpenAI Responses API structured extraction and audio transcription; AI reads language and drafts candidate observations, but never schedules work or sets clinical constraints
- Zod validation at request and AI-output boundaries
- Deterministic fixtures for every AI-dependent demo step
- Persisted delayed response jobs processed idempotently during polling

## Setup and local run

Requires Node.js 20.9+ and npm.

```bash
npm install
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env -ErrorAction SilentlyContinue
```

On macOS/Linux:

```bash
cp -n .env.example .env
```

Then:

```bash
npm run db:reset
npm run dev
```

Open <http://localhost:3000>. Presenter controls are at <http://localhost:3000/demo> and never appear in patient navigation. Screenshots used as visual references are in `/images`.

## Environment variables

```text
DATABASE_URL=file:./dev.db
OPENAI_API_KEY=                 # optional; server-side only
OPENAI_TEXT_MODEL=gpt-5-mini
ELEVENLABS_API_KEY=             # optional; server-side only
ELEVENLABS_STT_MODEL=scribe_v2
ELEVENLABS_BASE_URL=https://api.elevenlabs.io
DEMO_AI_FALLBACK=true          # complete no-key path
DEMO_AI_TIMEOUT_MS=25000       # bounded live AI wait; input is preserved
DEMO_RESPONSE_DELAY_MS=10000
```

CareLoad uses repository-root `.env`; `.env.local` is also ignored but is not
required by the documented setup. Never expose either API key through
`NEXT_PUBLIC_*`.

## Database and verification

```bash
npm run db:reset
npm run db:seed
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Reset is destructive only to the local synthetic demo database and is idempotent.

## Demo controls and fixture mode

`/demo` can reset state, seed eight documented checkpoints, trigger the synthetic update, process due response jobs, toggle persisted fixture mode, and show the audit timeline. Fixture mode preserves the same stored transitions and UI as live mode and needs no OpenAI key. The patient demo starts at `/`.

See [`docs/FINAL_DEMO_RUNBOOK.md`](docs/FINAL_DEMO_RUNBOOK.md) for the exact presentation sequence and recovery shortcuts, [`docs/FINAL_ACCEPTANCE_AUDIT.md`](docs/FINAL_ACCEPTANCE_AUDIT.md) for verified evidence, and [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) for milestone status.

Release-closure evidence and remaining personal checks are in
[`docs/RELEASE_CLOSURE_STATUS.md`](docs/RELEASE_CLOSURE_STATUS.md),
[`docs/MANUAL_MICROPHONE_TEST.md`](docs/MANUAL_MICROPHONE_TEST.md), and
[`docs/FINAL_REHEARSAL_LOG.md`](docs/FINAL_REHEARSAL_LOG.md).

## Safety limitations

The only patient is fictional Eleanor Reed. Documents, conditions, medicines, care organisations, messages, responses and urgent demonstration rule are synthetic. AI output never creates active clinical constraints; only predefined verified task templates can be scheduled. There is exactly one active care plan, and a proposed update becomes active only after patient acceptance.

## Current prototype scope

The stack is Next.js 16, React 19, strict TypeScript, Prisma/SQLite, Zod, the OpenAI Node SDK, Vitest, Testing Library, and Playwright. Scope is intentionally limited to one patient, one active plan, one synthetic update, patient-facing screens, local persistence, and simulated messaging. There is no real authentication, EHR connection, clinician application, emergency workflow, production privacy control, or support for real medical information.
