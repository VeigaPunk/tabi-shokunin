# webview2 modifier-chord key-event typing (round 53)

- source: S153 (ChromeDevTools/devtools-protocol `json/browser_protocol.json`,
  re-opened byte-identical a FIFTH time this round, sha256
  `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2` == the
  registered anchor); the located ground for this round is the
  `Input.dispatchKeyEvent` `modifiers` parameter description
  ("Bit field representing pressed modifier keys. Alt=1, Ctrl=2,
  Meta/Command=4, Shift=8 (default: 0)." — 12 words, carried as one JSON
  string with a `\n` wrap in the opened bytes) plus the command description
  "Dispatches a key event to the page." (verbatim 1 hit, the r52 ground).
- verified-at: 2026-11-02, live run on the WebView2 runtime
  156.0.4314.58 (`Edg/156.0.4314.58`), receipt
  `corpus/evidence/round53/webview2-modifier-chords/receipt.json`
  (nonce `tabi-r53-281215ca50c47cd8`), counter
  `.ufo/waves/round-53/counters/webview2-receipt-r53.mjs` green
  (exit 0, 0 findings, couldNotEvaluate []).
- recheck: on the next runner-generation round (or if a Chromium-class
  runtime changes the Input-domain behavior); the S153 anchor is
  byte-pinned, so protocol drift is detectable by sha.

## What the surface can now do (capability `webview2-keyevent-modifier-chords-windows`)

The r52 per-key typing trace is extended with SHIFT MODIFIER CHORDS: the
mixed-case value — the invocation-bound nonce, uppercased — is typed into the
form's SECOND field (`#field2`, `name="mixed"`) where every uppercase letter
rides a real Shift press/release around its keyDown/keyUp pair:

- Shift rides: `Input.dispatchKeyEvent` keyDown `{ modifiers: 8, key: 'Shift',
  code: 'ShiftLeft', windowsVirtualKeyCode: 16 }` before the letter's keyDown,
  the matching keyUp after the letter's keyUp — 4 events per shifted character.
- The letter's own event carries `modifiers: 8` with the SHIFTED key/text
  (`key: 'T'`, `text: 'T'`, `unmodifiedText: 't'`, `code: 'KeyT'`,
  VK 65+) — the modifiers bit field is exactly S153's Shift=8.
- Digits and `-` type unshifted (`modifiers: 0`, 2 events per character).
- The field's DOM value is read back after EVERY keystroke — the per-keystroke
  prefix witness on the chord trace (`journey.form.chords.typing[]`,
  `valueAfter` == the chord value's prefix of length i+1, `allPrefixTrue`).
- Measured on the live receipt: 25 chord entries, `keyEventCount` 70
  (10 letters × 4 + 15 unshifted × 2), all prefixes true, the value submitted
  through the form's own button as a GET with BOTH parameters
  (`/echo?field=<nonce>&mixed=<uppercased nonce>`), witnessed server-side
  (fixture served log) and client-side (the echo page renders both values).
- The plain r52 trace into `#field` is unchanged and rides in the same
  receipt (`journey.form.typing[]`, 50 events, 25 prefix witnesses).

## The counter contract (r53 generation)

`.ufo/waves/round-53/counters/webview2-receipt-r53.mjs` re-derives BOTH traces
from the receipt's own nonce — per chord entry: `char` == the chord value's
i-th character, `shiftRide` == `/[A-Z]/.test(char)`, `modifiers` == (shiftRide
? 8 : 0), `code`/`windowsVirtualKeyCode` per character (uppercase letters
Key<X> + 65+, digits Digit<N> + 48+N unshifted, hyphen Minus + 189 unshifted),
`valueAfter` == the chord prefix — plus `keyEventCount` == 4-per-shifted +
2-per-unshifted, the two-parameter echo query, `mixedOnEchoPage`, and
`serverSawMixed`. New finding ids (each exercised by a hand-declared refusal
fixture): chords-missing, chords-value, chords-length, chords-entry,
chords-index, chords-char, chords-shift, chords-modifiers, chords-vk,
chords-code, chords-prefix, chords-value-before, chords-event-count,
chords-field-value, chords-all-prefix-flag, form-mixed-echo-value,
form-server-mixed-witness. Selftest: 85/85 exact-findings cases
(3 green incl. one declared-cne green + 82 refusals).

## Round-53 selftest layout pin (the r52 closure's routed harness note)

The counter's `--selftest` resolves its pinned driver/hostsrc five directories
above the fixtures dir (`<repoRoot>/.ufo/waves/round-53/counters/<fixtures>`).
The r53 generation CHECKS the layout expectation at selftest start: a wrong
layout dies exit 2 with the named error `selftest-repo-root-layout` before any
case runs — the r52 behavior (silent per-case `pin-file-unreadable` from a
non-repo-root layout) is gone. Measured:
`.ufo/waves/round-53/controls/selftest-layout-pin.txt` (right layout exit 0 /
85-85; wrong layout exit 2 with the named error).

## Standing host condition discovered this round: per-blob spawn verdicts on fresh csc output

A freshly `csc`-compiled host exe may be refused by `spawn` with
`UNKNOWN` (errno -4094) — the refusal follows the compiled BLOB, not the path
or the process: the same bytes fail everywhere, a different compile of the
same source may pass, and a blob that once spawned keeps spawning (verified by
direct-spawn probes; three failed compile+spawn attempts kept as named
controls, see the round-53 lesson Mistakes). The runner's documented
reuse-if-exists branch is the deterministic answer: seed the scratch with a
blob that already spawned (provenance still pinned — the receipt records
`hostExeSha256` for the blob and `hostCsSha256` for the source it was
compiled from). This is an environment-drift fact about the host, not about
WebView2: the r52 runner reproduces it with its own fresh compile too.

## Declared residuals (carried)

The journey/typing/chords fields are driver-reported; the counter binds
receipt shape and committed bytes. The re-derivation path is re-running the
committed runner (fresh nonce and fresh fixture port per invocation) and
re-compiling the host from the committed `.cs` — subject to the per-blob
spawn-verdict condition above (retry, or reuse a blob that spawned).
Ctrl/Alt/Meta chords (modifiers 2/1/4) remain unexercised — Shift only this
round, declared in the r53 SCORECARD planned section as the next residual.
