# Milestone 6 acceptance audit

| Criterion | Status | Implementation evidence | Test evidence |
|---|---|---|---|
| Confirmed update is sent transactionally | PASS | `/api/daily-signals/send` validates status and creates/reuses thread, message, job, status and audit | Strict type-check and production route build |
| Persisted due job and four states | PASS | `SimulatedResponseJob`, indexed `dueAt`, `ResponseJobState` | Reset applies migration |
| Response unavailable before due time | PASS | Processor queries `PENDING` with `dueAt <= now` only | Service implementation inspection |
| Due response processing is idempotent | PASS | Conditional state claim and deterministic response message ID inside transaction | Type/build validation |
| Polling processes jobs and stops | PASS | GET `/api/messages` processes first; client interval exists only while `pending` | Client implementation inspection |
| Deterministic constrained fallback | PASS | Six response families and strict schema | All templates validate; safety text assertions |
| Patient-only Messages UI | PASS | Persisted bubbles, awaiting state, explicit simulation label, meaning card and disclaimer | Production build |
| Unread and opened-thread behaviour | PASS | Processor sets unread; read route clears it; client marks active thread read | Route/client integration |
| Clarification flow is reusable | PASS | `/api/clarifications/send` creates thread, message and delayed job | Strict type-check and build |
| Refresh preserves pending state | PASS | Threads, messages and jobs are Prisma-backed; no timers own state | Reset/build validation |
| No clinician-facing application | PASS | Only patient routes and server endpoints exist | Route manifest inspection |

