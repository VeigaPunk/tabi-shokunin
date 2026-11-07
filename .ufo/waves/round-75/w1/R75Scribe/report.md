FINDINGS

Seat R75Scribe — independent re-derivation of the round-75 drag-intercept note and the r75
lesson Gate, from the raw receipts and the staged source bytes. No product code touched; no
git mutation; no other runtime invoked; no tools installed (node/python3 already present).

## Behaviour

I re-derived, with my own scripts (not the counter's `SHAPE` table), the per-leg event
sequences, `defaultPrevented`, DataTransfer view, coordinates and `stateAfter` over the nine
PRE smokes, the four probes and the (a) receipt
(`corpus/evidence/round75/chromium-drag-intercept/receipt.json`), then checked the note's
measured table row by row and every quoted line/line number in the note and lesson against the
staged sources.

Results:

- 14 receipts × 14 note table rows: **0 failures**. `table_check.txt`:
  `receipts=14 rows_per_receipt=14 failures=0`.
- 17 events per receipt; **identical event tuples across all 14** receipts (excluding
  timestamps and per-run nonce/port fields) and identical `legShape`; all trusted; no
  `chromium/*` type in scored runs; `effectAllowed` = mask name; text data readable only in
  `dragstart`/`drop`; one `Input.dragIntercepted` per run with
  `[text/plain="tabi-drag", text/x-tabi="x1"], mask 17`, replayed byte-for-byte by every
  `INTERCEPTED` leg; `bad-type` → `-32602 Unexpected event type 'dragLeave'`.
- Every note quote and every lesson Gate quote occurs at the stated line in the staged bytes;
  every lesson quote is ≤ 25 words (11, 6, 1, 10, 3, 4, 3, 10); all five file line counts and
  sha256 prefixes match `FETCH.txt` (`quote_check.txt`: `VERDICT: all quotes locate at the
  stated lines`).

## Gates (all read-only; command → exit)

- `python3 .ufo/waves/round-75/w1/R75Scribe/derive.py` → 0; `derive.txt` (per-leg derivation,
  laws, binding).
- `python3 .ufo/waves/round-75/w1/R75Scribe/table_check.py` → 0; `table_check.txt`.
- `python3 .ufo/waves/round-75/w1/R75Scribe/quote_check.py` → 0; `quote_check.txt`.
- `git grep -lE 'dispatchDragEvent|setInterceptDrags' c19a520f -- corpus/knowledge` →
  **1** (empty; the note's "empty at base" holds).
- `git show c19a520f:SCORECARD.md | grep -c '^| \`chromium-drag-intercept-linux\` |'` → **1**
  with output `0` (no capability row at base).
- `git show c19a520f:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3,} '` → 195 rows;
  current `corpus/SOURCES.md` → 200 rows (five new).
- `bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
  (fleet script, absolute path) → **0**; `census-now.txt`; new W04 lines only for S196 and
  S197 (27 → 29 warnings).
- `git diff --stat c19a520f d71951a7 -- corpus/SOURCES.md` → `5 insertions(+)`, 0 deletions;
  `git diff … | grep -c '^-[^-]'` → `0` (no existing row's cells changed).
- `git grep -l '"schema": "tabi-chrome-cdp-dragdrop-r75"' d71951a7 -- '*.json' | wc -l` → 25
  (16 receipts + 9 `pf-smoke*.counter.json`), matching `lesson-proof/prior-set-enumeration-raw.txt`;
  top-level `schema` filter → 16 = `controls/c1/prior-set.txt`.
- `sha256sum corpus/evidence/round75/chromium-drag-intercept/receipt.json` →
  `6ecc2560…1761`, as the dispatch status claims.
- `scored/c1-counter-a.json`: `verdict clean`, `checkCount 146`, all 146 checks true,
  `priorSet` length 16, nonce `tabi-r75-l1-57f28cf128e6`; `scored/c1-*.exit` all `0`;
  `c1-negatives-a.json` 254/254 `allOk` (246 refuse + 5 must-accept + 3 laundered);
  `c1-kill-power-a.json` 186 mutants (146 force-true + 40 semantic) all killed, 0 crashed,
  `holds: true`.
- `node scripts/check-dragdrop-r75.mjs --list-checks` → 146 unique check ids.
- `git grep -l 'tabi-r75-l1-57f28cf128e6' 57f28cf128e69dc40604f3201eab6a843c8e4142 -- .` →
  **1** (no hits; nonce absent at D). Freeze parent `d71951a7`, lane commit `b1ddabc5`,
  digests commit D `57f28cf1` (`git log --oneline`).
- Prior-set enumeration at the freeze parent reproduces the lesson's Mistake row 4 numbers.

## Findings

1. **F1 (note, provenance).** `probe/p1,p2,p3.receipt.json` were produced by driver
   `ddcf31dc73dd…c45abf` and carry `dragHypothesis: "REFUTED"`, `predicate: false`; only
   `probe/p4.receipt.json` (nonce `tabi-r75-test-1`) and the nine smokes run under the pinned
   `d604552e…8105`. Their event tuples and `legShape` are identical to p4's, so the note's
   "identical leg shapes 13/13" is true, but the sentence does not disclose that three of the
   four probes carry the producer's old REFUTED verdict. `[INFERENCE]` the driver's
   expectation table was filled from those observations after they refuted an earlier table —
   the driver source says so ("Filled from the L1 probe receipts (controls/c1/probe/p1-p3,
   identical across 3)"), and no copy of `ddcf31dc…` survives to inspect. Proposed wording in
   `note-review.md`.
2. **F6 (lesson, Mistake row 2 fix cell).** "each fails exactly its new case" is contradicted
   by its own evidence: `lesson-proof/survivor-recheck-after-cases.txt` shows
   `m0 251/254 failed=replay-timeline-sub-quantum,replay-timeline-whole-shift-1ms,
   replay-timeline-whole-shift-100ms` (three cases); m1–m3 fail exactly one each. The file
   also names mutants only `m0..m3`, so a non-author cannot map them to the four survivor ids.
   Killed-ness (`holds`) is unaffected. Proposed replacement in `gate-review.md`.
3. **F2/F3 (note, line ranges).** S197 "`:1578-1624` (`StartDragging`)" is 1578–1619
   (1621–1624 is `DragEnded`); S200 "`CanReadData` … (606-615)" is 612–615 (606–610 is
   `CanReadTypes`); S196's `:69-91` does not cover `modifiers` at line 94.
4. **F4 (note, quote).** The `dragIntercepted` sentence spans `Input.pdl:332-333`, and line
   333 begins `# `; the note's quote elides the comment marker (my check passes only after
   stripping it).
5. **F5 (note, parenthetical).** The `script-events` control also carries `chromium/x-drag-id`
   (its mouse legs start a native drag), so "measured by the `native-mouse` and `no-intercept`
   control runs" under-lists its sources.

## Touched surfaces

- Written, only under `.ufo/waves/round-75/w1/R75Scribe/`: `derive.py`, `table_check.py`,
  `quote_check.py`, `derive.txt`, `table_check.txt`, `quote_check.txt`, `census-now.txt`,
  `note-review.md`, `gate-review.md`, `report.md`; plus the Report-trailer copy
  `.ufo/waves/round-75/w1/R75Scribe.md`.
- Read-only: the receipts, `corpus/knowledge/chromium-drag-intercept-runtime-round-75.md`,
  `corpus/lessons/round-75.md`, `corpus/SOURCES.md`, `corpus/QUALITY.md`, `claims.json`,
  `freeze.txt`, `scored/`, `controls/`, `lesson-proof/`, `sources/`, scripts (read), git
  `show/log/grep/diff` only.
- Scratch `/fast/scratch/hyaku/tabi-r75/R75Scribe/` deleted before yielding.

## Out of scope / not claimed

- Legs (b) independent cold run by `R75Exec1` and (d) capability row 0→1 are **open at
  dispatch**; I read no (b) receipt and did not assert the capability row flip. The note's
  statement that the capability row was absent at base is verified; its admission is not.
- No re-execution of the driver, counter, battery or kill power (their outputs were read as
  evidence; the census validator is the only lane script I ran, and it is read-only).
- The lesson's Admitted/Rejected decisions were checked against sources and receipts, not
  re-litigated.

## Artifacts

- `.ufo/waves/round-75/w1/R75Scribe/report.md` (this file; also at
  `.ufo/waves/round-75/w1/R75Scribe.md`)
- `.ufo/waves/round-75/w1/R75Scribe/note-review.md`
- `.ufo/waves/round-75/w1/R75Scribe/gate-review.md`
- `.ufo/waves/round-75/w1/R75Scribe/derive.py`, `derive.txt`
- `.ufo/waves/round-75/w1/R75Scribe/table_check.py`, `table_check.txt`
- `.ufo/waves/round-75/w1/R75Scribe/quote_check.py`, `quote_check.txt`
- `.ufo/waves/round-75/w1/R75Scribe/census-now.txt`
