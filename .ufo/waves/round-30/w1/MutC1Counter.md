# MutC1Counter — mutation test of the C1 counter's own selftest (round 30 w1)

## Verdict

The C1 counter `scripts/check-gate-mutants.mjs` (sha256 `02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55`, byte-identical to `frozenDigests` in `.ufo/waves/round-30/claims.json`) has a selftest that is strong but not complete. I built 12 one-guard mutants of the counter in scratch copies — one per guard named in the assignment — and ran `--selftest` on each. **7 of 12 were killed, each by exactly the case that targets its guard; 5 survived.** Three survivors (M03 find-site subtraction, M08 duplicate-id refusal, M10 identity-mutant refusal) are killed by one cheap additional selftest case each, which I designed and **verified empirically** by running probe fixtures against both the pristine counter and the surviving mutant in production mode. The other two are not killable by any case-only change: M11 (gate path containing `..`) is indistinguishable at the asserted surface because the guarded and unguarded paths both exit 2 (`catalogue gate without a valid script path` vs `gate script absent`), and M06b (timeout flag) is an equivalent mutant for the verdict — a timed-out spawn has `exit = null`, so `killed = !clean` still holds with the flag off; the flag only feeds report fields. The lane was never modified; all mutants lived in `/fast/scratch/hyaku/tabi-r30/MutC1Counter/` and were removed after receipts were copied out.

## Method

1. Shared clone at the frozen rev, pristine selftest baseline: `node $S/clone/scripts/check-gate-mutants.mjs --selftest --json` → **exit 0, ok=true, cases=12, passed=12** (`runs/pristine.json`). A baseline failure would have made every result inconclusive; it was clean.
2. `make-mutants.mjs` (receipt in output dir) generates one mutant per guard: it asserts each `find` occurs **exactly once** in the pristine counter bytes, applies the replacement, writes `$S/mutants/<id>.mjs`, and prints sha256s. 12 mutants generated, all assertions passed.
3. Each mutant run: `node $S/mutants/<id>.mjs --selftest --json` (TMPDIR under scratch). Exit codes: M01/M02/M04/M05/M06/M07/M09 → 3 (selftest failed = killed); M03/M06b/M08/M10/M11 → 0 (all 12 cases passed = SURVIVED).
4. For each survivor, a probe fixture repo (toy gate + catalogue exercising the missing refusal) run against pristine and mutant via the counter's own production mode: `node <counter> --repo <fixture> --rev HEAD --json`.

## Kill matrix

| mutant | guard disabled | find → replace | verdict | killed by |
|---|---|---|---|---|
| M01 | find-exactly-once | `if (n !== 1) throw new Refusal(` → `if (n < 1) throw new Refusal(` | KILLED | `find-twice-could-not-evaluate` |
| M02 | mutant-aware literal scan | `if (m.kind === "fault" && m.replace.replace(/\s+/g, "").length >= LITERAL_MIN) {` → `if (false && …) {` | KILLED | `mutant-aware-literal-could-not-evaluate` |
| M03 | find-site subtraction | `const outside = occurrences(src, m.replace) - occurrences(m.find, m.replace);` → `const outside = occurrences(src, m.replace);` | **SURVIVED** | — (probe P1 kills it) |
| M04 | pristine-clean refusal | `if (!res.clean) {` → `if (false) {` | KILLED | `pristine-not-clean-could-not-evaluate` |
| M05 | benign accounting | `const benignKilled = benign.filter((m) => m.killed).map((m) => m.id);` → `const benignKilled = [];` | KILLED | `source-grep-case-false-kills-benign` |
| M06 | crash counted as killed | `const killed = !res.clean;` → `const killed = res.exit === 1;` | KILLED | `crash-counts-as-killed` (also `all-killed-benign-survives-clean`, `uncovered-check-survives`, `source-grep-case-false-kills-benign` — overdetermined) |
| M06b | timeout flag | `const timedOut = r.error && r.error.code === "ETIMEDOUT";` → `const timedOut = false;` | **SURVIVED (equivalent)** | — (no case-only kill exists) |
| M07 | clean = survivors 0 AND benign_killed 0 | `clean: survivors.length === 0 && benignKilled.length === 0,` → `clean: survivors.length === 0,` | KILLED | `source-grep-case-false-kills-benign` |
| M08 | duplicate-id refusal | `if (ids.has(m.id)) throw new Refusal(` → `if (false) throw new Refusal(` | **SURVIVED** | — (probe P2 kills it) |
| M09 | unknown-kind refusal | `if (m.kind !== "fault" && m.kind !== "benign") throw new Refusal(` → `if (false) throw new Refusal(` | KILLED | `unknown-kind-could-not-evaluate` |
| M10 | identity-mutant refusal | `if (m.find === m.replace) throw new Refusal(` → `if (false) throw new Refusal(` | **SURVIVED** | — (probe P3 kills it) |
| M11 | gate-path `..` refusal | `\|\| g.script.includes("..")) throw new Refusal(` → `) throw new Refusal(` | **SURVIVED** | not killable by a case-only change |

Machine-readable copy: `kill-matrix.tsv`. Per-mutant unified diffs: `patches/M*.diff`; raw selftest reports: `runs/<id>.json|.err`.

## Cheapest missing case per survivor

**M03 (find-site subtraction) — one new case, verified.** No existing case has a replacement text that occurs *inside* its own find string, so the `- occurrences(m.find, m.replace)` term is never load-bearing. Cheapest case: catalogue row `{ id: "sub", kind: "fault", find: "const a = x > 0;", replace: "st a = x > 0;" }` over the toy gate (replace is 8 non-space chars, ≥ `LITERAL_MIN`, and occurs only inside the find site). Expected: exit 0, fault_survivors 0, benign_killed 0 (the mutated gate `st a = x > 0;` is a syntax error → crash → killed). Verified (probe P1, `probes-output.txt`):
- pristine: `exit=0 survivors=0 benign_killed=0 clean=true`
- M03: `exit=2 refusal=… mutant-aware literal: fault mutant sub replacement text occurs in scripts/toy-gate.mjs outside its find site` → the case fails → M03 killed.

**M08 (duplicate id) — one new case, verified.** No case feeds a catalogue with a repeated id. Cheapest case: `catalogueOf([M_A, { ...M_A }])` (same id twice), expect exit 2 / survivors null / benign_killed null. Verified (probe P2):
- pristine: `exit=2 refusal=… duplicate mutant id: a-true`
- M08: `exit=0 survivors=0 benign_killed=0 clean=true` → the case fails → M08 killed.

**M10 (identity mutant) — one new case, verified.** No case feeds `find === replace`. Cheapest case: `catalogueOf([{ ...M_A, replace: M_A.find }])`, expect exit 2. Verified (probe P3):
- pristine: `exit=2 refusal=… mutant a-true is the identity`
- M10: `exit=1 survivors=1 benign_killed=0 clean=false` (the no-op mutant sails through as a surviving fault) → the case fails → M10 killed.

**M11 (gate path `..`) — no case-only kill exists.** Verified (probe P4, gates `["../outside.mjs", TOY]`, mutants `[M_A]`):
- pristine: `exit=2 refusal=… catalogue gate without a valid script path`
- M11: `exit=2 refusal=… gate script absent at 70f84c3…: ../outside.mjs`

Both paths exit 2 with `fault_survivors = null` and `benign_killed = null`, and `runSelftest()` asserts only exit code plus those two counts — so every conceivable case asserts the same outcome for pristine and mutant. Killing M11 requires the harness to assert the refusal message (a counter change, not a case change). The `..` guard is currently defense-in-depth that the selftest cannot see; that is a coverage finding, not a defect in the guard.

**M06b (timeout flag) — equivalent mutant for the verdict; no case-only kill exists.** With `timedOut = false`, a timed-out `spawnSync` still returns `status = null`, so `clean` is false via `exit === 0` failing and the run is still counted killed; the flag only shapes `timed_out` report fields and refusal text. No selftest case can trigger the 600 s `RUN_TIMEOUT_MS` timeout cheaply, and no case asserts the `timed_out` field. Pinning it would require making the timeout injectable (counter change). The crash half of the "crash/timeout counted as killed" guard *is* covered — M06 shows `crash-counts-as-killed` kills a crash-blind counter.

## Commands run and exit codes

```
S=/fast/scratch/hyaku/tabi-r30/MutC1Counter; export TMPDIR=$S/tmp
node $S/make-mutants.mjs                                   # exit 0 (12 mutants, all find-once assertions passed)
node $S/clone/scripts/check-gate-mutants.mjs --selftest --json > $S/runs/pristine.json   # pristine_exit=0
for f in $S/mutants/*.mjs; do node "$f" --selftest --json > "$S/runs/<id>.json" 2>...; done
# exits: M01=3 M02=3 M03=0 M04=3 M05=3 M06=3 M06b=0 M07=3 M08=0 M09=3 M10=0 M11=0
node $S/probes.mjs                                         # probes_exit=0 (P1–P4 outputs above)
```

## Mutant hashes (pristine → mutant)

- pristine `02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55` (= frozenDigests)
- M01 `ff64de3774ac0435cc585fa6b35dabb6c47187ae94bb8d0d4375565cd43f9d16`
- M02 `2e551c22a5101dbe798f944b3911cce806ff0370e2da188832bddb95c698d7b0`
- M03 `71b25073733050e961efb7973838bdede5d813edddcc173c51e7918e4387acae`
- M04 `7c9930962297e897a7b0df3486a382eff77fbabdc5fbb57a0c899f8a8db3ccc9`
- M05 `abf18a2405b449005e546849095f8589ff3bdec930860cbde0178629afb7f76a`
- M06 `9060e7eb3da4748a961edb52773d693f4931e672abd3c70e73f2c23d6f0c5e52`
- M06b `594e5ca0d481b3617c5aa57c8260c493d27fbb83d7c69e2b385865091a419118`
- M07 `4c9fbca01771f05fbe54dc3cc7eaa0d6782f08e4dc1b2a54bb6a4bfa5bee1c68`
- M08 `4ec6be9e00d061b04969077aff9923c360bd059d0465f7c81828c3eea8690b80`
- M09 `1b60b27654d7ecdbedfa46dbe57e7b0e03e2484b25d99bc9380bfa8337bee8ad`
- M10 `9d5fa759d828c1df40b5317960c7462aabfa258d09b01885b182712517b8ded9`
- M11 `1877d78c16c0aa5f09536d2a13c0688bea0049776cc219226641dd2ae027c4f2`

## Restoration evidence

- No lane tracked file was edited at any point; every mutant was a separate file under `$S/mutants/`. No patch against the lane is proposed (this seat reports findings only).
- Lane counter sha256 before work: `02945f88…` (measured at setup, matched clone copy byte-for-byte). Re-checked after work: identical (see final receipt below).
- Scratch tree `/fast/scratch/hyaku/tabi-r30/MutC1Counter/` removed after receipts were copied to the output dir.

## Tooling

No tools installed or upgraded (node v24.21.0 already present; nothing else needed).
