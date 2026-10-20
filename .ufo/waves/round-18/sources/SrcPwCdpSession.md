VERDICT: PASS

# SrcPwCdpSession — does a Playwright CDPSession run over the browser pipe (no TCP port)? (round 18, C2 H3)

Seat `TabiR18.SrcPwCdpSession` (leaf; no delegation). Access date **2026-10-20** for every fetch. Method:
`curl` GET only (docs pages, `raw.githubusercontent.com` at tag `v1.64.0`/`v1.64.1`, GitHub refs API),
plus read-only inspection of the **installed** `playwright-core` 1.64.0 bundle on this host. No browser
launched, no page JavaScript executed, no REA device, no round counter run; the byte-frozen
`scripts/check-sources.mjs` was run once against a throwaway fixture to validate the draft row's shape
(§6). This file drafts one row and one Gate entry for the L1 to place; it edits no shared registry.

Question: Playwright's `BrowserContext.newCDPSession(page)` returns a `CDPSession` that talks raw CDP —
is that CDP carried over Playwright's own browser pipe (so a harness needs no `--remote-debugging-port`
and no TCP DevTools endpoint)?

Short answer: **yes, at the installed Playwright 1.64.0** — `newCDPSession` asks the browser's root CDP
session to `Target.attachToTarget`, and for a Playwright-launched Chromium that root session's transport
is `PipeTransport` over the child's stdio fds 3/4, because Playwright's Chromium launch defaults add
`--remote-debugging-pipe` itself. The served docs page documents the API and the raw-protocol contract;
it does **not** state the transport. The transport statement comes from the official source at the
installed tag, cited in the same row anchor (separated as observed fact below).

## 1. Fetch ledger (curl, GET, 2026-10-20)

| # | URL | HTTP | body bytes | sha256 of fetched body | note |
|---|---|---|---|---|---|
| 1 | https://playwright.dev/docs/api/class-cdpsession | 200 | 54215 | `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba` | recorded body; `last-modified: Tue, 20 Oct 2026 16:46:38 GMT`, `etag: "6ad79aee-d3c7"`, `cache-control: max-age=600`, `x-origin-cache: HIT`, meta `docusaurus_tag=docs-default-stable` |
| 2 | same | 200 | 54215 | `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba` | byte-identical (`cmp` exit 0) — reproducible |
| 3 | https://playwright.dev/docs/api/class-browsercontext | 200 | 300171 | `6769114c6e9a96a059a6b0f84ed2497cf6e3740d2360899012cb431851f210d3` | one fetch; §`browser-context-new-cdp-session` present in the served DOM (`id=browser-context-new-cdp-session`) |
| 4 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-cdpsession.md | 200 | 5355 | `d6e61eb3a96d3aaa4a9ead1112d15af88131f3eb2b1ae0fe2b621ecdf94c95c7` | docs source at the installed version's tag |
| 5 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.1/docs/src/api/class-cdpsession.md | 200 | 5355 | `d6e61eb3a96d3aaa4a9ead1112d15af88131f3eb2b1ae0fe2b621ecdf94c95c7` | identical to #4 — the quoted sentence did not change between 1.64.0 and the current stable 1.64.1 |
| 6 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-browsercontext.md | 200 | 59594 | `09cccad9943cae25b9e3db258fb01ba90f4c381c6972370aa9420ae907772e2e` | docs source for the method anchor |
| 7 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/chromium/chromium.ts | 200 | 24158 | `9fe3ffe11e57d54564a9ea360efc6f39fa8c9395c338299844acb917f2b3dd47` | launch defaults |
| 8 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/browserType.ts | 200 | 17388 | `f63faa5ac82e65629520d25a4c86496aafe9bffc49a5ed6242f885a700cd008e` | transport selection |
| 9 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/chromium/crBrowser.ts | 200 | 24665 | `d8362d85b9a11ff6503e900df3401bc77fb2059286c75d59df648fdb656c7a96` | `newCDPSession` server path |
| 10 | https://api.github.com/repos/microsoft/playwright/git/ref/tags/v1.64.0 | 200 | — | — | `refs/tags/v1.64.0` → commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd`; `v1.64.1` → `cfe490d941f992655948eee8fd4fd94e1c4234bf`; releases API: v1.64.1 published 2026-10-14, v1.64.0 2026-10-07 |

Installed runtime inspected read-only:
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/package.json`
declares `1.64.0`; its bundled
`.../playwright/node_modules/playwright-core/lib/coreBundle.js` is 3,584,989 B,
sha256 `2325ca4c1c83070e89dc49fb82525508f0a68e0cf12e2a624277968da216b7e0`. Byte offsets below are for
that file (a one-line bundle); the line addresses in §5 are the tag sources, which are the citable form.

## 2. Opened source

| Field | Value |
|---|---|
| canonical URL | https://playwright.dev/docs/api/class-cdpsession |
| method anchor | https://playwright.dev/docs/api/class-browsercontext#browser-context-new-cdp-session |
| revision | docs source at tag `v1.64.0` (commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd`); the same quote is byte-identical at `v1.64.1` (commit `cfe490d941f992655948eee8fd4fd94e1c4234bf`) |
| access date | 2026-10-20 |
| raw-fetch sha256 (served page, 54,215 B) | `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba` (three fetches identical) |
| decoded `html-text` sha256 (4,544 chars) | `3d3655375d8ad0d80b5a600a4d2309ce34d844e5cc506cc4a2405d1369719cb3` |
| normalized sha256 (3,362 chars; same normalizer as the recheck tool) | `6a2f842363abe25da5ff9ecaa2b5834106e7d78ea2eb267dec0d8e4875f238c7` |
| docs-source sha256 | class-cdpsession.md `d6e61eb3a96d3aaa4a9ead1112d15af88131f3eb2b1ae0fe2b621ecdf94c95c7`; class-browsercontext.md `09cccad9943cae25b9e3db258fb01ba90f4c381c6972370aa9420ae907772e2e` |
| anchor | served page §CDPSession, first paragraph (normalized offset 1054 of 3362) and §`browser-context-new-cdp-session` (normalized offset 11293 of 38053); docs source `docs/src/api/class-cdpsession.md:4-6` and `docs/src/api/class-browsercontext.md:1008-1023` |
| kind / tier / recheck | `docs` / **A**, scoped to the Playwright 1.64.0 CDPSession creation contract and its launched-Chromium transport / `on-release` |

Decode mode is `html-text` (no base64 body in this open), so there is no base64-decoded digest.

## 3. Verbatim quote and normalizer check

**VERBATIM quote** — served page §CDPSession, first paragraph; 19 words:

> The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method.

The raw docs source carries the same sentence with backticks and splits it over a bullet boundary
(`class-cdpsession.md:4-5`: ``The `CDPSession` instances are used to talk raw Chrome Devtools Protocol:``
then ``* protocol methods can be called with `session.send` method.``). The rendered page is the form the
quote is checked against; the source form was checked separately (the 11-word first sentence is found at
normalized offset 34 of the 5,287-char markdown).

`node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body /tmp/pw-cdpsession.html --quote '<quote above>'`:

```json
{"found":true,"offset":1054,"normalizedLength":3362,"window":"stCase TestError TestResult TestStep Experimental Android AndroidDevice AndroidInput AndroidSocket AndroidWebView Electron ElectronApplication API reference Classes CDPSession On this page CDPSession The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method. protocol events can be subscribed to with session.on method. Useful links: Documentation on DevTools Protocol can be found here: DevTools Protocol Viewer . Getting Started with DevTools Protocol: htt"}
```

Second, supporting check on the method page
`--decode html-text --body /tmp/pw-browsercontext.html` with
`CDP sessions are only supported on Chromium-based browsers.`:

```json
{"found":true,"offset":11293,"normalizedLength":38053,"window":" the browser context is in the process of closing or has already been closed. Usage browserContext . isClosed ( ) ; Returns boolean # newCDPSession ​ Added in: v1.11 browserContext.newCDPSession note CDP sessions are only supported on Chromium-based browsers. Returns the newly created session. Usage await browserContext . newCDPSession ( page ) ; Arguments page Page | Frame # Target to create new session for. For backwards-compatibility, this parameter is"}
```

## 4. What it teaches the lane, one line

A `CDPSession` delivers raw CDP for a live page over Playwright's existing browser connection, which for
a Playwright-launched Chromium is the stdio pipe, so the round-18 harness can invoke WebMCP with **no**
DevTools TCP port.

## 5. Observed facts (docs vs source, kept separate)

**From the documentation (the quoted source):**

- F1 — `CDPSession` instances "talk raw Chrome Devtools Protocol"; methods via `session.send`, events via
  `session.on` (`class-cdpsession.md:4-6`). The class has `send`, `detach`, and the v1.59 `on('close')`
  and `on('event')` events (served page §Methods/§Events; source lines 70-115).
- F2 — `BrowserContext.newCDPSession` takes only a target (`page`, documented as a `Page` or `Frame`),
  returns the session, and is Chromium-only:
  "CDP sessions are only supported on Chromium-based browsers."
  (`class-browsercontext.md:1008-1023`). The documented arguments contain **no** endpoint, URL or port.
- F3 — The docs' own usage is `const client = await page.context().newCDPSession(page);`
  (`class-cdpsession.md:15`): the session comes from an already-live context/page, not from a bootstrap URL.

**From Playwright 1.64.0 source (transport; the docs do not state this):**

- F4 — Chromium launch defaults add the pipe: `defaultArgs` pushes `--user-data-dir=…` then
  `--remote-debugging-pipe` (`chromium.ts:355-358`). The only `--remote-debugging-port=0` in that file is
  `launchWithSeleniumHub` (`chromium.ts:256`), a remote-grid path the harness does not use.
- F5 — The launch transport is the pipe whenever `supportsPipeTransport(options)` is true (base returns
  true, `browserType.ts:341-343`): `transport = new PipeTransport(stdio[3], stdio[4])`
  (`browserType.ts:274-278`); the WebSocket branch is the fallback.
- F6 — `newCDPSession(page)` does not open a second connection: the server resolves the page's target id
  and calls `rootSession.attachToTarget(targetId)` on the browser's root CDP session
  (`crBrowser.ts:606-620`), i.e. a `Target.attachToTarget` protocol request on the existing pipe. The
  client sends it over Playwright's own channel (`_channel.newCDPSession`, installed `coreBundle.js`
  offset 3018285).
- F7 — Constraint for the harness: a `Frame` argument is only accepted when that frame already owns a
  separate CDP session; otherwise it throws
  `This frame does not have a separate CDP session, it is a part of the parent frame's session`
  (`crBrowser.ts:610-614`). Passing the `Page` and addressing an in-target iframe by CDP `frameId` is the
  supported shape (consistent with S042 F12: the WebMCP handler resolves `frameId` inside the target).

## 6. Draft registry row — L1 appends after S058 (id proposed S059; L1 assigns)

Eleven cells, thirteen pipe fields; no `|` inside any cell. `status` is `queued` because no committed
`knowledge/` entry cites it yet; `used-by` stays `—` until the L1's note or lesson does.

| S059 | CDPSession — Playwright — https://playwright.dev/docs/api/class-cdpsession | docs | A | Playwright 1.64.0 CDPSession creation from a live page and the transport that carries it for a Playwright-launched Chromium | served page §CDPSession and §browser-context-new-cdp-session fetched 2026-10-20; docs source tag v1.64.0 (commit 606ecd8b34bac100db32561b6278ffd76e5eb3cd) docs/src/api/class-cdpsession.md:4-6 and docs/src/api/class-browsercontext.md:1008-1023; Playwright 1.64.0 server source chromium.ts:355-358, browserType.ts:274-278 and 341-343, chromium/crBrowser.ts:606-620 | A CDPSession delivers raw CDP for a live page over Playwright's existing browser connection, which for a launched Chromium is the stdio pipe, so the harness invokes WebMCP with no DevTools TCP port | queued | 2026-10-20 | on-release | — |

Why tier A scoped: the API half is the vendor's own reference documentation; the transport half is the
vendor's own source at the installed tag. Scope is the 1.64.0 creation contract and the launched-Chromium
transport, not "Playwright always uses a pipe" (attach/CDP-over-WebSocket launch options exist), not the
DevTools protocol itself (S002), and not a claim about Chromium's own switch semantics (S001/S004).

## 7. Gate entry — URL, date, quote, location, sha256

| Row | URL | Access | Quote (verbatim, ≤25 words) | Location | sha256 | Check | Pointer |
|---|---|---|---|---|---|---|---|
| S059 (new) | https://playwright.dev/docs/api/class-cdpsession | 2026-10-20 | "The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method." (19 words) | served page §CDPSession, first paragraph; normalized offset 1054 of 3362. Raw docs source `docs/src/api/class-cdpsession.md:4-5` at tag v1.64.0 (commit 606ecd8b…) carries the sentence with backticks across the bullet boundary; byte-identical at v1.64.1 | raw page `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba` (54,215 B; three fetches identical); docs source `d6e61eb3a96d3aaa4a9ead1112d15af88131f3eb2b1ae0fe2b621ecdf94c95c7` (5,355 B) | `--normalize-only --decode html-text` found=true; raw sha reproduced on repeated fetches | `sources/SrcPwCdpSession.md:63-77` |

Supporting anchor (not the Gate quote): the method page
`https://playwright.dev/docs/api/class-browsercontext#browser-context-new-cdp-session` served
2026-10-20 (`6769114c…10d3`, 300,171 B) states "CDP sessions are only supported on Chromium-based
browsers." at normalized offset 11293; its docs source is `class-browsercontext.md:1008-1023`
(`09cccad9…2e2e`).

## 8. Reconciliation with PLAN §C2 H3

No contradiction. PLAN H3: "no TCP DevTools port (`--remote-debugging-port` absent; CDP over Playwright's
pipe via `context.newCDPSession(page)`)" — F4-F6 show exactly that path, and the docs (F1-F3) show the
session is obtained from the live page with no endpoint argument.

Two precisions the harness/counter owners should carry:

1. Playwright itself adds `--remote-debugging-pipe` (`chromium.ts:358`); the round-17 harness does not pass
   it, and the port it adds at `scripts/webmcp-invoke-round17.mjs:91` (used at `:599,2049`) is the only
   source of the TCP DevTools endpoint. Dropping that one constant and switching the WebSocket client
   (`:508` and its `DevToolsActivePort` poll at `:471-492`) to `context.newCDPSession(page)` is the whole
   H3 delta; `session.on('event')` (v1.59) can keep the harness's verbatim inbound-frame record, and
   `session.send` replaces the outbound send.
2. `newCDPSession` must receive the `Page` (or a frame that owns a session); a plain iframe throws
   (`crBrowser.ts:610-614`). Frame-id targeting inside the page target is unaffected (S042 F12).

The round-18 harness (untracked, owned by the C2Harness seat) was being edited while this file was
written, so no state claim is made about it here. The red artifact for H3 is the byte-frozen round-17
harness (`scripts/webmcp-invoke-round17.mjs`), whose lines above are stable.

## 9. Remaining unknowns

- The pipe carries CDP only for a **launched** Chromium; `connectOverCDP` uses a WebSocket endpoint by
  definition. The row's scope says "launched", and the harness launches.
- The docs page says nothing about `DevToolsActivePort`; that file's absence under the pipe is a counter
  observation (`h3`), not documented here.
- The served page is `docs-default-stable` (1.64.1 as of 2026-10-20); the quote is byte-identical in
  1.64.0 and 1.64.1 docs sources, but a future stable bump can change the page — that is what
  `on-release` catches.
- No claim is made that `session.send` rejects with a specific error shape; the docs give only
  `Promise<Object>`.

## 10. Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcPwCdpSession.md` (this file)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcPwCdpSession.md` (report)

No tool installed or upgraded; `/tmp` fetch bodies were deleted after the digests were recorded
(`pw-cdpsession.html`, `pw-cdpsession-2.html`, `pw-browsercontext.html`, `pw-docs-*.md`, `src-*.ts`).
