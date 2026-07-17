# Milestone 5 acceptance audit

| Criterion | Status | Implementation evidence | Test evidence |
|---|---|---|---|
| Typed Daily Signal and exact raw text persistence | PASS | `DailySignalEntry`, extraction route, `DailySignal.rawText` | Domain suite plus type/build validation |
| Voice recording, editable transcript, denial/unsupported fallback | PASS | MediaRecorder client and `/api/audio/transcribe` validation | Route validation and typed fallback implementation |
| Personalised stored context | PASS | `buildDailySignalContext` reads conditions, tasks, plan events and seven signals | Strict type-check and route integration |
| Structured OpenAI extraction is schema constrained | PASS | Responses API, strict Zod schema and server-only key | Schema rejects extra clinical fields; live request not tested without credentials |
| Deterministic no-key fixtures | PASS | Five named fixture families | All fixtures validate |
| Relevant, deduplicated maximum-two approved questions | PASS | Catalogue and `selectQuestions` | Selection unit test |
| Source phrase and uncertainty preservation | PASS | Observation schema and review evidence cards | Direct unit assertions |
| Feel-the-same and skip are optional/non-nagging | PASS | Dedicated persisted routes | Lightweight fixture test |
| Patient confirmation and record-only path | PASS | Review PATCH actions and audit events | State implementation and build validation |
| Deterministic urgent demonstration rule | PASS | Exact three-answer rule and predefined UI | Positive and negative tests |
| Refresh preserves progress | PASS | Prisma-backed draft, extraction, questions and answers | Reset and production build |
| No diagnosis or medication recommendation output | PASS | Strict schema and system rules | Extra-field rejection tests |
