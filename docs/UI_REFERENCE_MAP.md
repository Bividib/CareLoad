# CareLoad UI reference map

All files are 945 × 1680 mobile mock-ups. Device chrome is illustrative; the
application reproduces the content system inside a centred 390–430 px shell.

| Filename | Screen / route | Major components and reusable patterns | Final implementation note |
|---|---|---|---|
| `...04_38_15 PM (1).png` | Initial Today `/patient/today` | Header, greeting, update pill, care moments, Daily Signal, anchors, nav | Shows only synthetic verified seeded tasks; unverified mock-up tasks are excluded. |
| `...04_38_15 PM (2).png` | Welcome `/onboarding/welcome` | Benefits, prototype boundary, acknowledgements, actions | Uses an explicit synthetic-data boundary rather than production privacy claims. |
| `...04_38_16 PM (3).png` | Build `/onboarding/build` | Progress, source options, banner, action | “Connect health record” is visibly simulated. |
| `...04_38_16 PM (4).png` | Review `/onboarding/review` | Progress, task status, factual questions, action | Confirmation is factual; unmatched tasks remain visible and unscheduled. |
| `...04_38_16 PM (5).png` | Updated Today after acceptance | Success, change summary, revised moments | Rendered only from the persisted accepted version. |
| `...04_38_16 PM (6).png` | Daily Signal `/patient/daily-signal` | Optional entry, microphone/editable transcript, follow-ups, quick replies | Typed and MediaRecorder paths work. Fixture or live processing is explicit; neither path diagnoses. |
| `...04_38_17 PM (7).png` | Daily Signal review | Observations, rationale, confirm/edit, send/monitor | Send stores the patient-confirmed update and schedules a conspicuously simulated response. There is no real clinician connection. |
| `...04_38_17 PM (8).png` | Messages | Conversation, patient bubble, simulated response, meaning card | Real-clinician and “secure message” implications are removed; responses are fictional and labelled. |
| `...04_38_18 PM (9).png` | Care update | Alert, calculated impact metrics, solved and unresolved lists | The deterministic Stress Test calculates metrics from the single synthetic update, including 28 added actions. |
| `...04_38_18 PM (10).png` | Life Map | Anchors, priorities, frictions, save, nav | Work starts 08:30 per the authoritative seed, not the image’s 08:00. |
| `...04_38_30 PM (1).png` | Care Plan | Status, weekly rows, task tags, anchors | Says synthetic verified tasks, not real care-team verification. |
| `...04_38_30 PM (2).png` | Update preview | Change summary, revised moments, benefits, accept/clarify | Preview and transactional acceptance work; the active plan changes only after patient acceptance. |

## Shared visual system

White/pale-blue background, navy headings, blue primary actions, teal
supportive states, pastel icon wells, 24 px cards, subtle shadows, generous
spacing, rounded pills, and Lucide line icons. Navigation order is Today, Care
Plan, Add to My Life, Messages, Help.
