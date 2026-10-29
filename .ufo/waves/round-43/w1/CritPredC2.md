# CritPredC2 — C2 sentence identity and rule map

**Axis:** calibration. **Result:** finding. Read-only review of the frozen claim and checker; no production bytes were changed. I did not invoke the checker or claim its overall predicate passed.

## Sentence identity

`claims.json` identifies the three C2 sentence sites at lines 44–50 and declares them byte-identical. I independently extracted `claims[1].predicate` and the checker header/`PREDICATE` constant: both comparisons returned `true` (predicate length 1314 characters). The checker source digest observed was `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743`, matching `claims.json`'s frozen checker digest. The frozen V0 generator digest is `b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c`; the generator's observed SHA-256 matches it.

## Clause-to-code map

| Frozen predicate clause | Enforcing code | Assessment |
|---|---|---|
| `r1a` receipt and `r1b` witness are committed blobs, each >=1000 bytes, valid JSON, with byte SHA-256 matching the corresponding committed measure field | `requireBlob` (`check-routed-defects-round43.mjs:76–80`); receipt/witness loop and checks (`:97–110`) | Present: blob gate precedes size check; JSON parse and digest comparison are applied to raw committed bytes. |
| Measure record is committed and its object ID at `REV` equals `8ff64d691f5c09569a50f2a5a038bb23774c3d35` | `MEASURE`/`MEASURE_BLOB_PIN` (`:26–27`); r1 measure block (`:88–95`) | Present: blob type, Git object ID equality, and JSON parse. A mismatch is a finding. |
| `r2` S148 teaching begins `supersedes S146`, has a verbatim remainder <=25 words in staged node CLI copy, and S146 is rejected | r2 block (`:113–141`) | Present in structure: fields/rows are selected, status/prefix/word count checked, staged file must be a blob, quote substring checked. See r5-style “line” caveat below only for r5; r2 asks for a verbatim remainder *inside* the copy, which substring matching does enforce. |
| `r3` baseline control is committed, nonempty, records its `ls-tree` command and digit 0 | r3 block (`:143–154`) | Partial/weak: it checks blob, size >=10, occurrence of `ls-tree`, and an isolated `0`; it does not establish that these form a recorded command/result pair. |
| `r4` is a 38-row TSV over exactly the committed slice IDs, no duplicates, valid verdicts, and evidence paths are committed blobs >=200 bytes | r4 block (`:156–184`) | Partial: ID equality, duplicates, verdict enum, blob type, and evidence size are checked. There is no 38-row assertion. |
| `r5` freeze binds every named control by SHA-256 and a verbatim quote line present in its bytes | r5 block (`:186–204`) | Partial: it hashes each entry in the *current* `claims.json` `controlBindings` and requires the quote as a substring. It neither pins that claims file to the freeze nor checks full-line boundaries. |
| `r6` committed V0 probe refuses, includes the measure-blob-pin finding, and names the frozen generator digest | r6 block (`:206–219`) | Partial: refusal and finding ID are checked; `generatorDigest` is checked only for 64 lowercase hex characters, not equality to the frozen digest. |
| Zero findings is the pass condition | `predicate = findings.length === 0` and exit selection (`:221–224`) | Present. |

## Findings and strongest counterexamples

1. **r5 can self-authorize the “freeze” (high impact).** At `:189–202`, the checker only requires the `claims.json` blob at the caller-selected `REV`, parses its current `controlBindings`, then checks each entry against the control at that same `REV`. It does not bind `claims.json` to the freeze at commit `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` (nor to a frozen claims blob ID). `frozenDigests` contains the checker and V0-generator digests but no claims-file digest. **Counterexample [INFERENCE from the code]:** a later revision can change the V0 probe and rewrite its `controlBindings` hash/quote in `claims.json`; the checker accepts the rewritten self-binding. That is not the frozen round-43 claim, even though r5 sees a self-consistent current pair. This defeats the sentence's word “freeze” and permits the r6 digest gap below to be exploited without changing the frozen checker.

2. **r6 names any digest-shaped value, not the frozen generator.** The only generator test at `:216` is `/^[0-9a-f]{64}$/`. It does not compare against the observed frozen digest `b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c` (or the corresponding `frozenDigests` entry). **Counterexample [INFERENCE]:** with the r5 self-binding change above, a probe carrying a different valid 64-hex digest still satisfies r6. The current committed probe does match the frozen digest, but that observed fact does not close the checker gap.

3. **r4 omits the explicit 38-row clause.** The implementation builds `rows` and compares sorted TSV IDs to `sliceIds` at `:162–176`, but never checks `rows.length === 38`. Current files contain 38 slice IDs and 38 non-comment TSV rows; the checker has no literal 38-row guard. **Counterexample [INFERENCE]:** a 39-ID committed slice plus a matching 39-row TSV with valid evidence passes these r4 checks, despite contradicting “38-row”.

4. **r5 checks a quote substring, not a quote line.** `:201` uses `raw.toString('utf8').includes(b.quote)`, without splitting into lines or requiring line equality. A quote of >=8 characters that is merely a substring within a longer line satisfies the code, while the predicate says “quote line”. This is observable as a rule/code mismatch even though the current frozen control quotes are presently usable.

5. **r3 token checks do not establish the recorded command/result.** `:150–151` accepts any baseline blob containing `ls-tree` somewhere and an isolated `0` somewhere. It does not require a command-shaped line or that the zero is recorded as that command's output. For example, unrelated text containing both tokens satisfies the tests. The current baseline file does contain a comment with the `git ... ls-tree ... | wc -l` command and a separate `0` line, but the checker does not enforce that representation.

**Unclaimed gates (code with no matching C2 predicate clause):** r3 requires >=10 bytes although the sentence says nonempty; r5 requires at least five bindings although the sentence gives no count; r6 requires a syntactically 40-hex `fixtureRev`, although the sentence requires the frozen generator digest and does not specify that field. These do not reject the current observed artifacts (8 bindings; current probe has a 40-hex revision), but they are additional acceptance conditions and should be reconciled in a future checker/sentence pair rather than silently treated as sentence clauses.

## Evidence / exact observations

Read-only extraction output:

```json
{
  "claim_equals_header": true,
  "claim_equals_constant": true,
  "predicate_length": 1314,
  "frozen_generator_digest": "b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c",
  "r6_code_checks_digest_equality": false,
  "r4_code_checks_row_count": false,
  "r5_code_checks_quote_line_boundaries": false
}
```

Additional read-only extraction output:

```json
{
  "control_bindings_count": 8,
  "slice_ids_count": 38,
  "current_tsv_noncomment_rows": 38,
  "current_probe_generator_digest_matches_frozen": true,
  "frozen_generator_digest": "b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c",
  "checker_r4_has_literal_38_row_guard": false,
  "checker_r5_quote_test": true,
  "checker_r5_pins_claims_to_frozen_commit_or_blob": false,
  "checker_r6_digest_test": false,
  "checker_r6_fixture_revision_test": true
}
```

The source excerpts were read from `claims.json:44–50,81,88–130` and `counters/check-routed-defects-round43.mjs:19,24–35,76–80,88–111,113–154,156–219,221–224`. No checker invocation, fixture mutation, install, git/jj mutation, or write outside this report was performed. Scratch `/fast/scratch/hyaku/tabi-r43/CritPredC2` was created and removed via `shutil.rmtree` in `finally`.

## Smallest safe correction route

The frozen bytes must remain untouched in this wave. Route these findings forward: pin the claims blob to the freeze before trusting its bindings; compare r6's digest to the pinned frozen generator digest; require exactly 38 TSV data rows; compare r5 quotes as complete lines; and validate r3's command/output as a structured or exact recorded pair. Reconcile or remove the three unclaimed gates in the next rule/sentence pair.

VERDICT finding r4 omits the 38-row guard; r5 does not pin the freeze or require quote-line equality; r6 accepts any digest-shaped generator ID.