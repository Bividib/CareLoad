# CareLoad demo checklist

## Preparation

1. Run `npm install`, then `npm run db:reset`.
2. In repository-root `.env`, set `DATABASE_URL=file:./dev.db`, `DEMO_RESPONSE_DELAY_MS=10000`, `DEMO_AI_TIMEOUT_MS=25000`, and `DEMO_AI_FALLBACK=true` for the reliable no-key path.
3. For live AI mode, set `OPENAI_API_KEY`, set `DEMO_AI_FALLBACK=false`, start the app, and turn fixture mode off at `/demo`.
4. Run `npm run dev` and open `http://localhost:3000/demo`.
5. Use a 390 × 844 or 430 × 932 browser viewport. Allow microphone access for voice; denial safely falls back to typing.

## Three-minute sequence

1. Seed `INITIAL_PLAN_READY`; open Today and describe the bundled active plan.
2. Open Daily Signal and type: “My stomach has felt uncomfortable for a few days and I am more tired than usual, but I am still eating and drinking.”
3. Continue, answer the two displayed questions, confirm, and send.
4. Show the persisted awaiting-response state. After about 10 seconds, show the clearly labelled simulated response and “What this means for today”.
5. At `/demo`, trigger the synthetic cardiology update; open `/patient/updates/demo-update`.
6. Show calculated +28 actions, added minutes, optimisation, and the retained Thursday conflict.
7. Preview the updated plan, accept it, and return to Today for “Plan updated today”.

Expected screens: personalised entry → evidence review → awaiting response → fictional response → Stress Test → proposed preview → updated Today.

## Full onboarding path

Reset, open `/`, acknowledge both synthetic boundaries, choose document upload, load all three sample PDFs, process with fixture or live extraction, confirm current tasks, save the Life Map, preview, and accept the initial plan.

## Recovery and presenter shortcuts

- Demo state wrong: `/demo` → Reset database.
- Need to skip onboarding: seed `INITIAL_PLAN_READY`.
- Need a waiting message: seed `DAILY_SIGNAL_SENT`.
- Need the response immediately: click Process response jobs.
- Need the Stress Test: seed `SIMULATION_READY`.
- Need the final screen: seed `UPDATED_PLAN_ACCEPTED`.
- OpenAI unavailable: use Retry or explicitly turn fixture mode on/use the demo result; patient text and stored documents remain unchanged. `/demo` shows the effective mode.
- Microphone denied: choose Type; no recording is retained.
- Delayed response appears stuck: refresh Messages, then use Process response jobs.

## Final rehearsal

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e`. Confirm no horizontal overflow, visible keyboard focus, 44 px targets, labelled icons, readable status text, and scrolling at both target widths.
