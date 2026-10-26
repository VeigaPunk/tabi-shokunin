## Round 31 — corrections (append-only; cites the stale line in its own document)

Measured 2026-10-26 at `9505a10eb80b2a0b273ebaba3f7f872ad302192d` in a clean checkout; the figure quoted is the
`cases=` field of the gate's own `SELFASSESSMENT_SELFTEST` summary line. The frontier row above stays as written.

- `scripts/check-selfassessment.mjs` `--selftest` (30/30): correction — supersedes the stale tally at `corpus/README.md:613`. That row states the figure 17, this gate's count at the round-27 tip; round 28's exact-citation cases took it to 20 (`b4128c4`), the round-29 freeze added the two cross-document cases (22, `97be89b`), and round 31's v2 added eight — summary-line oracle, `SKILL.md` and `corpus/README.md` windows, same-document citations, no section fallback. The row's status (`held`) and its pointer to the round-27 LOG entry are unchanged; only the tally is corrected.
