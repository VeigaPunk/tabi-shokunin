# SourceReset — S100 anchor containment for reset/removal (round21 w2)

Seat: TabiR21.SourceReset (scout, author-side, lane-dispatched; not independent admission).
Scope: read-only. Only this file was written. No builds/tests/selftests/counter runs executed.
No external URL opened; only the retained local copy of S100 was read. No tools installed or updated.
LSP: not applicable (C++ source copy and Markdown/JSON; no language server consulted). All locating
below is literal text search over retained bytes, presented as text location, not semantic proof.

## Verdict

Containment HOLDS in current bytes: no current-lane document cites reset/removal to S100, and every
numeric S100 citation in the round21 note falls inside the registered anchors 174-328,635-842.
One enforcement gap (G1) found: the gate does not check this invariant, and no selftest mutant covers it.

## Attack 1 — retained source identity (is the body the registered S100 body?)

- `sha256sum .ufo/waves/round-21/sources/html_form_element.cc` = `8c8d6796…36916` (= `decodedSha256`
  in `.ufo/waves/round-21/source-opening.json`, = S100 row cell 5, = round-20 `source-opening.json`).
- `.gz` stored sha `46966f05…1e52` matches `storedSha256`; `zcat` stream sha `ff55d511…19ed` matches
  `rawSha256`; base64-decoded stream re-hashes to `8c8d…6916`. 1740 lines.
- Recorded opening quote (`source-opening.json`, location `html_form_element.cc:213-214`), located
  verbatim at line 213: "Without `toolautosubmit`, we focus the submit button, tell the agent to"
  (12 words). URL as recorded: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
  accessedAt 2026-10-21T12:37:47Z (recorded by the producer, not re-opened by this seat).

## Attack 2 — where do the observed reset/remove texts live? (out-of-range by line arithmetic)

Observed (S101): `corpus/evidence/round-21/runtime/na-reset.json` invocationId `A49A436758AB02CAD5BDF803319539C8`,
status `Canceled`, errorText "Tool execution cancelled by a form reset";
`na-remove.json` invocationId `063A09DF6E50E71872D8905B9ECE7002`, status `Canceled`, errorText
"Tool execution cancelled, since tool definition was updated". Producer actions:
`scripts/webmcp-lifecycle-round21.mjs:215-216` (`form.reset()` / `form.remove()` via `page.evaluate`).

Source sites in the retained body (all outside 174-328 and 635-842):

| Text / mechanism | Lines | In anchor? |
|---|---|---|
| `reset()` body, cancelable reset event, `CallDoneCallback(... "Tool execution cancelled by a form reset")` | 1077-1110 (literal 1103-1104) | no |
| `RemovedFrom` → `ScheduleDeclarativeWebMCPToolRegistration()` | 486-524 (call 523) | no |
| invalid/disconnected-tool sync unregister, split literal "…since tool definition " "was updated" | 380-399 (literal 392-394) | no |
| re-registration change path, same literal | 447-454 (literal 450-451) | no |

Arithmetic (python over retained bytes, with C++ adjacent-literal joining): both observed errorTexts
occur in the anchor text 0 times; `reset(`, `RemovedFrom`, `ScheduleDeclarativeWebMCPToolRegistration`,
`UnregisterTool` occur 0 times in-anchor. The only in-anchor `kToolCancelled` is line 227 (`CancelTool`,
text "Tool execution cancelled by abort signal"), which is distinct from both observed texts.

Consequence: the note's statement "their implementation locations are outside S100's immutable
registered anchors" (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:20-21`) is true for the
retained body.

## Attack 3 — hidden citations in the current note/docs

- Note rows `na-reset`/`na-remove` (`webmcp-nonautosubmit-round-21.md:36-37`) say "S101 observation
  only"; neither carries an `S100:` span. The note cites `S100:` spans 212-218, 720-815, 834-842,
  320-327, 787-806, 807-813, 290-319, 729-758 and 218-221. All of them fall inside 174-328 or 635-842.
- Consistent observation-only statements: `SKILL.md:2383`, `corpus/README.md:470`, `LOG.md:1363-1364`.
  The `SKILL.md:2378` table row cites cases `na-reset, na-remove` only. `SCORECARD.md:975-990` has no reset citation.
- Round-20 material is unchanged and makes no reset citation: `SKILL.md:2236` lists "Reset/removal/re-registration" as
  outside the sample. Hits for "reset" in `webmcp-completion-lifecycle-round-20.md` (LC07 "state reset at lines
  267-270", LC02 "is not reset") are about `CallDoneCallback` bookkeeping, not form reset.
- Gate/producer/receipt/runtime JSON/fixtures: no `S100`, `.cc:` or line-span strings. The receipt and
  runtime JSON contain only loopback URLs. `fixtures/expected.json` contains no anchor fields.
- `corpus/lessons/round-21.md`: absent (no hits).

## Attack 4 — were the immutable S100 anchors rewritten to absorb reset/removal?

I compared the S100 row cell by cell between the baseline `e7cf11a8…` and HEAD `1b5f449` (and the worktree, which equals HEAD) using a read-only
`git show`. Only cell 10 (used-by, mutable) changed: it appends `corpus/knowledge/webmcp-nonautosubmit-round-21.md`.
The anchor cell `html_form_element.cc:174-328,635-842`, the scope, and the supersedes text are byte-identical. S096 is untouched
(its anchors are 174-328,729-758,818-842). The S101 row (`corpus/SOURCES.md:115`) carries the reset/removal
claim as own-work: "derive exact observed outcomes from correlated invocation IDs rather than source callsites".

## Attack 5 — residual semantic leaks (no defect, boundary recorded)

- Both cancellations are delivered through `CallDoneCallback` (261-275), which is inside 174-328. The note does
  not cite it for reset or remove, which is correct: an in-range span would launder an out-of-range trigger.
- [INFERENCE] `form.remove()` most likely reached the 380-399 sync path (`isConnected()` is false after
  `RemovedFrom`), not 447-451. The identical literal at both sites makes the runtime text unable to
  tell them apart. The note claims no mechanism, so there is no overclaim.
- Conditions the run did not test, and which the note correctly does not generalize to:
  - a reset event that is preventDefault-ed returns before the cancel (1084-1087);
  - `is_in_reset_function_` re-entry (1079);
  - `IsHandlingSubmit()` suppresses the remove/update cancellation (390, 448).

## G1 — enforcement gap (missing mutant, not executed)

`measure-c1.mjs:61,65` checks the note only for a `source:` prefix, the substring `S100`, and each `` `id` ``.
`selftest-c1.mjs` has no mutant that alters a row's boundary cell (only `absent-note-case`, line 40).
[INFERENCE from code reading, not run] Two mutants would therefore still evaluate exit 0 / value 12:
- replacing the na-reset boundary with `S100:1101-1104`, or with in-range laundering `S100:261-275`;
- replacing the na-remove boundary with `S100:380-399`.

So containment currently rests on prose only. A suggested control for L1 to decide on is a gate rule plus mutants. The rule:
every `S100:a-b` span in the note lies within the registered anchors, and the reset/remove rows carry no `S100:` token.

## Remaining unknowns

- The relation between the Arch Chromium 154.0.8037.97 binary and the upstream tag is unproved (as the note states).
- Which of the two removal literal sites fired: unresolved by the runtime evidence.
- Whether the gate rejects these mutants: not executed. That run is L1's serial verification.
