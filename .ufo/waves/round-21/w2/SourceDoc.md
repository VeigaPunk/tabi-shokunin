# SourceDoc — official declarative documentation versus current fixture

Axes: publisher grounding; fixture-to-claim fidelity; bounded response correlation; explicit unmeasured contracts. Read-only inspection; no execution, browser, registry/source-row changes, or production downloads. No tools installed or updated.

## Opened external sources

Access date for both: 2026-10-21. Quotes below total no more than 25 words per external source.

1. https://developer.chrome.com/docs/ai/webmcp/declarative-api — Chrome for Developers, “Declarative API,” displayed last update 2026-09-25. Located at **Submit the form**. Quotes: “The user must manually click Submit to complete the task.” and “The resulting value is then serialized and returned to the model”. The section also describes agentInvoked as true when an AI agent triggers a form, and requires preventDefault before respondWith. These are current publisher statements, not a version-pinned contract for the retained Chromium154 build.
2. https://developer.chrome.com/docs/ai/webmcp/best-practices — Chrome for Developers, displayed last update 2026-05-18. Located at **Eval testing and debugging**. Quote: “evaluations cannot be hard-coded, as outputs can take unanticipated forms.” This supplies evaluation guidance, not additional SubmitEvent semantics.

A targeted official-site submitter search returned no matching official result and relaxed its constraint; a differently worded retry returned secondary commentary. Neither search summary is treated as source authority. No secondary result was opened.

## Concrete attacks and findings

### 1. Attack: turn “manual Submit” guidance into a human-only completion guarantee

**Observed, high confidence:** The current fixture completes after page-script requestSubmit, not only an input click. `scripts/webmcp-lifecycle-round21.mjs:202-204` invokes the tool and refuses a missing invocation ID; `:213` calls requestSubmit without an argument. Current raw `corpus/evidence/round-21/runtime/na-requestsubmit.json:167-195` records pre-action state and requestSubmit acknowledgement, `:197-210` records correlated Completed output, and `:219-225` records agentInvoked=true and isTrusted=true. Invocation ID is DE3108EE3368EA4B38BE5A3FE48F7178; response seq15 precedes after-action seq16. Receipt selector `.cases[] | select(.id=="na-requestsubmit")` records 254ms pre-action, zero pre-action responses, and 503ms after-action.

**Inference:** Documentation's ordinary user-flow wording cannot establish that a human must be the actor in this fixture. Nor does its one-way description of agentInvoked establish that every true flag identifies the immediate submitting actor. The existing knowledge note already avoids both overclaims at `corpus/knowledge/webmcp-nonautosubmit-round-21.md:33-34,81-85`. This attack identifies a boundary, not a contradiction in the note.

### 2. Attack: infer SubmitEvent.submitter identity from the button, focus, or agentInvoked

**Observed, high confidence:** Retained `corpus/evidence/round-21/runtime/na-requestsubmit.html:2-3` has one submit button; `:7-15` records agentInvoked/isTrusted/value/active/respondWith type, but never records event.submitter. Producer `fixture()` at `scripts/webmcp-lifecycle-round21.mjs:105-121` has the same omission. Its callers use click at `:212`, argumentless requestSubmit at `:213`, and native submit at `:214`. The current raw pre-action observation reports focused="go" (`na-requestsubmit.json:181`), which is not a submitter observation.

**Unresolved:** No retained observation establishes submitter's nullness, identity, selection algorithm, or equivalence between click and requestSubmit. The opened official declarative page does not specify SubmitEvent.submitter behavior. No current knowledge-note claim requiring that equivalence was located. Do not upgrade the existing response/event evidence into submitter-contract coverage.

### 3. Attack: equate every Completed output with respondWith, or equate a response with navigation

**Observed, high confidence:** `na-requestsubmit.html:9-15` calls preventDefault before resolving the dummy object through respondWith. Raw output at `na-requestsubmit.json:203-208` matches that object and nonce. Receipt's matching case has no navigation. This is consistent with the official response description, but observes the CDP result, not an actual model consuming it.

The native-submit case is distinct: producer serves landing JSON-LD at `scripts/webmcp-lifecycle-round21.mjs:135-137`. Raw `corpus/evidence/round-21/runtime/na-native-submit.json:223-249` records Completed with [{"dummy":"landing"}], then landing-page state without the original observations. Receipt selector `.cases[] | select(.id=="na-native-submit") | .after` retains submits=null and navigation independently. The opened documentation's respondWith prose does not establish the JSON-LD extraction rule. The note correctly labels this mapping runtime evidence at `corpus/knowledge/webmcp-nonautosubmit-round-21.md:35`.

**Bounded-correlation inspection:** Producer `:208,224-225` cuts response summaries at post.seq and matches invocationId. Counter `evaluate()` at `.ufo/waves/round-21/measure-c1.mjs:80-96` checks invoke identity, ordered events and corresponding summaries. Static controls at `selftest-c1.mjs:63-84` and `fixtures/expected.json:160-164` distinguish ignored late/foreign responses from improperly summarized responses and response-before-invoke. These controls were inspected, not executed. They are correlation controls, not submitter semantics or output-content conformance checks.

## Limits and disposition

No production change requested. Preserve current finite-observation wording; reject any promotion to human-only submit, identified submitter, model-delivery, or generic JSON-LD contract on this evidence. S101 remains own-work; these opened docs do not authenticate acquisition or prove source/binary equivalence. No reset/removal implementation claim made.

LSP unavailable: opening xd://lsp returned “No such tool”; no server was available to warm up or retry. Definition/callsite anchors above are literal source/data inspection, not semantic-reference proof. No builds, counter/selftests, linters, formatters, or runtime scenarios were run. No actor-quiescence claim.

Report: .ufo/waves/round-21/w2/SourceDoc.md
