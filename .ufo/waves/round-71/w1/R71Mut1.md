COVERAGE-GAPS

# R71Mut1 — semantic mutation test of `scripts/check-synthpinch-r71.mjs` (round 71, w1)

47 single-line semantic mutants of the C1 counter (not check-disable / not forced-true). 18 killed by `scripts/negatives-synthpinch-r71.mjs`, **29 survived**. Of the survivors, 24 are genuine acceptance gaps (a forged receipt is accepted by the mutant and refused by the pristine counter) and each gets a proposed negative case that was **executed** and kills it; 3 are equivalent mutants (evidence in §5); 2 are stricter-only mutants that no finding-case can kill because the battery has no must-accept case class (§6).

## 1. Scope, bounds, setup

- Target bytes: `scripts/check-synthpinch-r71.mjs`, sha256 `310fac05b3cb50ee97eff92197467d0f650fb9c17f898c3267c8054b7eef176c` (copied to scratch, byte-identical).
- Battery bytes: `scripts/negatives-synthpinch-r71.mjs`, sha256 `830bbb0d33f8286dca94e0dc8003e5a8184a3ca59cf949200be0d0579fe3d14a` (copied beside each mutant; the battery resolves the counter by its own directory, so each mutant ran with its own copy).
- Scored receipt: `corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json`, sha256 `19e3c5b6377eaba100b856a9b6f491da8aa354f6a24adec340ba662f32171ab6`; driver pin `5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af` passed on every run.
- Isolated scratch: `/fast/scratch/hyaku/tabi-r71/R71Mut1/` (deleted before yield; receipts copied to this directory first). No production, lane-root, fleet or sibling file was written; no git/jj mutation; no Chromium run; no tool install or upgrade.

Baseline (the same battery invocation the scored steps use, pristine counter, 3 laundered receipts):

```
negatives 107/107 isolated=98 positiveOk=true coverageGap=0 failed=none   (exit 0, 6.4 s)
```

Per-mutant command (each mutant ran exactly once; a red run was never re-run):

```
node m/<id>/negatives-synthpinch-r71.mjs \
  --real <lane>/corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json \
  --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af \
  --work <scratch>/w/<id> \
  --laundered <c1>/degenerate-dispatch-wheel.receipt.json \
  --laundered <c1>/degenerate-set-scale.receipt.json \
  --laundered <c1>/degenerate-skip-touch.receipt.json --json
# driver: xargs -a ids.txt -P 8 -n 1 ./runner.sh   (47/47 runs captured)
```

`Killed` is literally **battery exit 1** as the tasking defines it. Note the mechanism: a battery case is a probe that *expects a finding* on a forged receipt; a mutant that stops firing on that forgery makes the case fail and the battery exit 1. A mutant survives only when all 107 cases (plus the positive receipt) still behave as declared.

## 2. Mutant table (all 47)

Single-line constraint is machine-checked: each replacement substring occurs exactly once in the pristine file and `diff` shows exactly one changed line (`mutant.diff` per mutant, concatenated in `mutants-diffs.txt`). Full sha256 before/after for every mutant is in `mutant-results.json`.

| id | line | change (one line) | verdict | detail |
|---|---|---|---|---|
| m01 | 35 | widen in-leg wheel-span band 150..450 -> 150..2000 ms | **killed** | killed — case `in-timing` |
| m02 | 39 | widen default-leg wheel-span band 60..300 -> 60..2000 ms | **killed** | killed — case `default-timing` |
| m03 | 44 | drop zero-leg lower span bound 3000 -> 0 ms (accept instant endless-zero) | **killed** | killed — case `zero-timing` |
| m04 | 96 | drop run-window floor 8000 ms -> 1 ms | **killed** | killed — case `run-window-short` |
| m05 | 96 | raise run-window ceiling 600 s -> 6000 s | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m06 | 98 | accept any permutation of the frozen leg order (sorted compare) | **killed** | killed — case `leg-order` |
| m07 | 104 | pinch-call-count exact 10 -> at-least 10 (extra producer calls admitted) | **SURVIVED** | survived — equivalent (see §5) |
| m08 | 105 | compare only the last pinch call's params | **killed** | killed — case `pinch-call-params` |
| m09 | 106 | drop the Input.emulateTouch look-alike alternative | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m10 | 107 | drop the Emulation.setEmitTouchEventsForMouse look-alike alternative | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m11 | 107 | drop the Emulation.setScrollbarsHidden look-alike alternative | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m12 | 108 | drop the __events assignment look-alike alternative | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m13 | 108 | drop the visualViewport assignment look-alike alternative | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m14 | 108 | drop Runtime.callFunctionOn from the script look-alike alternatives | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m15 | 119 | flip the wheel sign labels (in<->out) | **killed** | killed — positive receipt rejected by mutant |
| m16 | 134 | drop deltaMode === 0 from the wheels predicate | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m17 | 134 | replace per-leg wheel min with > 0 | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m18 | 75 | widen the default scale tolerance 0.01 -> 0.1 | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m19 | 113 | span() returns 0 (not null) for a single-element list | **SURVIVED** | survived — equivalent (see §5) |
| m20 | 129 | accept any non-mouse pointerType on touch pointermoves (pen passes) | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m21 | 141 | drop skipped===false from the error-leg branch | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m22 | 145 | drop the page/CDP agreement on scaleBefore | **killed** | killed — case `scale-agreement-cdp` |
| m23 | 146 | check the scale chain for only the first link | **killed** | killed — case `scale-agreement-chain` |
| m24 | 149 | widen the wheel-anchor tolerance 1 px -> 2 px | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m25 | 150 | drop exact clientY on clamp wheels | **killed** | killed — case `wheel-anchor-clamp-exact` |
| m26 | 154 | drop the zero-leg deltaY===0 conjunct from wheel-delta-law | **SURVIVED** | survived — equivalent (see §5) |
| m27 | 154 | change ln(2) to ln(3) in the clamp delta law | **killed** | killed — positive receipt rejected by mutant |
| m28 | 154 | widen the clamp delta-law tolerance 0.5 -> 1.0 | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m29 | 157 | touch geometry: require >=1 touch point instead of exactly 2 | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m30 | 161 | drop the one-vertical-line law (xs.size === 1 -> >= 1) | **killed** | killed — case `touch-geometry-x` |
| m31 | 161 | tighten the touch spread ratio >=2 -> >=3 | **killed** | killed — positive receipt rejected by mutant |
| m32 | 161 | drop monotone growth from touch geometry (keep final ratio) | **killed** | killed — case `touch-geometry-shrink` |
| m33 | 163 | only apply touch geometry to the touch leg, not slow | **killed** | killed — case `touch-geometry-shrink` |
| m34 | 165 | drop the slow/touch lower ratio bound (keep <=5) | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m35 | 165 | raise the slow/touch upper ratio bound 5 -> 50 | **killed** | killed — case `slow-ratio` |
| m36 | 171 | producer hypothesis polarity: any non-REFUTED string accepted | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m37 | 171 | producer predicate side: !== false instead of === true (null accepted) | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m38 | 134 | relax per-leg wheel minimum by 2 | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m39 | 44 | relax zero-leg wheel minimum 20 -> 1 | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m40 | 39 | relax default-leg wheel minimum 3 -> 1 | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m41 | 145 | apply the page/CDP agreement law to the first five legs only | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m42 | 103 | pinch producer filter exact match -> startsWith (suffixed method accepted) | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m43 | 136 | leg-scale: page OR cdp instead of page AND cdp | **SURVIVED** | survived — acceptance gap (proposal §4) |
| m44 | 160 | touch span growth strict > instead of >= | **SURVIVED** | survived — stricter-only (see §6) |
| m45 | 161 | touch spread ratio > 2 instead of >= 2 | **SURVIVED** | survived — stricter-only (see §6) |
| m46 | 124 | producer legShape allTrusted every -> some (derived field) | **killed** | killed — positive receipt rejected by mutant |
| m47 | 125 | producer legShape wheelCtrlAll every -> some (derived field) | **killed** | killed — positive receipt rejected by mutant |

Kill breakdown: 13 killed by a named battery case, 5 killed only by the positive receipt (mutant rejects the pristine receipt: m15 sign flip, m27 ln(3), m31 ratio>=3, m46/m47 vacuous-vs-nonvacuous `every`→`some` on empty legs). No mutant produced exit 2 or an inconclusive run; all 47 exited 0 or 1.

## 3. Why these mutants are the interesting class

The pre-freeze kill-power control forces each check true (a mutant that cannot refuse anything). These mutants instead keep every check id present and evaluable, and move the *law*: bands, tolerances, quantifiers, sign tests, subset domains, polarity and regex alternatives. They therefore test whether the battery's negative cases pin those laws, not whether a check is wired up.

## 4. Every survivor's proposed case (24 executed cases, 3 equivalents, 2 must-accept)

Each proposal was added to a scratch copy of the battery (`proposed-cases-negatives-synthpinch-r71.mjs`, sha256 `73cf1c89f50637882249f83f16d0083eaec1b58309e1ed966f17ef26a52f152e`, 130 cases = 107 + 23) and run:

```
# pristine counter + augmented battery (must stay green):
node vp/negatives-augmented.mjs --real <receipt> --expect-driver-sha256 5318780... \
  --work <scratch>/w/verify-pristine --laundered <3 receipts> --json
# -> exit 0  positiveOk=true cases=130 isolated=119 coverageGap=0 failed=none
# mutant counter + same augmented battery (must go red on the target case):
node mv/<id>/negatives-augmented.mjs ... --json
```

The table below lists all 29 survivors: the 24 executed cases, the 3 equivalents (§5, no distinguishing case exists) and the 2 must-accept rows (§6).

Result: **24/24 proposals kill their target mutant** (each mutant run exit 1 with the target case in `failed`). m17 (`wheels.length > 0`) and m38 (minimum −2) are killed by the same `in-wheels-count-3` case; running m17 additionally kills the `zero-` and `default-wheels-count` cases because its relaxation is global to all band legs.

| id | line | proposed negative case | expected id | executed evidence |
|---|---|---|---|---|
| m05 | 96 | `run-window-long` → `run-window` | `run-window` | augmented battery: mutant exit 1, `run-window-long` failed (1) |
| m07 | 104 | none — equivalent | — | equivalent: pinch-call-params equality implies the 10-call count; add-one probe rejected by both (pristine [pinch-call-… |
| m09 | 106 | `lookalike-emulate-touch-mouse` → `no-lookalike-producer` | `no-lookalike-producer` | augmented battery: mutant exit 1, `lookalike-emulate-touch-mouse` failed (1) |
| m10 | 107 | `lookalike-emit-touch-for-mouse` → `no-lookalike-producer` | `no-lookalike-producer` | augmented battery: mutant exit 1, `lookalike-emit-touch-for-mouse` failed (1) |
| m11 | 107 | `lookalike-scrollbars-hidden` → `no-lookalike-producer` | `no-lookalike-producer` | augmented battery: mutant exit 1, `lookalike-scrollbars-hidden` failed (1) |
| m12 | 108 | `lookalike-events-assign` → `no-lookalike-producer` | `no-lookalike-producer` | augmented battery: mutant exit 1, `lookalike-events-assign` failed (1) |
| m13 | 108 | `lookalike-visualviewport-assign` → `no-lookalike-producer` | `no-lookalike-producer` | augmented battery: mutant exit 1, `lookalike-visualviewport-assign` failed (1) |
| m14 | 108 | `lookalike-call-function-on` → `no-lookalike-producer` | `no-lookalike-producer` | augmented battery: mutant exit 1, `lookalike-call-function-on` failed (1) |
| m16 | 134 | `in-wheel-delta-mode` → `leg-in-wheels` | `leg-in-wheels` | augmented battery: mutant exit 1, `in-wheel-delta-mode` failed (1) |
| m17 | 134 | `in-wheels-count-3` → `leg-in-wheels` | `leg-in-wheels` | augmented battery: mutant exit 1, `in-wheels-count-3` failed (1) |
| m18 | 75 | `zero-scale-off-tolerance` → `leg-zero-scale` | `leg-zero-scale` | augmented battery: mutant exit 1, `zero-scale-off-tolerance` failed (1) |
| m19 | 113 | none — equivalent | — | equivalent: null and 0 are both rejected by every consumer; one-wheel probe yields identical finding sets [leg-in-wheel… |
| m20 | 129 | `touch-pointer-type-pen` → `leg-touch-seq` | `leg-touch-seq` | augmented battery: mutant exit 1, `touch-pointer-type-pen` failed (1) |
| m21 | 141 | `pen-leg-skipped` → `leg-pen-error` | `leg-pen-error` | augmented battery: mutant exit 1, `pen-leg-skipped` failed (1) |
| m24 | 149 | `in-wheel-anchor-2px` → `wheel-anchor` | `wheel-anchor` | augmented battery: mutant exit 1, `in-wheel-anchor-2px` failed (1) |
| m26 | 154 | none — equivalent | — | equivalent: the dropped conjunct has no unique rejection power; a zero-leg wheel with deltaY=5 is still rejected (prist… |
| m28 | 154 | `clamp-delta-off-0.8` → `wheel-delta-law` | `wheel-delta-law` | augmented battery: mutant exit 1, `clamp-delta-off-0.8` failed (1) |
| m29 | 157 | `touch-single-point-move` → `touch-geometry` | `touch-geometry` | augmented battery: mutant exit 1, `touch-single-point-move` failed (1) |
| m34 | 165 | `slow-ratio-low-2x` → `slow-ratio` | `slow-ratio` | augmented battery: mutant exit 1, `slow-ratio-low-2x` failed (1) |
| m36 | 171 | `producer-hypothesis-unknown` → `producer-verdict` | `producer-verdict` | augmented battery: mutant exit 1, `producer-hypothesis-unknown` failed (1) |
| m37 | 171 | `producer-predicate-null` → `producer-verdict` | `producer-verdict` | augmented battery: mutant exit 1, `producer-predicate-null` failed (1) |
| m38 | 134 | `in-wheels-count-3` → `leg-in-wheels` | `leg-in-wheels` | augmented battery: mutant exit 1, `in-wheels-count-3` failed (1) |
| m39 | 44 | `zero-wheels-count-3` → `leg-zero-wheels` | `leg-zero-wheels` | augmented battery: mutant exit 1, `zero-wheels-count-3` failed (1) |
| m40 | 39 | `default-wheels-count-2` → `leg-default-wheels` | `leg-default-wheels` | augmented battery: mutant exit 1, `default-wheels-count-2` failed (1) |
| m41 | 145 | `scale-agreement-late-leg` → `scale-agreement` | `scale-agreement` | augmented battery: mutant exit 1, `scale-agreement-late-leg` failed (1) |
| m42 | 103 | `pinch-method-suffix` → `pinch-call-count` alsoAllowed pinch-call-params | `pinch-call-count` | augmented battery: mutant exit 1, `pinch-method-suffix` failed (1) |
| m43 | 136 | `leg-zero-scale-page-only` → `leg-zero-scale` alsoAllowed scale-agreement | `leg-zero-scale` | augmented battery: mutant exit 1, `leg-zero-scale-page-only` failed (1) |
| m44 | 160 | must-accept receipt `proposed-equal-spans-receipt.json` (battery has no must-accept case class; delivered copy verified clean on the pristine counter, exit 0) | exit 0, no findings | pristine exit 0 / mutant exit 1 `['touch-geometry']` |
| m45 | 161 | must-accept receipt `proposed-equal-spans-receipt.json` (battery has no must-accept case class; delivered copy verified clean on the pristine counter, exit 0) | exit 0, no findings | pristine exit 0 / mutant exit 1 `['touch-geometry']` |

Two proposals declare a co-firing id, matching the battery's existing `alsoAllowed` discipline: `pinch-method-suffix` declares `pinch-call-params` (renaming one pinch call shortens the frozen params list), and `leg-zero-scale-page-only` declares `scale-agreement` (any page≠CDP scale reading trips that law by construction). Isolation of all other proposals holds: 119/130 augmented cases are single-finding (21 of 23 new cases isolated; the other 2 are the declared pairs).

## 5. Equivalent mutants (3, evidence-backed)

- **m07** `scripts/check-synthpinch-r71.mjs:104` — `pinches.length === 10` → `>= 10`. The params check at line 105 compares the full params array, so params equality already implies length 10. Probe: append a duplicate pinch call → pristine `['pinch-call-count','pinch-call-params']`, m07 `['pinch-call-params']` (both reject); remove one call → both `['pinch-call-count','pinch-call-params']` (both reject). No receipt is accepted by m07 and refused by pristine, so the count check is redundant defence-in-depth, not unique rejection power.
- **m19** `scripts/check-synthpinch-r71.mjs:113` — `list.length >= 2` → `>= 1`, so a one-element list yields span `0` instead of `null`. Probe: keep one wheel in the `in` leg. Pristine and m19 both yield exactly `['leg-in-wheels','leg-in-timing']` (after each counter's own legShape laundering). Every consumer of `wheelSpanMs`/`touchSpanMs` rejects both `null` and `0` (`!== null` guard plus a positive band, or a `> 0` test).
- **m26** `scripts/check-synthpinch-r71.mjs:154` — drop the zero-leg `deltaY === 0` conjunct. Probe: set one zero-leg wheel `deltaY = 5`. Pristine rejects with `['leg-zero-wheels','wheel-delta-law']`; m26 still rejects with `['leg-zero-wheels']`, because `wheelSign` becomes non-`zero` and `leg-zero-wheels` requires sign `zero`. The conjunct has no unique rejection power.

## 6. Stricter-only survivors (2) — the battery has no must-accept case class

m44 (`:160` `>=` → `>`) and m45 (`:161` ratio `>= 2` → `> 2`) are *stricter* than the frozen law. No packet of forged evidence distinguishes them, because every battery case expects a finding; the only must-accept probe is the single positive receipt, whose spans are strictly increasing and whose ratio is 2.366.

Direct probe with an honest-shaped receipt (`proposed-equal-spans-receipt.json`: touch-leg spans 100,100,…,100,200 px → non-decreasing, final/first exactly 2.0; legShape derived from the pristine counter):

```
pristine  -> exit 0  ids=[]                     (receipt is clean)
m44       -> exit 1  ids=['touch-geometry']     (equal consecutive span rejected)
m45       -> exit 1  ids=['touch-geometry']     (ratio exactly 2.0 rejected)
```

Both mutants also reject the delivered `proposed-equal-spans-receipt.json` (exit 1, `touch-geometry`) while the pristine counter accepts it (exit 0, verdict `clean`). So both mutants false-reject honest evidence and the battery cannot see it. Proposed fix (battery, not counter): add a must-accept case class — receipts the counter MUST exit 0 on — and register this receipt as one. Until then, `>=`→`>` tightening mutations of every growth/ratio law are undetectable.

## 7. Findings with file:line (pristine counter)

Line numbers are identical in the scratch copy (sha256 matches). Each finding names the surviving mutant and the executed proposal that pins it.

1. `scripts/check-synthpinch-r71.mjs:75` — default `near` tolerance 0.01 is only probed at ±0.5 offsets, so 0.1 survives (m18). Pinned by `zero-scale-off-tolerance` (+0.05 on the last leg's page and CDP, both sides moved together so only `leg-zero-scale` fires).
2. `:96` — the run-window ceiling `< 600000` is never probed; raising it to 6000 s survives (m05). Pinned by `run-window-long` (+700 s).
3. `:103` — the pinch filter is exact; `startsWith` survives (m42) because no battery case uses a suffixed method. Pinned by `pinch-method-suffix` (rename pinch call #2 to `Input.synthesizePinchGestureX`, params untouched; declares `pinch-call-params`).
4. `:104` — `pinch-call-count` is redundant with `:105` (§5, m07).
5. `:106`–`:108` — six look-alike alternatives are unprobed: `emulateTouch` (:106), `setEmitTouchEventsForMouse` and `setScrollbarsHidden` (:107), `__events\s*=`, `visualViewport\s*=`, `Runtime.callFunctionOn` (:108); m09–m14 all survive. Pinned by `lookalike-emulate-touch-mouse`, `lookalike-emit-touch-for-mouse`, `lookalike-scrollbars-hidden`, `lookalike-events-assign`, `lookalike-visualviewport-assign`, `lookalike-call-function-on` (each a single `no-lookalike-producer` finding).
6. `:113` — `span()` null-vs-0 for one-element lists is unobservable (§5, m19).
7. `:124`–`:125` — `every`→`some` on the producer-summary derivation is caught only by the positive receipt's empty legs (m46/m47), never by a case, because the battery launders `legShape` from each counter's own derivation. No proposal is offered: a case that forges `legShape` to match a weakened derivation cannot be built from events without tripping `leg-<name>-trusted`/`leg-<name>-wheels`; the structural fix is an in-battery derivation independent of the counter, or a pinned expected `legShape` fixture.
8. `:129` — touch pointermoves accept any non-mouse `pointerType` (m20, pen passes). Pinned by `touch-pointer-type-pen`.
9. `:134` — three gaps: `deltaMode === 0` is unprobed (m16, `in-wheel-delta-mode`); the per-leg band minimum can be weakened to `> 0` or `want[0]-2` (m17, m38, `in-wheels-count-3`); and exact counts are attacked only by insertion, so lowering zero 20→1 (m39) and default 3→1 (m40) survive, pinned by `zero-wheels-count-3` and `default-wheels-count-2` (span and sign kept legal in both).
10. `:136` — `leg-scale` page AND CDP → OR survives (m43) because every battery scale case moves page and CDP together by 0.5. Pinned by `leg-zero-scale-page-only` (page only; declares `scale-agreement`).
11. `:141` — `skipped === false` on the error-leg branch is unprobed (m21). Pinned by `pen-leg-skipped`.
12. `:145` — the page/CDP agreement law applied to a prefix of the legs survives (m41 uses `slice(0,5)`); the battery only probes leg[3] and the chain at leg[6]. Pinned by `scale-agreement-late-leg` (leg[9] `outside`, CDP only, chain untouched).
13. `:149` — the 1 px anchor tolerance is probed with a 5 px offset, so 2 px survives (m24). Pinned by `in-wheel-anchor-2px`.
14. `:154` — the clamp-delta tolerance is probed at 1.66, so 1.0 survives (m28). Pinned by `clamp-delta-off-0.8` (last clamp wheel +0.8, sign stays `out`).
15. `:157` — `touches.length === 2` → `>= 1` survives (m29) and turns a clean rejection into a `TypeError` (`touches[1][1]` on a 1-point move). Pinned by `touch-single-point-move` (verified on the mutant: exit 1, empty stdout, `TypeError: Cannot read properties of undefined (reading '1')` at the `spans` line). The battery counts a non-JSON exit as a failed case, so the crash kills the mutant, but the check degenerates from 'reject' to 'throw' — worth rejecting in review.
16. `:160`–`:161` — `>=`→`>` tightening (m44, m45) is invisible (§6).
17. `:164`–`:165` — the lower slow/touch ratio bound is unprobed; the battery only increases the ratio (m34 drops `>= 3` and survives). Pinned by `slow-ratio-low-2x` (slow span set to exactly 2× the touch span; upper bound still satisfied).
18. `:171` — producer polarity is probed only with `false`/`REFUTED`: `!== 'REFUTED'` (m36) and `!== false` (m37) survive. Pinned by `producer-hypothesis-unknown` and `producer-predicate-null`.

## 8. Reproduction (scratch names)

```bash
# scratch (all paths absolute; deleted after the run)
S=/fast/scratch/hyaku/tabi-r71/R71Mut1
cp -a <lane>/scripts/. $S/s/
python3 $S/gen.py            # regenerates 47 mutant dirs m/<id>/ (counter + battery copy)
cd $S && xargs -a ids.txt -P 8 -n 1 ./runner.sh   # one battery run per mutant; out/<id>.{json,exit}
# proposals
python3 build-verify.py      # augmented battery + mv/<id>/ dirs
node vp/negatives-augmented.mjs ...   # pristine: exit 0
xargs -a vids.txt -P 8 -n 1 ./runner-verify.sh     # 24 mutants: exit 1, target case failed
# equivalence / must-accept probes
python3 eqprobe.py
```

## 9. Artifacts in this directory

- `report.md` / `R71Mut1.md` — this report.
- `mutant-results.json` — 47 mutants: line, change, sha256 before/after, battery exit, positiveOk, failed cases, kill trigger, equivalence note, proposed case, augmented-battery evidence; plus `_meta` hashes and the coverage counts.
- `mutants-diffs.txt` — all 47 one-line diffs against the pristine counter.
- `proposed-cases-negatives-synthpinch-r71.mjs` — battery copy with the 23 proposed cases (executed; pristine green 130/130, each target mutant red).
- `proposed-equal-spans-receipt.json` — must-accept receipt that separates m44/m45 from the pristine counter.
- `proposed-cases-runs.json` — per-target augmented-battery exit code and failed-case list.

## 10. Not run / limits

- No Chromium execution, no live driver run, no verifier (C2) work: this seat is a byte-level mutation probe on the counter and its battery.
- Equivalence judgments are scoped to rejection behaviour under the current check set, supported by the executed probes quoted above; they are not proofs over all JSON.
- The proposed cases live only in this wave directory; integration into `scripts/negatives-synthpinch-r71.mjs` belongs to L1 (sole integration owner) and must not change any frozen predicate, counter, pin or kill rule.

Report: `.ufo/waves/round-71/w1/R71Mut1.md`
