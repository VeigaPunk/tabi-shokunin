# ReviewNoteProvenance

Scope: `corpus/knowledge/webmcp-nonautosubmit-round-21.md` provenance header and its artifact pointers, checked against the round-21 measurement input set and the run record's revision. Read-only review; no tests or runtime verification performed.

## Findings

### High — `verified-at` is not bound to a committed acquisition candidate

`webmcp-nonautosubmit-round-21.md:2` says the producer and exact argv are in `.ufo/waves/round-21/runtime-execution-bounded.json` and that revision-bound counting is recorded in `SCORECARD.md` round 21. The pointed run record (`runtime-execution-bounded.json:3-4`) gives `revision=e7cf11a810003d4a65cc85bd265f2c17dd65b738` but `measuredRevision="uncommitted"`; its argv at `:5-12` writes to `.ufo/waves/round-21/runtime-bounded-candidate`. The note says the output was later relocated to `corpus/evidence/round-21/runtime/` (`:54-56`), and `history/index.json:21-24` is the mapping.

A read-only `git ls-tree -r --name-only e7cf11a810003d4a65cc85bd265f2c17dd65b738` query for the note's evidence/source/run pointers returned only `SCORECARD.md`, `SKILL.md`, and `corpus/SOURCES.md`; the note, producer, receipt/raw cases, source-opening/body, run record, and output relocation are not in that recorded revision. Separately, the measurement's candidate whitelist (`.ufo/waves/round-21/measure-c1.mjs:24-28`) omits both `runtime-execution-bounded.json` and `history/index.json`; `filesAt` reads only `INPUT_PATHS` (`:104-110`). Consequently a candidate can retain or alter the run transcript/relocation mapping without the counter binding that change to its accepted evidence. The argv's original output path no longer resolves in the current wave tree; the relocation explanation is the only bridge to the canonical runtime evidence, but that bridge is not a measurement input.

### Medium — the scorecard pointer does not record what the note claims

The current Round 21 scorecard section (`SCORECARD.md:975-985`) records baseline `e7cf...`, the command with placeholder `REV`, and explicitly says scalar depth remains “pending measured evidence.” It contains no measured revision, result/count, before/after output, or commit pin. This contradicts the note's `verified-at` statement that revision-bound counting “is recorded” there (`webmcp-nonautosubmit-round-21.md:2`), and the promised count/commit pins are still only described as belonging there (`:45-48`). The path and section resolve, but the claimed record does not.

### Medium — the recheck counter itself is not revision-pinned

The note directs readers to run `.ufo/waves/round-21/measure-c1.mjs REV` (`webmcp-nonautosubmit-round-21.md:3`), as does `SCORECARD.md:980`. That script is absent from its own `INPUT_PATHS` (`measure-c1.mjs:24-28`), and the reported measurement result carries the input `REV`, not a digest/version of the executable counter. `filesAt` therefore authenticates the selected data blobs, not the code that computes the count. Replacing the worktree counter while keeping the same `REV` can change the result without changing the reported revision.

### Medium — S100's retained raw carrier is not part of the measured input set

The note claims the raw carrier and compressed storage are retained through `source-opening.json` (`webmcp-nonautosubmit-round-21.md:18-19`). That JSON points to `.ufo/waves/round-21/sources/html_form_element.cc.base64.gz` and gives its `storedSha256` (`source-opening.json:7-8`). The file exists in the current worktree and its observed SHA-256 matches the recorded value; the decoded `.cc` also matches `decodedSha256`. However, `measure-c1.mjs:27` includes only the decoded `.cc`, not the `.base64.gz`, and its S100 check at `:58` checks the decoded hash but not `rawSha256`, `storedSha256`, or the carrier bytes. A committed candidate can omit or replace the retained carrier while still passing this S100 binding, so the note's carrier pointer is not protected as part of the measured candidate.

## Residual risk and verification gaps

- The current worktree pointers themselves resolve: the receipt and per-case evidence are present; S100/S101 appear in `corpus/SOURCES.md:114-115`; the source-opening record, decoded source, compressed carrier, execution record, history index, counter, and Round 21 scorecard section exist. Current hashes observed for the decoded source, compressed carrier, and producer agree with the recorded decoded/stored/producer digests. The findings above concern missing commit/input binding and the unrecorded final measurement, not a detected byte mismatch.
- The acquisition record says `measuredRevision="uncommitted"`; no committed final measurement result was available in the examined records. The record's `e7cf...` value is the scorecard's stated baseline, not a measured-evidence revision.
- `read xd://lsp` returned “No such tool: xd://lsp”; no LSP server was available. No semantic caller/definition/diagnostics claims were made.
- No builds, tests, linters, formatters, browser actions, or runtime checks were run. No tool was installed or updated.