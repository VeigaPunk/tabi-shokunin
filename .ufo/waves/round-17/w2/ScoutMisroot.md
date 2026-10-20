VERDICT: ISSUES

Attacked: the wave-2 misroot question at lane tip M=`6c97851034e9d8f58b135d28ff969f1f28fa2f7d` — (a) untracked fleet-root files whose content names tabi round 17 / a TabiR17 seat, (b) `/tmp/tabi-r17*` directories older than 30 min. Read-only; nothing moved or deleted.

## Method and command evidence

`git -C /home/vgpnk/Projects/shokunin status --porcelain -uall` at `2026-10-20T14:10:27-03:00` returns exactly:

```
 M .ufo/watchdog.log
?? .ufo/state/kaidoku.report-baseline
?? .ufo/state/kake.report-baseline
?? .ufo/state/kama.report-baseline
?? .ufo/state/mado.report-baseline
?? .ufo/state/mori.report-baseline
?? .ufo/state/souji.report-baseline
?? .ufo/state/tabi.report-baseline
?? .ufo/state/tameshi.report-baseline
?? .ufo/state/tsukuroi.report-baseline
?? .ufo/waves/round-19/drafts/QualityDraft.md
?? .ufo/waves/round-19/w1/reports/QualityDraft.md
```

`grep -ril 'tabi' .ufo/waves/round-19 .ufo/state/*.report-baseline` (fleet root): **no matches**. No untracked fleet-root file's *content* contains the string `tabi`, hence none names a TabiR17 seat.

## Findings

1. **Tabi-specific misroot: none detected in the fleet-root untracked set.** The only fleet-root untracked file whose *path* names tabi and whose *content* carries round 17 is `.ufo/state/tabi.report-baseline`: content `17 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (sha256 of the empty string), mtime `12:32:03`. `.ufo/watchdog.log:492` logs `2026-10-20T12:32:05-03:00 launch tabi round=17 pgid=2167868 driver=hyaku-inline attempt=1`, 2 s later. Attribution: fleet-launcher baseline state, not a seat-written Report. [INFERENCE: writer is the launcher, not a TabiR17 seat — no seat identifier in the file.]
2. **Two untracked files are misroots, but of another lane.** `.ufo/waves/round-19/drafts/QualityDraft.md` and `.ufo/waves/round-19/w1/reports/QualityDraft.md` are mado round-19 scribe products sitting at the fleet root instead of under `mado-shokunin/.ufo/waves/round-19/`. They cite `.ufo/waves/round-17/measure.py` (`round-19/drafts/QualityDraft.md:12`, `round-19/w1/reports/QualityDraft.md:30`), which is mado's own round-17 tool; neither mentions tabi. Same failure class as the assignment hunts, wrong lane — flagged for its owner, untouched.
3. **Fleet status cannot see the lane trees at all.** `.gitignore:1` is `*-shokunin/`; `git status --porcelain --ignored` reports `!! tabi-shokunin/`. A tabi r17 report written into a sibling lane (e.g. `kaidoku-shokunin/.ufo/waves/round-17/w2/...`) is invisible to the requested command; this sweep proves only that no tabi r17 content landed at the *fleet root*. Fleet-root `.ufo/waves/round-17/` is an empty two-level scaffold (`.ufo/waves/round-17/w1`, 0 files, mtimes 12:26–12:27), so no fleet-level tabi r17 wave-2 files exist to inspect.
4. **/tmp: 21 `tabi-r17*` dirs older than 30 min** (mtime ≤ `13:40:27`; 50 newer dirs are live wave-2 sandboxes, excluded). All owned by `vgpnk`; none contains a browser profile, but one clone carries a local probe commit (`ConnProvinceRuling-w2wQ/repo` @ `cad98d5` "probe: province append"). "Cited" = the exact path (or an `invoke-errcases-*` family glob) is named in a wave-1 report under `.ufo/waves/round-17/w1/`.

| # | dir (mtime) | inferred owner | basis | cited? |
|---|---|---|---|---|
| 1 | `tabi-r17-ConnProvinceRuling-w2wQ` (12:47) | ConnProvinceRuling | dir name; clone @cad98d5 commit "probe: province append" | no |
| 2 | `tabi-r17-invoke-errcases-cz7fe6` (12:48) | C2ProbeErrorPaths | `w1/C2ProbeErrorPaths.md:124` names `/tmp/tabi-r17-invoke-errcases-*/` | family |
| 3 | `tabi-r17-invoke-errcases-hPLXky` (12:49, empty) | C2ProbeErrorPaths | same | family |
| 4 | `tabi-r17-invoke-errcases-run2` (12:49) | C2ProbeErrorPaths | same | family |
| 5 | `tabi-r17-invoke-errcases-qBsZLx` (12:49, empty) | C2ProbeErrorPaths | same | family |
| 6 | `tabi-r17-invoke-errcases-run3` (12:49) | C2ProbeErrorPaths | same | family |
| 7 | `tabi-r17-prov` (12:49) | DraftProvince [INFERENCE, med] | contains `province-append.txt` + `skill-append.txt` drafts; no exact cite in `w1/DraftProvince.md` | no |
| 8 | `tabi-r17-c3probe-L76m` (12:49) | C3 lane, unresolved [INFERENCE, low] | bare baseline clone (`S` @5859243), no script; could be C3Checker/C3Counter/RevPlanC3 early clone | no |
| 9 | `tabi-r17-invoke-errcases-oeSl1C` (12:50, empty) | C2ProbeErrorPaths | family cite | family |
| 10 | `tabi-r17-invoke-errcases-final` (12:50) | C2ProbeErrorPaths | family cite | family |
| 11 | `tabi-r17-c3proof-zAy9` (12:51) | C3Counter [INFERENCE, med-high] | clone commits "two passing rows only", "variant crlf", "variant lines"; `c3branches.sh:2` "probe self-test for measure-c3.mjs" points at `S=/tmp/tabi-r17-c3proof-zAy9/S`; `w1/C3Counter.md:46,94,104-110` owns the measure-c3 probes | no |
| 12 | `tabi-r17-SentinelAnchor-probe` (12:54) | SentinelAnchor | `w1/SentinelAnchor.md:9` names `/tmp/tabi-r17-SentinelAnchor-probe/{c3probe,c3checker}.sh` | yes |
| 13 | `tabi-r17-CriticC1-3pM2` (12:54) | CriticC1 | dir name; `mutant-user.mjs`, `mutant-partial2.mjs` | no |
| 14 | `tabi-r17-c2-frames` (12:55) | C2ProbeFrames | `w1/C2ProbeFrames.md:10,141` names the exact path | yes |
| 15 | `tabi-r17-c3probe` (12:56) | RevPlanC3 | `w1/RevPlanC3.md:5,66` names the path and its contents | yes |
| 16 | `tabi-r17-c3fake-Hi24` (13:02) | C3Counter [INFERENCE, high] | `c3fake.sh:2` "Fake-fleet harness for measure-c3.mjs guards + probes"; dirs are its `mktemp` outputs | no |
| 17 | `tabi-r17-c3fake-sQba` (13:03) | C3Counter | same | no |
| 18 | `tabi-r17-c3fake-wsUL` (13:03) | C3Counter | same | no |
| 19 | `tabi-r17-c3fake-Y2yG` (13:03) | C3Counter | same | no |
| 20 | `tabi-r17-c3fake-sNxR` (13:03) | C3Counter | same | no |
| 21 | `tabi-r17-invoke-probe` (13:03) | C2 lane, unresolved [INFERENCE, low] | `probe.mjs`/`probe2.mjs`/`iframetest`/`targettest`; no wave-1 report names the path | no |

Counts: 3 exactly cited, 7 covered by a family glob (`invoke-errcases-*`), **11 uncited leftovers** (#1, 7, 8, 11, 13, 16–21). Newer wave-2 dirs (`tabi-r17w2-*`, `tabi-r17-c1-*`, `tabi-r17-c3-*`, `tabi-r17-meas`, `L1adj`, `L1harm`) are ≤30 min old and excluded.

## Repair (not performed: report-only seat)

- The 11 uncited dirs violate the sandbox-retention rule (remove after use unless a cited failure needs the tree) and should be deleted by their owners; the cited ones (#12, 14, 15 and the errcases family) may stay only while their reports use them.
- `.ufo/state/tabi.report-baseline` keeps the fleet worktree permanently dirty; the launcher should commit it or add `.ufo/state/*.report-baseline` to `.gitignore` — not a seat's call.
- `mado-shokunin` should move its two round-19 drafts out of the fleet root; the live `?? .ufo/waves/round-19/` directory is direct evidence of the same relative-path misroot this contract warns about.
- Any future "no misroot" claim must scope itself: fleet `git status` is blind to every `*-shokunin/` tree (`.gitignore:1`), so lane-local status is required to cover sibling-lane misroots.

Files written: `.ufo/waves/round-17/w2/ScoutMisroot.md`.
