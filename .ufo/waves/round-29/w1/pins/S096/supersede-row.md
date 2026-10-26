# Draft superseding registry row for S096 — NOT written to corpus/SOURCES.md

Drafted by PinS096 (round 29, wave w1) under claim C3 for lane row **S096**. Do not treat this
file as registry content: the id `S1NN` is a placeholder for the allocator, and no line of
`corpus/SOURCES.md` was changed by this seat.

Drift that forces the supersession: at the new stable tag `156.0.8078.47` the 154 anchor range
`174-328` no longer occurs contiguously — a 10-line document-detached guard is inserted at
`156:201-210` between the `FillFormControls` error return and the focus/submit branch (see
`PinS096.md` §Verdicts and `region-174-328.diff`). The other two ranges still hold, shifted:
`729-758` now sits at `767-796`, `818-842` at `856-880`. `entry.json` therefore carries
`"superseded_by": "S1NN"` — the allocator must replace that placeholder with the real `S1xx` id
when it appends this row, otherwise `check-release-pins.mjs` reports `s1-drift-unsuperseded` for
S096.

## Row (11 cells, one line, no pipe inside any cell)

| S1NN | Chromium 156 form callback navigation sentinel — https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | code | A | Build-scoped post-fill autosubmit, validation callbacks and navigation sentinel at tag 156; source-level only | tag 156.0.8078.47 commit 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775, blob b3611221; html_form_element.cc:175-339,767-796,856-880; decoded sha256 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102 | supersedes S096 — at tag 156 a new guard after the `FillFormControls` success path returns `kToolInvocationFailed` with the text "The document was detached while filling out the form" when the document is no longer active, so a fill whose `input` or `change` handler detached the document no longer reaches the focus or `PrepareForSubmission` branches; the interactive-validation, `CallDoneCallback` ordering and null-String navigation-sentinel paths are unchanged but shifted by +1 above line 197 and +11 at or below 200 | mined | 2026-10-26 | on-release | corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md |

## Quote from the 156.0.8078.47 bytes (≤25 words, located)

> “Filling out the form controls dispatches `input` and `change` events, whose handlers may have detached the document.”

`third_party/blink/renderer/core/html/forms/html_form_element.cc:201-202` (tag 156.0.8078.47).
Supporting statement, 9 words, lines 207-208 of the same bytes:
`"The document was detached while filling out "` / `"the form"` — the message carried by the new
`ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed, …)` at lines 206-208.

## Adjacent change outside this row's anchor (context, not an anchor claim)

`156:373-378` adds a registration guard: declarative WebMCP tools require script execution
capability, so a sandboxed frame without `allow-scripts` returns before the `toolname` /
`tooldescription` qualification checks. That hunk (`@@ -359,6 +370,13 @@`) lies outside
`175-339,767-796,856-880` and is recorded here only so a later row can open it deliberately.
Also outside the anchor: `is_connected_nested_form_` bookkeeping added at `156:126`, `486-490`
and `541-555`, and the removal of `NotifyEmailVerificationTokenFieldChanged` (last of these at
`156:1756-1761`).

## Recheck notes — what each citing knowledge entry now gets wrong

1. `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (the row's registry `used-by`
   entry; its `source:S096+S100` front matter names the 154 URL and digest, and every LC row
   carries an `S096:` line pointer). Still true: LC01-LC10 and LC12 describe branches that all
   survive at 156 with the same text, the `base::ok(String())` navigation sentinel is still at
   `156:865-867` with its "Return a null string to indicate that a navigation has been
   triggered" comment at `865-866`, and the recorded 154 digest still matches the 154 bytes.
   Wrong now: (a) every S096 line pointer is off — LC01 `181-186`→`182-187`, LC02 `189-210`
   split by the new guard (`190-198` plus `211-221`), LC04 `212-218`→`223-229`, LC05
   `218-221`→`229-232`, LC06 `224-229`→`235-240`, LC03 `249-258`→`260-269`, LC07
   `261-275`→`272-286` (callback run at `277`, reset `278-281`, notifications `282-285`),
   LC08 `290-298`→`301-309`, LC09 `298-319`→`309-330`, LC10 `320-327`→`331-338`, LC12
   `818-830`→`856-868`; the front-matter spans `181-830` and `174-328`/`635-842` become
   `182-868`, `175-339` and `673-880`; line `178`→`179`, `204-210`→`215-221`, `829`→`867`.
   (b) The lifecycle table is now incomplete as a decision list: a fill that detaches the
   document through an `input`/`change` handler settles `kToolInvocationFailed` before the
   LC04/LC05 branch is chosen, and no row records that arm.
2. `corpus/knowledge/webmcp-declarative-validation-round-19.md` (cites S096 at its `:129-131`
   qualification bullet and, as S078 = same body, the `Form validation failed` path at `:40`,
   `S078:729-751`). Still true: the null-String navigation-sentinel correction to S078, and the
   interactive-validation error text path, which now sits at `767-789`. Wrong now: `:129`
   presents the S096 anchor as a live pointer to the 154 line numbers and does not mention the
   156 post-fill document-detached arm; its S078 line pointer `:40` (`729-751`) is stale at the
   current stable tag (`767-789`), and the r19 note's "values were filled, then autosubmit's
   interactive validation …" sequence now has a third possible ending at 156 (document detached
   after fill, before validation).

Supplementary, not a knowledge entry but stale in the same way: `corpus/lessons/round-19.md:131`
locates its S096 quote ("Return a null string") at comment `827`; at 156 that comment is
`865-866`. `corpus/lessons/round-20.md:64-86` replays the 154 anchors and digest and stays
correct as history for 154.
