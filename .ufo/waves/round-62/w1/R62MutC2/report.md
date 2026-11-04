# R62MutC2 — C2 frozen-counter mutation probe

Round 62, wave w1; leaf mutation tester. Axes: **coverage**, calibration, operability. This is detector-support evidence, not a third claim or outside admission review.

## Result

**Baseline: 16/16, exit 0. M1–M4 killed; M5 survives the declared negative-selftest detector.** No parse/import failure was counted as a kill. No instrument repair or pin change was made.

M5 uses the literal predicate-bearing conjunction in `producer-verdict`: `r?.predicate===true && r.buttonHypothesis==='CONFIRMED'` becomes OR. The existing 16 selftests still pass. Supplementary, explicitly out-of-battery probes changing only `predicate` to false or `buttonHypothesis` to `TENTATIVE` are refused by pristine bytes (exit 1, `producer-verdict`) but accepted by M5 (exit 0, findings []). Thus the surviving mutant is behavior-bearing, not equivalent. The declared selftests contain no negative producer-verdict case. This is a coverage finding; no contract change or repair is proposed/applied. The freeze does not identify a source location for M5 beyond “predicate AND-to-OR”; this report states its exact site rather than silently choosing another conjunction that happens to be killed.

## Input pins and integrity

Read `claims.json` and `instrument-pins.json` first. Baseline revision: `57b29bade4b05b03cdb8fa151daec90ac9b1a29c`; declared exact-instrument freeze: `1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4`.

Frozen instrument: `.ufo/waves/round-62/counters/chromium-receipt-r62.mjs`.

Before, control-copy, after-matrix frozen and restored-copy SHA256 all equal:

`971c84f602f6d79b9aa12f9872eba57463a938b425546f793c4b5df72bd5a006`

The pinned driver SHA256 remains `8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0`. This seat did **not** execute that driver or a browser. Receipt-mode CLI probes use a plainly labeled synthetic driver-text stub and PNG-header stubs, not live evidence or a claimed browser/teardown proof. Their exact hashes and every receipt hash are recorded in `harness-out.json`.

## Behavioral detector and observed outputs

| Mutant | Selftest exit / passed | Failing selftest cases | Matched probe: pristine → mutant → restored | Verdict |
|---|---|---|---|---|
| M1 drop right-button check | 1 / 14 of 16 | f1, f5 | f1: 1 → 0 → 1 | killed |
| M2 drop pointer identity | 1 / 15 of 16 | f6 | f6: 1 → 0 → 1 | killed |
| M3 drop menu cancellation | 1 / 15 of 16 | f7 | f7: 1 → 0 → 1 | killed |
| M4 drop closure/survivors | 1 / 15 of 16 | f8 | f8: 1 → 0 → 1 | killed |
| M5 producer predicate AND→OR | 0 / 16 of 16 | none | supplementary predicate-false: 1 → 0 → 1 | **survived declared detector** |

All mutant valid-receipt runs exit 0. All matched mutant probes exit 0 with predicate true and empty findings. Pristine f1–f8 exits are `1,1,1,1,1,1,1,1`; pristine valid exits 0. M1 also greens f5 because the removed pointer-buttons check covers both cycles and both button fields. M2–M4 green only their matched F probe. M5 greens none of f1–f8, but greens both supplementary producer-verdict probes. All restored selftests exit 0 with 16/16 and all restored matched probes exit 1.

Control usage-error and wrong-driver-pin invocations both exit 2; these were not kills. All measured runs, including restoration runs, retain full stdout, stderr, argv, exit codes and stream hashes in `harness-out.json`. `kills.json` summarizes the baseline, mutant hashes/transformations, verdicts and run index.

## Exact transformations

Each target was asserted to occur exactly once. All mutants started from the same pristine bytes. Only these transformations were executed (no alternative M5 sites):

M1 removes:
```js
    check(d?.button===2 && d?.buttons===2 && u?.button===2 && u?.buttons===0, 'pointer-buttons-'+i);
```
M2 removes:
```js
  check(b.length === 5 && b.every(e => e.pointerType === 'mouse' && Number.isInteger(e.pointerId) && e.pointerId > 0 && e.pointerId === b[0].pointerId), 'pointer-identity');
```
M3 removes:
```js
    check(menu?.defaultPrevented===true && md?.defaultPrevented===false && mu?.defaultPrevented===false, 'menu-cancelation-'+i);
```
M4 removes:
```js
  check(r?.teardown?.postKillSweepCount===0 && Array.isArray(r.teardown.survivors) && r.teardown.survivors.length===0, 'survivors');
```
M5 replaces only:
```js
r?.predicate===true && r.buttonHypothesis==='CONFIRMED'
```
with:
```js
r?.predicate===true || r.buttonHypothesis==='CONFIRMED'
```

| Snapshot | SHA256 |
|---|---|
| M1 | `83ed02851b01631cff8d6a0078eccb61922a9aaa01807985ce3cf183b75700af` |
| M2 | `90e91e3b931c3750ba8ad0ec10262d98e423d2597aea2734400fd2b75cd43fcb` |
| M3 | `1d58f70fd6301f0fd60641ed4b5310d27c225a530f7cee15f2f106aaf5119792` |
| M4 | `ad4c628e88514a710a3f3f2f8bcd11ccfa5cbc7a2f724e0786ebe42c45128aff` |
| M5 | `be137441bb6f0cc1d80d6a21e4dc522e2a73c03ad61b2793c80398235d4ec3f1` |

## Commands, fixture provenance and restoration

Node: `v24.21.0`, already installed; no installs/updates. Setup copied only the frozen counter into `/fast/scratch/hyaku/tabi-r62/R62MutC2/control.mjs`. Main command:

```text
node /fast/scratch/hyaku/tabi-r62/R62MutC2/harness.mjs
```

Harness exit: 0. Every detector invocation is recorded separately, including nonzero detector exits. Selftests use `node <absolute-counter-path> --selftest`. Receipt probes use:

```text
node <absolute-counter-path> <absolute-receipt-path> --driver <scratch>/driver-stub.mjs --expect-driver-sha256 <stub-sha256> --shot <scratch>/shots --json
```

All child cwd values are the seat scratch directory; no tool starts inside the lane. No git/jj command, clone, browser, port listener, pacman transaction or sibling write occurred.

The source exports `verify` and `forgeries`, **not** `synthetic`. Fixture generation imports exported forgeries and evaluates only the frozen source's `function synthetic()` declaration, bounded by the following `const ext=` declaration. It then binds the synthetic receipt to the actual fixture-stub hashes. All F edits are the counter's exported functions. Negative-selftest-shaped auxiliary receipts mirror the frozen lambdas. These fixture substitutions are explicit and are not presented as a live C2 after-pass.

After mutant measurement, each exact tested path was overwritten with original bytes, hashed, and subjected to the same selftest and matched receipt detector. `restoration.json` records all five restored hashes, selftest exit 0 and matched probe exit 1. Mutated bytes were preserved separately in `mutant-snapshots/`; `mutants/` contains the restored bytes. Durable receipts were copied to the seat directory before deleting only this seat's scratch. Scratch deletion and the final frozen hash are recorded in `cleanup.txt`.

## Artifacts and limits

All artifacts are relative to `.ufo/waves/round-62/w1/R62MutC2/`: `kills.json`, `harness-out.json`, `harness.mjs`, `restoration.json`, `control.mjs`, `mutant-snapshots/`, restored `mutants/`, `receipts/`, `driver-stub.mjs`, `shots/`, and frozen declarations. Recorded argv retains disposed scratch paths; artifacts retain all inputs and bytes. No durable-path replay was run or claimed.

C1 controls, old r61 refusal, live driver, screenshots and browser closure were not measured by this seat. C1 kaidoku/keyup overlap remains contested-open where uncertain; no overlap ruling is asserted. No scoring/integration/admission judgment is made.

Self-evaluation: accuracy 4 (literal M5 site disclosed; wording remains location-ambiguous), completeness 4 (all five probes plus restored detectors; live evidence intentionally out of scope), clarity 4 (raw outputs indexed separately), actionability 4 (full byte/argv receipts, but disposed paths need relocation), conciseness 3 (exact transformations and integrity details make this report long). Average 3.8; improve by pinning M5's source site before a future freeze, not changing this one. Would the user agree: likely, given explicit survivor evidence rather than a claimed all-killed result.

Report: `.ufo/waves/round-62/w1/R62MutC2.md`
