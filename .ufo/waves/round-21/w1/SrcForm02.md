# S100 source slice: `html_form_element.cc:189–210`

## Source identity and comparison

- **URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
- **Accessed:** 2026-10-21. Retrieved the Gitiles `format=TEXT` response and base64-decoded it as data into `/tmp`.
- **Decoded SHA-256:** `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- **Retained comparison:** `corpus/evidence/round-20/sources/html_form_element.cc` has the same decoded SHA-256 and line count (1,740); lines 189–210 match the fetched source. No source file was added to production.

## Located quote

At `html_form_element.cc:200` (13 words): “Success. Now we can either submit the form or focus the submit button.”

## Observed source behavior in this slice

`FillFormControls` runs inside a `CEReactionsScope`. When it returns an error, this path immediately runs `done_callback` with `base::unexpected(error.value())`. When filling succeeds, the code sets `is_currently_running_`, stores the active submit button, changes the form's tool-active pseudo-state (and the button's when present), and stores the callback in `done_callback_` for later handling. The adjacent comment is explicitly a TODO: it says the decision should key off the `autosubmit` attribute; the attribute-to-branch implementation is outside this slice.

## Relevance and limits for round-21 fixed12

This is source evidence for an early lifecycle fork shared by cases whose fill either returns an error or succeeds. It may be relevant to `na-invalid-submit` and `auto-invalid` only if their input actually makes `FillFormControls` return an error; this slice does not establish that mapping. On success, it records active form/button state and retains a callback before later handling, which is relevant context for observing the non-auto and auto cases, but does not establish which path any case takes.

**Unsupported inference:** These lines do not prove any of the 12 runtime outcomes, that a response will arrive (or fail to arrive within a finite interval), how `require_submit_button` maps to the `toolautosubmit` attribute, the later submit/click/reset/remove/settlement effects, or any particular CDP status. Those require evidence from the later source path and, for the fixed12 observations, their captured runtime evidence. The source URL/hash is a repeat of S100/S078's same tagged source, not independent source corroboration.

Report path: `.ufo/waves/round-21/w1/SrcForm02.md` (relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`).