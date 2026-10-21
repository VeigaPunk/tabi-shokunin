# Round 19 no-harm baseline

**Axes:** operability (faithful sandbox, all 23 inherited gates ran); calibration (exit comparison and the lone red finding are reported separately).

**Verdict:** all 23 B exits match the round-18 checkpoint: 22 exit 0, one exit 1; no timeout. The requested baseline JSON is committed in my isolated clone at `.ufo/waves/round-19/harm-baseline.json`.

## Method and evidence

- Read `.ufo/waves/round-18/harm-baseline.json` and `.ufo/waves/round-18/final/harm-at-checkpoint.json`. The former supplies the 23 exact argv vectors and B-era producer digests; the latter identifies checkpoint revision `01531daf3fa784410db454e4d606488e467a039a` and specifies all 23 gates run once, serially, with those argv vectors. The round-18 baseline report also notes the initial batch ran twice and that only the supplemental binding entry was later rerun (`.ufo/waves/round-18/w1/HarmBaseline18.md:7,47-49`).
- Inventory of `.ufo/waves/round-18/` found no dedicated 23-gate runner: its top-level JavaScript files are `measure-c1.mjs`, `measure-c2.mjs`, `measure-c3.mjs`, and `recheck-fetch.mjs`; recursive `.sh`, `.py`, and `*runner*` searches were empty. I replayed argv taken from the JSON records directly, serially, with inherited environment and a 900-second per-gate timeout.
- Node `v24.21.0`; Git `2.56.0`. The temporary lane was a real clone named `tabi-shokunin`, attached at `master` to B, clean before and after. Its real fleet parent was at `07a46044d93c13a4249d0852a8787407c5216ddd`; six real sibling clones (not symlinks) used the round-18 refs/tips documented in `w1/ConnSiblings.md:27-45` and `corpus/lessons/round-18.md:82-86`.
- The JSON receipt records each gate's exact argv, exit, stdout/stderr SHA-256, producer path and SHA-256, plus the checkpoint comparison. Full output streams are not copied; the required hashes are retained. All seven producer SHA-256 values matched the B values.

## Results and calibration

- Exit histogram: `0: 22`, `1: 1`; compared with `.ufo/waves/round-18/final/harm-at-checkpoint.json`, `differentExitCount: 0` and `differentExits: []`.
- The sole nonzero gate is `check-user-round-contract-production`, exit 1. At B its observed stderr SHA-256 is `884ef937e7f575cdbf4bf0f58150e0a8bec853e0e3e232532c50e231e897e3ce`, matching the checkpoint. The exact stderr (JSON-escaped in the receipt) is `USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Pstack bytes changed: A\tcorpus/lessons/round-18.md`. This differs from the **older** round-18 baseline's `alreadyRed` detail (`round_count`, six of ten), but not from the round-18 checkpoint's exit or stderr digest. Thus there are zero checkpoint exit regressions; the user-round red reason at B is not `round_count` as stated in the assignment's expectation.
- The round-17 measurement-binding reproduction exits 0 with the retained B output digest `39dc8780d2cd755d0738d656a03b21f9971d97525bfc498b0a452100f39dd503` (its recorded summary is `claims=3 bound=3`). No gate timed out; sandbox lane status remained clean.

## Risks and blockers

`check-adjacency-production` retains the exact inherited argv `--fleet /home/vgpnk/Projects/shokunin`, so that gate reads the original fleet path rather than the sandbox fleet clone; this preserves the recorded argv and was read-only. No external substrate was modified. No tools were installed or updated. No blocker.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ExecHarmBaseline`
- Branch: `r19/ExecHarmBaseline`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `28fda408ce93ecfc449363cd9f758323be686282`
- Changed paths:
  - `.ufo/waves/round-19/harm-baseline.json`
