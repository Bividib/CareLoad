# CareLoad implementation status

Last updated: 17 July 2026

Status values are `NOT STARTED`, `IN PROGRESS`, `COMPLETE`, or `BLOCKED`.
Milestones are ordered. A later milestone may be prototyped only when doing so
does not bypass an earlier safety or data dependency.

| # | Milestone | Status | Dependencies | Acceptance criteria |
|---|---|---|---|---|
| 0 | Foundation and guardrails | COMPLETE | Authoritative implementation plan | Next.js/TypeScript/Tailwind scaffold exists; repository guidance and scope status are documented; environment validation and route placeholders exist; lint, type-check, unit tests, production build, and a runtime smoke check pass. |
| 1 | Persistence, fixtures, and demo reset | NOT STARTED | 0 | Prisma/SQLite model preserves all specified concepts; migrations and synthetic Eleanor fixtures exist; reset supports every specified checkpoint and is idempotent; audit events persist; no real data is present. |
| 2 | Patient shell and shared UI | NOT STARTED | 0, fixture shapes from 1 | Mobile shell, design tokens, headers, cards, and exactly five bottom-navigation items render accessibly at 390 × 844 without overflow; all route shells work; synthetic disclaimer is visible where required. |
| 3 | Deterministic planner | NOT STARTED | 1 | Pure TypeScript planner expands recurrence, blocks anchors, places fixed work, scores valid slots, bundles compatible work, reports metrics, and retains every unplaced task; specified planner unit tests pass with deterministic output. |
| 4 | Onboarding and care-plan compiler | NOT STARTED | 1, 2, 3 | Synthetic documents upload or load from fixtures; extraction retains exact evidence and uncertainty; patient decisions persist; only verified-template matches are scheduled; Life Map persists; accepting preview creates the first active plan. |
| 5 | Life Map editing and today adjustment | NOT STARTED | 2, 3, 4 | Patient can edit anchors, priorities, preferences, friction, and support; material changes generate a preview; "Today is difficult" changes only permitted flexible items under the same active plan and exposes unresolved conflicts. |
| 6 | Daily Signal | NOT STARTED | 1, 2, 4 | Typed flow works end to end; voice has editable transcript and text fallback; source phrases and uncertainty persist; at most two catalogue questions are selected; patient approves routine sharing; the one synthetic urgent rule uses only its deterministic template. |
| 7 | Simulated messaging | NOT STARTED | 1, 2, 6 | Sending creates a persisted future-due job; polling materialises one idempotent, labelled synthetic response only after it is due; refresh survives; fallback templates work; unread state updates; no response diagnoses or changes medication. |
| 8 | Care Plan Stress Test and plan versioning | NOT STARTED | 1, 2, 3, 4, 7 | Twice-daily measurement for 14 days adds 28 actions; baseline/proposed diffs, conflicts, moves, bundles, delegation, and unplaced work are explained; active plan remains unchanged before acceptance; acceptance supersedes it transactionally and updates Today. |
| 9 | End-to-end hardening and demo polish | NOT STARTED | 1–8 | Full Playwright demo path passes; fallback/no-network and recoverable error paths work; refresh resilience, microphone denial, accessibility, performance, and visual checklist are verified; demo is rehearsable from reset. |

## Current completion

Milestone 0 is complete. The repository began with the implementation plan and
no application code or Git history. The foundation now starts, builds, and
passes its static checks and smoke tests. No product domain, persistence, AI,
messaging, planner, or simulation milestone is complete.

## Known risks

| Risk | Impact | Mitigation / decision |
|---|---|---|
| Clinical-sounding prototype content could be mistaken for real guidance | Highest safety risk | Synthetic-only data, persistent disclaimer, explicit simulated labels, deterministic urgent demo template, and safety-invariant tests. |
| AI extraction invents or overstates care constraints | Unsafe scheduling | Preserve quotes and uncertainty; schema validation; match only to seeded verified templates; unmatched work stays unscheduled. |
| Planner silently loses work or violates a time/location rule | Misleading plan | Pure deterministic engine; retain unplaced occurrences; explain every placement/change; focused invariant tests. |
| Active plan changes before patient acceptance | Loss of patient control | Versioned proposed state and transactional acceptance; integration tests assert active version is unchanged beforehand. |
| Delayed response is lost, duplicated, or presented as real | Demo failure and misleading UX | Persist `dueAt`; idempotent poll-time processing; clear simulated label; deterministic fallback; refresh tests. |
| OpenAI latency, outage, schema failure, or unavailable model | Broken demo flow | Immediate stage UI, bounded retries, configurable models, cached deterministic fixtures, no-network demo mode. |
| Voice APIs or permissions fail | Daily Signal becomes inaccessible | Typed input is first-class; editable transcript; fixture fallback; microphone-denial test. |
| Hackathon scope expands before the core state machine works | Incomplete demo | Follow milestone order and explicit out-of-scope list in `AGENTS.md`; typed flow and deterministic fixtures take priority over polish. |
| Current Node.js version is newer than typical deployment LTS | Local/deployment divergence | Declare a supported minimum/current LTS range in package metadata and verify CI/deployment against it before release. |
| Current Next.js production dependency tree includes a moderate PostCSS advisory | Potential CSS stringification XSS; `npm audit` offers only a breaking Next 9 downgrade | Do not apply `npm audit fix --force`; monitor for an upstream Next release bundling patched PostCSS and upgrade promptly. No application path currently stringifies untrusted CSS. |
| Visual reference mock-ups have not yet been validated against implemented patient UI | UI fidelity is not established by the route placeholders | Treat the supplied `images/` assets as visual authority during milestone 2 and complete the 390 × 844 visual checklist before sign-off. |
