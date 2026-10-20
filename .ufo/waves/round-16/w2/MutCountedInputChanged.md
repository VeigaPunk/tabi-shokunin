# MutCountedInputChanged — round-16 wave 2 (FALSIFY), gate reason `counted_input_changed`

Seat: `TabiR16.MutCountedInputChanged` (reviewer, leaf). Author-side report; this is not a non-author certification.
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3` + counter repair).
Blobs at that snapshot: gate `scripts/check-measurement-binding.mjs` sha256 `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb`; selftest `scripts/selftest-measurement-binding.mjs` sha256 `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae`; counter `.ufo/waves/round-16/measure.mjs` sha256 `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9`.
Lane writes: only this file. All mutation was done under `/tmp/tabi-r16-mutcounted-input` (kept so every run can be repeated); `/tmp/tabi-mut-fixture-*` are fixture repos.
Tools installed: none.
Node used: `v24.21.0`.

## Verdict: **BREAKS**

A **weakening of only the emission** survives both oracles. Two one-line weakens of `scripts/check-measurement-binding.mjs:498` leave the selftest at `verdict=clean cases=43` and the C1 counter at **1**, while the gate certifies a manifest with drifted declared inputs as `verdict=clean … bound=N`.

Sub-result for the ticket's literal alternative (disable the emission outright): **HOLDS — the mutant is killed.** Selftest exit 1 with 3 FAIL cases; the counter returns `c1_binding_contracts: 0` with four named failures. Details below.

So: deletion is caught; weakening is not. The counter header's claim that the gate is "BEHAVIOURALLY enforced — receipts are not trusted" (`measure.mjs:15`) holds against removal of the emitter and **fails against narrowing its condition**.

| Mutant | one-line change (gate:496-499) | selftest | C1 counter |
|---|---|---|---|
| M1 disable | `add(REASON.countedInputChanged, …)` deleted | **exit 1, 3 FAIL** | **0** — `["selftest exit 1","selftest summary absent, not clean, or case count mismatch","3 case lines not exact PASS","vocabulary not exercised: counted_input_changed"]` |
| M2 precision | `diffInputs` drops `counterPath` | exit 1, 4 FAIL | not run; see M2 below |
| M3 weaken | condition becomes `changed.length > 0 && id !== 'C2'` | **clean, 43/43** | **1**, `failures: []` |
| M4 weaken | condition becomes `changed.length > 0 && changed.length <= 1` | **clean, 43/43** | **1**, `failures: []` |

M3/M4 are the survivors. They are not cosmetic: both make the gate print `MEASUREMENT_BINDING verdict=clean` on manifests whose declared counted inputs moved between `measuredRevision` and `REV` (see *Behaviour on real drift*).

## Setup (exact)

```
D=/tmp/tabi-r16-mutcounted-input; rm -rf "$D"; mkdir -p "$D"/honest "$D"/m1 "$D"/m2 "$D"/m3
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
cp scripts/check-measurement-binding.mjs scripts/selftest-measurement-binding.mjs "$D/honest/"
sha256sum scripts/check-measurement-binding.mjs "$D/honest/check-measurement-binding.mjs"
# 5150611c… both
# M4 was copied later: mkdir -p "$D"/m4; cp "$D"/honest/*.mjs "$D"/m4/
```
Honest control, tmp copies, exact `--gate` form the selftest documents:
```
$ cd $D/honest && node selftest-measurement-binding.mjs --gate "$PWD/check-measurement-binding.mjs"; echo EXIT=$?
case=legacy_r15_shape_digest_mismatch_control expected_exit=1 … PASS
case=rev_injection_inert expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
EXIT=0
```
Counter control at the snapshot (fresh `git clone --no-hardlinks` of the lane into `$D/clone2`; ROOT is derived from the counter's own location so the clone's counter is used):
```
$ cd $D/clone2 && node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1; echo EXIT=$?
{"revision":"b444ca8e024f386124418169e8e400221524bba3","c1_binding_contracts":1,…,"selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},"legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70ee114347a79abb91cacab6c63044ce36"},"failures":[]…}
EXIT=0
```

## Mutants (each is the honest blob plus exactly one changed line)

```
# M1  sha256 023d497906d308c46e2473b31b9fb184c22cce2014ea562d069979a96d48585f
@@ -496,7 +496,7 @@
   const diffInputs = [...new Set([...inputs, counterPath])];
   const changed = diffNames(repo, measured, atRev, diffInputs);
   if (changed.length > 0) {
-    add(REASON.countedInputChanged, `paths=${changed.join(',')}`);
+    // MUTANT M1: counted_input_changed emission disabled.
   }

# M2  sha256 d560d34b45f3bc68e77d4122e19aebe6f07106326f2f5d11e257f4c3e7be317c
-  const diffInputs = [...new Set([...inputs, counterPath])];
+  const diffInputs = [...new Set([...inputs])];

# M3  sha256 5f5038aabc2124b73ba48faf115ab6d95c7a4cb8ff1fe4b1bf34770bf4368edc
-  if (changed.length > 0) {
+  if (changed.length > 0 && id !== 'C2') {

# M4  sha256 0648af3d5625b40ee4e33cac3e15de83836a37ad0514e15f40d936b77a4dd604
-  if (changed.length > 0) {
+  if (changed.length > 0 && changed.length <= 1) {
```
(`id` is `claim.id`, defined at gate:452; `changed` is the NUL-split `git diff --name-only measuredRevision REV -- <countedInputs + counter.path>` result at gate:497/315.)

## Observed: selftest

Command template (identical for every mutant):
```
cd /tmp/tabi-r16-mutcounted-input/<m> && node --check check-measurement-binding.mjs \
  && node selftest-measurement-binding.mjs --gate "$PWD/check-measurement-binding.mjs"; echo EXIT=$?
```

**M1** — `EXIT=1`; `MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13`; 3 FAIL lines, verbatim:
```
case=counter_digest_mismatch expected_exit=1 actual_exit=1 expected_reasons=counter_digest_mismatch,counted_input_changed actual_reasons=counter_digest_mismatch FAIL
case=counter_changed_since_measurement expected_exit=1 actual_exit=1 expected_reasons=counter_changed_since_measurement,counted_input_changed actual_reasons=counter_changed_since_measurement FAIL
case=counted_input_changed expected_exit=1 actual_exit=0 expected_reasons=counted_input_changed actual_reasons=- FAIL
```
FAIL_DETAIL for the third: `MEASUREMENT_BINDING verdict=clean claims=1 bound=1`. The paired positive controls (`…_control`, the same fixture unmutated) all stay PASS, so the red is the mutation and not fixture noise. **Mutant killed.**

**M2** — `EXIT=1`; 4 FAIL lines:
```
case=counter_digest_mismatch … expected_reasons=counter_digest_mismatch,counted_input_changed actual_reasons=counter_digest_mismatch FAIL
case=counter_changed_since_measurement … expected_reasons=counter_changed_since_measurement,counted_input_changed actual_reasons=counter_changed_since_measurement FAIL
case=counted_inputs_undeclared expected_exit=1 actual_exit=1 expected_reasons=counted_inputs_undeclared actual_reasons=counted_input_changed,counted_inputs_undeclared FAIL
case=multi_claim_inputs_undeclared expected_exit=1 actual_exit=1 expected_reasons=counted_inputs_undeclared actual_reasons=counted_input_changed,counted_inputs_undeclared FAIL
```
The first two kills are the intended ones: the fixture pair asserts that a **counter-blob** change also yields `counted_input_changed` (selftest:239-247). The last two are an accidental side effect, not a semantic catch: with `inputs` empty and `counterPath` dropped, `diffNames` receives an empty pathspec and git widens to a whole-tree diff — the over-reported path is the manifest itself (`detail=paths=corpus/evidence/round-16/measurement-binding.json`). See secondary observation 2.

**M3** — `EXIT=0`; `verdict=clean cases=43 reasons=13`; zero FAIL lines.
**M4** — `EXIT=0`; `verdict=clean cases=43 reasons=13`; zero FAIL lines.

## Observed: C1 counter (`.ufo/waves/round-16/measure.mjs`)

Each mutant was committed on its own branch of a fresh clone, then counted exactly as the C1 receipt does:
```
$ cd $D/repo  && node .ufo/waves/round-16/measure.mjs 1370a6d6e236403426f879a2e16170370eaa34b7 --claim C1; echo EXIT=$?
{"revision":"1370a6d6e236403426f879a2e16170370eaa34b7","c1_binding_contracts":0,"gateSha256":"023d497906d308c46e2473b31b9fb184c22cce2014ea562d069979a96d48585f","selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae","selftest":{"exit":1,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13","bad":3,"clean":21,"missingVocab":["counted_input_changed"]},"legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70ee114347a79abb91cacab6c63044ce36"},"failures":["selftest exit 1","selftest summary absent, not clean, or case count mismatch","3 case lines not exact PASS","vocabulary not exercised: counted_input_changed"],"counterBlobAtRevisionSha256":"bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9","inputsRead":["corpus/evidence/round-15/measurements.json","scripts/check-measurement-binding.mjs","scripts/selftest-measurement-binding.mjs"]}
EXIT=0
```
So for M1 the counter **counts 0**, through exactly four checks (measure.mjs:152-160): `selftest exit 1`; summary not `clean`; `bad=3` case lines; `missingVocab=["counted_input_changed"]`. The `countField` result is 0 because `failures` is non-empty; the legacy leg still passes and contributes nothing (see below). Exit 0 with a value of 0 is the documented "counted" path, not a could-not-evaluate.

```
$ cd $D/clone3 && node .ufo/waves/round-16/measure.mjs 0786b36566d80f8d7cf0e61de6a0397ec0ccfcb9 --claim C1; echo EXIT=$?
{"revision":"0786b36566d80f8d7cf0e61de6a0397ec0ccfcb9","c1_binding_contracts":1,"gateSha256":"5f5038aabc2124b73ba48faf115ab6d95c7a4cb8ff1fe4b1bf34770bf4368edc",…,"selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},"legacy":{"exit":1,"findings":{…},"at":"36240c70ee114347a79abb91cacab6c63044ce36"},"failures":[]…}
EXIT=0
```
```
$ cd $D/clone4 && node .ufo/waves/round-16/measure.mjs ccc5cac512de9bd5f749abfe7e1442af67cf194d --claim C1; echo EXIT=$?
{"revision":"ccc5cac512de9bd5f749abfe7e1442af67cf194d","c1_binding_contracts":1,"gateSha256":"0648af3d5625b40ee4e33cac3e15de83836a37ad0514e15f40d936b77a4dd604",…,"selftest":{"exit":0,…, "bad":0,"clean":21,"missingVocab":[]},…,"failures":[]…}
EXIT=0
```
**M3 and M4 are not caught by any counter leg.** The counter's vocabulary check (measure.mjs:150) sees actual reasons of PASS lines; with the fixture outcomes unchanged there is nothing to see. Its real-history leg (measure.mjs:71-74 `LEGACY_EXPECTED`, run at `--at 36240c7…`) expects only digest/undeclared/changed-since reasons for C1 and C2 — `counted_input_changed` is absent from both expected sets, so that leg cannot observe this reason at all. The only oracle for `counted_input_changed` is the selftest transcript.

## Observed: behaviour on real drift (gate-level counterexamples)

Fixture A — two claims, each declaring one counted input, **both** drifted between `measuredRevision` and `HEAD` (`/tmp/tabi-mut-fixture-mr9nw3`; driver `/tmp/tabi-r16-mutcounted-input/drive.mjs`):
```
GATE=honest exit=1
  MEASUREMENT_BINDING verdict=failed claims=2 bound=0
  finding claim=C1 reason=counted_input_changed detail=paths=c1-input.txt
  finding claim=C2 reason=counted_input_changed detail=paths=corpus/SOURCES.md
GATE=M1_emission_disabled exit=0
  MEASUREMENT_BINDING verdict=clean claims=2 bound=2
GATE=M2_counterpath_dropped exit=1
  finding claim=C1 reason=counted_input_changed detail=paths=c1-input.txt
  finding claim=C2 reason=counted_input_changed detail=paths=corpus/SOURCES.md
GATE=M3_C2_suppressed exit=1
  MEASUREMENT_BINDING verdict=failed claims=2 bound=1
  finding claim=C1 reason=counted_input_changed detail=paths=c1-input.txt
```
Fixture B — **one** claim (`C2`) declaring **two** counted inputs, both drifted (`/tmp/tabi-mut-fixture2-mIZYdB`; driver `drive2.mjs`):
```
GATE=honest exit=1
  MEASUREMENT_BINDING verdict=failed claims=1 bound=0
  finding claim=C2 reason=counted_input_changed detail=paths=corpus/README.md,corpus/SOURCES.md
GATE=M4_singlepath_only exit=0
  MEASUREMENT_BINDING verdict=clean claims=1 bound=1
```
These are the two counterexamples the selftest never produces: drift under a non-C1 claim, and drift spanning more than one path.

## Why the fixture set cannot catch M3/M4

- Base claim id is hard-coded `C1` (`selftest:93-94`); `cleanShape` (`selftest:145`) adds no further claims. The only `C2` claim built in `--check` mode is `multi_claim_inputs_undeclared`, whose `countedInputs` is `[]` and which has **no drift** — its diff pathspec is the unchanged counter path only, so `counted_input_changed` is not expected and, with the honest gate, does not fire.
- Every fixture drifts **at most one path** in the diff window: `counted/input.txt` (`counted_input_changed`, selftest:252-254) or `measure.mjs` (the two digest pair cases, selftest:239-247). No fixture drifts two declared inputs in one claim.
- `exercised` is populated from `c.expectedReasons`, not from observed reasons (`selftest:409`). The selftest's own `reasons=13` summary is therefore expectation-derived and prints 13 even for M1, where `counted_input_changed` is never observed. Only the counter's `missingVocab` (`measure.mjs:150`) reads observed reasons, and only M1 changes a PASS line.
- `LEGACY_EXPECTED` (`measure.mjs:71-74`) contains no `counted_input_changed`, so the real-history leg provides no second net.

[INFERENCE] On the real manifest, C1 declares 3 counted inputs (`corpus/evidence/round-15/measurements.json`, gate, selftest) and C2 declares 6. A repair that rewrites two of C1's three counted inputs (e.g. gate + selftest in one commit) produces exactly two drifted paths, which an M4-shaped condition would suppress entirely — the manifest would be certified with 2/3 of its C1 inputs moved.

## Secondary observations (outside the mutation verdict)

1. **The round-16 manifest is untracked and absent from the snapshot.** `git status --short` at the lane → `?? corpus/evidence/round-16/measurement-binding.json`; `git ls-tree -r --name-only b444ca8 | grep -c measurement-binding.json` → `0`. The C1 counter never reads it (the M1 run's `inputsRead` is `corpus/evidence/round-15/measurements.json`, gate, selftest), so C1=1 at the snapshot is unaffected — but no committed artifact at `b444ca8` declares the round-16 binding, `--check` cannot be re-run from a clone, and the counter certifies the instrument, not this round's own binding.
2. **`diffNames` widens to a whole-tree diff on an empty pathspec.** Gate:313-320 passes `--` followed by `...paths`; with `paths=[]` git diffs everything. The honest build is shielded only by the unconditional `counterPath` in `diffInputs` (gate:496). M2 exposed this (over-reported path = the manifest). Not reachable at `b444ca8`; it is a latent coupling that any future edit dropping `counterPath` would trigger.
3. **Reproducibility.** Full transcripts: `/tmp/tabi-r16-mutcounted-input/{honest,m1,m2,m3,m4}.{out,err}`; fixture repos `/tmp/tabi-mut-fixture-mr9nw3` and `/tmp/tabi-mut-fixture2-mIZYdB`; mutant commits in `/tmp/tabi-r16-mutcounted-input/{repo,clone3,clone4}` → `1370a6d6…` (M1), `0786b365…` (M3), `ccc5cac5…` (M4). The lane was not modified; the clones were made with `git clone --no-hardlinks` and the counter was run from the clone root so ROOT resolved there.

## Verification gaps

- The honest selftest was run from byte-identical tmp copies, not from the lane path; the sha256 equality of the copies with the lane blobs is shown above. I did not execute the selftest in the lane (lane is read-only for me and the tmp copy is sufficient).
- `--reproduce` was not exercised on the mutants: M1/M3/M4 touch only finding emission, and the gate's reproduction block is guarded by `findings.length === 0` (gate:509) and the counter digest checks, none of which these mutants alter. I did not run an end-to-end `--reproduce` fixture (the counter is a `process.exit` stub in my fixtures), so reproduction behaviour is untouched rather than proven.
- I probed four mutations of the emission site; I did not exhaust the space (e.g. suppression keyed on claim axis, path prefix, or revision distance). The two survivors found are sufficient to falsify the universal claim, and I did not enumerate further.
