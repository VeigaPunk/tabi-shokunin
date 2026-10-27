# AdjDrift07 — C1 drift-verification chunk: independent re-derivation (tabi round 36, w1)

Seat: `AdjDrift07` (executor, leaf). Milestone C1. Judged on adjacency.
Round 36 / attempt 1 / wave w1. Frozen ref: `2e7b7a8920bff47fae6f75c3d06e48e37767099e`.
Contract read first: `.ufo/waves/round-36/claims.json` (both claims, predicates, kill rules, `feasibilityDisclosed`).

## Scope

Independently re-derive the audit status of the 20 ledger rows in
`.ufo/waves/round-36/w1-chunks/AdjDrift07.tsv` and compare with the committed ledger
`corpus/adjacency-screen-drift.tsv`. From git objects only; no worktree reads of sibling lanes for the derivation.

Chunk composition: 18 rows pin `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f` (4 files) and
2 rows pin `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350` (`SKILL.md`).
Both lanes are drifted relative to the round-35 pins, so every row was a real test, not a freeze-to-freeze no-op:

| lane | pin | frozen delta head (`baseline/c1-delta-pins.json`) | commits between |
|---|---|---|---|
| kaidoku | `49096c7e6f226af0c750c4b003be58883cb6049f` | `1ed29de2cdd6061315fb2f5478d5029b7d570675` | 23 |
| kake | `044048597d62f3199494b63b36e90dd57825e350` | `437f53b1f6cd22dbf307f1187f41d1c0850a1ac2` | 32 |

Both delta heads resolve (`cat-file -t` = `commit`); both cited paths exist at pin and at head.

## Method (exactly the assigned derivation)

Per row `lane@pin:path:line`:
1. `git -C <lane-repo> show <pin>:<path>` → line `<line>`, trailing/leading whitespace trimmed = CITED text.
   Line beyond EOF → `stale: pin line absent`; file absent → `stale: pin file absent`.
2. `H` = that lane's frozen delta head from `baseline/c1-delta-pins.json`; `git show <H>:<path>`
   (absent → `stale: head file absent`). Head line `<line>` trimmed equal to CITED → `unchanged`.
   Otherwise scan the head file for any line whose trimmed text equals CITED → `moved :N`; none → `stale`.
3. Look up the committed ledger row by `sibling_ref`; compare status class (and, for `moved`, the relocation line).

## Result — 20/20 agree, 0 mismatches

`receipt.tsv` (this directory): 20 data rows, all `unchanged` / `unchanged` / `agree`, closing line
`# AdjDrift07: 20 rows, 0 mismatches`.

Per file at the frozen heads:

- `corpus/knowledge/2026-10-14-r11-01-queue-ops.md` — lines 77, 83, 91, 101, 108, 280, 284, 310, 330, 341, 344 → `unchanged`.
- `corpus/knowledge/2026-10-16-l7-03-inspect-electron-fuses.md` — line 15 → `unchanged`.
- `corpus/knowledge/2026-10-20-r17-go-carrier-diagnostics.md` — line 207 → `unchanged`.
- `corpus/knowledge/2026-10-20-r18-swiss-map-replay.md` — lines 1, 55, 70, 96, 142 → `unchanged`.
- kake `SKILL.md` — lines 20, 44 → `unchanged`.

Corroboration stronger than line equality for the 18 kaidoku rows: all four cited files are **blob-identical**
pin → head (`1c93ddf2…`, `7ec76078…`, `c7bd75f9…`, `2fa7e403…` at both revisions;
`git diff --numstat pin head -- <file>` empty for each). The kaidoku delta of 23 commits only **adds** five new
`corpus/knowledge/2026-10-26-*` files; it touches nothing in this chunk. For kake, `SKILL.md` grew 1280 → 1358
lines but the first 100 lines are byte-identical between pin and head, so lines 20 and 44 hold by construction
while the file as a whole definitely moved.

## Controls (the derivation is discriminating, not vacuous)

- **A — moved detection, independent of the ledger:** kaidoku `SKILL.md@49096c7e:585` → head line **748**
  verbatim (`diff` empty), and the text now sitting at head line 585 is different. My scan reports exactly one
  match, `748`. This reproduces, by a separate path, the claim's `585 -> 748` (and the ledger's
  `moved / verbatim at :748`) for a row outside my chunk.
- **B — `unchanged` is not sticky:** kake `SKILL.md` head has 78 more lines than the pin, so the head object is
  materially different; only lines 20/44 survive, and they do so byte-for-byte.
- **C — `stale` branch exercised:** a synthetic row citing kaidoku `SKILL.md:333` (a line deleted at head, one of
  4 deletions) derives `stale — cited text not present in head file (head 1568 lines)`.
- **D — `stale: pin line absent` branch exercised:** synthetic row with line 99999 derives
  `stale — pin line absent (pin has 1405 lines)`.
- **E — ledger integrity for the join:** each of my 20 `sibling_ref`s occurs exactly once in
  `corpus/adjacency-screen-drift.tsv`; the ledger has no duplicate `sibling_ref` and 307 data rows
  (304 `unchanged`, 3 `moved`), consistent with the contract's `drift.total = 307`.

## Evidence in this seat

- `receipt.tsv` — required output: `sibling_ref / my-status / my-note / ledger-status / agree|MISMATCH` × 20 + summary line.
- `derivations.tsv` — per row: pin blob, head blob, pin/head line counts, cited line, `cited_text_sha16`, full cited text, head-line-same flag (all 20 `yes`).
- `commands.txt` — every command as run.
- `derive.sh` — the derivation driver (re-runnable, read-only git).
- Same content as this report is also written to `.ufo/waves/round-36/w1/AdjDrift07.md` (the `Report:` trailer path).

## Limits / risks

- Equality is line-local plus a verbatim whole-file search, per the assignment. A head file in which the cited
  text occurs more than once would make `moved :N` ambiguous; that did not occur here (every scan returned at
  most one line, and every row was the equal-at-same-line case).
- My chunk contains **no** `moved` and no `stale` ledger row, so this seat's positive evidence is entirely in the
  `unchanged` class; the `moved` class is covered only by control A (one row) and the `stale` class only by
  controls C/D. Wave-2 hand attacks on the 3 `moved` rows remain the load-bearing check for that class.
- Nothing in the lane repo, fleet root, or siblings was modified. No git/jj mutation was run anywhere; all git
  calls were `show`/`rev-parse`/`cat-file`/`diff`/`log`/`rev-list` with `-C <repo>`.
- Tooling: stock `git`, `jq`, `awk`/`sed`/`diff`/`sha256sum`, `node` already present. No installs or upgrades
  were needed or performed; no `pacman` transaction attempted.
- Scratch `/fast/scratch/hyaku/tabi-r36/AdjDrift07/` (with `TMPDIR` set explicitly under it) was removed on exit.

VERDICT ok — 20/20 rows of chunk AdjDrift07 re-derived from git objects at the frozen delta heads agree with the committed ledger `corpus/adjacency-screen-drift.tsv`; 0 mismatches, all `unchanged`; moved and stale branches verified by controls.
