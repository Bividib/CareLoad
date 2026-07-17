# CareLoad final demo runbook

## Install and configure

Requires Node.js 20.9+, npm, Chromium, and a laptop.

```powershell
npm install
Copy-Item .env.example .env
npm run db:reset
npm run dev
```

Use `DATABASE_URL=file:./dev.db` and `DEMO_RESPONSE_DELAY_MS=10000`.
For the reliable fixture demo set `DEMO_AI_FALLBACK=true`; no key is required.
Set `DEMO_AI_TIMEOUT_MS=25000` to bound each live AI request without silently
switching modes. Failed live requests retain the document or Daily Signal text
and offer Retry and an explicit demo result.
For live mode set `OPENAI_API_KEY` server-side, `OPENAI_TEXT_MODEL=gpt-5`,
`OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe`, and
`DEMO_AI_FALLBACK=false`, then turn fixture mode off at `/demo`. Never use a
`NEXT_PUBLIC_*` variable for a secret.

Recommended browser: current Chromium with browser notifications disabled.
Use 390 × 844 or 430 × 932. Allow microphone permission before presenting
voice capture; if denied or unavailable, select Type.

## Exact demo sequence

1. Open `http://localhost:3000/demo`, reset, then open `/`.
2. Accept both consent statements. Choose Upload documents, continue, and load
   all three sample documents.
3. Process and extract them. Review exact source quotes, confirm current
   matched tasks, leave ambiguous/unmatched candidates unresolved, save the
   Life Map, preview, and accept the initial plan.
4. On Today, show the stored active plan and protected life anchors.
5. Type: “My stomach has felt uncomfortable for a few days and I am more tired
   than usual, but I am still eating and drinking.”
6. Answer at most two follow-ups, review the preserved observations, confirm,
   and send the update.
7. Show the waiting state, navigate away, return and refresh. After about ten
   seconds show the labelled simulated care-team response and unread behavior.
8. At `/demo`, trigger the synthetic update. Open
   `/patient/updates/demo-update`.
9. Show 28 added actions over 14 days, before/after interruptions, detected
   conflicts, permitted bundling/movement, and the visible unresolved item.
10. Preview the proposed plan and demonstrate that Today still uses the active
    version. Accept the update, then show “Plan updated today” and What changed
    on Today and the accepted version in Care Plan.

## Recovery and checkpoints

- Wrong state: `/demo` → Reset database.
- Restart onboarding: checkpoint `ONBOARDING_START`.
- Initial plan: `INITIAL_PLAN_READY`.
- Daily Signal entry: `DAILY_SIGNAL_READY`.
- Waiting reply: `DAILY_SIGNAL_SENT`.
- Reply visible: `RESPONSE_RECEIVED`.
- Update: `CARE_UPDATE_RECEIVED`.
- Stress Test: `SIMULATION_READY`.
- Final screen: `UPDATED_PLAN_ACCEPTED`.
- Stuck reply: refresh Messages; after its due time click Process response jobs.
- Live AI slow/unavailable: turn fixture mode on and repeat; stored UI
  transitions are the same. `/demo` states the effective processing mode.
- Microphone/transcription failure: select Type; the recording is not stored.
- Development database reset: rerun `npm run db:reset`, then restart at a
  checkpoint.

Use repository-root `.env` as shown above. `.env.local` is ignored but is not
part of the documented setup convention.

## Submission rehearsal

Run `npm run db:reset`, `npm run lint`, `npm run typecheck`, `npm test`,
`npm run build`, and `npm run test:e2e`. Rehearse the full fixture path three
times, verify the live path once when connectivity allows, close unrelated
tabs, disable notifications, connect the charger, and keep a backup recording.
