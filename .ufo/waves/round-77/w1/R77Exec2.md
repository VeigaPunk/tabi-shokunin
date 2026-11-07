HOLDS

Post-freeze repetition: 3 fresh cold runs, 3 counters and 3 batteries all clean; per-check counter red rate 0/16 and per-case battery failure rate 0/5376 over my 3 plus the 13 pre-freeze outputs; honest-pair replay margins 39/40 (abs) and 6/9 (gap); counter timing floors met with wide headroom. No tool installs, no git mutations, no writes outside my seat dir, my w1 report paths and my scratch.

Seat R77Exec2, Tabi round 77 wave w1, lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Godspeed axes named: (1) post-freeze repetition red rate, (2) honest-pair replay margin, (3) counter timing floors. All claims below carry a command exit or a path.

## Preconditions checked
- Disk guard: `/home/vgpnk/Projects/shokunin/scripts/hyaku/disk-guard.sh status` exit 0; /fast/scratch/hyaku 48% used, 419.8G free.
- Pins byte-verified: `sha256sum scripts/chrome-cdp-filechooser-round77.mjs scripts/check-filechooser-r77.mjs` = 9954db0703e03aed157c4be9b13f678b1bc1a6240b4bf88491d0e1f5286558a6 and ac17ff8dda4661e2e6217831158de5e1e19a584f3f7dad918b77faee6bab4aeb (exit 0); battery negatives-filechooser-r77.mjs = 3925fe2a5f772123fd9d707c52829088ab7dcaec8d9aad70265c2528eef103ff.
- `/usr/bin/chromium --version` = Chromium 155.0.8059.84; `node --version` = v24.21.0.
- All three scripts copied to `/fast/scratch/hyaku/tabi-r77/R77Exec2/run/` and re-hashed identical (exit 0), so the pinned driver sat beside the counter for every counter/battery invocation (counter fixture-hash check reads the driver beside itself; check-filechooser-r77.mjs:170-180).
- Tool installs: none. Pacman: untouched. Git/jj: no mutations (nothing beyond read-only stat above).

## Leg 1 — three cold driver runs (all fresh this session, own ports, own scratch)
- d1: `node run/chrome-cdp-filechooser-round77.mjs --scratch .../R77Exec2/d1 --out .../round-77-seats/R77Exec2/d1.receipt.json --nonce tabi-r77-exec2-1-eeee48d0 --http-port 27901 --cdp-port 27911` exit 0, wall 11.8 s.
- d2: same shape, nonce tabi-r77-exec2-2-a915785d, ports 27902/27912, exit 0, wall 12.1 s.
- d3: same shape, nonce tabi-r77-exec2-3-33f2011f, ports 27903/27913, exit 0, wall 12.1 s.
- Receipts (JSON, seat dir only): `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-77-seats/R77Exec2/d1.receipt.json`, `d2.receipt.json`, `d3.receipt.json` — each 79 events, 15 legs, predicate true, teardown sweep clean (driver stdout, exit 0).

## Leg 2 — counters, exit 0 clean x3
Command shape per run: `node run/check-filechooser-r77.mjs --lane <lane> --receipt <dN.receipt.json> --expect-driver-sha256 9954db…8a6 --expect-nonce <its nonce> --prior-set .ufo/waves/round-77/controls/c1/prior-set.txt --prior corpus/evidence/round77/chromium-file-chooser/receipt.json --prior <other two of mine> --prior .ufo/waves/round-77-seats/R77Exec1/receipt.json --json`.
- d1.counter.json, d2.counter.json, d3.counter.json (seat dir): exit 0, verdict clean, checkCount 183, findings [] each. Exec1's receipt existed when my counters ran (mtime 11:58) and was included as a prior in all three counters and batteries.
- Outputs: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-77-seats/R77Exec2/d{1,2,3}.counter.json`.

## Leg 3 — batteries, exit 0 allOk x3
Same arguments plus `--work .../R77Exec2/w{N}` and the three required `--laundered` degenerates (page-stub, eval-trigger, swap-files), `--jobs 6`, `--json`.
- d1.battery.json, d2.battery.json, d3.battery.json: exit 0, allOk true, passed 336/336, stoppedEarly false, 3 laundered cases read, coverageGap []. Walls 19.5 s / 28.7 s / 40.3 s.
- Outputs: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-77-seats/R77Exec2/d{1,2,3}.battery.json`.

## Tabulation over 16 counter + 16 battery outputs
Inputs: my 3 (seat dir) plus 13 pre-freeze `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-77/controls/c1/pf/pf-*.counter.json` / `.battery.json` (pf-p1..p4, pf-smoke1..9).
- Per-check counter red rate: all 16 verdicts clean, 0 findings total → every one of the 183 declared check ids is red 0/16. (Derivation: `findings` arrays of the 16 counter JSONs, python3 json.load, session log.)
- Per-case battery failure rate: 0 failed case-runs of 5376 total (16 x 336); per-case failure rate 0 for all 336 cases; allOk true and coverageGap [] in all 16 batteries.
- Observation (not a defect): `isolatedCases` = 154 in my three batteries vs 153 in the 13 pre-freeze ones — consistent with my counters/batteries carrying 4 extra --prior receipts (L1, Exec1, sibling d receipts); one additional case isolates. No case failed.

## Honest ordered pairs from the `limit` blocks (need 40 abs / 9 gap per 79-event, 11-gap prior)
255 honest ordered pairs (counted receipt x prior, both honest; the 3 degenerate priors excluded) across the 16 counters:
- max absMatched = 1 (absNeed 40): counted d1 vs prior controls/c1/smoke3.receipt.json — margin 39.
- max gapMatched = 3 (gapNeed 9): counted d2 vs prior controls/c1/smoke9.receipt.json — margin 6.
- `refused` false on all 255 pairs.
- vs the L1 receipt as prior (3 pairs, my d1/d2/d3): absMatched 0 (margin 40), gapMatched 0 (margin 9).
- vs the R77Exec1 receipt as prior (3 pairs): absMatched 0 (margin 40), gapMatched 0 (margin 9).
- among my own d1/d2/d3 (6 ordered pairs): max absMatched 0, max gapMatched 1 (margin 8).

## Timing minima vs counter floors (6000 ms run window, 290 ms leg)
From startedAt/finishedAt and legs[].elapsedMs of the 16 receipts:
- MIN run-window over 16 receipts: 8940 ms (pf-p4) — floor 6000, cap 600000. Mine: 9620 / 9702 / 9717 ms.
- MIN leg elapsedMs over 16 receipts: 300 ms — floor 290 (legMax ~1.8 s = the 1.5 s open waits). Mine: 301 / 301 / 302 ms min.

## Verdict and calibration
HOLDS on the milestone axes: post-freeze repetition red rate is exactly zero (0/16 counters red on any check; 0/5376 battery case-runs failed), and the honest-pair replay margin is wide (worst abs 1 of 40 needed, worst gap 3 of 9 needed; zero matches against the L1 and Exec1 priors). The thinnest observed margin remains the gap axis (6) and it is on the prior with the largest gap count (11), i.e. the rule's intended hardest case; no honest pair came anywhere near refusal.

## Artifacts and cleanup
- Seat JSONs (receipts, counters, batteries): `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-77-seats/R77Exec2/` (9 files, listed above).
- This report: `.ufo/waves/round-77/w1/R77Exec2/report.md` and the trailer copy `.ufo/waves/round-77/w1/R77Exec2.md`.
- Scratch `/fast/scratch/hyaku/tabi-r77/R77Exec2/` removed at close (cited artifacts were already copied into the seat dir).
- Risks: none observed. Blockers: none. No delegations used (zero labrats spawned).
