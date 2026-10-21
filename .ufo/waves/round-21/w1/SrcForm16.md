# S100 source slice: `HTMLFormElement::requestSubmit`

## Source and comparison

- **Exact URL:** <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT>
- **Accessed:** 2026-10-21. Read the Gitiles `?format=TEXT` response and base64-decoded it in memory; no source copy was added to production.
- **Decoded-body SHA-256:** `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (68,278 bytes).
- **Retained comparison:** `corpus/evidence/round-20/sources/html_form_element.cc` has the same 68,278 bytes and SHA-256; lines 843–875 match byte-for-byte after line decoding. This agrees with the S100 registry digest. S100's listed anchors end at line 842, so this requested slice is immediately outside its declared ranges; no registry row was added or changed.

**Located quote** (`html_form_element.cc:871`, 6 words): “Submit this form element, from submitter.”

## Observed source behavior (lines 843–875)

- The no-argument `requestSubmit(ExceptionState&)` delegates with a null submitter.
- With a supplied submitter, the overload requires a form control that `CanBeSuccessfulSubmitButton()`; otherwise it raises `TypeError` and returns. It then requires that control's form owner to be this form; otherwise it raises `NotFoundError` and returns.
- With no submitter or one passing both checks, the method calls `PrepareForSubmission(nullptr, control)` at line 872.
- This slice contains no WebMCP completion callback, response status, timer, or navigation observation. Its direct effect is entry to submission preparation; later effects are outside this slice.

## Relevance and limits for the fixed scenarios

- **`na-requestsubmit`:** if the case invokes the no-argument API, this slice shows the null-submitter path into `PrepareForSubmission`; the case's action and observed outcome must come from its runtime evidence, not this source.
- **`na-invalid-submit`:** only an invalid *submitter argument* is covered here (wrong kind or not owned by this form). A field failing constraint validation is not covered by these lines, and the case ID alone does not establish which meaning applies.
- **`na-native-submit`, `na-reset`, `na-remove`, `na-reject`, `na-throw`, `na-delayed`, `na-click`, `na-pending`, `auto-positive`, and `auto-invalid`:** this slice does not establish their triggering paths or outcomes. In particular, it does not equate `requestSubmit()` with plain `submit()` or a native button click.
- No human-only gate appears in these lines; they also do not establish a human action, user activation, eventual completion, response delivery, or any behavior beyond the call to `PrepareForSubmission`. “Pending” remains only the bounded runtime observation defined for the cases.

## Method note

The `lsp` device was unavailable (`xd://lsp` returned “No such tool”; it is absent from the mounted routes). Literal text search was used only to locate references; conclusions above are from the directly fetched and decoded source and retained line slice, not grep as semantic proof. External caller/implementation behavior beyond this slice remains unverified.
