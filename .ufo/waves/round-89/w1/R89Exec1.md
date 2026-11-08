# R89Exec1 — C1 cold-run reproduction (chromium-showpicker-linux r89)

Seat: R89Exec1. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `5a901163`, freeze D `7bde5e6c2f2d`. Scored receipt `corpus/evidence/round89/chromium-showpicker/receipt.json` (driver sha256 `76b69b4f691d24c8c94a92897e33635d2386b9191f5aaa66640515dc998bd2d0`, nonce `tabi-r89-l1-7bde5e6c2f2d`, fixture sha256 `69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed`, ports 19960/19961/19962, 41 legs, 0 failures, finished 2026-11-08T12:43:31.853Z, wall 225.017 s). Scratch `/fast/scratch/hyaku/tabi-r89/R89Exec1/` removed before yield. Never wrote into `corpus/evidence/round89` or `.ufo/waves/round-89/scored`. No commits/pushes; no mutating git (none needed). Skill: godspeed (name axes, parallel, keep non-regressing moves; no clarifying questions).

Tooling: no installs (node 24 + chromium 155 + jq/python already present; pacman paused per 2026-10-20 ruling; read `/home/vgpnk/.omp/agent/RULES.md`). Scratch writer-paths absolute per assignment.

## Commands (both runs, sequential)

```
node scripts/chrome-cdp-showpicker-round89.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r89-cold1-7bde5e6c2f2d \
  --scratch /fast/scratch/hyaku/tabi-r89/R89Exec1/cold1 \
  --out /fast/scratch/hyaku/tabi-r89/R89Exec1/cold1.json \
  --http-port 19940 --cdp-port 19941 --child-port 19942
# exit 0; wall 224.327 s (12:40:32.960Z - 12:44:17.287Z); receipt sha256 d4691a30542a...5bea86
node scripts/chrome-cdp-showpicker-round89.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r89-cold2-7bde5e6c2f2d \
  --scratch /fast/scratch/hyaku/tabi-r89/R89Exec1/cold2 \
  --out /fast/scratch/hyaku/tabi-r89/R89Exec1/cold2.json \
  --http-port 19950 --cdp-port 19951 --child-port 19952
# exit 0; wall 226.197 s (12:44:48.016Z - 12:48:34.213Z); receipt sha256 98b414dc7d04...c116

node scripts/check-showpicker-round89.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /fast/scratch/hyaku/tabi-r89/R89Exec1/cold1.json \
  --expect-driver-sha256 76b69b4f691d24c8c94a92897e33635d2386b9191f5aaa66640515dc998bd2d0 \
  --expect-nonce tabi-r89-cold1-7bde5e6c2f2d \
  --expect-fixture-sha256 98d25b1a8f7b7b986d36087839ade0e2b2ee7607200a98f26f0829cb070b401c \
  --prior-set .ufo/waves/round-89/controls/c1/prior-set.txt --json
# exit 1
# cold2 the same with its nonce/fixture 6109fc06893cae5d5476768baa83447b92f1a13f25941c405c2023d8b32473c4
# extra baseline: scored receipt scored same way (exit 0, verdict clean, checkCount 107)
```

Fixture hashes differ per receipt by construction (nonce + port triple embedded in the patched page): scored `69acad...`, cold1 `98d25b...`, cold2 `6109fc...`. `fixtureInputs` (21 entries) are identical across all three receipts; each was scored with its own receipt's fixture hash.

## Scores

| run | verdict | checkCount | exit | failed checks | finding ids |
|---|---|---|---|---|---|
| scored (baseline) | clean | 107 | 0 | (none) | (none) |
| cold1 | findings | 107 | 1 | prior-set-complete | prior-set-complete |
| cold2 | findings | 107 | 1 | prior-set-complete | prior-set-complete |

Both cold runs have the identical check set as the scored receipt (107 checks, same keys, same values — 106/107 true). The single failing check on each cold run is `prior-set-complete`, detail: "receipts of schema tabi-chrome-cdp-showpicker-r89 in the round-89 wave/evidence trees, not the receipt under test (path ../../../../../fast/scratch/hyaku/tabi-r89/R89Exec1/cold1.json), not exempted by sha256 and not among the priors: /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round89/chromium-showpicker/receipt.json" (cold2 names cold2.json). That is a **declaration**, not a law: the counter walks the lane's round-89 trees and refuses any in-tree r89-schema receipt that is neither a declared prior nor content-exempted. The cold receipts live outside the lane (scratch), so the only in-tree r89-schema receipt they see is the scored receipt itself, which is not in `--prior-set` (prior1/prior2 only). The assignment explicitly allows a cold run to fail only `prior-set-complete` for this reason; no law check (`gesture-law`, `trust-law`, `accept-domread-law`, `replay-*`, `prior-set-unmatched-exempt`, `prior-set-unparsable`, …) failed on either run.

Replay limit (Narrowing-8 sentence, both runs, consistent): "refuse when absMatched >= ceil(0.5 * prior events) i.e. absMatched >= the per-prior absNeed values printed in perPrior (105,105); the escape minimum is priorEvents - absNeed + 1 moved events. …" — per-prior `{priorEvents:209, priorGaps:2, absMatched:0, gapMatched:0, absNeed:105, gapNeed:2, escapeEvents:105, refused:false}` and `{priorEvents:209, priorGaps:7, absMatched:0, gapMatched:0, absNeed:105, gapNeed:6, escapeEvents:105, refused:false}`. `ownEvents` 209 on both runs (scored 209; ownGaps 7/10 vs scored 8 — gap count is a timing artifact, gap side is reported not refused per the sentence; `replay-limit-consistency` true throughout). Scored receipt's second prior shows `absMatched:2` (vs 0 on the cold runs) — small timing jitter in the honest run, well under `absNeed 105`.

`nodeReport` sp89 backendNodeIds: cold1 `[19,19,19,19]` (c≠19 → single value 19 each; cold1 detail `[19,19,19,19]`), cold2 text/png/multimime = 20 for text/png, 19 multimime, 20 whitespace — backendNodeId is browser-assigned per run, not a fact; nodeReport otherwise matches the scored shape.

## Leg counts and durations

Both cold receipts: 41 legs (same 41 names, same order as scored), `failures: []`, every leg `errors: []`, every leg teardown `sweepRounds:0 survivors:[]` and `lateAfterClose:0` (all 41 legs, both runs). Durations below are `settle − start` (ms, rounded) + `chooserWaitMs`:

| leg | cold1 dur | cold1 wait | cold2 dur | cold2 wait |
|---|---|---|---|---|
| sp84-cross-origin-nonfile | 2692 | 1 | 2696 | 4 |
| sp84-cross-origin-nonfile-disabled | 2704 | 3 | 2663 | 1 |
| sp84-cross-origin-color | 2707 | 41 | 2676 | 41 |
| sp84-cross-origin-month | 2684 | 3 | 2686 | 2 |
| sp84-cross-origin-week | 2667 | 1 | 2653 | 2 |
| sp84-cross-origin-time | 2671 | 3 | 2638 | 1 |
| sp84-same-origin-nonfile-disabled | 2302 | 2013 | 2293 | 2014 |
| sp84-webkitdirectory-answer | 2325 | 5 | 2284 | 0 |
| sp84-accept-answer | 2333 | 2 | 2290 | 0 |
| sp84-click-while-open | 2337 | 1 | 2284 | 1 |
| sp84-cross-origin-number | 2654 | 1 | 2651 | 0 |
| sp84-cross-origin-range | 2678 | 1 | 2679 | 1 |
| sp84-cross-origin-tel | 2679 | 1 | 2679 | 2 |
| sp84-cross-origin-search | 2675 | 3 | 2676 | 2 |
| sp84-cross-origin-text | 2698 | 1 | 2692 | 1 |
| sp84-multiple-mode | 2317 | 4 | 2328 | 4 |
| sp84-accept-mime-answer | 2309 | 0 | 2300 | 0 |
| sp84-second-chooser-answer | 2379 | 2 | 2341 | 4 |
| sp85-same-origin-tel | 2168 | 2005 | 2171 | 2008 |
| sp85-same-origin-search | 2169 | 2006 | 2143 | 2016 |
| sp85-same-origin-text | 2150 | 2009 | 2167 | 2020 |
| sp85-same-origin-tel-activated | 2293 | 2003 | 2328 | 2017 |
| sp85-same-origin-search-activated | 2335 | 2022 | 2322 | 2008 |
| sp85-same-origin-text-activated | 2298 | 2004 | 2334 | 2015 |
| sp86-accept-wildcard-text | 2314 | 2 | 2329 | 3 |
| sp86-accept-wildcard-png | 2321 | 3 | 2326 | 1 |
| sp86-accept-mixed-text | 2315 | 1 | 2336 | 2 |
| sp86-accept-mixed-png | 2314 | 1 | 2376 | 7 |
| sp86-accept-pdf-token-png | 2314 | 2 | 2337 | 3 |
| sp86-same-origin-color-activated | 2342 | 2032 | 2384 | 2048 |
| sp87-accept-audio-png | 2322 | 2 | 2352 | 3 |
| sp87-accept-video-text | 2304 | 2 | 2331 | 1 |
| sp87-accept-multimime-text | 2319 | 2 | 2348 | 3 |
| sp87-accept-whitespace-png | 2324 | 1 | 2317 | 1 |
| sp88-accept-case-png | 2328 | 1 | 2346 | 1 |
| sp88-accept-audiovideo-text | 2333 | 2 | 2350 | 1 |
| sp88-accept-mimeparam-png | 2325 | 2 | 2357 | 6 |
| sp89-accept-domread-text | 2324 | 2 | 2341 | 1 |
| sp89-accept-domread-png | 2327 | 3 | 2389 | 5 |
| sp89-accept-domread-multimime | 2332 | 4 | 2361 | 6 |
| sp89-accept-domread-whitespace | 2317 | 3 | 2398 | 2 |

Walls: cold1 224.327 s, cold2 226.197 s, scored 225.017 s. Cold1 sum of settle−start = 98,695.6 ms. Chooser events: 0 on cross-origin/same-origin-no-picker legs, 1 on each answer/domread leg, 2 on `click-while-open` and `second-chooser-answer` — both runs match the scored receipt's shape.

## The four sp89-accept-domread-* legs

Present in both cold receipts (and in the scored receipt), each `kind: showpicker-domread`, each re-reads `window.__inputs()` at settle (`domRead`), and each carries the raw accept string plus the DOM-parsed token list (WHATWG §2.3.8: split on commas, trim ASCII whitespace, ASCII lowercase). On every sp89 leg in both runs `domRead` equals `fixtureInputs` (21 entries, byte-identical), confirming the re-read. Non-domread legs have `domRead: null` by design (only domread legs re-read the page).

| leg | target | domRead accept | domRead acceptTokens | answered | stateAfter[target] | Page.fileChooserOpened | read hex (page) |
|---|---|---|---|---|---|---|---|
| sp89-accept-domread-text | aw | `image/*` | `["image/*"]` | text/plain (`tabi-r89-a.txt`, 22) | `[["tabi-r89-a.txt",22,"text/plain",""]]` | 1× selectSingle | `hex:746162692d7238332d616e737765722d616c7068610a` |
| sp89-accept-domread-png | am | `image/png, .txt` | `["image/png",".txt"]` | image/png (`tabi-r89-b.png`, 21) | `[["tabi-r89-b.png",21,"image/png",""]]` | 1× selectSingle | `hex:89504e470d0a1a0a746162692d7238332d706e670a` |
| sp89-accept-domread-multimime | a2 | `image/png,application/pdf` | `["image/png","application/pdf"]` | text/plain (`tabi-r89-a.txt`, 22) | `[["tabi-r89-a.txt",22,"text/plain",""]]` | 1× selectSingle | `hex:746162692d7238332d616e737765722d616c7068610a` |
| sp89-accept-domread-whitespace | aws | `  image/png ,  .txt  ` | `["image/png",".txt"]` | image/png (`tabi-r89-b.png`, 21) | `[["tabi-r89-b.png",21,"image/png",""]]` | 1× selectSingle | `hex:89504e470d0a1a0a746162692d7238332d706e670a` |

Page-event sequences are identical in order and facts on both runs (`pointerdown/mousedown/pointerup/mouseup/click@pad`, `input` + `change` trusted, `read`): e.g. `input@aw → change@aw → read@aw`. `showPicker` is `{ok:true, ret:"undefined"}` on all four legs in both runs. `upload.sha256` is identical (`bc9965f1…5c21de` for the text file) across runs; PNG `575d88a4…050` in `uploadPng`. Every `sp89` leg: `lateAfterClose 0`, `teardown.sweepRounds 0`, `survivors []`.

**Identical across cold runs, and identical to the scored receipt.** After normalizing away inherently volatile fields (page-event `at`/`ts` timestamps, `marks`, launchToken/browserId/profile paths, CDP send ids — the last being 20 and 19/20 backendNodeId values — `serverLog`/`childServerLog` nonce fields, `stderrHead`, `closedAt`, `chooserWaitMs`, and the scratch paths inside `answer.setParams.files`), the four sp89 legs are **fact-identical** between cold1 and cold2, and fact-identical to the scored receipt's four sp89 legs: same `stateAfter` files (name/size/type/webkitRelativePath `""`), same `domRead` (including `accept` and `acceptTokens` and rects), same 8-event sequences with the same types/targets/trusted flags/files/read hex, same single `selectSingle` chooser event, same answered files, same `upload` sha256, same `showPicker`. Only `chooserWaitMs` (1–6 ms jitter), `backendNodeId` (19 vs 20), and page timestamps differ. This confirms the measured law: `accept` is not a validator on a programmatic answer — every delivered file lands in the input with its bytes, trusted input+change, and page-read hex; the raw string and the tokens are both read from the page.

## Risks and blockers

None for this milestone. `prior-set-complete` on the cold runs is the expected declaration flag per the assignment (cold receipts live in scratch, outside the walked trees; the scored receipt is in-tree and undeclared). No law-level failure; no hangs; no port conflicts (disjoint triples); no scratch residue. If L1 wants the cold runs to score fully `clean`, the counter would need the cold receipts either inside the prior set or the scored receipt exempted by sha256 — that is L1's call, not a seat-level fix, and it changes a kill rule.
