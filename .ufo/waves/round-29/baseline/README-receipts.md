# Baseline receipt provenance (round 29; added after wave-1 CritProcedure F1/F4-F7)

- Lane at capture: master 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb (claims commit 97be89bc).
- `chromiumdash-stable-linux.json`: `curl -s 'https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3'` at 2026-10-26T04:12:21Z (`num=3` matters: num=2 / no num give other bytes).
- `census-start.txt`: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` run in the lane at 856fa9e before any round-29 edit; reproducible only at that tree (later rows add W04 lines).
- `c2-before-frozen-counter-cleanbase.json.txt` (mismatches=6): frozen counter copied OUTSIDE a clean `git clone --shared` of 856fa9e and run as `node <copy> --repo <clone> --rev 856fa9e --json`, so SCORECARD.md:1439's gate is the baseline working copy and measurable (observed 20). Running the frozen counter in-tree at 97be89b with `--rev 856fa9e` instead gives mismatches=5 (SCORECARD.md:1439 could-not-evaluate: script at rev is not the runnable working copy). Both readings are > 0; the target (0) is unaffected.
- `selfassessment-rev-oldcounter.json.txt`: captured in the dirty lane tree (includes one m3-unlanded-paths finding); context only, not a control. Clean 856fa9e with the old counter gives 6.
- `c2-control-crossdoc-*`: scratch commit 8404d205 (not in the lane) = 856fa9e + the two committed tails (`c2-control-crossdoc-*-tail.md`); counts reproduce, JSON `rev` differs on rebuild.
- `c2-red-before-selftest.txt`: frozen counter's CASES with the old two-argument `citesLine` (never committed as a blob); exit was 3 (`process.exit(out.ok ? 0 : 3)`), not recorded in the file.
- `c1-control-case-deletion.*` and s106 self-test receipts: fixture commit hashes in `refusal=` lines vary per run (unpinned fixture dates); only verdict/cases/ids lines are stable.
