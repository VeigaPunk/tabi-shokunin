# Round 30 — baseline and control receipts (frozen before claim data)

Scratch: a `git clone --shared` of the lane at baseline `f7c0317e4f8445502005e79e3d65767430912dab`
plus the three frozen files (`scripts/check-gate-mutants.mjs`, `scripts/gate-mutants.json`,
`scripts/check-frontier-admission.mjs`; digests in `frozen-counter-sha256.txt`) committed in
scratch only (identity `l1-scratch`, never in the lane). Each control is one scratch commit on top;
its diff is committed here. Counters run as `--rev <scratch commit> --repo <scratch>` with TMPDIR
under `/fast/scratch/hyaku/tabi-r30/L1/`.

| File | What it is | Reading |
|---|---|---|
| `c1-counter-selftest.txt` | `check-gate-mutants.mjs --selftest` | clean 12/12 |
| `c1-control-J1-do-nothing.json` | C1 counter at baseline + counters | fault_survivors 14, benign_killed 0, exit 1 |
| `c1-control-J2-length-fingerprint.{diff,json}` | junk: both self-tests assert their own file length | fault_survivors 0, benign_killed 13, exit 1 |
| `c1-control-J3-site-grep.{diff,json}` | junk: s106 self-test greps its own check lines | fault_survivors 9, benign_killed 3, exit 1 |
| `c1-control-J4-literal.{diff,txt}` | junk: s106 self-test blacklists a catalogued replacement | exit 2, mutant-aware literal |
| `c2-counter-selftest.txt` | `check-frontier-admission.mjs --selftest` | clean 24/24 |
| `c2-control-J1-do-nothing.json` | C2 counter at baseline + counters | population 0, admitted 0, exit 1 |
| `c2-control-J2-package-as-is.*` | junk: package entries + staged rows S159/S182 unchanged | admitted 0 (r4-opened) |
| `c2-control-J3-date-bump.*` | junk: rows' opened bumped, no receipts | admitted 0 (g1-receipt) |
| `c2-control-J4-selfquote-{offline,live}.json` | junk: receipts whose bytes are the entry's own text | offline admitted 2 (gameable); `--live` admitted 0 (l3-live-bytes) |
| `census-start.txt` | `sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` at round start | exit 0, `tabi ok` |

The C2 junk controls J1–J4 were re-run with the frozen admission counter bytes (sha256
`cadef57e…9eca`) after an earlier scratch run used a pre-`--live` revision of the same counter;
the committed JSON files are the frozen-counter readings.
