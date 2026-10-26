# Draft superseding registry row for S078 — NOT written to corpus/SOURCES.md

Drafted by PinS078 (round 29, wave w1) under claim C3. This file is not registry content: the id
`S1NN` is a placeholder for the allocator, and no line of `corpus/SOURCES.md` was changed by this
seat. `entry.json` carries `"superseded_by": "S1NN"` (not the template's `null`) because range
`174-328` drifted; the frozen `scripts/check-release-pins.mjs` resolves a drifted row only when
`superseded_by` names a registry row whose teaches cell opens `supersedes S078 —` and whose source
carries `refs/tags/156.0.8078.47/`. Until the allocator appends this row and rewrites the
placeholder to the real `S1xx` id, the counter reports `s1-drift-unsuperseded` for S078.

Drift that forces the supersession: at tag `156.0.8078.47` the 154 anchor range `174-328` no longer
occurs contiguously (a 10-line document-detached guard is inserted after old line 197, i.e. 156
lines 201-210, so old 174-197 sits at new 175-198 and old 198-328 at new 209-339); range `635-842`
holds byte-identically at 156 lines `673-880` (`cmp` exit 0). Decoded sha256 of the same path
changed `8c8d6796…6916` (154) → `2a96a97b…6102` (156).

## Row (11 cells, one line, no pipe inside any cell)

| S1NN | Chromium 156 HTMLFormElement declarative form execution — https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | code | A | Chromium 156 declarative form tool after input validation: toolautosubmit versus user-gated submission, submit/respondWith completion, callback errors, and the post-fill document-detached guard; source-level only | tag 156.0.8078.47; html_form_element.cc:175-339, 673-880; decoded sha256 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102 | supersedes S078 — at tag 156 the fill path gains a document-detached guard: input/change handlers dispatched while filling can deactivate the document, and ExecuteTool then returns ScriptToolError kToolInvocationFailed with the text The document was detached while filling out the form before the submit-or-focus branch; content otherwise identical, the same anchored code now sits at 175-339 and 673-880 and the decoded sha256 is 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102 | mined | 2026-10-26 | on-release | corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md |

## Quote from the 156.0.8078.47 bytes (17 words, located)

> "  // Filling out the form controls dispatches `input` and `change` events,
>   // whose handlers may have detached the document."

`third_party/blink/renderer/core/html/forms/html_form_element.cc:201-202` (tag 156.0.8078.47). The
branch it introduces follows at 203-209:
`if (!form_->GetDocument().IsActive()) { return std::move(done_callback).Run(base::unexpected(ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed, "The document was detached while filling out the form"))); }`

## Recheck notes — what each citing knowledge entry now gets wrong

1. `corpus/knowledge/webmcp-declarative-validation-round-19.md` (`source:` line 2; also `:40`,
   `:106`, `:129`). Still true: the 154 body it retains hashes to
   `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, its runtime tables are a
   measured 154 build, and the submit-time `kToolInvocationFailed` text it quotes is unchanged.
   Wrong now: its "Two error classes" taxonomy (`:37-42`) is incomplete for the current stable —
   there is a third, post-fill `kToolInvocationFailed` branch (document detached by fill-dispatched
   input/change handlers, 156 `:203-209`) that fires before the autosubmit decision; and its
   pointer `S078 :729-751` now sits at `767-789`, so the cited 154 line numbers no longer address
   the current stable file.
2. `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (`source:` line 1, `:15`, `:86`,
   `:151`). Still true: it declares a 154-only source reading, and every anchored range it uses
   (`174-328`, `635-842`) is unchanged text at 156 apart from the insertion. Wrong now: LC02's span
   `189-210` no longer covers all error paths out of the fill (the detached-document error at 156
   `:203-209` is a second one), and LC04/LC05's condition "FillFormControls returned no error" omits
   the new guard that sits between the fill and the focus/autosubmit branch, so the LC04/LC05
   branch set is not exhaustive at the current stable; the `decisions.json` span `181-830` shifts to
   `182-868`.

Supplementary, not a knowledge entry but stale in the same way: `corpus/lessons/round-19.md:34`
locates the S078 quote at `html_form_element.cc:219`; at 156 the same comment is line `230`.
