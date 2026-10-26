# ScoutMisroot — misroot sweep (tabi round 32, w2, hygiene)

Verdict: no misroot found. `git -C /home/vgpnk/Projects/shokunin status --porcelain` shows 3 entries: the excluded `.scratch/goal-20261026-hyaku-run9.md` (modified), and two untracked files, `k2.tsv` and `k2s.tsv`. Neither names tabi, round 32 or any round-32 seat (grep exit 1). They are 3-row and 1-row sha256/size tables of generic fixture paths (`a/run.sh`, `space name.txt`, `var/lib/data.bin`), created at 14:04:11, and belong to some other work. Report only; nothing was moved or deleted. No chromedriver or chromium process exists, so none names tabi-r32. Some Node processes still run from tabi-r32 scratch (listed below). The scratch tree holds 10 leftover seat dirs, about 1.4 GB in total. All are owned by user vgpnk. Their seat names come from the dir names; the seats were running at the time of the sweep, so these are live work areas rather than orphans, except where noted.

## Commands and results
1. `git -C /home/vgpnk/Projects/shokunin status --porcelain` → exit 0, 3 lines:
   - ` M .scratch/goal-20261026-hyaku-run9.md` (excluded, orchestrator-owned)
   - `?? k2.tsv` (248 B, 3 lines, mtime 2026-10-26 14:04:11 -0300)
   - `?? k2s.tsv` (40 B, 1 line, same mtime)
   - `.ufo/state/` has no entries.
2. `grep -n -i -E 'tabi|round-32|r32|Crit[A-Z]|Scout|Mut[A-Z]|Rev[A-Z]' k2.tsv k2s.tsv` → no match. A second `grep -rIl -i -E 'tabi-r32|round-32|tabi.*round 32'` → exit 1 (no match).
3. `git status --porcelain --ignored -uall`, with `.scratch/`, `.ufo/state/` and node_modules filtered out, shows only the two `??` files plus ignored `.jj/` internals (output cut by `head`, exit 141 is the SIGPIPE from `head`). No tabi-named ignored file at the fleet root was seen in the visible portion. [INFERENCE: the ignored list was truncated, so this is not exhaustive.]
4. `ls -la /fast/scratch/hyaku/tabi-r32/` and `du -sh`, `ls -ld --time-style=full-iso`.

| dir under /fast/scratch/hyaku/tabi-r32/ | size | owner (user) | owner seat (from dir name) | last mtime |
|---|---|---|---|---|
| CritC1Claim | 188M | vgpnk | CritC1Claim | 14:14:17 |
| CritC2Claim | 187M | vgpnk | CritC2Claim | 14:14:47 |
| CritEntry | 104K | vgpnk | CritEntry | 13:13:50 |
| CritNewNumbers | 187M | vgpnk | CritNewNumbers | 14:14:27 |
| CritNoHarm | 187M | vgpnk | CritNoHarm | 14:14:53 |
| CritReadmeLog | 0 (empty) | vgpnk | CritReadmeLog | 14:14:06 |
| CritSkillSection | 187M | vgpnk | CritSkillSection | 14:14:17 |
| L1 | 165M | vgpnk | L1 (orchestrator) | 13:46:57 |
| RerunNoHarm | 353M | vgpnk | RerunNoHarm | 14:05:34 |
| SentinelReceipts | 0 at first sweep, later `files.txt` 29650 B | vgpnk | SentinelReceipts (no matching roster seat seen) | 14:14:56 |

All times are 2026-10-26, -0300. The tree was still changing while I swept, with new content appearing in SentinelReceipts, so these figures are a snapshot.

5. `pgrep -fa 'chromedriver|chromium'` → only `1371 /usr/bin/earlyoom ... --prefer (^|/)(java|node|chromium|python3?)$` (the earlyoom daemon, not a browser; its argv does not name tabi-r32). A second count excluding earlyoom returned 0. No live chromedriver/chromium process.
6. `pgrep -fa 'tabi-r32'` → 3 Node processes, none a browser:
   - pid 624714: `node /fast/scratch/hyaku/tabi-r32/CritC2Claim/clone/scripts/check-user-round-contract.mjs --self-test`
   - pid 777904: node `.../tabi-r32/RerunNoHarm/tmp/tabi-gate-mutants-GXDyCY/mutant-12/check-s106-evidence.mjs --selftest --js`
   - pid 779394: node `.../tabi-r32/CritC2Claim/clone/scripts/check-user-round-contract.mjs --repo /var/tmp/tabi-user-round-co...` (argv truncated at 200 characters)
7. Extra: `/var/tmp/tabi-user-round-contract-11rxXF` exists (the `--repo` target of pid 779394; owner seat is probably CritC2Claim [INFERENCE]). It sits outside the allowed scratch location (the contract allows /tmp only for files under 50 MB). Size not measured.

## Notes for the L1
- Owners should rm their own scratch dir at yield. At sweep time the larger ones (CritC1Claim, CritC2Claim, CritNewNumbers, CritNoHarm, CritSkillSection, RerunNoHarm, L1) each hold a full clone, and the seats were still active. CritReadmeLog and SentinelReceipts are empty or near-empty.
- `k2.tsv` and `k2s.tsv` at the fleet root are not tabi-r32 content. Whether to quarantine them is the L1's call.
- I wrote only this report and created the output dir `.ufo/waves/round-32/w2/ScoutMisroot/` (empty). I used scratch only under /tmp (`/tmp/scoutmisroot-status.txt`, a copy of the porcelain output), which I did not delete; it is 3 lines, well under 50 MB. No browsers, no network fetches, no tool installs.
