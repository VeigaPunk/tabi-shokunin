# AdjDriftKaidoku — C1 deep verification: the 3 MOVED rows are genuine verbatim relocations

Seat `AdjDriftKaidoku`, round 36 / w1, tabi lane. Scope: the round's only non-`unchanged` drift —
`corpus/adjacency-screen-drift.tsv` rows for `kaidoku-shokunin@49096c7e…:SKILL.md` lines 585/621/652,
claimed "moved, verbatim at :748/:784/:815" (delta head `1ed29de2cdd6061315fb2f5478d5029b7d570675`).

**Verdict: the claim holds, and it holds more strongly than "verbatim after trim".**

## Findings

1. **Byte-identical, not merely trim-equal.** Raw sha256 of the pin line equals raw sha256 of the named
   head line for all three rows (398/350/906 bytes respectively, same byte counts). There is no whitespace,
   Unicode-arrow or table-padding drift to forgive.
2. **The named head lines are the only occurrences.** `grep -nxF` with each full line as needle over the
   whole head file returns exactly the one line the ledger names (748 / 784 / 815), and exactly one line in
   the pin file (585 / 621 / 652). No duplicate the ledger failed to name; the old occurrence is gone
   (head 585/621/652 now hold unrelated prose).
3. **The screen citations survive the move.** Browser-ledger rows 62-64 quote three fragments; each occurs
   exactly once in head SKILL.md, on 748 / 784 / 815 respectively. The `not-browser-sense` dispositions still
   rest on real text.
4. **`kimi-webbridge` is still on every relocated line, in the role the screen notes describe:** 748 =
   round-18 REA run directory (`.ufo/waves/round-18/runs/real-kimi-webbridge/...`), 784 = held-out Go
   parity carrier, 815 = walk-channel false positive. Relocation changed neither the token nor its sense, so
   the three dispositions remain supported at head.
5. **Mechanical cause is pure insertion, not an edit-and-restore.** `git diff pin head -- SKILL.md`:
   167 insertions, 4 deletions; hunk old-side headers 328, 357, 374 — all above 585; the 4 deletions are
   unrelated sqfs-triage prose at ~328. No hunk overlaps [585,652] and **zero** diff lines carry any of the
   three rows' text. All three shift by exactly +163 (= 167−4). A constant shift with untouched content is
   the diff-level proof of a verbatim move.
6. **Cross-check of the whole ledger (independent re-derivation).** Re-implemented the status rule from git
   objects for all 307 rows across 9 pins: `checked=307 missing_at_head=0 status_mismatches=0`, `moved rows=3`.
   The three moved rows are not an artefact of a systematically wrong ledger, and no `unchanged` row hides a
   content change at the same line number. (This is a cross-check, not the C1 measurement — that is
   `c1-adjacency-sweep-v4.mjs` at REV.)

## What I did not find

No mis-audited row among the 307, no unnamed duplicate at head, no missing cited file (0/307 missing), no
change to the three rows' text or to their browser-ground token. Nothing here contradicts C1's
`drift.auditCoverage == drift.total`, `drift.auditFindings == 0` legs *for these rows*; the counter run at
REV remains the only thing that can verify the predicate.

## Caveat on head choice

`kaidoku-shokunin`'s worktree HEAD is `ece55864c9…` with ` M SKILL.md` and extra round-43 untracked files.
All verification used `git show <commit>:SKILL.md`; the worktree was never read. The "head" here is the
frozen delta pin `1ed29de2cd…` from `.ufo/waves/round-36/baseline/c1-delta-pins.json`, as the claim specifies;
that commit is a descendant of the pin.

## Evidence

`receipt.md` (this dir) — side-by-side lines, sha256s, greps, diff geometry.
`verify.sh` / `verify.log` (this dir) — the full read-only reproduction; log sha256
`15fb26837b49456a16417ecf283fa53b5e3e12cd987902dd66b181529184cf6e`, exit 0.
Ledger sha256 `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2`.

## Tooling

No installs, no upgrades: `git` and `python3` from the host were sufficient. No pacman, no network.
No git mutation; all git calls read-only and repo-scoped. Scratch `/fast/scratch/hyaku/tabi-r36/AdjDriftKaidoku`
removed at end.

VERDICT ok — 3/3 moved rows verified byte-identical at the named head lines (748/784/815), unique at head, screen-quoted fragments present there, `kimi-webbridge` present in the same sense, and the shift is a pure +163 insertion with zero diff lines touching the rows.
