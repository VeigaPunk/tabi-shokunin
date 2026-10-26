# Draft superseding registry row for S042 — NOT written to corpus/SOURCES.md

Drafted by PinS042 (round 29, wave w1) under claim C3 for lane row **S042**. Do not treat this
file as registry content: the id `S1NN` is a placeholder for the allocator, and no line of
`corpus/SOURCES.md` was changed by this seat.

Drift that forces the supersession: at the new stable tag `156.0.8078.47` the 154 anchor ranges
`528-580` and `748-811` no longer occur contiguously (see `PinS042.md` §Verdicts); `856-873` holds.
`entry.json` therefore carries `"superseded_by": "S1NN"` — the allocator must replace that
placeholder with the real `S1xx` id when it appends this row, otherwise
`check-release-pins.mjs` reports `s1-drift-unsuperseded` for S042.

## Row (11 cells, one line, no pipe inside any cell)

| S1NN | Chromium 156 Blink ModelContext implementation — https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT | code | A | Chromium 156 Blink tool invocation: invoke entry, execute result and exception to CDP status, toolactivated event dispatch, input validation | tag 156.0.8078.47 (commit 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775), model_context.cc:527-577, 744-807, 855-871, blob 0ed6a007, sha256 94d08636…8aa3 | supersedes S042 — at tag 156 ModelContext dispatches the toolactivated event itself through ToolActivatedEvent instead of dispatching WebMCPEvent on the LocalDOMWindow, and invocation ids pass by value; the resolve-or-reject to Completed or Error mapping, the kToolCancelled requirement for Canceled, and the absence of inputSchema application to imperative input are unchanged. Source-derived, no new runtime probe | mined | 2026-10-26 | on-release | corpus/knowledge/webmcp-invocation-round-17.md |

## Quote from the 156.0.8078.47 bytes (≤25 words, located)

> “Fire the `toolactivated` event *after* activating the tool, but potentially”

`third_party/blink/renderer/core/script_tools/model_context.cc:567` (tag 156.0.8078.47; the 154
file reads `toolactivate` at `:568`). Supporting statement, 4 words, lines 573-574 of the same
bytes: `DispatchEvent(*ToolActivatedEvent::Create(event_type_names::kToolactivated, name));`

## Recheck notes — what each citing knowledge entry now gets wrong

1. `corpus/knowledge/webmcp-invocation-round-17.md` (the row's registry `used-by` entry; cites S042
   at its `source:` front matter and in the decision table). Still true: the id arrives before tool
   events, an empty `errorText` on throw/reject, `Canceled` only via `cancelInvocation`, and no
   `inputSchema` enforcement on imperative input. Wrong now: its `:73` pointer “the row's anchor
   range 748-811 covers `ExecuteV8Tool`” — at 156 that code sits at `744-807` and old line 753
   (now 749) changed signature, so the cited range no longer holds; its `:71` sentence “S042 posts
   execution without waiting” stays accurate. The entry's own 154 runtime tables are unaffected:
   they describe a measured 154 build, not the registry row's line numbers.
2. `corpus/knowledge/source-recheck-round-18.md` (cites S042 at its `:91` row replay, `:104`,
   `:110`, `:172`). Wrong now: `:91` re-displays the 154 anchor (`528-580, 748-811, 856-873`) as a
   live pointer, and two of those ranges no longer hold at the current stable tag; its 154
   base64-served digest `039e24a0a954…` was re-derived here and matches, so the recorded 154 bytes
   are still correct history. `:172` (the S071 attribution) is unaffected.

Supplementary, not a knowledge entry but stale in the same way: `corpus/lessons/round-17.md:54`
locates its S042 quote at `model_context.cc:748-750`; at 156 the same comment is `744-746`.
