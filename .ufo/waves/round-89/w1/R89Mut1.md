# R89Mut1 — independent mutation sweep (tabi round 89, w1)

Seat: `R89Mut1` (mutation tester, leaf). Target: `scripts/check-showpicker-round89.mjs` and
`scripts/check-record-drift-r89.mjs` of `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Sweep window: 2026-11-08 09:41–10:07 -03 (12:41–13:07Z). Scratch:
`/fast/scratch/hyaku/tabi-r89/R89Mut1/` (removed after this report). No lane file was written by
this seat; no tool installs or upgrades were needed (host `node v24.21.0`; no package manager ran).

## 1. Byte sets swept (the lane re-froze mid-sweep)

The freeze pins moved while this seat was working. Both states are measured and named here.

| instrument | original freeze (D `7bde5e6c2f2d`) | re-freeze (current, `freeze.txt` at 09:58/10:03) | on disk (last read) |
|---|---|---|---|
| `scripts/check-showpicker-round89.mjs` | `33d4b9277607334c…eb1f07` | `53593b5c93e82a52e9…4d3f9f4` | `53593b5c…` |
| `scripts/negatives-showpicker-round89.mjs` | `7951d40e6acfc03e…266fe16` | `0668a439518de273…826ea5b` | `0668a439…` |
| `scripts/kill-power-round89.mjs` | `319534b9aadf3fb1…e3faa` | `e46b132f3892cd3e…81dc363` | `e46b132f…` at 10:04; **`576be85eba81de12…f32f0f4` at 10:07:40** (post-sweep edit, not in `freeze.txt`) |
| `scripts/selftest-r89-gates.mjs` | `35235effd6f42e53…7db80a` | `35235eff…` (pin unchanged) | `2ad05c4bb4d9bbc6…8afc56c` — **pin ≠ bytes** |
| `scripts/check-record-drift-r89.mjs` | `c54d5edf724ceb8c…37308c` | `c54d5edf…` | `c54d5edf…` (unchanged) |
| driver | `76b69b4f…98bd2d0` | same | same |

Scored receipt: `corpus/evidence/round89/chromium-showpicker/receipt.json`,
sha256 `78eb6ceac46ae68b3d49ac748e18746af05b94232d05f1521fb81ea00704b938`, nonce
`tabi-r89-l1-7bde5e6c2f2d`, fixture sha256 `69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed`,
41 legs, `finishedAt 2026-11-08T12:43:31.853Z`, `failures: []`.

The sweep was scored twice: **Det B** = the re-freeze pair (counter `53593b5c` + battery
`0668a439`, green baseline); **Det A** = the original pin pair (counter `33d4b927` + battery
`7951d40e`, differential because that battery is red at baseline). Every mutant is a
single-string semantic replacement applied to a copy; exactly-once occurrence was enforced for
each target (26/26 counter mutants apply to `53593b5c`; 18/18 drift mutants apply to `c54d5edf`).
One counter clause (`limit.replayConsistency`) exists only in the re-freeze bytes, so it is
unapplied on Det A (the original pin). Full before/after hashes for every mutant are in
Appendix A; target bytes were never touched.

## 2. Detector baselines (measured, not assumed)

| detector | baseline | result |
|---|---|---|
| frozen counter `33d4b927` on the scored receipt | clean | `verdict clean`, **checkCount 108**, 0 findings (reproduces C1 leg (a) at the original pin) |
| re-freeze counter `53593b5c` on the scored receipt | clean | `verdict clean`, **checkCount 107**, 0 findings |
| frozen battery `7951d40e` on the scored receipt | **RED** | 222 cases, **4 failed**, coverage `declared 108 / covered 103`, uncovered `leg-sp89-accept-domread-{text,png,multimime,whitespace}` + `replay-limit-consistency` |
| re-freeze battery `0668a439` on the scored receipt | green | **223 cases, 0 failed, coverage 107/107/0** |
| frozen kill-power `319534b9` vs frozen counter | 3 unapplied | `leg-records-keys-open` (occ 0), `accept-grammar-bytes-dropped` (occ 2), `accept-grammar-state-dropped` (occ 2) — each counted `crashed` by the instrument's tally |
| re-freeze kill-power `e46b132f` vs current counter | 1 unapplied, 1 broken | `accept-grammar-state-dropped` (occ 0, confirmed run: `crashed:1, unapplied:["accept-grammar-state-dropped"]`); `replay-limit-printed-drift` is a runtime `TypeError` (see §6) |
| drift gate live lane (10:03) | red | exit 1, `mismatches 2`: `selftest-wording`, `quality161-sweep` |
| drift gate green control | green | exit 0, claims 4, mismatches 0 |
| drift gate isolated red fixture (all seven swept sections present) | red | exit 1, mismatches 4, all of `scorecard-tallies`, `selftest-wording`, `gate-selftest`, `quality161-sweep`; `bad=["round-44-no-9","round-44-has-10"]`, `stray=[2]` |
| drift gate C2 before control (base `5a901163` + the five r89 instrument files) | red | exit 1, `mismatches 2` (`selftest-wording`, `quality161-sweep`) |
| drift gate `--selftest` | green | exit 0, `ok:true` |

Det A is therefore **inconclusive at baseline** (4 pre-existing case failures + 5 uncovered ids);
its verdicts are reported differentially ("no new failing case / no new uncovered id"), never as
"the battery is green". Det B is the absolute oracle.

## 3. Counter mutants — results (26)

Target bytes `53593b5c`. Det B = re-freeze pair (absolute). Det A = original pin pair
(differential; "survived-baseline-red" = no new failure over the red baseline). Every mutant
also kept the honest scored run `clean / 107` and every `--selftest` mode green — no mutant
produced a false positive on honest bytes.

| mutant | Det B (current pin) | Det A (original pin, differential) |
|---|---|---|
| `domread-raw-binding-dropped` | killed (`accept-domread-law-raw`) | survived-baseline-red |
| `domread-tokens-text-leg-only` | **survived** | survived-baseline-red |
| `domread-desc-from-toplevel` | killed (`accept-domread-law`, grammar cases) | killed |
| `domread-token-length-only` | killed (`accept-domread-law`) | killed |
| `domread-answer-state-dropped` | killed (`accept-domread-law-state`) | killed |
| `domread-read-hex-dropped` | killed (`accept-domread-law-bytes`) | killed |
| `domread-answer-files-dropped` | **survived** | survived-baseline-red |
| `read-hex-multiple-mode-dropped` | **survived** | survived-baseline-red |
| `read-hex-webkitdir-dropped` | **survived** | survived-baseline-red |
| `per-leg-act-dropped` | **survived** | survived-baseline-red |
| `nonce-expected-hardcoded` | **survived** | survived-baseline-red |
| `driver-pin-hardcoded` | **survived** | survived-baseline-red |
| `fixture-sha-hardcoded` | **survived** | survived-baseline-red |
| `limit-sentence-absneed-dropped` | **survived** | survived-baseline-red |
| `limit-replayconsistency-true` | **survived** | unapplied (clause absent at the original pin) |
| `empty-prior-set-guard-dropped` | **survived** | survived-baseline-red |
| `prior-parse-error-skipped` | **survived** | survived-baseline-red |
| `ports-distinctness-dropped` | **survived** | survived-baseline-red |
| `host-node-floor` | **survived** | survived-baseline-red |
| `nonce-shape-max-dropped` | **survived** | survived-baseline-red |
| `chooser-wait-lower-bound-dropped` | **survived** | survived-baseline-red |
| `plan-frozen-intercept-dropped` | **survived** | survived-baseline-red |
| `cdp-open-frame-binding-dropped` | **survived** | survived-baseline-red |
| `event-files-type-any` | **survived** (masked, see §5) | survived-baseline-red |
| `counter-selftest-ids-dropped` | **survived** | survived-baseline-red |
| `counter-selftest-scratch-kept` | **survived** | survived-baseline-red |

Tally: Det B 5 killed / 21 survived / 0 crashed / 0 unapplied; Det A 4 killed / 21
survived-baseline-red / 1 unapplied.

## 4. Counter survivors — the exact clause left alive, and the acceptance witness

"Real gap" = a receipt the stock counter refuses and the mutant accepts (same invocation, same
bytes otherwise). "Output-only" = the mutant changes an output field no detector reads.

| mutant | clause left alive | witness (stock → mutant) | class |
|---|---|---|---|
| `domread-tokens-text-leg-only` | `same(desc.acceptTokens, toks)` now applies only when `name === 'sp89-accept-domread-text'`; the png / multimime / whitespace token lists are unbound | `domRead[am].acceptTokens := ["image/png"]` (honest `["image/png",".txt"]`): stock exit 1 `accept-domread-law`; mutant exit 0 | real gap |
| `domread-answer-files-dropped` | `same(leg.answer.files, [f.name])` → `Array.isArray(leg.answer.files)` | domread-text `answer.files := ["tabi-r89-b.png"]`: stock exit 1 `accept-domread-law`; mutant exit 0 | real gap |
| `read-hex-multiple-mode-dropped` | `mm` read-event `ret === 'hex:' + ANSWER.hex` → `typeof … === 'string'` | multiple-mode read `ret := 'hex:00'`: stock exit 1 `multiple-mode-law`; mutant exit 0 | real gap |
| `read-hex-webkitdir-dropped` | the two `wa` read-event `ret` values (`same(… .map(e.ret), DIR.files.map('hex:'+f.hex))`) dropped | webkitdir read rets `:= 'hex:00'`: stock exit 1 `webkitdirectory-answer-law`; mutant exit 0 | real gap |
| `per-leg-act-dropped` | per-leg frozen-shape list `['seq','trusted','act','xy','files','opened','state']` with `'act'` removed; no other check binds a page event's `act` | accept-answer click `act := false`: stock exit 1 `leg-sp84-accept-answer`; mutant exit 0 | real gap |
| `nonce-expected-hardcoded` | `r.nonce === expectNonce` → `r.nonce === 'tabi-r89-l1-7bde5e6c2f2d'`; the `--expect-nonce` argument is inert | run with `--expect-nonce tabi-r89-wrong-0000`: stock exit 1 `nonce-expected`; mutant exit 0 | real gap |
| `driver-pin-hardcoded` | `r.driverSha256 === pin` → literal `76b69b4f…`; the pin argument is inert | `--expect-driver-sha256 0×64`: stock exit 1 `driver-pin`; mutant exit 0 | real gap |
| `fixture-sha-hardcoded` | `r.fixture.sha256 === expectFixture` → literal `69acad57…`; the pin argument is inert | `--expect-fixture-sha256 0×64`: stock exit 1 `fixture-hash`; mutant exit 0 | real gap |
| `limit-sentence-absneed-dropped` | the limit sentence no longer prints `sims.map(absNeed).join(',')` | honest run: stock prints `perPrior (105,105)`, mutant prints `perPrior ()`; both exit 0 clean — no detector reads the sentence | output-only |
| `limit-replayconsistency-true` | `limit.replayConsistency: sims.every(p => p.refused === (p.absMatched >= p.absNeed) \|\| p.absNeed === 0)` → `true`; no check and no battery case reads the field (it is a tautology of the `sims` construction) | honest run identical (`true` both sides), exit 0 | output-only / tautology |
| `empty-prior-set-guard-dropped` | `if (priorPaths.length === 0) fatal(…, 2)` removed | empty prior-set + `--tree-exempt-sha256` for the receipt and both probes: stock exit 2 `prior-unreadable`; mutant exit 0 **clean** (replay protection vacuous) | real gap |
| `prior-parse-error-skipped` | unreadable prior: `fatal(…, 2)` → `continue` | prior-set = prior2 + a malformed JSON file: stock exit 2 `prior-unreadable`; mutant exit 0 clean | real gap |
| `ports-distinctness-dropped` | `new Set([http,cdp,child]).size === 3` → `>= 1` | `ports.child := ports.http` with both fixture origins rewritten consistently: stock exit 1 `ports-declared`; mutant exit 0 | real gap |
| `host-node-floor` | `Number(major) === 24` → `>= 24` | `host.node := 'v26.0.0'`: stock exit 1 `host-node`; mutant exit 0 | real gap |
| `nonce-shape-max-dropped` | `/^tabi-r89-[a-z0-9-]{4,48}$/` → `{4,}` | 60-char nonce (all occurrences rewritten): stock exit 1 `nonce-shape`; mutant exit 0 | real gap |
| `chooser-wait-lower-bound-dropped` | `l.chooserWaitMs >= 0` removed (upper bound kept) | `chooserWaitMs := -1`: stock exit 1 `leg-records`; mutant exit 0 | real gap |
| `plan-frozen-intercept-dropped` | the leg's `intercept` field is no longer compared in `plan-frozen` | `leg.intercept := {enabled:false}` (send log untouched): stock exit 1 `plan-frozen`; mutant exit 0 | real gap |
| `cdp-open-frame-binding-dropped` | `o.params.frameId !== wantFrame.frameId` dropped from `cdp-event-log-closed` | chooser `frameId := 'F'×32`: stock exit 1 `cdp-event-log-closed`; mutant exit 0 | real gap |
| `event-files-type-any` | `(e.files === null \|\| Array.isArray(e.files))` → `true` in `event-types` | input `files := 'not-an-array'`: stock exit 1 `[event-types, leg-sp84-accept-answer]`; mutant exit 1 `[leg-sp84-accept-answer]` — the per-leg shape refuses the same receipt | **masked** (redundant clause, not a hole) |
| `counter-selftest-ids-dropped` | `--selftest`: `r.status === 1 && ids.includes('schema')` → `r.status === 1` | composed witness (same edit + fixture schema corrected): stock selftest exit 1 `ok:false`; mutant selftest exit 0 `ok:true` on a fixture red for other ids | selftest-mode gap |
| `counter-selftest-scratch-kept` | `--selftest` no longer removes its scratch dir | run: `tabi-r89-counter-selftest-<pid>` left under `/fast/scratch/hyaku`; no gate looks | selftest-mode leak |

So 16 of the 21 survivors are witnessed **real acceptance gaps** on the current frozen counter
bytes; 1 is masked; 4 are output-only / selftest-mode.

## 5. Drift mutants — results (18)

Oracles: **G** = green control lane (exit 0 / 0 mismatches), **R** = isolated red fixture with
all seven swept sections present (exit 1 / 4 reds), **L** = live lane (differential: no new
failing id beyond the recorded live baseline `selftest-wording`, `quality161-sweep`), **B** = C2
before control (base `5a901163` + the five r89 instrument files; exit 1 / 2 reds / exactly
`selftest-wording`, `quality161-sweep`), **S** = the gate's own `--selftest` (exit 0).

| mutant | G | R | L | B | S | verdict |
|---|---|---|---|---|---|---|
| `scorecard-no9-clause-dropped` | 0/m0 | 1/m4 | 1/m2 new=[] | 1/m2 | 0 | **survived** |
| `scorecard-has10-clause-dropped` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | **1** | killed (okC detail) |
| `scorecard-first-segment-only` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `selftest-wording-note-source-dropped` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `selftest-wording-d6named-true` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `selftest-wording-correction-true` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `selftest-wording-and-conjuncts-dropped` | 0/m0 | 1/m4 | 1/m1 | **1/m1** | 0 | killed (before control) |
| `gate-selftest-mentions-true` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `gate-selftest-missing-killpower-true` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `gate-selftest-missing-counter-true` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `quality161-sweeps-true` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `quality161-cites-true` | 0/m0 | 1/m4 | 1/m1 | **1/m1** | 0 | killed (before control) |
| `quality161-cites-r88-narrowed` | 0/m0 | 1/m4 | 1/m1 | **1/m1** | 0 | killed (before control) |
| `selftest-okA-exit-only` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `selftest-okB-true` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `selftest-okC-true` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `selftest-fixture-seven-sections-reduced` (fixture `[44]` only) | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0 | **survived** |
| `selftest-fixture-cleanup-dropped` | 0/m0 | 1/m4 | 1/m2 | 1/m2 | 0, **leaks `tabi-r89-driftfix-*`** | **survived** |

Tally: 4 killed / 14 survived / 0 crashed / 0 unapplied.

### Survivors — exact clause left alive

- `scorecard-tallies`: the restored-tally clause `if (!/selftest 9\/9/.test(s.body)) bad.push('round-N-no-9')`
  is unbound — the fixture injects `10/10` (caught by `has-10` + `stray`), never a wrong-but-not-10
  tally; a section reading `8/9` would pass. The duplicate-heading claim in the comment
  ("a duplicate/stub heading cannot hide a later section") is also unbound: `for (const s of segs.slice(0,1))`
  survives because the fixture has one segment per round.
- `selftest-wording`: the stale-phrase sources `SKILL.md`, `plan87` and `note` are individually
  unbound — only `corpus/lessons/round-87.md` is witnessed (the fixture puts the phrase there).
  The `D6` clause and the correction clause are each individually unbound: at base both are
  false, so killing one leaves the statement red (the jointly-false conjunction is witnessed —
  the `and-conjuncts-dropped` mutant is killed by the before control).
- `gate-selftest`: the fixture's red is caused by *all four* instrument files being absent, so
  each conjunct (`mentions`, `counter`, `battery`, `killpower`) is individually unbound; a live
  lane in which one gate lost `--selftest` would not be detected (three survivors).
- `quality161-sweep`: `sweeps` is true at base and at the live lane, so the `sweeps` conjunct is
  never red anywhere — a mutant forcing it true survives. (`cites` is witnessed: both the
  `cites-true` and the `cites-r88` mutants are killed by the before control, whose QUALITY 161
  cites only r87/r88.)
- `--selftest` mode: `okA`'s id-set conjunct, `okB` (claims===4 && ids.length===4) and `okC`
  (causal detail strings) can each be replaced by `true`/`exit===1` with every oracle green.
  The fixture's "all seven swept sections" property is unbound (a one-section fixture still
  passes), and the in-process cleanup is unbound (dropping it leaks and the selftest still
  exits 0). The leak is observable: `tabi-r89-driftfix-mw7u13kv` was left behind in the leak
  watch dir by the cleanup-dropped mutant and removed by this seat.

## 6. Claim-wording adjudication

1. **C1 leg (b) "kill power leaves 0 survivors, 0 crashed, 0 unapplied" — FALSE at both pins.**
   - Original pin `319534b9`: 3 mutants are `unapplied` by occurrence count (`leg-records-keys-open`
     occ 0, `accept-grammar-bytes-dropped` occ 2, `accept-grammar-state-dropped` occ 2), each
     counted `crashed` by the instrument's else-branch.
   - Current pin `e46b132f`: 1 unapplied — run output
     `{"mutants":1,"killed":0,"survived":0,"crashed":1,"unapplied":["accept-grammar-state-dropped"]}`
     (`occurrences: 0`). The wave's own `scored/killpower-a.json` (read at 10:02, 7808 bytes,
     before a re-run truncated it) reports the same: `72 mutants, 71 killed, 0 survived, crashed 1,
     unapplied ["accept-grammar-state-dropped"]`. The script counts `unapplied` in the `crashed`
     bucket, so the claim's "0 crashed" is false by the instrument's own numbers. (After the
     sweep, the on-disk file became `576be85e` at 10:04:19 and audits to 0 unapplied — but
     `freeze.txt` still pinned `e46b132f` at 10:07:40, so the fix is not in the frozen
     instrument; see §7.)
   - Additionally the frozen list contains a **broken** mutant: `replay-limit-printed-drift`
     rewrites `const replayIdx = sims.findIndex` → `const replayIdx = -1`, producing
     `-1((s) => s.refused)` and a `TypeError: 1 is not a function` (verified directly; exit 1).
     Inside the battery every case fails (223/223), so kill power records it `killed` — a
     crash-kill, not coverage of the replay limit. The `crashed` bucket never sees it.
2. **C1 leg (b) "kill power leaves 0 survivors" — true of the 72-mutant list at the current pin,
   but not coverage of the clauses attacked here.** 21/26 independent weakenings survive the same
   battery; 16 of those are witnessed real acceptance gaps (§4). The frozen list simply does not
   contain witnesses for those clauses.
3. **C1 leg (a) "checkCount 107" — true at the current bytes; the same claims object still says the
   probes score at 108.** `priorSet` reads "each scores clean at 108 checks against the other's
   prior-set"; the current counter declares 107 checks for any 41-leg receipt. The 108→107 change
   and the three pin changes are in `claims.json` without a `frozenAmendments` entry (only the C2
   before-numeral 2→3 has one). The original pin 108 measurement is reproduced with `33d4b927`.
4. **C2 type (1) "the drift --selftest fixture now carries all seven swept sections so the
   scorecard-tallies red is causal" — the causal half holds, the "all seven" property is unbound.**
   The green control (seven sections at 9/9, no injected 10/10) turns `scorecard-tallies` green,
   so the injected 10/10 is causal; and `has10-clause-dropped` is killed by `okC`'s
   `/round-44-has-10/` detail. But `okC` itself can be replaced by `true` (survivor), and a
   fixture with only `Round 44` still passes the selftest (survivor) — nothing asserts the
   seven-section property.
5. **C2 type (2) / leg (c) "the fixture-leak check confirms 0 tapi-r89-driftfix-* trees remain" —
   FALSE as worded.** No script in the lane contains a fixture-leak check (`grep -rn driftfix`
   finds only the `rmSync` lines in `check-record-drift-r88/r89.mjs`). The cleanup-dropped mutant
   leaks `tabi-r89-driftfix-<suffix>` and the selftest still exits 0. The claimed glob is also
   misspelled: the code's prefix is `tabi-r89-driftfix-`, not `tapi-r89-driftfix-`, so a literal
   check of the claimed pattern matches nothing.
6. **C2 type (3) "the counter's replay limit sentence prints the computed per-prior absNeed values
   and a new replay-limit-consistency check binds refused == (absMatched >= absNeed)" — FALSE of
   the current frozen counter bytes.** There is no `replay-limit-consistency` check in
   `53593b5c`: the id is gone (107 checks), replaced by `limit.replayConsistency`, a field no
   check and no battery case reads; `limit-replayconsistency-true` survives everything. The
   sentence-printing clause is likewise unbound: the mutant prints `perPrior ()` and remains
   clean at 107. On the original pin `33d4b927` the numbered check did exist and was a tautology
   of the `sims` construction (`refused` is assigned the same expression), which the wave's own
   critic noted; the re-freeze removed it rather than witnessing it.
7. **C2 leg (a) after-state / leg (b) before-state.** At 10:03 the live lane still reports
   `mismatches 2` (`selftest-wording`, `quality161-sweep`) and `corpus/lessons/round-89.md` does
   not exist; the after-state (0) is not present in the working tree, and `scored/drift-a.json`
   / `scored/drift-before.json` do not exist. The before control reproduces **2** reds when the
   base worktree is given the five r89 instrument files (needed for `gate-selftest` to be green);
   on a bare base worktree it is **3** (adds `gate-selftest`), which is the amended claim's
   numeral. Both readings are recorded; the amended "3" is reproducible only as a bare base.
8. **C1 leg (c) "selftest green" — FALSE at my snapshot.** `selftest-r89-gates.mjs --skip-killpower`
   at 10:04: `clean:false`, failed `pins-match-freeze` (`scripts/selftest-r89-gates.mjs` hashes
   `2ad05c4b…` but `freeze.txt` pins `35235eff…`) and `record-drift` (2 mismatches). All other
   gates were green (counter 107 clean, battery 223/0/107, nowork exit 1 with `schema`,
   noreceipt exit 2, exemption gates, gate-selftest, capability-status).

## 7. Wave-state calibration findings (for the integration owner; not fixes)

- **Mid-wave re-freeze churn.** The instrument bytes changed after the scored receipt
  (12:43:31Z) and after the w1 reviews: counter at 09:45:14, selftest gate 09:46:52, battery
  09:50:38, kill-power 09:54:58; `freeze.txt`/`claims.json`/`plans/round-89.md` were rewritten
  at 09:58 and remain uncommitted (`git status` M). This is the r87 lesson's
  `mid-wave-re-freeze-churn` shape (corpus/lessons/round-87.md §mistakes).
- **The re-freeze is internally inconsistent at 10:05:** `freeze.txt` pins
  `selftest-r89-gates.mjs` at `35235eff` while the file is `2ad05c4b`; the pinned battery is 223
  cases while `scored/battery-a.json` is the 222-case run (09:45:36) that predates the
  `accept-domread-law-raw` case; `scored/killpower-a.json` was truncated to 0 bytes by a re-run
  at 10:04. The scored artifact set is not a snapshot of the current pins.
- **The original freeze's three assertions were all false at the original pin** (measured, not
  inferred): battery "0 failed and full coverage" → 4 failed + 5 uncovered; kill power "0
  unapplied" → 3; checkCount 108 → reproduced (this one did hold). The re-freeze repaired the
  battery and the counter, but left the kill-power unapplied mutant and the selftest pin
  mismatch.
- **Post-sweep drift (10:07:40).** `scripts/kill-power-round89.mjs` changed again at 10:04:19
  to `576be85e` (72 mutants, 0 unapplied by occurrence audit), while `freeze.txt` still pins
  `e46b132f`; the selftest-gate pin is still `35235eff` against on-disk `2ad05c4b`. The verdicts
  in this report are pinned to the hashes named in §1; the pinned bytes and the tree bytes were
  not the same instrument at any point between 09:45 and 10:07.
- **The frozen kill-power's `crashed` bucket is not a crash detector:** it is the else-branch
  for `unapplied` too, and a mutant that crashes the counter makes every battery case fail →
  recorded `killed`. The instrument cannot distinguish "rule detected" from "mutant broken".
- **`--expect-*` flags are parsed by first occurrence** (`opt()` uses `indexOf`), so a duplicated
  flag is silently ignored. Only relevant if an invocation ever repeats a flag.

## 8. Restoration and cleanup

- The lane was read-only for this seat. The counter/battery/kill-power bytes changed only under
  the integration owner's edits (hashes in §1); my last read at 10:05 shows the counter still
  `53593b5c` and the drift gate still `c54d5edf`, i.e. my sweep did not contribute to the churn.
- Every mutant lived in a per-mutant scratch dir and was removed after its run; the base
  worktree (`/fast/scratch/hyaku/tabi-r89/R89Mut1/base-wt`, `git worktree add 5a901163`) was
  removed with `git worktree remove --force`; the whole scratch root
  `/fast/scratch/hyaku/tabi-r89/R89Mut1/` was removed. Leaked fixture dirs
  (`tabi-r89-driftfix-*`, `tabi-r89-counter-selftest-*`) left by the leak mutants were removed.
- No commits, pushes, checkouts or other mutating git commands were run in the lane; the only
  `git worktree` command was the allowed base clone, now removed.
- Tooling: none installed or upgraded; host `node v24.21.0` used as-is.

## 9. Limits

- Det B is the receipt-mutation battery, not the kill-power list; a survivor means the battery
  does not constrain that clause, and §4's witnesses separate real gaps from masked/output-only
  clauses. Three clauses (ports distinctness, `cdp-open-frame`, pins) are witnessed with
  hand-built receipts; they are not in the frozen battery by construction.
- Det A is a differential reading of a red baseline; it can only report new failures, not
  cleanliness.
- The drift green control is a reconstruction of the intended after-state (QUALITY 161 patched
  to cite `check-record-drift-r89`, a round-89 lesson carrying D6 + the correction phrase); the
  live lane does not yet contain those records, and the after artifacts (`drift-a.json`,
  `drift-before.json`) do not exist at my snapshot.
- The before-control numeral depends on the instrument overlay (2 with, 3 without); the kill
  verdicts for the `quality161` mutants hold under both, and the wording/`scorecard` survivors
  are unaffected by the choice.
- One mutant (`event-files-type-any`) is refused by another check on the same receipt; its
  survival is not an acceptance gap.

## Appendix A — mutant manifest (target sha256 -> mutant sha256)

Target bytes: counter `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4`; drift `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c`.

| # | mutant | occ | before | after |
|---|---|---|---|---|
| C01 | `domread-raw-binding-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `96f6db0dffe83354db0663ae6d761fe2409c1326a7eb8e6df6b095888eaadb64` |
| C02 | `domread-tokens-text-leg-only` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `29efd814df73175774fbafb44b3e90686f27a17c057e11f65b698880f1422abe` |
| C03 | `domread-desc-from-toplevel` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `1db23149c57e7a71284d9fbac84879f36f690a6f6d02e6bcc1111238c3ebfc67` |
| C04 | `domread-token-length-only` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `b0525c4972402ecff17b88e682a558aad2b942ecc9ce1d884dd4c991abc45855` |
| C05 | `domread-answer-state-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `7cb5bd70d5e5655e21ccf0cffd901c23f2706ca26661dce7939f44e72d916adc` |
| C06 | `domread-read-hex-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `3aa5cd6748ea459815dd8824f8de51de568fbff2d730a5579decce903fdfdd49` |
| C07 | `domread-answer-files-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `919ae4e942255b47bb86407d1a7a1baffa891a1ba1bc5fb211ca60f3a2bd4a63` |
| C08 | `read-hex-multiple-mode-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `f7f7d2323b517e920dc586d071478b232b034ab401777c2b3130723952125bc4` |
| C09 | `read-hex-webkitdir-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `4fe3dbefa6f739a1b53c09e25893347c270576d72918d6a60192027a85273747` |
| C10 | `per-leg-act-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `ee31d9bb40605921bf7ea732e6e49cababfbaa77675fc96fe4605c8cd49e9beb` |
| C11 | `nonce-expected-hardcoded` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `7c17bb17413192e47c47f4da4e2e9aacaf74267c15811a2d6ab637b76f312aa3` |
| C12 | `driver-pin-hardcoded` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `d2e0d90a6fad34407487af95b588dd2b4d476162d8d848462f73f36fa48eb785` |
| C13 | `fixture-sha-hardcoded` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `4b33c0fdb4fc499f5115d2003f3cfe3eeb558df2655dd7daa5b7a6bc9b137951` |
| C14 | `limit-sentence-absneed-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `a4ba2c47f75f4614db2171655434f465f794121694fb8c3154359296266116c8` |
| C15 | `limit-replayconsistency-true` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `3f53738c5368a08cbae583579d0d4e02b7c33f358fdcf3ff0e6433c26acb1cbe` |
| C16 | `empty-prior-set-guard-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `0922365a263309c0bc7145f3755f92a920165dc10191850567d54f4b9d5412b4` |
| C17 | `prior-parse-error-skipped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `8d1d6d51f771e6dec2a1ffdd5756fc18904b19f84ee0e21b6c5139ef1ad349a4` |
| C18 | `ports-distinctness-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `e2f8d812a6eb3296898736067638496bdbea215fcc00d01bbb5378f67ada4811` |
| C19 | `host-node-floor` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `bc0228d9b2fc74c906fc6639679f0e632b59caace6754af03fbfb5c0f5e82d6f` |
| C20 | `nonce-shape-max-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `d50ca7606469e895a660e52e079b1fb53a401a12a8d104724bb94797cd2ee691` |
| C21 | `chooser-wait-lower-bound-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `166120e30dc95511755cb743c5eaa2266e7b35b5ac5a6ab1ebdc1813a8641215` |
| C22 | `plan-frozen-intercept-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `4218a3816b627088c34a7b257c1756007c64e23362faf223bafb0c656758a18b` |
| C23 | `cdp-open-frame-binding-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `25d691b619173e4d6951db0008253538a165277f6223b44989e6d99bd4685f66` |
| C24 | `event-files-type-any` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `312a107514a23800d892a65ba2bfffde0a7985e6a24893e60fcc3f487385522a` |
| C25 | `counter-selftest-ids-dropped` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `7ebc97c140a66bb45fb7c49b2c0695b758597a20bd5f74d0d3ab2855b8b0b8f0` |
| C26 | `counter-selftest-scratch-kept` | 1 | `53593b5c93e82a52e96fc1d55ddcd738159fca1388b82442e02f6525d4d3f9f4` | `4c94e0b5de58a495f5905058673e53c8279d326445c2b0e18b58b85d849c4f87` |
| D01 | `scorecard-no9-clause-dropped` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `bb98d4f5c8671849ec10dd1fe2145b203b5639842bf008ed2c0f2cd457c3e43e` |
| D02 | `scorecard-has10-clause-dropped` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `d5e07c4a931e5332f8a9ef8ac957fcecd144b220a5d2126ea06c6bba7eb2c6c9` |
| D03 | `scorecard-first-segment-only` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `0a2bb1622f4a59c72616f8cd2eed0a2c3f440fac65986f5c0fa22d70b7a6ffda` |
| D04 | `selftest-wording-note-source-dropped` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `56f5fc7613a5a4ddb48e16c427ddbbf2994be3baca41bb2b4f114b19a08c90bf` |
| D05 | `selftest-wording-d6named-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `4bd7c2d449343f52f8c128a53bb184969229d703d5ee2087f9067826ec7e1246` |
| D06 | `selftest-wording-correction-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `e25737381cc7f545e7bb40ed6f7b59271bcdec11a6b44c4aeab280cf2940e2bf` |
| D07 | `gate-selftest-mentions-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `605b66fc9c76c374682c3521056bca7db864403c5c27dfa6ca2439c9176b44cc` |
| D08 | `gate-selftest-missing-killpower-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `734b9bbbcfb7905ac24b4a3d83b6fe504a619c91645e4ccc86c20ee86ce0c383` |
| D09 | `gate-selftest-missing-counter-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `60f28250711b89e89f36e2b0102da5076cdb5c7ae601f76c887bd9f5ee0ae7fc` |
| D10 | `quality161-sweeps-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `d3ac6850a2db2e5adefbc3fe3f04fd46ac1a710aa1bd35d694e2bacb33121309` |
| D11 | `quality161-cites-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `c4c58d79d45f829f6dfdedd1b4c1e6467b1e20fda333ae693b12cb69221b7bee` |
| D12 | `quality161-cites-r88-narrowed` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `86267b0561170ed469de2bde1a8af967157511c78e7ac1c778474eca4d87df71` |
| D13 | `selftest-okA-exit-only` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `472fdec564082cef187455b0c37c9da1da6e2552221450b46832ce3c0f72b4ab` |
| D14 | `selftest-okB-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `03080f249c9ad0202540919f23c8781dce6319f8b8fe1a55ac3656e71dfed518` |
| D15 | `selftest-okC-true` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `19484f4d26b8d8890a921df5f8f986d96f03e3b723566e2d1ab9a89917e3db26` |
| D16 | `selftest-fixture-seven-sections-reduced` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `23e496fcb0a8d4891e42827fd579244958a7ec78a49db3b746d5c85d42caa898` |
| D17 | `selftest-fixture-cleanup-dropped` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `9614cb73a7e1e7c03f056437f8baaa45c1bdfa735806caa23de4f13186dc0a93` |
| D18 | `selftest-wording-and-conjuncts-dropped` | 1 | `c54d5edf724ceb8c08ba6b71cff3b25d84b3deaa546831b9a813fbf6fb37308c` | `40747e74059739f2b0050e248c0d1a602a9779841614fd6bfec6f1538bcd72d4` |
