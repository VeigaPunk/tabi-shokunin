FALSIFIED

# R78Review3 — conformance review of round 78 C1 (read-only)

Verdict per assignment item: (1) ordering HOLDS for the committed chain, with one caveat;
(2) pins **FAIL at D** (`d59ca027`), match at the later tip `8384256d` only because of a
post-D instrument commit; (3) nonce HOLDS; (4) prior-set enumeration HOLDS exactly;
(5) `--tree-exempt` is not reachable in the frozen leg and is not needed by it (path-only
residual risk); (6) the C2 checker implements QUALITY 152's letter but not its intent, and
a do-nothing edit reaches `mismatches=0`.

The tip moved during the review (the L1 committed `8384256d` at 15:17:08 and deleted the
offending `.out` in the worktree without committing it). Every measurement below is pinned
to a commit and a timestamp; the L1 has announced a re-freeze (new D, new scored run) and a
C2 structural fix, neither of which had landed when this report was written.

All JSON artifacts are under `.ufo/waves/round-78-seats/R78Review3/`; no lane file was
written, no git mutation was made, no tool was installed.

## F1 (decisive) — the freeze pin does not bind the committed battery at D

`freeze.txt:3` records `724887280cfc11e0c0bd05d6cd07b80c899d7546953465d2cda836d6f7a3ab1a`
for `scripts/negatives-filechooser-r78.mjs`. The blob at D is
`71bce77db9c2384e3f54fd798be2bd6d0782c54ca790e89aa4eed8aa3088441f`.

```
git show d59ca027:scripts/negatives-filechooser-r78.mjs | sha256sum  # 71bce77d…  (exit 0)
sha256sum scripts/negatives-filechooser-r78.mjs                      # 724887…  (worktree, mtime 14:59:29)
git show --stat d59ca027                                             # claims.json, freeze.txt, selftest only
git diff d59ca027 -- scripts/negatives-filechooser-r78.mjs           # worktree ADDS the TOL witness
```

The 724887 bytes existed only as an uncommitted working-tree edit (14:59:29, between
`8da28287` at 14:43:58 and D at 15:06:46). The diff adds `keepScattered(p, keep, shift)`
and `accept('accept-prior-retimed-0.051-scattered', …)` — the TOL 0.06 witness. The
committed battery has 10 `accept(`/`refuse(` registrations, the worktree 11; the scored
battery output says `cases: 398` (`.ufo/waves/round-78/scored/c1-negatives-a.json`, mtime
15:07:22), which only the uncommitted bytes produce (the committed version is the 397-case
battery pinned as `71bce77d` at `8da28287`).

At the later tip `8384256d` (15:17:08, "battery bytes of D … and the final pre-freeze
battery outputs") the battery blob is `724887…` and **all 14 pins match** (loop over
`freeze.txt` at `8384256d`: 14 OK). So the freeze was satisfied only by a post-D commit;
the D commit message and `SCORECARD.md` claim "battery 398 cases incl. the TOL 0.06
witness" describe bytes that were not in D.

## F2 (decisive at the committed tip) — the frozen counting command exits 1

`.ufo/waves/round-78/scored/selftest-r78-gates.out` is a JSON object followed by the
selftest's summary line (`clean=true cases=15 failed=none`, starting at byte 7628), and it
was committed inside the walked tree `.ufo/waves/round-78` by `b1f33724`. The counter
refuses it as `prior-set-unparsable` (`scripts/check-filechooser-r78.mjs:307`).

Measured on the worktree at `b1f33724` (before the L1's deletion):

```
node scripts/check-filechooser-r78.mjs --lane <lane> --receipt corpus/evidence/round78/…/receipt.json \
  --expect-driver-sha256 0ae89d92… --expect-nonce tabi-r78-l1-d59ca0270c2a \
  --prior-set .ufo/waves/round-78/controls/c1/prior-set.txt --json
# exit 1, checkCount 186, findings: [prior-set-unparsable: …/scored/selftest-r78-gates.out]
```

Same on cold1 with `--prior corpus/evidence/round78/…/receipt.json` (exit 1, same finding).
`--tree-exempt .ufo/waves/round-78/scored/selftest-r78-gates.out` does **not** suppress it
(still exit 1): the exemption is consulted only in the `outside` condition at line 308, not
in the `unparsable` push at line 307. The frozen selftest exits 1 with 7 of 15 cases red,
every one carrying `prior-set-unparsable` (`selftest-now.json`: `scored-clean`,
`cold-clean`, `pin-mismatch`, `nonce-mismatch`, `replay-of-scored`, `replay-of-smoke`,
`tree-exempt-absent`).

Measured on a scratch extraction of the committed tip `8384256d`
(`git archive 8384256d scripts .ufo/waves corpus/evidence/round78 corpus/evidence/round77`):
counter exit 1, 186 checks, same finding (`counter-tip-8384256d.json`); selftest exit 1,
same 7 cases (`selftest-tip-8384256d.out`). So the committed tip is not re-verifiable.

The current worktree is clean only because the `.out` was deleted without a commit
(`git status` = ` D`; `git cat-file -e HEAD:.ufo/waves/round-78/scored/selftest-r78-gates.out`
exit 0; the copy now lives at `.ufo/waves/round-78-seats/L1-selftest/`). Re-running on the
worktree now gives exit 0, 186, clean (`counter-scored-now.json`). The scored counter output
(15:07:22) predates the `.out` (15:14:07), so the scored measurement was clean but the
committed tree was not; this is the defect class QUALITY 151 was added to prevent (lesson
`scope` row, `corpus/lessons/round-78.md:65`).

## F3 — C2: do-nothing edits reach `mismatches=0`

QUALITY 152 (`corpus/QUALITY.md:1026`): "A capability row's first-working round must be a
round whose recorded verdict is not `NOT VERIFIED`/`honest stop`, unless the row says
`provisional`; the count is a committed instrument … not a reading."

The instrument (`scripts/check-capability-status.mjs`) takes the **first** number in the
last cell (line 41), tests the named round's whole section body for the literal words
(lines 28/50), and suppresses on `provisional` (line 50). Reproduced:

| edit (on base `ae2dc25f` SCORECARD) | exit | mismatches |
|---|---|---|
| none (before state) | 1 | 1 (`c2/base-run.json`) |
| last cell `77` → `provisional r77` (no repair, no evidence) | 0 | 0 (`c2/donothing-provisional.json`) |
| last cell `77` → `round 75` (a different capability's passing round) | 0 | 0 (`c2/donothing-otherround.json`) |

Three further defects, reproduced or code-read:

1. The r78 capability row at `SCORECARD.md:3853` is **invisible** to the checker: its first
   cell is `` `chromium-file-chooser-linux` (generation r78) ``, which fails the
   `^`([^`]+)`$` name regex (line 38). `rows=10`; the only chooser row seen is line 3814.
2. Round 78's section contains `NOT VERIFIED` at `SCORECARD.md:3847` (the C2 row quoting
   round 77's verdict). Making the r78 row visible with last cell `78` therefore mismatches
   (reproduced: exit 1, "round 78 carries NOT VERIFIED/honest stop"). The green depends on
   the `provisional` label, not on round 78's verdict.
3. The checker never verifies that the provisional round is the failed round (C2 leg b's
   "provisional together with the failed round" is unimplemented); `round 78 (provisional
   r77: …)` binds to 78 and the `r77` is never examined.

Also: `SCORECARD.md:3847` states "after: exit 0, mismatches 0, provisional 0
(`scored/c2-after.json`)" but that file records `"provisional": 1`, and it is untracked at
HEAD. The before state is reproduced exactly (base SCORECARD → exit 1, 1 mismatch).

For the L1's announced fix: the substring test at line 28 still matches the round-78
section's own C2 row (line 3847), so a row naming round 78 without `provisional` fails until
either the quoting leaves that section or the verdict test becomes structural; and the
"section must list the capability" rule conflicts with "one row only" if the single row
lives in the round-77 section.

## F4 — ordering: the committed chain holds; the instrument edit does not

Committer dates (`git log -1 --format='%ci'`): `e866ca7c` 13:58:29 (instruments, controls,
claims.json, sources, note, QUALITY), `5e78b9f1` 13:58:36 (first D), `3289c1d0` 14:36:27
(pre-freeze repair), `3a9caf6a` 14:43:48, `8da28287` 14:43:58 (D, battery pin 71bce77d),
`d59ca027` 15:06:46 (final D), `b1f33724` 15:14:40 (scored run + gates + cold1 + wave),
`8384256d` 15:17:08 (post-D battery commit). No instrument or control edit is committed
between D and the scored run; the only post-scored commit is `8384256d`, an instrument
change. Caveats: (a) claims.json is introduced in the *same* commit as the instruments, not
a separate earlier commit; (b) the battery edit at 14:59:29 sits between `8da28287` and D
and was never committed at D (F1), so the "final instruments" at D include a file whose
bytes are older than its recorded digest. Minor: the D commit message asserts "selftest
15/15" at 15:06:46, but the cold1 receipt the selftest reads was created at 15:07:16 and
the selftest output at 15:14:07.

## F5 — nonce: holds

Scored receipt `corpus/evidence/round78/chromium-file-chooser/receipt.json:3` nonce =
`tabi-r78-l1-d59ca0270c2a`; `driverSha256` = `0ae89d92…`; `frameTree.mainFrameParentId` =
null, `mainFrameUrl` = `about:blank`; `fixtureInputs` = 5 (`s,m,d,k,f`); `mainFrameId`
matches `frameTree.mainFrameId`. `git grep 'tabi-r78-l1-d59ca0270c2a' d59ca027 -- .` →
exit 1 (no match); `git log -S'tabi-r78-l1-d59ca0270c2a' d59ca027` → no commit in D's
ancestry; the receipt is not in D's tree (`git cat-file -e` exit 128). D12 =
`d59ca0270c2a` = first 12 of D; `scored/digests-commit.txt` = D.

## F6 — prior-set enumeration at the freeze parent: holds exactly

Whole-lane `git grep -l 'tabi-chrome-cdp-filechooser-r78' 8da28287` → 45 candidate files,
each parsed: exactly **10** objects with that top-level schema carrying `nonce` or `events`
(3 degenerates + 4 probes + 3 smokes). `prior-set.txt` has those 10 plus the r77 scored
receipt (schema `tabi-chrome-cdp-filechooser-r77`) = 11 lines; set diff: no omissions, no
extras, no duplicates (`enumerated-whole-lane.txt`, `priorset-all.txt`). All 11 paths exist
at D. The `*.driver.out.json` files are schema-r78 but carry neither `nonce` nor `events`,
so they are not receipts by QUALITY 140; the counter agrees.

## F7 — `--tree-exempt` (QUALITY 153): not reachable in the frozen leg, not needed

The frozen counting command (`claims.json` countingCommand, `SCORECARD.md:3846`) omits
`--tree-exempt`; the scored receipt is exempt by identity (`selfReal`, line 308) and the
walk finds no other schema receipt, so the command does not need it. The interface is
caller-chosen and path-only (lines 181-184, 294): it suppresses `prior-set-complete` but
not `prior-set-unparsable` (verified). It is used only by the battery
(`scripts/negatives-filechooser-r78.mjs:531`); the pre-freeze and scored harnesses do not
use it. A forger does not choose the verifier's arguments, so the frozen leg is not
reachable; any ad-hoc invocation can hide a well-formed same-schema receipt by path, which
the SCORECARD's own r79 plan already says should be receipt-bound.

## Residual risk and verification gaps

- I did not run the battery (397/398) or the kill power. The battery case-count comparison
  is by registration count plus the committed/scored outputs; because of F1 the
  "398/398 incl. the TOL 0.06 witness" claim is not reproducible from D.
- The "hide a well-formed receipt by path" behaviour of `--tree-exempt` is code-read
  (lines 294/308), not run: writing a receipt into the walked tree is forbidden by the
  seat-output rule.
- F2 means every counter invocation at the committed tips `b1f33724` and `8384256d` fails,
  including the wave's cold-run acceptance (leg b) and the selftest (leg d), until the
  deletion of `.out` is committed or the walk is fixed.
- The L1 announced a re-freeze (new D, new nonce, new scored run) and a C2 structural fix;
  neither had landed at the time of writing, so this report measures `d59ca027`/`b1f33724`/
  `8384256d` only.
