source: S152 — Chrome Headless mode docs, https://developer.chrome.com/docs/chromium/headless
  (also S153 — CDP browser_protocol.json, for the Page.captureScreenshot contract; lane rows
  S001/S002 for the remote-debugging profile boundary and the /json endpoint contract)
verified-at: 2026-10-31 — opened copies sha256 be71bfe0ece5e3089c037e1eb372ad9146282300e9ef6aed239235c2b8715aad
  (.ufo/waves/round-44/sources/headless-docs.html, 111,098 bytes) and
  f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2
  (.ufo/waves/round-44/sources/browser_protocol.json, 1,421,620 bytes)
recheck: 90d or on a Chrome major bump on the host — re-open both sources, re-verify the sha256s,
  re-run the C2 counting command (fresh nonce) and the receipt counter, and re-run the C3
  supervisor honest/selfauth/selftest receipts
---

# Chrome CDP loopback on the Windows host (round 44)

## Claim

A Chromium-class browser can be driven over raw CDP on this Windows host with no dependencies
beyond Node's stdlib: `--headless=new` (the unified mode — S152's line "Chrome now has unified
Headless and headful modes."), `--remote-debugging-port=0` with a throwaway `--user-data-dir`
(S001: branded Chrome ≥136 ignores remote-debugging switches on the default profile dir), the
DevTools WebSocket endpoint taken from the stderr line and verified `127.0.0.1`-bound, target
creation via `PUT /json/new` (S002), DOM extraction via `Runtime.evaluate`, and page capture
via `Page.captureScreenshot` — "Capture page screenshot.", returns `data`, format enum
jpeg/png/webp defaulting to png (S153). Demonstrated at round 44: `scripts/chrome-cdp-loopback-round44.mjs`
exit 0 against branded Chrome 156.0.8078.74, receipt + screenshot committed at
`corpus/evidence/round44/chrome-cdp/`, counter `.ufo/waves/round-44/counters/chrome-cdp-receipt-r44.mjs`
clean on the committed bytes, and a reproduction run with fresh per-invocation nonces.

## Decision table — host surfaces (probed 2026-10-31, controls/host-probe.txt)

| Surface | State on this host | Consequence |
|---|---|---|
| Google Chrome 156.0.8078.74 | present (`C:/Program Files/Google/Chrome/Application/chrome.exe`) | the C2 capability runs against it |
| Microsoft Edge | present (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) | Chromium fallback in the runner's candidate list |
| Firefox / geckodriver / Playwright | absent (no binary, no `ms-playwright` cache, no `~/.local/opt`) | the r35-r43 Firefox chain cannot run here; not re-attempted |
| kimi-webbridge plugin | absent (`~/.kimi-code/plugins/managed/kimi-webbridge` missing) | PROVINCE corrected this round |
| CDP bridge on 127.0.0.1:9222 | nothing listening | lane launches its own browser with an ephemeral loopback port |

## Runbook (what the runner does, in order)

1. Find a browser from the candidate list; make a throwaway profile dir under `--scratch`
   (never the default profile — S001).
2. Start a loopback fixture HTTP server on `127.0.0.1:0` serving a deterministic page whose
   `<meta name="fixture-nonce">` carries a per-invocation 64-hex nonce.
3. Spawn `--headless=new --remote-debugging-port=0 --user-data-dir=<profile>` plus the
   no-background-traffic flag set; read the `DevTools listening on ws://127.0.0.1:<port>/…`
   line from stderr (30 s timeout); refuse non-loopback endpoints.
4. `GET /json/version` (identity), `PUT /json/new?<fixture>` (target), drive `Runtime.evaluate`
   until `document.readyState === 'complete'`, extract `{title, nonce, markerFound, textHead}`
   from the live DOM, then `Page.captureScreenshot {format: 'png'}`.
5. Teardown: close the target, `taskkill /PID <pid> /T /F`, wait for the exit event (attached at
   spawn — see Mistakes), close the fixture server; write the receipt atomically with
   `ok` computed from title + marker + invocation binding + PNG magic + termination.

## Invocation binding and declared residual

The receipt binds the runner's own sha256 (also pinned in the r44 claims freeze and inside the
counter), fresh nonces, the fixture server's nonce against the nonce extracted from the LIVE DOM
(the page cannot carry any other invocation's nonce), loopback hosts, and the screenshot bytes.
It does not authenticate its own provenance: an in-model author could write a fabricated receipt,
so the Chrome-ness re-derivation path is an independent re-run of the committed runner — the
fixture nonce differs every invocation (demonstrated: committed run `96316efa…`, repro
`7fd3c702…`). This is the same standard the round-13 and round-35 capability demonstrations were
admitted under. No zero-egress claim is made; no forgery-resistance claim is made (that
instrument class and its limits live in `receipt-authenticity-signing-round-43.md`).

## Windows-specific findings

- The exit event must be attached at spawn: attaching it after `kill()` loses the
  already-terminated process and `chromeTerminated` reads false (round-44 Mistakes 1).
- `taskkill /PID <pid> /T /F` is the reliable tree kill; the failed run left no orphans
  (checked via `Get-CimInstance Win32_Process` on the profile-dir token).
- Headless rendering is deterministic here: two independent runs produced byte-identical
  screenshots (same sha256 `4ee1806f…`) while every nonce differed — content identity must come
  from nonces, not from screenshot bytes.
