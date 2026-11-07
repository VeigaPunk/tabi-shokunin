FINDINGS

# R76Review3 — scoped findings (round 76 C1 conformance)

Full report with per-item commands and exit codes: `.ufo/waves/round-76/w1/R76Review3/report.md`;
cited reader outputs: `.ufo/waves/round-76/w1/R76Review3/receipts/`.

## Pass

1. **Ordering PASS** — `git log a69f9060..master` (exit 0, 5 commits): `7e792fa` pre-freeze 04:56:15 →
   `6ea51ce` claims 04:56:31 → `97bf5d56` D/freeze.txt 04:56:39 → `2d3628fe` scored 04:59:11 → `dd52d3db`
   dispatch 04:59:26; 4/4 `merge-base --is-ancestor` exit 0; `git diff --stat 6ea51ce 97bf5d5` adds only
   `freeze.txt`; freeze.txt unchanged D→tip (diff exit 0).
2. **Pins PASS** — all 7 digests in `freeze.txt:3-9` equal the recorded sha256 at D, at `master`, and on the
   worktree (`git show <rev>:<path> | sha256sum`; `sha256sum`), 21/21 OK.
3. **Nonce PASS** — D first 12 = `97bf5d560d03`; receipt nonce = `tabi-r76-l1-97bf5d560d03`; no literal at
   or before D (`git grep -F` at `97bf5d5`, `6ea51ce`, base: exit 1 each); receipt `startedAt 07:56:44.722Z`
   is 5.7 s after D; only derivation is a computation (`run-scored.sh:12`).
4. **Prior set PASS** — top-level-schema enumeration: 31 candidates → 17 at the freeze parent `7e792fa`,
   17 at D, 18 at tip (17 + the scored receipt); sorted diff against `prior-set.txt` exit 0; committed
   `prior-set-enumeration-toplevel.txt` equals my re-derivation (diff exit 0); 141 raw/top-level split (31 vs 17).
5. **Before→after PASS for measured values** — capability row 0 base / 0 tip (`grep -c`, exit 1 both);
   dialog notes 0 base / 1 tip; r75 drag receipt under the fixed counter exit 1 with 80 findings (first six
   ids as claimed); no `--prior-set` exit 2 `usage`; absent receipt exit 2 `receipt-unreadable`; counting
   command re-run at the tip exit 0 clean 131 priors 17. Leg (b) on disk clean 131 with 18 priors; leg (d)
   row still 0 → (d) pending integration.
6. **QUALITY 130-143 PASS** (applicability and evidence in the full report); 132 `coverageGap []` over 131
   ids; 135 9/9; 136 both replays refused; 137 fail-closed summary; 138 limit boundary named; 139 156
   honest pairs, 0 refused, minimum distances 19 events / 3 gaps recorded; 140/141 as item 4; 142 five
   survivors resolved 56/56; 143 eight tolerance/threshold mutants each killed by a named case.

## Findings

### F1 — medium — QUALITY 144 unmet: battery placement guards not run on the probes, and they fail on p2

- The committed pre-freeze record gives the probes a counter-only row (`prefreeze-summary.mjs:32`;
  `pf/` has battery/kill-power outputs for `smoke1-9` only). QUALITY 144 requires every placement guard of
  the battery to be run on ALL honest pre-freeze receipts, probes included.
- Reconstruction (probe removed from PRE, scored receipt added as an extra prior, as leg (b) does):
  - **p2** — battery exit 1, 249/251: `replay-timeline-abs-at-threshold`
    `bracket misplaced: abs 20/37 gap 1/6 want 19 / <5`; `accept-prior-abs-below-threshold`
    `bracket misplaced: abs 19/37 gap 1/6 want 18 / <5`. Cause: `keepExact`
    (`negatives-dialog-r76.mjs:228`) moves p2 event 31 `(1943.0999…, 1943.2999…)` by +0.6 ms onto p2's own
    event at `(1943.6999…, 1943.8999…)`, inside the 0.05 ms tolerance, so 20 events match instead of 19.
  - **p1** — `prior-set-complete-omitted` (`negatives:263`) is non-diagnostic: the dropped prior
    `probe-build1-p1-refuted` and `probe/p1` share nonce `tabi-r76-probe-p1`, and the walk excludes the
    expected nonce (`check-dialog-r76.mjs:217`); result exit 0, `findingIds []`.
  - **p3, p4** — 251/251.
- No predicate leg is falsified: leg (c) runs the battery on the scored receipt (251/251) and kill power
  holds; `placed()` fails closed so no false green. But admission criterion 144 is unmet as written and
  probe-safety is not established by the committed record.
- Route (not into this claim): receipt-aware `keepExact`/`breakGaps`; add the 4-probe battery/kill-power
  pass to the fail-closed summary; drop an omitted prior whose nonce differs from the receipt under test.

### F2 — low — enumeration cited "at the freeze parent" but committed in the freeze commit

`claims.json:13` cites `lesson-proof/prior-set-enumeration-toplevel.txt` as the parent's record; the file
is added by `6ea51ce` and is absent at `7e792fa` (`git cat-file -e` exit 128). Its content equals my
independent enumeration at the parent (17 = 17, diff exit 0), so the completeness claim is true; only the
citation timing is imprecise.

### F3 — info — leg (d) pending

Capability row 0 at `dd52d3d` (exit 1); note + S202-S206 committed pre-freeze (`corpus/SOURCES.md:216-220`,
tier A). Before→after capability is 0→0 until the integration commit lands.

## Notes

- No new Chromium execution by this seat; only frozen receipt readers were re-run (counter ×4, battery ×6),
  outputs under `receipts/`. Scratch removed. No tool installs.
- Pre-freeze runs use `pf/ps-<receipt>.txt` = PRE minus the receipt under test (16 lines). This is by
  design — the receipt under test must not be its own prior — not a 17-vs-16 error.
- Three semantic mutants are killed-positive (positive-case kill), not by a named case; the eight
  tolerance/threshold mutants of 143 are named-case kills.
