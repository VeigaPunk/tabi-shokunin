SURVIVORS

# tabi r71 w1 — R71Mut2 mutation probe of verify-live-r71.mjs hardening

Seat R71Mut2, round 71 wave w1, lane `tabi-shokunin` (base `11b00f64`, FREEZE `04f4330f`).
Subject: `scripts/verify-live-r71.mjs` (pristine sha256 `61f43596e28fdec78b275de495f252f7881ce9882b9079d7191d84413c73f333`,
equal to `freeze.txt:6`). Detector: frozen `attack-harness.mjs` (`33e1bd1b…4512`) then
`evaluate-c2.mjs` (`3c3a83dc…8716`), both copied byte-identical from
`.ufo/waves/round-71/controls/c2/`. Chromium `155.0.8059.84` headless. Scratch
`/fast/scratch/hyaku/tabi-r71/R71Mut2` (deleted after receipts were copied here); the lane tree
was never written.

Result: **2 killed / 11 single-line mutants, 9 survived, 0 FALSE-PASS**, with the pristine baseline
and the restored-bytes control both holding (`evaluator exit 0`). Both kills are class-shape
mismatches, not false passes: the harness's marker-based false-pass detector never fired.

## Method

Each mutant is one changed line in a copy of the pristine verifier, placed at
`<lane>/scripts/verify-live-r71.mjs`; one harness run (six frozen attacks) and one evaluator run per
mutant, no retries (a red run is reported). `KILLED = evaluator exit 1`. Runs were sequential
(Chromium timing); 13 harness runs, 1 156 s total, 62–134 s each. Mutant bytes, one-line diffs,
per-mutant receipts and `manifest.json` sit beside this file.

Baseline `m00` (pristine bytes): `holds=true`, `falsePass=0`, `notLanded=0`, classes
`P-tap:HONEST-PASS P-scroll:HONEST-PASS A-env-tap:REFUSED A-env-scroll:REFUSED B-swap-tap:HONEST-PASS C-swap-run-b-tap:REFUSED`
— the same summary as the frozen `controls/c2/pre-r71.eval.json`.

## Mutant table

| id | single-line drop (pristine line) | mutant sha256 | classes (T=tap, S=scroll) | eval exit | verdict |
|---|---|---|---|---|---|
| m00 | none — pristine baseline | `61f43596…` | baseline (above) | 0 | control holds |
| m01 | env refusal `if (injected.length)` → `if (false)` (:121) | `5e4b6c95…` | A-env-tap **HONEST-PASS**, A-env-scroll **HONEST-PASS** | **1** | **KILLED** |
| m02 | children get `{...process.env, ...extra}` instead of the allow-list (:161) | `e129e6b1…` | unchanged | 0 | survived |
| m03 | spawn `[driver, …]` instead of `[snapDriver, …]` (:183) | `ce50cbbd…` | B-swap-tap **REFUSED** (expected HONEST-PASS) | **1** | **KILLED** |
| m04 | `const snapOk = true;` — no before-run read (:181) | `9fd8710f…` | unchanged; C findings `[run-b-wall-floor, run-b-stdout-mismatch, snapshot-mutated]` | 0 | survived |
| m05 | `// snapCheck('after-runs')` (:209) | `305aceb0…` | unchanged; C findings `[snapshot-mutated, run-b-wall-floor, run-b-stdout-mismatch]` | 0 | survived |
| m06 | wall-floor push `if (false)` (:186) | `a115a493…` | unchanged; C findings `[snapshot-mutated, run-b-stdout-mismatch]` | 0 | survived |
| m07 | stdout-binding push `if (false)` (:204) | `2259bbaf…` | unchanged; C findings `[snapshot-mutated, run-b-wall-floor]` | 0 | survived |
| m08 | snapshot dir mode `0o700` → `0o777` (:146) | `5c6509c3…` | unchanged | 0 | survived |
| m09 | snapshot write without `flag:'wx'` (:149) | `7a02db9c…` | unchanged | 0 | survived |
| m10 | `ok = d === out.driverSha256 && c === out.counterSha256` (:155) | `f601b33f…` | unchanged | 0 | survived (equivalent) |
| m11 | execArgv refusal `if (false)` (:122) | `ad04bd99…` | unchanged | 0 | survived |
| m99 | pristine bytes restored, re-run | `61f43596…` | baseline | 0 | control holds |

Every run: `falsePass=0`, `notLanded=0`, `positivesOk=true`. Per-attack rows, wall times, markers
and findings are in `manifest.json` and `m<id>/summary.json`.

## Kills

- **m01 — env refusal.** A-env-tap and A-env-scroll now exit 0 with empty findings and no marker
  (runs 12 585/12 665 ms and 10 567/10 569 ms): the verifier proceeds and the preload is inert
  because the children are still allow-listed. The evaluator kills on class
  (`HONEST-PASS not in REFUSED`). This is a class kill, not a false pass.
- **m03 — execute the lane driver.** B-swap-tap exits 1 with
  `[run-a-wall-floor, run-a-stdout-mismatch, run-b-wall-floor, run-b-stdout-mismatch]`, runs
  29 ms / 19 ms, marker 2: the do-nothing producer ran twice inside accepted runs. Only the wall
  floor and the stdout binding stopped a FALSE-PASS; the snapshot was not consulted because the
  lane file was executed. Evaluator kills on `REFUSED not in HONEST-PASS`.

## Survivors and the attack each would need

- **m02 (children inherit `process.env`).** (E) refuses the only Node loader vector
  (`NODE_OPTIONS`) at :121 before any spawn, so the allow-list is unreachable by the frozen A rows.
  Attack needed: a loader vector outside `INJECT_ENV` (:42) that Node honours in the child. Under
  Node 24 `--require`/`--import` arrive only via `NODE_OPTIONS`, so this is equivalent under the
  frozen set; it becomes a FALSE-PASS only if (E) is also dropped — [INFERENCE] m01+m02 would green
  A-env with a non-empty marker, since the two layers are coupled (each observed independently).
- **m04 (no before-run read).** C is still refused by the after-runs read. Attack needed: a
  transient swap — replace the snapshot driver after :181 and restore it before :209 — with a
  substitute that forges a receipt passing binding/counter, sleeps ≥ 6 s (defeats :186) and prints
  the profile's `stdoutKeys` (:204). This is exactly the declared C2 limit ("rewrites the snapshot
  and restores it between two hash reads"); m04 shows the per-run read is the only defence against a
  transient swap, because the after-runs read never sees it.
- **m05 (no after-runs read).** C is still refused by the before-run-b read. Attack needed: land the
  swap in the microsecond window between :181 and the `spawnSync` at :183 (the harness's trigger,
  `run-a/receipt.json`, fires much earlier), same ≥ 6 s forging substitute; or a swap during run b
  that is never re-read.
- **m06 (no wall floor).** C is still refused for `snapshot-mutated`. Attack needed: a swap the hash
  reads miss, whose substitute finishes in ~20 ms; with the floor gone, nothing distinguishes it.
- **m07 (no stdout binding).** C is still refused for `snapshot-mutated` + wall floor. Attack needed:
  a swap the hash reads miss, whose substitute sleeps ≥ 6 s but prints no/wrong summary; only the
  stdout binding would catch it.
- **m08 (dir 0777).** Same-uid attacks cannot use the mode. Attack needed: a different local uid
  writing the snapshot between reads — outside the declared same-user threat model, so out of model
  for this harness.
- **m09 (no `wx`).** `mkdtemp` names are unpredictable and the write is immediate. Attack needed:
  win the mkdtemp→write race (:145-149) to pre-create `snap-*/<driver>` or a symlink at that path so
  the write follows an attacker-chosen inode; with `wx` that attempt makes the verifier fail loudly
  (`internal-error`, exit 1), which for B would itself be a class mismatch.
- **m10 (read-time hash instead of pin).** Equivalent mutant on every scored path: :135-136 already
  force `out.driverSha256 === driverPin` and `out.counterSha256 === prof.counterSha256` before the
  snapshot exists, and the snapshot is written from the in-memory bytes, so the two values are
  identical. Only the unscored `--driver/--driver-sha256` override (exit 4) separates them. No
  frozen attack can distinguish it without also weakening the pin check.
- **m11 (no execArgv refusal).** The harness always spawns bare `node <verifier>`
  (`attack-harness.mjs:106`), so `process.execArgv` is empty in every row. Attack needed: A-argv
  rows — spawn `node --require <forge>.cjs verify-live-r71.mjs` (the preload's driver-basename guard
  would have to target the verifier instead). With (E) refusing `NODE_OPTIONS`, execArgv is the
  remaining loader vector and is unexercised.

## Findings (file:line + reproduction)

- **F1** `evaluate-c2.mjs:26` accepts any C refusal that carries `snapshot-mutated`; therefore
  dropping either snapshot read (m04, m05), the wall floor (m06) or the stdout binding (m07) alone
  leaves the verdict unchanged. The four layers are redundant under the frozen C row, not
  individually load-bearing. Repro: this dir, mutants m04–m07.
- **F2** B's kill power rests on the wall floor and stdout binding, not on the snapshot: m03 shows
  the swapped producer running twice inside accepted runs (marker 2, 29/19 ms) with only those two
  findings preventing a FALSE-PASS. Repro: m03.
- **F3** The A rows exercise only `NODE_OPTIONS` inheritance; `execArgv` (m11) and any loader vector
  outside `INJECT_ENV` (m02) are not measured. Repro: m02, m11.
- **F4** m10 is an equivalent mutant under the pin pre-check at `verify-live-r71.mjs:135-136`; no
  attack can distinguish it without also weakening the pin check. Repro: m10.
- **F5** 0 FALSE-PASS across 13 runs; both kills are class-shape mismatches. The marker detector
  never fired, so this probe measures the evaluator's class assertions, not forgery resistance.

## Restoration evidence

After m11 the pristine bytes were copied back (`m99`): `cmp` byte-identical, sha256
`61f43596e28fdec78b275de495f252f7881ce9882b9079d7191d84413c73f333`, harness summary identical to
m00, evaluator exit 0. The lane's own `scripts/verify-live-r71.mjs` was never written and still
hashes `61f43596…f333`. Scratch deleted after receipts were copied; no git/jj mutation, no pacman
transaction, no tool installed.

## Reproduction

```
S=$(mktemp -d -p /fast/scratch/hyaku/tabi-r71); mkdir -p "$S/lane/scripts" "$S/lane/corpus/evidence"
cp -a <lane>/scripts/. "$S/lane/scripts/"
cp -a <lane>/corpus/evidence/round69 <lane>/corpus/evidence/round70 "$S/lane/corpus/evidence/"
cp <this dir>/mutants/m04.mjs "$S/lane/scripts/verify-live-r71.mjs"
node <lane>/.ufo/waves/round-71/controls/c2/attack-harness.mjs --lane "$S/lane" \
  --verifier verify-live-r71.mjs --work "$S/h" --out "$S/out"
node <lane>/.ufo/waves/round-71/controls/c2/evaluate-c2.mjs --summary "$S/out/summary.json" --json
```
(Scratch path must stay short: the verifier refuses > 107-byte Chromium singleton paths.)
