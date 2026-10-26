
## Round 29 — corrections

Append-only exact corrections, measured 2026-10-26 at base `97be89bc66139eb45526a04af59a35dccc006eb9` in a clean clone with the frozen counter (sha256 `7281280…560c4`). Each line names the gate whose own self-test is the oracle, states the observed tally in a recognised form, and cites the superseded line; the earlier lines stay standing as provenance.

- `scripts/check-sources.mjs` `--self-test` measured 26 cases at the round-29 base; the twenty-five figure at `SCORECARD.md:410` is superseded.
- `scripts/round-evidence-audit.mjs` `--selftest` (13/13) corrects the twelve figure at `SCORECARD.md:1138`.
- `scripts/round-evidence-audit.mjs` `--selftest` (13/13) corrects the twelve figure at `SCORECARD.md:1139`.
- `scripts/round-evidence-audit.mjs` `--selftest` (13/13) corrects the twelve figure at `SCORECARD.md:1151`.
- `scripts/check-selfassessment.mjs` `--selftest` (22/22) corrects the seventeen figure at `SCORECARD.md:1439`.
- `scripts/check-s106-evidence.mjs` `--selftest` (7/7) corrects the five-case figure at `SCORECARD.md:1438`; the gate's `CASES` table already holds seven ids including `measured-revision-bytes-match` and `measured-revision-bytes-mismatch`, so the repaired self-test prints `cases=7` once C1 lands.
