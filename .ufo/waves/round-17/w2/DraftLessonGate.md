VERDICT: ISSUES

Attacked: the `## Gate` source-rows draft for round 17 (S041–S053 + S032 re-open + registry transitions) against the scout dossiers and the committed registry at `6c97851`. Scope: `drafts/lesson-gate.md` only; no lane record written.

## Findings

1. **Premise mismatch — "none in place" is false at `6c97851`.** `corpus/SOURCES.md` already carries S041–S053 (rows 55–67; baseline `5859243` has none; `git show … | diff` shows 13 added, 0 removed or changed). S041–S048 are already `mined` with used-by `corpus/knowledge/webmcp-invocation-round-17.md` (exists at M, cites S041–S048). S053 is `rejected` (dossier drafted `queued`). S049–S052 are `queued`, used-by `—`, as the brief said. The draft logs these as transitions (`queued→mined` ×8, `queued→rejected` ×1). Pointers: `corpus/SOURCES.md:55-67`; `w1/SrcChromeDocsInvoke.md:57`.
2. **Two sha256 claims are not reproducible.** `developer.chrome.com` pages (S032, S047, S048) and the Chrome Web Store listing (S053) return different bytes on consecutive same-day fetches (e.g. S032: `2a30b60b…` recorded; re-fetches `fa3c3efe…`, `788abc73…`; lengths drift by 4–8 bytes). The quotes reproduce every time. The draft labels these digests as snapshot-only. A lesson that presents them as stable would be wrong.
3. **Three dossier quotes differ from the bytes.**
   - S049: the dossier dropped the backticks around `jj`; the raw file has `` `jj` commands `` (`docs/git-compatibility.md:114-115`). The draft uses the in-bytes form. Dossier location 113-115 → 114-115.
   - S050: dossier quote dropped the backticks around `jj workspace update-stale`; the raw CHANGELOG has them (`CHANGELOG.md:96-97`). In-bytes form used.
   - S042: the sentence wraps over C++ `// ` comment lines (`model_context.cc:748-750`). The quote is verbatim after removing the `// ` prefixes; stated in the draft.
4. **S043 quote is verbatim from rendered text, not raw bytes.** Raw `index.bs` has `Web*MCP*` and `[=browser agent=]` markup. Rendered page `webmachinelearning.github.io/webmcp/` (sha `56275966…`, matched) yields the quote with inline tags removed. Location corrected to 1570-1571 (dossier said 1570-1572).
5. **S046 URL.** Dossier gate line cites `blob/main/README.md`; the registry row at `6c97851` pins `blob/51ed7565…`. The draft uses the pinned URL.
6. **S032 re-open holds.** Quote `Chrome Extensions can query and execute WebMCP tools` present (`w1/SrcChromeDocsInvoke.md` §2). No edit; registry row byte-identical to baseline. No supersede.
7. **Existing draft is superseded for the Gate table.** `drafts/lesson-r17.md` (the L1-facing draft) still has `S041 [pending]` placeholders for the Gate source rows; `drafts/lesson-gate.md` supersedes that table. L1 should take the table from `drafts/lesson-gate.md`.

## Re-check record (this seat)

- 18 HTTP GETs via `python3`/`urllib` (`curl`-equivalent, no browser). Decoded base64 for gitiles `?format=TEXT`. Quote checked as substring after whitespace normalisation and tag removal.
- Decoded sha256 match: S041, S042, S045 (gitiles); raw match: S043 (index.bs), S044, S046, S049 (raw md), S050, S051 (adoc), S052 (adoc); HTML match: S049, S051, S052 (git-scm/jj docs pages).
- Not re-counted: line numbers for S046 (`README.md:312`), S051 (`:41-43`), S052 (`:504`), S044 (`:945`), S045 (`:87`). Substrings verified; line numbers are the dossiers'.
- Not verified at all: the Chromium web-test and DevTools claims beyond the quoted lines; the `invokeTool` semantics (not this seat's question).

## Tools installed or updated

None. No `pacman`, `uv tool`, `npm -g`, `cargo`. Host `python3` and `curl`-equivalent `urllib` only. Scratch under `/tmp/r17-gate-DraftLessonGate` removed.

## Out of scope / not done

- No write to `corpus/` (SOURCES, lessons, knowledge), `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`, `QUALITY.md`, `README.md`, `adjacency.tsv`. Registry transitions are logged in the draft for L1 to apply; none applied here.
- No git or jj write in the lane; `git show <M>:<path>` and `git show <baseline>:<path>` only (read-only).
- No subagent dispatch (leaf). No browser launch. No C1/C2/C3 counter or gate run.
- No re-audit of the `S032` note body or the `webmcp-invocation-round-17.md` note beyond the source-line grep.

## Files written

- `.ufo/waves/round-17/drafts/lesson-gate.md` (new)
- `.ufo/waves/round-17/w2/DraftLessonGate.md` (this report)
