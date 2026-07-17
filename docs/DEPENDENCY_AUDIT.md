# CareLoad dependency audit

Audit date: 17 July 2026.

Commands: `npm audit --json` and `npm outdated`.

| Package | Severity | Direct or transitive | Production or development | Vulnerable range | Patched version | Demo reachable | Non-breaking upgrade | Action |
|---|---|---|---|---|---|---|---|---|
| `effect` | High | Transitive through `@prisma/config` | Development (Prisma CLI) | `<3.20.0` | `3.20.0` | No; CLI configuration dependency, not imported by the CareLoad server or patient bundle | Yes, through Prisma 6.19.3 | Fixed by upgrading Prisma CLI to 6.19.3 |
| `@prisma/config` | High | Transitive through `prisma` | Development | Prisma `6.13.0-dev.1–6.19.2` and listed prereleases | Prisma 6.19.3 | No; migration/generation tooling only | Yes | Fixed by upgrading Prisma CLI to 6.19.3 |
| `prisma` | High | Direct | Development | `6.13.0-dev.1–6.19.2` and listed prereleases | 6.19.3 | No; CLI is not part of the local patient request path | Yes | Upgraded 6.19.2 → 6.19.3 |
| `postcss` | Moderate | Transitive, bundled under `next` | Production dependency tooling | `<8.5.10` | 8.5.10 | Not reachable in the demonstrated path: CareLoad serves static authored CSS and does not stringify attacker-controlled CSS | No supported non-breaking Next upgrade is offered by npm | Accepted prototype risk |
| `next` | Moderate (effect of bundled PostCSS) | Direct | Production | npm reports `9.3.4-canary.0–16.3.0-canary.5` | No valid current-line fix reported | Same bounded PostCSS path above | No; npm incorrectly proposes the breaking downgrade `next@9.3.3` | Accepted prototype risk; no force/downgrade |

After the safe patch, `npm audit` reports 2 moderate, 0 high, and 0 critical
findings. `npm outdated` also lists major upgrades for development tooling;
those are intentionally outside a release-closure patch. No
`npm audit fix --force` was used.
