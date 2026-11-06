PASS

# R69Exec1 — independent cold scored run (b), C2 `chromium-synth-scroll-gesture-linux`

Round 69 / Amendment 46, wave w1. Predicate leg (b): one run, no retries.

## Pin verification (before the run)

`sha256sum` on the two assignment pins, plus the battery and the freeze-manifest
rows for context:

| path | required | observed | ok |
|---|---|---|---|
| `scripts/chrome-cdp-synthscroll-round69.mjs` | `13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3` | same | yes |
| `scripts/check-synthscroll-r69.mjs` | `c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795` | same | yes |
| `scripts/negatives-synthscroll-r69.mjs` | (freeze.txt) `37e8f9627d12a229d0a24a6bcabf5fcf07d6f82caaf27d61e15d87b5b20c7f97` | same | yes |

`freeze.txt` also lists the C1 counters; not exercised here. The receipt records
`driverSha256` = `13ea3f8a…` self-measured from the executing file
(`chrome-cdp-synthscroll-round69.mjs:247`), which the counter re-checked.

## Run

Cold: nonce `tabi-r69-exec1-a8d7aa1f`, fresh scratch profile, ports chosen free
(`41713` http / `41831` cdp, verified free with `ss -ltn` before launch), headless
`/usr/bin/chromium` 155.0.8059.84. Executed exactly once:

```
TMPDIR=/fast/scratch/hyaku/tabi-r69/R69Exec1 \
node scripts/chrome-cdp-synthscroll-round69.mjs \
  --scratch /fast/scratch/hyaku/tabi-r69/R69Exec1/run \
  --out .ufo/waves/round-69/w1/R69Exec1/receipt.json \
  --nonce tabi-r69-exec1-a8d7aa1f --http-port 41713 --cdp-port 41831
```

**driver exit 0**; stdout in `driver-stdout.json` (valid JSON, `driver-stderr.txt` empty):

```
predicate=true, synthScrollHypothesis=CONFIRMED, degenerate=null
```

Receipt facts (`w1/R69Exec1/receipt.json`, sha256 `b46c7468c267b4bf467c112577507508c922de6bc4dbc3dbd7f0e45849d9a6b2`):

- host: `Chromium 155.0.8059.84 Arch Linux`, `cdpProduct Chrome/155.0.8059.84`, protocol 1.3
- fixture: 6000 px document, origin `http://127.0.0.1:41713`, served `/` with
  `run=tabi-r69-exec1-a8d7aa1f` (200); `nonceOnPage` equals the nonce (pinned nonce on page)
- legs (scrollY before -> after): start 0->0 · mouse 0->600 · default 600->300 ·
  repeat 300->900 · touch 900->900 (negative leg did not scroll)
- wheel deltaY sums per leg: start 0 · mouse +600 · default -300 · repeat +600 · touch 0
  (wheel counts 0/46/24/51/0), every event `isTrusted:true`
- touch leg: exactly 1 pointerdown/1 pointerup (pointerType touch), 1 touchstart,
  1 touchend, 40 pointermove(touch), zero wheel, zero scrollend
- producer: `cdpSendLog` 45 entries, ids 1..45, exactly 4 `Input.synthesizeScrollGesture`
  calls with the frozen params in order, no other `Input.*`, no script-scroll expression
- page end state: scrollY 900, 116 scroll events, 170 recorded events (`eventCount` matches)
- teardown closure: postKillSweepCount 0, survivors [], sweepError null, both port probes
  `closed`, both post-kill curl exits 7; sweeps preLaunch 0 / midRun 13 / postKill 0

## Counter (pin enforced)

```
node scripts/check-synthscroll-r69.mjs \
  --receipt .ufo/waves/round-69/w1/R69Exec1/receipt.json \
  --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json \
  > .ufo/waves/round-69/w1/R69Exec1/counter.json
```

**counter exit 0** — `{"verdict":"clean","nonce":"tabi-r69-exec1-a8d7aa1f","checkCount":63,"findings":[]}`
(`counter.json`, sha256 `cd98342a059a448b9865bbcaa8eed9e22045984cf59e52c2c1af8222e27351de`).
No findings, so nothing was refused and nothing was greened: the counter derived all 63
checks from the receipt and agreed with the producer on both polarities.

## Negatives battery on this receipt

```
node scripts/negatives-synthscroll-r69.mjs \
  --real   .ufo/waves/round-69/w1/R69Exec1/receipt.json \
  --work   /fast/scratch/hyaku/tabi-r69/R69Exec1/neg \
  --out    .ufo/waves/round-69/w1/R69Exec1/negatives.json \
  --laundered .ufo/waves/round-69/controls/c2-degenerate/js-scroll-receipt.json \
  --laundered .ufo/waves/round-69/controls/c2-degenerate/dispatch-wheel-receipt.json \
  --laundered .ufo/waves/round-69/controls/c2-degenerate/skip-touch-receipt.json
```

**battery exit 0**: `{"negatives":44,"refusedForExpectedReason":44,"positiveOk":true,"failed":[]}`
(`negatives.json`, sha256 `cb6a6a11b7963ff8e4eb5ff5e3238e119bc4392886b61b9d6982cd5596df8595`;
the battery records the counter sha it used as `c1b3763c…`, i.e. the pinned counter).

Breakdown of the 45 rows: 1 positive control (exit 0) + 40 targeted single-field
forgeries (all exit 1 with their own source-location finding id) + wrong-pin row
(exit 1, id `driver-sha256-pin`) + 3 laundered degenerate receipts. The laundered
controls are green-looking at the producer-verdict layer yet still refused:

- js-scroll: refused with 15 ids, incl. `no-script-scroll`, `gesture-call-count`,
  `gesture-params`, and per-leg wheel findings
- dispatch-wheel: refused with `no-other-input-producer`, `gesture-call-count`, `gesture-params`
- skip-touch: refused with `gesture-call-count`, `gesture-params`, and the missing touch
  pointer rows

No forgery greened and none was refused for the wrong reason.

## Findings / notes (no action requested; claims frozen)

1. `scripts/chrome-cdp-synthscroll-round69.mjs:31-35` carries constants from a different
   (band/overscroll) fixture — `BAND_WIDTH` 120, `BAND_COUNT` 19, `CONTENT_WIDTH` 2280,
   `CONTENT_HEIGHT` 860, plus `LEG_NAMES = ['start','right1','right2','left1','overscroll','boundary']`
   and `SWEEP_MAX_ROUNDS`/`SWEEP_WAIT_MS` — which the executed legs do not use (the live legs are
   the five in `LEGS` at `:194-200`, matching the counter's `FROZEN` at
   `check-synthscroll-r69.mjs:19-25`). Dead constants only; they do not affect this run's
   measured receipt, and the pin was verified against the frozen digest, so no edit is
   proposed.
2. Comment/header drift in the same file (e.g. the header describes the band fixture) is
   likewise non-behavioural. Recorded, not changed: a pinned driver is frozen evidence.

## Bounds compliance

- Wrote only `w1/R69Exec1/` files plus this report; read-only elsewhere; no git/jj mutation.
- Scratch `/fast/scratch/hyaku/tabi-r69/R69Exec1/` used for profile, fixture, port work and
  battery workspace; deleted before yielding (receipts copied into the wave dir first).
- No subagents; no builds; no sysctl/host changes; no tool installs were needed.
- User's interactive Chromium was untouched: the driver's sweeps are bound to its own
  launch token (`preLaunch 0`, `midRun 13`, `postKill 0`), and no process outside the
  run's token survived.

## Blockers

None.
