# WebView2 multi-step journey — A → B → C over anchor clicks with CDP history evidence (round 50)

Scope: PROVINCE.md (CDP session discipline + dynamic-page evidence patterns) on
the third declared Chromium-class surface (the WebView2 runtime through the
committed COM host). Build on: `webview2-cdp-loopback-round-48.md` (the host
route, S158/S159), its round-49 append (the resolve-at-launch path contract,
S160) and `webview2-http-cross-page-nav-windows` (r49, single-hop). Sources:
S161 (this round) grounds the two history primitives; the host route and COM
ABI are held ground.

## 1. The measured surface model (observed 2026-11-01, runtime 156.0.4314.58)

- The initial `data:` page the host loads OCCUPIES history slot 0. After the
  A → B → C journey the entries read `[data:, /a.html, /b.html, /c.html]` —
  `Page.getNavigationHistory` returns `entriesLength: 4, currentIndex: 3` at
  C. The designed-but-wrong model (entries `[a,b,c]`, length 3) was the round's
  amendment 2: the first `--journey` live run read `entry[1]` (= `/a.html`),
  waited for `/b.html` and exited 1 `journey-back-not-ready` with the full
  measured history block recorded (`controls/c2-journey-history-model-red.json`
  + `controls/c2-model-red-pngs/`).
- `Page.navigateToHistoryEntry {entryId}` performs a real cross-document back
  hop: after it, `getNavigationHistory` still returns 4 entries with
  `currentIndex: 2` (the forward entry /c.html is RETAINED, not pruned), the
  URL is `/b.html`, and the fixture page's own title and nonce marker are
  live again.
- Anchor clicks (`Runtime.evaluate` of `el.click()`) remain the only in-page
  transition mechanism between fixture pages (the r49 model, unchanged).
- The invocation-bound nonce survives navigation when it RIDES ON THE PAGES:
  the r50 fixture prints it into a `#nonce` marker on every page; the runner
  checks `nonceOnPageA` after the first hop. A nonce that lives only in the
  initial `data:` page title cannot be re-read after `Page.navigate` leaves
  it (the r49 single-hop model never needed this).
- Runtime drift (r49 closure D3, measured): WebView2 auto-update REMOVED
  fixed-version folder 156.0.4314.50 after round 49; the host now offers
  155.0.4283.62 / 156.0.4314.58. The r50 runner takes `--runtime` with NO
  default (exit 2 without it), and the r50 counter grades a missing pinned
  runtime folder as the DECLARED could-not-evaluate class
  `runtime-pin-host-drift` (disclosed under `couldNotEvaluate`, never a
  finding) while a folder present WITHOUT its exe stays a hard finding.

## 2. The journey receipt contract (what the r50 counter pins)

`schema: tabi-webview2-cdp-r50`; four steps with legs `Page.navigate`
(/a.html), `anchor-click` (/b.html), `anchor-click` (/c.html),
`navigateToHistoryEntry` (/b.html); same-port loopback origins; per-step
title + PNG pins (four committed PNGs, the main shot = the FINAL step);
`journey.history` {entriesLength 4, currentIndex 3, urls data:,/a.html,
/b.html,/c.html, readAt /c.html}; `journey.backLeg` {mechanism
navigateToHistoryEntry, targetIndex 2, urlAfter /b.html, entriesLengthAfter 4,
currentIndexAfter 2}; `nonceOnPageA: true`; keyed teardown sweep 0; driver +
host-source digests re-hashed against committed files. The counter's 13-case
fixture selftest asserts exact findings per refusal AND the declared-cne rule
(non-empty iff the pinned runtime folder is absent, only ever
`runtime-pin-host-drift`).

## 3. Declared residuals

- The journey fields are driver-reported; the driver bytes are sha-pinned in
  the receipt and re-hashed by the counter; a hand-forged receipt is outside
  any shape counter's reach — the re-derivation path is re-running the
  committed runner (fresh nonce and fresh fixture port per invocation).
- When the pinned runtime folder is absent, the runtime-existence leg is
  could-not-evaluate: a receipt naming a never-installed runtime version is
  refused only by the shape and identity-consistency checks, not by host bytes.
- Form interaction (fill + submit) on the fixture remains unexercised on this
  surface (the r49 planned list's second residual — still open).

## 4. Pointers

- Runner: `scripts/webview2-cdp-loopback-round50.mjs` (`--journey`,
  `--path-selftest` 6/6; digest pinned in `.ufo/waves/round-50/claims.json`
  amendments).
- Counter: `.ufo/waves/round-50/counters/webview2-receipt-r50.mjs`
  (`--selftest`, 13 cases; draft-counter red 10/13 over the final fixtures is
  committed at `controls/c3-counter-selftest-draft-counter-red.json`).
- Evidence: `corpus/evidence/round50/webview2-journey/` (receipt + 4 PNGs);
  counter green 0 findings (`measure/c2-counter-green-at-data.json`);
  the r49 counter refuses the r50 receipt with 4 findings
  (`measure/c2-r49counter-refuses-r50.json`).
- Sources: S153 re-opened byte-identical this round (`corpus/SOURCES.md`), staged raw bytes at
  `.ufo/waves/round-50/sources/browser-protocol.json`.
