source: S154 — Microsoft Edge DevTools Protocol, https://learn.microsoft.com/en-us/microsoft-edge/devtools/protocol
  (riding the round-44 capability ground: S152 headless mode, S153 Page.captureScreenshot,
  S001/S002 profile boundary and /json endpoint contract)
verified-at: 2026-10-31 — opened copy sha256 ab6c14c535b5ccf0be9ddeea2796e7bc6794dfb285305121fb4514f8f5b58626
  (.ufo/waves/round-45/sources/edge-devtools-protocol.html, 57,251 bytes); located quote verified
  verbatim, 13 words, 1 hit in the raw bytes
recheck: 90d or on an Edge major bump on the host — re-open S154, re-verify the sha256, re-run the
  C2 counting command with `--browser edge` (fresh nonce) and the r45 counter, and re-run the C1
  checker and C3 meter at the round-45 measured revision
---

# Edge as a second declared Chromium-class CDP surface on the Windows host (round 45)

## Claim

Microsoft Edge on this host speaks the Chrome DevTools Protocol (S154: "The Microsoft Edge
DevTools Protocol matches the APIs of the Chrome DevTools Protocol.") and can be driven through
the same discipline as round 44's Chrome run — with one host-specific difference: **branded Edge
prints no `DevTools listening on` line on stderr**, so the endpoint must be discovered from the
throwaway profile's `DevToolsActivePort` file (line 1: ephemeral port, line 2: `/devtools/browser/…`
path), then confirmed by a live `/json/version` read before use. Demonstrated at round 45:
`scripts/chrome-cdp-loopback-round45.mjs --browser edge` exit 0 against Edge 156.0.4314.50
(`Edg/156.0.4314.50`, Protocol-Version 1.3), receipt + screenshot committed at
`corpus/evidence/round45/edge-cdp/`, counter `.ufo/waves/round-45/counters/chrome-cdp-receipt-r45.mjs`
clean on the committed bytes, a reproduction run with fresh nonces and a byte-identical screenshot,
and a cross-refusal control: the same counter refuses the round-44 Chrome receipt (schema,
declared-surface, runner-pin, discovery-via, page-title findings) — the new surface never
loosened the old one.

## Decision table — declared-surface binding (probed 2026-10-31)

| Concern | chrome | edge |
|---|---|---|
| installed binary | `C:/Program Files/Google/Chrome/Application/chrome.exe` | `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` |
| `/json/version` Browser grammar | `Chrome/156.0.8078.74` | `Edg/156.0.4314.50` (the `Edg/` prefix — a `Chrome/` string under a declared edge run is a relabel and is refused) |
| endpoint discovery leg | stderr `DevTools listening on ws://…` | `DevToolsActivePort` file in the throwaway profile; stderr is SILENT |
| discovery confirmation | the ws host is regex-verified loopback | port read from the file, bound to `127.0.0.1`, accepted only together with a successful `/json/version` answer (a stale file cannot stand in for a socket) |
| throwaway profile dir | `<scratch>/chrome-profile` | `<scratch>/edge-profile` (per-surface name, counter-bound) |
| receipt field | `discoveryVia: "stderr"` | `discoveryVia: "devtools-active-port"` + `devtoolsBrowserPath: /devtools/browser/…` |

## Runbook deltas from round 44

- Declare the surface per invocation: `--browser chrome|edge` is mandatory; the candidate list,
  profile name, identity grammar and counter clauses all key off it. No default — an undeclared
  surface dies at the usage check.
- Launch flags are unchanged from r44 (same `--headless=new`, `--remote-debugging-port=0`,
  throwaway `--user-data-dir`, background-network suppressions; S154's own launch contract is
  `msedge.exe --remote-debugging-port=<port>` with a distinct user profile).
- Teardown is unchanged (exit listener attached at spawn, `taskkill /PID <pid> /T /F` tree
  fallback, `chromeTerminated` recorded) — never kill Edge by image name: the operator's own
  Edge session runs under the same image; only the spawned child PID tree is killed.
- Rendering determinism held on Edge too: two independent runs produced byte-identical PNGs
  (8,194 B, sha256 `7dfce09d…`) while every nonce differed.

## Falsifiers

- A receipt whose `browser` string does not match its `declaredSurface` grammar (`Chrome/` vs
  `Edg/`) is refused with `surface-identity-mismatch`.
- A `devtools-active-port` receipt without a `/devtools/browser/`-shaped path is refused.
- The r44 Chrome receipt under the r45 counter is refused (5 findings; committed control
  `c2-counter-refuses-r44-receipt.json`).
- Counter bytes and runner digest are pinned in `.ufo/waves/round-45/claims.json` (frozen before
  data); re-derive by re-running the runner — the fixture nonce differs every invocation.
