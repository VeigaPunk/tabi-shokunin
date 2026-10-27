# MutC1FinalSweep — round 39 C1 mutation probe

## Target and frozen inputs
- Frozen claims: `.ufo/waves/round-39/claims.json`; predicate requires zero non-loopback observations on both `ss` and `/proc`, including the post-close final sweep. Frozen counter: `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs` (claims digest `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e`). C2 frozen counter was also read before acting: `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs`.
- Detector is the frozen C1 counter, not a browser rerun. Baseline lane revision used for both isolated probes: `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`.
- Scratch clone root was `/fast/scratch/hyaku/tabi-r39/MutC1FinalSweep/repo`; the clone root assertion passed. Scratch was removed by EXIT trap. No install, lane change, or tool use beyond Node/git/shell was made.

## Probe A — final sweep mutation plus removed aggregate sample surface
Mutation in scratch receipt, run1: set `finalSweep.ss.nonLoopback=1`, delete `finalSweep.proc`, and delete `sockets.proc`; all other receipt bytes/data retained by JSON parse/stringify. This challenges a positive non-loopback count and an unavailable surface together.

Commands (arguments resolved from the stated scratch/repo paths):
```sh
git clone -q --shared "$R" "$S/repo"
test "$(git -C "$S/repo" rev-parse --show-toplevel)" = "$S/repo"
node "$S/c1.mjs" --rev "$BASE" --repo "$S/repo" --json
node -e 'const fs=require("fs"); const p=process.argv[1]; const d=JSON.parse(fs.readFileSync(p)); d.runs[0].finalSweep.ss.nonLoopback=1; delete d.runs[0].finalSweep.proc; delete d.runs[0].sockets.proc; fs.writeFileSync(p, JSON.stringify(d,null,1)+"\\n")' "$S/repo/corpus/evidence/round-39/playwright-egress/receipt.json"
git -C "$S/repo" add corpus/evidence/round-39/playwright-egress/receipt.json
git -C "$S/repo" -c user.name=MutationProbe -c user.email=probe@invalid commit -qm 'scratch mutation: final sweep fields and sample surface'
node "$S/c1.mjs" --rev "$MUT" --repo "$S/repo" --json
cp "$S/original.json" "$S/repo/corpus/evidence/round-39/playwright-egress/receipt.json"
git -C "$S/repo" add corpus/evidence/round-39/playwright-egress/receipt.json
git -C "$S/repo" -c user.name=MutationProbe -c user.email=probe@invalid commit -qm 'scratch restore: original receipt bytes'
node "$S/c1.mjs" --rev "$REST" --repo "$S/repo" --json
```
Observed: pristine exit `0`, predicate `true`, no findings. Mutated revision `78cfcd2c51d37cf05f23d2c98a4e33f6042a421f`, exit `1`, predicate `false`, findings `run1-egress` (`ss=0 proc=null`) and `run1-finalsweep-egress`. Restored revision `a28d1f84ba92fdbc0f5f34bd46c5984411656b8d`, exit `0`, predicate `true`, no findings. Full actual detector JSON: `pristine.json`, `mutated.json`, `restored.json`; exit/revision record: `probe.txt`.

## Probe B — remove a surface from a single sample
A separate scratch mutation deletes `runs[0].samples[0].proc`, without changing either aggregate `sockets` surface or the final sweep. Observed pristine exit `0`; mutated revision `86433fe8fb746f4068b522cae5b776b82c6ff96f` exit `0`, predicate `true`, findings `[]`; restored revision `8d11823e653063d46c07d3e4ff79b0577c856743` exit `0`, predicate `true`. Full JSON: `sample-pristine.json`, `sample-mutated.json`, `sample-restored.json`; hashes/revisions/exits: `sample-probe.txt`.

This classifies the current contract implementation: **sample-level `ss`/`proc` fields are not required on every sample**. The counter checks sample count and coverage, then checks the aggregate `r.sockets.ss.nonLoopback` and `r.sockets.proc.nonLoopback`; it does not traverse `r.samples`. For final sweep, it evaluates `finalSweep` fields, and unavailable fields fail closed (missing `proc` yielded `proc=null` and a nonzero detector exit). The counter thus enforces the two aggregate surfaces and post-close sweep, not every individual sample's dual-surface presence.

## Restoration and evidence
- Scratch-clone receipt in the restored sample-only probe had SHA-256 `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493` before and after restoration (recorded equal in `sample-probe.txt`). The source receipt remained untouched; the EXIT trap removed the scratch clone.
- Probe evidence files are all under `.ufo/waves/round-39/w1/MutC1FinalSweep/`.
- No checks beyond the bounded frozen-counter runs were performed.

VERDICT finding — counter correctly rejects mutated post-close final-sweep data, but accepts a missing dual-surface value in an individual sample; per-sample surface completeness is not enforced.
