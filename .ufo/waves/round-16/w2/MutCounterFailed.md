# MutCounterFailed — mutation probe for gate reason `counter_failed`

Seat: `TabiR16.MutCounterFailed` (leaf, author-side). Date 2026-10-20.
Target snapshot: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair).
This is an author-side review artifact, not non-author certification.

## Verdict: BREAKS (scoped to emission-site coverage)

`counter_failed` has **two** emission sites. The selftest's single `counter_failed`
case kills one of them and does **not** kill the other:

| Site | Location | Mutation | Selftest | C1 counter |
|---|---|---|---|---|
| worktree-bytes refusal (pre-execution guard) | `scripts/check-measurement-binding.mjs:523` | M1 | **clean, 43/43 PASS, exit 0 — SURVIVES** | **counts 1** |
| reproduction-arm failure (exit/non-JSON/timeout) | `scripts/check-measurement-binding.mjs:534` | M2 | failed, 1 FAIL (`case=counter_failed`) — killed | counts 0 |
| both sites | 523+534 | M3 | failed — killed (via 534) | counts 0 |
| 534 reason swapped to `count_not_reproduced` | 534 | M4 | failed — killed (reason-set mismatch) | (not run; selftest red ⇒ 0) |

So the broad claim "disabling the code that emits `counter_failed` turns the
selftest red / makes C1 count 0" is **false for the worktree-refusal emitter**.
The selftest's `counter_failed` case only reaches site 534, because its fixture
counter `COUNTER_FAIL = 'process.exit(3);\n'` (selftest:84) commits and therefore
never trips the worktree guard. No fixture anywhere in the selftest leaves the
worktree counter different from the blob at `atRev`.

## Environment and baseline

- Lane HEAD: `b444ca8 round-16: repair C2 counter fixture-path read; retain first failing measurement`
- Copied, unmodified bytes (`mktemp -d`, `$TMP=/tmp/mutcf.DRBuEX`):
  - `check-measurement-binding.mjs` sha256 `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb`
  - `selftest-measurement-binding.mjs` sha256 `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae`
- Baseline selftest on the copies:

```
$ cd /tmp/mutcf.DRBuEX && node ./selftest-measurement-binding.mjs --gate /tmp/mutcf.DRBuEX/check-measurement-binding.mjs
...
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
exit=0
```

- C1 counter at the target revision (read-only):

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"revision":"b444ca8e...","c1_binding_contracts":1,"gateSha256":"5150611c...","selftestSha256":"8c5426f2...",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],
                                   "C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c7..."},"failures":[]}
exit=0
```

## Mutant M1 — the surviving mutant (finding F1, severity: medium)

Mutant is a one-token change, `node --check` clean, only the worktree-refusal
emission is disabled (the `add` becomes dead code):

```diff
--- gate
+++ mutant
@@ -521,3 +521,3 @@
     }
-    if (!worktreeOk) {
+    if (false && !worktreeOk) {
       add(REASON.counterFailed,
```

Selftest result — **no case goes red**:

```
$ node ./selftest-measurement-binding.mjs --gate /tmp/mutcf.DRBuEX/gate.M1_worktree_guard_disabled.mjs
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
exit=0
PASS=43 FAIL=0
```

Behavioural proof that the mutation is real (temp fixture repo under
`/tmp/mutcf.DRBuEX/fixture`: rev0 without `counted/input.txt`, rev1 with the
honest counter + input, HEAD with the manifest; then the worktree counter is
rewritten — uncommitted — to the same honest logic plus
`writeFileSync('PWNED','executed')`):

```
$ node <honest gate> --repo /tmp/mutcf.DRBuEX/fixture --check .../measurement-binding.json --reproduce
MEASUREMENT_BINDING verdict=failed claims=1 bound=0
finding claim=C1 reason=counter_failed detail=counter=measure.mjs worktree bytes are absent, not regular, or differ from blob at at=57bf742e...; refusing to execute
exit=1   canary PWNED exists: False

$ node <M1 gate> --repo /tmp/mutcf.DRBuEX/fixture --check .../measurement-binding.json --reproduce
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0   canary PWNED exists: True
```

The mutant executes uncommitted worktree bytes and reports `verdict=clean
bound=1` where the honest gate refuses with `counter_failed`. This is exactly
the property the reason exists to enforce ("Never execute unbound bytes",
gate:512-525).

## F2 — would the C1 counter count 0? No for M1, yes for M2

The counter's C1 body (`countC1`, `.ufo/waves/round-16/measure.mjs:116-171`) runs
(a) the materialised selftest and requires every case exact-PASS plus full VOCAB
coverage, and (b) the gate `--legacy` on the real round-15 measurements. It
never runs the gate's `--check` on the round-16 manifest. Therefore its verdict
is inherited from the selftest.

Executed against a `/tmp` clone of the lane (`git clone --no-hardlinks`, source
read-only), with each mutant committed as a child of `b444ca8`:

```
control (clone HEAD = b444ca8 tree): c1_contracts=1 failures=[]
M1rev f92eed50bc347e855b8b085f4960a033df7fbd2e ("if (false && !worktreeOk)"):
  {"c1_binding_contracts":1, "failures":[],
   "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]}}
M2rev 8b2a1a2a8ce7d3f8e0fb7352fcc11da3d518256d (arm-failure emission removed):
  {"c1_binding_contracts":0,
   "failures":["selftest exit 1","selftest summary absent, not clean, or case count mismatch",
               "1 case lines not exact PASS","vocabulary not exercised: counter_failed"]}
```

So: **M1 → C1 still 1; M2 → C1 becomes 0.** The counter's vocabulary check does
not help here: `counter_failed` remains "exercised" by site 534, so
`missingVocab` is empty even though site 523 has no test (measure.mjs:154-157).

For completeness, the drift layer does exist but is outside the C1 count: with
the worktree manifest copied to `/tmp`, the honest gate reports
`verdict=clean claims=2 bound=2` at `b444ca8` and
`finding claim=C1 reason=counted_input_changed detail=paths=scripts/check-measurement-binding.mjs`
(exit 1) at `M1rev`. The C1 counter never invokes this check.

## Residual risk / verification gaps

1. **Primary gap (F1).** Any regression that removes or neuters the
   worktree-bytes refusal is invisible to both the selftest and the C1 counter,
   while it converts `--reproduce` from "execute the measured blob" to "execute
   whatever is on disk". This is the only guard enforcing that reproduction
   consumes committed bytes.
2. `counter_failed` is asserted by exactly one selftest case
   (`scripts/selftest-measurement-binding.mjs:268-269`) with one fixture shape;
   the negative-case/control design is sound, but the fixture space does not
   include a dirty worktree. `cleanShape` (selftest:145-166) writes every
   mutation before `commitAll`, so all fixtures reproduce against committed
   bytes by construction.
3. Minimal remediation (recommendation, not applied): add a negative case that
   builds `cleanShape()`, then rewrites `measure.mjs` after the final commit and
   runs `--reproduce`, expecting exit 1 + exactly `counter_failed`. That single
   fixture would kill M1. Adding a manifest `--check --at <counted rev>
   --reproduce` to the C1 counter would not help in a clean worktree and is not
   a substitute.
4. Scope note: this proves a hole in mutation coverage of the shipped gate, not
   a defect in the shipped gate itself — the honest gate at `b444ca8` refuses as
   designed (observed above), and M2/M3/M4 are killed.

## Lane hygiene

- No file under the lane was created, modified or deleted by this seat; all
  mutants, fixtures, the clone and outputs live under `/tmp/mutcf.DRBuEX`.
  `git clone --no-hardlinks` and the counters are read-only against the lane.
- Lane status at read time showed `?? .ufo/waves/round-16/w2/` (my report dir)
  and `?? corpus/evidence/round-16/measurement-binding.json`; the latter was not
  present in the first status of this session and was not created by this seat —
  noted only so concurrent siblings' writes are not attributed here.
- Tooling directive: no installs or upgrades were needed or performed.
