# CareLoad

CareLoad is a patient-only, synthetic-data hackathon prototype for compiling and
planning treatment burden around a person's real life. This repository currently
contains the application foundation only; see
[`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) for milestone
status and `CareLoad_Full_Implementation_Plan.md` for the authoritative scope.

> Hackathon prototype using synthetic information. Not a medical device and not
> for real patient care.

## Requirements

- Node.js 20.9 or newer
- npm

## Local development

Copy `.env.example` to `.env.local` when environment-backed features are added.
The current foundation starts without secrets.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The root redirects to the onboarding welcome
placeholder. Route placeholders intentionally contain no feature logic yet.

## Verification

```bash
npm run lint
npm run type-check
npm test
npm run build
```

The safety, architecture, coding, and scope rules for all future work are in
[`AGENTS.md`](AGENTS.md).

