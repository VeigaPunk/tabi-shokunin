CONFIRMED

# R70Exec1 — independent cold live re-derivation of C1 predicate leg (b)

Seat: wave-1 leaf executor. Lane HEAD at run time: `0ff5134e42b985b494274383a009a38873e6db63`
("round-70: L1 scored live verifier runs C1(b) synthtap-r70 and C2(a) synthscroll-r69, both exit 0").
No lane, script, corpus, fleet or sibling file was modified. No git/jj mutation. Scratch removed at exit.

## Axis / move
Coverage, leg (b) of C1-SYNTHTAP-LIVE: an independent seat re-runs the frozen live verifier once, cold,
on its own scratch, plus one independent execution of the pinned driver scored by the frozen counter.
One attempt each; a red result would have been reported, not re-run.

## 1. Pin audit (read-only, before any run)
All ten digests in `.ufo/waves/round-70/freeze.txt` recomputed and byte-equal to the frozen record:

| file | sha256 | freeze |
|---|---|---|
| scripts/chrome-cdp-synthtap-round70.mjs | 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577 | match |
| scripts/check-synthtap-r70.mjs | a2ed7619ca6ea165a3877308c3d87c41a27f6b2a7f24a7fca4f879073a39756e | match |
| scripts/negatives-synthtap-r70.mjs | 22244a81f9653a3df30cb4dc98b258d9cd09201247e748b97b516bca99b2af3c | match |
| scripts/verify-live-r70.mjs | 99442a2c385387148d12167072cafb764590def99ef0172e41c0f90ed75376b8 | match |
| scripts/chrome-cdp-synthscroll-round69.mjs | 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 | match |
| scripts/check-synthscroll-r69.mjs | c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795 | match |
| controls/forgers/forger.mjs | 9c2a5ca466d987590ffd20c7936118a28a194ad44bfaa24e1f20210bbdcef3cb | match |
| controls/evaluate-controls.mjs | a8135177e1c3f2fe5b68a902d413d995275a251757196b0f7758f808ef909fe0 | match |
| controls/run-controls.sh | 1a64fce932aa9ffdd97cb1bf4e97b95930432a06a3c058e30f4ff59a07c65097 | match |
| .ufo/waves/round-70/claims.json | 6746135d55c5cc31d455b41b2cba64532ee7e83aaa8b6e915e0344c5d102d33b | match |

No predicate, counter, pin or kill rule is proposed for amendment; the frozen bytes are what was run.

## 2. Cold live verifier (predicate leg b)
Fresh scratch `/fast/scratch/hyaku/tabi-r70/R70Exec1/v` (created in this seat, nothing pre-existing).

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/verify-live-r70.mjs \
  --profile synthtap-r70 --scratch /fast/scratch/hyaku/tabi-r70/R70Exec1/v --json \
  > .ufo/waves/round-70/w1/R70Exec1/verify.json
rc=$?   # captured on the next line -> verify.exit
```

- exit **0** (`verify.exit` = `0`), wall **24837 ms**, stderr empty.
- JSON: `predicate: true`, `exit: 0`, `pinSource: "frozen"`, `findings: []`.
- driverSha256 `704efab8…f9577`, counterSha256 `a2ed7619…39756e` (both = frozen pins; profile block at
  `scripts/verify-live-r70.mjs:70-77`).
- evidence `corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json`, sha256
  `0a51f3a6c97280d4bb5d854e0d0ed9d43726f340b46fb840313559b0bf86d631`, `counterExit: 0`.
  That sha is unchanged after the run (recomputed post-hoc): the verifier read, and did not mutate,
  the committed evidence.
- run a: nonce `tabi-r70-live-c0940d9c31-a`, http 44593, cdp 41785, exit 0, counterExit 0,
  12368 ms, binding `{newFile,nonce,driverDigest,cdpPort,httpPort}` all true, receipt sha
  `1d3ebd29b0cb33b209ad715183126fa0085735957a564dea2ed6180a6c2a62e8`.
- run b: nonce `tabi-r70-live-9d98733c71-b`, http 33089, cdp 40385, exit 0, counterExit 0,
  12380 ms, same binding all true, receipt sha
  `c4b0c843fe040580c628b9182193bacbc3000f3acf34bc728be6df064ea4652f`.
- `agreement: {crossRun: true, evidence: true}`; `fingerprint` = the 8-leg table reproduced in §4.
- Verifier-drawn nonces match the frozen prefix/shape `tabi-r70-live-<10 hex>-{a,b}`
  (`scripts/verify-live-r70.mjs:154`); they differ from every other seat's and from mine.

Copied into this dir: `live-scratch-receipts/run-{a,b}/receipt.json`, plus each run's
`server-log.json` (nonce-on-page binding) and `fixture.html`.

## 3. Independent driver execution + frozen counter
```
NONCE=tabi-r70-exec1-cf760779     # tabi-r70-exec1-<8 hex>, drawn by me
ports: http 44219, cdp 45405      # free-probed inside 41000-48999
node scripts/chrome-cdp-synthtap-round70.mjs --scratch /fast/scratch/hyaku/tabi-r70/R70Exec1/d \
  --out …/w1/R70Exec1/independent-run/receipt.json \
  --nonce tabi-r70-exec1-cf760779 --http-port 44219 --cdp-port 45405
rc=$?  -> 0    (12315 ms)
```
Receipt: sha256 `e960b2ad4fe12bb2f3e4a709e68e4b0affe97b86faaa8d7a87727ed3b9ccbb69`,
`driverSha256` = 704efab8…f9577, `nonce` = tabi-r70-exec1-cf760779, `degenerate: null`,
`failures: []`, `predicate: true`, `synthTapHypothesis: "CONFIRMED"`, host
`Chromium 155.0.8059.84 Arch Linux` / cdp `Chrome/155.0.8059.84`.
Teardown: `postKillSweepCount 0`, `survivors []`, portProbes `{fixture:"closed", devtools:"closed"}`.
`work/server-log.json` shows the fixture request `run=tabi-r70-exec1-cf760779` (nonce bound to the page).

```
node scripts/check-synthtap-r70.mjs --receipt …/independent-run/receipt.json \
  --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577 --json
rc=$?  -> 0    (15 ms)
```
`verdict: "clean"`, `checkCount: 84`, 84/84 check keys true, `findings: []`
(`driver-pin` compared against the literal pin, `scripts/check-synthtap-r70.mjs:78`).

## 4. Cross-execution agreement (4 independent executions, 3 nonces, 2 seats)
Fingerprint computed with the frozen profile routine (`scripts/verify-live-r70.mjs:78-84`), applied to
committed evidence, verifier run a, verifier run b, and my independent receipt: **all four identical.**

| leg | event sequence (moves filtered) | click detail | cdpError |
|---|---|---|---|
| start | — (0) | — | none |
| mouse | pointerdown(mouse),mousedown,pointerup(mouse),mouseup,click(mouse) | 1 | none |
| hold | same as mouse | 1 | none |
| double | mouse sequence twice | 1,1 | none |
| zero | — (0) | — | none |
| default | pointerdown(touch),touchstart,pointerup(touch),touchend | — (no click) | none |
| touch | pointerdown(touch),touchstart,pointerup(touch),touchend | — (no click) | none |
| outside | — (0) | — | -32602 "Position out of bounds" |

Measured press→release (ms) per execution — evidence / live-a / live-b / mine:
mouse 49.9 / 50 / 49.9 / 50; hold 400 / 400 / 400 / 399.9; double 50 / 50.1 / 50 / 50;
default 50 / 50 / 49.9 / 50; touch 50.1 / 50 / 49.9 / 50.1; all legs `allTrusted: true`,
`onButton: true`, `dblclick: 0`. This is the assignment's measured claim reproduced on a fourth
independent execution: default 50 ms tap, `duration: 400` honoured, `tapCount 2` = two detail-1
clicks with no dblclick, `tapCount 0` = no events, default and explicit touch = touch stream without
click, x outside the viewport = -32602.

## 5. Findings
None. No predicate or instrument defect observed; the frozen verifier's own two runs, its
evidence-to-live agreement, and my independent driver+counter all agree at exit 0 on a first attempt.

## 6. Scope limits (honest)
- Executed here: C1 leg (b) only, one cold verifier run; plus one independent driver run and one
  counter run. C1 legs (a)/(c) (scored receipt on tip, negatives battery 95/95) and C2 were **not**
  run by this seat and are not claimed by it.
- The verifier re-derives on this host's Chromium only; the pin is the root of trust
  (claims.json C1S limit) — unchanged by this seat's evidence.
- No re-run was performed after any result; every number above is a single attempt.
- Scratch `/fast/scratch/hyaku/tabi-r70/R70Exec1` deleted after copying receipts into this dir
  (receipts copied first, chromium profiles never copied).

## Artifacts in this dir
`verify.json`, `verify.err` (empty), `verify.exit`, `verify.wall.txt`,
`live-scratch-receipts/run-{a,b}/{receipt.json,server-log.json,fixture.html}`,
`independent-run/{receipt.json,driver.exit,driver.wall.txt,driver.stdout,driver.stderr,counter.json,counter.exit,counter.wall.txt,work/{server-log.json,fixture.html}}`.
