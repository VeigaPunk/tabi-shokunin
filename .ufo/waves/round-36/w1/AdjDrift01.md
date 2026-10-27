# AdjDrift01 — C1 drift re-derivation (round 36, attempt 1, wave w1)

Seat: AdjDrift01 (leaf executor). Scope: independently re-derive the audit status of the 20
ledger rows in `.ufo/waves/round-36/w1-chunks/AdjDrift01.tsv` from git objects only, and
compare against the committed ledger `corpus/adjacency-screen-drift.tsv`.

**Result: 20 rows derived, 0 mismatches. Every row agrees with the committed ledger, status
*and* note.**

## Method (git objects only; no worktree reads, no mutations)

Per row `sibling_ref = <lane>-shokunin@<pin>:<path>:<line>`:

1. `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <pin>:<path>` → line `<line>`,
   `.strip()` = CITED text. File absent → `stale: pin file absent`; line past EOF →
   `stale: pin line absent`.
2. `H` = `c1-delta-pins.json[<lane>]` (frozen delta head). `git show <H>:<path>`; absent →
   `stale: head file absent`. Head line `<line>` trimmed == cited → `unchanged`. Else exact
   trimmed match at head line(s) `N` → `moved :N` (all hits enumerated; each of the 3 moved
   rows has exactly one hit, no ambiguity). No match → `stale`.
3. Compare with the ledger row for the same `sibling_ref`; a row agrees only if **status and
   note** both equal (so a wrong relocation line would surface as a mismatch even with a
   correct `moved` status).

Exact commands: `commands.txt`. Per-row cited/at-head text and head line counts: `derive.log`.

## Derived statuses (receipt.tsv)

| # | sibling_ref (lane@pin:path:line) | derived | ledger | agree |
|---|---|---|---|---|
| 1 | chousa@00f8c7f5…:archived-export-intake.md:141 | unchanged | unchanged | agree |
| 2 | kaidoku@49096c7e…:SKILL.md:98 | unchanged | unchanged | agree |
| 3 | kaidoku@49096c7e…:SKILL.md:188 | unchanged | unchanged | agree |
| 4 | kaidoku@49096c7e…:SKILL.md:189 | unchanged | unchanged | agree |
| 5 | kaidoku@49096c7e…:SKILL.md:585 | moved :748 | moved, verbatim at :748 | agree |
| 6 | kaidoku@49096c7e…:SKILL.md:621 | moved :784 | moved, verbatim at :784 | agree |
| 7 | kaidoku@49096c7e…:SKILL.md:652 | moved :815 | moved, verbatim at :815 | agree |
| 8 | kaidoku@49096c7e…:2026-10-13-asar-surface.md:68 | unchanged | unchanged | agree |
| 9 | kaidoku@49096c7e…:2026-10-13-crash-evidence.md:21 | unchanged | unchanged | agree |
| 10 | kaidoku@49096c7e…:crash-evidence.md:22 | unchanged | unchanged | agree |
| 11 | kaidoku@49096c7e…:crash-evidence.md:43 | unchanged | unchanged | agree |
| 12 | kaidoku@49096c7e…:crash-evidence.md:47 | unchanged | unchanged | agree |
| 13 | kaidoku@49096c7e…:crash-evidence.md:57 | unchanged | unchanged | agree |
| 14 | kaidoku@49096c7e…:r2-frontier-prereqs.md:38 | unchanged | unchanged | agree |
| 15 | kaidoku@49096c7e…:r2-frontier-prereqs.md:40 | unchanged | unchanged | agree |
| 16 | kaidoku@49096c7e…:r2-frontier-prereqs.md:41 | unchanged | unchanged | agree |
| 17 | kaidoku@49096c7e…:r2-frontier-prereqs.md:42 | unchanged | unchanged | agree |
| 18 | kaidoku@49096c7e…:r2-frontier-prereqs.md:43 | unchanged | unchanged | agree |
| 19 | kaidoku@49096c7e…:r2-frontier-prereqs.md:44 | unchanged | unchanged | agree |
| 20 | kaidoku@49096c7e…:r2-frontier-prereqs.md:45 | unchanged | unchanged | agree |

Summary line in `receipt.tsv`: `# AdjDrift01: 20 rows, 0 mismatches`.

## Retained evidence (all read from git objects, values quoted)

- Pins and H both resolve: `chousa@00f8c7f5…` ancestor of `H=f9736a39a0344a0aed63a65dfaddf7db624303d9`
  (52 commits between); `kaidoku@49096c7e…` ancestor of `H=1ed29de2cdd6061315fb2f5478d5029b7d570675`
  (23 commits between). Both `merge-base --is-ancestor` checks exit 0.
- Row 1 (chousa): `git diff --stat pin..H -- corpus/knowledge/archived-export-intake.md` is
  **empty** — the file is byte-identical across the 52-commit head move, so `unchanged` is a
  genuine file-level fact, not just line-141 equality. Cited text: `| AP-03 | browser, CDP,
  profile, session or credential reads of any kind | denied | secrecy guard MI…` at line 141 in both.
- Rows 5–7 (kaidoku SKILL.md): `git diff --stat pin..H -- SKILL.md` = **167 insertions, 4
  deletions**; pin 1405 lines → head 1568 lines. Line 585 at head is now `closed.** Re-capture
  with the identical format and shape gate to` (different text); the pin-cited
  `` | `GoApiSnapshot` WARN `Falling back from X to Y` | … `` occurs at head **only** at 748,
  and the same holds for 621→784 and 652→815 (unique hits). So all three are re-verified
  verbatim relocations, and the audited note is exact.
- Rows 2–4 (SKILL.md:98/188/189) sit in the untouched head of the same file: identical text at
  the same line numbers despite the 167-line insertion lower down — consistent with insertions
  below line 189 ("chunks — `corpus/knowledge/2026-10-14-r12-01-queue-b-ready.md:67`); CDP and").
- Rows 8–20: knowledge files unchanged in the chunk; head line counts 110 / 63 / 144 with the
  cited text verbatim at the same line, and `r2-frontier-prereqs.md` at head is still 144 lines
  (no growth), so no silent rebuild of those files.

## Falsifier / discrimination controls exercised

- Absent-file path: `git show 49096c7e…:SKILL.md.nope` exits 128 → the `stale: pin file absent`
  branch is reachable and would fire.
- Bounds path: a line index past EOF (e.g. 9999 on a 1405-line pin file) is detected as
  `stale: pin line absent` rather than silently indexing.
- Relocation ambiguity: hit lists are enumerated, not first-match; all three moved rows have
  exactly one head hit, so `moved :N` is not a guess between duplicates.
- Discrimination on status: the `unchanged` vs `moved` split is decided by head-line equality
  first, so pinning kaidoku 585 as its own head would read `unchanged` — the 3 rows differ
  **only** because the head genuinely moved, i.e. the derivation is not vacuously "all unchanged".

## Cross-checks against the ledger as a whole (read-only, context only)

- The committed ledger has 307 data rows: 304 `unchanged`, 3 `moved`. My chunk contains all 3
  `moved` rows and 17 of the 304 `unchanged` rows — the highest-risk class (relocations) plus a
  spread of knowledge-file and SKILL.md rows.
- My 20 refs each appear exactly once in the ledger (no duplicate rows), and all 20 are present.

## Risks / limits

- I used the **frozen** delta heads from `c1-delta-pins.json`, as assigned; lanes may have moved
  again since freeze. A row could be `stale` at today's tip while `unchanged` at the frozen head —
  that is out of this seat's scope (the claim measures at the frozen pins, not live tips).
- Agreement is checked on status **and** note text; a ledger row with a correct status but a
  different note phrasing would be reported as MISMATCH. No such case occurred.
- I did not run the C1 counter (`c1-adjacency-sweep-v4.mjs`) or any build/lint/test — wave-in-flight
  discipline leaves the gate to the parent. My derivation is an independent re-implementation, so
  it is a second opinion on the ledger rows, not a re-run of the frozen instrument.

## Tooling

No installs or upgrades were performed (no new tool was needed; `git` and the eval kernel sufficed).
Scratch root `/fast/scratch/hyaku/tabi-r36/AdjDrift01` was created with `TMPDIR` pointed inside it
and deleted at the end. No mutating git/jj command was run anywhere; only `git show`, `git diff
--stat`, `git rev-list --count` and `git merge-base --is-ancestor` on the two sibling repos.

VERDICT ok — 20/20 chunk rows independently re-derived from sibling git objects and each agrees with the committed ledger `corpus/adjacency-screen-drift.tsv` (status and note): 17 unchanged, 3 moved re-verified verbatim at head lines :748, :784, :815; 0 stale, 0 mismatches.
