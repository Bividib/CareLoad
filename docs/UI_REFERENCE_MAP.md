# CareLoad UI reference map

All files are 945 × 1680 mobile mock-ups. The device chrome is illustrative;
the application reproduces the content system inside a centred 390–430 px shell.

| Filename | Screen / route | Major components and reusable patterns | Ambiguity / implementation note |
|---|---|---|---|
| `...04_38_15 PM (1).png` | Initial Today `/patient/today` | Logo header, bell, greeting, update pill, care-moment card, Daily Signal, protected anchors, five-item nav | Mock-up adds unseeded breathing/hydration tasks; implementation shows verified seeded tasks only. |
| `...04_38_15 PM (2).png` | Welcome `/onboarding/welcome` | Logo, benefit rows, privacy card, acknowledgement, primary/secondary buttons | Real privacy/security claims are inappropriate for a prototype; replaced by explicit synthetic-data boundary. |
| `...04_38_16 PM (3).png` | Build `/onboarding/build` | Progress dots, three option cards, supportive banner, primary button | “Connect health record” remains visibly simulated. |
| `...04_38_16 PM (4).png` | Review `/onboarding/review` | Four-step progress, task status rows, factual questions, primary button | Seeded fixture candidates are used; confirmation is factual, not clinical verification. |
| `...04_38_16 PM (5).png` | Updated Today `/patient/today` after accepted update | Success banner, changed-plan summary, revised care moments | Later accepted-update state is represented only when persisted. |
| `...04_38_16 PM (6).png` | Daily Signal `/patient/daily-signal` | Optional badge, microphone/transcript card, two follow-ups, quick replies, CTA | Static fixture only in Milestones 1–3; no transcription or diagnosis. |
| `...04_38_17 PM (7).png` | Daily Signal review `/patient/daily-signal/review` | Structured observations, rationale, confirm/edit rows, send/monitor actions | “Send to clinician” is retained as a non-functional later-milestone affordance and labelled simulated. |
| `...04_38_17 PM (8).png` | Messages `/patient/messages` | Conversation, patient bubble, simulated response, meaning card, AI disclaimer | “Secure messages” and real-clinician implications removed; content is conspicuously simulated. |
| `...04_38_18 PM (9).png` | Care update `/patient/updates/demo-update` | Update alert, impact metric cards, solvable list, clarification warning, CTAs | Metrics are deterministic fixtures until update simulation milestone. |
| `...04_38_18 PM (10).png` | Life Map `/patient/life-map` | Anchor list, priorities, category chips, friction tags, floating save, nav | Work starts 08:30 per authoritative request, not 08:00 shown in the image. |
| `...04_38_30 PM (1).png` | Care Plan `/patient/care-plan` | status banner, segmented control, weekly rows, task list/tags, anchors | Status says “synthetic verified tasks,” not a real care-team verification claim. |
| `...04_38_30 PM (2).png` | Update preview `/patient/updates/demo-update/preview` | change summary, revised care moments, benefits, accept/clarify CTAs | Later update fixtures stay preview-only; active plan cannot change without acceptance. |

## Shared visual system

White/pale-blue background, navy headings, blue primary actions, teal supportive
states, pastel circular icon wells, 24 px cards, subtle shadows, generous 16–24
px spacing, rounded pills, and Lucide line icons. Bottom navigation order is
always Today, Care Plan, Add to My Life, Messages, Help.
