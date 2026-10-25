# SCORECARD.md round-24 draft

Append after the round-23 correction block (currently ending at line 1184 in the supplied snapshot). Preserve prior bytes. The block below uses frozen claims from `.ufo/waves/round-24/claims.json`; placeholders are intentional until the integrated tip and measurements exist.

## Round 24 — declared claims (frozen before data)

Baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`; claims frozen before data in `.ufo/waves/round-24/claims.json`. Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. Lowest non-retired axis: **operability**, tied at 8 with depth, freshness, and adjacency. No axis promotion on a scalar; no non-author judgment asserted (all seats lane-dispatched).

| Claim | Axis / type | Before → after | Counting command (field) |
|---|---|---|---|
| C1 | operability — capability-acquisition + routed-defect repair | `<MEASURED>` → 0 | `node scripts/check-gate-registry.mjs --rev <REV> --json` (`nonconformant`) |
| C2 | calibration — capability-acquisition + routed-defect repair | 4 → 0 | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) |
| C3 | coverage — frontier-entry admission (documented-upstream) | 0 → 1 | `git grep -lE '^source: S10[45] ' <REV> -- corpus/knowledge  wc -l` (number of admitted entries citing a row first opened this round) |

**Capabilities table (appended; prior table is a historical snapshot).**

Gate-registry conformance — checks each lane gate's latest SKILL.md registry row for all eight PROTOCOL §Gate fields, against committed revision bytes; fail-closed on undecidable gates. Evidence: `scripts/check-gate-registry.mjs`, `node scripts/check-gate-registry.mjs --selftest` (`<MEASURED>`), and round-24 C1 evidence `<MEASURED>`. First-working round: 24.

Self-assessment mismatch counter — compares documented gate selftests and committed receipt exits with observations and detects unlanded paths under asserted landed rounds (m1/m2/m3). Evidence: `scripts/check-selfassessment.mjs`, `node scripts/check-selfassessment.mjs --selftest` (`<MEASURED>`), and round-24 C2 evidence `<MEASURED>`. First-working round: 24.

## Round 24 — executed disposition

Measured `<MEASURED>` against `<MEASURED revision>`; use committed revision(s) and rerun outcomes only after the L1 records them.

| Claim / axis | Before → after | Verdict / bounds |
|---|---|---|
| C1 operability | `<MEASURED>` → `<MEASURED>` nonconformant gates | `<MEASURED>`; include gate selftest case count/exit and skip-work-control result; scalar operability 8→8 unless explicitly remeasured. |
| C2 calibration | 4 → `<MEASURED>` mismatches | `<MEASURED>`; report per-class m1/m2/m3 and selftest result, and disposition of round-23 receipt/exit claim; scalar calibration 9→9 unless explicitly remeasured. |
| C3 coverage | 0 → `<MEASURED>` admitted entry/entries | `<MEASURED>`; identify source IDs, access date and located quote evidence; no coverage credit if source-opening/admission criteria fail; scalar coverage 9→9 unless explicitly remeasured. |
| depth, freshness, adjacency | unchanged | `<MEASURED>` bounds; no additional credit asserted absent evidence. |

Per-claim evidence pointers: `<MEASURED>`.

**Wave and seat census.** W1 dispatch specification declares 32 spawned seats, zero resumed, total 32 (`.ufo/waves/round-24/w1-dispatch.json`, fields `counts.spawn`, `counts.resume`, `counts.total`). Actual reports, dead seats, registry membership/receipts, round total, and wave-band compliance remain `<MEASURED>` pending the integrated census; do not infer completion from dispatch count.

**Evidence boundary / other mandated work.** The frozen claims also require accounting for removal of the round-23 M5 scratch over-commit, resolution of the 89 unlanded paths, and re-check of the round-23 receipt/exit claim. Record measured outcomes and exact evidence pointers here as `<MEASURED>` until observed. Not claimed per frozen record: no new browser run, real site, default profile, served-wire identity or host bfcache observation; no shokuknow package adoption.

## Evidence notes for integration

Frozen values and commands above are directly from `.ufo/waves/round-24/claims.json`. The C1 baseline value is explicitly designated there as measured by the shipped gate and recorded in `corpus/evidence/round-24/c1-measurements.json`; it is not present in this drafting evidence and remains `<MEASURED>`. The C2 baseline is 4 and target 0 per the frozen claims. Dispatch counts are the declared dispatch values, not execution/report counts. No gate selftest results or post-integration measurements were observed for this draft. No tools installed.