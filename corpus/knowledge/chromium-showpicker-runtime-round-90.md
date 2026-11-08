---
source: S224 (WHATWG HTML §2.3.8 — the set of comma-separated tokens), S223 (the file-upload state's `accept` attribute as a hint), S219 (`showPicker()` steps — the SecurityError and its File/Color exemption), S216 (the normative algorithm), S221/S222 (CDP Page/DOM domain, carried); receipt `corpus/evidence/round90/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round90.mjs`, pin in `.ufo/waves/round-90/freeze.txt`)
verified-at: 2026-11-08 (round 90, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-round90.mjs --lane <ABS lane> --receipt corpus/evidence/round90/chromium-showpicker/receipt.json --expect-driver-sha256 <pin> --expect-nonce <scored nonce> --expect-fixture-sha256 <receipt fixture sha256> --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json` → exit 0, 107 checks
---

# Programmatic picker generation r90 — the settle call is bound

Generation r90 of the held capability `chromium-showpicker-linux` (SCORECARD). Forty-one legs, one
fresh browser per leg, the same fixture and the same laws as r89. Round 89 left one accept-law
frontier open: "a settle-evaluate requirement on domread legs (the counter's `plan-calls` would
have to require the `window.__inputs()` evaluate)". Generation r90 closes it.

## The measured law

**A DOM read a claim binds is bound by the CALL that produced it.** Each of the four domread legs
re-reads the page at settle with a distinct expression, `window.__inputs(true)`, immediately after
the settle `window.__state()` call. The counter's `plan-calls` check now:

1. requires exactly one `Runtime.evaluate` of `window.__inputs(true)` in a domread leg's send log,
   positioned directly after the settle `window.__state()` evaluate;
2. forbids that expression in every other leg's send log;
3. includes it in the ordered plan sequence, so a leg that carries the `domRead` data without the
   call (or with the plain `window.__inputs()`) is refused with `plan-calls`.

The four legs and their bound token lists are unchanged from r89: `accept="image/*"` ←
`text/plain`; `accept="image/png, .txt"` ← `image/png`; `accept="image/png,application/pdf"` ←
`text/plain`; `accept="  image/png ,  .txt  "` ← `image/png`.

## What a receipt of this shape cannot prove

- **The distinct expression is a lane convention.** It binds the CALL the fixture made; it does
  not prove the browser parsed `accept`, and the parser normalization stays the fixture's
  (comma-split, ASCII-trimmed, ASCII-lowercased).
- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically;
  what a user's dialog offers is unmeasured.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events
  do not show whether a colour popup appeared.
- **The counter reads a receipt.** A forger who shifts every page event by a constant offset
  escapes the replay rule; the limit sentence prints the computed `absNeed` values.
- **Secure-context state is not recorded** (`http://127.0.0.1:<port>` is potentially trustworthy).
- **The delivered bytes still carry the r83 marker** under the r89 file names; the counter binds
  names, sizes, types, hex and hashes, never the content marker.

## Limits the wave established (r90)

- **`plan-calls` binds shape, not semantics.** A call with the same expression and a different
  `returnByValue` value would be refused (params are compared), but a receipt that carries both a
  forged domRead and a forged call passes; the call is one more thing a forger must forge.
- **The settle-call requirement covers the four domread legs only.** The 37 carried legs keep the
  r89 plan; their data bindings are unchanged.
- **The `domRead` data binding is unchanged**, so the r89 narrowings (fixture tokenization,
  per-leg mirrors unenforced, driver-observed settle) still apply to the data side.

## Frontier (named, not held)

- A same-element origin comparison (an input reachable from both origins via a `postMessage`
  proxy) — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.
