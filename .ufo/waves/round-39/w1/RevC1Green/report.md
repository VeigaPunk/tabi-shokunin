# RevC1Green — round-39 w1, C1 independent reproduction + mutation refusal

Seat item: independently reproduce C1 on committed bytes in a clean shared clone; run the counter at the exact measured lane tip, verify exit 0 and predicate true; mutate one receipt field (survivors=1) in a fixture clone and confirm refusal.

Inputs: claims frozen at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/claims.json`; instrument freeze `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`; baseline `5bc56a81d196caeb8d24551928b883802697aabb`; measured integration REV `d3232d56a909576aef6370243c5d457fbf42b1d2` (recorded in `.ufo/waves/round-39/measure/pre-integration-counters.txt` line 1 `REV=...` with `C1_EXIT=0`; commit subject "round-39: verify C2 sentence-mutation red control"; ancestor of lane HEAD `1ace2fd`). The frozen C1 counter does not re-run the browser; it verifies the committed receipt and refuses the round-38 v1 control. No live browser was launched (item does not require one).

## Freeze integrity (committed bytes)

- `git cat-file blob 9c09ebb1:.ufo/waves/round-39/counters/c1-egress-session-bound.mjs | sha256sum` → `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e` == `frozenDigests` entry.
- `git cat-file blob 9c09ebb1:scripts/playwright-firefox-egress-round39.mjs | sha256sum` → `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc` == `frozenDigests` entry.
- Same two sha256 at the measured REV `d3232d56` (blob re-hash, and worktree `sha256sum` after checkout) — counter and driver bytes are identical at freeze commit and measured tip.

## 1. Clean clone reproduction at the measured tip

```
git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone   # $S=/fast/scratch/hyaku/tabi-r39/RevC1Green
test "$(git rev-parse --show-toplevel)" = "$S/clone"          # TOPLEVEL-OK (host guard)
git checkout --quiet d3232d56a909576aef6370243c5d457fbf42b1d2 # HEAD=d3232d56..., dirty=0, node v24.21.0
node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev d3232d56a909576aef6370243c5d457fbf42b1d2 --repo . --json
```

Observed (evidence `c1-reproduce.json`, `c1-reproduce.txt`, `c1-reproduce.meta`):

- exit code **0**; `predicate: true`; `findings: []`.
- `receipt`: `schemaOk:true, runs:2, binding:true, versionBound:true, refused:false`.
- `control`: `v1Present:true, refused:true`, refusalReasons: `schema tabi-pw-firefox-receipt-v1 != tabi-pw-firefox-egress-receipt-v2`, `run1 has no owned pid tree`, `run1 sampleCount undefined < 8`, `run2 has no owned pid tree`, `run2 sampleCount undefined < 8`.
- Summary line: `C1_EGRESS_SESSION_BOUND predicate=met rev=d3232d56... findings=0 controlRefused=true`.
- Emitted `predicateSentence` byte-identical to frozen `claims.json` claims[C1].predicate (checked by JSON equality in the harness; copy in `c1-predicate-sentence.txt`).

Matches the recorded pre-integration run (`C1_EXIT=0`, same findings shape) — reproduction confirmed.

## 2. Single-field mutation → refusal

Fixture: `git clone --no-hardlinks $S/clone $S/fixture`; toplevel asserted; `checkout d3232d56...` (dirty=0). Mutation applied to `corpus/evidence/round-39/playwright-egress/receipt.json` line 341: `runs[0].survivors: 0 → 1` (unique edit anchored on run1's `coverageMs:1560`/finalSweep `t:1793120279271`; run2 block untouched). Committed in the fixture because the counter reads receipts via `git show REV:path` (git objects), not the worktree:

```
git diff -U0 HEAD~1 HEAD   # exactly: @@ -341 +341 @@  -   "survivors": 0,  +   "survivors": 1,   (1 file, 1 insertion, 1 deletion)
```

Fixture mutation commit: `722b8f9e2b2e5699a1bd79b7a45d44e8a4095a84`.

```
node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev 722b8f9e... --repo . --json
```

Observed (evidence `c1-mutant.json`, `c1-mutant.txt`, `c1-mutant.meta`):

- exit code **1**; `predicate: false`; summary `C1_EGRESS_SESSION_BOUND predicate=not-met rev=722b8f9e... findings=1 controlRefused=true`.
- Exactly one finding: `{"id":"run1-survivors","why":"survivors 1 != 0"}`. Control still refused; all other receipt checks unaffected.

Rev-scoping cross-check in the same fixture repo at the parent rev `d3232d56...`: exit **0**, `predicate:true`, `findings:0` (`c1-fixture-parent-rerun.json`) — refusal is attributable solely to the committed field mutation, and the counter provably evaluates committed bytes at `--rev`.

## Hygiene

- No commits/pushes outside my fixture/clone under `/fast/scratch/hyaku/tabi-r39/RevC1Green/` (asserted `git rev-parse --show-toplevel` before every fixture git mutation); production lane only read. No tool installs (node v24.21.0 preexisting). No pacman. No spawns. Scratch removed before yield: verified absent.
- Evidence: `.ufo/waves/round-39/w1/RevC1Green/{c1-reproduce.json,c1-reproduce.txt,c1-reproduce.stderr,c1-reproduce.meta,c1-predicate-sentence.txt,c1-mutant.json,c1-mutant.txt,c1-mutant.stderr,c1-mutant.meta,c1-fixture-parent-rerun.json}`.

## Observations / residual risk (non-blocking)

- Counter header comment says "the receipt is read at --repo's worktree" but the code reads `git show ${REV}:${path}` (git objects). Behavior is stricter than the comment (committed bytes only); it does not affect the C1 predicate or kill rule, and my protocol (commit the mutation) confirms the committed-bytes semantics. Flagging as a comment/code mismatch only.
- C1 "before" state independently re-observed at baseline `5bc56a81` semantics via the frozen record (`measure/c1-before.txt`: `FINDING receipt-absent ... predicate=not-met ... controlRefused=true` at baseline rev) — consistent with the claims' `before` narrative; not re-run by me at that rev.

VERDICT ok C1 reproduced at measured tip d3232d56 on committed bytes (exit 0, predicate true, control refused, predicate sentence byte-identical to frozen claims); single-field mutation runs[0].survivors 0->1 refused in fixture commit 722b8f9e (exit 1, finding run1-survivors, predicate not-met); no installs
