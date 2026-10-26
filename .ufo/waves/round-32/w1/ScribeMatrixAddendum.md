# ScribeMatrixAddendum — round 32 w1 (C1 matrix addendum + README coverage/frontier rows)

Verdict: both requested snippets are drafted and mechanically self-checked — `matrix-addendum.md`
(dated 2026-10-26 correction for `corpus/knowledge/webdriver-bidi-capability-matrix.md`: 17 rows in
§2 order, `yes` for R1–R15/R17, `no BiDi command` for R16, old `locally measured: no` bytes left
as written, pointer to `corpus/knowledge/webdriver-bidi-runtime-round-32.md` and the frozen counter
command, plus a §3 amendment naming the three still-unmatched contracts — wire truth, DOMSnapshot
columns, history list — and `insertText`, retroactive body retrieval, one-host scope) and
`readme-round-32.md` (append-only round-32 block: knowledge row, Frontier restatement
`docs-held → runtime-held`, frontier row with the counter command, counting line). Every per-row
"what the counter admits" cell was derived from the frozen counter's own predicates (byte-identical
to `claims.json` `frozenDigests`, selftest 27/27 at that digest); the snippets contain no observed
`admitted` number — they defer it to the receipt, because this seat did not run the live leg. Two
integration gates and one counter observation are routed below; no lane file was written.

## Evidence (commands and exit codes)

Environment: lane checkout `/home/vgpnk/Projects/shokunin/tabi-shokunin` at HEAD
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (read-only; `git status --porcelain` shows only the
L1's own untracked `.ufo/waves/round-32/*` wave files). Scratch root
`/fast/scratch/hyaku/tabi-r32/ScribeMatrixAddendum`.

Read-only inputs (no exit codes; reads):
`.ufo/waves/round-32/claims.json`, `.ufo/waves/round-32/baseline/README-receipts.md`,
`corpus/knowledge/webdriver-bidi-capability-matrix.md` (all 166 lines),
`corpus/README.md` (`:110-223`, `:600-705`), `corpus/SOURCES.md` row range S110–S122,
`scripts/check-bidi-runtime.mjs` (`:1-123`, `:138-263`, `:263-333`, live/receipt legs `:480-540`),
`.ufo/waves/round-32/w1-spec.json` (sibling item text for ScribeEntry / ScribeSrcBidiSpec /
ScribeS119, to keep pointers consistent).

1. Clone and pin (`exit 0`):
   `git clone --shared -q <lane> "$S/clone" && git -C "$S/clone" checkout -q --detach 4181fffb…`
   → `git -C "$S/clone" rev-parse --show-toplevel` = `$S/clone`; `HEAD` =
   `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`; `git -C "$S/clone" status --porcelain` empty.
2. Frozen counter digest (`sha256sum`, `exit 0`):
   `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`
   = `claims.json` `frozenDigests["scripts/check-bidi-runtime.mjs"]`.
3. Counter self-test at that digest (`TMPDIR=$S node scripts/check-bidi-runtime.mjs --selftest`,
   `exit 0`): `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` (receipt
   `c1-selftest.txt`). This is the only counter execution this seat made; it uses synthetic
   transcripts and an injected runner — no browser, no live session, and it is not evidence for C1.
4. Predicate→command map extracted mechanically from the frozen source (`python3` read-only parse of
   the `PREDICATES` block, `exit 0`, receipt `predicates-map.txt`): R2 `getTree`; R3 `navigate` +
   `load`; R4 `captureScreenshot`; R5 `locateNodes`; R6 `script.evaluate`; R7 `setViewport`; R8/R9
   `input.performActions`; R10 `beforeRequestSent`/`responseCompleted`; R11 `responseCompleted`
   (status + `FIXTURE_HEADER`); R12 `addDataCollector`→`getData`; R13 `addIntercept`→blocked
   `beforeRequestSent`→`continueRequest`; R14 `traverseHistory`; R15 `getCookies`; R17
   `userPromptOpened`/`handleUserPrompt`; R1 has no method string (it reads the classic `/session`
   capabilities plus "some successful command"); R16 empty → `x2-no-counterpart` (self-test case
   `stop-loading-marked`).
5. Host pins (`exit 0`): `chromedriver --version` → `ChromeDriver 154.0.8037.97
   (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})`; `chromium --version`
   → `Chromium 154.0.8037.97 Arch Linux`.
6. Snippet self-check (`python3` over the two output files, `exit 0`, receipt `snippet-check.txt`):
   17 data rows, order `R1..R17`, all four cells, measured cell `yes` except R16 `no BiDi command`,
   entry path + counter command present in both snippets, the three limit names present in the
   addendum, README note/frontier table rows 3 cells.
7. Note counts (`exit 0`): `ls corpus/knowledge/*.md | wc -l` → 50; at baseline `d805d1d6` → 50;
   at freeze `4181fffb` → 50 (`git ls-tree`). The README block therefore states 50 at the freeze and
   51 once the new entry lands.
8. Browser processes: `pgrep -fa 'chromedriver|chromium'` shows sessions owned by sibling seats
   (`--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/…`, chromedriver
   `--port=46741`, `--port=45991`). This seat started no chromium and no chromedriver, so there is no
   line of its own to kill; none were signalled.
9. Scratch removed: `rm -rf -- /fast/scratch/hyaku/tabi-r32/ScribeMatrixAddendum` → `exit 0`;
   `test ! -e` → absent.

No network fetch was made by this seat, so no fetch log exists here: the addendum's own statements
are local-runtime pointers, and it says so explicitly ("no cited source page was re-fetched for it").
No tool install or upgrade was performed.

## Artifacts (all under `.ufo/waves/round-32/w1/ScribeMatrixAddendum/`)

| File | sha256 | Bytes |
|---|---|---|
| `matrix-addendum.md` | `58fda50bf9f183bc08ea23f5a93d3483d1d6f31685f18df15948296c7b547b00` | 7870 |
| `readme-round-32.md` | `dbc9af8a8275396f7d5b5e43bdd82fa92075b3b9538c277b23685c15ff380cdf` | 4037 |
| `c1-selftest.txt` | `8541963d92fe5fe600d86f029b840856173558771661595907b0a6b0ec97c83f` | 3551 |
| `predicates-map.txt` | `0e6b78ebbdb1a6ed552ac2fbaeed5331edf3d56ebbf3edd64a0b602c3aff513c` | 1134 |
| `snippet-check.txt` | `3370f8bef2762259003097449a4c7f4ff625daae5cd89c389ab0a2e3d082a623` | 504 |

Re-derived after the last edits with `sha256sum *` in the output dir (`exit 0`); `predicates-map.txt`
is reproducible by the read-only parse in evidence item 4. `readme-round-32.md`'s digest differs from
the mid-draft listing because the Holds cell was re-grounded (loopback claim) after that listing.

## Landing instructions for the L1

- Both snippets open with a `<!-- DRAFT snippet … -->` comment: **strip that comment block** when
  appending; the rest is the append-only text (addendum after the matrix's 2026-10-20 correction;
  README block at the file end, after the round-31 blocks).
- `matrix-addendum.md` cites matrix lines by number (`:10`, `:54-76`, `:56`, `:70-76`, `:80`,
  `:81-82`, `:82-83`, `:100-107`). Those are line numbers of the matrix as it stands at
  `4181fffb`; they stay valid only while nothing above the addendum changes. Verify the three §3
  references after landing.
- `readme-round-32.md` cites `corpus/README.md:168` and `:191` (round-1 coverage/frontier rows);
  those are the freeze-commit line numbers and the block is appended at the end, so they stay valid.

## Integration gates (must hold before the snippets land)

- **G1 — per-row admission.** The addendum states `measured at round 32: yes` for R1–R15 and R17.
  Land it only if the round-32 `--live` counter run admits each of those sixteen rows at REV; any row
  the receipt leaves unadmitted must be written `no` in this same appended block (never by editing
  §2). The snippets deliberately carry no observed count — `admitted`/`failing` are the receipt's
  fields (`corpus/evidence/round-32/bidi/receipt.json`), and the claim target is `admitted ≥ 14`,
  `failing 0`.
- **G2 — registry rows.** `S124`, `S125`, `S126` do **not** exist at `4181fffb` (`corpus/SOURCES.md`
  ends at `S122`); the README row cites them as planned, opened-2026-10-26 rows. The counter's `s1`
  needs at least one cited id whose registry row is `mined`, names the entry in its `used-by`, and is
  absent at `d805d1d6` — so those rows must land with the entry. **`S123` must not be listed in the
  BiDi entry's `source:`**: it is the RFC 9309 supersede whose `used-by` is
  `corpus/knowledge/rate-signal-decision-table.md`; citing it would add a false pointer and cannot
  satisfy `s1`.

## Findings (reported, not repaired)

- **F1 (low, counter weakness).** The frozen counter has no whole-transcript off-loopback scan.
  Loopback is enforced per predicate through `navBase` (`scripts/check-bidi-runtime.mjs:183-187`, host
  test at `:186`), consulted only by R3/R10/R11/R13/R14; R2/R4–R9/R12/R15/R17 never inspect a
  navigation base. A committed driver transcript could therefore contain an additional external
  navigation and still be admitted, subject only to `t3-binding`'s screenshot equality. This is why
  the snippets say "each row's base only from a loopback `/a.html` navigate (a non-loopback base
  fails the row predicate — self-test case `off-loopback-navigate`)" instead of "no external
  navigation". Candidate for the round-32 lesson's `## Gate`/`## Mistakes`; I did not touch the
  counter (outside a scribe seat).
- **F2 (informational).** `corpus/README.md:700` states 46 knowledge notes at 2026-10-25; the tree
  holds 50 at `4181fffb`. That historical line is not corrected here (append-only block adds its own
  counting command only); a later calibration/errata round may want to cite it.
- **F3 (informational).** `corpus/knowledge/webdriver-bidi-capability-matrix.md` keeps
  `verified-at: 2026-10-19` and its 90-day `recheck:`; the new block is dated 2026-10-26 and does not
  refresh S005–S012. If the L1 wants the matrix's as-of header to read otherwise, that is a separate
  append (this block explicitly disclaims a source re-fetch).

## Out of scope for this seat

Live counter run and its receipt; writing `corpus/knowledge/webdriver-bidi-runtime-round-32.md`
(ScribeEntry); registry rows S123–S126; the round-32 lesson; C2 calibration; any edit to lane tracked
files, the lane git index/jj state, the fleet repo, or sibling lanes. No attack verdict is issued —
this seat drafted and checked text, it did not test the counter's claims.
