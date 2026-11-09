# R98Exec1 — C1 cold reproduction (tabi round 98, wave w1)

Seat: `R98Exec1`. Role: leaf executor; milestone = C1 cold reproduction.

Target: on host Chromium `155.0.8059.84` (`/usr/bin/chromium`), pinned driver
`scripts/client-oopif-uploadmodes-round98.mjs` (sha256
`f8e95a98…092aa2`) with puppeteer-core 25.16.0 / playwright-core 1.65.0,
3 reps × 8 arms = 24 legs: PUA/PLA/PLL trusted path uploads (22-byte answer,
readable); PLAB/PLB/PLLB untrusted payload uploads (29-byte, readable);
PLLM ENOENT `stat '<missing>'`, `#s` empty/read null; PUR phantom
`[tabi-r98-missing.txt,0,text/plain]` trusted, read rejects
`NotFoundError "A requested file or directory could not be found at the time
an operation was processed."`; `#pp` always `[]`; exactly one iframe target/leg.

Plan read in full (incl. §Declared limits 1–7) before the runs. Limits bind:
launch-vs-connect is a driver-pin fact (limit 2); TMPDIR under scratch affects
chromium singleton path (limit 7). No extras run.

## Tooling installed (record)

- `npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0`
  (npm registry) into `/fast/scratch/hyaku/tabi-r98/R98Exec1/deps`, exit 0
  (26 packages added). Verified versions: `25.16.0 1.65.0`.
  No pacman (per contract: all pacman transactions paused host-wide); no
  other tools installed; no sudo.

## Cold run 1 (frozen counting command, verbatim)

```sh
TMPDIR=/fast/scratch/hyaku/tabi-r98/R98Exec1 node \
  /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-uploadmodes-round98.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 f8e95a982ac06dc42d6d6f0754123277183d85bc7672d341fed1d2191e092aa2 \
  --live --deps /fast/scratch/hyaku/tabi-r98/R98Exec1/deps \
  --scratch /fast/scratch/hyaku/tabi-r98/R98Exec1/run1 \
  --ports 33611,33612,33613 --json \
  > .ufo/waves/round-98/w1/R98Exec1-run1.json
```

Exit **0**. Output: `R98Exec1-run1.json` — `verdict: clean`,
`revision: 172bc0a1…`, `checkCount: 256`, `findings: []`,
`driverRun: {status: 0, signal: null, timedOut: false, orphansSwept: 0}`,
`driverSha256: f8e95a98…092aa2`,
`receipt: /fast/scratch/hyaku/tabi-r98/R98Exec1/run1/receipt-o7Q8eg/live-receipt-17393ae7e5ef.json`,
`receiptSha256: 768c7e0a…8db956`, `nonce: tabi-r98-live-f21211527bd3`.
Outcomes: trustedPath 9 (PUA/PLA/PLL ×3), untrustedPayload 9
(PLAB/PLB/PLLB ×3), enoent 3 (PLLM ×3), phantomUnreadable 3 (PUR ×3).
Receipt copied to `R98Exec1-run1-receipt.json` (sha256 matches counter receiptSha256).

## Cold run 2 (same command, fresh scratch `run2`, same ports)

Exit **0**. Output: `R98Exec1-run2.json` — `verdict: clean`,
`checkCount: 256`, `findings: []`, `driverRun.status: 0, orphansSwept: 0`,
`receiptSha256: 00a7cd3c…119cfb6b6d`, `nonce: tabi-r98-live-364c1184831b`,
`receipt: …/run2/receipt-OWWUGD/live-receipt-cb3434215c86.json` →
copied to `R98Exec1-run2-receipt.json`. Outcomes identical to run1.

## Library identity pin check

Counter-enforced in both runs, confirmed by parsing run1 receipt `libs`:
the fresh npm install reproduces the pinned libraries exactly —
puppeteer-core 25.16.0 `sha512-VA5Pf54N…IJw==`, `ElementHandle.js`
`162b7199…9b7c96`, tree 927 / `968a85e8…d1e180`; playwright-core 1.65.0
`sha512-vNSKgH6Y…+lA==`, `coreBundle.js` `4ef83305…63f7f1`, tree 116 /
`24584693…641`. (Run1 vs run2 `libs` byte-identical.) No `libs` finding.

## Forgery battery on run1 receipt

```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-client-oopif-uploadmodes-round98.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt .ufo/waves/round-98/w1/R98Exec1-run1-receipt.json \
  --expect-nonce tabi-r98-live-f21211527bd3 \
  --expect-driver-sha256 f8e95a982ac06dc42d6d6f0754123277183d85bc7672d341fed1d2191e092aa2 \
  --scratch /fast/scratch/hyaku/tabi-r98/R98Exec1/bat --json \
  > .ufo/waves/round-98/w1/R98Exec1-battery.json
```

Exit **0**. Output `R98Exec1-battery.json`: `cases 87`, `ok 87`, `failed []`.
Positive case rc 0; every negative rc 1 with its expected finding id
(child-events, child-files, child-read, outcome, parent-files, missing,
leg-arm, leg-set, leg-label, iframe-targets, frames, libs, browser,
chromium, nonce, driver-pin, answer, payload, reps, fresh-browser, ports,
failures). No finding id missed.

## Chromium cleanup

`pgrep -f "remote-debugging-port=33613"` → empty after each run and after
battery ("no chromium left on 33613"); `pgrep -f "remote-debugging-port=3361[123]"`
→ empty at end. No stray processes; no files written outside seat paths
and scratch.

## Verdict reasoning

Two independent `--live` cold runs of the pinned driver with the pinned
libraries reproduce every leg-level statement of the predicate (256 checks,
0 findings each), and the 87-case forgery battery is fully killed on the fresh
receipt. Counts agree with the predicate (24 legs = 8 arms × 3 reps;
outcome partition 9/9/3/3). No falsification found.

Artifacts (all under `.ufo/waves/round-98/w1/`, relative to
`/home/vgpnk/Projects/shokunin/tabi-shokunin`):
- `R98Exec1-run1.json` (sha256 `4f076ab3…f45408bd`) — cold run 1 output
- `R98Exec1-run2.json` (sha256 `66910459…2fc178c5`) — cold run 2 output
- `R98Exec1-run1-receipt.json` / `R98Exec1-run2-receipt.json` — copied receipts
- `R98Exec1-battery.json` (sha256 `2c535f96…64a8ccebd`) — 87/87 battery

VERDICT C1: neutral
