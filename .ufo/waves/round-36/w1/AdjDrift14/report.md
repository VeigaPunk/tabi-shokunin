# AdjDrift14 — C1 drift-verification chunk (round 36 / w1)

Seat: AdjDrift14 (executor, leaf). Lane repo: tabi-shokunin.
Frozen contract read first: `.ufo/waves/round-36/claims.json` (C1 surface, predicate, killRule,
feasibilityDisclosed) plus its frozen digests and the frozen delta heads in
`.ufo/waves/round-36/baseline/c1-delta-pins.json`.
Chunk: 20 rows from `.ufo/waves/round-36/w1-chunks/AdjDrift14.tsv`.

## Method (git objects only, no worktree reads)

For each row `sibling_ref = <lane>-shokunin@<pin>:<path>:<line>`:

1. `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <pin>:<path>` → take line `<line>`,
   trim → CITED text. Line/file absent at pin → `stale`.
2. `git ... show <H>:<path>` where `H = c1-delta-pins.json[lane]`
   (kumitate `d23892ad44b41e1af63b3edb949d265ca1dd812d`, mado `b4a79843cc2545bbe800db9322e58f6e00436629`).
   Same line trimmed equal → `unchanged`; else search the head file for a line whose trimmed text
   equals CITED → `moved :N`; not found → `stale`.
3. Compare with the committed row in `corpus/adjacency-screen-drift.tsv`, keyed by sibling_ref.

Status vocabulary was checked against the frozen instrument's own header
(`.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs:44-53`): `unchanged` = same text at the same
line; `moved` = verbatim at a relocated line the note must name as `:<N>`; `stale` = file gone or text
nowhere at head; `unchanged`/`stale` notes may be `-`. My derivation implements exactly that sentence.

Derivation driver: `derive.py` (this seat dir); exact commands: `commands.txt`.

## Result

`receipt.tsv`: 20 rows, **0 mismatches** — every row derives `unchanged` and the committed ledger says
`unchanged`.

Chunk composition: 4 kumitate rows (`corpus/knowledge/kimi-skills-plugins.md` :569/:570/:574/:581) and
16 mado rows across `hyprland-gkeep-geometry-r43.md` (:70), `province-accuracy-selfaudit.md`
(:99/:298), `remaining-planes-census.md` (:84/:138/:171/:223/:224), `theme-route-r18.md`
(:92/:115/:145), `theme-wallpaper-plane.md` (:52/:93/:196/:200/:230).

Stronger than line-equality: `git rev-parse <pin>:<path> <head>:<path>` returns the **same blob id**
for all six cited files, so "unchanged" is structurally forced, not a coincidence of a matching line.
`git diff --numstat <pin> <head> -- <the 6 paths>` is empty (0 added / 0 removed), and
`git diff --name-only <pin> <head>` in both lanes lists no cited file — those lanes' post-pin drift is
entirely in `corpus/knowledge`-external paths.

## Falsifier / integrity checks actually exercised

- Independent re-derivation in a **separate code path** (shell `awk NR==n` + trim, not derive.py):
  20/20 `unchanged`, every cited line non-empty — so the result is not an artefact of my parser.
- Pin and head commits both resolve (`cat-file -t` → `commit`) and `merge-base --is-ancestor <pin> <head>`
  → yes in both lanes: the delta direction matches the frozen pins (head descends from pin).
- Ledger integrity: `awk -F'\t' '{print $1}' corpus/adjacency-screen-drift.tsv | sort | uniq -d` → none,
  i.e. no duplicate sibling_ref in the 307 data rows (the counter treats duplicates as findings), so the
  ledger row I compared against is unambiguous.
- Every one of my 20 refs exists in `corpus/adjacency-screen-browser.tsv` (20/20): my rows are genuine
  drift candidates derived from the browser screen ledger, so they cannot be orphan audit rows.
- `corpus/adjacency-screen-delta.tsv` does not exist, consistent with C1's disclosed empty post-pin
  delta pool; none of my refs can therefore also be a delta row.

## Limits (stated, not worked around)

- My chunk contains **no moved and no stale row**, so the `moved :N` and `stale` branches of my derivation
  were written and reviewed but not positively exercised by my data. The claim's three known moved rows
  (kaidoku `SKILL.md` 585→748, 621→784, 652→815) and the c1-J2/J3 falsifiers belong to sibling chunks;
  cross-chunk agreement is the parent's integration concern, not derivable from my 20 rows.
- Derivations are against the frozen delta heads. If a lane advances past `c1-delta-pins.json`, my
  statuses are stale by construction — that is the frozen contract's own term, not a defect here.
- No tools installed or upgraded (nothing was needed); no pacman, no network, no mutating git.
  Scratch root `/fast/scratch/hyaku/tabi-r36/AdjDrift14/` removed on exit; all work done with
  `TMPDIR=/fast/scratch/hyaku/tabi-r36/AdjDrift14/tmp` and absolute paths.

## Files (evidence)

- `.ufo/waves/round-36/w1/AdjDrift14/receipt.tsv` — 20 rows + `# AdjDrift14: 20 rows, 0 mismatches`
- `.ufo/waves/round-36/w1/AdjDrift14/commands.txt` — every git command issued (per row: pin show, head
  show, rev-parse) plus the auxiliary verification block
- `.ufo/waves/round-36/w1/AdjDrift14/derive.py` — the derivation driver (regenerates both files)
- `.ufo/waves/round-36/w1/AdjDrift14.md` — this report (same content)

## Verdict

VERDICT ok — AdjDrift14: 20/20 chunk rows re-derived from sibling git objects at the frozen delta heads,
all `unchanged`, all equal to the committed `corpus/adjacency-screen-drift.tsv` status, 0 mismatches;
cited files blob-identical pin↔head; no duplicate/orphan ledger refs.
