# ExecControlSkip — C1/C2 skip-work controls (wave 1, round 24)

- Seat: `L1Tabi24.ExecControlSkip` (executor, leaf; no subagent dispatch, no peer messages)
- Date: 2026-10-25
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Baseline rev (frozen): `573c99e4885382db38babc3a6fc90e77afeb42a6`
- Frozen claims: `.ufo/waves/round-24/claims.json` (read first; authoritative)

## Task

Build two skip-work controls under `scratch/ExecControlSkip/` and score them against the
FROZEN counters at the baseline revision:

- (a) C1 "registry conformance": greps SKILL.md for the literal `round-evidence-audit` and prints `nonconformant=0`
- (b) C2 "mismatch counter": greps SCORECARD.md for `12/12` and prints `mismatches=0`

Both are deliberately degenerate probes (they perform the grep for visibility but never
parse rows/classes; the verdict is unconditional zero). They are NOT the shipped gates
(`scripts/check-gate-registry.mjs`, `scripts/check-selfassessment.mjs` — owned by the L1).

## Files created (throwaway fixtures, scratch only)

| File | Role |
|---|---|
| `.ufo/waves/round-24/scratch/ExecControlSkip/check-gate-registry-skip.mjs` | C1 skip-work control |
| `.ufo/waves/round-24/scratch/ExecControlSkip/check-selfassessment-skip.mjs` | C2 skip-work control |

No tracked repo files touched. No git writes. No installs (node v24.21.0 already present).

## Baseline facts (exact commands)

| # | Command (run in lane root) | Result |
|---|---|---|
| 1 | `git rev-parse --verify 573c99e4885382db38babc3a6fc90e77afeb42a6` | rev exists |
| 2 | `git ls-tree --name-only 573c99e… \| grep -E '^(SKILL\.md\|SCORECARD\.md\|SHONEN\.md\|LOG\.md)$'` | LOG.md, SCORECARD.md, SHONEN.md, SKILL.md all present at baseline |
| 3 | `git show 573c99e…:SKILL.md \| grep -c 'round-evidence-audit'` | **0** (grep exit 1: no match) — the round-23 defect-1 row is absent at baseline |
| 4 | `git show 573c99e…:SCORECARD.md \| grep -n '12/12'` | lines **77, 79, 1139, 1151** contain `12/12` (incl. the `--selftest` 12/12 figures on 1139 and 1151) |
| 5 | `git show 573c99e…:SCORECARD.md \| grep -o '12/12' \| wc -l` | **4** occurrences |

## Control (a) — C1 registry-conformance skip-work control

Run at baseline:

```
node .ufo/waves/round-24/scratch/ExecControlSkip/check-gate-registry-skip.mjs \
  --rev 573c99e4885382db38babc3a6fc90e77afeb42a6 --json
```

Output (verbatim), exit 0:

```json
{
  "schema": "tabi-skip-gate-registry-v0",
  "rev": "573c99e4885382db38babc3a6fc90e77afeb42a6",
  "gates": [
    {
      "name": "round-evidence-audit",
      "script": "scripts/round-evidence-audit.mjs",
      "row": "<not parsed>",
      "missing": [],
      "grep_literal": "round-evidence-audit",
      "grep_hits_in_SKILL_md": 0
    }
  ],
  "nonconformant": 0,
  "clean": true
}
```

`--selftest` also exits 0 (2 synthetic cases, verdict "nonconformant=0 (unconditional)").

**Verdict: MEETS the after-target (0) while skipping the work.** The control prints
`nonconformant=0` even though at the baseline the `round-evidence-audit` registry row is
absent (literal hits = 0; claim C1's routed defect 1). It performs none of the required
work: no eight-field PROTOCOL §Gate row parsing, no gate-script-set derivation, no
supersession-window logic, no fail-closed behavior.

Wrong element: **the counter as this naive control implements it** (a literal grep with an
unconditional clean verdict is vacuous — it cannot distinguish a conformant repo from the
baseline defect). The target (`after: 0` after real work) and the frozen before value
(N > 0, row absent) stand; the control never actually measures either. Consequently the
claim's own killRule (fail-closed on unparseable/missing rows; field predicates must show
red on a mutated row and green on a conformant row) is confirmed necessary — the control's
"clean" is meaningless.

## Control (b) — C2 self-assessment skip-work control

Run at baseline:

```
node .ufo/waves/round-24/scratch/ExecControlSkip/check-selfassessment-skip.mjs \
  --rev 573c99e4885382db38babc3a6fc90e77afeb42a6 --json
```

Output (verbatim), exit 0:

```json
{
  "schema": "tabi-skip-selfassessment-v0",
  "rev": "573c99e4885382db38babc3a6fc90e77afeb42a6",
  "mismatches": 0,
  "findings": [],
  "grep_literal": "12/12",
  "grep_hits_in_SCORECARD_md": 4,
  "clean": true
}
```

`--selftest` also exits 0 (2 synthetic cases, verdict "mismatches=0 (unconditional)").

**Verdict: MEETS the after-target (0) while skipping the work.** The control prints
`mismatches=0` even though four `12/12` occurrences (lines 77, 79, 1139, 1151; the three
stale `--selftest` figures the claim names sit in this set) are present at baseline, and
the m3 unlanded-path condition is not even examined. It performs none of the required
work: no m1 selftest-tally comparison, no m2 receipt-exit re-run, no m3 unlanded-path
check.

Wrong element: **the counter as this naive control implements it** (a literal grep with an
unconditional clean verdict is vacuous). The target (`after: 0` after disqual work) and the
frozen before value (4) stand; the control reports 0 without measuring either. The claim's
killRule (unparseable state ⇒ could-not-evaluate, never counted as clean; null classes
disclosed) is confirmed necessary.

## Conclusion

Both skip-work controls report exactly the after-target value (0) at the baseline while
doing none of the claimed work. In both cases it is the naive counter logic that is wrong
(gameable, vacuous), not the target or the frozen before values. The real gates must not
be implemented as these greps; the claims' killRules (fail-closed parsing, mutant-driven
selftests, class-level findings) are required to keep the counters honest.

## Receipt (JSON)

```json
{
  "receipt_version": 1,
  "seat": "L1Tabi24.ExecControlSkip",
  "role": "executor (leaf)",
  "date": "2026-10-25",
  "baseline": "573c99e4885382db38babc3a6fc90e77afeb42a6",
  "claims_source": "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-24/claims.json",
  "controls": [
    {
      "claim": "C1",
      "metric": "nonconformant_gates",
      "script": ".ufo/waves/round-24/scratch/ExecControlSkip/check-gate-registry-skip.mjs",
      "run": "node check-gate-registry-skip.mjs --rev 573c99e4885382db38babc3a6fc90e77afeb42a6 --json",
      "exit": 0,
      "output": {
        "schema": "tabi-skip-gate-registry-v0",
        "nonconformant": 0,
        "clean": true,
        "grep_literal": "round-evidence-audit",
        "grep_hits_in_SKILL_md": 0
      },
      "frozen_before": "N>0 (registry row absent at baseline; literal hits=0)",
      "frozen_after": 0,
      "meets_after_target_while_skipping_work": true,
      "wrong_element": "counter (naive literal grep is vacuous; target and frozen before stand)"
    },
    {
      "claim": "C2",
      "metric": "selfassessment_mismatches",
      "script": ".ufo/waves/round-24/scratch/ExecControlSkip/check-selfassessment-skip.mjs",
      "run": "node check-selfassessment-skip.mjs --rev 573c99e4885382db38babc3a6fc90e77afeb42a6 --json",
      "exit": 0,
      "output": {
        "schema": "tabi-skip-selfassessment-v0",
        "mismatches": 0,
        "clean": true,
        "grep_literal": "12/12",
        "grep_hits_in_SCORECARD_md": 4
      },
      "frozen_before": 4,
      "frozen_after": 0,
      "meets_after_target_while_skipping_work": true,
      "wrong_element": "counter (naive literal grep is vacuous; target and frozen before stand)"
    }
  ],
  "tools_installed": []
}
```

## Risks / notes

- Control (b)'s grep finds 4 `12/12` occurrences; the claim names three stale selftest
  figures. Whether exactly three or four of these lines are stale is the real counter's
  determination; irrelevant to the control's (false) clean verdict.
- The claims reference `.ufo/waves/round-24/control/control-receipt.json` for recorded
  before-data; that path is outside this seat's write scope (report-only), so the receipt
  is embedded here as required by the assignment.
- No external probes, browser, services, installations, or git writes performed.
