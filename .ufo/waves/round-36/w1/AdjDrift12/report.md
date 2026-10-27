# AdjDrift12 — C1 drift-verification chunk (round 36, w1)

Seat: `AdjDrift12` (leaf executor). Claim under work: **C1 adjacency** (`tabi` round 36 attempt 1).
Frozen contract read first: `.ufo/waves/round-36/claims.json` at 2e7b7a8920bff47fae6f75c3d06e48e37767099e.
Work type: independent re-derivation of the audit status of my 20 assigned ledger rows, from **git objects only**,
then comparison against the committed ledger `corpus/adjacency-screen-drift.tsv`.

## Inputs

| input | value |
|---|---|
| chunk | `.ufo/waves/round-36/w1-chunks/AdjDrift12.tsv` — 20 rows, all one sibling file |
| sibling repo | `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only) |
| pin `P` (round-35 screen pin cited by the row) | `8d557f85312de4fcc82e09ff735d21436bc3746d` |
| frozen delta head `H` for `kumitate` | `d23892ad44b41e1af63b3edb949d265ca1dd812d` (from `.ufo/waves/round-36/baseline/c1-delta-pins.json`) |
| path | `corpus/knowledge/kimi-skills-plugins.md` |
| cited lines | 262, 267, 271, 274, 275, 276, 277, 284, 291, 292, 294, 302, 303, 304, 315, 337, 338, 343, 361, 368 |

Pins file integrity: `sha256sum c1-delta-pins.json` = `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655`,
equal to the `frozenDigests` entry in `claims.json`, so `H` is the frozen head and not a live read.
`git cat-file -e H^{commit}` succeeds: the frozen head is resolvable.

## Method (exactly the assigned procedure)

1. `git -C <lane> show P:<path>` → take line `<line>`, strip surrounding whitespace: the CITED text.
   (Line out of range → `stale: pin line absent`; blob missing → `stale: pin file absent`.)
2. `git -C <lane> show H:<path>` (missing → `stale: head file absent`). Line `<line>` stripped equal → `unchanged`;
   else scan the head blob for a line whose stripped text equals the cited text → found at N → `moved :N`; not found → `stale`.
3. Compare with the committed ledger row found by `sibling_ref`.
Implementation: `derive.py` (python3 stdlib only, no network) — stored in this seat dir together with `control.py`;
rerunning both reproduces `receipt.tsv` and `control-kaidoku.tsv` **byte-identically** (`reproduced: receipt.tsv
sha256 927f7254dbf00801cb44a2225b02bafb9f0b3247f5b2eeccd27583407dbe745e`,
`control-kaidoku.tsv sha256 845539094beb48fbeb00cdaba11640f3d77b9fadfb79e32f77b67c1fd05e17e4`).
Full command list: `commands.txt`.

## Result — 20/20 agree, 0 mismatches

`receipt.tsv` (20 data rows + summary `# AdjDrift12: 20 rows, 0 mismatches`):

| derivation | ledger | count |
|---|---|---|
| `unchanged` (`-`) | `unchanged` (`-`) | **20** |
| `moved` | — | 0 |
| `stale` | — | 0 |
| MISMATCH | — | **0** |

Every one of the 20 rows: my re-derivation from `P` vs `H` reads the cited line byte-equal after trim, which is
`unchanged` with the ledger's conventional `-` note. No row needed a relocation search, so no `moved :N` note exists
in my chunk to check for wrong-relocation content.

## Why `unchanged` here is a measurement, not a constant

- The blob at `P` and the blob at `H` are the **same object**: `git rev-parse P:path H:path` →
  `3fd95114525f654ab1624ce4a9a17c63da1038b8` for both. `git diff --numstat P H -- path` is empty and
  `git log --oneline P..H -- path` is 0 commits: kumitate never touched this file between the pin and the frozen delta head.
  So `unchanged` is forced for this path — which also means **my chunk carries no discriminative power of its own**
  (stated as a limitation below), and the honest check is that my method can still detect the classes it claims to.
- **Positive control** (`control-kaidoku.tsv`): the same derivation, run on the three rows the committed ledger calls
  `moved` (`kaidoku-shokunin@49096c7e…:SKILL.md:585|621|652`, delta head `1ed29de2…`), returns
  `moved :748`, `moved :784`, `moved :815` — exactly the ledger's statuses and relocation lines. The method therefore
  discriminates moved from unchanged; it is not emitting `unchanged` unconditionally.
- Pin provenance: the base screen ledger `corpus/adjacency-screen-browser.tsv` cites this lane **only** at pin
  `8d557f85…` for this path (66 rows, single pin), so the drifted-lane pin used by the drift ledger is the same pin the
  original screen was taken at.
- Coverage of my chunk inside the ledger: `comm` of my 20 cited line numbers against the drift ledger's line numbers for
  this sibling file → **0** missing; the drift ledger's 66 `kumitate …:kimi-skills-plugins.md` lines are set-identical
  to the base screen ledger's 66 lines for that path (`diff` empty). No row of mine is silent, duplicated or invented.
- Ledger conventions hold: no duplicate `sibling_ref` anywhere in the 307-row ledger; status distribution is
  3 `moved` + 304 `unchanged`; every `unchanged` row uses note `-` and every `moved` row uses `verbatim at :N`.
  My 20 rows are shaped exactly like the rest.

## Evidence retained in this seat

| file | content |
|---|---|
| `receipt.tsv` | 20 lines `sibling_ref \t my-status \t my-note \t ledger-status \t agree\|MISMATCH` + summary line |
| `commands.txt` | every exact command (runnable per-row loop included) |
| `control-kaidoku.tsv` | positive control: 3 known-`moved` rows re-derived as `moved :748/:784/:815` |
| `derive.py`, `control.py` | the exact implementation used; rerun reproduces both TSVs byte-identically |
| `report.md` (this file) and `.ufo/waves/round-36/w1/AdjDrift12.md` | identical report at both instructed paths |

## Risks / limitations (disclosed, not worked around)

1. **Zero-power chunk.** All 20 rows sit in one file whose blob is identical at pin and head. A ledger that wrote
   `unchanged` for these rows and a ledger that wrote anything else cannot be separated by "did work happen" — only by
   wrongness, which is what I checked. The falsifying power for the moved class rests on the kaidoku rows, which are in
   other seats' chunks.
2. **Ambiguous citations would break the relocation rule.** My control hit this: the (non-ledger) kaidoku line 748 in the
   pin is blank, so the "search the head for the cited text" rule matches ~150 lines. The committed ledger only cites
   unique non-blank text, and none of my 20 cited lines is blank or duplicated at head, so the tie is not exercised here;
   a future row citing a repeated line (e.g. a table separator or blank) would not be determinable by this rule alone.
3. Non-loopback/`stale` classes were not exercised in my chunk (no head file absent, no pin line absent). I did not
   manufacture such cases; `stale` handling is code-inspected only, not observed.

## Tools

No installs, no upgrades, no `pacman` (guard respected): derivation used only `git` (read-only, always `-C <repo>`)
and `python3` stdlib. Scratch `/fast/scratch/hyaku/tabi-r36/AdjDrift12` with `TMPDIR` set explicitly; deleted at exit.
No mutating git/jj command was run; no write outside this seat dir.

## Verdict

VERDICT ok — 20/20 assigned rows agree with the committed ledger (all `unchanged`, note `-`), 0 mismatches; the frozen
delta head `d23892ad…` is resolvable, the pins file matches its frozen digest, and the method's discrimination is proven
by the kaidoku positive control (`moved :748/:784/:815`).
