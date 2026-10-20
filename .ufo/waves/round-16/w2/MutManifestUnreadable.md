# MutManifestUnreadable — round-16 wave 2 (FALSIFY), gate reason `manifest_unreadable`

Seat: TabiR16.MutManifestUnreadable (reviewer, leaf). Author-side report; **not** a non-author certification.
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3` (lane HEAD, unmodified).
Gate `scripts/check-measurement-binding.mjs` sha256 `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb`;
selftest `scripts/selftest-measurement-binding.mjs` sha256 `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae`.
Lane writes: only this file. All mutation happened in `/tmp` copies/clones (kept, repeatable). Tools installed: none.
No source URL re-opens were needed for this ticket.

## Verdict

**HOLDS** for the named attack (disable/relabel the `manifest_unreadable` emission): the mutant is killed by the selftest alone, and the C1 counter recomputes **0** on it for four independent reasons.

**One bounded weakening survives (sub-finding, low severity, reported below):** narrowing the emission to `ENOENT` only keeps *both* the selftest (exit 0, `verdict=clean`) and the C1 counter (`c1_binding_contracts: 1`) green, while EISDIR/EACCES manifests are relabelled `manifest_schema_invalid`. Exit class stays 2, so this is a diagnostic-taxonomy gap, not an acceptance hole.

## Mutants (single line each, emission site only)

Target line, `scripts/check-measurement-binding.mjs:326` inside `loadJson` (declared at `:321`):

```js
    refuse(FAILURE_REASON.manifestUnreadable, `${file}: ${error.message}`);
```

| id | replacement (same indentation) | intent |
|---|---|---|
| M0 | original line | same-shape control |
| M1 | `// MUTANT M1: manifest_unreadable emission disabled` | full disable → falls through to `JSON.parse(undefined)` |
| M2 | `refuse(FAILURE_REASON.manifestSchemaInvalid, …)` | emission weakened to a wrong reason |
| M3 | `if (error && error.code === 'ENOENT') refuse(FAILURE_REASON.manifestUnreadable, …)` | partial disable: only ENOENT keeps the reason |

`git diff --stat b444ca8 HEAD` for both M1 and M3 clones: `1 file changed, 2 insertions(+), 1 deletion(-)` — no other file touched.

## Setup (exact)

```
D=$(mktemp -d /tmp/mmu-mutants-XXXX)          # -> /tmp/mmu-mutants-a0tn2igb
cp <lane>/scripts/{check,selftest}-measurement-binding.mjs $D/<id>/
# one-line replacement per table, then:
node $D/<id>/selftest-measurement-binding.mjs --gate $D/<id>/check-measurement-binding.mjs
```

Counter leg (lane is read-only, so a faithful clone carries the mutant commit; the counter resolves `ROOT` from its own file location, so the clone's counter is used):

```
C=$(mktemp -d /tmp/mmu-counter2-XXXX)          # -> /tmp/mmu-counter2-__ct5cki
git clone -q --no-hardlinks <lane> $C/M1 && cd $C/M1
git checkout -q b444ca8e024f386124418169e8e400221524bba3
# apply M1 / M3 to scripts/check-measurement-binding.mjs
git -c user.name=probe -c user.email=probe@local commit -aqm mutant
node .ufo/waves/round-16/measure.mjs <mutant-rev> --claim C1
```

`--no-hardlinks` is required: a hardlink `--local` clone fails `Invalid cross-device link` (`/tmp` vs the lane filesystem).

## Observed — selftest (`--gate`)

Baseline control (M0, temp-dir copy) and the lane's own selftest:

```
$ node scripts/selftest-measurement-binding.mjs
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13        # exit 0
```

| mutant | selftest exit | `case=manifest_unreadable` line | summary |
|---|---|---|---|
| M0 control | 0 | `expected_exit=2 actual_exit=2 expected_reasons=manifest_unreadable actual_reasons=manifest_unreadable PASS` | `verdict=clean cases=43 reasons=13` |
| **M1 disable** | **1** | `… actual_reasons=manifest_schema_invalid FAIL` | `verdict=failed cases=43 reasons=13` |
| **M2 reason swap** | **1** | `… actual_reasons=manifest_schema_invalid FAIL` | `verdict=failed cases=43 reasons=13` |
| **M3 ENOENT-only** | **0 (survives)** | `… actual_reasons=manifest_unreadable PASS` | `verdict=clean cases=43 reasons=13` |

M1 stderr: `FAIL_DETAIL case=manifest_unreadable MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0 | finding claim=- reason=manifest_schema_invalid …`

Cause of the M1/M2 kill: the selftest's only read-failure case passes a nonexistent path (`selftest-measurement-binding.mjs:274-278`) and asserts exit 2 **and the exact reason set** `['manifest_unreadable']`; a disabled or relabelled emission yields exit 2 with `manifest_schema_invalid`, so the reason equality fails.

## Observed — C1 counter (`measure.mjs --claim C1`)

In-clone control at the measured revision, same clone and same unmodified counter:

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"revision":"b444ca8e…","c1_binding_contracts":1,"gateSha256":"5150611c…","selftestSha256":"8c5426f2…",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]}},
 "failures":[],"counterBlobAtRevisionSha256":"bda4e18e…"}
```

Lane run of the same counter (no mutation) reproduces this exactly: `c1_binding_contracts: 1`; and at `e38d2599a922cb729186353830fff8e159b4fef0` it reports `0` with `failures:["gate or selftest absent at revision"]`.

**M1 (disable) → counted 0.** Counter exit 0 (0 = "counted, not clean"), commit `80463b05c9e462db90e6babce546c4e2340f5172`:

```
{"revision":"80463b05c9e462db90e6babce546c4e2340f5172","c1_binding_contracts":0,
 "gateSha256":"58eed5b741e12013be2b51cb719975726749ebddd892bbf97656bb3cd80e67d9",
 "selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae",
 "selftest":{"exit":1,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13","bad":1,"clean":21,"missingVocab":["manifest_unreadable"]},
 "legacy":{"exit":1,"findings":{C1: counted_inputs_undeclared,counter_changed_since_measurement,counter_digest_unrecorded; C2: counted_inputs_undeclared,counter_digest_mismatch}},
 "failures":["selftest exit 1","selftest summary absent, not clean, or case count mismatch","1 case lines not exact PASS","vocabulary not exercised: manifest_unreadable"]}
```

So the mutant is caught four times over by the counter's own legs (`measure.mjs:116-178`): child exit, summary, exact-PASS case count, and the `VOCAB` coverage check.

**M3 (ENOENT-only) → counted 1 (survives).** Counter exit 0, commit `6c97e5726bd843412e1442c7388528d65fa39cbc`:

```
{"revision":"6c97e5726bd843412e1442c7388528d65fa39cbc","c1_binding_contracts":1,
 "gateSha256":"8a944709342b82a7786b3cd76b174bd444fe60c95fdf1174ebe64ee273863046",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{…expected r15 set…}},"failures":[]}
```

## Gate-level demonstration of the M3 narrowing

Manifest argument is a directory (EISDIR) or a `chmod 000` file (EACCES), uid 1000:

```
$ node /tmp/mmu-mutants-a0tn2igb/M0_control_unmutated/check-measurement-binding.mjs --check <dir>
exit=2 … finding claim=- reason=manifest_unreadable detail=<dir>: EISDIR: illegal operation on a directory, read
$ node /tmp/mmu-mutants-a0tn2igb/M0_control_unmutated/check-measurement-binding.mjs --check <chmod000>
exit=2 … finding claim=- reason=manifest_unreadable detail=<chmod000>: EACCES: permission denied …
$ node /tmp/mmu-mutants-a0tn2igb/M3_enoent_only/check-measurement-binding.mjs --check <dir>
exit=2 … finding claim=- reason=manifest_schema_invalid detail=<dir>: invalid JSON: "undefined" is not valid JSON
$ node /tmp/mmu-mutants-a0tn2igb/M3_enoent_only/check-measurement-binding.mjs --check <chmod000>
exit=2 … finding claim=- reason=manifest_schema_invalid detail=<chmod000>: invalid JSON: "undefined" is not valid JSON
```

Control (M0) classifies both as `manifest_unreadable`; M3 relabels both while still refusing with exit 2.

## Why M3 survives, precisely

- The selftest has exactly one read-failure case and it uses a nonexistent path (ENOENT) — grep of `selftest-measurement-binding.mjs` for `does-not-exist|EACCES|EISDIR|chmod|permission` returns only lines 274-278. No case exercises a directory or permission-denied manifest.
- The counter's selftest leg only requires that `manifest_unreadable` appear as an actual reason of *some* PASS case (`measure.mjs:148-157`), which M3 still satisfies through that single ENOENT case. The counter's `--legacy` arm never reads an unreadable manifest. It cannot see the narrowing.
- Consequence at the emission site: any fall-through reaches `JSON.parse(undefined)` and `refuse(manifestSchemaInvalid)` (`check-measurement-binding.mjs:328-330`). So within this mutation class the worst outcome is exit 2 with a wrong reason — it cannot reach exit 0 without fabricating a manifest, which is outside the mutation class. That bounds the impact: misleading diagnostics for `--check <directory>` / permission-denied manifests, not silent acceptance.

## Impacted axes

- `manifest_unreadable` is behaviourally bound **only for the ENOENT shape**; per-error-code narrowing of the emission is invisible to both the selftest and the C1 counter.
- C1's literal claim (the reason appears in a PASS case; every VOCAB reason is exercised) is *true* under M3, so the counter is not lying — the claim simply does not quantify over read-error classes. Anyone reading C1 as "the whole read-failure branch is pinned" is over-reading it.
- The 0→1 delta at `b444ca8` does establish that the *emission exists and fires for an absent manifest*; it does not establish breadth.

## Residual risk / verification gaps

- Not tested: mutating the selftest (out of scope; peer `AttackC1Liar` covers liar-selftest/liar-gate). Not tested: read failures from exotic errno paths (ELOOP, ENOTDIR) — same blindness as EISDIR/EACCES by construction.
- The counter runs used a `git clone --no-hardlinks` because the lane is read-only; the same clone at `b444ca8` reproduces the lane's `c1_binding_contracts: 1` and the exact legacy finding set, so the pipeline is faithful. Lane HEAD stayed `b444ca8e…`; `git status --porcelain` shows only the pre-existing untracked `.ufo/waves/round-16/w2/` and `corpus/evidence/round-16/measurement-binding.json` (created by other seats, not by this one).
- Suggested (not applied — leaf, read-only): add a directory-manifest case and a chmod-000 case to the selftest, asserting `manifest_unreadable` for both. That closes the survivor without changing the gate.
