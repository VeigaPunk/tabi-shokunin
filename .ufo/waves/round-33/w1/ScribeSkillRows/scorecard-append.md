## Round 33 — corrections (append-only; each cites the stale line in its own document)

Measured at the round-33 freeze by the gate's own `--selftest` summary line; the stale line stays as written, this
line supersedes it.

- `scripts/check-bidi-runtime.mjs` `--selftest` (<N>/<N>): correction — supersedes the stale tally at
  `SCORECARD.md:1657`. That line states the figure 27, the v1 count at the round-32 freeze; v2 adds one case per
  frozen battery construction F1–F8 and one per round-32 surviving mutant M04, M06, M09, M10, M11, M14, M17, M18 and
  M19, and the gate prints `BIDI_RUNTIME_SELFTEST verdict=clean cases=<N> passed=<N>` at the round-33 measured
  revision (`SKILL.md` round-33 registry section, same round).
