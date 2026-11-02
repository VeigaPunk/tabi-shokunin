# Per-key key-event typing on the webview2 surface — round 52

source: S153 (Chrome DevTools Protocol browser_protocol.json, re-opened byte-identical
2026-11-02 — fourth consecutive identical fetch, sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2`
equals the registered anchor); the round's located ground is the `Input.dispatchKeyEvent`
description "Dispatches a key event to the page." (verbatim, 1 hit in the opened bytes);
S158/S159/S160 (the webview2 host route, held ground)
verified-at: 2026-11-02 — receipt `corpus/evidence/round52/webview2-keyevent-typing/receipt.json`
committed at `11d6aeb3f5e626d09320521646b994dafa7651e2`, counter r52 green
(`.ufo/waves/round-52/measure/c2-counter-green-at-data.json`: exit 0, 0 findings,
couldNotEvaluate []); cross-refusals both directions (`c2-r51counter-refuses-r52.json`
6 findings; `c2-r52counter-refuses-r51.json` 6 findings incl. `typing-missing` — the
exact class this round adds)
recheck: re-run `node scripts/webview2-cdp-loopback-round52.mjs --runtime <dir> --loader
<WebView2Loader.dll> --scratch <dir> --out <receipt.json> --form` (fresh nonce and fixture
port per invocation; `--runtime` is mandatory, no default) and score with
`node .ufo/waves/round-52/counters/webview2-receipt-r52.mjs <receipt> --shot … --png-a …
--png-b … --png-c … --png-form … --png-echo … --driver scripts/webview2-cdp-loopback-round52.mjs
--hostsrc scripts/webview2-host-round48.cs`; selftest `--selftest
.ufo/waves/round-52/counters/webview2-receipt-r52-fixtures` (50/50)

## The per-key typing trace (the r51 planned residual, exercised)

The r52 runner's `--form` mode replaces the r51 fill mechanism: instead of one synthetic
`Input.insertText`, every nonce character rides a REAL `Input.dispatchKeyEvent` pair —
`keyDown` carrying `text`/`unmodifiedText`/`key` plus a per-character-derived `code` and
`windowsVirtualKeyCode`, then the matching `keyUp` — 2n key events for an n-character
nonce, dispatched over the same focused-field mouse click the r51 leg used. After EACH
keystroke the runner reads the field's DOM value back, so the receipt's
`journey.form.typing[]` is a per-keystroke delivery witness, not a before/after pair:

- entry *i* records `i`, `char`, `code`, `windowsVirtualKeyCode`, and `valueAfter`,
  which must equal the nonce prefix of length i+1 — exactly one character per keystroke,
  in order, no dropped or duplicated keys (`allPrefixTrue`).
- The derivation, measured live this round: digits → `Digit<N>` + VK 48+N; letters →
  `Key<X>` + VK 65+; hyphen → `Minus` + VK 189. The live nonce `tabi-r52-48b62c227a28283d`
  (25 chars) typed as `KeyT`+84, `KeyA`+65, `KeyB`+66, `KeyI`+73, `Minus`+189, `KeyR`+82,
  `Digit5`+53, `Digit2`+50, then the hex tail — 50 events, 25 prefix witnesses, every one true.
- `valueBeforeFirstKey` must be empty (the click focused an empty field) and
  `fieldValueAfterTyping` must equal the invocation-bound nonce (the trace's end state
  agrees with the four r51-class witnesses: form-page nonce marker, typed value, the
  rendered echo page, the fixture server's served log).

Evidence class: the r51 receipt proved the field HELD the nonce after the fill; the r52
receipt proves EVERY KEYSTROKE DELIVERED exactly one character — the trace would catch a
dropped or duplicated key event, an inserted-extra-char driver artifact, or a
fill-by-value-set shortcut that no per-field before/after witness can distinguish.

## The counter contract (r52)

`webview2-receipt-r52.mjs` carries the whole r51 check chain (retargeted to the
`tabi-r52-` nonce/profile shapes and the r52 driver pin) and adds the typing block: the
counter INDEPENDENTLY re-derives every typing entry's `code`/`windowsVirtualKeyCode` from
the receipt's own nonce and checks `i`, `char`, `valueAfter` per keystroke, plus
`valueBeforeFirstKey`, `keyEventCount` (2n), and `fieldValueAfterTyping`. Finding ids:
`typing-missing`, `typing-length`, `typing-index`, `typing-char`, `typing-vk`,
`typing-code`, `typing-prefix`, `typing-value-before`, `typing-event-count`,
`typing-field-value` — each exercised by a hand-declared refusal fixture in the 50-case
set (`webview2-receipt-r52-fixtures/`, exact-findings manifest + the declared
`runtime-pin-host-drift` could-not-evaluate rule asserted per case). The carried r51
declared residuals hold: the counter binds receipt shape and committed bytes; the
re-derivation path is re-running the committed runner and re-compiling the host from the
committed `.cs`.

## Journey context (carried, re-measured)

- History at C: `[data:, a, b, c]` — entriesLength 4, currentIndex 3; back leg
  `navigateToHistoryEntry` targetIndex 2 → `/b.html`, 4/2 (the r50/r51 measured model
  reproduced a third time).
- Six per-step URL/title/PNG pins; the main shot equals the final (echo) step's capture;
  Edg/156.0.4314.58; keyed teardown `postKillSweepCount` 0.
- Cross-generation refusal is symmetric: the r51 counter refuses the r52 receipt (schema,
  nonce-shape, profile, driver-pin, form-mechanism, form-field-value) and the r52 counter
  refuses the r51 receipt (schema, nonce-shape, profile, driver-pin, form-mechanism,
  `typing-missing`) — a receipt from either generation cannot green the other's counter.
- Standing host condition unchanged: `--runtime` with no default (auto-update drift);
  the declared could-not-evaluate class carries over.
