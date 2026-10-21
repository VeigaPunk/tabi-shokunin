# ConnNoHarm — new-only gate/note vs retained producer, counters, evidence, lessons

Read-only connector seat. Question: compare the planned new-only round-22 gate
(`.ufo/waves/round-22/measure-c1.mjs`, `corpus/evidence/round-22/semantic-expectations.json`)
and note (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`) against the retained
round-21 producer/counters/evidence/lessons, and enumerate the no-harm byte-prefix and
frozen-evidence checks L1 must retain — not merely green exit codes.

Nothing here is a production edit, test run, or judgment of C1. No subagent, service,
network, browser, REA, credentials, installs or VCS mutation. One read-only census command
(`node .ufo/waves/round-20/counts.mjs 5f58577…`) was executed to confirm the baseline
values quoted below; no gate/selftest/producer was executed.

Landing observation at inspection time: `.ufo/waves/round-22/measure-c1.mjs`,
`selftest-c1.mjs`, `check-review-chronology.mjs`, `fixtures/expected.json`,
`debt-expectations.json` and `corpus/evidence/round-22/semantic-expectations.json` did not
yet exist in the lane, and `corpus/lessons/round-22.md` was absent while `corpus/QUALITY.md`
already cited it. This report therefore compares the contract/planned shape and the retained
bytes; the items in sections 1–3 are the checks L1 must apply to whatever bytes land.

## Axes in play

- **depth** — C1 is 12 semantically checked rows over retained round-21 bytes.
- **operability** — the new gate must be re-runnable, full-hash, shell-free, with 0/1/2 exits.
- **calibration** — the frozen structural counter must still read 12; the new instrument
  must read 0 at the round-22 baseline and 12 at the measured revision, with no double count.
- **no-harm** — every pre-existing byte that the round-21 claim depends on must be provably
  unchanged, and the historical binding must not be re-pointed at the new revision.

## Verdict

The new-only layout is no-harm-compatible **only if L1 adds six enforcement classes that
`.ufo/waves/round-22/run-checks.py` does not currently perform**:

1. consume `preservation-baseline.json` (356 blob/mode pins) and expand its scope;
2. enforce an exact diff allowlist with zero deletions and zero clones;
3. enforce byte-prefix for the six frozen-gate `APPEND_ONLY` docs and the S101-cell-only
   `corpus/SOURCES.md` mutation;
4. reproduce the **round-21 binding at its measured revision only** (never at the new tip);
5. assert the new oracle's negative/refusal arms and selftest finding coverage, not just
   `--selftest` exit 0;
6. classify the **actual retained W2 chronology input**, not only its synthetic selftest.

One non-obvious move: **treat revision boundaries as first-class evidence.** The same file
can be "green" or "failed" depending on the `--at` revision. The round-21 binding *must*
fail `counted_input_changed` at the round-22 tip once `SKILL.md`/`corpus/SOURCES.md` are
appended; that is correct history, not a regression. L1 should therefore keep two separate
proofs: old binding at `2d5eaaa`/`ab73abe`, new binding at `R22M`/`R22D`. A naive single-tip
rerun either hides the dependency change or rewrites the old manifest.

## Planned new-only surfaces vs retained surfaces

Baseline `BASE = 5f585773258b33d2d514b00cd0b0775333578db6`. All digests are sha256 of the
Git blob at `BASE`, computed independently with `git show BASE:<path> | sha256sum`.

| New-only path (A) | Retained path it must not replace | Retained digest |
|---|---|---|
| `.ufo/waves/round-22/measure-c1.mjs` | `.ufo/waves/round-21/measure-c1.mjs` (frozen structural counter) | `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb` |
| `.ufo/waves/round-22/selftest-c1.mjs` | `.ufo/waves/round-21/selftest-c1.mjs` | `1fa3d8278e4b74ef4fd4e886dbf551a21c16de663e490709030247b3fd29c953` |
| `.ufo/waves/round-22/fixtures/expected.json` | `.ufo/waves/round-21/fixtures/expected.json` | `37cc2995fd0ca24f445439e7716ebf8d0daba514745f5ab3738603a21d918eec` |
| `.ufo/waves/round-22/check-review-chronology.mjs`, `debt-expectations.json` | no predecessor file exists; round-21 W2 returns/closure are inputs, never rewritten | `.ufo/waves/round-21/w2-returns.json`, `w2-task-result.json` pinned by preservation |
| `corpus/evidence/round-22/semantic-expectations.json` | `corpus/evidence/round-21/{runtime/,measurements.json,selftest-c1.json}` | runtime receipt `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`; measurements `be099153…`; selftest receipt `d7d876ce…` |
| `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (A) | `…round-21.md` and `…round-21-corrected.md` | `8c9be28c7becea24b8ea588f54d8962af3ea665f479d98eb4b984bc6b7215d2c` and `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4` |
| `.ufo/waves/round-22/measurement-binding.json` (if used) | `.ufo/waves/round-21/measurement-binding.json` | `d8d08d3bf27a2d8681c7172f989f5803c4a0a6d4f71bee94c18ae036bc1a7829` |

Additional frozen identity pins:

| Path | sha256 at BASE |
|---|---|
| `.ufo/waves/round-21/run-checks.py` | `4ed74c8e3982e780e0950d0ea829bbc167fa7cc49197745243843dda0fc6135b` |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` |
| `.ufo/waves/round-21/source-opening.json` | `d14acf47215e3411d3b0b136fe28aa140bddc9dde76a5c054c19c9f45ef9a0cd` |
| `.ufo/waves/round-21/sources/html_form_element.cc` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| `.ufo/waves/round-21/sources/html_form_element.cc.base64.gz` | `46966f0544d0d9628cd6d3823b1898fe224116a80aaff2e24a5b38da34281e52` |
| `.ufo/waves/round-21/fixtures/positive-ordered.json` | `aa3726264f2a4f883855aecbce0fec15dcc3d597e6e19ec943fcfe78817f8e75` |
| `.ufo/waves/round-21/fixtures/source-carrier.gz` | `46966f0544d0d9628cd6d3823b1898fe224116a80aaff2e24a5b38da34281e52` |
| `.ufo/waves/round-21/final/semantic-contrast-witness.json` | `b58dd7726c4648e6fe97e847de4923b45b7ca8ee29259fa23ea75325b3a96cbd` |
| `.ufo/waves/round-19/final/harm-at-measured.json` (cohort) | `dc947014d18e9495ea85f226bf9dca1636459b26452d1843a8ee5ea4046e1551` |
| `.ufo/waves/round-20/counts.mjs` | `fec9a31eadbed3b43f75250a6033d53633601c308d01ff56ee66b59a4711df79` |
| `.ufo/waves/round-20/measure-c1.mjs` | `19921191fad84ba79414188e1a7b1bc05acdb491b1e6052ed5b70454864f7945` |
| `.ufo/waves/round-20/check-wave.mjs` | `9c667b84522a65abed12af2b19c2347f63f350bdeba7214b963bc270f7983f12` |
| `.ufo/waves/round-20/lesson-history.mjs` | `a8dade2deed3eab7d54c26576c2d604852b35757a076578c0c08b535eeb9bdc7` |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` |
| `scripts/check-user-round-contract.mjs` (known-red producer, still frozen) | `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273` |
| `scripts/check-measurement-binding.mjs` | `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74` |
| `corpus/lessons/round-21.md` | `e2a28794ad83559c0843c4162520ef78dbe8e3859060c6f028fc5ba661e5517c` |

The 12 retained raw-case digests (recorded in the receipt and the semantic witness; assert
byte equality, do not recompute semantics):

`na-pending f17fe86f…`, `na-click 36502a28…`, `na-requestsubmit 4b8245d7…`,
`na-native-submit 28a20412…`, `na-reset 097b8833…`, `na-remove e7e32f5f…`,
`na-reject a57b41bd…`, `na-throw e46d751e…`, `na-delayed 146adde4…`,
`na-invalid-submit e7712c1b…`, `auto-positive 62f257e9…`, `auto-invalid 28a37c0e…`
(full 64-hex values in `corpus/evidence/round-21/runtime/receipt.json` and
`.ufo/waves/round-21/final/semantic-contrast-witness.json`).

## 1. Byte-prefix (append-only) checks L1 must retain

The frozen USER gate's `APPEND_ONLY` set is exactly
`['LOG.md','SCORECARD.md','SKILL.md','PROVINCE.md','corpus/QUALITY.md','corpus/README.md']`
(`scripts/check-user-round-contract.mjs:76`). `corpus/SOURCES.md` is not in that list; it is
the registry whose S101 used-by cell is the only declared mutable cell.

Required check: for every changed path in the set, bytes at `R22D` must start with the bytes
at `BASE`. A line-based `git diff` is insufficient; compare raw byte prefixes.

| Path | BASE sha256 | BASE bytes | Current observed delta (worktree, not a pin) |
|---|---|---|---|
| `LOG.md` | `f159d4be93a1a402bbbd22cf83ab8a8c9656340cacb4c364d9c5c73ebe495ff4` | 115666 | +49/−0 |
| `SCORECARD.md` | `0384b109cb561d0f41d61fa5e0e42564e94698f2765d43e8d7bb43cb08c0aa38` | 83649 | +28/−0 |
| `SKILL.md` | `54da3b2beb2b918a7b5788731d755f92ec5f2f691bc8b241cf411f4afea6c0d3` | 217205 | +35/−0 |
| `corpus/QUALITY.md` | `4e6931047e1f03cad772f2ef55e14ffa2a5125848fea7ed72d8c75fd94b9d8b1` | 23086 | +21/−0 |
| `corpus/README.md` | `ff324e22f893eb7043500e21a489d2d7425e2e27f621cc1f2a77ad6e104244b7` | — | +21/−0 |
| `PROVINCE.md` | `16c27b12a60dbbcc43903d40334c314f6587bd8703d1e890e076398eac1a946a` | — | unchanged (preferred) |
| `README.md` | `7e00e0eb1726dd5ef82bd5e5eef73b7c0f49cdae76823508ad7c8270f4ce9342` | — | unchanged |
| `AGENTS.md` | `1f161186138f201c616e6c35c878ff34a6bfa2ecc7ea5ee5151406d7b382aa68` | — | unchanged |
| `MINT.md` | `cac824d40277ed3ca9e1d3e5c4ee792497c02de95b71c0c0e7468bb3ba144220` | — | unchanged |
| `SHONEN.md` | `cca7c1cb4eee90d95f797c7b7ee36242d519563477c6653c3f3eaae4571923f1` | — | unchanged |

`corpus/SOURCES.md` special form (BASE sha256
`1572aa2dec255d80c25e4200ee9020ba4526a688887e5aa588aacae8acff71a3`, 83799 bytes):

1. Exactly one changed line, and it is the S101 row.
2. Split on `|` after trim: the S101 row still has 13 elements (11 fields).
3. Cells 0–10 and 12 are byte-identical to BASE.
4. Only the used-by cell (index 11) gains `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`;
   both round-21 note paths remain.
5. **No S102 row** (`grep -c '^| S10[2-9] '` = 0), no new source-row quota.
6. S100 row is byte-identical; `check-sources.mjs` production still exits 0 with the same
   W04 duplicate-URL warning set recorded in `.ufo/waves/round-22/census-before.json`.

The two round-21 knowledge notes must remain byte-identical. The new note is the only new
`corpus/knowledge/*.md`; this is what makes the census delta `knowledge 40→41` and nothing
else.

## 2. Frozen byte identity and the diff allowlist

`git diff --name-status BASE..R22D` must satisfy:

- **No `D`, `R`, or `T` anywhere.**
- `M` only for: `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`, `corpus/QUALITY.md`,
  `corpus/README.md`, `corpus/SOURCES.md`.
- `A` only under: `.ufo/waves/round-22/`, `corpus/evidence/round-22/`,
  `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, `corpus/lessons/round-22.md`.
- Zero `A`/`M` under `.ufo/waves/round-19/`, `.ufo/waves/round-20/`, `.ufo/waves/round-21/`,
  `corpus/evidence/round-19/`, `corpus/evidence/round-20/`, `corpus/evidence/round-21/`,
  `scripts/`, `corpus/knowledge/webmcp-nonautosubmit-round-21*.md`, `corpus/lessons/` other
  than the one new `round-22.md`.

Then compare `preservation-baseline.json` entry-by-entry at `R22D`
(`git rev-parse R22D:<path>` equals `gitBlob`, `git ls-tree` mode equals `mode` for all 356
entries; independently verified valid at `BASE`: 356 entries, 0 mismatches, 0 duplicates).

**Coverage gap to fix:** the 356 entries cover only `.ufo/waves/round-21` (263),
`corpus/evidence/round-21` (27), `corpus/lessons` (46), `scripts` (20). They do **not**
cover:

- `.ufo/waves/round-19/final/harm-at-measured.json` (the cohort the L1 runner reads);
- `.ufo/waves/round-20/**` (`counts.mjs`, `measure-c1.mjs`, `check-wave.mjs`,
  `lesson-history.mjs`, `final/*`, fixtures);
- `corpus/evidence/round-20/**` and `corpus/evidence/round-19/**`;
- the two round-21 knowledge notes (outside `corpus/lessons`);
- root `README.md`/`AGENTS.md`/`MINT.md`/`SHONEN.md` and the append-only docs.

All of these must be pinned by the diff allowlist (complete) even if the JSON baseline is
not regenerated.

## 3. Frozen evidence checks, beyond green exits

### 3.1 Old structural counter (do not replace, do not import)

- At `BASE`: `node .ufo/waves/round-21/measure-c1.mjs 5f58577…` must still be
  `{"metric":"c1_lifecycle_observations","c1_lifecycle_observations":12,"verdict":"clean","exit":0,"findings":[]}`.
  The old population is 12 before and after round 22; it is not the new 0→12 claim.
- At `R22D`: the same command must still return 12 clean. This is the proof that the
  `SKILL.md`/`corpus/SOURCES.md` appends are additive: the old counter reads both and checks
  `skill.includes(round21 corrected note)`, a single S101 row with 13 cells and the
  round-21 note in its used-by cell, and one S100 row with 13 cells. Any cell-count change,
  row addition, or removal of the old note link turns this red.
- New oracle must **not** import, spawn, or read the old counter/census as an outcome
  oracle. Static check on `.ufo/waves/round-22/measure-c1.mjs`: no substring
  `.ufo/waves/round-21/measure-c1.mjs`, `.ufo/waves/round-20/measure-c1.mjs`, or
  `.ufo/waves/round-20/counts.mjs`; new `INPUT_PATHS` contains no such path. The old counter
  remains frozen at `8d992423…`; the census at `fec9a31e…`.

### 3.2 Old selftest must keep its exact result

`node .ufo/waves/round-21/measure-c1.mjs --selftest` at `R22D` must be exit 0 **and** report
`schema:tabi-round21-c1-selftest-v1, verdict:clean, cases:83, passed:83`; the retained
receipt `corpus/evidence/round-21/selftest-c1.json` records exactly that. Assert the counts,
not just `exit==0`. Fixture identities must remain `37cc2995…`, `aa372626…`, `46966f05…`.

### 3.3 Round-20 no-harm arms

`node .ufo/waves/round-20/measure-c1.mjs R22D` → `c1_lifecycle_decisions=12, verdict clean`;
`node .ufo/waves/round-20/check-wave.mjs --selftest` → exit 0. Both producer blobs are
pinned above.

### 3.4 Census: assert the whole object, not two fields

At `BASE` the observed JSON is exactly:

```json
{"rows":101,"tiers":{"A":88,"B":4,"C":9},"statuses":{"mined":73,"queued":19,"rejected":9},"knowledge":40}
```

At `R22D` the only permitted delta is `knowledge:41` (one new note). Same `rows`, same
histograms. The current L1 runner checks only `rows` and `knowledge`, so an S-row cell edit
that preserves 101 rows but changes tier/status would pass. Assert full equality.

### 3.5 Round-21 measurement binding: measured-revision only

- `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-21/measurement-binding.json --at 2d5eaaa3c8317bce31e1180b49df4516db35d44b --reproduce`
  → `MEASUREMENT_BINDING verdict=clean claims=1 bound=1`, exit 0 (the retained
  `binding-at-measured.json` and `binding-after-lesson.json` use `2d5eaaa` and `ab73abe`).
- **Do not** evaluate the same manifest at `R22D`. Its counted inputs include `SKILL.md` and
  `corpus/SOURCES.md` (`.ufo/waves/round-21/measurement-binding.json` lines for claim C1),
  which round 22 necessarily appends; the expected finding at `R22D` is
  `counted_input_changed` for those paths. Recording that as a round-22 failure, or rewriting
  the old manifest to point at `R22M`, are both wrong. The old manifest blob must stay
  `d8d08d3b…`.
- The round-21 binding is **not** a round-22 no-harm arm at the tip; it is a proof that the
  old measured inputs were unchanged at the time of measurement.

### 3.6 New measurement binding (same-revision identity)

If L1 adopts `.ufo/waves/round-22/measurement-binding.json` (BindingSchema recommends it):

- `counter.sha256` equals the `measure-c1.mjs` blob at `R22M` **and** at `R22D`.
- `measuredRevision == after.revision == R22M`; `before.revision == BASE`, count 0.
- `countedInputs` is exactly the set of paths `evaluate(files)` reads (compare against the
  module's exported `INPUT_PATHS`; importing the module is side-effect-free). At minimum:
  retained round-21 runtime prefix/25 files, `runtime-execution-finalized.json`,
  `scripts/webmcp-lifecycle-round21.mjs`, `semantic-expectations.json`, the new note; plus
  `SKILL.md`/`corpus/SOURCES.md` **only if** the oracle reads them.
- Reproduce at `R22M` and `R22D` → exit 0, value 12. `R22M` must contain the counter,
  expectations, note and any read doc cells in one commit; a later doc edit to a counted
  input produces `counted_input_changed` at `R22D`.
- If the oracle does not read `SKILL.md`/`SOURCES.md`, do not declare them; an undeclared
  read is an ungated mutable input.

### 3.7 New oracle CLI arms (exact, negative-capable)

The oracle must distinguish baseline, failed, and could-not-evaluate:

| Arm | Expected |
|---|---|
| `node .ufo/waves/round-22/measure-c1.mjs BASE` | exit 0, `value:0`, `c1_semantically_checked_lifecycle_rows:0`, `verdict:"baseline"`, `findings:[]`; both new expectations and note absent |
| `node .ufo/waves/round-22/measure-c1.mjs R22M` | exit 0, `value:12`, `verdict:"clean"`, `rows` length 12, `findings:[]` |
| abbreviated revision (`5f58577`) or non-hex 40 | exit 2, stable `revision_input` finding, never baseline 0 |
| full hash that does not resolve to that exact commit / a tag / `^{commit}` mismatch | exit 2, `revision_input` |
| missing/irregular blob (tree or gitlink where a file is expected) | exit 2, `input_shape` (or typed could-not-evaluate), never baseline 0 |
| expectations present but note absent, or vice versa | exit 1, `value:0`, `partial_state` (the contract's "partial missing means failed0") |

At `BASE`, the baseline short-circuit must occur **before** source/note/skill checks. If the
gate inspects the new `SKILL.md`/`SOURCES.md` references first, it will return `partial_state`
at `BASE` and the binding `--reproduce` before-arm will be reported as `counter_failed` even
though the bytes are correct. This ordering is a hard no-harm prerequisite.

Output shape: one JSON object containing `schema`, `metric:"c1_semantically_checked_lifecycle_rows"`,
`value`, `c1_semantically_checked_lifecycle_rows`, `verdict`, `exit`, `findings`, `rows`.
Each row must name its case id and the checked outcome, not be an opaque counter. No row may
be emitted for a structurally consistent but semantically wrong case.

### 3.8 New selftest: finding coverage, not exit 0

The new `selftest-c1.mjs` + `fixtures/expected.json` must exercise, and L1 must inspect, at
least:

- `positive`: the 12 actual retained cases + the new note/expectations → exit 0, value 12.
- `baseline`: both new inputs absent → exit 0, value 0.
- one wrong-status mutation **per case id** (12 arms; includes a fabricated Completed for
  `na-pending`) → exit 1 and `semantic_status`.
- success nonce/output mutation → `semantic_output`.
- cancel/error text mutation (reset, remove, reject, throw, invalid-submit, auto-invalid) →
  `semantic_error`.
- native submit: object-instead-of-array and null-instead-of-empty → `semantic_navigation`
  (and/or `semantic_output`); late navigation without case nonce → `semantic_navigation`.
- delayed: response before release, or `formActive:false` before release → `semantic_delayed`.
- finite window violation / observation order → `semantic_timing`.
- evidence digest/pin mismatch → `evidence_binding`.
- duplicate/missing/extra case → `case_set`.
- first-line provenance/S101/receipt association → `source_binding`.
- malformed null/object/array/missing fields → `input_shape`, typed refusal, no crash.
- invalid revision → `revision_input`.

Every **semantic** mutation must report a `semantic_*` finding, never `evidence_digest` or
`execution_binding`; otherwise the arm passes for a stale hash rather than semantics. The
mutator must update raw bytes, receipt `evidence.sha256`, `execution.artifacts` and
`execution.receiptSha256` coherently (as the round-21 selftest's `sealAcquisition` does), so
the only remaining contradiction is the fixed expectation.

Static coverage check: the union of `finding` values in `fixtures/expected.json` must include
all 11 exported ids `semantic_status, semantic_output, semantic_error, semantic_timing,
semantic_navigation, semantic_delayed, evidence_binding, case_set, source_binding,
input_shape, revision_input`, and at least 12 distinct wrong-status arms. Also assert the
selftest's reported oracle producer digest equals the `R22M` blob; a selftest that executes an
absolute lane path instead of the clone's committed oracle is not a committed-byte test.

### 3.9 Independent expectations and the retained witness

The new expectations must be static and must not be derived from the evaluated receipt. Two
concrete checks:

1. `semantic-expectations.json` is in the new binding's counted inputs and is byte-identical
   at `R22M` and `R22D`; changing it changes the claim, not merely a cache.
2. Cross-check every case against the **pre-existing** retained witness
   `.ufo/waves/round-21/final/semantic-contrast-witness.json`
   (`b58dd772…`): `invocationId`, `evidenceSha256`, `preWindowMs`/`afterWindowMs`,
   `preResponseCount`, `responses[].status`, `errorText`, `output`, `postSubmits`
   (including `null` for `na-native-submit`), `postUrl`/nonce presence, and the
   `release`-before-response marker for `na-delayed`. The witness is an author-side artifact
   that predates the new oracle; it is not the evaluated receipt, so it is a valid independent
   cross-check. Any divergence is a claim drift to report, not to silently recompute. The
   witness also records `syntheticControl: {class:"structural only, not a semantic oracle",
   cases:12, allSilent:true}` — the new note's "this is not a new observation" framing must
   stay consistent with it.

### 3.10 Chronology classifier: actual input, not selftest only

`check-review-chronology.mjs --selftest` exit 0 is insufficient. L1 must also run it on the
**actual retained round-21 W2/closure facts** (a local JSON assembled for this round with
citations to `.ufo/waves/round-21/w2-returns.json`, `w2-task-result.json`,
`runtime-execution-finalized.json` and `.ufo/waves/round-22/round21-closure.json`) and assert:

- reviewed producer digest ≠ final `bc11e4d6…` and/or acquisition start `13:51:46Z` after
  review return `13:49:02Z` → `review_scope_gap`, **never** `final-reviewed`;
- absent event history → typed unavailable, not an empty list proving no wakes;
- first-terminal and latest-observed status are distinct fields;
- exact pre-review artifact match is the only positive that may classify as final-reviewed;
- the classifier does not mutate the W2 files (status clean).

### 3.11 Working-tree, clone and dangling-reference hygiene

- `.ufo/waves/round-22/run-checks.py` records `sandbox.statusBefore/After` but does not fail
  on them. Both must be **empty** and must be pass conditions. The lane currently has
  `M LOG.md`, `M SCORECARD.md`, `M SKILL.md`, `M corpus/QUALITY.md`, `M corpus/README.md`,
  `M corpus/SOURCES.md`, `?? .ufo/waves/round-22/`, `?? corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`;
  integration must commit the intended bytes before the clone check, or the clone will omit
  them.
- Final tree must contain no `.ufo/waves/round-22/clones/**` and no gitlink (`160000`)
  entries: `git ls-tree -r R22D | awk '$2=="commit"'` empty; `git ls-tree -r --name-only R22D`
  has no `/clones/` path. A committed private clone would copy a nested `.git` and hundreds of
  unrelated files into the delivered tree.
- No zero-byte wave evidence at `R22D` (`find .ufo/waves/round-22 -type f -size 0` excluding
  intentional markers). `w1-record.json` was observed 0 bytes early in the wave and must be
  finalized.
- Referenced-but-not-yet-landed paths must exist at `R22D` or the reference must be removed:
  `corpus/lessons/round-22.md` (cited by `corpus/QUALITY.md` rows 56–58);
  `.ufo/waves/round-22/check-review-chronology.mjs` (cited by the note and SKILL);
  `measure-c1.mjs`, `selftest-c1.mjs`, `fixtures/expected.json`, `debt-expectations.json`,
  `corpus/evidence/round-22/semantic-expectations.json`.
- The round-22 `round21-closure.json` is a copy of closure evidence. Its provenance must be
  labeled as a copy; it is not an authenticated settlement and must not be presented as a new
  observation. The original closure/lesson/report bytes stay untouched.

### 3.12 No new producer/acquisition claim

- The only new corpus evidence file is `corpus/evidence/round-22/semantic-expectations.json`;
  there is no `corpus/evidence/round-22/runtime/` and no new `scripts/webmcp-*` producer.
  The new note's `recheck` commands point at the oracle, not a capture.
- The new note's first line starts `source: S101` and carries
  `corpus/evidence/round-21/runtime/receipt.json`; it must not re-declare an S100 external
  source association (otherwise the S100 carrier/body/source-opening files become required
  counted inputs, which the contract does not ask for).
- The gate's `INPUT_PATHS` must contain the retained round-21 runtime **prefix or 25 files**,
  never a round-22 copy. The acquisition record
  `runtime-execution-finalized.json` (`65b52c0c…`) and receipt (`4bc79636…`) stay frozen; the
  producer script stays `bc11e4d6…`.

## Contradictions / gaps observed in the current L1 runner

These are stated explicitly, not smoothed into a score:

1. `.ufo/waves/round-22/run-checks.py` never reads `preservation-baseline.json`; 356 pinned
   blobs exist but are unenforced.
2. It reads `.ufo/waves/round-19/final/harm-at-measured.json` from the live lane and only
   records `cohortSourceSha256`; it does not compare it to the retained round-21 value
   `dc947014…`. An edited cohort would silently change the expected cohort.
3. It checks `curation-*` only on `rows`/`knowledge`; tier/status drift is invisible.
4. It runs old selftests on exit code only; the retained 83/83 result is the stronger pin.
5. It omits both the round-21 binding (at measured revision) and any round-22 binding, so the
   same-revision identity claim is unproven.
6. It has no exit-2 refusal arms and no partial-state arm for the new oracle; a gate that maps
   a malformed revision to baseline 0 would pass.
7. It runs `chronology22-selftest` only; it never classifies the actual W2 chronology input.
8. It records `statusBefore/After` without failing on them.
9. Its no-harm arms (`lifecycle21-after`, `lifecycle20-after`) are necessary but not
   sufficient: they prove the old counters still read 12, not that the retained byte set is
   unchanged. A deleted or rewritten round-20/21 file that the old counter does not read would
   pass all current arms.

## Risks

- **Self-referential measured input.** If `measure-c1.mjs` reads the new note and the note is
  edited after `R22M`, the binding fails; if the oracle instead reads the note via the
  worktree, it can evaluate uncommitted bytes. Pin the note and require repo-relative reads
  from the clone.
- **Positive-control mismatch.** The new selftest builds positive files from round-21
  fixtures. If its `SKILL.md`/`SOURCES.md` bytes are the round-21 versions while the new gate
  requires the round-22 note link, the positive arm cannot reach 12. The positive tree must
  take those docs from `R22M`, or the gate must not read them.
- **Double evidence.** Copying round-21 runtime files under `corpus/evidence/round-22/` would
  create a second, ungated population. The allowlist above forbids it.
- **History rewrites that look like fixes.** Updating the round-21 binding manifest, the
  round-21 receipt, the old note, the old lesson, or the cohort file to make the new checks
  pass would erase the very boundary this round corrects. All are frozen.
- **Closure copy as authority.** `.ufo/waves/round-22/round21-closure.json` is a copy; the
  note's debt numbers (five seats, 55/23/24/20) must cite it as closure-reported evidence, not
  as fresh observation.

## Verification (read-only, for L1 after integration)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
BASE=5f585773258b33d2d514b00cd0b0775333578db6
R22D=<delivered 40-hex>

# complete allowlist + zero deletions
git diff --name-status --diff-filter=DRT "$BASE".."$R22D"          # empty
git diff --name-status "$BASE".."$R22D"                            # only allowed M/A

# 356 blob/mode pins (and expanded scope) at R22D
# loop over preservation-baseline.json and compare git rev-parse/ls-tree

# append-only prefixes (raw byte prefix, not diff lines)
# LOG/SCORECARD/SKILL/PROVINCE/QUALITY/corpus README; SOURCES S101-cell parser

# frozen gates / counters / bindings
node .ufo/waves/round-21/measure-c1.mjs "$BASE"    # 12 clean
node .ufo/waves/round-21/measure-c1.mjs "$R22D"    # 12 clean
node .ufo/waves/round-21/measure-c1.mjs --selftest # 83/83
node .ufo/waves/round-20/measure-c1.mjs "$R22D"    # 12 clean
node .ufo/waves/round-20/counts.mjs "$BASE"        # full object above, knowledge40
node .ufo/waves/round-20/counts.mjs "$R22D"        # same, knowledge41
node scripts/check-measurement-binding.mjs --check .ufo/waves/round-21/measurement-binding.json --at 2d5eaaa3c8317bce31e1180b49df4516db35d44b --reproduce
# NOT at R22D for the round-21 manifest

# new oracle arms
node .ufo/waves/round-22/measure-c1.mjs "$BASE"    # exit0 baseline 0
node .ufo/waves/round-22/measure-c1.mjs "$R22D"    # exit0 clean 12
node .ufo/waves/round-22/measure-c1.mjs --selftest # coverage per 3.8
node .ufo/waves/round-22/check-review-chronology.mjs --selftest
node .ufo/waves/round-22/check-review-chronology.mjs <actual-round22-debt-input.json>

# sandbox hygiene
git -C <clone> status --porcelain=v1 -uall          # empty before/after
git ls-tree -r "$R22D" | awk '$2=="commit"'         # empty
git ls-tree -r --name-only "$R22D" | grep '/clones/' # empty
```

No installs or updates. No production edit beyond this report. No lane VCS state touched.

Report: .ufo/waves/round-22/w1/ConnNoHarm.md
