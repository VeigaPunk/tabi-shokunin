FALSIFIED

# R73Critic — C1 `chromium-synth-pinch-gesture-linux` (r73). Scoped findings.

Full report: `.ufo/waves/round-73/w1/R73Critic/report.md`; commands + exits: `w1/R73Critic/runs.txt`;
forgery rebuilder: `w1/R73Critic/forge-build.mjs`.

**Falsified content:** the declared limit (`claims.json:42`) as the boundary of forgery, and with it the
evidentiary strength of predicate legs (a) and (b) (`claims.json:33`). **Not falsified:** the
instruments, the battery, the kill power, the S180–S183 sourcing, the coverage naming, and the
genuineness of the committed (a) receipt (distinct timeline `cb3cbaf2…` vs r72 `6565f52f…`, fixture sha
`875ef7d7…` vs `fc5cd2d7…`, `startedAt` 22:18:28.9 -03:00 = 6.9 s after D).

## The counterexample

`.ufo/waves/round-73/w1/R73Critic/forge-build.mjs` rebuilds it from committed bytes. Take
`corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json`, change four fields (`schema`,
`nonce`, `nonceOnPage`, `driverSha256`) and substitute the nonce string. The launch token
`4da82a8d0e77`, the DevTools browser id and all 573 event `ts`/`at` are kept.

    node scripts/check-synthpinch-r73.mjs --receipt .../forge-r72-relabel.json \
      --expect-driver-sha256 3f0ffe24… --expect-nonce tabi-r73-l1-3409ab53b905 <PRE ×12> --json
    -> exit 0, verdict clean, 98 checks, findings []        (w1/R73Critic/forge-r72-relabel.json)

Same recipe on `.ufo/waves/round-72/controls/c1/smoke1.receipt.json` with nonce
`tabi-r73-exec1-3409ab53b905` and priors = PRE + the (a) receipt: exit 0, clean 98
(`forge-legb-receipt.json`). Predicate (a) and (b) are therefore satisfiable with **zero** r73
execution; (c) is a function of the (a) receipt.

**Outside the declared limit:** `claims.json:42` prices the escape as rewriting the nonce *and* the
launch token *and* the DevTools browser id *and* every event time. This forgery rewrites only the nonce.

## The guard is the prior list, not the receipt

The same forged receipt with the r72 scored receipt added as one extra `--prior`: exit 1, exactly
`replay-launch-token, replay-devtools-url, replay-event-timeline`
(`forge-r72-relabel-plus-r72prior.json`). The replay checks work; the 12 PRE receipts omit the
generation whose receipts are shape-identical (the r73 driver is the r72 driver with 15 changed lines;
the counter is r72's plus 4 checks, 94 → 98).

## Honesty of the limit

- True as written (reproduced): F1 byte-identical replay → `nonce-expected` + 3 replay ids; F2 nonce +
  wall-clock stamps +1 h → the 3 replay ids exactly; F3 full identifier rewrite → exit 0; F6 unmodified
  r72 receipt → `schema,nonce-shape,nonce-expected,driver-pin`.
- Incomplete: it does not say that any receipt outside the `--prior` list is a free forge base with no
  identifier rewrite. `doNothingControl` (`claims.json:34`) is green only on the byte-identical r72 file,
  so it does not bound the look-alike class it is quoted for. `driver-pin` compares a receipt field
  (`check-synthpinch-r73.mjs:138`), not the driver bytes. `host-chromium` (line 140) pins no
  Chromium version although the capability is named for 155.

## Sourcing (question 3): true

`sha256sum` of `.ufo/waves/round-73/sources/{local_frame_view.cc,web_input_event_conversion.cc,web_mouse_wheel_event.cc,wheel_event.cc}`
= `146aa4c1…`, `31a6868e…`, `c00b3bf7…`, `5f43b8a5…` = `corpus/SOURCES.md:194-197`. Quoted lines are
verbatim (`local_frame_view.cc:1994-1998`, `web_input_event_conversion.cc:56-65,127-134`,
`web_mouse_wheel_event.cc:103-105`, `wheel_event.cc:110-111`). The chain grounds
`deltaY = −delta_y / (pageScale · emuScale · dpr)`; the law needs `emuScale·dpr = 1`. `emuScale = 1`
is declared inference (`claims.json:42`, note "**Still inference:**"); `dpr = 1` is a stated condition
of the demonstration and `setDeviceMetricsOverride` is pinned by the allowlist (line 191). No undeclared
link. Law re-measured on the scored receipt: −69.31476 / +69.31472 / +69.31471 / −40.54648 (≤ 4.3e-5).

## Coverage naming (question 3): true

`grep -c '^| `chromium-synth-pinch-gesture-linux` |' SCORECARD.md` = 0 at base `d7ff9f19` and 0 at tip
`c44fcf6`; no other row covers `Input.synthesizePinchGesture` or page scale. Leg (d) is unlanded at the
tip, so the predicate is not yet satisfied (declared build order).

## Reproduced legs (no defect)

- (a) counter: exit 0, clean, 98 checks (`reproduce-leg-a.json`).
- (c) battery: exit 0, `allOk true`, 228/228 (216 refuse, 9 must-accept, 3 laundered), gap `[]`
  (`reproduce-battery.json`).
- (c) kill power: exit 0, `holds true`, 98/98 force-true, 19/19 semantic, unmutated exit 0
  (`reproduce-kill-power.json`).
- Pinned instruments unchanged: all five digests equal `freeze.txt`.

## Impacted axes

coverage (evidentiary strength of (a)/(b)); calibration (the declared limit prices the forgery wrong).

## Smallest safe correction (later generation; nothing frozen amended)

1. Put every synthpinch receipt in the tree in the prior set — at minimum the previous generation's
   scored and executor receipts. Verified sufficient: F4' fires all three replay ids on the same forged
   receipt that passes against PRE.
2. Restate the limit: *the guard is `--prior` membership; anything outside it, including the previous
   generation's receipts, is a valid forge base with no identifier rewrite.*
3. Run the do-nothing control on the cheapest edited form, not only the byte-identical file.
