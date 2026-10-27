# MutC1ReceiptB — C1 receipt mutation probe (round 39, w1)

Seat: MutC1ReceiptB (mutation-tester, leaf — no dispatch). Scope: mutate the frozen C1
receipt fixture one field at a time and check the frozen counter kills each mutant.
No live browser needed (the counter never re-runs the browser; it reads git blobs at
`--rev`). No tool installs (operator tooling directive: nothing installed).

## Underpinnings read before acting
- `.ufo/waves/round-39/claims.json`: C1 = coverage capability, predicate sentence
  "schema v2 AND two unrefused runs … zero survivors AND the fixture port closed …",
  frozenAt `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, baseline `5bc56a81…`, and C2.
- Both frozen counters: `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs` (168 ln)
  and `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` (292 ln).
- Counter bytes at freeze sha256 `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e`
  == `claims.json.frozenDigests` entry. C2 (`eefc8997…`) unchanged, not exercised further.

## Method
- Scratch (deleted after probe, see Restoration): `/fast/scratch/hyaku/tabi-r39/MutC1ReceiptB/`.
- `git clone --no-hardlinks` of the lane into `$S/clone`, `git checkout --detach 9c09ebb1…`;
  toplevel asserted (`/fast/scratch/hyaku/tabi-r39/MutC1ReceiptB/clone`); worktree clean.
  Per-mutant copies `cp -a $S/clone $S/c-<mut>`; each mutant committed in its own copy
  (git mutation only inside the scratch clone; `git rev-parse --show-toplevel` asserted first).
- Detector (same bounded command for pristine / mutated / restored bytes):
  `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev <REV> --repo <clone> --json`
  Exit contract: 0 predicate met; 1 predicate not met; 2 could-not-evaluate.
- Note: the counter header comment says "the receipt is read at --repo's worktree", but the
  code reads `git show REV:path` (git objects) — mutants therefore had to be committed.
  Observation only; all probes ran from committed bytes.

## Baseline (pristine bytes — required pass)
- Fixture `corpus/evidence/round-39/playwright-egress/receipt.json`
  sha256 `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493` (blob `2e607b4aa604…`).
- Exit **0**, `predicate=true`, `findings=[]`; control leg `refused=true` with the 5 v1 reasons.
  Evidence: `pristine.json`. Baseline passes ⇒ mutant verdicts are conclusive.

## Mutants (one field per fixture, run1 first occurrence; diff vs freeze = `1 file changed, 1 insertion(+), 1 deletion(-)` each)
| # | mutant | mutated sha256 | mutant REV | expected detector | observed exit | observed finding | verdict |
|---|--------|----------------|-----------|-------------------|---------------|------------------|---------|
| M1 | `run1.survivors: 0→1` | `4cc2b7e1435117bd3f9c3432b47c8c47a00fbf1d11511e930d2fe481b4381419` | `4960c53790225e99f41c4bb492bb591fa0d5f594` | exit 1, `run1-survivors` | **1**, `predicate=false` | `run1-survivors` — "survivors 1 != 0" | **killed** |
| M2 | `run1.portClosed: true→false` | `cb69bd336253ec932e8127e2eb53d33dc16777260c5209f99d8da65b8431cf16` | `84653707368938711d08f71cbd6f25897b340fd4` | exit 1, `run1-port` | **1**, `predicate=false` | `run1-port` — "fixture port not closed" | **killed** |
| M3 | `run1.sampleCount: 9→7` | `3e759d19e63aa01c3b01d4fafd2a3ac194bfe3edd8fdb3c7b671288d460ebf70` | `bc231d566934fdb0f6119fbac1cf11ca4a9a48d8` | exit 1, `run1-samples` | **1**, `predicate=false` | `run1-samples` — "sampleCount 7 < 8" | **killed** |
| M4 | `run1.coverageMs: 1560→999` | `8a8f1920f9dea05eb9c2fee66617a23dddc1cbf31e8aa2210bc892d8ff3e6b6b` | `70cd91cdc978890eda89102925344f47fbab310d` | exit 1, `run1-coverage` | **1**, `predicate=false` | `run1-coverage` — "coverageMs 999 < 1000" | **killed** |
| M5 | `run1.egressNonLoopback: 0→1` | `60f13c4c55845a2b62ec5ca131f738f542750d3c68d5a54cf5d8cf493ee94ee5` | `efe7ee3cd1d128b510efbaaa9f4cb5730e40cfce` | exit 1, `run1-egress-total` | **1**, `predicate=false` | `run1-egress-total` — "egressNonLoopback 1 != 0" | **killed** |

Representative command (M1; the other four are identical with their clone/rev):
```
cd /fast/scratch/hyaku/tabi-r39/MutC1ReceiptB/c-surv
git rev-parse --show-toplevel   # == this clone dir (asserted)
git add corpus/evidence/round-39/playwright-egress/receipt.json
git -c user.name=MutC1ReceiptB -c user.email=mut@seat.local commit -q --no-verify -m "mutant run1.survivors=1"
node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev 4960c53790225e99f41c4bb492bb591fa0d5f594 --repo . --json
# exit 1; findings: [{"id":"run1-survivors","why":"survivors 1 != 0"}]; predicate=false
```
Full stdout/stderr per probe: `mut-{surv,port,samp,cov,egr}.json|err` in this directory.

## Restoration (after each mutant, `git reset --hard 9c09ebb1…` in the mutant clone)
- Receipt sha256 after reset: `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`
  (== pristine, all five clones); `git status --porcelain` empty; counter re-run on restored
  bytes: exit **0**, `predicate=true`, `findings=[]` — `restored-{surv,port,samp,cov,egr}.json`.
- Counter file sha256 unchanged across the whole probe: `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e`.
- Scratch deleted after evidence copy: `rm -rf /fast/scratch/hyaku/tabi-r39/MutC1ReceiptB`.
- Production lane untouched: all mutations lived in scratch clones; only this evidence
  directory and `../MutC1ReceiptB.md` were written under `.ufo/waves/round-39/w1/`.

## Result
5/5 mutants killed by the frozen C1 counter; 0 survivors; no finding. The do-nothing v1
control stayed refused in every run (same 5 refusal reasons). Observed finding ids match the
counter's per-run check ids exactly; the aggregate `survivors`/`egress-total` legs were not
triggered because only the run1 field was mutated (still exit 1 via the per-run check — the
smallest behavior-bearing point flips the predicate).

VERDICT ok — C1 counter killed all five single-field receipt mutants (survivors=1, portClosed=false, sampleCount=7, coverageMs=999, egressNonLoopback=1); 0 survivors, pristine and restored bytes pass at exit 0.
