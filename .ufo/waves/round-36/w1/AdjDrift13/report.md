# AdjDrift13 — C1 drift-verification, independent re-derivation (tabi r36 w1)

## Scope
My chunk `.ufo/waves/round-36/w1-chunks/AdjDrift13.tsv` = 20 ledger rows, all one lane/file:
`kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md`
at lines 371, 381, 383, 386, 390, 395, 396, 405, 406, 415, 432, 433, 442, 471, 486, 502, 503, 504, 505, 566.
Frozen contract read first: `.ufo/waves/round-36/claims.json` (C1 surface/predicate/killRule/feasibilityDisclosed; frozen at `2e7b7a8920bff47fae6f75c3d06e48e37767099e`).

## Method (git objects only; nothing read from a worktree, nothing mutated)
For each row, independently re-implemented (own code, `derive.mjs`, not the frozen builder):
1. `git -C .../kumitate-shokunin show <pin>:<path>` → trim line `<line>` = CITED text.
2. Frozen delta head `H` for lane `kumitate` from `.ufo/waves/round-36/baseline/c1-delta-pins.json`
   → `d23892ad44b41e1af63b3edb949d265ca1dd812d`. `git show H:<path>`:
   absent → `stale: head file absent`; line `<line>` trimmed equal → `unchanged`;
   else search head for a line whose trimmed text EQUALS the cited text → `moved :N`; none → `stale`.
3. Compared with the committed row in `corpus/adjacency-screen-drift.tsv` (looked up by sibling_ref).

Every git invocation, with its exit code and stdout size, is in `commands.txt` (50 lines). Scratch root
`/fast/scratch/hyaku/tabi-r36/AdjDrift13/` with `TMPDIR=.../tmp`, deleted at the end; no pacman, no
installs, no git/jj mutation, no writes outside my seat dir.

## Result
`receipt.tsv`: **20 rows, 0 mismatches**. All 20 rows re-derive `unchanged / -` and the committed ledger
says `unchanged / -` for each: 20 × `agree`.

Falsifiers run (so "unchanged" is shown to be honest rather than vacuous, the failure mode of a trim-equal audit):
- **Drift is real for this lane, absent for this file.** `pin..H` = 12 commits, 578 files changed
  (`git rev-list --count`, `git diff --stat`); `git diff --name-only P H | grep -c kimi-skills-plugins.md` → **0**.
  The cited file's blob sha is identical at both revisions: `3fd95114525f654ab1624ce4a9a17c63da1038b8` (pin) =
  `3fd95114525f654ab1624ce4a9a17c63da1038b8` (head); `git diff --stat P H -- <path>` is empty; 581 lines /
  36649 bytes on both sides. `merge-base --is-ancestor P H` holds, so the head is a descendant and the
  equality is content identity, not a rebase artifact. Every `unchanged` here is therefore forced by the
  objects, not asserted.
- **No trim-vacuous rows.** Shortest trimmed cited text among my 20 is 64 chars (line 503), longest 258
  (line 471); none empty or whitespace-only (`cited-lines.tsv`).
- **No CRLF** in either blob (`grep -c $'\r'` → 0), so the line-number/trim convention cannot silently match
  across a `\r`.
- **Convention disagreements impossible here:** no duplicate sibling_refs anywhere in the committed ledger
  (`cut -f1 | sort | uniq -d | wc -l` → 0) and the ledger holds 307 data rows, matching C1's stated 307.
- **Second-method cross-check:** lines 371 / 415 / 566 read via `git cat-file blob` + `awk` (independent of
  the JS split/index path) give byte-identical trimmed text at pin and at head.

Note on `moved` semantics I followed (builder rule order): pin-file absent → `stale: pin file absent`;
pin line absent → `stale: pin line absent`; head-file absent → `stale: head file absent`; head line equal →
`unchanged`; else first verbatim relocation → `moved :N` (with `(also :...)` for extra hits); else
`stale: cited text absent at head`. None of these branches fire as `moved`/`stale` in my chunk, consistent
with C1's disclosed "3 moved rows are kaidoku" (SKILL.md 585→748, 621→784, 652→815) — my slice contains
no kaidoku rows.

## Files
- `.ufo/waves/round-36/w1/AdjDrift13/receipt.tsv` — 20 `ref<TAB>my-status<TAB>my-note<TAB>ledger-status<TAB>verdict` lines + `# AdjDrift13: 20 rows, 0 mismatches`
- `.ufo/waves/round-36/w1/AdjDrift13/commands.txt` — exact git commands (exit codes, output sizes) + falsifier commands
- `.ufo/waves/round-36/w1/AdjDrift13/derive.mjs` — my independent derivation script
- `.ufo/waves/round-36/w1/AdjDrift13/cited-lines.tsv` — the 20 cited lines with trimmed lengths (non-vacuity evidence)

Parsing note for counters: `receipt.tsv` line 1 is the literal header `sibling_ref<TAB>my-status<TAB>my-note<TAB>ledger-status<TAB>agree|MISMATCH`; a naive `grep MISMATCH` hits that header only. Data lines: 20, all ending `agree`, 0 `MISMATCH`.

## Risks / blockers
- Risk: my 20 rows are all one file that `pin..H` does not touch, so this chunk exercises the `unchanged`
  branch only; the `moved`/`stale` branches and the 3 relocation notes remain untested by this seat.
- Risk: an implementation copying the builder's rule order cannot detect a mis-ordered rule (e.g. reloc
  search before the at-line equality test); I recorded the order I used so a w2 seat can attack it.
- No blocker; no tool installs or upgrades were needed.

VERDICT ok 20/20 rows re-derived from git objects at the frozen delta head agree with the committed ledger (0 mismatches); kumitate pin..H drifts over 578 files but the cited file's blob is byte-identical at pin and head (3fd95114…), so every `unchanged` is forced by the objects; no trim-vacuous, CRLF or duplicate-ref escape found.
