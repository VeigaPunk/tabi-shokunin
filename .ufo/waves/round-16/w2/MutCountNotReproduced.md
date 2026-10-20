# MutCountNotReproduced — mutation probe of gate reason `count_not_reproduced`

Author-side attack item (w2, leaf). Target snapshot
`b444ca8e024f386124418169e8e400221524bba3` (lane HEAD, measured revision).

- Runtime: `node v24.21.0`. The selftest runner and `measure.mjs` both spawn
  `process.execPath`; no PATH-resolved interpreter is involved, so the mutation
  run and the lane run use one canonical runtime.
- No tool installs or upgrades this run.
- Lane read-only: all mutants were built from copies in
  `/tmp/mut-cnr.bxqACr/` (`edit` on the copies only). `git status --porcelain`
  after the probe shows no modified tracked file; only the pre-existing
  untracked wave directory and the untracked
  `corpus/evidence/round-16/measurement-binding.json`.
- Resume paths: not applicable to this item; no `resume_continuity_v1` surface
  is touched by the gate, the selftest, or the counter.

## 1. Identity of the attacked bytes

```
$ sha256sum scripts/check-measurement-binding.mjs scripts/selftest-measurement-binding.mjs
5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb  scripts/check-measurement-binding.mjs
8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae  scripts/selftest-measurement-binding.mjs
$ sha256sum /tmp/mut-cnr.bxqACr/check-measurement-binding.mjs /tmp/mut-cnr.bxqACr/selftest-measurement-binding.mjs
5150611c…a0d6fb  /tmp/mut-cnr.bxqACr/check-measurement-binding.mjs
8c5426f2…7168f2ae  /tmp/mut-cnr.bxqACr/selftest-measurement-binding.mjs
```

The copies are byte-identical to the lane, and each mutant's selftest copy is
the stock bytes (`8c5426f2…` in all six directories). Only the gate copy differs,
at the single sites shown in §3.

## 2. Baseline (unmutated copy)

```
$ node /tmp/mut-cnr.bxqACr/selftest-measurement-binding.mjs \
    --gate /tmp/mut-cnr.bxqACr/check-measurement-binding.mjs
…
case=count_not_reproduced_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=count_not_reproduced expected_exit=1 actual_exit=1 expected_reasons=count_not_reproduced actual_reasons=count_not_reproduced PASS
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
exit=0
```

Lane counter claim (read-only):

```
$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1
{"rev":"e38d2599a922","count":0,"failures":["gate or selftest absent at revision"]}
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"rev":"b444ca8e024f","count":1,"failures":[],
 "selftest":{"exit":0,"cases":43,"bad":0,"missingVocab":[]},"legacy":1}
```

## 3. Mutants — each edits ONLY the `count_not_reproduced` emitter

Emitter, stock (gate:531-542):

```js
        if (!arm.ok) {
          add(REASON.counterFailed, …);
        } else if (!Object.hasOwn(arm.parsed, counter.countField)) {
          add(REASON.countNotReproduced, … observed=missing …);
        } else if (arm.parsed[counter.countField] !== expected) {
          add(REASON.countNotReproduced, … observed=<value> …);
        }
```

| id | single-site edit | selftest | C1 counter at mutant rev |
|---|---|---|---|
| M1 `m1_both` | delete both `else if` emitters (only `counter_failed` arm remains) | **red**, exit 1 | **0** |
| M2 `m2_mismatch` | delete value-mismatch emitter; keep missing-field emitter | **red**, exit 1 | **0** |
| M3 `m3_missing` | delete missing-field emitter; keep value-mismatch emitter | green, exit 0 | 1 |
| M4 `m4_beforearm` | `const arms = [[before, claim.before.count]];` → `const arms = [];` | green, exit 0 | 1 |
| M5 `m5_rename` | both emitters report `REASON.counterFailed` instead | **red**, exit 1 | **0** |
| M6 `m6_looseeq` | `!== expected` → `!= expected` | green, exit 0 | 1 |

Exact diffs (each `< 12` lines, from `diff -u` of the stock copy):

```
M1: removes the two `else if (!Object.hasOwn…)/(…!== expected)` branches.
M2: removes only the `else if (arm.parsed[counter.countField] !== expected)` branch.
M3: removes only the `else if (!Object.hasOwn(arm.parsed, counter.countField))` branch.
M4: -      const arms = [[before, claim.before.count]];
    +      const arms = [];
M5: both `add(REASON.countNotReproduced,` → `add(REASON.counterFailed,`.
M6: -        } else if (arm.parsed[counter.countField] !== expected) {
    +        } else if (arm.parsed[counter.countField] != expected) {
```

Selftest commands and decisive lines:

```
$ node /tmp/mut-cnr.bxqACr/m1_both/selftest-measurement-binding.mjs \
    --gate /tmp/mut-cnr.bxqACr/m1_both/check-measurement-binding.mjs
case=count_not_reproduced expected_exit=1 actual_exit=0 expected_reasons=count_not_reproduced actual_reasons=- FAIL
MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13
FAIL_DETAIL case=count_not_reproduced MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=1

$ … m2_mismatch …        → same FAIL line, exit 1
$ … m5_rename …          → case=count_not_reproduced … actual_exit=1 actual_reasons=counter_failed FAIL, exit 1
$ … m3_missing …         → MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13, exit 0
$ … m4_beforearm …       → MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13, exit 0
$ … m6_looseeq …         → MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13, exit 0
```

## 4. Counter re-measure at mutant revisions

A full clone of the lane (history through `36240c7…` present) at
`/tmp/mut-cnr.bxqACr/shadow`; per mutant, the mutant gate + stock selftest were
committed and the **lane's** counter run at that commit:

```
$ cd /tmp/mut-cnr.bxqACr/shadow
$ node .ufo/waves/round-16/measure.mjs <mutant-commit> --claim C1
```

| mutant | commit | `c1_binding_contracts` | `failures` |
|---|---|---|---|
| M1 | `e4897b0c43c3` | **0** | `selftest exit 1`, `summary … not clean`, `1 case lines not exact PASS`, `vocabulary not exercised: count_not_reproduced`; `selftest.bad=1`, `missingVocab=["count_not_reproduced"]` |
| M2 | `d353698ba368` | **0** | same four failures, `missingVocab=["count_not_reproduced"]` |
| M5 | `8a9ab06db59c` | **0** | same four failures, `missingVocab=["count_not_reproduced"]` |
| M3 | `38a021c20282` | 1 | `[]`; `selftest {exit:0,cases:43,bad:0,missingVocab:[]}` |
| M4 | `4fab8d13b533` | 1 | `[]`; `selftest {exit:0,cases:43,bad:0,missingVocab:[]}` |
| M6 | `560ac3e4a4a3` | 1 | `[]`; `selftest {exit:0,cases:43,bad:0,missingVocab:[]}` |

The `legacy` oracle arm stayed at exit 1 with the expected finding sets in every
run, so every zero above is attributable solely to the mutant selftest.

## 5. Are the green mutants equivalent? Characterization fixtures

Fixtures are temp Git repos (rev0 baseline, rev1 counter + `counted/input.txt`,
manifest at HEAD, `before={rev0,0}`, `after={rev1,1}`), run against the stock
gate and the mutant gate:

```
$ node <gate> --repo <fixture> --check <fixture>/manifest.json --reproduce
```

**M4 — counter constant `1` (before arm wrong, after arm right):**

```
stock:        exit=1 | MEASUREMENT_BINDING verdict=failed claims=1 bound=0
  finding claim=C1 reason=count_not_reproduced detail=arm=<rev0> … expected=0 observed=1
m4_beforearm: exit=0 | MEASUREMENT_BINDING verdict=clean claims=1 bound=1
```

So M4 is not an equivalent mutant: it removes the only guard that rejects a
constant counter. The gate's own comment on those lines says the before arm
exists "so a constant counter cannot pass", and the selftest comment records
that the before arm was added because a constant counter cannot pass both arms.
Neither the selftest nor the C1 counter notices its removal.

**M6 — counter emits `c1_binding_contracts` as a JSON string `"0"` / `"1"`:**

```
stock:        exit=1 | findings:
  count_not_reproduced … expected=0 observed="0"
  count_not_reproduced … expected=1 observed="1"
m6_looseeq:   exit=0 | MEASUREMENT_BINDING verdict=clean claims=1 bound=1
```

Loose equality also accepts `true` for expected `1`. No fixture emits a
non-numeric count, so the typed identity of `countField` is unenforced.

**M3 — counter emits JSON without the count field:**

```
stock:      exit=1 | count_not_reproduced … expected=0 observed=missing
                        count_not_reproduced … expected=1 observed=missing
m3_missing: exit=1 | count_not_reproduced … expected=0 observed=undefined
                        count_not_reproduced … expected=1 observed=undefined
```

Same exit and same reason set: the surviving mismatch branch catches
`undefined !== expected`, so M3 is **contract-equivalent** (detail-text-only
delta, `observed=missing` → `observed=undefined`). Its survival is not a
coverage hole; it only shows the `Object.hasOwn` arm is defense-in-depth whose
detail string is unasserted.

## 6. Verdict

**BREAKS (partial).** Split by mutant class, with the exact split below:

- Literal disable of the emitter (M1) — **HOLDS**: selftest goes red on
  `case=count_not_reproduced` (`actual_exit=0 actual_reasons=-`), and the C1
  counter at a revision holding that mutant returns
  `c1_binding_contracts: 0` with `missingVocab=["count_not_reproduced"]`.
- Value-mismatch emitter only (M2), reason-rename (M5) — **HOLDS**: both red,
  counter 0. The exact expected-reason-set assertion kills renaming.
- Missing-field emitter only (M3) — **HOLDS** on behaviour (equivalent mutant;
  reason and exit unchanged).
- Before-arm removal (M4) — **BREAKS**: selftest `clean cases=43`, counter 1, and
  a constant counter passes with `verdict=clean bound=1`.
- Strict→loose comparison (M6) — **BREAKS**: selftest `clean cases=43`,
  counter 1, and `"1"`/`true` is accepted as reproduced.

Therefore the named reason's emission is enforced only at the after-arm /
value-mismatch site. Two source-only weakenings of exactly the
`count_not_reproduced` emitter survive both layers of evidence and leave the C1
count at 1.

## 7. Residual risk and verification gaps

1. `count_not_reproduced` is carried by exactly one negative case plus its
   control (`COUNTER_ZERO`, value `0` against `after.count: 1`). Every property
   of the before arm and of the comparison's type strictness is unpinned. The
   first defect class this arm was added to fix (constant counter) is
   reintroducible with a two-line edit that keeps C1 green.
2. The gate at `b444ca8` is not itself defective: the stock column of every
   fixture shows both arms and strict `!==` behaviour. The gap is in the
   enforcement evidence that C1's "behaviourally enforced" wording rests on, and
   it is a regression hazard for future edits, not a misstatement of the
   current count.
3. Detail text is not asserted anywhere (M3). If `observed=missing` ever becomes
   contractual, no layer would hold it.
4. Out of scope, noted once: `corpus/evidence/round-16/measurement-binding.json`
   is untracked at HEAD (`git status --porcelain` → `??`), so the binding
   manifest itself is not revision-bound. It does not affect this probe — the C1
   counter never reads it — but it is relevant to whoever owns the manifest.
