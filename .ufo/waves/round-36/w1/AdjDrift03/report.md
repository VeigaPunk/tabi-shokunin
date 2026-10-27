# AdjDrift03 — C1 drift-verification chunk: independent re-derivation

Seat: AdjDrift03 (executor leaf, C1 adjacency chunk). Round: tabi 36 / attempt 1 / wave w1.
Input: `.ufo/waves/round-36/w1-chunks/AdjDrift03.tsv` — 20 ledger rows, every one citing
`kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f` across three files.

**Result: 20/20 rows independently re-derive to `unchanged`, 20/20 agree with the committed
ledger `corpus/adjacency-screen-drift.tsv`. 0 mismatches.**

## Inputs and frozen handles

| handle | value |
|---|---|
| pin (all 20 rows) | `49096c7e` (`round-40 verifier spot-check (integrator, hyaku)`) |
| kaidoku frozen delta head (`.ufo/waves/round-36/baseline/c1-delta-pins.json`) | `1ed29de2` (`round-43: amend draft C2 landing path`) |
| ledger | `corpus/adjacency-screen-drift.tsv`, 308 lines (header + 307 rows), statuses 304 `unchanged` / 3 `moved` |
| this chunk | 3 paths × (12, 2, 6) lines: `corpus/knowledge/2026-10-13-r3-runtime-observation.md` (12), `…-r4-06-1password-asar.md` (2), `…-r4-08-observe-verbs.md` (6) |

## Method (git objects only, read-only)

Per row `sibling_ref` = `<lane>-shokunin@<pin>:<path>:<line>`:

1. `git -C <lane repo> show <pin>:<path>` → line `<line>`, trimmed = CITED text (line absent → `stale: pin line absent`).
2. `git -C <lane> show <H>:<path>` (H from `c1-delta-pins.json`; file absent → `stale: head file absent`);
   trimmed line `<line>` equal to CITED → `unchanged`; else search the head file for a line whose
   trimmed text equals CITED → `moved :N`; no match → `stale`.
3. Compare with the committed ledger row for that exact `sibling_ref` → `agree` / `MISMATCH`.
   For `moved`, agreement additionally requires my relocation line to appear in the ledger's note
   (ledger convention `verbatim at :N`, vs my note `:N`).

Receipt: `receipt.tsv` (`sibling_ref, my-status, my-note, ledger-status, agree|MISMATCH` + summary
line `# AdjDrift03: 20 rows, 0 mismatches`), sha256 `83ca551803223b2a41ae55335dd44abedfdcda1c7d840683edf8ee2821e4857f`.
Per-row derivation trace with cited text: `derivation-trace.txt`. Scripts: `derive.sh`, `cross.mjs`.
Exact commands: `commands.txt`.

## Why these 20 are `unchanged` — decisive check, not inference

For all three cited files the **blob at the pin equals the blob at the frozen delta head**:

```
corpus/knowledge/2026-10-13-r3-runtime-observation.md  pin_blob=01bdddb4c4dcc306081406f9eee1fefbaf1137a2  head_blob=01bdddb4… identical
corpus/knowledge/2026-10-13-r4-06-1password-asar.md    pin_blob=27f895464b87813797851b77f561742c23d2e1cc  head_blob=27f89546… identical
corpus/knowledge/2026-10-13-r4-08-observe-verbs.md     pin_blob=46912a28b62fb2ee7ea74baa14266db8aa2343f7  head_blob=46912a28… identical
```

`git diff --stat <pin> <H> -- <three paths>` and `git diff --numstat …` are both empty. So the three
cited files moved zero bytes between `49096c7e` and `1ed29de2`; every line number still addresses the
same bytes and `unchanged` is forced for these paths — no room for a relocated or vanished citation.
Line counts also unchanged (178 / 334 / 291), and each cited line number is in range.

## Instrument self-falsification (run before trusting the 20/20)

This chunk's honest failure mode is a rubber-stamp script, so the derivation was attacked first:

- **Positive control** — the ledger's three known `moved` rows (`kaidoku SKILL.md` 585→748, 621→784,
  652→815, outside this chunk) run through the same code: `moved :748 / :784 / :815`, ledger notes
  `verbatim at :748 / :784 / :815` → 3/3 `agree`. Verified by hand against the objects as well
  (`git show <pin>:SKILL.md` line 585 equals `git show <H>:SKILL.md` line 748, etc.).
- **Negative control 1** — doctored pin map with `kaidoku` head := the pin commit: those three rows
  derive `unchanged` → 3 `MISMATCH` (disagreement detection is live).
- **Negative control 2** — nonexistent line / nonexistent path / unresolvable pin: `stale: pin line
  absent` / `stale: pin file absent` / `stale: pin file absent`, all `MISMATCH` against absent ledger rows.
- **Second implementation** — a separately written Node derivation (different parsing, different loop)
  reproduces the receipt: `cross-check: 20 rows, 0 disagreements with committed ledger`.

**Bug found and fixed in my own instrument (disclosed):** the first version of `derive.sh` never reset
`mystatus` between loop iterations, so rows 2..n inherited row 1's verdict — the first real run
reported 20/20 `unchanged` without deriving rows 2-20. The moved-row positive control exposed it
(all three moved rows came back `:748`). The committed receipt is produced by the fixed version
(per-row state reset), and the trace shows a fresh `htrim`/`cited`/`hits` per row. Anyone auditing this
receipt should read `derivation-trace.txt`, not just the receipt's status column.

## Disclosed deviations and limits

- Blank pin line: treated as `stale` (`blank pin line (degenerate citation)`) because a text search
  for an empty string would match every blank head line. It did not fire — 0 of 20 rows cite a blank line.
- Note column: `-` for `unchanged`/`stale`, `:N` (comma list if the text occurs more than once in the head
  file) for `moved`; ledger writes `verbatim at :N`. Agreement compares the numbers, not the wording.
- Scope limit, stated plainly: this chunk is 12+2+6 lines of three files that are byte-identical
  across the drift window. It confirms those 20 ledger rows and cannot speak for the other 287 drift
  rows, the 3 `moved` SKILL.md rows (only sampled here as a method control), or the delta leg.

## Files (this seat's evidence, all under `.ufo/waves/round-36/w1/AdjDrift03/`)

`receipt.tsv` · `commands.txt` · `derivation-trace.txt` · `derive.sh` · `cross.mjs` · `report.md`

## Risks

- The 20-row chunk exercises only the `unchanged` class; the `moved` branch of this derivation is
  validated only by the three SKILL.md control rows, and `stale` only by synthetic rows. A wave-2
  reviewer sampling moved/stale rows in other chunks is testing a branch this receipt does not cover.
- Relocation by duplicate text is ambiguous by construction; my note lists every matching head line,
  and agreement accepts the ledger's single line if it is among them.

Tooling: none installed or upgraded (system `git`, `node`, `bash`, `awk`, `paste`, `sed`). No package
manager ran. No mutating git/jj command was issued; scratch root `/fast/scratch/hyaku/tabi-r36/AdjDrift03`
was deleted before yield.

VERDICT ok — 20/20 rows of chunk AdjDrift03 re-derive from git objects to `unchanged` and agree with the committed `corpus/adjacency-screen-drift.tsv`; 0 mismatches (receipt sha256 83ca551803223b2a41ae55335dd44abedfdcda1c7d840683edf8ee2821e4857f).
