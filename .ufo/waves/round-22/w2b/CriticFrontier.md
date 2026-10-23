# CriticFrontier — round22 w2b: S101 own-work reopen as the sourced claim; mined-mistake candidates and fail-capability

Seat `TabiR22-2.CriticFrontier-16` (critic, author-side, leaf). Static review of revision
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`. No lane scripts were executed. No browser, REA, installs,
delegation or peer messaging was used, and the lane or fleet repository was not changed. The only file
written is this report. No tools were installed or updated.

## Axes

1. Frontier-step honesty: whether "a claim rests on a `SOURCES.md` row opened this round" (fleet
   `templates/round-prompt.md:73-74`, `PROTOCOL.md:138-142`) is truthfully met.
2. Fix fail-capability: "a fix is shown able to fail before it counts" (`CORPUS.md:179-184`). The test
   is one committed red-before state with the fix as the only delta.
3. Provenance and count accuracy: study counts, locations and registry transitions.
4. No-harm: every proposed correction must keep the current positive (C1 value 12, clean) intact.

## Answer to the frontier question

**Is reopening retained own-work an honest "source opened this round"? Yes in letter, with conditions,
and it is the weakest admissible form.**

- **Precedent accepts this form.** Tabi round15 reopened its own-work row S029 (minted in round14) as
  the sourced claim and was admitted (fleet `MANIFEST.json` `rounds[355]`). The round21 closure also
  states "Own-work S101 reopening satisfies source sample" (`.ufo/waves/round-22/round21-closure.json`,
  `verification.sources`).
- **The chronology is honest.** `.ufo/waves/round-22/source-opening.json:3` gives `openedAt`
  14:52:31Z, after the round21 closure's `closed_at` of 14:44:47Z. The record's committer date is
  15:35:37Z (`0f24164`). The digests at `:5` and `:7` equal the committed blobs: I recomputed
  `4bc79636…` (`receipt.json`) and `097b8833…` (`na-reset.json`). The scope at `:10` says plainly
  "reopening retained own-work data, not new browser acquisition or authenticated publisher". The
  search log `corpus/SOURCES.md:156` disclaims any new row or publisher diversity.
- **The reopen adds no new reading.** The quote at `:8`, "Tool execution cancelled by a form reset", is
  already the S101 located quote in the round21 lesson Gate (`corpus/lessons/round-21.md:81-83`). The
  round21 closure had re-checked it eight minutes earlier. Round22 changes only the carrier (the raw
  `na-reset.json` frame instead of the receipt pointer). The opened artifact is also C1's own measured
  input, so "rests on S101" is true by construction and records no outward learning.
- **This is a tradeoff for the canonical judge, not a fixable bug.** The fixable defects are below:
  the reopen record is not bound to any gate (F1), circular wording (F2), an ambiguous location (F3),
  inflated study counts (F4), and a missing lesson (F5).

## Findings

### F1 — medium, fixable: no failure-capable check binds the "opened this round" record or the round22 backlink

- **Where:**
  - `.ufo/waves/round-22/measure-c1.mjs:38-41`: `INPUT_PATHS` covers the expectations, note,
    producer, receipt, execution record and case artifacts only.
  - `:513-514`: reads are confined to `INPUT_PATHS` through `git ls-tree`.
  - Neither `corpus/SOURCES.md` nor `.ufo/waves/round-22/source-opening.json` is an input.
  - `scripts/check-sources.mjs:203-233,329-339` checks only that each used-by path exists and cites
    the row ID. It does not check that a note's `source:` row lists the note back.
  - The round21 gate's backlink target is `NOTE = …round-21-corrected.md`
    (`.ufo/waves/round-21/measure-c1.mjs:27`), not the round22 note.
- **Counterexamples** (static inference; not executed):
  - Set `source-opening.json` `rawSha256` to 64 zeros, or delete the file. Every cohort gate still
    passes.
  - Remove `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` from the S101 used-by cell
    (`corpus/SOURCES.md:115`). The round22 gate still reports value 12, clean. `check-sources` stays
    clean because the two remaining used-by paths still cite S101. The round21 gate still finds its
    own backlink.
- **Preserving positive:** the current tree. The untracked serial receipt
  `.ufo/waves/round-22/checks-at-e3cf4e0.json` (sha256 `8f4679ad…`) records
  `measure-c1.mjs e3cf4e0…` → exit 0, value 12, no findings.
- **Smallest fix, choose one:**
  - (a) Add conjunctive `source_binding` checks to the round22 gate:
    - `source-opening.json`: `sourceId === 'S101'`; `receiptSha256` and `rawSha256` equal the blobs at
      the evaluated revision; the quote equals the `errorText` of the invocation-correlated
      `WebMCP.toolResponded` frame in `na-reset.json`.
    - S101 row: unique, `own-work`/`A`/`mined`, with used-by containing `NOTE_PATH`.
    - Red controls: `opening-raw-digest-mismatch`, `opening-quote-absent`,
      `s101-round22-backlink-removed`.
    - Keep W1 `AttackSourceHeader`'s `opening-only-s101` control red. The check must stay
      conjunctive so the JSON can never rescue a wrong header.
  - (b) No code change. The round22 lesson Gate says the opening record is author-asserted and not
    gate-bound, and cites a committed re-derivation receipt (`git show REV:<path> | sha256sum` plus
    the quote location). This follows QUALITY38/39 (`corpus/QUALITY.md:157-165`).
- **Impacted axes:** frontier conformance and calibration. C1's value is unaffected.

### F2 — low-medium: circular "supports" wording retained despite a W1 finding

- **Where:** `SCORECARD.md:1052`, "Reopened own-work S101 supports the source-scoped finite
  predicates." W1 `.ufo/waves/round-22/w1/CriticAuth.md:52-58` (F5) already flagged this as
  circular. The expectations were transcribed from the same bytes they check; the note concedes this
  at `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:26-27`. The wording is unchanged at
  `e3cf4e0`.
- **Counterexample:** a reader takes the line as independent support from S101. In fact a coherent
  author edit to both the raw bytes and `semantic-expectations.json` keeps the result clean.
- **Preserving positive:** keep the note's line 1 and lines 26-27, and `SOURCES.md:156`, unchanged.
  They are accurate.
- **Smallest fix:** an appended SCORECARD clarification (SCORECARD is append-only): "Reopened
  own-work S101 retains the observations the finite predicates are checked against; it is not
  independent support, and no source outside the lane's retained acquisition was opened this round."
  The round report's frontier section should use the same sentence.

### F3 — low: the opening location can be misread as an S100 source span

- **Where:** `.ufo/waves/round-22/source-opening.json:9`, "…; source lines197-205".
  - The real anchor is `corpus/evidence/round-21/runtime/na-reset.json:197-205`: `seq` 15,
    `WebMCP.toolResponded`, `Canceled`, invocation `B8BA3C97850919D25D5C04338D497F26`.
  - The retained S100 body `.ufo/waves/round-21/sources/html_form_element.cc:197-205` is
    success/focus code. Those lines fall inside S100's registered `174-328` interval
    (`corpus/SOURCES.md:114`).
- **Counterexample:** a reader attributes the reset cancellation to S100's anchors. That contradicts
  `SKILL.md:2383` ("Reset/removal are observation-only with respect to S100's narrower source
  anchors").
- **Preserving positive:** the two digests and the quote are unchanged and correct.
- **Smallest fix:** in the round22 lesson Gate, state the location as
  `na-reset.json:197-205 (seq 15, invocationId B8BA…7F26)`. Do not rewrite the committed opening
  record.

### F4 — low: a non-registry verifier record is counted as an included source

- **Where:**
  - `.ufo/waves/round-22/study.json:3,5-8` and `corpus/SOURCES.md:156` give identified 2, screened 2,
    included 2, excluded 0. The second included item is "the admitted round21 closure evidence", which
    has no registry row.
  - The round14 convention (`corpus/SOURCES.md:139`) counted such supporting inputs as excluded from
    separate rows.
  - The note's chronology section (`…oracle-round-22.md:66-97`) rests on closure-reported facts. Its
    `source:` line can name only S101, because the gate requires an exact header
    (`measure-c1.mjs:24,398-399`).
- **Counterexample:** a census reader infers that two sources supported round22. Only one registry row
  was touched.
- **Preserving positive:** S101 stays included, so the sourced claim is unaffected.
- **Smallest fix:** an appended search-log correction: included 1 (S101), excluded 1 (the round21
  closure record, a supporting non-registry verifier record cited in the note body at lines 66-67).
  Do not change the gate header.

### F5 — medium for frontier conformance, pending: the mined-mistake component is absent at `e3cf4e0`

- **Where:**
  - `git ls-tree e3cf4e0 corpus/lessons/` lists `round-20.md` and `round-21.md` only.
  - `corpus/QUALITY.md:275,282,289` (QUALITY56-58) cite `corpus/lessons/round-22.md#mistakes`.
  - The S101 used-by change (old → new: the round22 note appended at `corpus/SOURCES.md:115`) has no
    old→new log in a lesson. The fleet round-prompt §2b.1 requires one.
  - No end census is retained.
- **Counterexample:** following QUALITY56's lesson pointer at `e3cf4e0` resolves to nothing, and the
  35/35 serial cohort does not detect it.
- **Smallest fix:** land `corpus/lessons/round-22.md` before the measured or reported revision, with:
  - a `## Gate` section holding the S101 reopen and the used-by transition;
  - a `## Mistakes` section using the candidates below and their honest fail-capability status.

  This is a forward requirement, so it is not a defect if it lands. It must not be claimed as met at
  `e3cf4e0`.

### F6 — low, fixable: the masked-negative fix (D3) changed data only; the masking mechanism remains

- **Where:** `.ufo/waves/round-22/selftest-c1.mjs:382` matches findings with
  `ids.includes(expected.finding)`. The same file's legacy check uses exact equality (`:402`).
  `post-crash-repair.json` D3 corrected only `fixtures/expected.json`.
- **Committed counterexample:** `.ufo/waves/round-22/selftest-pre-repair-0f24164.json`.
  - Case `native-submits-empty` expected `semantic_navigation`.
  - It observed `[semantic_status, semantic_error, semantic_navigation]` and reported `pass: true`.
  - It passed only because the positive arm's own defect emitted `semantic_navigation` in every
    mutant.
- **Preserving positive:** at `e3cf4e0` the positive arm has findings `[]` (untracked
  `checks-at-e3cf4e0.json`). The positive-gating option below therefore keeps 44/44 passing.
- **Smallest fix:** a case passes only if the positive arm in the same run is clean. The stronger
  option is an exact allowed-finding set per case (the `:402` idiom). That would need per-case sets,
  because the `status-*` cases emit `semantic_status` plus an output or error finding.

### F7 — low: the fail-capability proofs for D1/D2 are not committed as receipts

- **Where:**
  - `.ufo/waves/round-22/post-crash-repair.json:51-60` records the mutation probes ("43/44 failed:
    native-landing-errors / native-landing-wrong-query") as prose only, with no argv, exit or stdout.
  - `selftest-repair-sandbox.json` has no argv, exit or producer identity. It is tied to the
    `e3cf4e0` bytes only through `post-crash-repair.json` `filesAfter`; I recomputed all three digests
    and they match the blobs.
  - The complete at-revision receipt is untracked: `git show e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json`
    → "fatal: … exists on disk, but not in" (`git status` also lists it as `??`).
  - QUALITY37 (`corpus/QUALITY.md:154-156`) and `CORPUS.md:179-182` require committed failure text
    with argv, exit and producer identity.
- **Preserving positive:** the untracked receipt shows both new controls red with their required
  findings, and the positive clean.
- **Smallest fix:** commit `checks-at-e3cf4e0.json`, which already carries argv, exit, stdout and
  `producerSha256`. Either commit the two probe outputs, or rerun them labeled as new executions
  (QUALITY36), and cite both from the lesson's Mistakes rows.

## Mined-mistake candidates and fail-capability

| # | Candidate (class) | Evidence | Captured-by | Fix shown able to fail? |
|---|---|---|---|---|
| 1 | Structural consistency read as semantic agreement (scope) | QUALITY56; `legacy-status-swap` | QUALITY55 | **Yes.** The same coherent mutant gives round21 counter exit 0/value 12 and round22 oracle exit 1/`semantic_status`, plus 12 `status-*` mutants. Committed in `checks-pre-w2-0f24164.json`; at-revision copy untracked (F7). |
| 2 | Older review credited to finalized bytes (attribution) | QUALITY57; `round21-closure.json` `wave_conformance_debt` | none (new) | **Yes.** Historical input exits 1 with `review_scope_gap`, `producer_digest_mismatch`, `artifact_scope_mismatch` and `acquisition_after_review_observation`. Selftest is 17/17, including `exact_pre_review_artifact_positive` exit 0. Committed in `checks-pre-w2-0f24164.json`; the classifier is unchanged in `e3cf4e0`. |
| 3 | First-terminal snapshot taken as final history (attribution) | QUALITY58; note `:66-88` | QUALITY51 | **Partial.** Synthetic `peer_revival_after_failure`, `routing_broadcast`, `late_failure` and absent-history controls fail correctly. The actual W1 history yields only `event_history_unavailable`; the 55/23/24/20 counts come from prose. Say so. |
| 4 | Partial 11-of-12 credit on semantic red (vacuous) | `integration-changes.json` change 1 | none | **Yes.** The `status-*` cases require value 0 and verdict failed. |
| 5 | Landing-stage absent-vs-empty (D1) and token-in-query (D2) false failures (survivor; D1 recurs QUALITY53's own class inside the oracle meant to enforce it) | `post-crash-repair.json:15-33`; `selftest-pre-repair-0f24164.json` positive red | QUALITY53 (D1); none (D2) | **Partial.** The red-before (pre-repair positive with `semantic_error`/`semantic_navigation`), with the measure delta as the only relevant change, is committed. The new red controls are only in the sandbox or an untracked receipt, and the "fix removed → control red" probes are prose (F7). This is the strongest candidate: an existing rule failed to prevent recurrence. |
| 6 | Masked negative (D3) (survivor) | `selftest-pre-repair-0f24164.json` `native-submits-empty` passed during a red run | none | **No.** Data-only fix; `selftest-c1.mjs:382` is unchanged (F6). |
| 7 | Instrument integrated and committed before its real-byte positive was ever run (landing) | `integration-changes.json` "not yet executed" ×4; `checks-pre-w2-0f24164.json` 33/35, exit 1 | QUALITY35 | **Detection only.** The post-commit serial run caught it. No failure-capable pre-commit mechanism exists; do not claim one. |
| 8 | Slot grant (cap 320) treated as spawn capacity while the harness background-job cap is 100 (provider) | `w2-cap-refusal-01..14`; `w2-retry-slots.json` grants then refusals; recurred in untracked `w2b-cap-refusal-01..11` (attempt 12 spawned) | none | **No; not lane-owned.** Retain as provider/host debt. Never mine it as a fixed mistake. |

## Strongest single correction

Land the round22 lesson with Gate and Mistakes sections (F5) before the report, built on two things:

1. The binding from F1, either option (a) or the (b) receipt.
2. Committed `checks-at-e3cf4e0.json` plus the probe receipts (F7).

Classify candidates 6 and 8 as not shown able to fail, and candidates 3, 5 and 7 as partial. All
fixes above are additive or wording-only. None changes C1 (operability 0 → 12, population 12 → 12,
scalar 8 → 8) or any historical byte.

## Commands exercised (all read-only)

- `git rev-parse --verify e3cf4e0…^{commit}` and `git grep`/`git show` over the revision → exit 0.
- `git show e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` → "fatal: path … exists on disk, but
  not in" the revision. It ran in a pipeline whose overall exit (1) came from the JSON parser, so git's
  own exit code was not captured separately.
- `git show … | sha256sum` for `receipt.json`, `na-reset.json`, `measure-c1.mjs`,
  `selftest-c1.mjs` and `fixtures/expected.json` → exit 0; all digests match the records cited above.
- `git log`/`git diff` (`5f58577..e3cf4e0`, `0f24164..e3cf4e0`) and `git status --porcelain` → exit 0.
- `python3` parsing of committed JSON and of the untracked on-disk `checks-at-e3cf4e0.json` and
  `w2b-*` files, plus fleet `MANIFEST.json` → exit 0.

Not run: any lane gate, selftest, census or mutation. Every "still clean" claim under F1 is static
inference from the cited input lists.
