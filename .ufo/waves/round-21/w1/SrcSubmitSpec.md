# SrcSubmitSpec — WHATWG form submission boundaries

Axes: API-path distinction; validation preconditions; finite-observation/evidence limits.

## Observed source facts

- The WHATWG HTML Standard describes `HTMLFormElement.submit()` as: “Submits the form, bypassing interactive constraint validation and without firing a `submit` event.” Source: [HTML Standard, §4.10.3, `form.submit()`](https://html.spec.whatwg.org/multipage/forms.html#dom-form-submit), accessed 2026-10-21 (15 words).
- The same section states that `requestSubmit()` includes interactive constraint validation and fires a `submit` event; either can cancel submission. Its optional submitter can affect submission via its form attributes and be included in the entry list. Source: [HTML Standard, §4.10.3, `form.requestSubmit()`](https://html.spec.whatwg.org/multipage/forms.html#dom-form-requestsubmit), accessed 2026-10-21.
- In the normative form submission algorithm, when submission is not from `submit()`, the user agent first interactively validates unless the submitter's no-validate state applies. A negative validation result returns before the algorithm fires `submit`; otherwise it fires a cancelable `submit` event and returns if canceled. `novalidate` on the form and `formnovalidate` on a submit button determine that no-validate state. Sources: [HTML Standard, §4.10.19.6, form submission attributes](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-attributes), and [§4.10.22.3, form submission algorithm](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-2), accessed 2026-10-21.
- Interactive validation processes candidate controls, fires `invalid` at invalid controls, and reports at least one unhandled problem to the user. User agents may focus an invalid element and may change scrolling; focus is not guaranteed. Source: [HTML Standard, §4.10.21.2, constraint validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraint-validation), accessed 2026-10-21.
- The form submission algorithm can return before planning navigation (including when the form cannot navigate, when the sandboxed-forms flag is set, or when action/target resolution fails); planned navigation is queued as a task. Source: [HTML Standard, §4.10.22.3](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-2), accessed 2026-10-21.

## Constraints on the round21 finite experiment [inference]

- `na-requestsubmit` and `na-native-submit` distinguish materially different HTML paths only if the case evidence confirms the actual API invoked: `requestSubmit()` performs interactive validation and can dispatch `submit`; `form.submit()` skips both. Do not interpret a missing `submit` event as proof that the form was not submitted. Keep the recorded outcomes tied to the ordered CDP/page evidence.
- `na-click` is another submit-button activation path. Compare its observed submitter and event facts with `na-requestsubmit`; the standard does not make the two case IDs evidence of two novel lifecycle branches.
- Interpret `na-invalid-submit` and `auto-invalid` as validation-path observations only if the actual form has a candidate invalid control and neither the form nor relevant submitter suppresses validation. With interactive validation failing, the standard returns before `submit`; the experiment must not mistake that for a canceled submit handler. The spec does not establish which mechanism the round21 producer uses for either case.
- `auto-positive`/`auto-invalid` and `autosubmit` are experiment/WebMCP labels, not HTML Standard-defined modes. The standard does not establish their implementation path or any WebMCP response. Keep the named finite response window as the sole basis for a pending observation. It also does not guarantee that a submission produces a matching response or that navigation is observed within that window.
- Record direct observations separately from interpretation; in particular, do not infer focus from validation failure, or a successful navigation merely from a call to `submit()`.

## One unsupported overclaim

`ConnPlanner.md:69-70` says “`form.submit()` navigates without a submit event.” The source supports the no-`submit`-event and no-interactive-validation clauses, but not unconditional navigation: the normative algorithm has early-return conditions before it plans navigation. For round21, describe this as a submission attempt/path with navigation observed or not observed in that case's evidence, not as a standard-guaranteed navigation.

## Confidence and remaining unknowns

High confidence in the cited standard semantics. This is normative source evidence only; it does not establish current Chromium 154/WebMCP behavior or any round21 outcome. The case fixture's actual validation attributes and candidate-validity state, exact invoked API/submitter, runtime event sequence, and whether a navigation or matching response is observed remain run-evidence questions. No corpus rows were added.

No tools installed or updated.

— TabiR21.SrcSubmitSpec · trailer relative to lane root: `.ufo/waves/round-21/w1/SrcSubmitSpec.md`
