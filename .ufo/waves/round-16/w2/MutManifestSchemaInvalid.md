# MutManifestSchemaInvalid — mutation probe of gate reason `manifest_schema_invalid`

Seat: `TabiR16.MutManifestSchemaInvalid` (round-16 wave 2, FALSIFY lane).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD `b444ca8e024f386124418169e8e400221524bba3`.
Target artifacts (bytes at HEAD, verified equal to `git cat-file blob HEAD:<path>`):

```
5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb  scripts/check-measurement-binding.mjs
8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae  scripts/selftest-measurement-binding.mjs
```

Node `v24.21.0`. No tool installs were needed or performed. The lane was read-only
throughout; every mutant, fixture and counter run lives under `/tmp/mut-msi-6XRy1G`
(scratch dir, deleted by the OS; key outputs are quoted below).

## Verdict

**BREAKS.** The selftest kills a mutation that disables the whole refusal path, but it does
**not** kill the mutation that removes the schema-name predicate itself — the code that
defines the `manifest_schema_invalid` reason. With that predicate deleted the selftest stays
`verdict=clean cases=43 reasons=13`, the C1 counter still reports `c1_binding_contracts: 1`,
and the gate accepts a manifest whose `schema` string is forged as long as the remaining
fields are well-formed. The legacy (`tabi-round15-measurements-v1`) schema predicate is not
exercised by any selftest case at all.

## Method

Four mutants, each a copy of the lane gate edited in `/tmp` (never in the lane), diffed
against the unmodified copy:

| # | Mutation (only this hunk) | Diff |
|---|---|---|
| A | `manifestProblemsEarly` no longer refuses: `if (problems.length > 0) return;` | gate:548-552 |
| B | `loadJson` no longer refuses invalid JSON: `catch { return {}; }` | gate:328-332 |
| C | v1 `if (manifest.schema !== SCHEMA) problems.push(...)` block deleted | gate:339-342 |
| D | legacy `if (manifest.schema !== LEGACY_SCHEMA) problems.push(...)` block deleted | gate:563-566 |

Selftest run per mutant:

```
cd <mutant-dir> && node <mutant-dir>/selftest-measurement-binding.mjs --gate <mutant-dir>/check-measurement-binding.mjs
```

Baseline control (unmodified copies in `/tmp/.../base`):

```
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13   (exit 0)
```

## Results

| Mutant | Selftest | Mutant killed? | C1 counter (`--claim C1`) |
|---|---|---|---|
| A — whole refusal disabled | `verdict=failed cases=43`; one FAIL: `case=manifest_schema_invalid expected_exit=2 actual_exit=0 expected_reasons=manifest_schema_invalid actual_reasons=- FAIL`; detail `MEASUREMENT_BINDING verdict=clean claims=0 bound=0` | yes | **0** — `failures: ["selftest exit 1","selftest summary absent, not clean, or case count mismatch","1 case lines not exact PASS"]` |
| B — invalid-JSON refusal deferred | `verdict=clean cases=43 reasons=13` | no (equivalent at the reasons/exit contract; detail text changes only) | **1** — `failures: []` |
| C — v1 schema-name predicate deleted | `verdict=clean cases=43 reasons=13` | **no** | **1** — `failures: []` |
| D — legacy schema-name predicate deleted | `verdict=clean cases=43 reasons=13` | **no** | **1** — `failures: []` |

Counter runs were made against a full `cp -a` copy of the lane at `/tmp/mut-msi-6XRy1G/repo`,
with each mutant committed there (local identity, gpgsign off), so the counter read real
gate/selftest blobs at the mutant revision and ran its own legacy oracle against the copied
history:

```
C0 unmutated b444ca8e…                        c1_binding_contracts: 1  selftest 43/43  failures []
MC mutant C  25b63c3596686abc5277b68d5073f10cdf96b215  c1_binding_contracts: 1  failures []
MD mutant D  ab725ad337d47300c9bc675ea2cc7b6cf92f8abe  c1_binding_contracts: 1  failures []
MB mutant B  9c3dc96131c9dbc61b7793002f78d4305bc78821  c1_binding_contracts: 1  failures []
MA mutant A  ad0bf3463e4acc7148dd3b3878172df476d94e81  c1_binding_contracts: 0  failures [selftest exit 1, …]
```

Example full line (mutant C):

```json
{"revision":"25b63c3596686abc5277b68d5073f10cdf96b215","c1_binding_contracts":1,
 "gateSha256":"7420bd9b891e78d7261c6f8d2b0289ca10010f56a4f79ff4677ffd597152ece4",
 "selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13",
             "bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],
                                "C2":["counted_inputs_undeclared","counter_digest_mismatch"]},
           "at":"36240c70ee114347a79abb91cacab6c63044ce36"},
 "failures":[]}
```

## Semantic consequence of the surviving mutants (real manifests)

Fixtures: the lane's own `corpus/evidence/round-16/measurement-binding.json` and
`corpus/evidence/round-15/measurements.json`, copied to `/tmp` and changed **only** at the
`schema` string (correct copies kept as controls). Gate invoked with `--repo <lane>` (read-only
git plumbing):

```
P1 baseline, v1 correct schema          rc=0  MEASUREMENT_BINDING verdict=clean claims=2 bound=2
P2 baseline, v1 forged schema           rc=2  finding claim=- reason=manifest_schema_invalid
                                              detail=… schema is "tabi-measurement-binding-v0-forged" not tabi-measurement-binding-v1
P3 mutant C, v1 forged schema           rc=0  MEASUREMENT_BINDING verdict=clean claims=2 bound=2
P4 baseline, legacy correct schema      rc=1  C1 {counted_inputs_undeclared, counter_changed_since_measurement,
                                              counter_digest_unrecorded}  C2 {counted_inputs_undeclared, counter_digest_mismatch}
P5 baseline, legacy forged schema       rc=2  finding claim=- reason=manifest_schema_invalid
P6 mutant D, legacy forged schema       rc=1  identical finding set to P4 (schema refusal erased)
```

P3 is the defect in one line: a manifest with a non-matching `schema` string is bound
`claims=2 bound=2` and reported clean.

## Root cause

The selftest's only v1 schema fixture is `{ "schema": "tabi-other-v1", "claims": [] }`
(`selftest-measurement-binding.mjs:280-285`). That object is defective in four ways, and the
reason it asserts is produced by the non-schema defects:

```
$ printf '{ "schema": "tabi-measurement-binding-v1", "claims": [] }\n' > /tmp/…/nonminimal.json
$ node <base>/check-measurement-binding.mjs --check /tmp/…/nonminimal.json --repo <lane>
rc=2
MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0
finding claim=- reason=manifest_schema_invalid detail=…: round is not an integer
```

So the case passes for the wrong reason and cannot distinguish "schema name enforced" from
"schema name ignored". Supporting details:

- `manifest_malformed_json` (`:290-292`) also expects `manifest_schema_invalid`, via the
  `loadJson` refusal; that keeps `reasons=13` and `missingVocab=[]` satisfied even when the
  v1 schema predicate is dead, so the counter's vocabulary gate cannot see the loss.
- `--legacy` mode has **no** case expecting `manifest_schema_invalid`:
  `grep -n manifest_schema_invalid selftest-measurement-binding.mjs` → `280, 285, 292` only,
  all v1-mode `--check`. Mutant D therefore has zero coverage, and the counter's legacy oracle
  uses the real round-15 manifest, which carries the correct schema string, so it cannot fire
  the predicate either.

## Severity

Operability claim C1 is "the measurement-binding gate is behaviourally enforced". The
behavioural enforcement demonstrated here is real for the refusal plumbing (mutant A is
killed) but not for the schema-name predicate or the legacy schema predicate: a gate build
that reports clean on a forged-schema manifest still earns `c1_binding_contracts: 1`. That is
a coverage gap in the exact reason this probe was assigned, not an entire failure of C1.

## Suggested minimal repair (recommendation only; no lane edits made)

1. Replace the v1 schema fixture with a clean-shape manifest whose only defect is the
   `schema` string (the shape of P2), expecting exit 2 / `manifest_schema_invalid`. The
   selftest's `cleanShape` already gives the positive control.
2. Add the legacy analogue: `legacyShape` with `schema` rewritten, `--legacy`, expecting
   exit 2 / `manifest_schema_invalid`.
3. Optionally assert the `detail` discriminator (`invalid JSON` vs `schema is …`) so mutant B
   is also pinned; today B survives with identical exit class and reason.

## Residual risk and verification gaps

- Mutant B (invalid JSON handled downstream) survives but preserves the documented contract
  (exit 2 + `manifest_schema_invalid`); its only observable change is the `detail` text. I do
  not count it as contract-breaking, but the detail wording is unpinned.
- I probed `--check`/`--legacy` refusal semantics and the selftest/counter; I did not mutate
  the `--reproduce` arm, `--self-test` relay, or `--reasons` surface, and did not mutate the
  per-claim findings (out of scope for this ticket).
- Counter runs used a byte-identical `/tmp` copy of the lane (7.3 MB `.git`, same commit
  history); the lane itself was never written. `git status --porcelain` in the lane before and
  after showed only the pre-existing untracked `.ufo/waves/round-16/w2/` and
  `corpus/evidence/round-16/measurement-binding.json`.
