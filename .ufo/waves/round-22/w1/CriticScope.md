# CriticScope — tabi round22 W1 (read-only critic)

Scope reviewed: the round22 C1 design (`.ufo/waves/round-22/baseline.json`, `.ufo/waves/round-22/w1-spec.json` context + BuildOracle/BuildSelftest/BuildDebt prompts) against the retained round21 acquisition and its closure. All three build clones (`.ufo/waves/round-22/clones/{BuildOracle,BuildSelftest,BuildDebt}`) were still at `5f58577` with clean status when I read them, so this review covers the design, not code. Nothing was executed except read-only `git`, `sha256sum` and JSON parsing. No browser, no tests, no installs.

## Verdict

The design is admissible only as **enforcement of observations that were already counted**. In its current wording, C1 "depth 0→12" double-counts the round21 population on the same axis. The fix is small: change the wording (F1) and add four predicates (F2–F5). The chronology classifier also needs a scope cut (F6).

## F1 — duplicate depth credit for the same 12 observations (needs a decision from the canonical judge)

- **Counterexample.** Round21 already credited this exact population on **depth**, with semantics in scope.
  - `.ufo/waves/round-22/round21-closure.json` → `claims.C1.scope`: "Twelve finite receipt-bound loopback lifecycle observations with **independently checked raw semantics**".
  - `verification.semantic_remeasurement` in the same file already lists the population: "one finite pending, five Completed, two Canceled, four Error", the native `output[{dummy:landing}]`, and "release16 precedes response17".
  - `SCORECARD.md:1001` (round21 C1 row): "improved: … and separate semantic reading".
  - `.ufo/waves/round-21/final/semantic-contrast-witness.json` is committed and binds the same invocation IDs and raw digests. Example: na-pending `44555B4F…`, evidence `f17fe86f…`, acquisition `65b52c0c…7fe4`.
- **Why 0→12 is not new depth.** The round22 "before 0" is true only because the new metric's input files (`corpus/evidence/round-22/semantic-expectations.json` and `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`) are absent at baseline `5f585773…`. The evaluated raw bytes are identical before and after.
- **What is genuinely new.** A committed, revision-bound gate that *rejects* semantic mutants. Round21's witness only extracts actual values and asserts nothing. `corpus/lessons/round-21.md:50` says "The structural positive fixture is deliberately all-silent and is not a semantic oracle." That gain is in discriminating power, not observed ground.
- **Impacted axes and trends.** Depth (recycled population), calibration/discernment (where the real gain sits), expansion trend (no new ground).
- **Smallest safe correction.**
  - Keep the metric name if L1 wants it, but the SCORECARD/claim text must say the 12 rows are **the same 12 round21 observations**. They are non-additive with round21 C1: the depth observation total stays 12, and the verdict is only that semantic enforcement became gate-checked.
  - Alternatively, re-axis to calibration/discernment with a mutant-rejection count.
  - Either way: no "improved depth ground", no expansion-trend credit, and scalar 8 stays 8.

## F2 — the outcome class mapping must be code, not data

- **Counterexample.** Suppose the case→class mapping (pending / Completed / Canceled / Error) lives only in `semantic-expectations.json`. Then a coherent rewrite passes and still scores 12:
  1. Set na-reset to `Completed` in the raw file and receipt.
  2. Update the evidence sha256 links and `runtime-execution-finalized.json` `artifacts`/`receiptSha256`.
  3. Edit the expectations file to match.
- **Why this is possible.** BuildOracle authors both the oracle and the expectations (`w1-spec.json` BuildOracle prompt), so the expectations are not independent by authorship.
- **Correction.**
  - Hard-code the contract mapping as a constant in `measure-c1.mjs`, the same way the old `CONFIG` is at `.ufo/waves/round-21/measure-c1.mjs:11-17`. The mapping is: pending na-pending; Completed na-click / na-requestsubmit / na-native-submit / na-delayed / auto-positive; Canceled na-reset / na-remove; Error na-reject / na-throw / na-invalid-submit / auto-invalid.
  - L1 should cross-compare `.ufo/waves/round-22/fixtures/expected.json` (BuildSelftest, a different author) against `semantic-expectations.json` per case, by exact equality.
  - Wording: exact `errorText`/`output` strings are **snapshot pins copied from the observation**, not independent predictions. Only the class mapping is design-independent.

## F3 — the oracle must be bound to the retained round21 acquisition, so a new browser run cannot earn credit

- **Counterexample.** If digests are checked only through links inside the evaluated revision (receipt → raw), a fresh run with new nonces and invocation IDs would also score 12. The contract says "No new browser run".
- **Correction.** Pin these as code or fixed-expectation constants:
  - receipt sha256 `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`
  - execution `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`
  - producer `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`
  - the 12 invocation IDs and per-case raw/fixture sha256 values from `corpus/evidence/round-21/runtime/receipt.json`
- **Consequence to accept.** Against the real tree, the semantic predicates then check a constant. They are exercised only by the selftest's coherent mutants, which must also edit the pin set inside the disposable repo. Report it that way. Any mismatch must emit `evidence_binding`, never credit.

## F4 — actual-data traps that a naive predicate gets wrong (so that "Values12 only after explicit actual semantics" holds)

All of these come from `corpus/evidence/round-21/runtime/*.json`.

- **na-delayed.**
  - Frames seq15 `delayed-before-release` (formActive true), seq16 `release`, and seq17 `toolResponded` share the **same `at` = 1792590715100**.
  - "Response after release" is provable only by **seq** order. A strict `at`-greater-than predicate rejects the actual data. A `>=` predicate admits an early-response mutant at the same millisecond.
  - The delayed observation is **not in the receipt summary**. The oracle must read the raw `pageObservations` and must also check delayed→raw equality. Otherwise `semantic_delayed` is unbound.
- **auto-positive / auto-invalid.**
  - The response arrives at seq12, **before** pre-action seq13, with `preAction.responseCount` 1 and pre formActive false.
  - A predicate that expects the response inside the after-window only, or a pre-count of 0 for all cases, is wrong for these two.
- **na-native-submit.**
  - The response (seq16) comes after `Page.frameNavigated` to `/landing?q=8a5839ad…` (seq15).
  - `output` is an **array** `[{"dummy":"landing"}]`.
  - The post page lacks the `submits`, `errors` and `nonce` keys, so the receipt has `after.submits` = **null**, not `[]`.
  - The receipt `requests` list contains `GET /landing?q=<nonce>`. This is an optional corroborating binding.
- **na-pending.**
  - There is no `toolResponded` for the invocation, `after.windowMs` = 503, and the frames end at after-action seq15.
  - The claim is only "no response within ≥500 ms after-window". Teardown is unrecorded. Any note text saying "never resolves" or "indefinite pending" contradicts the retained reject at `corpus/lessons/round-21.md:52`.
- **na-invalid-submit / auto-invalid.**
  - The `errorText` values end in `".. "` with a **trailing space**: "Form validation failed: q: Please fill out this field.. ".
  - A comparator that trims or normalizes whitespace admits mutants, so comparisons must be exact.
  - These strings are locale-bound Chromium messages. Scope them to the recorded build.
- **na-reject / na-throw.**
  - Besides the response `errorText`, `pageState.errors` holds `Uncaught Error: dummy rejection` and `Uncaught Error: dummy submit handler throw` respectively.
  - Decide explicitly whether `semantic_error` covers page errors. Leaving it unstated means a mutant that deletes one would pass silently.

## F5 — keep the old counter frozen and avoid identity changes

- **Counterexample.** Edits made for the new note could change round21 state:
  - Adding the new note to the S101 backlink cell (`corpus/SOURCES.md:115`).
  - Changing `SKILL.md`'s canonical pointer.
  
  The old counter reads both files (`INPUT_PATHS` at `.ufo/waves/round-21/measure-c1.mjs:33`; the 13-cell and backlink checks at lines 87–91).
- **Acceptance checks.**
  - `.ufo/waves/round-21/measure-c1.mjs` stays byte-identical (sha256 `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`). The new oracle does not import from it.
  - The old counter at the integrated head still returns clean 12, exit 0.
  - Row S101 keeps 13 cells and both existing backlinks. Append only.
  - `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` (sha256 `39a19b0f…0ec4`) remains the canonical observation entry, as stated at `SCORECARD.md:1012-1013`. The new round22 note is an oracle note that cites it. It must not supersede it.
  - The knowledge-file count +1 from the new note (`node .ufo/waves/round-20/counts.mjs REV`) must not be reported as admission or expansion growth.
  - The note header carries S101 only, with no new producer claim. S100 is not re-opened as fresh source diversity.

## F6 — the review-chronology classifier would acquire orchestration authority (outside province)

- **Counterexample.** The BuildDebt prompt (`w1-spec.json`) asks for "ordered events per seat include every failure and subsequent message/activity … first-terminal and latest observed status". That is wave and seat lifecycle semantics.
  - `../kumitate-shokunin/PROVINCE.md:3` defines kumitate's domain as "orchestration & tooling — scopes OMP task/hub, ufo-fsd scripts & runtime".
  - `../mori-shokunin/PROVINCE.md:46` (FR3) says "kumitate owns orchestration/result semantics" and gives mori settlement-shape grading.
  - Tabi's `PROVINCE.md` covers browser and web-interaction craft and says "Out of province → report, never absorb".
- **Acceptance boundary.**
  - **In scope for tabi:** the narrow evidence comparison of the reviewed producer digest and review-return time against tabi's own acquisition producer digest (`bc11e4d6…`) and `startedAt` (`2026-10-21T13:51:46.597742+00:00` in `runtime-execution-finalized.json`). Inputs are fixed tabi round21 paths. Output is `review_scope_gap` or `bound`. There is never a "final-reviewed", settled or quiescent verdict.
  - **Route to kumitate (and mori for settlement shape), not implement:** per-seat event ordering, wake/broadcast classification, and first-terminal versus latest status across fleet seats. The debt correction itself stays an append-only lesson/LOG text citing `round21-closure.json` `wave_conformance_debt`.
  - The tool must not read the swarm registry, `history://`, fleet or sibling paths. Exit 0 must not be presented as completeness or authenticity certification.
- **Impacted axes.** Adjacency (absorbing a sibling's ground) and operability (a new general tool claimed).

## Acceptance boundary for L1 (all reachable in one post-integration run)

1. New CLI at `5f585773…`: verdict baseline, value 0, exit 0. At the integrated head: clean, 12, exit 0.
2. Old counter at the integrated head: clean, 12, exit 0. Its sha is unchanged.
3. Selftest coherent mutants fire **named semantic findings**, not `evidence_binding`. At minimum:
   - same-millisecond early response in na-delayed
   - auto response moved to after pre-action
   - native output given as an object, or submits as `[]`
   - trimmed `errorText`
   - pending with a response, and pending with `windowMs` below 500
   - reset or remove changed to Completed
4. A fresh-acquisition mutant (new nonce and invocation ID, all links coherent) gives `evidence_binding` or `case_set`, value 0.
5. Prefix and frozen checks from F5 hold.
6. Claim text includes "same 12 round21 observations, non-additive; no new browser run, branch coverage, capability, or orchestration authority".

**Strongest falsifier the canonical judge should apply.** If the round22 SCORECARD or closure text, read next to round21 C1, adds up to 24 lifecycle observations or "depth improved twice" on these bytes, reject the depth credit and keep only the enforcement gain.

No tools were installed or updated.
