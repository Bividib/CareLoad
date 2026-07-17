# CareLoad

CareLoad is a mobile-first, patient-only hackathon prototype that compiles synthetic care instructions into a source-grounded workload, fits verified tasks around a fictional patient’s Life Map with a deterministic planner, and stress-tests one synthetic cardiology update.

> Synthetic information only. Not a medical device. Not for real patient care. CareLoad does not diagnose, triage, prescribe, recommend medication changes, or connect to a real care team.

## Architecture

- Next.js App Router, React, strict TypeScript and mobile-first CSS
- SQLite through Prisma as the refresh-safe state source
- Pure deterministic TypeScript for scheduling, safety rules, response scenarios and replanning
- Server-only OpenAI Responses API structured extraction and audio transcription
- Zod validation at request and AI-output boundaries
- Deterministic fixtures for every AI-dependent demo step
- Persisted delayed response jobs processed idempotently during polling

## Setup and local run

Requires Node.js 20.9+ and npm.

```bash
npm install
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm run db:reset
npm run dev
```

Open <http://localhost:3000>. Presenter controls are at <http://localhost:3000/demo> and never appear in patient navigation. Screenshots used as visual references are in `/images`.

## Environment variables

```text
DATABASE_URL=file:./dev.db
OPENAI_API_KEY=                 # optional; server-side only
OPENAI_TEXT_MODEL=gpt-5.6
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe
DEMO_AI_FALLBACK=true          # complete no-key path
DEMO_RESPONSE_DELAY_MS=10000
```

Never expose the API key through `NEXT_PUBLIC_*`.

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

`/demo` can reset state, seed eight documented checkpoints, trigger the synthetic update, process due response jobs, toggle persisted fixture mode, and show the audit timeline. Fixture mode preserves the same stored transitions and UI as live mode and needs no OpenAI key.

See [`docs/DEMO_CHECKLIST.md`](docs/DEMO_CHECKLIST.md) for the exact presentation sequence and recovery shortcuts, and [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) for evidence by milestone.

## Safety limitations

The only patient is fictional Eleanor Reed. Documents, conditions, medicines, care organisations, messages, responses and urgent demonstration rule are synthetic. AI output never creates active clinical constraints; only predefined verified task templates can be scheduled. There is exactly one active care plan, and a proposed update becomes active only after patient acceptance.
