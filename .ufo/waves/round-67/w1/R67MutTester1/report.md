# R67MutTester1 — degenerate-driver controls for C3 (chromium-hscroll-domain-linux)

Frozen driver: `scripts/chrome-cdp-loopback-round67.mjs`, sha256 `ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0` (re-checked after all runs: unchanged). Driver was never edited; each mutant is a byte copy under `$HYAKU_SCRATCH`-style scratch `/fast/scratch/hyaku/tabi-r67/R67MutTester1/`.

Host: Chromium 155.0.8059.84 (Arch). Node v24.21.0.

## Results (driver's own verdict)

| mutant | copy sha256 (prefix) | ports http/cdp | exit | predicate | hscrollHypothesis | failures | verdict vs. truth |
|---|---|---|---|---|---|---|---|
| M-A no-wheel | 12fe07c7aa85 | 19701/19702 | 1 | false | REFUTED | [] | correct (false) |
| M-B no-scrollend | 6e91d14103e3 | 19703/19704 | 1 | false | REFUTED | [] | correct (false) |
| M-C no-overflow (`#wide` 2280→1280px, as specified) | d73af33ae99b | 19705/19706 | 1 | false | REFUTED | [] | false, but for an incidental reason (see M-C) |
| M-C2 clipped-overflow (added: plus `overflow:hidden` on `#wide`) | 4c3d1a56601d | 19705/19706 (rerun) | 1 | false | REFUTED | [] | correct (false) |

No driver run returned `true`. No false positive was produced by the driver on any copy.

## Per mutant

**M-A no-wheel** (`mouseWheel` dispatch removed from `hwheel`, diff at `m-a-no-wheel/diff.txt`).
- legs scrollLeft `0,0,0,0,0,0`; scrollY 0; wheellogLen 0 on every leg; scrollendsInLeg 0 everywhere; `wheellog` = []; `scrollendlog` = []; pageState `scrollEvents` 0.
- Failing conjuncts: shapeOk (right1 scrollLeft 0 ≠ 120, wheellogLen 0 ≠ 1, …) and entriesOk (wheellog length 0 ≠ 5).

**M-B no-scrollend** (`window.addEventListener('scrollend', …)` block removed, diff at `m-b-no-scrollend/diff.txt`).
- scrollLeft `0,120,240,120,1000,1000` (identical to frozen); wheel entries identical to frozen (deltaX 120,120,-120,1200,120; scrollLeftAtDispatch 0,120,240,120,1000; targetId `wide`).
- scrollendsInLeg `0,0,0,0,0,0`; `scrollendlog` = []; pageState `scrollendEvents` 0.
- Failing conjunct: shapeOk on right1, right2, left1, overscroll (each requires ≥1 scrollend). The boundary leg's zero-scrollend negative witness is satisfied by this mutant (0 == 0), so it cannot by itself detect a missing listener; only the positive legs catch it.

**M-C no-overflow, as specified** (`#wide` width 2280px → 1280px, diff at `m-c-no-overflow/diff.txt`).
- Does NOT remove the horizontal overflow: the 19 absolutely positioned 120px bands still extend the document, so scrollLeft is `0,120,240,120,1000,1000` and scrollend legs are `0,1,1,1,1,0` with `scrollendlog` of length 4 — all matching the frozen run.
- The driver's REFUTED comes from one conjunct only: the boundary wheel entry (wheellog[4]) has `targetId: "HTML"` instead of `"wide"`. At scrollX 1000 the 1280px `#wide` box no longer lies under pointer x=300, so hit-testing lands on HTML. `entriesOk` requires `targetId === 'wide'`, so the verdict is false, but the cause is hit-testing, not overflow.
- Conclusion: this mutant is not a valid no-overflow control. Its false verdict is correct but accidental.

**M-C2 clipped-overflow** (added control: `#wide` gets `overflow:hidden`, which clips the bands and removes scrollable overflow; diff at `m-c2-clipped-overflow/diff.txt`).
- All five wheel events dispatch and target `wide` (scrollLeftAtDispatch 0 throughout); scrollLeft `0` on every leg; scrollY 0; scrollendsInLeg 0; `scrollendlog` = []; pageState `scrollEvents` 0.
- Failing conjunct: shapeOk (scrollLeft expected 120/240/…, got 0). This is the correct negative, and it is the proper no-overflow control.

## Infrastructure finding (driver path-length refusal is not a usage refusal)

First M-C2 attempt used scratch `/fast/scratch/hyaku/tabi-r67/R67MutTester1/m-c2-clipped-overflow` and returned exit 1 with `failures: [{id:"drive-error", detail:"no loopback page target"}]` after ~240 s. The receipt's `host.stderrHead` records:
`[1846345:1846345:1105/065909.362662:FATAL:chrome/browser/process_singleton_posix.cc:313] Socket path too long: /fast/scratch/hyaku/tabi-r67/R67MutTester1/m-c2-clipped-overflow/org.chromium.Chromium.bXA6RO/SingletonSocket.`
Chromium's UNIX-socket path limit (107 bytes) was exceeded, so no DevTools page ever appeared. The driver reported this as a red receipt (exit 1), not a usage refusal (exit 2). Rerun with the scratch dir renamed to `c2` (short path) returned exit 1 with a real verdict and no failures. The first attempt's receipt was overwritten by the rerun. Recommendation for the L1/counter: a scratch path longer than ~90 characters yields a misleading drive-error red; the counter should not treat that as a driver verdict.

## Commands and exit codes

- `sha256sum scripts/chrome-cdp-loopback-round67.mjs` → `ac0561ac…a70e0` (match, before and after).
- `cp` frozen driver to 3 mutant dirs → sha256 identical to frozen (verified).
- port probes via `/dev/tcp` for 19701–19706: all refused (free) before runs.
- `diff -u` per mutant → exit 1 each (differences present, expected); saved to `<mutant>/diff.txt`.
- `node <copy> --scratch … --out …/<mutant>/receipt.json --nonce tabi-r67-mut-{a,b,c} --http-port … --cdp-port …` → exit 1 for M-A, M-B, M-C.
- M-C2 first run → exit 1 (SingletonSocket path, drive-error); rerun from `c2` → exit 1 (REFUTED, no failures).
- Each run: `teardown.postKillSweepCount` 0, portProbes `closed`, postKillCurl 7/7.

## Files

- `m-a-no-wheel/{receipt.json,stdout.json,stderr.txt,diff.txt,*.png}`
- `m-b-no-scrollend/{…}`
- `m-c-no-overflow/{…}`
- `m-c2-clipped-overflow/{…}` (rerun receipt)
- Scratch `/fast/scratch/hyaku/tabi-r67/R67MutTester1/` deleted before yield.

No tools installed or upgraded. No git or jj commands run. No sysctl changes.
