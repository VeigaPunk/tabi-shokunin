---
source: S236 (Puppeteer `packages/puppeteer-core/src/cdp/Page.ts` at tag puppeteer-v25.16.0 — `#setupPrimaryTargetListeners` builds the listener emitter on `this.#primaryTargetClient` (line 339) and binds `'Page.fileChooserOpened'` on it (line 361); `waitForFileChooser` enables `Page.setInterceptFileChooserDialog` on the same primary client (lines 561-562)), read with S230 (Playwright `crPage.ts` v1.65.0: one `Page.fileChooserOpened` listener per frame session), S213/S215 (Puppeteer `uploadFile` and the `waitForFileChooser` API page) and the lane's r92-r95 raw-CDP receipts (a cross-site iframe's chooser is reported only on the iframe's own session)
verified-at: 2026-11-08 (round 96, Linux host, Chromium 155.0.8059.84 `--headless=new`, puppeteer-core 25.16.0, playwright-core 1.65.0; scored run `.ufo/waves/round-96/scored/c1-live.json`, nonce `tabi-r96-live-c1225d318ea6`, verdict `clean`, 165 checks, 0 findings)
recheck: `node scripts/check-client-oopif-chooser-round96.mjs --lane <ABS lane> --expect-driver-sha256 4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91 --receipt corpus/evidence/round96/client-oopif-filechooser/receipt.json --expect-nonce tabi-r96-live-c1225d318ea6 --json` → exit 0, `verdict: clean`, 163 checks (receipt mode on a byte copy of `.ufo/waves/round-96/scored/live-receipt.json`, sha256 `aad4611df158…`; the claim's counting command is the `--live` form in `plans/round-96.md` §Counting command, which needs an npm install of the two pinned clients)
---

# Puppeteer's `waitForFileChooser` never sees a cross-site iframe's chooser; Playwright's `filechooser` does

Capability `client-oopif-filechooser-linux` (new, first-working round 96). Rounds 92-95 measured raw CDP:
a file chooser opened by an `<input type=file>` inside a cross-site (out-of-process) iframe is reported
only on that iframe's own session, with a `backendNodeId` that means something only in the iframe's
renderer. Round 96 asks what the two mainstream CDP clients do with it.

## The law in one sentence

*Measured (15/15 legs, 3 reps × PPX, PPW, PPS, PWX, PWS):* with Puppeteer 25.16.0 attached over CDP,
`page.waitForFileChooser({timeout: 3000})` armed before `frame.click('#s')` on a **cross-site** child
frame ends in `TimeoutError` (``Waiting for `FileChooser` failed: 3000ms exceeded``) and nothing is
filled — even when a second raw CDP connection that intercepts on the iframe's session receives exactly
one `Page.fileChooserOpened` for that click — while the same call on a **same-site** child resolves and
`accept` fills it; Playwright 1.65.0's `page.waitForEvent('filechooser')` resolves for both, its
`element()` is the child's `#s`, and `setFiles` fills it.

## What the scored run shows (receipt `corpus/evidence/round96/client-oopif-filechooser/receipt.json`)

Fixture: parent `http://127.0.0.1:<http>/parent.html` with one file input `#pp` and one iframe; child
`http://<host>:<child>/child.html` with one file input `#s`; each leg a fresh `/usr/bin/chromium
--headless=new` the client attaches to (`puppeteer.connect({browserURL})`, `chromium.connectOverCDP`).

| arm | client | child host | iframe targets (browser) | chooser wait | child `#s` after | parent `#pp` after |
|---|---|---|---|---|---|---|
| PPX ×3 | Puppeteer | `localhost` | 1 (the child URL) | `TimeoutError` 3000 ms | `[]` | `[]` |
| PPW ×3 | Puppeteer + raw witness on the iframe session | `localhost` | 1 | `TimeoutError` 3000 ms; witness: 1 × `Page.fileChooserOpened`, `selectSingle`, `backendNodeId` 2, `frameId` = the iframe target | `[]` | `[]` |
| PPS ×3 | Puppeteer | `127.0.0.1` | 0 | resolves, `isMultiple()` false, `accept` | `tabi-r96-answer.txt` (22 B) | `[]` |
| PWX ×3 | Playwright | `localhost` | 1 | resolves, `element()` = `#s`, `setFiles` | `tabi-r96-answer.txt` (22 B) | `[]` |
| PWS ×3 | Playwright | `127.0.0.1` | 0 | resolves, `element()` = `#s` | `tabi-r96-answer.txt` (22 B) | `[]` |

Every leg: exactly one trusted click on `#s`, frames `[parent, child]`, DevTools `Chrome/155.0.8059.84`.

## Why (source account, not what the counter checks)

Puppeteer's `CdpPage` wires its page-level events once, on the primary target's session:
`const clientEmitter = new EventEmitter(this.#primaryTargetClient);` (S236 line 339) … 
`clientEmitter.on('Page.fileChooserOpened', this.#onFileChooser.bind(this));` (line 361), and
`waitForFileChooser` turns interception on with `this.#primaryTargetClient.send('Page.setInterceptFileChooserDialog', …)`
(lines 561-562). CDP delivers events per session, and Chromium reports an OOPIF's chooser on the iframe's
session (r92-r95), so the deferred never settles. Playwright registers the listener in every frame
session (S230), adopts the chooser's node in the choosing frame's context and answers by `objectId`.

## Practitioner rules

1. Automating uploads with Puppeteer 25.16.0: do **not** rely on `page.waitForFileChooser` when the input
   may live in a cross-site iframe — it fails silently by timeout. Whether `ElementHandle.uploadFile` (S213,
   no chooser involved) works on an OOPIF input is **not measured here**.
2. A raw CDP client that wants OOPIF choosers must enable `Page.setInterceptFileChooserDialog` and listen
   on the iframe's own session (r92-r95; PPW witness here).
3. Playwright 1.65.0 handles the cross-site case through its public API (PWX).

## Limits (`plans/round-96.md` §Declared limits 1-6)

One Chromium build, headless only; two client versions, attached with `connect`/`connectOverCDP` (their
own `launch` paths unmeasured); lockfile integrity + one chooser-bearing file sha256 pinned per package,
the rest of the install trusted; `localhost` vs `127.0.0.1` as the only cross-site pair; the Puppeteer
outcome is "times out at 3000 ms" — a longer wait, frame-level APIs and `uploadFile` are unmeasured; only
PPW proves a chooser opened in the iframe (interception enabled there by a second connection); the
mechanism above is the source's account; `--receipt` mode is forgeable and the `--live` path trusts the
host's same-UID process space.
