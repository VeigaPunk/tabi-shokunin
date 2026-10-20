VERDICT: PASS

# SrcPwCdpSession — C2 H3 source open: does a Playwright CDPSession ride the pipe (no TCP port)?

Seat `TabiR18.SrcPwCdpSession` (leaf, no delegation), 2026-10-20. Scope: open Playwright's `CDPSession`
and `BrowserContext.newCDPSession` documentation and the docs/source at the installed tag, and answer one
question for the round-18 hardened harness. Fetch method: `curl` GET only; no browser, no page JS, no
round counter. `scripts/check-sources.mjs` ran once against a throwaway fixture to validate the draft
row's shape.

## Answer (observed)

**Yes at Playwright 1.64.0 (the installed version).** `context.newCDPSession(page)` does not open a new
transport or discover an endpoint: the server-side method resolves the page's target and sends
`Target.attachToTarget` on the **browser's root CDP session** (`crBrowser.ts:606-620`), and for a
Playwright-launched Chromium that root session's transport is `PipeTransport(stdio[3], stdio[4])`
(`browserType.ts:274-278`, `supportsPipeTransport` true at `:341-343`) because Playwright's Chromium
launch defaults themselves add `--remote-debugging-pipe` (`chromium.ts:355-358`). No TCP DevTools port is
involved in that path.

**Not stated by the docs page.** The served page documents the API and "raw Chrome Devtools Protocol"
but is silent on transport; the transport facts are from the official source at tag `v1.64.0`. The draft
row keeps both in one scoped anchor and separates docs-grounded from source-grounded facts below.

## Evidence ledger (all fetched 2026-10-20, GET)

| # | Artifact | HTTP | bytes | sha256 |
|---|---|---|---|---|
| 1 | `https://playwright.dev/docs/api/class-cdpsession` (raw page, recorded body) | 200 | 54215 | `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba` |
| 2 | same, second fetch | 200 | 54215 | identical (`cmp` exit 0) |
| 3 | page decoded `html-text` / normalized | — | 4544 chars / 3362 chars | `3d3655375d8ad0d80b5a600a4d2309ce34d844e5cc506cc4a2405d1369719cb3` / `6a2f842363abe25da5ff9ecaa2b5834106e7d78ea2eb267dec0d8e4875f238c7` |
| 4 | `https://playwright.dev/docs/api/class-browsercontext` (raw page) | 200 | 300171 | `6769114c6e9a96a059a6b0f84ed2497cf6e3740d2360899012cb431851f210d3` |
| 5 | `docs/src/api/class-cdpsession.md` @ v1.64.0 | 200 | 5355 | `d6e61eb3a96d3aaa4a9ead1112d15af88131f3eb2b1ae0fe2b621ecdf94c95c7` |
| 6 | same @ v1.64.1 (current stable) | 200 | 5355 | identical — sentence unchanged across the bump |
| 7 | `docs/src/api/class-browsercontext.md` @ v1.64.0 | 200 | 59594 | `09cccad9943cae25b9e3db258fb01ba90f4c381c6972370aa9420ae907772e2e` |
| 8 | `packages/playwright-core/src/server/chromium/chromium.ts` @ v1.64.0 | 200 | 24158 | `9fe3ffe11e57d54564a9ea360efc6f39fa8c9395c338299844acb917f2b3dd47` |
| 9 | `packages/playwright-core/src/server/browserType.ts` @ v1.64.0 | 200 | 17388 | `f63faa5ac82e65629520d25a4c86496aafe9bffc49a5ed6242f885a700cd008e` |
| 10 | `packages/playwright-core/src/server/chromium/crBrowser.ts` @ v1.64.0 | 200 | 24665 | `d8362d85b9a11ff6503e900df3401bc77fb2059286c75d59df648fdb656c7a96` |
| 11 | installed `playwright/package.json` + `playwright-core/lib/coreBundle.js` | — | 3,584,989 B bundle | version `1.64.0`; bundle `2325ca4c1c83070e89dc49fb82525508f0a68e0cf12e2a624277968da216b7e0` |
| 12 | GitHub refs API | 200 | — | v1.64.0 tag → commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd`; v1.64.1 → `cfe490d941f992655948eee8fd4fd94e1c4234bf`; latest release v1.64.1 (2026-10-14) |

Three fetches were byte-identical (`x-origin-cache: HIT`, `cache-control: max-age=600`) — an observation
of this CDN on this date, not a promise that the page is stable. Its
`last-modified: Tue, 20 Oct 2026 16:46:38 GMT` is the CDN build time, not a content date;
the pinned revision used for the anchor is tag `v1.64.0`, which matches the installed runtime version.

## Verbatim quote and normalizer output

Quote (served page §CDPSession first paragraph; **19 words**):

> The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method.

`node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body /tmp/pw-cdpsession.html --quote 'The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method.'`

```json
{"found":true,"offset":1054,"normalizedLength":3362,"window":"stCase TestError TestResult TestStep Experimental Android AndroidDevice AndroidInput AndroidSocket AndroidWebView Electron ElectronApplication API reference Classes CDPSession On this page CDPSession The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method. protocol events can be subscribed to with session.on method. Useful links: Documentation on DevTools Protocol can be found here: DevTools Protocol Viewer . Getting Started with DevTools Protocol: htt"}
```

The raw docs source carries the sentence with backticks and a bullet boundary — checked separately:
`--normalize-only --decode none --body /tmp/pw-docs-cdpsession.md --quote 'The \`CDPSession\` instances are used to talk raw Chrome Devtools Protocol:'`
→ `{"found":true,"offset":34,"normalizedLength":5287,...}`.

Second (supporting) check, BrowserContext page:
`CDP sessions are only supported on Chromium-based browsers.` →
`{"found":true,"offset":11293,"normalizedLength":38053,...}`.

## Facts, split by authority

Docs-grounded:
- F1 `CDPSession` talks raw Chrome DevTools Protocol; `session.send` for methods, `session.on` for events
  (`class-cdpsession.md:4-6`; `close`/`event` events added v1.59 at lines 70-92).
- F2 `BrowserContext.newCDPSession` takes only a `Page` or `Frame`, returns the session, Chromium-only
  (`class-browsercontext.md:1008-1023`). No endpoint/URL/port argument exists.
- F3 Documented usage obtains it from a live page: `const client = await page.context().newCDPSession(page);`
  (`class-cdpsession.md:15`).

Source-grounded (Playwright 1.64.0):
- F4 Chromium `defaultArgs` pushes `--remote-debugging-pipe` (`chromium.ts:355-358`). The only
  `--remote-debugging-port=0` in that file is `launchWithSeleniumHub` (`:256`), not the local launch path.
- F5 Transport selection: pipe whenever `supportsPipeTransport(options)` (base true, `browserType.ts:341-343`),
  `new PipeTransport(stdio[3], stdio[4])` at `browserType.ts:274-278`.
- F6 `newCDPSession(page)` → `rootSession.attachToTarget(targetId)` (`crBrowser.ts:606-620`); client sends
  over Playwright's channel (`_channel.newCDPSession`, installed bundle offset 3018285). No second socket.
- F7 A `Frame` without its own session throws
  `This frame does not have a separate CDP session, it is a part of the parent frame's session`
  (`crBrowser.ts:610-614`), so pass the `Page` and target iframes by CDP `frameId` (consistent with S042 F12).

## Draft registry row (11 cells, no `|` inside cells; id S059 proposed — L1 assigns)

| S059 | CDPSession — Playwright — https://playwright.dev/docs/api/class-cdpsession | docs | A | Playwright 1.64.0 CDPSession creation from a live page and the transport that carries it for a Playwright-launched Chromium | served page §CDPSession and §browser-context-new-cdp-session fetched 2026-10-20; docs source tag v1.64.0 (commit 606ecd8b34bac100db32561b6278ffd76e5eb3cd) docs/src/api/class-cdpsession.md:4-6 and docs/src/api/class-browsercontext.md:1008-1023; Playwright 1.64.0 server source chromium.ts:355-358, browserType.ts:274-278 and 341-343, chromium/crBrowser.ts:606-620 | A CDPSession delivers raw CDP for a live page over Playwright's existing browser connection, which for a launched Chromium is the stdio pipe, so the harness invokes WebMCP with no DevTools TCP port | queued | 2026-10-20 | on-release | — |

Structural check on that line: `awk -F'|' 'NF!=13'` → 0 malformed; fields = leading empty, 11 cells,
trailing empty. Real parser on a minimal fixture root (`node scripts/check-sources.mjs --root /tmp/src-check2 --file corpus/SOURCES.md`)
→ `SOURCES_GATE verdict=clean rows=1 tiers=A:1,B:0,C:0 status=queued:1,mined:0,rejected:0 findings=0`,
exit 0. Tier A is scoped: official reference docs + official source at the installed tag; it is
not a claim that Playwright always uses a pipe (`connectOverCDP` is a WebSocket by definition), not the
CDP protocol's support posture (S002), and not Chromium's own switch semantics (S001/S004).

## Gate entry

| Row | URL | Access | Quote (verbatim, ≤25 words) | Location | sha256 | Check |
|---|---|---|---|---|---|---|
| S059 (new) | https://playwright.dev/docs/api/class-cdpsession | 2026-10-20 | "The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method." (19 words) | served page §CDPSession first paragraph; normalized offset 1054 of 3362. Raw docs source `docs/src/api/class-cdpsession.md:4-5` @ v1.64.0 (commit 606ecd8b…), byte-identical @ v1.64.1 | raw page `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba` (54,215 B); docs source `d6e61eb3a96d3aaa4a9ead1112d15af88131f3eb2b1ae0fe2b621ecdf94c95c7` (5,355 B) | normalize-only found=true; repeat fetches identical sha |

Supporting anchor (not the Gate quote): the method page
`https://playwright.dev/docs/api/class-browsercontext#browser-context-new-cdp-session` served 2026-10-20
(`6769114c…10d3`) states "CDP sessions are only supported on Chromium-based browsers."; docs source
`class-browsercontext.md:1008-1023` (`09cccad9…2e2e`).

## PLAN §C2 check — no contradiction, two precisions

PLAN H3 wants `--remote-debugging-port` absent and CDP over Playwright's pipe via
`context.newCDPSession(page)`; F1-F6 support exactly that design.

1. Playwright adds `--remote-debugging-pipe` itself (`chromium.ts:358`); the harness does not pass it
   (`grep remote-debugging-pipe scripts/webmcp-invoke-round17.mjs` → no matches). The port comes solely
   from the harness: `DEVTOOLS_PORT_ARG` at `scripts/webmcp-invoke-round17.mjs:91`, used at `:599` and
   `:2049`; the client is `waitDevToolsPort` polling `DevToolsActivePort` (`:471-492`) plus
   `new WebSocket(wsUrl)` (`:508`). The H3 repair is deleting that constant/poll and calling
   `context.newCDPSession(page)`; `session.send` replaces the outbound send and `session.on('event')`
   (v1.59) can keep the verbatim inbound-frame record.
2. `newCDPSession` must get the `Page` (or a frame that owns a session); a plain iframe throws
   (`crBrowser.ts:610-614`). Same-target iframes stay addressable by `frameId` (S042 F12).

The round-18 harness is the C2Harness seat's file and was being edited during this read; no state claim
about it is made here. The red reference is the byte-frozen round-17 harness, whose lines above are
stable. Handoff: delete `DEVTOOLS_PORT_ARG`, the `waitDevToolsPort` poll (`:471-492`) and the raw socket
(`:508`), then obtain the session with `context.newCDPSession(page)` (`session.send` for outbound,
`session.on('event')` for inbound frames).

## Remaining unknowns

- Pipe transport holds for a Playwright-*launched* Chromium; `connectOverCDP`/remote-grid paths use a
  WebSocket (the Selenium Hub path at `chromium.ts:256` adds a port). The harness launches, so the row
  is scoped to that.
- The docs do not document `DevToolsActivePort` absence; that remains a counter observation (`h3`), not a
  documented fact.
- The served page tracks `docs-default-stable`; the quote survives the 1.64.0→1.64.1 docs-source bump, but
  a future stable bump can change the page — `on-release` is the recheck cadence.
- `session.send` error/rejection shape is not documented beyond `Promise<Object>`; not claimed.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcPwCdpSession.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcPwCdpSession.md`

No tool installed or upgraded (nothing needed). Temporary fetch bodies were removed from `/tmp` after
digests were recorded.
