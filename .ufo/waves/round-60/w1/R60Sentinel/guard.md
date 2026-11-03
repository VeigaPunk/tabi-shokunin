# Guard audit: R60Sentinel (tabi round 60, wave w1)

Read-only audit. No counter was run. Nothing was deleted, moved or staged. Two reads: first at about 19:06 to 19:08 (-03), final re-read 19:15 (-03). Scratch dir `/fast/scratch/hyaku/tabi-r60/R60Sentinel` was created and stayed empty.

## (1) Write scope: fleet root porcelain. FLAG (report only)

Fleet root, first read (about 19:07): 5 entries, none mentioning round-60 or tabi:
- ` M .scratch/goal-20261103-hyaku-run15.md`
- ` M .scratch/run15-state.json`
- `?? .scratch/run13-state.json`
- `?? .scratch/run15-kernel.py`
- `?? .ufo/reports/round-31/kagi.md`

Fleet root, final read (19:15): the same four `.scratch/` entries. `.ufo/reports/round-31/kagi.md` is no longer listed. I did not see what removed it. None of the paths is a round-60 or tabi path, so no round-60 seat wrote into the fleet root.

## (2) Sibling lanes (20 roster heads, read-only). FLAG (report only)

All 20 roster lanes exist. Status is per `git --no-optional-locks -C <lane> status --porcelain`.

- First read: 14 clean. Dirty: kagi-shokunin 4, kake-shokunin 18, kasegi-shokunin 8, kengaku-shokunin 7, souji-shokunin 5, tsukuroi-shokunin 13.
- Final read: 15 clean. Dirty: kagi-shokunin 4, kake-shokunin 2, kasegi-shokunin 3, kengaku-shokunin 17, tsukuroi-shokunin 2. souji-shokunin is now clean.

The counts changed between the two reads, so sibling lanes are actively being written. None of this is round-60 output. Not ours; not touched.

## (3) Secret-shape scan (counts and paths only; no matched values printed). PASS, with note

Scanned: `.ufo/waves/round-60/` (whole tree, rescanned after the counters and fixtures landed) and `corpus/evidence/round59/`.

| pattern | round-60 files | corpus/evidence/round59 files |
|---|---|---|
| PRIVATE KEY header | 0 | 0 |
| AKIA[0-9A-Z]{16} | 0 | 0 |
| ghp_[A-Za-z0-9]{20,} | 0 | 0 |
| `password=` | 3 | 0 |
| `token=` | 4 | 0 |

The `password=`/`token=` hits are the literal key-name strings in `w1-dispatch.json`, `w1-plan.json`, `w1-spec.json` and `counters/chromium-receipt-r60.mjs` (the `token=` hit is in the counter). Zero files have a value of 12 or more characters following either string. Note: the item asked for `grep -l`, so the shell grep was used here for file lists only, not for edits.

## (4) Hardcoded `/tmp` in round-60 `.mjs`/`.py`. PASS

READY lines came in before this check ran, from both R60Exec1 and R60Exec2:
- R60Exec1: `counters/c1-wide-screen-r60.mjs` sha256 `ba7ebc9a…5920`, selftest 17/17. Matches on disk.
- R60Exec2: first READY (`5465be1f…`, 99/99) was superseded by a final READY `counters/chromium-receipt-r60.mjs` sha256 `99844dd9…03e8`, selftest 102/102. Matches on disk and in a re-stat at 19:14 (150417 bytes, 2521 lines).

Files scanned (6): `counters/c1-wide-screen-r60.mjs`, `counters/chromium-receipt-r60.mjs`, `counters/chromium-receipt-r60-fixtures/driver-stub.mjs`, `counters/chromium-receipt-r60-fixtures/live/chrome-cdp-loopback-round59.mjs`, `measure/f-probes-r60.py`, `w1/R60MutC2/mutate.py`.

`grep -n '/tmp'` hits: 1, `counters/c1-wide-screen-r60.mjs:616`. It is a comment ("fixtures live only under TMPDIR (never /tmp)"), not a hardcoded path.

## (5) S161 and S163 receipts. PASS

Receipts landed at 19:10 in `.ufo/waves/round-60/sources/`: `s161-reopen-receipt.json` and `s163-fetch-receipt.json`.

- S161: cited host `www.w3.org`; finalHost `www.w3.org`; numRedirects 0; httpStatus 200; sha256 `8ded5eaf…b918`. Recomputed on `sources/uievents.html`: matches. Longest quote 15 words.
- S163: cited host `dom.spec.whatwg.org`; finalHost `dom.spec.whatwg.org`; numRedirects 0; httpStatus 200; sha256 `9b797e18…2153`. Recomputed on `sources/dom.html`: matches. Longest quote 24 words.

Observation, not a guard failure: at my scan, `corpus/SOURCES.md` had no S163 row. S161 is registered there (line 175).

## (6) Pacman. PASS

`/var/log/pacman.log` last line: `2026-11-02T15:32:29-0300`. No line is dated 2026-11-03, the round date. No pacman log lines were added during the round.

## Other

- `disk-guard.sh` was not found on PATH or under the fleet or lane `scripts/`. No heavy pass was run.
- No tools were installed or updated by this seat.
