# WHATWG form submission and `requestSubmit()` — C1 source finding

**Verdict (normative, conditional):** `HTMLFormElement.requestSubmit()` follows the form-submission algorithm with its `submitted from submit() method` parameter left at its default `false`; interactive constraint validation therefore runs unless the submitter's no-validate state is true. A negative validation result returns before the `submit` event. `form.submit()` explicitly sets that parameter to `true`, bypassing the whole validation-and-submit-event block. The standard alone does **not** establish which DOM submission method Chromium's WebMCP `toolautosubmit` uses, so the actual agent-invoked path remains unresolved by this source.

## Source and retained body

- Primary URL: <https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm>
- Companion method definition: <https://html.spec.whatwg.org/multipage/forms.html#dom-form-requestsubmit>
- Access date: **2026-10-21**.
- The primary page identifies itself as the HTML Living Standard last updated **20 October 2026** (decoded page line 17).
- WHATWG HTML repository HEAD observed via GitHub API: `c6c3055c1287bf50070260d53555d8d6ab530771`, commit date `2026-10-20T12:57:52Z`. This is a repository revision anchor; I did not verify the build's exact source-revision mapping.
- Primary response was fetched with curl transfer decompression (`--compressed`); decoded body: **466,321 bytes**, SHA-256 `af71cc015c6203cc9d6c04822ec277a7969d6b594205e2ab0e557be4e2295b92`. Retained compressed copy: `.ufo/waves/round-19/w1/SrcWhatwgSubmit.body.gz` (61,206 bytes; SHA-256 `346c31d2922aec4e327243a693ac98bb7cc12fa8604f6400ab74871bb2ba45b3`).
- Companion `forms.html` decoded body: **192,872 bytes**, SHA-256 `10c102a442621c52863729076315f89ba1651318b143eb289a821afde8914b18`. Retained compressed copy: `.ufo/waves/round-19/w1/SrcWhatwgSubmit.forms.body.gz` (24,779 bytes; SHA-256 `a1c854b426f95f8c582e141cd5ef33895fb24dbb06ed6b2df27276e2c6d8fe6b`).
- No tools installed or updated.

## Line-numbered map of relevant branches and statements

Line numbers below are from the retained decoded WHATWG HTML response bodies; section fragments are linked above.

| Source section / lines | Statement or branch | Consequence |
|---|---|---|
| `forms.html` §4.10.3, 727–735 | The explanatory contrast says `submit()` bypasses interactive validation and does not fire `submit`; `requestSubmit()` includes interactive validation and a `submit` event, either of which can cancel submission. | Directly distinguishes the two DOM APIs; the prose does not define WebMCP's API choice. |
| `forms.html#dom-form-submit`, 854–856 | `submit()` calls the submission algorithm with `submitted from submit() method` set to `true`. | Causes the algorithm's `false`-guarded validation/event block to be skipped. |
| `forms.html#dom-form-requestsubmit`, 860–870 | With non-null `submitter`, first require a submit button (otherwise `TypeError`) and require its form owner to be this form (otherwise `NotFoundError`). If null, set submitter to this form; then submit this form from that submitter. The call does not supply the optional `submitted from submit() method` argument. | By the algorithm's default at 2643–2645, `requestSubmit()` uses `false`; a supplied button is the relevant submitter for its form attributes. |
| `form-control-infrastructure.html#form-submission-algorithm`, 2643–2645 | The algorithm parameter `submitted from submit() method` is optional and defaults to `false`. | This is an optional algorithm parameter in this snapshot, not a persistent form flag. |
| Same section, 2647–2648 | Early returns for a form that cannot navigate, an already-constructing entry list, or an active sandboxed-forms flag. | These stop submission before validation. |
| Same section, 2649–2655 | Only when the parameter is `false`, return if submission events are already firing; otherwise set that guard and mark submittable fields' user validity true. | `requestSubmit()` reaches this branch; `submit()` with `true` skips it. |
| Same section, 2657–2664 | If the submitter's no-validate state is false, interactively validate; a negative result resets the event-firing guard and returns. If no-validate is true, that validation step is skipped and processing continues. | Invalid constraints block the subsequent `submit` event; no-validate skips validation, not the rest of this branch. |
| Same section, 2665–2672 | Prepare the submitter button, fire a bubbling/cancelable `submit` event, clear the event-firing guard, return if canceled, and recheck navigation eligibility. | A successful validation (or no-validate skip) reaches an event that can still cancel submission. |
| `form-control-infrastructure.html#attr-fs-novalidate`, 586–593 | `novalidate` and `formnovalidate` are boolean attributes. The no-validate state is true for a submit button with `formnovalidate`, or when the element's form owner has `novalidate`. | These attributes suppress interactive validation through the algorithm's no-validate-state test. |
| `forms.html#the-form-element`, 624 | The `novalidate` form attribute is described as bypassing form-control validation for form submission. | Confirms the form-level attribute's stated scope; the algorithm still tests the submitter's no-validate state. |
| `form-control-infrastructure.html#constraint-validation`, 2273–2290 | Statically validate submittable controls in tree order; skip non-candidates, continue for valid controls, collect invalid controls; return positive if none; otherwise fire cancelable `invalid` events and return a negative result with unhandled invalid controls. | Describes the result consumed by interactive validation; it is not an exemption for agent-driven calls. |
| Same section, 2294–2312 | Interactive validation runs static validation; returns positive when valid; otherwise reports at least one unhandled problem and returns negative. | Combined with 2657–2664, negative validation stops form submission before `submit`. |

## Verbatim quotations

1. `“this method includes interactive constraint validation and firing a submit event, either of which can cancel submission.”` — `forms.html`, lines 732–735, `#dom-form-requestsubmit` descriptive paragraph.
2. `“submitted from submit() method set to true.”` — `forms.html`, lines 854–856, `#dom-form-submit` method steps.
3. `“If submitted from submit() method is false:”` — `form-control-infrastructure.html`, lines 2649–2650, §4.10.22.3 Form submission algorithm.
4. `“If present, they indicate that the form is not to be validated during submission.”` — `form-control-infrastructure.html`, lines 586–587, §4.10.19.6 Form submission attributes.

## Proposed SOURCES row (11-column contract)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | WHATWG HTML form submission algorithm — https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm | spec | A | Normative HTML `requestSubmit()`/`submit()` and constraint-validation branch only; not WebMCP invocation wiring | Living Standard updated 2026-10-20; accessed 2026-10-21; whatwg/html HEAD `c6c3055c1287bf50070260d53555d8d6ab530771`; §4.10.22.3 lines 2643–2672 and §4.10.21.2 lines 2273–2312; linked `forms.html#the-form-element` line 624, `#dom-form-requestsubmit` lines 860–870, and `#dom-form-submit` lines 854–856; decoded hashes above | `requestSubmit()` leaves the optional submit-method parameter at default false and reaches interactive validation unless the no-validate state applies; `submit()` sets true and skips validation plus the submit event. Does not establish WebMCP `toolautosubmit` wiring. | queued | 2026-10-21 | 90d | — |

## Limits / method

This source answers the HTML API semantics, not the implementation mapping from a WebMCP agent invocation or `toolautosubmit` to `requestSubmit()` versus `submit()`. That mapping needs separate Chromium/WebMCP implementation evidence or a runtime observation; it is not inferred here. The `lsp` device was not available in the mounted tool routes; search output was used only to locate numbered lines, and the findings above are based on rereading the primary spec text.

## Isolation

- Clone/branch/commit: **none**; this source-only scout produced no production file and made no git writes.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb` (PLAN.md).
- Changed repository paths: none. Only assigned seat artifacts were written under `.ufo/waves/round-19/w1/`: `SrcWhatwgSubmit.md`, `SrcWhatwgSubmit.body.gz`, and `SrcWhatwgSubmit.forms.body.gz`.
- Temporary fetched bodies are under `/fast/scratch/tabi-r19/SrcWhatwgSubmit/`.
