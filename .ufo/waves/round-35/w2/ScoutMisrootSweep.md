# ScoutMisrootSweep — misroot and scratch hygiene sweep (read-only)

**Verdict: holds. No defect found** (no misrooted fleet-root file, no stray w1 dirs, no w1 seat scratch left, no file >1 MiB in the round-35 wave tree). Two non-defect observations are listed under "Observations". Nothing was deleted or edited; the only things written are this report, an empty output dir, and two scratch files of my own that I removed.

## 1. Fleet-root untracked files naming tabi round 35 / a w1-w2 seat — none
- `git -C /home/vgpnk/Projects/shokunin status --porcelain` printed nothing (exit 0). `--untracked-files=all | wc -l` = 0. The fleet root has zero untracked files, so no misrooted seat file exists there.
- `status --porcelain --ignored` at fleet root lists only ignored dirs: `.jj/ .tower/ .ufo/state/* .ufo/watchdog.log`, `.ufo/waves/shokunin-train-*/x{connector,sentinel}-scratch/`, and the lane checkouts (`*-shokunin/`). No ignored file matches `tabi|r35|round-35` except `.ufo/state/tabi.{mission,out,report-baseline,round}` (the first, second and fourth are dated 2026-10-15 and are 8, 22 and 2 bytes; `report-baseline` is 68 bytes, dated 2026-10-26 17:44). `grep -c 'round.?35|r35'` on each = 0, so none of them names round 35.
- Top-level fleet files that are ignored/untracked-adjacent: `.scratch/goal-20261026-hyaku-run9.md`, `.ufo-scratch/`, `ok`. The first has 0 matches for `round[- ]?35|tabi-r35`; its only hit for the looser `Tabi.*R35` is line 121, a tabi history row listing rounds r32–r41 (an orchestrator goal file, mtime 18:38, not seat output).
- `MANIFEST.json` matches `round 35`-ish text only in historical rows (rounds 13-17 digests); it is tracked and clean.
- Lane checkout `git -C tabi-shokunin status --porcelain`: only the 5 harness `w2-dispatch.json/w2-spec.json/w2-validate.stderr/w2.ready/w2.ready.dispatched` entries are untracked (+ this report once written). Nothing stray outside `.ufo/waves/round-35/w2`.
- `/tmp` contains nothing named tabi/bidi/geckodriver/firefox. `find / -xdev -type d -name 'tabi-r35*'` finds only `/fast/scratch/hyaku/tabi-r35`. `pgrep -f 'geckodriver|firefox'` printed nothing: no leaked browser/driver processes.

## 2. `.ufo/waves/round-35/w1/*` entries that are not seat names in w1-dispatch.json
- `jq -r '.registry.members|keys[]' w1-dispatch.json` → 51 seats. `ls -A w1` = 103 entries = 51 `<Seat>/` dirs + 51 `<Seat>.md` + `swarm-registry.json`.
- Dirs not in dispatch: **none** (only `swarm-registry.json`, a registry file named by the dispatch's `registry.path`, not a seat dir). Reports `*.md` not in dispatch: none. Dispatch seats lacking a dir: none.

## 3. `/fast/scratch/hyaku/tabi-r35/` leftovers per seat
- 21 entries: `ConnMissedBoundaries CritCalibrationClaims CritEntryClaims CritNoHarm CritRowKagiA CritRowKagiB CritScreenKaidokuA CritScreenKaidokuB CritScreenKake CritScreenKotobaMixed CritScreenKumitate CritScreenMadoTsukuroi CritScreenThirdNoClaim L1 ReopenS134S135 ReopenS136S137 ReopenS138S139 ReopenS140S141 RevLessonMistakes RevQuality98to100 SentinelDriverEgress`.
- **w1 seats with a leftover tree: none** (`comm -12` of the 51 w1 dispatch names against the scratch listing is empty). So no w1 seat left its tree.
- 20 of 21 entries are w2 dispatch seat names (`w2-dispatch.json`, 34 members); they are the live w2 seats, still running at sweep time (dir mtimes 2026-10-26 18:40, i.e. seconds before this sweep). They are not leftovers yet; sizes at sweep time: ~227 MiB each for the 9 with a `clone/` (ConnMissedBoundaries, CritCalibrationClaims, CritEntryClaims, CritRowKagiA, CritRowKagiB, CritScreenKake, CritScreenKumitate, CritScreenThirdNoClaim, SentinelDriverEgress), 0 B for CritNoHarm/CritScreenMadoTsukuroi/RevLessonMistakes/RevQuality98to100, small (<1 MiB) for the Reopen*/CritScreenKaidoku*/CritScreenKotobaMixed seats.
- `L1` (544 MiB, last touched 18:36:49, entries `cands.tsv ctl dl feas.mjs int pre smoke tmp tmp.lpvRljHQnn`) is the integrator's (TabiR35) own scratch, not a w1/w2 seat; it is not a seat defect. It is still live and outranks the other trees in size; the L1 should remove it at closure.
- Other dirs under `/fast/scratch/hyaku/` (`kaidoku-r*`, `kama-r47`, `mado-r47`, `kasegi-r40`, `tameshi-r48/50`, ...) belong to other lanes; not in scope.

## 4. Files >1 MiB under `.ufo/waves/round-35`
- `find … -type f -size +1048576c` → no output, exit 0. 827 files, 8.5 MiB total. Largest: `w1/ScribeSrcMozRelease/fetches/SHA256SUMS` 551210 B, `w1-results.json` 276251 B, `w1/CritC1Counter/bg-blindspots-full.json` 221852 B.

## Observations (non-defect)
- My own scratch helper files `/fast/scratch/hyaku/.w1seats.<pid>` and `.w2.<pid>` (two small temp lists) were created by this sweep; I removed both (`ls -A /fast/scratch/hyaku | grep '^\.w'` empty afterwards). `/tmp/w1seats.*`, `/tmp/w1dirs.*`, `/tmp/scr.*` were also removed.
- The sweep is a snapshot at ~18:40-18:42 on 2026-10-26: w2 seats were mid-run, so re-run item 3 after w2 closes; any w2 seat tree still present then is that seat's own defect.

## Commands and exit codes (all read-only)
- `git -C /home/vgpnk/Projects/shokunin status --porcelain` → empty, exit 0; `--ignored` and `--untracked-files=all | wc -l` → 0, exit 0.
- `jq -r '.registry.members|keys[]' w1-dispatch.json | sort` + `comm` against `ls -A w1`, `ls -A /fast/scratch/hyaku/tabi-r35` → as above, exit 0.
- `find …/round-35 -type f -size +1048576c` → empty, exit 0.
- `pgrep -f 'geckodriver|firefox'` → no matches.

## Deliverable
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/ScoutMisrootSweep.md (this file); output dir `.ufo/waves/round-35/w2/ScoutMisrootSweep/` created, empty (no receipts needed).
