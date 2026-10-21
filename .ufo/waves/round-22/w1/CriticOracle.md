# CriticOracle — round22 W1: fixed-expectation independence and the silent synthetic positive

Scope: attack the proposed C1 outcome oracle design (`w1-spec.json` context + BuildOracle/BuildSelftest
prompts). Nothing was executed: no oracle, selftest, build or browser. Statements marked
[OBSERVED] were read from retained bytes; [INFERENCE] are derived by reading code and were not run.
At review time the BuildOracle and BuildSelftest clones were still at baseline `5f58577` with no
commits, so this report critiques the design, not an implementation.

Axes: **C1 depth validity** (whether value 12 means semantics), **provenance/independence**, **no-harm**
(the frozen round21 counter and retained acquisition), **honest finite scope**.

## Verdict

Two defects make value 12 forgeable, or let the selftest report semantic red for the wrong
reason. Both are fixable before judgment:

1. **Expectations come from inside the evaluated revision.** If they are not anchored in the
   executed oracle, a coherent co-mutation of raw, summary, digests and expectations still
   scores 12. The new note concedes this hole in its own text.
2. **"Red for semantics, not stale hashes" is not testable as specified.** Binding to the retained
   acquisition needs literal hash pins. Once those pins exist, every semantic mutant also
   trips `evidence_binding`. "Exit 1 plus the finding name is present" then passes even when the
   semantic predicate is dead. This needs a differential control (§F2).

Separately, three inherited acceptances from the round21 selftest must be reversed for `na-pending`
(§F3). Four retained-data traps decide whether the real tree can even reach 12 (§F4).

## F1 — fixed expectations are not independent unless the executed oracle anchors them

**Counterexample.** The CLI reads `corpus/evidence/round-22/semantic-expectations.json` as a Git
blob of the *evaluated* revision (same `filesAt` pattern as `.ufo/waves/round-21/measure-c1.mjs:146-155`).
A coherent rewrite of one revision passes:
1. Change `na-reset` frame seq15 in `corpus/evidence/round-21/runtime/na-reset.json` from
   `Canceled`/`errorText` to `Completed`/`output`, and mirror it in `receipt.json` `after.responses`.
2. Reseal `receipt.cases[].evidence.sha256`, `.ufo/waves/round-21/runtime-execution-finalized.json`
   `artifacts`/`receiptSha256`, and any binding pins stored in the expectations file.
3. Edit `semantic-expectations.json` `na-reset` to expect `Completed`.

Every check the spec names then agrees, and value is 12. [INFERENCE]

**Evidence that the design tolerates this.** The new shared-lane note (currently untracked)
`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` says at lines 23-25:
"Cryptographic self-consistency is necessary, not an outcome oracle or a guarantee against an
author changing both the evidence and the independent expectations." That sentence stays true
only while nothing outside the evaluated tree pins the expectations.

**Smallest safe correction.** Hard-code `EXPECTATIONS_SHA256` in `.ufo/waves/round-22/measure-c1.mjs`,
the same way round21 pins `PRODUCER_SHA` at `.ufo/waves/round-21/measure-c1.mjs:31`. Alternatively,
embed the case→class table as a constant, the way round21 embeds `CONFIG` at lines 11-17.
A revision whose expectations blob differs must emit `evidence_binding`, and that blob must never
be used as the judge. The trust boundary then moves to the executed oracle bytes, which the
measurement receipt already records as `producerSha256` (pattern:
`corpus/evidence/round-21/measurements.json`). The remaining residual is "an author edits the
oracle", which is visible by digest. Once this is fixed, narrow the note's sentence to that
residual. CriticScope F2 makes the same point for the class table; this extends it to the whole
expectations blob, because exact `errorText`/`output` snapshots are co-mutable too.

**Field rule (must not be recomputed from the receipt).** Each of the 12 fixed IDs needs these
literals in the anchored expectations:
- case identity: nonce, invocationId, outcome class, exact status;
- exact `output` JSON, or exact `errorText` bytes;
- exact page `errors` array;
- submits contract;
- navigation list.

A template such as `output = {ok:true, nonce:c.nonce, q:c.nonce}`, built from the evaluated
receipt's nonce, is recomputation. It lets a globally coherent nonce rebind pass whenever the
fixture/raw pins are resealed.

**Tradeoff, not a defect.** Exact strings and outputs are snapshot pins copied from the retained
observation, not independent predictions. Only the class mapping
(pending / Completed×5 / Canceled×2 / Error×4) is design-independent. The canonical judge should
accept this only if the note keeps the wording "snapshot conformance".

## F2 — "red for semantics, not stale hashes" needs a differential pair, not just finding membership

**Counterexample.** F3 of `.ufo/waves/round-22/w1/CriticScope.md` (lines 37-44) correctly requires literal
pins for the receipt (`4bc79636…f937034`), the execution file (`65b52c0c…9bfe4`), the producer
(`bc11e4d6…a811`), and the per-case raw/fixture hashes and invocation IDs. With those pins, any
coherent semantic mutant produces `evidence_binding` and exit 1. Two failure modes follow:

- **Dead predicate passes the test.** An oracle with a dead `semantic_status` predicate still
  passes a selftest that checks "exit 1 AND finding X present", as long as X is emitted by some
  unrelated path. One example is a shared catch-all that maps any per-row failure to every
  `semantic_*` id. [INFERENCE]
- **Early return hides semantics.** If the oracle `continue`s after a binding failure (the round21
  pattern at `.ufo/waves/round-21/measure-c1.mjs:107-108` skips a row on missing evidence), the
  semantic finding never fires. To compensate, the selftest's only route to green is to reseal
  the pins inside the disposable repo's expectations file. That is the F1 co-mutation path.

**Acceptance boundary (concrete).** For every semantic mutant M, the selftest also builds a
neutral twin N(M):
- N(M) has the same byte-level resealing as M (same re-serialization, same digest/receipt/execution
  link updates), but the semantic field is restored. For example, re-serialize `na-click.json`
  with different whitespace and reseal every link.
- Require `findings(M) \ findings(N(M)) == {named semantic_* id}` and exit(M) = 1.
- Require `findings(N(M))` to contain no `semantic_*` id. It may contain `evidence_binding`.

Also, the oracle must evaluate semantic predicates on parsed raw frames regardless of binding
outcome. Only an unparsable shape (`input_shape`) may short-circuit a row.

## F3 — the silent synthetic positive and three inherited acceptances

**[OBSERVED] The round21 positive is all-silent.** `.ufo/waves/round-21/fixtures/positive-ordered.json`
(sha256 `aa372626…8f75`) has zero `WebMCP.toolResponded` frames across all 12 cases.
Every `after.responses` is `[]`, every `after.submits` is `[]`, and there are no after-window
navigations. Yet `.ufo/waves/round-21/fixtures/expected.json` (sha256 `37cc2995…8eec`) asserts
`positive → exit 0, value 12`. The round21 counter has no outcome predicate: lines 101-142 compare
the summary to the raw only, so empty-vs-empty agrees. [INFERENCE from code]

**Falsifier S0.** Evaluate the new oracle on that file set, plus the real anchored expectations and
note, with every binding pin resealed. Required result: exit 1, value 0. `semantic_status` must
fire on the 11 non-pending rows. For `auto-positive` and `auto-invalid`, `semantic_timing` must also
fire, because a response is required before the pre-action marker.

**Vacuous-quantifier trap.** A predicate written as `responses.every(r => r.status === expected)`
holds on `[]`. Cardinality must be explicit:
- exactly 1 `toolResponded` frame in the whole case trail for the 11 terminal rows;
- exactly 0 for `na-pending`;
- this count covers every invocationId, not only the case's own.

**Inherited acceptances that must flip.** The round21 expected table accepts three mutants of
`cases[0]`. In `positive-ordered.json`, `cases[0]` is `na-pending`. All three are `exit 0, value 12`
in `.ufo/waves/round-21/fixtures/expected.json`; the mutants are defined in
`.ufo/waves/round-21/selftest-c1.mjs` around lines 63-84.

| Mutant | What it adds to `na-pending` | Why the new oracle must reject it |
|---|---|---|
| `late-response-outside-window` | appended Completed for the case invocation after the after-action marker | the retained bytes then contradict "pending". All 12 real trails end at the after-action observation [OBSERVED: last frame seq = post seq in every case]. Require last frame == after-action marker (`input_shape`), or `semantic_status` |
| `foreign-response-ignored` | Completed with a different invocationId inside the window | one invocation per case exists, so any foreign terminal response is unexplained. Fail `semantic_status` |
| `unavailable-null-positive` | `submits` key deleted from the post state; `after.submits = null` | null/unavailable is legal only for `na-native-submit`. `na-pending` requires `submits: []` present and `formActive: true` at both pre and post. Fail `semantic_output` |

## F4 — retained-data traps that decide whether the real tree can reach 12

All [OBSERVED] in `corpus/evidence/round-21/runtime/`:

- **Timestamp ties: order by `seq` only.**
  - `na-delayed.json`: seq15 `delayed-before-release`, seq16 `release` and seq17 `toolResponded`
    all have `at = 1792590715100`.
  - `auto-positive.json`: seq12 `toolResponded.at = 1792590716712 = preAction.start`.
  - In reset/remove/reject/throw/invalid-submit, `action-complete` and `toolResponded` share an `at`.
  - Strict `at` ordering rejects the real data. `>=` admits a same-millisecond early-response mutant.
- **Response vs action-complete.** `na-click` responds at seq14, *before* `action-complete` (seq15).
  The requestSubmit family responds after it. The correct non-auto rule is
  `action.seq < response.seq < post.seq` with `preAction.responseCount === 0`. The auto rule is
  `response.seq < pre.seq` with `responseCount === 1` and pre `formActive === false`.
  "Response after action-complete" would wrongly fail `na-click`.
- **Delayed "active" bit.** The submit record's `active` is sampled at dispatch
  (`scripts/webmcp-lifecycle-round21.mjs:113`). It is `true` in every Completed post state, including
  `na-delayed` after-action. The bit that actually distinguishes is observation `formActive`: `true` at
  seq15, `false` at seq18.
  - Mutant: set seq15 `formActive:false` in both the frame marker and `pageObservations`. An oracle
    checking only `submits[0].active` passes it.
  - The delayed observation is absent from the receipt summary (`after` keys are start, end,
    windowMs, responses, submits, navigations, pageState). The frame marker and `pageObservations`
    must be bound by seq, at and value, as the round21 counter does for pre/post at line 136.
  - Exactly one `release` frame exists, and only in `na-delayed`.
- **Native landing: key absence, not null.** `na-native-submit` post `value` keys are exactly
  `focused, formActive, formExists, secureContext, url, value`. There are no `submits`, `errors`
  or `nonce` keys. `receipt.after.submits === null`, and the output is exactly `[{"dummy":"landing"}]`
  (served by producer line 137).
  - Mutants to reject: `{"0":{"dummy":"landing"}}` or `{"dummy":"landing"}` (object-not-array), and
    `submits: []` added coherently (null-to-empty).
  - Navigation can be checked across three channels inside the acquisition:
    - seq15 `Page.frameNavigated` to `/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4`, before
      the response at seq16;
    - the post `url`;
    - `receipt.requests` entry `GET /landing?q=8a5839ad…`.
  - Deleting the CDP navigation while the server request remains must fail `semantic_navigation`.
    Non-native rows require zero navigations with `seq > invoke` and no landing request.
- **Exact error bytes.**
  - `na-invalid-submit` `errorText` ends in `"field.. "` (trailing space).
  - `auto-invalid` ends in `"'@'.. "`.
  - A `trim()`/`includes()` comparison admits near-miss mutants.
  - `na-reject` and `na-throw` also carry page errors `Uncaught Error: dummy rejection` and
    `Uncaught Error: dummy submit handler throw`. Pin both channels. Otherwise a mutant that deletes
    the page error while keeping `errorText` passes. CriticScope line 71 leaves this undecided; it
    should go under `semantic_error`.

## F5 — accounting and baseline edges

- **All-or-nothing value.** Value must be 12 iff `findings == []` and all 12 distinct fixed IDs pass.
  Otherwise it must be 0, matching round21 line 142. Per-row partial credit lets a duplicate-ID
  receipt (11 unique + 1 copy) total 12 if rows are summed. Record per-row status in `rows`, never
  in `value`.
- **Baseline key.** At `5f58577` the round21 receipt is present but the new expectations and note are
  absent. Baseline detection must key on *new expectations + new note*. Copying the round21 key
  (`receipt && note`, line 61) would make the before-gate partial and exit 1. `ls-tree` silently
  omits missing `INPUT_PATHS`, so partial detection belongs in `evaluate`. `INPUT_PATHS` must list
  both new paths.
- **No-harm.** `.ufo/waves/round-21/measure-c1.mjs` (sha256 `8d992423…fdf5eb`) stays byte-identical and
  is not imported. It should still report 12/clean at the round22 revision. Shared-lane edits to
  `corpus/SOURCES.md` and `SKILL.md` are currently uncommitted (`git status`), and the round21
  `source_binding` check at line 91 reads S101 backlinks and the S100 row. Those edits must keep
  `NOTE` in both rows' column 11. [INFERENCE]

## Cross-seat conflict to resolve before integration

The BuildSelftest prompt (`.ufo/waves/round-22/w1-spec.json`) says "minimal new note/expectations
compatible API". If F1's pin is adopted, a self-authored minimal expectations file fails the positive
case, or else proves the pin is absent. The selftest must copy BuildOracle's exact expectations
blob at test execution time, as it does for the oracle. Its own
`.ufo/waves/round-22/fixtures/expected.json` stays the second, independent author's table. L1
should compare the two per case by exact equality; this matches CriticScope F2.

## Acceptance boundary (all must hold; none were executed here)

1. The executed oracle pins the expectations blob digest, or embeds the class table and literals.
   A revision-supplied expectations blob with different bytes yields `evidence_binding` and value 0.
2. Per-ID literals are pinned; nothing semantic is templated from the evaluated receipt.
3. Semantic predicates run independently of binding. For every mutant, the neutral-twin set
   difference equals exactly the named `semantic_*` finding.
4. The S0 all-silent file set (`positive-ordered.json`, resealed) gives exit 1 with
   `semantic_status`. The `na-pending` late, foreign and unavailable-null mutants give exit 1.
5. Ordering uses `seq` only. `toolResponded` cardinality is explicit (1/0). Delayed is checked via
   `formActive` true→false across the release marker. Native requires key absence plus the
   three-channel navigation agreement. Error bytes are exact, page errors included.
6. Value is 12 iff there are no findings. The baseline key is new expectations + new note. The
   round21 counter is unchanged and still returns 12.

Impacted axes: C1 depth validity (F1–F4), provenance/independence (F1, F2), no-harm (F5), honest
scope (F1 tradeoff wording, F3 finite pending).

No installs or tool updates were performed.
