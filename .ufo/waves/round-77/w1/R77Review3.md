FINDINGS

Scoped findings of seat R77Review3 (read-only conformance review of round 77 C1 `C1-FILECHOOSER-R77`).
Full evidence and commands: `.ufo/waves/round-77/w1/R77Review3/report.md`; seat receipts under
`.ufo/waves/round-77-seats/R77Review3/`. Reviewed commits: base `1320d428`, pre-freeze `cf0804f`, claims
`b51afa7`, D `dcdf582`, scored `ec89a40`, tip `eedaa80`.

PASS (substance): ordering/base parentage/ancestry (5/5 `merge-base --is-ancestor` exit 0; the scored run
started 6.017 s after D's committer time); 14/14 pins at D, tip and worktree; nonce
`tabi-r77-l1-dcdf582add58` = `tabi-r77-l1-` + first 12 hex of D, and the string exists in no file at or
before D (`git grep` at D over 29,638 files: empty; pickaxe over D's history: no commit); prior-set
enumeration at the freeze parent equals `prior-set.txt` (committed enumerator exit 0, 19 = 19, 0
unparsable; independent re-derivation `diff -u` exit 0); the base before-commands reproduce (capability
row 0, notes 0, absent receipt exit 2, no prior set exit 2, r76 receipt exit 1); all 12 `w1-spec.json`
items carry the exact seat-output rule and `build-spec.py --selfcheck` refuses the crafted item (rc 0,
`REFUSED … SelfBad`); QUALITY 145–148 each cite a red state that exists and shows its claim.

F1 MEDIUM — `claims.json:20` cites `.ufo/waves/round-77/lesson-proof/prior-set-enumeration.txt` as the
QUALITY 140/141/146 completeness record; that file is ABSENT at the freeze parent, the claims commit, D and
the tip, and appears in no commit (`git cat-file -e` ABSENT four times; `git log --all -- <path>` empty;
`find` lists only the r74/r75/r76 files). The equality it asserts is true and reproducible (see PASS), but
QUALITY 140's "cites that enumeration" is not met by a missing file.

F2 LOW — `claims.json:40` / `corpus/lessons/round-77.md:6` say "the 13 pre-freeze receipts (3 shape probes,
4 probes, 9 smokes)"; the parenthetical enumerates 16 files. The gate's 13 are `p1..p4 + smoke1..9`
(`prefreeze-summary.json` rows); the 3 shape probes are separate receipt files (driver exit 1), and
`prior-set.txt` has 16 honest receipt paths + 3 degenerates = 19. No predicate depends on the count.

F3 LOW — `freeze.txt` does not pin `claims.json` (14 lines, none names it), whereas round 75
(`freeze.txt:8`) and round 76 (`freeze.txt:8`) both pin their claims file. Nothing changed post-D
(`git log dcdf582..eedaa80 -- .ufo/waves/round-77/claims.json` empty; worktree copy unmodified); latent
gap for a post-D claim edit, a regression from the two prior freezes.

F4 LOW — the completeness instrument `.ufo/waves/round-77/controls/c1/enumerate-prior-set.mjs` is
committed but unpinned in `freeze.txt` (grep 0), although its output is the record F1 says is missing.

F5 NOTE — a schema-only enumeration at the freeze parent is 38 files: 19 prior receipts plus 19
`*.driver.out` files that carry the top-level r77 schema but no `nonce`/`events`. The claims'/QUALITY 146's
widened receipt test (schema and nonce or events) is what makes the set equal `prior-set.txt`; keep that
qualifier explicit.

F6 NOTE — the L1's before-run JSON (`.ufo/waves/round-77/scored/before/*.json`, untracked, created after D)
sits inside the counter's walked tree. None is a receipt (schemas `tabi-check-filechooser-r77` or absent),
and the frozen counter is still clean 183 with them present; the seat rule would forbid this placement for
a seat.

F7 NOTE — the r76 receipt before-run yields 122 findings with the real `--expect-nonce
tabi-r77-l1-dcdf582add58`, and 123 with `--expect-nonce tabi-r77-x-0000` (the scored receipt then counts as
an outside receipt, `prior-set-complete`). The L1's recorded run used the dummy nonce; any quoted "123"
should name that invocation.

Residual risk: no driver/battery/kill-power execution by this seat (leg (b) belongs to R77Exec1; scored
exit files 0 and summaries allOk/holds were read, not re-derived); prior receipt bytes are unpinned (the
scored counter records their sha256); leg (d) is open at the committed tip (capability row 0 committed, 1
in the dirty worktree); no pinned file differs from its digest in the worktree.
