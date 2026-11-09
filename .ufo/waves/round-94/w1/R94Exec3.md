# R94Exec3 — record gates on round 94

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Master tip at run time: 012776cf (scored commit).
Freeze: 2308b6ce. Base: d7744d04. Read-only on the lane; no commits, no git mutation, no chromium launched.
Scratch /fast/scratch/hyaku/tabi-r94/R94Exec3 created and removed before yield.

## 1. Freeze-stamp gate (round 94) — clean, rc 0

Usage note: the script has no `--help`. `--help` returns `error: unknown argument: --help`, rc 2. Usage was read from the script header (`--lane <ABS lane> --round <N> [--json]`).

Command: `node scripts/check-freeze-stamp-round93.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --round 94 --json` → rc 0
Output (`w1/R94Exec3-freeze-stamp.json`): verdict `clean`, addedIn 2308b6ce, committedAt 2026-11-08T21:49:42-03:00, frozenAt 2026-11-08T21:49:37-03:00, findings [].
frozenAt precedes the commit that added claims.json by 5 s. The gate binds committer time, which is the residual the r93 lesson already disclosed.

## 2. LOG section-claims gate (round 94) — setup, rc 2

Usage note: the script has no `--help` either. `--help` returns a setup verdict (`--lane must be an absolute path`), rc 2. Usage was read from the header.

Command: `node scripts/check-log-section-claims-round93.mjs --lane <lane> --rev master --rounds 94 --json` → rc 2
Output (`w1/R94Exec3-log-claims.json`): `{"verdict":"setup","detail":"no `## Round 94` entry in LOG.md at 012776cf..."}`.

`git show master:LOG.md | grep '^## Round 9[34]'` returns only `4233:## Round 93 — 2026-11-08 (attempts 1–2, Linux host)`. The round-94 LOG entry has not landed on master. This is a setup condition, not a finding. It must be re-run after the round-94 records commit.

Calibration (the gate is not dead code): `--rounds 93 --rev master` → rc 0, verdict `clean`, 1 claim (`corpus/README.md ## Round 93 coverage`, present), 0 findings (`w1/R94Exec3-log-claims-r93-calibration.json`).

## 3. Sources census — rc 0, `tabi ok` (after one transient rc 1)

Command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`

- First run (21:5x), rc 1. Output had 37 `W04` duplicate-URL warnings and two errors: `tabi E11 S233 missing used-by corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md` and the same for `S234`. Saved as the first-run output in `w1/R94Exec3-census.txt`, which is superseded by the rerun below. (The census file in `w1/` was written at 21:5x; the rerun is the canonical artifact.)
- Cause: the knowledge note was not on disk yet. It appeared at 21:53 (`corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md`, 6558 B, untracked, not yet on master).
- Rerun at 21:54:21: rc 0. Lines: `tabi	ok	.../corpus/SOURCES.md`, plus the 37 `W04` cross-scope duplicate-URL warnings (unchanged from the first run). No E-class errors.

Artifact: `w1/R94Exec3-census-rerun.txt`. The stale first-run file is `w1/R94Exec3-census.txt`.

Note for the L1: the knowledge note is untracked on the lane at the time of this run. Census `ok` depends on it being committed.

## 4. Round-93 Gate quote word counts (`wc -w`)

Source: `corpus/lessons/round-93.md ## Gate`. Quote strings were rebuilt from the Gate text and the staged sources in `.ufo/waves/round-93/sources/`. They are not copied from a file. Each count is `printf '%s' "<quote>" | wc -w`.

| id | recorded | measured | match |
|---|---|---|---|
| S231 `NodeForId` / `No node found for given backend id` | 14 | 14 | yes |
| S231 `setFileInputFiles` / `Node is not a file input element` | 12 | 12 | yes |
| S232 `DOMNodeId g_last_id = 0;` + `DEFINE_STATIC_LOCAL(...map_instance,` | 8 | 6 | **no** |

This confirms the r93 spot-check §8 item 1 (S232 recorded 8, measured 6). Artifact: `w1/R94Exec3-wordcounts.json`. The source-line citations in the lesson (645-648, 1806-1809, 18, 30) match the staged bytes. Those ranges were printed at run time.

## 5. Append-only check, d7744d04..master

Command: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --numstat d7744d04 master | awk '$2!=0'` → rc 0, no output.
Result: 39 files changed, 0 deleted lines in every file. Artifact: `w1/R94Exec3-deleted-lines.txt` (0 lines). Full numstat was printed; all deletion columns are 0.

Caveat: this check is numstat-only. It does not replace the byte-prefix gate, which the r93 lesson already notes does not model mid-file table inserts.

## Processes

No chromium launched by this seat. `pgrep -fa remote-debugging-port` shows port 19559 owned by seat R94Exec2 (`/fast/scratch/hyaku/tabi-r94/R94Exec2/run3/...`). Not touched.

## Tooling

No installs or upgrades. Only node (existing), git, awk, wc, sha256sum-free checks. No pacman, no sudo.

## Blocked / missing

- Round-94 LOG entry absent at master, so `check-log-section-claims-round93 --rounds 94` returns setup, rc 2. Re-run needed after the records commit.
- Knowledge note untracked; census `ok` holds only with it committed.

## Verdict on C1

These gates do not test the C1 chromium capability. The C1 evidence (`.ufo/waves/round-94/scored/c1-live.json`, nonce tabi-r94-live-240f4c5100c3) was not re-counted by this seat. Nothing here falsifies the frozen wording or any count.

VERDICT C1: neutral
