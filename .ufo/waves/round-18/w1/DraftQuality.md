VERDICT: ISSUES

Scope: draft of QUALITY.md criteria 33–38 at `.ufo/waves/round-18/drafts/quality-append.md` (own file only). Style matches criteria 26–32 in `corpus/QUALITY.md` (numbered, `Refines N` where applicable, trailing `(lesson: ...; pointer)`), continuation lines indented four spaces.

Mapping (each routed item in `corpus/lessons/round-17-verifier-spotcheck.md:157-165`):
- 33 ← item 4 (`:162`): correction sweeps every cell carrying the falsified premise; superseding row carries none; superseded row bytes untouched (consistent with PLAN append-only rule for SOURCES).
- 34 ← item 1 (`:159`): prose counts recomputed by a pasted command at the measured revision.
- 35 ← item 2 (`:160`): harm runs bind to the measured revision; full 40-hex `revision`; full gate set.
- 36 ← item 5 (`:163`): full 64-hex digests beside committed bytes; `/tmp` is not a root.
- 37 ← item 3 (`:161`): self-test claims cite a committed receipt under `corpus/evidence/`.
- 38 ← no routed item names recheck receipts. Rule content comes from PLAN.md C1 receipt contract (`.ufo/waves/round-18/PLAN.md:67-77`). Cited pointer is the block range `:157-165` plus item 4 for supersede-not-edit.

Findings (pointer gaps for L1 to decide at integration):
1. `corpus/lessons/round-18.md` does not exist at B (`2bff864f…`). Criteria 33–38 cite `round-18.md#mistakes`; they resolve only once DraftLesson lands that file with a `mistakes` anchor. Criterion 10 also requires it.
2. `.ufo/waves/round-18/PLAN.md` is untracked at B (`git ls-files` returns nothing for it). Criterion 38's rule therefore has no tracked pointer under QUALITY 28. Options: the L1 commits the recheck contract to a tracked corpus file, or a routed item is added for it. The draft did not cite PLAN.md.
3. Criterion 38 has no direct routed item; it is an inference from the spot-check block and PLAN C1, not a spot-check finding. Marked here, not in the criterion text.
4. The item-2 pointer keeps the spot-check's abbreviated `6c97851` as quoted; it is not checked against the full hex here.

Checks run (read-only): `corpus/QUALITY.md` (criteria 1–32, last at line 139); `corpus/lessons/round-17-verifier-spotcheck.md:150-170`; `.ufo/waves/round-18/PLAN.md`; `git ls-files` for four paths; `git rev-parse --verify refs/heads/master` = `2bff864fdfee684ddbcd066cc8e735adaba2735c`. No count, digest or hash was computed or invented. No installs or updates. No git writes, no jj, no delegation.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/drafts/quality-append.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/DraftQuality.md
