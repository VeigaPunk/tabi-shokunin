---
source: S225 (WHATWG HTML §9.3 — `postMessage()` target origin and the message event's origin), S226 (WHATWG HTML §6.4 — the transient activation duration and consuming APIs), S219 (the `showPicker()` steps and the File/Color exemption), S216 (the normative `showPicker()` algorithm), S221/S222 (CDP Page/DOM, carried); receipt `corpus/evidence/round91/chromium-showpicker-proxy/receipt.json` (driver `scripts/chrome-cdp-showpicker-proxy-round91.mjs`, pin in `.ufo/waves/round-91/freeze.txt`)
verified-at: 2026-11-08 (round 91, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-proxy-round91.mjs --lane <ABS lane> --receipt corpus/evidence/round91/chromium-showpicker-proxy/receipt.json --expect-driver-sha256 <pin> --expect-nonce <scored nonce> --expect-parent-sha256 <pin> --expect-same-sha256 <pin> --expect-child-sha256 <pin> --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json` → exit 0, 30 checks
---

# The postMessage proxy capability r91 — same element, two origins

Capability `chromium-showpicker-proxy-linux` (new, first-working round 91). Round 90 named this
frontier and did not hold it: "a same-element origin comparison (an input reachable from both
origins via a `postMessage` proxy) — not constructible in the current loopback fixture"
(`chromium-showpicker-runtime-round-90.md` §Frontier). Generation r91 constructs it.

## The fixture

One parent document at `http://127.0.0.1:<http>` carries two iframes: `#so` at `/same.html`
(the same origin) and `#xo` at `http://127.0.0.1:<child>/child.html` (a cross origin). Both child
documents carry the SAME element shapes — `#s` (`type=file`), `#dt` (`type=date`), `#co`
(`type=color`) — plus `#cpad` (a neutral activation pad) and a `message` handler that accepts only
`e.origin === the parent origin it was served from`, calls `showPicker()` on the named element, and
replies through `e.source.postMessage(result, e.origin)` (S225: the target-origin discipline; the
receiver reads `event.origin`/`event.source`). Fifteen legs, one fresh browser per leg.

## The measured laws

1. **No activation in either window.** The proxy call on `#s` throws `NotAllowedError` ("requires a
   user gesture") and opens no chooser, in BOTH iframes: `sp91-so-proxy-noact`,
   `sp91-xo-proxy-file-noact`.
2. **A parent click activates the same-origin child, not the cross-origin child.** After a real
   click in the parent document: the same-origin child's direct call from the parent document and
   its proxy call both return `undefined` and open exactly one `Page.fileChooserOpened` owned by
   the same-origin frame (`sp91-so-direct-parentact`, `sp91-so-proxy-childact` are the child-click
   arms; the parent-click arm is `sp91-so-direct-parentact`); the cross-origin child's proxy call
   with the SAME parent click still throws `NotAllowedError` and its child window reports
   `isActive:false` (`sp91-xo-proxy-file-parentact`). This is the same-element origin comparison:
   one click, one element shape, two origins, two outcomes.
3. **A click inside the cross-origin child opens its picker.** Its proxy file call returns
   `undefined` and opens exactly one chooser owned by the cross-origin frame
   (`sp91-xo-proxy-file-childact`); `DOM.setFileInputFiles` answered on that chooser delivers
   `tabi-r91-answer.txt` (22 B, sha256 `16d8fb2dd696…`) to the CHILD input while the parent `#ps`
   stays empty (`sp91-xo-proxy-file-answer`).
4. **The File/Color exemption is measured through the proxy.** The cross-origin proxy call on
   `<input type=date>` throws `SecurityError` in BOTH activation states and opens nothing
   (`sp91-xo-proxy-date-noact`, `sp91-xo-proxy-date-childact`); the colour input returns
   `undefined` and opens no FILE chooser (`sp91-xo-proxy-color-childact`) — the exemption does not
   extend to date (S219).
5. **The parent cannot reach the cross-origin child directly.** `contentDocument` is `null`,
   `contentWindow.document` throws `SecurityError`, and a `getElementById` on the null document is a
   `TypeError` (`sp91-xo-direct-access`). The proxy is the only path.
6. **Transient activation is consumed by a successful call and survives a throwing one.** The
   post-leg `isActive` reads: `false` on every leg whose call returned `undefined`, `true` on the
   two legs whose call threw with the activation present (`sp91-xo-proxy-file-parentact` parent,
   `sp91-xo-proxy-date-childact` both windows). S226 grounds the few-second duration and the
   consuming APIs; round 90's answer-law recorded the same consumption on the direct path.

## What the receipt cannot prove

- The proxy is a lane fixture convention: the child accepts `e.origin === its served parent
  origin`; the browser's own origin check is measured only through that fixture.
- The native pickers themselves are unmeasured. A date/colour "success" is the absence of a
  `Page.fileChooserOpened` event, not a UI observation; the colour popup is still a frontier.
- The answer is programmatic (`DOM.setFileInputFiles`); a user's dialog is unmeasured.
- The activation states are the driver's post-leg reads, not a per-millisecond trace.
- The counter reads a receipt: a forger who rewrites every identity field and regenerates all
  synthetic launch tokens/devtools ids is outside the replay rule (the limit is printed by the
  counter).

## Frontier (named, not held)

- The colour popup itself (UI-side probe or a source-side reading of the colour chooser path).
- A second browser build (Edge/WebView2) for the proxy capability; this round pins Chromium
  155.0.8059.84 only.
- Real-site cross-origin frames (operator approval absent; loopback only).
