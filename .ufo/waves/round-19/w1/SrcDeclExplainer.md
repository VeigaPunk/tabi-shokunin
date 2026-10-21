# C1 source scout — declarative WebMCP input schema

## Source identity and retained body

- Pinned permalink: https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/declarative-api-explainer.md
- Raw URL fetched: https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/declarative-api-explainer.md
- Access date: 2026-10-21.
- Pin evidence: GitHub API reported repository `main` at `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`; the API's latest commit touching this path was `f14762e63607bf96592b1a7a6392cd2b047b8209` (2026-10-16). The pinned revision is the observed `main` head; its commit file list updates `index.bs`, not this explainer.
- Decoded response body: 10,417 bytes; SHA-256 `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28`; 213 lines.
- Retained decoded body, gzip-compressed: `.ufo/waves/round-19/w1/SrcDeclExplainer.body.gz` (created from the exact fetched bytes using `gzip -n -9`).

## Line-numbered map

| Source lines | Relevant statement or branch | What it establishes / does not establish |
|---|---|---|
| 24-33 | Proposal adds attributes to forms and form-associated elements; proposes deterministic compilation to input schema; describes two response paths (`respondWith()` or JSON-LD on navigation). | Declared design goals, not implemented or normative algorithm text. |
| 38-47 | Form example names `toolname` and `tooldescription`, described as analogous to imperative tool name/description. | Tool-level metadata mapping only. |
| 49-53 | `toolautosubmit` branch: present means agent may submit after filling; absent means focus submit button and tell user to review and submit manually. | Human-confirmation branch, not a validation rule. |
| 55-57 | Inserting/removing a form with these attributes or updating the attributes creates a declarative tool with synthesized input schema. | Tool lifecycle trigger; no control reduction detail. |
| 61-67 | A form-control `name` supplies the input-schema property name; `toolparamdescription` supplies its property description. | Explicit control-to-property/name and description mapping. |
| 71-94 | Illustrative imperative/declarative equivalence: object `properties` `make` and `model` are strings with descriptions; `required: ["make", "model"]` corresponds to two named text inputs, each marked `required`. | Shows a required example, but supplies no general algorithm for required controls or other control types. |
| 101-104 | Reset OR tool declaration change cancels an in-flight invocation and notifies the agent. | Cancellation behavior, not invalid-input/error behavior. |
| 108-115 | Exact reduction algorithms and attributes such as `step`/`min` are TBD; text says `<input>` and `<select>` need reduction rules and mentions `anyOf`, `oneOf`, `maximum`/`minimum`; Chromium is implementing a “loose version” and will test/trial it. | Explicitly unresolved proposal. No concrete mapping, validation or rejection rules are provided. |
| 117-133 | Response is “currently under debate”; the details element preserves a pre-issue proposal: on navigation, first JSON-LD script is the response; absent JSON-LD fallback to page contents remains TBD; without navigation, JavaScript may use `respondWith()`. | The JSON-LD behavior is explicitly historical/proposed, not settled. |
| 137-153 | `:tool-form-active` lifetime starts while filled with agent output and ends on reset/removal, `respondWith()` resolution, declaration attribute change, or `toolautosubmit`; `:tool-submit-active` matches its submit button. | UI/lifecycle states; no validity state. |
| 157-173 | `SubmitEvent` gains `agentInvoked` and `respondWith(Promise<any>)`; `respondWith()` supplies the consumed response, prevents default navigation, and requires `preventDefault()` first. | Event response contract; no error result or rejection handling contract. |
| 175-188 | `toolactivated` is a pre-submit hook when not autosubmitting; agent cancellation fires `toolcancel`; site cancellation by removing the form or changing its name/description does not fire that event. | Cancellation/event distinctions, not validation errors. |
| 190-200 | Event target and whether events also fire for imperative calls are open questions. | Explicitly unresolved event details. |
| 202-213 | Whether declarative tools have `outputSchema` and whether `respondWith()` must conform is open; declarative visibility/invocation through `getTools()`/`executeTool()` remains TBD. | No output-schema error/validation contract or complete invocation integration. |

Text search over the complete decoded body found no occurrences of `radio`, `checkbox`, `validation`, or `error`. `select` occurs only at line 111 within the explicitly TBD synthesis discussion. The only `required` occurrences relevant to schema mapping are the illustrative JSON Schema array at line 81 and the two HTML attributes at lines 91-92.

## Evidence quotes

1. §Name and description, lines 61-62: “The `name` attribute on form control elements supplies the name of each "property" in the input schema generated for a declarative tool.” (22 words)
2. §Name and description, lines 65-66: “`toolparamdescription` attribute for form control elements, which contributes the [description](https://json-schema.org/draft/2020-12/json-schema-validation#name-title-and-description)” (10 words)
3. §Name and description, line 81: “`required: ["make", "model"]`” (2 words)
4. §Input schema synthesis, lines 108-110: “The exact algorithms reducing a form, its form-associated elements, and *their* attributes like [`step`](https://html.spec.whatwg.org/C#the-step-attribute) and [`min`](https://html.spec.whatwg.org/C#attr-input-min) are TBD.” (19 words)

## Findings and limits

**Observed:** The explainer directly maps control `name` to a schema property name and `toolparamdescription` to a property description. It illustrates `required` through one pair of text inputs and one imperative object schema. It explicitly defers the exact form/control reduction rules, including `<input>`, `<select>`, `step`, and `min`; its listed schema keywords are examples of what remains to specify. It describes optional autosubmit versus user review, invocation cancellation, and response/event paths separately from schema synthesis.

**Inference (scoped):** This source supports documenting proposal-level mapping and the proposal's unresolved status only. It cannot substantiate what Chromium 154 actually accepts, rejects, validates, or reports. S071 remains the build-source authority for Chromium's implementation claims; runtime expectations must come from the round-19 probes/receipt.

**Unresolved:** No rule is supplied for translating `required` generally, select options, radio groups, checkboxes, value constraints, HTML constraint validation, invalid/unknown parameters, validation messages, or error delivery. The excerpt also leaves response output conformance and declarative integration with imperative APIs open.

## Proposed SOURCES row (11-column contract; placeholder ID)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | WebMCP declarative API explainer — https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/declarative-api-explainer.md | docs | A | Editors' proposal-level form-to-input-schema mapping and its open status; not normative spec semantics, Chromium build behavior, or runtime validation | commit 51ed75653aaa7f174f8dbe05d1bc327359bbc57c; `declarative-api-explainer.md` lines 24-33, 49-57, 61-94, 101-115, 117-133, 137-188, 202-213; decoded body SHA-256 4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28 | Extends S073's loose-implementation status with `name` → schema property and `toolparamdescription` → property description; required is only illustrated; synthesis including input/select constraints is TBD; no radio/checkbox, validation, or error contract is stated | mined | 2026-10-21 | on-release | SKILL.md (round-19 C1 declarative validation decision table) |

## Isolation

- Clone / branch / base / commit: N/A — source-only scout; no production-file assignment, no clone created, no Git write in LANE.
- Changed paths: only the permitted seat report `.ufo/waves/round-19/w1/SrcDeclExplainer.md` and retained decoded-source artifact `.ufo/waves/round-19/w1/SrcDeclExplainer.body.gz`; no production files were written.
