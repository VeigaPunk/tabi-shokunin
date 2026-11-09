# R95Critic3 — client-library exposure (declared limit 4): Puppeteer v25.16.0 / Playwright v1.65.0 session routing

Seat: R95Critic3 (godspeed). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin, base 7b3912bb, scored 360d7cc9.
Ports used: http 32041, child 32042, cdp 32043 (seat triple only). Scratch: /fast/scratch/hyaku/tabi-r95/R95Critic3/.

## Instrument pins (verified first, bytes below)

- driver `scripts/chrome-cdp-backendnode-misdelivery-round95.mjs` sha256 `24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82` — match.
- counter `scripts/check-backendnode-misdelivery-round95.mjs` sha256 `b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775` — match.
- battery `scripts/negatives-backendnode-misdelivery-round95.mjs` sha256 `1a670da5a9ffe200e6c757b0966d2df2e1bcca826da1f703c43d402f5075abf0` — match.
- Host Chromium: `Chromium 155.0.8059.84 Arch Linux` (`/usr/bin/chromium --headless=new`), receipt Browser `Chrome/155.0.8059.84`.

## Frozen claim read (round-95.md §Claim + §Declared limits 1–6)

C1 predicate binds page-session `describeNode(B)` to the snapshot node at B and page-session
`setFileInputFiles(B)` behaviour (misdelivery / collision / miss) plus correct-session answer filling
child `#s`. Declared limit 4 (lines 97–99): "What a CDP client library (Puppeteer, Playwright) does is
not measured here: the driver sends raw CDP." This seat attacks exactly that gap.

## Source quotes (≤25 words each, with line numbers)

### S213 — Puppeteer v25.16.0 `packages/puppeteer-core/src/cdp/ElementHandle.ts`

`uploadFile` (lines 106–162) sends on the handle's own session via `this.client` — never the page session:

- L56–57: "get client(): CDPSession { return this.handle.client; }" (8 words quoted).
- L153–162: "await this.client.send('DOM.describeNode', { objectId: this.id }) … await this.client.send('DOM.setFileInputFiles', { objectId: this.id, files, backendNodeId })" — describe+answer on the ElementHandle's session, by objectId (which pins the node in its correct renderer).

Chooser handling is in `packages/puppeteer-core/src/cdp/Page.ts` (S213 family, same tag):

- L361: "clientEmitter.on('Page.fileChooserOpened', this.#onFileChooser.bind(this));" where L339 "const clientEmitter = new EventEmitter(this.#primaryTargetClient);" — the listener is bound to the **primary (page) target session only**.
- L470–487 `#onFileChooser`: resolves `frame = this.#frameManager.frame(event.frameId)` then `frame.worlds[MAIN_WORLD].adoptBackendNode(event.backendNodeId)`. `IsolatedWorld.adoptBackendNode` (IsolatedWorld.ts L219–222) does `this.client.send('DOM.resolveNode', { backendNodeId, executionContextId })` with `client = #frameOrWorker.client` (L94–96) — i.e. the **frame's own session**, so a cross-site OOPIF backendNodeId resolves in the child renderer, not the parent's.
- L561: `waitForFileChooser` enables interception only on `this.#primaryTargetClient` ("Page.setInterceptFileChooserDialog").

Consequence (verified live below): Puppeteer never sees an OOPIF `fileChooserOpened` event at all, because (a) the listener is on the page session and (b) interception is enabled only on that session. CDP routes events per-session (`Connection.ts` L237–241: `session.onMessage(object)` for `object.sessionId`), so the iframe-session event is emitted only to the iframe's `CdpCDPSession`, which `CdpPage` never observes.

### S230 — Playwright v1.65.0 `crPage.ts` (commit a1f35e19…)

- L439–445 (`FrameSession._addRendererListeners`): each session registers "eventsHelper.addEventListener(this._client, 'Page.fileChooserOpened', … _onFileChooserOpened)" — one listener per FrameSession.
- L343–351 `setInputFilePaths`: "const parentSession = this._sessionForFrame(frame); await parentSession._client.send('DOM.setFileInputFiles', { objectId, files })" — sends on the **frame's session**, by objectId.
- L144–153 `_sessionForFrame`: "while (!this._sessions.has(frame._id)) { frame = frame.parentFrame(); … } return this._sessions.get(frame._id)" — routes by frame id (OOPIF frameId == targetId, L635–636 `_handleFrameTree`), falling back up the tree.
- L968–982 `_onFileChooserOpened`: "const frame = this._page.frameManager.frame(event.frameId); … handle = await this._adoptBackendNodeId(event.backendNodeId, utilityContext)" — adopts B on the **choosing frame's session** (~L1234 `DOM.resolveNode` via `this._client`).

Playwright's model is correct-by-construction here: every session listens for its own choosers and every answer is addressed by objectId (not backendNodeId) on the owner session. Neither client sends a bare `backendNodeId` on the page session for a cross-site chooser — the exact misuse C1 measures.

## Live reproduction (what was actually run)

Fixture mirrors the frozen driver (driver lines 112–127): parent `http://127.0.0.1:32041/parent.html?q=286`
(286 spans + `#p0..#p5` + iframe), child `http://localhost:32042/child.html?pad=300` (300 spans + `#s`),
ports 32041/32042/32043, `/usr/bin/chromium --headless=new`. Tooling: `puppeteer-core@25.16.0`,
installed via `npm install puppeteer-core@25.16.0` in scratch (channel: npm registry; reason: S213 tag
behaviour match; pacman stays paused per contract).

1. **Raw-CDP diag** (`R95Critic3-pupp-dbg.mjs`): click on page session → `Page.fileChooserOpened`
   arrived **only** on the iframe session, `backendNodeId: 302`, frameId = iframe target. 0 events on page session.
2. **Puppeteer `waitForFileChooser + elementHandle.click()`** (`pupp-date/R95Critic3-pupp-repro.mjs`,
   run bg_669): `Waiting for FileChooser failed: 10000ms exceeded`. Ports held by the lingering node
   process afterwards (`fuser`: 32041/32042/2261875); killed only that own PID; ports free.
3. **Puppeteer repro v2** (also arms iframe-session interception via `createCDPSession` +
   `Target.attachToTarget flatten`): puppeteer still timed out; the event is still per-session.
   (`R95Critic3-pupp-repro2.mjs`)
4. **Final correct-session run** (`pupp-date/R95Critic3-pupp-final.mjs`, result `final-result.json`):
   - `choosers: [{page: false, iframe: true, frameId: iframe target, backendNodeId: 302}]`
   - `describeOnPage(B=302) = INPUT type=file id=p3` (parent node — collision, as C1 states)
   - `describeOnIframe(B=302) = INPUT type=file id=s`
   - `DOM.setFileInputFiles(B)` on **iframe session** → no error; child `#s` = `[["tabi-r95-answer.txt",22]]`;
     parent `#p0..#p5` all `[]`.
   - So the same B that collision-matches `#p3` on the page correctly fills `#s` when sent on the owner session.

`pgrep -f "remote-debugging-port=32043"` empty after every run; no stray chromium.

## Adjustment (adjacency, not a C1 falsifier)

The seat brief asks whether a mainstream client "could send B on the page session and misdeliver into the
parent". Evidence: neither does. Puppeteer's fault mode is **silence, not misdelivery** — it times out
with no file written anywhere (parent and child both stay empty). That is a different hazard from C1's
misdelivery (wrong input silently filled) and C1's instrument (raw CDP) correctly claims nothing about it.
Suggested one-line addition to the limit-4 record (doc, not counter): clients that listen/answer per
frame session are safe from misdelivery but a page-session-only chooser listener misses OOPIF choosers
entirely. No driver/counter change is needed: the frozen wording already disclaims client behaviour.

## Commands run (exact, exit codes)

- `sha256sum scripts/chrome-cdp-…mjs scripts/check-…mjs scripts/negatives-…mjs` → 0, hashes above.
- `node pupp-date/R95Critic3-pupp-repro.mjs` (first attempt) → 1 (`ERR_MODULE_NOT_FOUND`, ESM ignores NODE_PATH); fixed by running from `pupp-date/` beside `node_modules`.
- `node pupp-date/R95Critic3-pupp-repro.mjs` → timed out 10000 ms on `waitForFileChooser` (exit 143 after timeout kill); lingering node held 32041/32042, killed own PID 2261875, ports verified free.
- `node pupp-date/R95Critic3-pupp-dbg.mjs` → 0 (chooser on iframe session only, B=302).
- `node pupp-date/R95Critic3-pupp-repro2.mjs` → 0, `puppeteerOutcome: timeout-no-chooser`.
- `node pupp-date/R95Critic3-pupp-final.mjs` → 0, child filled, parent empty (see JSON).

## Files

- `R95Critic3-pupp-final.mjs` (scratch copy; ports 32041-32043, q=286/pad=300 final run).
- `final-result.json` in scratch (B=302, chooser iframe-only, parent empty, child `["tabi-r95-answer.txt",22]`).
- Earlier runs kept in scratch: `R95Critic3-pupp-repro.mjs`, `-dbg/-repro2/-repro3` + `pupp-result.json`, `pupp2/3-result.json`.

VERDICT C1: neutral
