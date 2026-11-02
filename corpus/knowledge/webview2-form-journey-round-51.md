# Form interaction on the webview2 surface — round 51

source: S153 (Chrome DevTools Protocol browser_protocol.json, re-opened byte-identical
2026-11-01 — fresh fetch sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2`
equals the registered anchor); S158; S159; S160 (the webview2 host route, held ground)
verified-at: 2026-11-01 — receipt `corpus/evidence/round51/webview2-form-journey/receipt.json`
committed at `08cc4b72552f266cff0bd60a435f7cbcbf430748`, counter r51 green
(`.ufo/waves/round-51/measure/c2-counter-green-at-data.json`: exit 0, 0 findings,
couldNotEvaluate []); cross-refusal `c2-r50counter-refuses-r51.json` (the r50 counter
refuses the r51 receipt with 5 findings)
recheck: re-run `node scripts/webview2-cdp-loopback-round51.mjs --runtime <dir> --loader
<WebView2Loader.dll> --scratch <dir> --out <receipt.json> --form` (fresh nonce and fixture
port per invocation; `--runtime` is mandatory, no default) and score with
`node .ufo/waves/round-51/counters/webview2-receipt-r51.mjs <receipt> --shot … --png-a …
--png-b … --png-c … --png-form … --png-echo … --driver scripts/webview2-cdp-loopback-round51.mjs
--hostsrc scripts/webview2-host-round48.cs`; selftest `--selftest
.ufo/waves/round-51/counters/webview2-receipt-r51-fixtures` (17/17)

## The form-interaction model (the r49/r50 planned residual, exercised)

The r51 runner's `--form` mode extends the r50 four-leg journey (Page.navigate → the
pages' own anchor clicks → the measured-model history read and `Page.navigateToHistoryEntry`
back hop) with two form legs, driven with the CDP **Input domain** — real input events,
not `Runtime.evaluate` value writes:

1. **Leg 5** — the /b.html page's own `#form` anchor click to `/form.html` (a GET form
   `action="/echo"`, `input#field name=field`, `button#go type=submit`; the invocation-bound
   nonce rides the page as a `#nonce` marker).
2. **Leg 6** — `Input.dispatchMouseEvent` mousePressed/mouseReleased at the field's
   bounding-box center (a real click focuses the field), `Input.insertText` of the nonce
   (the invocation-bound value), the field's `value` read back from the DOM
   (`fieldValueAfterInsert`), then a second mouse click on the form's own submit button.
   The GET form navigation lands on `/echo?field=<urlencoded nonce>`.

Four independent witnesses record one fill+submit round trip (receipt `journey.form`):

| Witness | Where | Measured value |
|---|---|---|
| the form page carries the invocation | `nonceOnFormPage` | true (`#nonce` marker === nonce) |
| the input domain inserted the value | `filledValue` + `fieldValueAfterInsert` | both === nonce (the DOM holds what was inserted) |
| the browser navigated the GET submit | `urlAfter` | `http://127.0.0.1:<port>/echo?field=<nonce>` |
| the SERVER saw the submission | `servedEchoEntry` + `serverSawField` | the fixture's served log carries `/echo?field=<nonce>` |
| the rendered echo page agrees | `valueOnEchoPage` | === nonce (the server echoed the value back into `#echoed`) |

The server-side witness is the new evidence class this round: every prior webview2
receipt is browser-reported only; here the inline fixture's request log independently
records the submitted query, so a fabricated DOM value cannot agree with a server log
the runner did not write.

## The journey context (carried from r50, re-measured)

- History at C: `[data:, a, b, c]` — entriesLength 4, currentIndex 3 (the initial
  `data:` page OCCUPIES history slot 0; the r50 measured model reproduced).
- Back leg: `Page.navigateToHistoryEntry` to index 2 → `/b.html`, entriesLengthAfter 4,
  currentIndexAfter 2 (the forward entry is retained; the form pages then stack on top).
- Per-step URL/title/PNG pins: six steps, six PNGs (`receipt-journey-{a,b,c,b-back,form,echo}.png`),
  the main shot equal to the final (echo) step's capture.
- The runtime-drift contract holds: `--runtime` with NO default; the r51 counter carries
  the r50 declared could-not-evaluate class `runtime-pin-host-drift` (a missing pinned
  runtime folder is disclosed, never a finding) and keeps folder-present-without-exe as
  the hard `runtime-msedgewebview2-absent` finding plus `runtime-identity-mismatch`.

## Counter contract (r51)

`webview2-receipt-r51.mjs` scores the receipt and its six committed PNGs: schema
`tabi-webview2-cdp-r51`, Edg/ identity equal to the runtime folder's version tail,
loopback ws, throwaway `tabi-r51-wv2drv-<hex>-profile` under the RESOLVED scratch,
nonce shape `tabi-r51-<16hex>` echoed as the live title, six journey steps with the leg
sequence above (same loopback origin+port throughout), the history/back-leg model, the
four-witness form block (`form-mechanism`, `form-invocation-binding`, `form-filled-value`,
`form-field-value`, `form-echo-url`, `form-echo-query`, `form-echo-value`,
`form-server-witness` are the new finding ids), per-step PNG digests, keyed teardown to 0,
and driver/host-source digest re-hashes. Selftest 17/17 over hand-declared fixtures
(green-rel, green-form, d3-asis, runtime-without-exe, runtime-identity-mismatch,
paths-block-missing, resolution-not-applied, tampered-shot, chrome-relabel,
journey-steps-short, journey-history-wrong, journey-back-wrong, form-values-wrong,
form-server-witness-missing, form-mechanism-wrong, form-echo-query-wrong,
cross-schema-r50) with exact-match expected findings and the declared cne rule asserted
per case. The r50 counter refuses the r51 receipt (5 findings) — prior generations do
not green a new generation's receipts.

## Declared residuals

- The receipt fields are driver-reported; the counter binds shape and committed bytes.
  The re-derivation path is re-running the committed runner (fresh nonce and fixture port
  per invocation) — the same residual every webview2 receipt carries, now bounded
  further by the server-side witness (a forged DOM chain must also forge the served log
  the same runner wrote).
- `Input.insertText` inserts text without key events (the S153 description: emulates
  text that doesn't come from a key press); a per-key `Input.dispatchKeyEvent` typing
  trace is the next depth residual, unexercised.
