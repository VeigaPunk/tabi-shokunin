# CounterHtml — static falsification

## Axes and scope

Axes: C1 finite-observation identity; fixture/receipt correlation; toolautosubmit-family discrimination; action-dispatch/acknowledgement identity; semantic-versus-mechanical scope honesty. Reviewed current producer/counter, persisted positive fixture and independent expected oracle, selftest, current runtime HTML/JSON, and knowledge note. No counter, selftest, browser, build, lint, or format run was performed. Findings below are static predictions, not observed CLI results. No tools were installed or updated.

## 1. Quoted attribute value can impersonate toolautosubmit

**Concrete attack.** In `fixtures/positive-ordered.json`, use the file key `corpus/evidence/round-21/runtime/auto-positive.html`, currently exactly `<form toolautosubmit>fixture-nonce-independent-10</form>`. Replace only its opening tag with `<form data-note=" toolautosubmit ">`. Refresh that case evidence's `fixture.sha256`, then its receipt `evidence.sha256`; preserve every other field/frame/summary. The actual boolean attribute is now absent, but the counter's whitespace-based regex still sees the token inside an unrelated quoted attribute value.

**Evidence.** `.ufo/waves/round-21/measure-c1.mjs:72-77` fixes the autosubmit family in metadata and hashes the fixture, but extracts the first textual form tag with `/<form\b[^>]*>/i` and checks `/(?:\s)toolautosubmit(?:\s|=|>)/i` against the whole tag, including quoted values. The persisted positive fixture's named HTML value and corresponding `.json` fixture path/hash were inspected as JSON data. Current real `corpus/evidence/round-21/runtime/auto-positive.html:2` has a genuine `toolautosubmit` attribute, whereas `na-pending.html:2` does not. Producer `scripts/webmcp-lifecycle-round21.mjs:105-108` emits the actual attribute from its boolean argument. The existing red control `selftest-c1.mjs:53` merely inserts a bare token into `<form>`; `fixtures/expected.json:154` expects `fixture_digest` only for that simpler toggle.

**Static expected behavior.** [INFERENCE] The proposed quoted-value mutant currently remains clean/value12/exit0: its replacement still satisfies the regex, the nonce remains, and refreshed digests satisfy byte checks. Required red expectation: `exit:1`, `value:0`, finding `fixture_digest` (detail `auto-positive:autosubmit`). L1 must execute before claiming an observed outcome.

**Impacted axes.** Mechanical fixture-to-case autosubmit identity, not browser semantic coverage or source-to-binary provenance.

**Smallest safe correction.** Recognize attribute names outside quoted values when checking the selected form's boolean attribute; preserve HTML boolean semantics (`toolautosubmit="false"` is still present). Add the one finite quoted-value red case to the independent oracle and selftest. A naive word-boundary replacement is insufficient. A paired non-autosubmit green fixture containing `data-note=" toolautosubmit "` would guard against the symmetric false rejection. Do not expand this into arbitrary JavaScript execution/authenticity validation. If arbitrary HTML is intentionally unsupported, explicitly reject non-producer-shaped tag syntax rather than silently classifying quoted text as an attribute; account for the intentionally minimal synthetic fixtures when choosing that restriction.

## 2. Action-complete identity is unbound to the dispatched action

**Concrete attack.** Starting with persisted positive `na-pending`, change just the `action` field on its sole `dir:"action-complete"` frame from `"none"` to `"submit"`. Refresh the raw case JSON digest in the receipt. Keep the case action, dispatch action, phase, sequences, clocks, observations and summaries unchanged. This is the smallest action-family substitution: the transcript now acknowledges native submission for a no-action observation.

**Evidence.** `measure-c1.mjs:90-94` selects one completion frame and enforces `action.seq < completed.seq < post.seq`; it checks `action[0].action === c.action` and its phase but never checks `completed[0].action`. The completion payload does carry the action: producer `webmcp-lifecycle-round21.mjs:219-221` writes `{ action }` after awaiting the chosen operation. Current actual `runtime/na-click.json:187-189,209-210` records both dispatch and completion as `click`. In the persisted positive fixture, the `na-pending.json` completion object is `{dir:"action-complete",action:"none",at:1252,seq:6}`. `selftest-c1.mjs:51` changes the case/dispatch family; `:87-88` exercises phase and missing completion, not a completion naming a different family. `fixtures/expected.json:152,166-167` likewise has no wrong-completion-family oracle.

**Static expected behavior.** [INFERENCE] This mismatch currently remains clean/value12/exit0 because no predicate reads completion.action. Required red expectation: `exit:1`, `value:0`, finding `order_mismatch` with the existing case-action detail. L1 must execute it; no run is claimed here.

**Impacted axes.** Mechanical action/acknowledgement correlation; distinct click/requestSubmit/native-submit/no-action identities. It does not establish whether a browser really executed an action.

**Smallest safe correction.** Extend the existing action-order predicate by `completed[0].action !== c.action` and add one independently persisted wrong-completion-family expectation/mutator. Existing missing-completion short-circuiting should remain safe. No new finding ID or runtime acquisition is necessary for this static consistency fix.

## Boundary: do not turn the observation counter into a semantic judge

The counter header (`measure-c1.mjs:2`) and note (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:100-106`) explicitly distinguish finite retained relationships from semantic entailment/authenticity. The positive fixture even uses `"fixture producer, never executed"` as producer bytes and minimal HTML, rather than pretending to be a real acquisition. Coherently replacing response statuses, handler bodies, or every action label plus all mirrored summaries would therefore not alone prove a defect in this mechanical metric. The two attacks above are narrower: the counter already claims to check precisely the attribute identity and completion relationship that they bypass. They are fixable defects, not grounds to demand twelve novel branches, a coverage percentage, source-binary equivalence, or malicious-author authenticity. No admission/judgment is made.

Report: .ufo/waves/round-21/w2/CounterHtml.md
