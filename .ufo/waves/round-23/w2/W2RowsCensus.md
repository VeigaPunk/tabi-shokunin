# W2RowsCensus — SOURCES rows S102/S103 vs frozen census (CORPUS.md SOURCES contract v1)

Seat: L1Tabi23.W2RowsCensus. Wave 2, round 23, attempt 1. Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Revisions read: baseline `a89f1935f523a64b00991d792fca6a8c0d321948`, landed `03c1b4d9a9ea7719ff4a13a63989fa9be36229c3`.
Bytes re-used (not re-fetched): wave-1 scratch copies `scratch/SrcS102/rfc6265bis-13.txt`, `scratch/SrcS103/owasp-csrf.html`.

**Verdict: both rows are shape-conformant and quote-faithful, C2's 0→1 verifies at the checkpoint, and the census
exits 0 — no row-level defect. Open findings are in the rows' supporting prose: one S103 anchor cell under-grounds
its own `teaches`, one S102 recheck binding is inert, and an adjacent "only one submit ever captured" count is
contradicted by the lane's evidence sweep.**

## Shape and enum checks (all pass)

- **11 columns, no literal pipe inside a cell** — `awk -F'|' 'NR==116||NR==117{print $2, NF}' corpus/SOURCES.md` → `S102 13`, `S103 13`.
- **Whole-table shape** — frozen census block over `corpus/SOURCES.md` (rows / malformed / dup ids / enum / community-at-A) → 103 rows, then 0 / 0 / 0 / 0.
- **Ids next-unused, never reused** — id extraction → `S100 S101 S102 S103`; baseline `git show a89f1935:corpus/SOURCES.md` rows matching `S10[23]` → 0.
- **Tier scope legal** — S102 `spec`/A (the primary draft itself), S103 `docs`/B (secondary sheet); no `community` at A, no NATO/GRADE labels, tier is scoped by each `scope` cell.
- **`mined` used-by resolves** — frozen used-by loop → no `missing:` line; target `corpus/knowledge/csrf-defense-shape-boundary.md` exists and cites both rows on two `source:` lines.
- **Opened = this round** — col 10 is `2026-10-25` for both (today).
- **Recheck legal** — `./scripts/sources-census.sh overdue --root … tabi` → `cadence S102 recheck=on-release opened=2026-10-25`, `cadence S103 recheck=90d …` (E09 clean; see finding 4).
- **Append-only** — `git diff --numstat a89f1935 03c1b4d -- corpus/SOURCES.md` → `2 0`, and every changed line is a `+` row. The worktree then reworded S102's `anchor` cell in place (span now reads "subsection body lines 2815-2828 … (quoted spans 2815-2824)"); re-checked after that edit: still 13 columns, census exit 0. In-place `anchor` edits are outside rule 2's allowed fields, so land it as authoring before the closing commit, not as a later correction.

## Census gate

`./scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → **exit 0**, `tabi ok <path>`,
16 `W04` duplicate-url warnings (S058, S065, S066, S068–S070, S073–S077, S095, S096, S098–S100 — all pre-existing,
none naming S102/S103). No E-lines.

## Byte-level re-run of the rows' anchors (from retained scratch bytes, hashes recomputed)

- `sha256sum SrcS102/rfc6265bis-13.txt` → `06223931…6d34d85fbf`; `wc -c` → `146976`; `wc -l` → `3696`; `sed -n '2813,2828p'` shows `8.8.1.  Defense in depth` at 2813 and the body at 2815–2828 — anchor §8.8.1 and the size/digest match the row exactly.
- `grep -c -F 'offer a robust defense against CSRF attack' SrcS102/flat.txt` → 1; `'offers a robust …'` → **0** (the staged paraphrase wave 1 refused is correctly absent from the admitted entry).
- `grep -c 'not the extent of'` → 1 (the entry's own recheck command is runnable); `grep -n '^Expires:'` → `9:Expires: 18 May 2024`.
- `sha256sum SrcS103/owasp-csrf.html` → `6f32bfbf…c4872312`; `wc -c` → `157809`. All four quoted spans count 1 on tag-stripped text, at 21/7/18/16 words (≤25 each).

## Findings

1. **Medium (adjacent to the rows, worktree text) — "only one submit was ever captured carrying one of those shapes" is contradicted by the lane's own evidence, and no sweep is given.** The uncommitted `corpus/README.md:553-554` asserts the singleton and names only `corpus/evidence/w9-tabi-b91/runs/replay-consumed-post/rep1/facts.json`. Sweep: `grep -rl 'tokenShape' corpus/evidence | grep '/runs/' | sed 's#/rep[0-9].*##' | sort | uniq -c` → `4 replay-consumed-post`, `6 replay-consumed-pre`, `6 replay-guard-skip`, `4 replay-terminus` — 20 capture files across **4 run families** (10 reps × facts+journey; 21 files total with the producer `journey.mjs`). Either the scope is one *journey class* (then name the class) or the count is wrong; a count/negative claim carries its sweep.
2. **Low — S103's `anchor` cell grounds one of the three shapes its `teaches` enumerates.** `teaches` says the sheet "Enumerates the defence shapes (synchronizer token, double-submit cookie, custom request header)", but the anchor names only `Employing Custom Request Headers for AJAX/API`, `Dealing with Client-Side CSRF Attacks (IMPORTANT)` and `Limitations of SameSite`, and the Gate/SrcS103 record quotes only the custom-header span. The bytes do carry the missing headings — heading extraction over `SrcS103/owasp-csrf.html` returns `Synchronizer Token Pattern` and `ALTERNATIVE: Using A Double-Submit Cookie Pattern` — so the repair is to name them in the anchor cell, not to retract wording.
3. **Low — S102's `recheck: on-release` is legal but cannot fire.** `sources-census.sh overdue` prints S102 as `cadence`, never `overdue`, and the row's own anchor dates the draft `Expires 18 May 2024` (confirmed at byte line 9); an expired draft has no release stream to bind, so the binding is inert. A date or `90d` would be falsifiable. E09 passes, so this is calibration, not a violation.
4. **Resolved in the uncommitted worktree — the README's grounding sweep was self-refuting as committed at `03c1b4d`.** `git show 03c1b4d:corpus/README.md` ran the sweep over `corpus/knowledge/*.md SKILL.md corpus/*.md`, which once the block was written includes the pattern literal itself and the new entry: re-run → **exit 0, 9 matches in 3 files**. The current worktree pins the baseline — `git grep -rniE 'synchroni[sz]er token|double-submit|custom request header' a89f1935 -- corpus SKILL.md` → **exit 1** — so the claim now reproduces. Land that correction; nothing else needed.
5. **Info — the lesson's command block shows only the before-arm of C2.** `corpus/lessons/round-23.md:24` runs the `S10[23]` grep at `a89f1935` (prints **0**); the after-arm lives in prose and in `corpus/evidence/round-23/c1-measurements.json` `c2.after` = `{rev: 03c1b4d…, value: 1}`. I re-ran both arms and the receipt matches byte-for-byte, including `addedFiles` (one file) and `rows` 101 → 103.

## Not findings (checked, held)

Two rows only (+2/−0 over baseline); URL uniqueness `grep -c` → 1 each; both `mined` rows resolve to an existing file
on disk and in the landing commit; quote texts are character-exact against the retained bytes (the wave-1 refusals of
`offers` and of the sheet's non-existent `§Common CSRF weaknesses…` are honoured in the admitted text).

## Residual risk / gaps

- Bytes moved under this seat (concurrent sibling writes to `SOURCES.md`, the entry, the lesson and the receipt). Every
  check above was re-run on the final worktree state after the move; the counts are those re-runs.
- No network this seat: the retained scratch copies prove row↔artifact consistency and digest equality, **not** that
  the live pages still hash the same. S103 is rolling (`last-modified 2026-10-25T06:56:47Z`); freshness after landing is unverified here.
- `corpus/SOURCES.md:4` still reads "Every row below was opened in kaika fleet round-1 (2026-10-19)", contradicted by
  S102/S103 (2026-10-25) and by every row opened since 2026-10-20. Pre-existing drift, not introduced by these rows.
- Tooling: no installs or upgrades; `awk`, `grep`, `sha256sum`, `python3` from the base system. No git/jj writes; no writes
  outside this report.
