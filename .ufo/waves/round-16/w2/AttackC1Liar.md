# AttackC1Liar — round-16 wave 2 (FALSIFY), C1 counter

Seat: TabiR16.AttackC1Liar (critic, leaf). Author-side report; this is not a non-author certification.
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3`. Counter blob `.ufo/waves/round-16/measure.mjs` sha256 `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9`. The worktree file and `HEAD:` blob match, and the clone used the same counter unmodified.
Lane writes: only this file. All mutation was done in `/tmp/tabi-r16-c1liar-93NO` (a clone with three liar branches, kept so the runs can be repeated).
Tools installed: none.

## Verdict: **BREAKS**

A committed **LIAR** gate and selftest still get `c1_binding_contracts: 1` from the unmodified C1 counter. The liar gate checks nothing and always prints the same round-15 findings; the liar selftest never runs the gate and prints a scripted all-PASS transcript.

The header promises "BEHAVIOURALLY enforced — receipts are not trusted" (measure.mjs:14-15). Neither of its two behavioural legs proves that.
- **Leg 2 (selftest):** the selftest's stdout is a self-reported receipt that the REV author writes. The counter parses it but never checks that the selftest actually ran the gate.
- **Leg 3 (legacy oracle):** this is a single fixed input with one expected output, so a constant printer can match it.

## Setup (exact)

```
D=$(mktemp -d /tmp/tabi-r16-c1liar-XXXX)      # -> /tmp/tabi-r16-c1liar-93NO
git clone -q /home/vgpnk/Projects/shokunin/tabi-shokunin $D/repo   # HEAD b444ca8e…
```

Liar blobs (full text in `$D/liar/`):
- `selftest.mjs`: performs no checks and never spawns the gate. It prints 13 lines `case=liar_<r> expected_exit=1 actual_exit=1 expected_reasons=<r> actual_reasons=<r> PASS`, one for each VOCAB reason, then 13 clean lines `… expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS`, then `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=26 reasons=13`.
- `gate.mjs`: reads no files and runs no git. If argv contains `--legacy` it prints the 5 constant `finding claim=… reason=… detail=x` lines and exits 1. Otherwise it prints a green line and exits 0.

Each variant is one commit on top of b444ca8 in the clone. Each was then counted with:
`node .ufo/waves/round-16/measure.mjs HEAD --claim C1` (run in `$D/repo`; ROOT is resolved from the file's own location, so it uses the clone).

## Observed outcomes

| Variant | commit (clone) | gate sha256 | selftest sha256 | C1 count | failures |
|---|---|---|---|---|---|
| baseline (lane) b444ca8 | b444ca8e… | 5150611c3d59… | 8c5426f254b7… | **1** | `[]` |
| V1 full liar: liar selftest + liar gate | 9ecfcc91… | fa1e12e17b03… | 3c92359883994e… | **1** | `[]` |
| V2 liar gate + real selftest | 0754e448… | fa1e12e17b03… | 8c5426f254b7… | 0 | selftest exit 1, 21 bad lines, 9 vocab missing |
| V3 liar selftest + real gate | 7b497d15… | 5150611c3d59… | 3c92359883994e… | **1** | `[]` |

V1 stdout (verbatim; `inputsRead` dropped):
```
{"revision":"9ecfcc911ce204d3a5b548a37819f01b0c640c10","c1_binding_contracts":1,"gateSha256":"fa1e12e17b03130074bc9c84540aac358a524db5f5f26e2ca3596bcf84624eaf","selftestSha256":"3c92359883994e26550c863fb2809e935af36c13a55294b0e5dc68fcf36b187f","selftest":{"exit":0,"cases":26,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=26 reasons=13","bad":0,"clean":13,"missingVocab":[]},"legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70ee114347a79abb91cacab6c63044ce36"},"failures":[],"counterBlobAtRevisionSha256":"bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9"}
measure_exit=0
```

V2 stdout (start): `{"revision":"0754e448…","c1_binding_contracts":0,…,"selftest":{"exit":1,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13","bad":21,"clean":21,"missingVocab":["measured_revision_not_ancestor","counted_input_changed","argv_unsupported","counter_failed","count_not_reproduced","manifest_unreadable","manifest_schema_invalid","revision_unresolved","git_failed"]},"legacy":{"exit":1,"findings":{…the expected set…}}…`
The honest selftest does catch a liar gate. But the liar gate passes the legacy oracle exactly, so leg 3 adds nothing against a constant liar.

The bar the liar has to clear is fixed by counter code, not by real behaviour (measure.mjs:136-157, 159-172):
- each line matches `caseRe` and is PASS with exp == act;
- the summary matches its regex;
- all 13 VOCAB reasons appear;
- there is at least one clean case;
- there are at least 26 cases;
- the `--legacy` exit code and `finding` lines match `LEGACY_EXPECTED`.

All of these are satisfied by `process.stdout.write` alone.

## Strongest counterexample

V1 is the counterexample: two committed blobs with zero checking logic, 1295 lines deleted (`git diff --stat b444ca8 v1-full-liar`: 2 files, +20 −1295), and C1 still counts 1. The 0→1 delta measured at b444ca8 therefore tells you only that two blobs exist and the selftest prints a matching transcript. It does not show the gate enforces anything. The counter value for the real b444ca8 and for V1 is identical.

## Impacted axes

- **C1 operability (counter validity):** the counter cannot distinguish a working gate from a liar.
- **Provenance:** "receipts are not trusted" is false. The selftest transcript is a receipt the REV author controls.
- **Premature saturation:** C1=1 is reached without any discriminating evidence.

The real b444ca8 gate does behave honestly on the probes below. The defect is in the counter's ability to tell, not (as far as these probes show) in the gate.

## Smallest safe correction (feasibility probed)

1. **Counter-owned differential legacy probes.** In addition to the single fixed oracle, the counter should mutate inputs itself and require each finding set to change as the spec predicts. Probed in `$D` with `env -i PATH HOME`. Each command was `node <gate> --legacy <json> --at <rev> --repo <lane>`. "Lane" means `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
   - **Probe A: `--at 27dfd98bd6bb…`** (the C1 counterCodeRevision).
     - Real gate: C1 {counted_inputs_undeclared, counter_digest_unrecorded}, C2 {counted_inputs_undeclared, counter_changed_since_measurement, counter_digest_mismatch}, exit 1. C1 drift disappears.
     - Liar gate: the same constant 5 findings.
   - **Probe B: r15 json with `C1.counterSha256=3ee59de0…`** (the blob at measuredRevision), `--at 36240c7…`.
     - Real gate: C1 {counted_inputs_undeclared, counter_changed_since_measurement}, C2 unchanged. `counter_digest_unrecorded` disappears and no mismatch appears.
     - Liar gate: the same constant 5 findings.

   These probes kill V1 and every constant-output liar. A liar that branches on argv can still beat a finite probe set; probes raise the cost but are not a proof.
2. **Selftest discrimination check.** The counter runs the REV selftest a second time with the gate blob replaced by a counter-owned stub (for example the constant liar above, or `exit 0`). It requires that run to come out **not** clean. V2 shows the honest selftest goes red, with 21 bad lines. V1 and V3 show the liar selftest stays green. So this check rejects V1 and V3 without changing the honest baseline.
3. **Robust option.** Pin `gateSha256` and `selftestSha256` in the counter after non-author review, or move the vocabulary cases into counter-owned fixtures so the REV author no longer writes the oracle. Only this removes adaptive-liar headroom.

Corrections 1 and 2 are each a few lines in `countC1` and add no new authority. Neither was implemented: this seat is read-only.

## Side note (not mine)

The lane worktree contains an untracked `corpus/evidence/round-16/measurement-binding.json` that this seat did not create. It is listed by `git status --short` at lane root alongside `.ufo/waves/round-16/w2/`. HEAD is still b444ca8.
