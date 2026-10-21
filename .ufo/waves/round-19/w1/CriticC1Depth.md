# C1 depth counter-review

## Verdict

**C1 can be a depth claim, but the proposed `c1_validation_rows` rule does not measure depth yet.** AXES.md defines depth as verifiable technical detail, including decision tables with real thresholds, named error signatures and citations; coverage measures which domain surfaces the skill governs (AXES.md:9-12). A precise table of observed, actionable declarative-form validation rules on this already-covered Chromium/WebMCP surface fits depth and should not earn coverage merely for adding rows or sources. If the measure instead treats every input class as a new surface, it is coverage-like and needs a different claim. State this boundary explicitly; leave coverage unchanged.

## Strong counterexample to the written count

PLAN.md:18-28 credits a table row when it appears beneath the heading, names at least one passing receipt case with observed CDP status/error text, cites an opened same-build primary source row with a line anchor, and the receipt's producer hash/runtime identity match. There is no stated requirement for distinct case IDs, distinct decision rules, a validation-relevant question, agreement between the table answer and the linked case observation, or a source passage that supports that answer.

Therefore one passing case can be copied into twelve rows. For example, use a valid one-field declarative form input, record its observed `Completed` response and one submission, set the case expectation to that observation, then repeat the same case ID under twelve freeform questions/answers and cite S071's Chromium source. The receipt can pass while none of those rows tests rejection or a validation boundary. The written predicates still accept twelve rows. This is a logical counterexample to PLAN.md's criteria, not a run of the absent round-19 counter.

The case contract also trusts case-authored expectations (PLAN.md:96-103, 109); `pass:true` means observed values matched those expectations, not that the expected behavior was independently derived. A passing case that always errors, a valid-input-only case, or an arbitrary outcome can be made self-consistent unless the counter establishes the expected result independently.

## Source and identity attacks

- **Same case / trivial row:** `case id` is a lower bound of one, not a uniqueness rule. `question` and `answer` are not required to express a decision, distinguish the linked observation, or add detail that a reader can act on.
- **Unsupported citation:** criterion (c) checks source-row date, source kind/build and presence of a line anchor, not entailment. A row can cite S071's unknown-parameter error lines while asserting a different behavior. The local dossier explicitly notes a limit: custom elements return true from `ValidateParameterData` (S071 dossier: `.ufo/waves/round-18/sources/DeclarativeValidation.md:38`; source is Chromium tag 154.0.8037.97 `form_mcp_schema.cc`, lines 289-292). Thus merely citing the opened Chromium file cannot support a blanket claim that every control is validated.
- **Row/case source mismatch:** each case carries its own source `{file, lines, url}` (PLAN.md:102), but the row predicate only requires a `S###` citation. The plan does not say these must identify the same source passage, much less the passage that supports the decision.
- **Receipt provenance:** matching a receipt's claimed producer SHA to the script blob proves an identity string, not that this receipt was produced by that script. The written counter contract does not require a rerun/reproduction or otherwise authenticate the observed fields; a hand-authored JSON receipt can assert `pass:true` and the expected runtime fields.

## Is 12 honest?

**Not established by the plan or baseline.** The round-18 correction is careful that S071 supplies source-level evidence, not a runtime validation probe or general JSON Schema proof (SKILL.md:1994-1997; source-recheck-round-18.md:172). The S071 dossier documents two distinct rejection branches at `FillData` (unknown parameter and invalid value), plus a type-specific limit; it does not provide a pre-inventoried set of twelve non-overlapping runtime decisions. Twelve may become honest if twelve distinct, useful decision rules are actually demonstrated, but a twelve-row threshold alone is arbitrary and gameable. Current baseline remains zero under the stated absent-heading rule (PLAN.md:27), not twelve or any inferred runtime result.

## Smallest safe correction

1. Count **unique, predeclared decision IDs**, not Markdown rows. Define the finite C1 decision inventory before counting; one ID has one behavior condition, one distinct observable outcome/error signature and an actionable SKILL rule. Duplicate IDs count once. A case ID may support at most one credited decision unless the receipt has separate, non-overlapping assertions for each decision; then count the assertion, not the shared case reference.
2. Bind each row to its case's exact ID, input, expected/observed status and error text, and require the table answer to be derived from those observed fields. Make the counter compare expected outcomes against an independently maintained decision manifest, not only the case author's `expect`. Require a relevant invalid-input observation and a successful control for the same validation path/family; controls do not earn rows.
3. Give every decision ID an explicit source proposition and exact tag-pinned file/line range in a checked-in allowlist. Counter-check the source body/hash and anchor, and make the allowed passage-to-decision mapping explicit. A source being opened on the right date is not source support. Keep source fact, runtime observation and any inference separate. Relevance/entailment of free prose cannot be established by row counting; require a named non-author reviewer to approve the finite mapping, or constrain rows to the reviewed allowlist.
4. Reproduce the exact committed harness + cases + fixtures under the pinned runtime into a fresh temporary receipt during measurement (or verify equivalent run-authenticity evidence), then compare its case set, inputs, observed fields and producer/case digests to the committed receipt. Do not accept a self-reported receipt SHA identity as proof of execution.
5. Report `c1_validation_rows` only as the number of unique eligible decision IDs. Retain `>=12` only if the predeclared inventory has at least twelve independently supported decisions; otherwise set the target to the defensible count or make the unmet target visible. Do not turn subcases or repeated source citations into a depth increase.

## Evidence anchors

- C1 row predicate and target: `.ufo/waves/round-19/PLAN.md:18-28`.
- Case fields / fixture expectations: `.ufo/waves/round-19/PLAN.md:90-119`.
- Axis boundary: `/home/vgpnk/Projects/shokunin/AXES.md:9-12`.
- Prior qualification: `SKILL.md:1994-1997`; `corpus/knowledge/source-recheck-round-18.md:172`.
- S071 source dossier: `.ufo/waves/round-18/sources/DeclarativeValidation.md:7-12,14-24,30-38`. Its `form_mcp_schema.cc` decoded source SHA-256 is `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`; URL is `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`. Dossier records the fetch date as 2026-10-20; no new external fetch was performed for this review.

## Isolation

Report-only, written to the assigned seat artifact under `.ufo/waves/round-19/w1/`. No production files, clone, branch or commit were created.
