# Draft superseding registry row for S100 — NOT written to corpus/SOURCES.md

Drafted by PinS100 (round 29, wave w1, 2026-10-26) under claim C3 for lane row **S100**.
This file is not registry content: `S1NN` is an allocator placeholder and no line of
`corpus/SOURCES.md` was edited by this seat.

Drift that forces the supersession: at the new stable tag `156.0.8078.47` the 154 anchor
`html_form_element.cc:174-328` no longer occurs contiguously — a 10-line detached-document
guard was inserted at 156 lines 201-210 (`range-174-328.diff`); the second range `635-842`
holds exactly at 156 lines `673-880` (zero-line diff, `range-635-842.diff`). Every 154 line
inside 174-328 survives, in order, so all sub-ranges cited by the knowledge entries still
exist at content level and only their line numbers move. `entry.json` carries
`"superseded_by": "S1NN"`; the allocator must replace that placeholder with the real `S1xx`
id when it appends this row, otherwise `check-release-pins.mjs` reports
`s1-drift-unsuperseded` for S100.

## Row (11 cells, one line, no pipe inside any cell)

| S1NN | Chromium 156 form callback lifecycle — explicit same-source reuse of S100 and S096 — https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | code | A | Build-scoped declarative form lifecycle branches at Chromium 156 including the post-fill document-detachment guard; not runtime behaviour or complete path coverage | tag 156.0.8078.47 commit 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775; html_form_element.cc:175-339,673-880; blob b3611221; decoded sha256 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102 | supersedes S100 — the 154 anchored blocks now sit at 175-339 and 673-880 with every 154 line preserved in order, except a 10-line guard added at 201-210 that fails the invocation with kToolInvocationFailed when a form-control input or change handler detaches the document, so all 154 line-number pointers are stale | mined | 2026-10-26 | on-release | corpus/knowledge/webmcp-completion-lifecycle-round-20.md, corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md |

## Quote from the 156.0.8078.47 bytes (9 words, located)

> “The document was detached while filling out the form”

`third_party/blink/renderer/core/html/forms/html_form_element.cc:207-208` (tag 156.0.8078.47,
sha256 `2a96a97b…6102`); no line of the 154 file carries this text.

## Recheck notes — what each citing knowledge entry now gets wrong

1. `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (`source:` front matter and
   `:39`, `:42`, `:147`). Still true: LC11 is reached when the running tool has no
   respondWith promise and `should_submit` is false, and the programming-error text is
   unchanged. Wrong now: its `S100:787-815` pointers are 154 line numbers — at 156 that
   block is `825-853`, and the quoted message line `810` is `848`; its `S100:834-842`
   (`submitFromJavaScript` null String) is `872-880` and its `S100:635-682` early returns are
   `673-720`, whose individual keysights `639/647/659/679` are `677/685/697/717` and whose
   `submitFromJavaScript` callback `839-841` is `877-879`. Its own drift caveat “decision
   spans 181-830” maps to `182-868`. Unsaid for
   156: the new fill-path guard at `201-210` is a thirteenth decision its twelve-row sample
   does not enumerate, so the table is incomplete for the current tag.
2. `corpus/knowledge/webmcp-nonautosubmit-round-21.md` (`source:` front matter, table
   pointers at `:32`-`:43`). Still true: its runtime rows are its own round-21 loopback
   receipt (S101), not S100. Wrong now: every S100 pointer in the table is one tag behind —
   `212-218` is `223-229`, `218-221` is `229-232`, `290-319` is `301-330`, `720-815` is
   `758-853`, `729-758` is `767-796`, `787-806` is `825-844`, `807-813` is `845-851`,
   `834-842` is `872-880`. It also records the row's anchor as “174-328,635-842”, which at
   156 reads `175-339,673-880`, and it never mentions the detached-document failure branch.
3. `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` (`source:` front matter,
   table pointers at `:32`-`:43`). Still true: same runtime receipt, same corrected
   `na-requestsubmit` scoping. Wrong now: the same 154 line numbers (`298-319` is `309-330`,
   `212-218` is `223-229`, the rest identical to note 2) and the same omission of the
   guard inserted at 201-210, which is a new way for the fill path to end in
   `kToolInvocationFailed` before submit is ever reached.

Supplementary, not a knowledge entry: `corpus/lessons/round-20.md` records the row's opening
at `html_form_element.cc:174-328,635-842`; those are 154 line numbers and stay correct as
history, but they are not what a 156 reader sees.
