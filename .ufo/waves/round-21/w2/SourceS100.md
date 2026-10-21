# SourceS100 — round21 w2 falsification of the S100 reopening

Seat: TabiR21.SourceS100 (author-side, lane-dispatched; not independent admission).
Scope: the retained round21 S100 opening record and its body, quote and location, and
the note's S100 anchor citations. Publisher authentication was not tested.
Writes: this file, plus scratch copies in `/tmp/s100.l5cm/` (outside the lane). Nothing
was written to production, the registry or source rows, and no git, jj or index
command changed anything. No tool installs or updates.

## External source opened

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
- Access: response header `date: Wed, 21 Oct 2026 13:22:08 GMT`, HTTP/2 200,
  `x-gitiles-object-type: blob`, `x-gitiles-path-mode: 100644`.
- Located quote (decoded line 213, 11 words): "Without `toolautosubmit`, we focus the submit button, tell the agent to"
- Tag resolution: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON
  returned commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` with committer time `Wed Sep 30 21:20:00 2026`.

## Own-work paths read

`.ufo/waves/round-21/source-opening.json`, `.ufo/waves/round-21/sources/html_form_element.cc`,
`.ufo/waves/round-21/sources/html_form_element.cc.base64.gz`,
`corpus/evidence/round-20/sources/html_form_element.cc`, `corpus/SOURCES.md:114,155`,
`corpus/knowledge/webmcp-nonautosubmit-round-21.md:1-43`, `.ufo/waves/round-21/study.json`,
`.ufo/waves/round-21/measure-c1.mjs:27,34,51-58`, `.ufo/waves/round-21/selftest-c1.mjs:41-42`,
`.ufo/waves/round-21/run-checks.py:59-63`, and
`corpus/evidence/round-21/runtime/{na-click,na-requestsubmit}.html` and `{na-remove,na-reset}.json`.

## Findings

### F1 — The retained body is byte-identical to a fresh reopening (held)

Attack: reopen the exact tagged URL and compare it with every retained copy.

| Item | Recorded | Observed |
|---|---|---|
| raw base64 sha256 | `rawSha256` ff55d511…19ed | live raw ff55d511…19ed; `zcat` of stored gz ff55d511…19ed; `cmp` with live raw is identical |
| decoded sha256 | `decodedSha256` 8c8d6796…6916 | live decode, r21 retained `.cc`, gz→base64-decode, and r20 retained `.cc` are all 8c8d6796…6916; `cmp` with the live decode is identical |
| stored gz sha256 | `storedSha256` 46966f05…1e52 | file sha256 46966f05…1e52 |
| tag commit | SOURCES.md:114 `b510e9d7…f78d` | Gitiles JSON `b510e9d7…f78d` |

All three retained files are git-tracked and clean (`git ls-files`, `git status --porcelain` empty).
Confidence: high, for byte equality with the upstream tag today. This is not evidence
of source-to-Arch-binary equivalence, and the note does not claim it
(`webmcp-nonautosubmit-round-21.md:15-21`).

### F2 — The access date is consistent with the file writes (held, weakly)

`accessedAt` is `2026-10-21T12:37:47.692898+00:00`. The host time zone is America/Sao_Paulo
(-0300). The gz, `.cc` and json mtimes are 09:37:48.806-.807 local, which is 12:37:48.8Z,
about 1.1 s after `accessedAt`. [INFERENCE] This fits a single fetch-then-write run,
but mtimes are mutable and do not authenticate the access time. The record keeps no
HTTP `date` header, status code or `x-gitiles-object-type`, so the access time is
self-asserted rather than captured from the server.

### F3 — The quote location over-states by one line (defect, minor)

`source-opening.json` has `"location": "html_form_element.cc:213-214"`. The quote
"Without `toolautosubmit`, we focus the submit button, tell the agent to" sits entirely
on line 213 and ends there. Line 214 ("allow user input, and wait for the user to submit
it.") is not part of the quote. Either the location should be `:213`, or the quote should
extend through line 214 (20 words, still within the 25-word limit). The quote is located,
verbatim and 11 words long.

### F4 — The counter does not bind most of the opening record (missing mutants)

`measure-c1.mjs:58` checks only `sourceId`, `url`, `decodedSha256`, and the sha256 of the
retained `.cc` body, plus the registry row cells. It never reads `rawSha256`,
`storedPath`, `storedSha256`, `accessedAt`, `quote`, `location` or
`comparisonToRetainedRound20`. The stored gz is not in `INPUT_PATHS`
(`measure-c1.mjs:27`), so the counter cannot read it at REV. The selftest has a
`wrong-source` mutant (`selftest-c1.mjs:41`) and a `row-url-drift` mutant
(`selftest-c1.mjs:42`), but nothing for these fields. Mutants that should be red but,
from reading the code, would stay green (not executed):

1. `quote` replaced with a string absent from the body.
2. `location` changed to `html_form_element.cc:9999`, or with no line range.
3. `rawSha256` set to 64 zeros.
4. Stored gz truncated or replaced, or `storedSha256` mismatched.
5. `accessedAt` removed, or set to a date before round 21.
6. `comparisonToRetainedRound20` set to `false`.

The note says the "raw carrier, compressed storage and access metadata are retained"
(`webmcp-nonautosubmit-round-21.md:18-19`). They are retained, but no gate validates them.
Confidence: high, from reading the code.

### F5 — Click and requestSubmit completion cite a span that omits the result path (citation gap)

Note rows `na-click` and `na-requestsubmit` (`:33-34`) cite `S100:720-815` for
"Completed with the dummy response object". Both fixtures call `e.preventDefault()` and
then `e.respondWith(Promise.resolve(value))` (`na-click.html:9,15`,
`na-requestsubmit.html:9`). In the body, lines 790-806 only bind `.Then` to
`HandleWebMcpToolResponse`. Serializing the resolved value and calling
`tool->CallDoneCallback(result)` happens at 298-319, which is outside the cited 720-815.
That range is still inside the registered `174-328` anchor, so this is a per-row citation
gap, not an out-of-anchor claim. `na-delayed` already cites the right pair,
`S100:290-319,787-806` (`:40`). The fix would be to cite `S100:298-319,787-806` for these
two rows.

### F6 — Reset and removal are correctly kept outside the anchors (held)

- The `na-reset` observed text "Tool execution cancelled by a form reset" appears only
  at decoded lines 1102-1104.
- The `na-remove` observed text "Tool execution cancelled, since tool definition was
  updated" appears at 391-394 and again at 449-451.

Both locations fall outside the registered `174-328,635-842` anchors (`SOURCES.md:114`). The
only cancel callsite inside the anchors is `CancelTool` at 224-228 ("cancelled by abort
signal"), and neither case observed it. The note gives these rows S101-only
interpretation (`:36-37`) and does not choose between the two removal callsites. The
runtime string cannot tell them apart.

### F7 — Remaining anchor spot checks (held, with one nit)

- `S100:212-218` (`na-pending`): lines 212-217 hold Focus and PauseExecution. Line 218 is
  `} else {`, which is harmless but could be dropped.
- `S100:218-221` (`auto-positive`): the immediate `PrepareForSubmission`, verified.
- `S100:320-327` and `787-806` (`na-reject`): the rejection text "respondWith promise was
  rejected" is at line 326, verified.
- `S100:807-813` (`na-throw`): the programming-error text naming preventDefault without
  respondWith, verified.
- `S100:729-758` (`na-invalid-submit` and `auto-invalid`): the "Form validation failed: "
  builder, verified.
- `S100:834-842` (`na-native-submit`): `submitFromJavaScript` calls
  `CallDoneCallback(base::ok(String()))`, verified. The note correctly keeps the JSON-LD
  output mapping as runtime evidence.

### F8 — A registry entry points to a lesson file that does not exist (gap)

`SOURCES.md:155` says "Framing rejects are in the round21 lesson Gate", but
`corpus/lessons/round-21.md` does not exist at read time (`corpus/lessons/` has
`round-20.md` but no round-21 file). [INFERENCE] The lesson may still be in progress, but
the pointer is unresolved right now.

## Unresolved

- Publisher authentication (TLS and Gitiles integrity) was not tested, as scoped.
- Equivalence between the upstream tag and the Arch Chromium 154.0.8037.97 binary was not
  established and is not claimed.
- The F4 mutants were reasoned from the code, not executed. L1 has to run them.
