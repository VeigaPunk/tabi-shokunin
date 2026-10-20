# MutCountedInputsUndeclared — mutation probe for gate reason `counted_inputs_undeclared`

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + C2 counter repair)
- Probe date: 2026-10-20. Access: read-only on the lane; all artefacts under `/tmp/tabi-mut-ciu-MkA5Xw`. No installs.
- Landed blobs probed (worktree == HEAD for these paths):
  - `scripts/check-measurement-binding.mjs` sha256 `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb`
  - `scripts/selftest-measurement-binding.mjs` sha256 `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae`
  - `.ufo/waves/round-16/measure.mjs` sha256 `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9`
  These equal the counter's own `gateSha256`/`selftestSha256` at `b444ca8`, so the probe targeted the measured blobs.

## Verdict

**BREAKS (partial kill).**

- The reason is emitted at three places: normal-path empty/missing list (`scripts/check-measurement-binding.mjs:487`), normal-path declared-input-not-in-tree (`:491-492`, via `hasTreeEntries` `:275-281`), and the unconditional legacy adapter (`:608`). The reason's documented contract includes both normal-path conditions (`:54-56`: "countedInputs missing/not-array/empty, **or a declared input resolves to no tree entry at measuredRevision**").
- A mutant that deletes the **whole** emitter (both normal-path sites) is killed: selftest exits 1 with 2 failing cases, and the real C1 counter at a mutant commit counts **0**.
- A mutant that weakens **only** the second documented condition (`:491-493` dead code, or `hasTreeEntries` forced to `true` at `:280`) **survives both**: selftest `verdict=clean cases=43 reasons=13` exit 0, and the real C1 counter at the mutant commit still counts **1** with `failures: []`.
- The surviving mutant is **not** an equivalent mutant: the honest gate rejects a manifest declaring `countedInputs: ["absent/"]` (exit 1, `finding claim=C1 reason=counted_inputs_undeclared detail=countedInput=absent/ resolves to no tree entry at measuredRevision=…`); both surviving mutants return `verdict=clean claims=1 bound=1` exit 0 for the same fixture.
- Consequence: `C1=1` at `b444ca8` is unchanged (verified), but it does not establish that the reason's second declared condition is bound. A gate build that silently drops that condition passes the selftest and the counter identically. `selftest-measurement-binding.mjs:249` is the only normal-path `counted_inputs_undeclared` case and it uses `countedInputs: []`; the multi-claim case (`:313-315`) also uses `[]`; no fixture anywhere declares a non-empty but unresolvable input (`grep -rn "resolves to no tree entry" .` outside `.git` hits only the gate source itself). The counter's vocabulary check (`measure.mjs:150`, `VOCAB` `:65-70`) is satisfied by the empty-list and legacy cases, so `missingVocab` stays `[]`.

Severity: medium. It is a coverage hole in the operability evidence, not a falsification of the measured count at the snapshot: the gate itself is honest at `b444ca8`.

## Mutants (exact edits, verified with `diff -u`)

Each mutant is a byte copy of the landed gate with one exact-match replacement; the generator asserts exactly one occurrence per edit. Full diffs were printed and match the deltas below.

| id | edit | sha256 |
|---|---|---|
| A | delete the whole normal-path emitter block `:485-494` (empty + per-input) | `01a5ba4df9a9f5669fe12bcde749efcc33abcc27f7db0f43e9a7faccfe341fb9` |
| B | delete the legacy emission `:608` (`add(REASON.countedInputsUndeclared, 'no countedInputs declared')`) | `f643db84e6f7e2be42db900b07f4a87fc39059d3ba9c7e5d321c68880fca5a58` |
| C | delete only the per-input branch `:489-493` (replaced by `void input;`) | `3b65b8679f9ea0143042629d35a0c8c5df07533f951a125b9bebd5b8ce1651a3` |
| D | delete only the empty/missing-list emission `:487` | `b0f1756446c844d25b1886803592cffdc9fb8b8cf70b5c5b08c8ca3b54ec0052` |
| E | weaken `hasTreeEntries` to `return true` at `:280` | `9f24e5ea6afa49a00c7122b4189f56da8dd1de1c8e2a7a9d14109d3035250a8a` |

## Observed results

### 1. Baseline (landed blobs, tmp copy)

```
$ D=/tmp/tabi-mut-ciu-MkA5Xw
$ node $D/scripts/selftest-measurement-binding.mjs --gate $D/scripts/check-measurement-binding.mjs
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
EXIT=0
```

### 2. Selftest against each mutant (`--gate <mutant>`)

| mutant | selftest exit | summary | failing cases |
|---|---|---|---|
| A | 1 | `verdict=failed cases=43 reasons=13` | `counted_inputs_undeclared` (expected_exit=1 actual_exit=0 actual_reasons=-), `multi_claim_inputs_undeclared` (same) |
| B | 1 | `verdict=failed cases=43 reasons=13` | all 4 legacy cases (`legacy_counter_unchanged`, `legacy_counter_changed`, `legacy_r15_shape_digest_mismatch`, `legacy_r15_shape_digest_mismatch_control`), each missing `counted_inputs_undeclared` |
| C | **0** | **`verdict=clean cases=43 reasons=13`** | none |
| D | 1 | `verdict=failed cases=43 reasons=13` | `counted_inputs_undeclared`, `multi_claim_inputs_undeclared` |
| E | **0** | **`verdict=clean cases=43 reasons=13`** | none |

Exact failing lines for A:

```
case=counted_inputs_undeclared expected_exit=1 actual_exit=0 expected_reasons=counted_inputs_undeclared actual_reasons=- FAIL
case=multi_claim_inputs_undeclared expected_exit=1 actual_exit=0 expected_reasons=counted_inputs_undeclared actual_reasons=- FAIL
```

For B (all four expected sets lose only `counted_inputs_undeclared`):

```
case=legacy_counter_unchanged expected_exit=1 actual_exit=1 expected_reasons=counter_digest_unrecorded,counted_inputs_undeclared actual_reasons=counter_digest_unrecorded FAIL
case=legacy_r15_shape_digest_mismatch_control expected_exit=1 actual_exit=1 expected_reasons=counter_digest_unrecorded,counted_inputs_undeclared actual_reasons=counter_digest_unrecorded FAIL
```

### 3. Real C1 counter on mutant builds

A full copy of the lane (60 MB, including `.git`) was made at `/tmp/tabi-mut-ciu-MkA5Xw/lane`, each mutant was committed there on top of `b444ca8`, and the copy's own `.ufo/waves/round-16/measure.mjs` was run at that commit. `ROOT` resolves inside the copy, so `countC1` materialises the mutant gate + landed selftest and runs them exactly as it does in the lane. Baseline in the copy reproduced `c1=1`.

```
$ node .ufo/waves/round-16/measure.mjs <copy-rev> --claim C1
```

| mutant | probe commit | `c1_binding_contracts` | `failures` |
|---|---|---|---|
| none (base `b444ca8`) | `b444ca8` | 1 | `[]` |
| A | `a7be556b2b9e1488143b8ec7ffcd765c3be760a7` | **0** | `selftest exit 1`, `selftest summary absent, not clean, or case count mismatch`, `2 case lines not exact PASS` |
| B | `fdf2fc80873b5d838e7f4afbf2494ccf6cd99093` | **0** | selftest exit 1 / 4 bad case lines, plus legacy C1 and C2 exact-set misses on `counted_inputs_undeclared` |
| C | `48f5ae3575ca8d048b1c4c8774d2a732036fc633` | **1** | `[]` |
| D | `f772ad35ef365c60c6f63ef6ae52caf9630bd480` | **0** | selftest exit 1 / 2 bad case lines |
| E | `d6ae55d471c9beada7f1e9a007be9ff2c7665086` | **1** | `[]` |

A, B and D confirm the counter's own behavioural checks (`measure.mjs:143-157`) drop the count to 0 when the selftest loses the reason. C and E show the same counter leaves 1 when only the declared-input-not-in-tree condition is dead — `missingVocab` is `[]` for both because `counted_inputs_undeclared` still appears in PASS lines from the empty-list and legacy cases (`measure.mjs:150`).

### 4. Behavioural distinguishability (proves the surviving mutant is live)

Throwaway repo shaped like the selftest's `cleanShape` (counter `1 iff counted/input.txt exists at REV`; digest and before/after arms consistent), manifest at HEAD, measured revision = rev1:

```
$ node /tmp/tabi-mut-ciu-MkA5Xw/behaviour-check.mjs /tmp/tabi-mut-ciu-MkA5Xw
fixture=countedInputs=["absent/"] gate=honest exit=1 stdout="MEASUREMENT_BINDING verdict=failed claims=1 bound=0
finding claim=C1 reason=counted_inputs_undeclared detail=countedInput=absent/ resolves to no tree entry at measuredRevision=caddcbce…"
fixture=countedInputs=["absent/"] gate=C-per-input-emitter-disabled exit=0 stdout="MEASUREMENT_BINDING verdict=clean claims=1 bound=1"
fixture=countedInputs=["absent/"] gate=E-hasTreeEntries-always-true exit=0 stdout="MEASUREMENT_BINDING verdict=clean claims=1 bound=1"
fixture=countedInputs=["counted/"] (control) gate=honest exit=0 stdout="MEASUREMENT_BINDING verdict=clean claims=1 bound=1"
fixture=countedInputs=["counted/"] (control) gate=C-… exit=0 stdout="… verdict=clean …"
fixture=countedInputs=["counted/"] (control) gate=E-… exit=0 stdout="… verdict=clean …"
fixture=countedInputs=[] (empty control) gate=honest exit=1 stdout="… reason=counted_inputs_undeclared detail=countedInputs missing or empty"
fixture=countedInputs=[] (empty control) gate=C-… exit=1 stdout="… reason=counted_inputs_undeclared detail=countedInputs missing or empty"
fixture=countedInputs=[] (empty control) gate=E-… exit=1 stdout="… reason=counted_inputs_undeclared detail=countedInputs missing or empty"
```

The control rows show the surviving mutants are selective, not generally broken: they still reject `countedInputs: []` and still accept a resolvable input. Only the documented unresolved-input condition is lost.

## Actionable repair (verified shape, not applied — lane is read-only)

Add one fixture cheap in the existing selftest framework; no gate change needed:

```js
negative('counted_inputs_undeclared_unresolved_input',
  mut => cleanShape(mut ? { countedInputs: ['absent/'] } : {}),
  1, ['counted_inputs_undeclared']);
```

`cleanShape`'s rev1 contains the counter and `counted/input.txt` but not `absent/`, so every other check is clean and the exact reason set is `{counted_inputs_undeclared}` (the `["counted/"]` control is the existing clean shape; both verified above). This case kills mutants C and E and makes the C1 counter drop to 0 for them, because it goes through the counter's per-case exact-PASS check and adds a live PASS sighting of the reason at the same time.

## Residual risk / verification gaps

- Mutation testing was behavioural, not exhaustive: only the five mutants above; e.g. rewriting the detail string, or folding the legacy reason into a different code path, was not probed.
- The counter-on-mutant results come from a full-lane `/tmp` copy with probe commits; the counter's logic and inputs (gate/selftest blobs at the measured revision, real copied history for `36240c7`) are identical to the lane, but this is a copy, not a lane measurement.
- `countedInputs` missing/not-array and the empty array share the same branch (`check-measurement-binding.mjs:485-488`), so there is no separate semantic gap there; both are killed by mutant D.
- Not probed: interaction of these mutants with `--reproduce` (the reason fires before the reproduce arm; upstream code guards reproduction behind `findings.length === 0`, so a surviving mutant could allow reproduction on a manifest with an unresolvable declared input — untested here).
- Lane state: no lane writes by this probe; gate/selftest digests above are unchanged. `git status` at the end showed `?? .ufo/waves/round-16/w2/` (the wave's own report dir) and `?? corpus/evidence/round-16/measurement-binding.json` (mtime 2026-10-20 11:57:18) — the latter appeared during the probe window and was **not** created by it (all loopback commands were read-only; every write went under `/tmp/tabi-mut-ciu-MkA5Xw`).

## Commands (reproduction)

```sh
D=$(mktemp -d /tmp/tabi-mut-ciu-XXXXXX); mkdir -p "$D/scripts"
cp scripts/check-measurement-binding.mjs scripts/selftest-measurement-binding.mjs "$D/scripts/"
node "$D/scripts/selftest-measurement-binding.mjs" --gate "$D/scripts/check-measurement-binding.mjs"   # clean 43/43
node /tmp/tabi-mut-ciu-MkA5Xw/make-mutants.mjs                                                         # 5 mutants
for f in "$D"/mutant-*.mjs; do node "$D/scripts/selftest-measurement-binding.mjs" --gate "$f"; done     # table §2
cp -a "$PWD" "$D/lane"; # commit each mutant on top of b444ca8 in the copy, then:
node "$D/lane/.ufo/waves/round-16/measure.mjs" <mutant-commit> --claim C1                              # table §3
node /tmp/tabi-mut-ciu-MkA5Xw/behaviour-check.mjs /tmp/tabi-mut-ciu-MkA5Xw                              # table §4
```

Report: .ufo/waves/round-16/w2/MutCountedInputsUndeclared.md
