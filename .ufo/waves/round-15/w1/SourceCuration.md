# Round 15 w1 — SourceCuration (read-only SOURCES audit, S029 mutable cells)

Author-side report by `TabiR15.SourceCuration`. Not non-author certification. No gate, counter, test, suite, browser run, install, commit, or source edit was performed. Reads only: `corpus/SOURCES.md`, `scripts/check-sources.mjs` (static), `corpus/evidence/round-13/aria/receipt.json` (JSON read + one `sha256sum`), `corpus/evidence/round-15/source-index.json`, `corpus/lessons/round-14.md`, `corpus/lessons/round-12.md` and `round-13.md` (used-by precedent), `corpus/QUALITY.md`, `SKILL.md`. Read-only Python counts over the registry table, no gate invoked.

## Axes

1. Registry gate acceptance of S029 `used-by` (static reading of `check-sources` path rules).
2. Mutable-cell precedent for existing rows (what prior rounds changed, what they kept).
3. Traceability: does the registry cell name the machine evidence the round-15 text claims it names.
4. Anchor precision of the S029 row against the retained receipt.

## Observed state (lane working tree, uncommitted)

- `git status`: `M corpus/SOURCES.md` (2 insertions, 1 deletion; other modified files are sibling-owned: SKILL.md, corpus/QUALITY.md, corpus/README.md, scripts/check-user-round-contract.mjs). `?? .ufo/waves/round-15/`.
- `corpus/SOURCES.md:43` S029 row, HEAD vs working tree, cells 8–11:
  - HEAD used-by: `corpus/lessons/round-14.md`
  - working tree used-by: `corpus/lessons/round-14.md, corpus/lessons/round-15.md`
  - status `mined`, opened `2026-10-20`, recheck `365d` — unchanged from HEAD. Source, anchor, scope, teaches: unchanged (diff touches only the used-by cell on that line).
- `corpus/SOURCES.md:64` new search-log append "2026-10-20 · round-15 bounded evidence-contract reopening…" — states "C2 remains sourced by S029, with a direct reference in the new round15 evidence index" and "The lesson records the exact used-by transition".
- Registry counts (static parse of 29 table rows, ids S001–S029 unique, all 13 fields): tiers A:23 B:4 C:2; status mined:24 queued:3 rejected:2. No S030 row; no new row added this round. Matches round-14 SCORECARD line 639.
- `corpus/evidence/round-15/source-index.json` exists (707 bytes), `"sourceRows": ["S029"]`, `historicalReceipt.path` `corpus/evidence/round-13/aria/receipt.json`, `sha256` `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`. `sha256sum` of that receipt returns the identical digest (pin verified).
- `corpus/lessons/round-15.md`: **does not exist**. `corpus/QUALITY.md:71,77` already cite `corpus/lessons/round-15.md#mistakes`, so those references are also dangling until the lesson lands.

## Defects

### D1 — blocking for the registry gate: used-by names a missing file (must fix before any gate run)

- `scripts/check-sources.mjs:329-340`: every non-empty used-by path is passed to `inspectUsedBy`. `inspectUsedBy` (`:203`+) resolves the path, calls `nearestRealPath`/`statSync`; ENOENT yields `kind: 'missing'`, which the loop maps to `addFinding(findings, 'used_by_missing', id, 'path_missing')` (fleet code E11, `:41`).
- Static prediction for the current tree [INFERENCE — not executed]: `FINDING id=used_by_missing fleet=E11 row=S029 detail=path_missing`, `verdict=failed`, exit 1.
- Fix: create `corpus/lessons/round-15.md` containing the literal token `S029` (regex at `:228` is `(?<![A-Za-z0-9])S029(?![0-9])`), then the cell is valid. Do not leave the cell pointing at an absent file at any integration checkpoint.

### D2 — withdrawn per TabiR15 decision

- Decision (TabiR15): S029 used-by retains lessons only, per the frozen v1 used-by field definition ("knowledge entries or lessons"). `corpus/evidence/round-15/source-index.json` already cites S029 directly, which closes machine-evidence traceability without a reverse link from non-lesson JSON.
- Original observation kept for the record: `SKILL.md:1783`, `SOURCES.md:64` and routed item 5 (`round-14-verifier-spotcheck.md:188`) name the index; the registry cell did not. No action this round.

### D3 — anchor precision: the quote is not unique; the path is

- Anchored path `cleanup.server.perWorker[0].listeningAfter` (row cell 9 / `SOURCES.md:43`) resolves to `false` (JSON read; `cleanup.server.listeningAfter` = `true`, aggregate, verified).
- Located quote `"listeningAfter": false` occurs at receipt lines 656 and 2529 (`grep -n`). Line 2529 is the anchored `perWorker[0]` instance; line 656 is another object. Quote-only location is ambiguous.
- Consequence: round-15 text and any new metadata check must cite the JSON path, not the quote. Do not change the S029 anchor cell; the receipt location is unchanged, only the derived correction is new.

### D4 — preamble contradiction (non-blocking; existing qualification)

- `corpus/SOURCES.md:6-7`: "Every row below was opened in kaika fleet round-1 (2026-10-19)." False for S029 (opened 2026-10-20, round-14).
- Existing qualification sits in the search log at `SOURCES.md:62` ("Registry preamble qualification (round14)…"). Recommendation: do not edit the preamble; `corpus/QUALITY.md` item 4 makes errata append-only. Leave as-is.

### D5 — dangling lesson references (same root as D1)

- `corpus/QUALITY.md:71,77` cite `corpus/lessons/round-15.md#mistakes`. Resolved by creating the lesson (L1-owned).

### D6 — doc drift in historical text (no action)

- `scripts/check-sources.mjs` `selfTestCases` (`:46-73`) lists 26 entries (counted statically). `SKILL.md:1619` (kaika round-1 errata, immutable) says 25 at its time. Historical; do not edit. Any round-15 lesson that states a count must use the script's current table.

## Mutable-cell precedent for existing rows (observed, not written as a rule)

- Round-12 (`corpus/lessons/round-12.md:55-58`): changed `status queued→mined` (S023–S025) and appended `used-by` (S011, S013, S017, S028). Opened dates kept (S023 still `2026-10-19`).
- Round-13 (`corpus/lessons/round-13.md:31`): appended `used-by` (S023–S025); status remained mined; recheck remained unchanged; opened date `2026-10-19` immutable.
- Round-14 (`corpus/lessons/round-14.md:19`): S029 created with `status nonexistent→mined`, `used-by nonexistent→corpus/lessons/round-14.md`. No existing row changed.
- Derived mutable set: `status` and `used-by` on existing rows, recorded in the round lesson as `old→new`. `opened`, `source`, `anchor`, `scope`, `teaches`, and `recheck` (absent a cadence decision) are not changed on reopen. The SOURCES contract text does not enumerate this; record it in the round-15 lesson, not in the preamble.

## Proposed exact transition (old → new)

S029 row, cell 11 (`used-by`) — `corpus/SOURCES.md:43`:
- old (HEAD): `corpus/lessons/round-14.md`
- current working tree: `corpus/lessons/round-14.md, corpus/lessons/round-15.md`
- **proposed (decided)**: `corpus/lessons/round-14.md, corpus/lessons/round-15.md` (no source-index entry)
- Preconditions: `corpus/lessons/round-15.md` created first and contains `S029`, and lands before any source-gate run.
- Unchanged: status `mined`; opened `2026-10-20`; recheck `365d`; source; anchor; scope; teaches. No new row. Preamble unchanged.

Search-log line `SOURCES.md:64`: keep. Optionally append one sentence stating the S029 used-by transition in the round-13 form (`used-by old→new: …`). Do not rewrite the existing line.

Round-15 lesson (`corpus/lessons/round-15.md`, L1-owned) must record, in the Gate section:
- `S029 used-by: corpus/lessons/round-14.md → corpus/lessons/round-14.md + corpus/lessons/round-15.md`;
- status/opened/recheck unchanged; no new row; no preamble edit;
- S029 anchor is the JSON path `cleanup.server.perWorker[0].listeningAfter`; the quote alone is not unique (lines 656, 2529).

## Proposed tests (for L1 to run after integration — not run by me)

1. `node scripts/check-sources.mjs` — expected after lesson lands: `SOURCES_GATE verdict=clean rows=29 tiers=A:23,B:4,C:2 status=mined:24,queued:3,rejected:2 findings=0 file=corpus/SOURCES.md`, exit 0 [INFERENCE from static counts; not observed].
   - Before lesson lands: expect `FINDING id=used_by_missing … row=S029 detail=path_missing`, exit 1 [INFERENCE].
2. `node scripts/check-sources.mjs --self-test` — existing 26 cases already cover used-by-missing, used-by-uncited, used-by-id-boundary, used-by-escape; no new case is required by this audit.
3. Static token check (L1 may run, read-only): `grep -n "S029" corpus/lessons/round-15.md corpus/evidence/round-15/source-index.json` — both must match.
4. Static anchor check (L1 may run, read-only): `python3 -c "import json;print(json.load(open('corpus/evidence/round-13/aria/receipt.json'))['cleanup']['server']['perWorker'][0]['listeningAfter'])"` — expect `False`.
5. Digest check: `sha256sum corpus/evidence/round-13/aria/receipt.json` — expect `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`.

Suggested fixture for the metadata gate (if MetadataEnforce wants a registry-side negative, not required here): a clean fixture whose S029 used-by lists a path that exists but does not contain `S029` must yield `used_by_uncited` (already covered by the existing `used-by-uncited` case).

## Commands and tools

- Installs/updates by this agent: **none**. No `pacman`, `uv`, `cargo`, `npm -g`, or downloads.
- Gates/tests/builds executed by this agent: **none** (`check-sources.mjs` read statically only).

## Out of scope / not touched

- No edit to `corpus/SOURCES.md`, `corpus/QUALITY.md`, `SKILL.md`, `LOG.md`, `SCORECARD.md`, `README.md`, or any historical evidence/lesson.
- Sibling-modified files observed in `git status` (SKILL.md, QUALITY.md, README.md, check-user-round-contract.mjs) were not reviewed beyond the S029 references.

## Findings summary for TabiR15

- D1 blocking: create `corpus/lessons/round-15.md` (with `S029`) before the gate; otherwise `used_by_missing` exit 1.
- D2 withdrawn (lessons-only used-by per TabiR15 decision; index already cites S029).
- D3 keep anchor path as the locator; quote non-unique.
- D4–D6 no action beyond what is listed.

## Incident — misplaced write, move and directory removal (recorded by author)

- My first `write` of this report used a relative path and landed at `/home/vgpnk/Projects/shokunin/.ufo/waves/round-15/w1/SourceCuration.md`, outside the lane root.
- Moved it to the lane path with `mv -n` (no overwrite). Content unchanged (10292 bytes).
- Ran `rmdir` on the empty directories created by that misplaced write. Only empty directories can be removed; per-directory success was not separately verified. The parent `.ufo` directory still exists.
- No other files were touched. No further filesystem operations after this report edit, per TabiR15.
