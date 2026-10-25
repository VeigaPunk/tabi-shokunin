# W2CorrAttempts — item 4 grades vs the watchdog launches and the commits

**Verdict:** grade *labels* survive the bytes (1 progressing, 2 silent, 3 landed, each cited
commit inside its own dispatch window) but the item's "85-hour gap" is bound to the wrong
interval (cited window = 30h42m06s), all three dispatches are logged `attempt=1`, and the class
the item closes on (`c4-stale-attempts`) clears a paragraph of deliberately false grades —
**PARTLY SUPPORTED: one figure wrong, one capability claim overstated**.

## Confirmed (commands and the bytes they read)
1. `grep -n 'tabi' /home/vgpnk/Projects/shokunin/.ufo/watchdog.log` →
   `609:2026-10-21T11:47:45-03:00 launch tabi round=22 pgid=3858570`,
   `1087:2026-10-23T20:41:38-03:00 … pgid=3500528`, `1257:2026-10-25T03:23:44-03:00 … pgid=1758376`,
   `1263:2026-10-25T03:40:22-03:00 complete tabi round=22`.
2. Window 1: `git -C tabi-shokunin log --since='2026-10-21T11:47:45-03:00'
   --until='2026-10-23T20:41:38-03:00' --date=iso-strict --pretty='%h %ad %s'` → exactly
   `0f24164 11:51:39` (+3m54s) and `e3cf4e0 13:38:27` (+1h50m42s).
3. Window 2 empty on every ref: same command with `--all --since='2026-10-23T20:41:38-03:00'
   --until='2026-10-25T03:23:44-03:00'` → no rows; `git rev-parse --short 47bfb5f^` → `e3cf4e0`
   (dispatch 3 branches off attempt 1's tip); `find .ufo/waves/round-22 -newermt
   '2026-10-23T20:41:38-03:00' ! -newermt '2026-10-25T03:23:44-03:00' -type f | wc -l` → `0`.
4. Window 3: `git log --since='2026-10-25T03:23:44-03:00' --until='2026-10-25T03:40:22-03:00' …`
   → `47bfb5f 03:31:37`, `fbee618 03:36:54`, `be271a2 03:38:49`, all round-22 subjects.
5. `.ufo/reports/round-22/tabi.md:3` = `**Stale-lane:** none — respawn-per-round driver`;
   auditor payload `"derived": "9 attempt receipts / 0 graded"` (`node
   scripts/round-evidence-audit.mjs --rev a89f193… --round 22 --round-cap 128 --json`).
## Findings
**F1 (medium) — "85-hour gap" bound to the wrong interval.** `2026-10-23T20:41:38-03:00 →
2026-10-25T03:23:44-03:00` is `1 day, 6:42:06` (30h42m06s). 85h53m10s = `3 days, 13:53:10` is
`e3cf4e0`→`47bfb5f` (last-attempt-1-commit to first-attempt-3-commit); the readings differ by
55h11m04s. Command: `python3 -c "from datetime import datetime as D; …"` over those timestamps.
**F2 (medium) — "attempt 1/2/3" is ordering, not the log's `attempt` field.** All three launches
carry `attempt=1`; `grep -c 'complete tabi round=22' .ufo/watchdog.log` → `1` (after dispatch 3);
`grep -n 'lane-dead.*tabi' .ufo/watchdog.log` → only `397: … tabi round=1`, so no retry was ever
recorded. The field's writer is not in the repo: `grep -n 'driver=' scripts/shokunin-watchdog.sh`
→ no match (line 221 logs only `launch $lane round=$n pgid=$pid`); semantics rest on precedent
(kake round=22, lines 546-547). The numbered grades are the lesson's relabelling of dispatches.
**F3 (medium) — "attempt 2 silent" is unattributable past absence of bytes.** Dispatch 2 has a
launch row and no terminal row of any kind; no commit (§3 command) and no wave-file write.
"Silent" holds only as "no lane bytes" — the log cannot separate a no-op coordinator from one
that never started. The silence also runs 7m53s into dispatch 3 (first commit 03:31:37 vs launch
03:23:44), so the second launch does not bound it.
**F4 (high) — the class accepts false grades.** `gradedAttempts()`
(`scripts/round-evidence-audit.mjs:195-204`) matches `Attempt N — <word>` and counts distinct
`N`; nothing compares a grade with a launch or a commit. Fixture asserting the opposite of F3:
`node scripts/round-evidence-audit.mjs --rev a89f193… --round 22 --round-cap 128 --report
.ufo/waves/round-23/scratch/W2CorrAttempts/false-grades.md --json` → `classes: [c1,c2,c3,c5]`,
**`c4-stale-attempts` absent**, for `Attempt 1 — landed. Attempt 2 — landed. Attempt 3 — landed.`
So item 4's "now requires a per-attempt grade" is true of shape only.
**F5 (medium) — the class's "attempt" is not item 4's.** `c4` counts
`files.filter(f => /attempt[^/]*\.json$/.test(f))` (line 346) whose comment says "a dispatch
attempt of the round …, not a wave"; round-22's nine matches are all wave files —
`git ls-tree -r --name-only a89f193 -- .ufo/waves/round-22 | grep -Ei 'attempt[^/]*\.json'` →
nine `w2-attemptNN-result.json`. The dispatches have no receipt, and
`find .ufo/waves/round-23 -name 'attempt*.json' | wc -l` → `0`, so `c4` is vacuous for round 23.
**F6 (medium-low) — the grades sit where the class does not read.** `c4` reads `reportText` only
(line 347); `lessonText` feeds `c1` (line 264) and `c3` (line 329). Item 4's grades are in
`corpus/lessons/round-23.md`, so they cannot satisfy the class, and `.ufo/reports/round-23/tabi.md`
is absent (`ls .ufo/reports/round-23/` → nine other lanes) — the paragraph `c4` will read is
unwritten and unverifiable now.
**F7 (low) — "landed" excludes the tip C1 audits.** `complete tabi round=22` is 03:40:22;
`a89f193` lands 03:50:10, inside no dispatch window. The three cited hashes are correctly inside
window 3; "landed" must not be read as covering the round-22 tip.
## Residual risk and gaps
- All checks author-side (lane-dispatched seat); no non-author read of the log or these windows exists.
- F2 cannot be closed from the repo: the `driver=hyaku-inline attempt=` writer is absent from
  `scripts/shokunin-watchdog.sh` at `08646c1c`; only the kake precedent fixes the field's meaning.
- `git log` reads the git side of a colocated jj repo; a jj-only change never exported to a git ref
  would be invisible to every window check (none found, not excluded).
- Tool installs/upgrades: none (no need).
