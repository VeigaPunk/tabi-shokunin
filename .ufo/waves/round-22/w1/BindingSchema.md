# BindingSchema — round22 C1 counted inputs and same-revision boundaries

Scout seat: read-only. Question: exact new counter counted-input paths and same-revision
binding across producer vs measured revision boundaries. No production edit, no test run.

## Verdict

Use `.ufo/waves/round-22/measurement-binding.json` for the round-22 C1 claim, with
`measuredRevision` = the single round-22 commit that contains the counter, the independent
expectations, the canonical note, and (if the oracle reads them) the `SKILL.md`/
`corpus/SOURCES.md` references. Commit the manifest itself only in a later commit, exactly as
round-21 did. `before` is `5f585773258b33d2d514b00cd0b0775333578db6` count 0; `after` is the
measured revision count 12. Producer identity is content-addressed (`sha256`), never a claim
that the browser ran at the measured revision.

## Observed: existing checker contract

All references are `scripts/check-measurement-binding.mjs` as committed at baseline
(`57d0aa5a74beffb313451ae0fed7934cbac6a418`, sha256
`388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`).

- Manifest schema `tabi-measurement-binding-v1`, integer `round`, 40-hex `baseline`,
  nonempty `claims` (`manifestProblems`, lines 452-510).
- Per claim: `counter.path` clean repo-relative; `counter.sha256` 64-hex;
  `counter.argv` must be `["node", counter.path, ...]` with exactly one `{REV}` token
  (`argvSupported`, 514-520); `counter.countField` identifier; `countedInputs` array of
  clean repo-relative paths; `measuredRevision` 40-hex; `before`/`after`
  `{revision: 40-hex, count: safe integer}`; `after.revision === measuredRevision`
  (lines 496-508).
- `measured_revision_not_ancestor` when `measuredRevision` is not ancestor-or-equal of the
  evaluated `--at` revision (573-579).
- `counter_digest_unrecorded` / `counter_digest_mismatch`: recorded sha256 must equal the
  counter blob at `measuredRevision` (583-592).
- `counter_changed_since_measurement`: counter blob at `--at` must still equal the recorded
  sha256 (594-598).
- `counted_inputs_undeclared`: missing/empty `countedInputs`, or any declared entry resolves
  to no tree entry at `measuredRevision` (599-607). A declared entry may be an exact file or
  a directory prefix (`hasTreeEntries`, 386-396; comment 386-387).
- `counted_input_changed`: `git diff --name-only measuredRevision --at -- <countedInputs>
  <counter.path>` must be empty (609-613; `diffNames`, 420-432). The counter path is added
  to the pathspec automatically (610).
- `argv_unsupported`: wrong argv shape or not exactly one `{REV}` (615-621).
- `--reproduce` only runs when every prior finding is clean; the worktree counter bytes must
  equal the blob at `--at` before execution; then it runs two arms — `before.revision` must
  print `before.count` and `--at` must print `after.count`, each with exit 0 and one JSON
  object line (`evaluateClaim`, 623-661; `reproduceArm`, 522-563). Any non-zero arm exit is
  reported as `counter_failed`, not `count_not_reproduced`.
- The manifest is read from the filesystem, not from Git; it is not hashed by the checker and
  is not required to be a counted input.
- Exit classes: 0 clean, 1 findings, 2 could-not-evaluate (header, 50-53).

## Observed: round-21 precedent and its one-revision offset

- `.ufo/waves/round-21/measurement-binding.json` names
  `measuredRevision = 2d5eaaa3c8317bce31e1180b49df4516db35d44b` and
  `before.revision = e7cf11a810003d4a65cc85bd265f2c17dd65b738`, C1 count 0 -> 12.
- The manifest does **not** exist at `2d5eaaa` (`git cat-file -e` fails); it was added by
  `ab73abe` ("round-21: retain verified measurements and final lesson"). This is the
  self-reference-safe pattern: the manifest names an earlier commit, so it cannot and must
  not be committed inside the commit it measures.
- All 33 declared counted inputs plus counter and checker are byte-identical between
  `2d5eaaa` and delivered `5f585773` (round-21 closure `conformance`/`c1_remeasurement`).
- Round-21 declared the retained runtime directory as a prefix in the counter's
  `INPUT_PATHS` but enumerated the 25 files individually in the manifest. Both work; the
  prefix form also catches added/removed directory members (see recommendation).
- Round-21 boundary wording, retained and applicable: "Counting that retained run at a
  committed revision is not a claim that the browser ran at that revision"
  (`.ufo/waves/round-21/history/...` lesson text retained in `corpus/lessons/round-21.md`).

## Recommended claim block (exact)

Manifest path: `.ufo/waves/round-22/measurement-binding.json`.

```json
{
  "schema": "tabi-measurement-binding-v1",
  "round": 22,
  "baseline": "5f585773258b33d2d514b00cd0b0775333578db6",
  "claims": [{
    "id": "C1",
    "axis": "depth",
    "counter": {
      "path": ".ufo/waves/round-22/measure-c1.mjs",
      "sha256": "<sha256 of the counter blob at R22M>",
      "argv": ["node", ".ufo/waves/round-22/measure-c1.mjs", "{REV}"],
      "countField": "c1_semantically_checked_lifecycle_rows"
    },
    "countedInputs": [ ...exact list below... ],
    "measuredRevision": "<R22M, full 40-hex>",
    "before": { "revision": "5f585773258b33d2d514b00cd0b0775333578db6", "count": 0 },
    "after":  { "revision": "<R22M>", "count": 12 }
  }]
}
```

`after.revision` must be the same literal 40-hex as `measuredRevision` (checker enforces it).

## Recommended countedInputs — exact list

These are the only paths the new oracle may read. Every one must be committed no later than
R22M and byte-identical at R22M and at the delivered `--at`.

Mandatory (contract-explicit):

1. `.ufo/waves/round-21/runtime-execution-finalized.json`
   - observed content: `exit:0`, `producerPath:scripts/webmcp-lifecycle-round21.mjs`,
     `producerSha256:bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`,
     `receiptSha256:4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`,
     exactly 25 `artifacts` keys equal to the retained runtime files. Blob sha256
     `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`.
2. `corpus/evidence/round-21/runtime/` (directory prefix, 25 files: `receipt.json` +
   12 `<id>.json` + 12 `<id>.html`)
   - exact ids: `na-pending`, `na-click`, `na-requestsubmit`, `na-native-submit`, `na-reset`,
     `na-remove`, `na-reject`, `na-throw`, `na-delayed`, `na-invalid-submit`, `auto-positive`,
     `auto-invalid`.
   - the prefix is the semantically exact declaration because the counter's `filesAt` loads
     `git ls-tree -r -- <prefix>` and therefore reads any added file; `diffNames` over the
     prefix also detects addition/removal between R22M and `--at`.
   - if L1 prefers per-file auditability, the equivalent 25-file enumeration is acceptable
     **only** if the counter's exported `INPUT_PATHS` also enumerates those same 25 files and
     does not use the prefix; otherwise an added file would be read but undeclared.
3. `corpus/evidence/round-22/semantic-expectations.json`
   - the independent fixed expectations; must not be recomputed from the receipt under
     evaluation.
4. `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`
   - canonical note; first line `source:` carrying the S101 association (see source binding).
5. `scripts/webmcp-lifecycle-round21.mjs`
   - historical producer, sha256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`;
     must equal `receipt.producer.sha256` and the acquisition record's `producerSha256`.

Conditional (declare if and only if `evaluate()` actually reads the file for
`source_binding`; the round-21 counter did read both):

6. `SKILL.md` — only if the oracle asserts the note path is referenced in the skill surface.
7. `corpus/SOURCES.md` — only if the oracle asserts the S101 row/used-by backlink includes
   the new note. The row is mutable only in its used-by cell; no new source row is claimed.

Do **not** declare, and do not read as an outcome oracle:

- `.ufo/waves/round-21/measure-c1.mjs` (frozen old counter; no import, no execution)
- `.ufo/waves/round-21/measurement-binding.json`
- `.ufo/waves/round-21/selftest-c1.mjs`, `corpus/evidence/round-21/selftest-c1.json`,
  `corpus/evidence/round-21/measurements.json`
- `.ufo/waves/round-21/source-opening.json`, `.ufo/waves/round-21/sources/html_form_element.cc`,
  `.ufo/waves/round-21/sources/html_form_element.cc.base64.gz`
  - inference: the round-22 contract scopes provenance to "canonical note source first line
    S101" and the claim is S101 own-work only. If the note header instead carries an S100
    association, these three S100 files become conditional inputs and must be declared.

Recommended lexicographic manifest order for the 7-entry final form:
`.ufo/waves/round-21/runtime-execution-finalized.json`, `SKILL.md`, `corpus/SOURCES.md`,
`corpus/evidence/round-21/runtime/`, `corpus/evidence/round-22/semantic-expectations.json`,
`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, `scripts/webmcp-lifecycle-round21.mjs`.
The 5-entry minimal form drops items 6-7.

## Same-revision boundaries

Name four boundaries explicitly; they are not interchangeable.

| Boundary | Identity | Where pinned | Invariant |
| --- | --- | --- | --- |
| B — round-22 baseline | `5f585773258b33d2d514b00cd0b0775333578db6` | `before.revision` | new expectations, new note and new counter are absent there; counter returns baseline 0 with exit 0 |
| M — measured / oracle revision | `R22M` (full 40-hex, assigned at landing) | `measuredRevision` = `after.revision` | counter, expectations, note, and any read doc references are all present in that one commit |
| P — producer content | `bc11e4d6...` sha256 of `scripts/webmcp-lifecycle-round21.mjs` | `receipt.producer.sha256` and acquisition `producerSha256` | blob at R22M hashes to the recorded sha; no claim the producer executed at R22M |
| A — acquisition | 25 retained runtime artifacts + receipt + `runtime-execution-finalized.json` | committed by `2d5eaaa` (round-21), before R22M | `execution.artifacts[path]` and `execution.receiptSha256` equal the blobs read at R22M; content re-binding, not re-execution |
| D — delivery | `R22D` (delivered tip) | `--at R22D` | `measuredRevision` is ancestor-or-equal of R22D; counter blob and every counted input are byte-identical R22M -> R22D |
| Manifest | `.ufo/waves/round-22/measurement-binding.json` | later commit, after R22M | not a counted input; names R22M without self-reference |

Ordering rules that follow mechanically:

1. **R22M is one commit.** Counter + `corpus/evidence/round-22/semantic-expectations.json` +
   `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (+ `SKILL.md` / `corpus/SOURCES.md`
   only if read) must all be committed there. Any of these landing later produces
   `counted_input_changed` at `--at R22D`, or `counter_changed_since_measurement` for the
   counter.
2. **Manifest after R22M.** Committing the manifest in R22M is impossible without a hash
   fixed point; round-21's manifest at `ab73abe` naming `2d5eaaa` is the observed safe
   pattern.
3. **Counter bytes frozen at R22M.** Recorded `counter.sha256` must be computed from the exact
   committed bytes; an in-place fix after measuring moves the measured revision and requires
   the count to be re-run, not merely re-hashed.
4. **Doc-only later commits are safe only if uncounted.** `LOG.md`, `SCORECARD.md` and the
   manifest itself are not counted; a later `SKILL.md`/`SOURCES.md` edit is not safe when the
   oracle reads them.
5. **No producer re-run.** The counted claim is the oracle's reading of retained bytes. The
   acquisition record's argv/out-dir are historical facts and must not be re-executed or
   presented as round-22 acquisition.
6. **Missing/partial new files at B.** Both new files absent -> value 0, verdict baseline,
   exit 0 (required because the reproduce arm runs the worktree counter at B and needs exit
   0). Exactly one absent, or malformed bytes at any other revision -> value 0 with named
   findings and exit 1 ("failed 0"). Reserve exit 2 for revision/CLI/environment refusal
   (`revision_input`), not for missing committed inputs; the checker maps any non-zero arm to
   `counter_failed`.

## Reproduction receipts (recommended)

- `.ufo/waves/round-22/final/binding-at-measured.json`
  `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-22/measurement-binding.json --at <R22M> --reproduce`
  expected `MEASUREMENT_BINDING verdict=clean claims=1 bound=1`, exit 0.
- `.ufo/waves/round-22/final/binding-at-delivered.json`
  same with `--at <R22D>`; only retained if R22D differs from R22M.
- Receipt fields to retain verbatim (round-21 shape): `argv`, `revision`, `exit`, `stdout`,
  `stderr`, checker `producerSha256` `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`.
- Pass an explicit `--at` full 40-hex; do not rely on the lane-tip anchor for a delivered
  receipt (header, 22-32).

## Remaining unknowns

- `R22M` / `R22D` hashes and the counter/expectations/note digests do not exist yet; the
  manifest values must be filled from the committed blobs, not from worktree bytes.
- Whether the new oracle reads `SKILL.md` / `corpus/SOURCES.md` is a BuildOracle decision
  constrained by its `source_binding` predicate. The binding rule is hard either way:
  `countedInputs` must equal the paths `evaluate(files)` reads; any read path not declared is
  an undeclared mutable input the checker cannot guard.
- Whether `evaluate()` treats malformed committed JSON as failed exit 1 or could-not-evaluate
  exit 2 is not fixed by the binding contract; the recommendation above is exit 1 for
  committed-input defects, exit 2 for revision/environment refusal.
- No round-22 manifest or binding receipt exists yet (observed: `.ufo/waves/round-22/` has
  only baseline/census/closure/registry/validation records and `w1/`).
