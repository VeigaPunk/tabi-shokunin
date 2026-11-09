# R96Critic2 — source/mechanism attack on C1 (client-oopif-filechooser-linux)

## Axes checked
- Wording fidelity: does the frozen sentence claim more than the instrument checks?
- Mechanism: is the S236 source account (primary-session-only) accurate for v25.16.0?
- Alternate-path coverage: is there any OTHER Puppeteer path that could resolve an OOPIF chooser that the counter does not exercise (making "never resolves page.waitForFileChooser()" over-broad)?

## 1. Staged source vs upstream (V25.16.0)
- SHA256 staged Page.ts = `e7f2f6b8…af90`; fresh raw fetch of tag `puppeteer-v25.16.0` `packages/puppeteer-core/src/cdp/Page.ts` has the identical SHA256; ranges 330-370/555-575 diff clean.
- Line 339: `const clientEmitter = new EventEmitter(this.#primaryTargetClient);`
- Line 361: `clientEmitter.on('Page.fileChooserOpened', this.#onFileChooser.bind(this));`
- Lines 561-562: `enablePromise = this.#primaryTargetClient.send('Page.setInterceptFileChooserDialog', { enabled: true, })`
- So S236 quotes are exact (≤25-word quotes above) and the interception-enablement is on the same primary client only. No other `setInterceptFileChooserDialog` send exists in cdp/Page.ts.

## 2. Installed dist (fresh npm install, /fast/scratch/hyaku/tabi-r96/R96Critic2/deps)
- `sha256 node_modules/puppeteer-core/lib/puppeteer/cdp/Page.js` = `31a522df2d59bba82e92a8e057238c9a1fc009a708e5b269b87ed29c3e07e7a0` — matches frozen `live-receipt.json` libs pin (fileSha256) and claims.json.
- Same logic: dist `Page.js:273` `new EventEmitter(this.#primaryTargetClient)`, `:289` `clientEmitter.on('Page.fileChooserOpened', this.#onFileChooser.bind(this))`, `:445` `this.#primaryTargetClient.send('Page.setInterceptFileChooserDialog', { enabled: true })`, `:373` `#onFileChooser`, `:430` `waitForFileChooser`.
- Mechanism verified in dist bytes, not only in TS source.

## 3. Alternate-path sweep (the strongest counterexample available)
Searched all `*.js` under `lib/` for `fileChooserOpened|waitForFileChooser|setInterceptFileChooserDialog`:
- Only hits: `cdp/Page.js` (above), `bidi/Page.js:595 waitForFileChooser`, `common/FileChooser.js` (accept/cancel impl), api `Page.d.ts` abstract decl. `Frame.js`/`FrameManager.js`: zero hits.
- Upstream `src/cdp/Frame.ts` (499 lines), `src/cdp/FrameManager.ts` (679 lines), `src/api/Frame.ts` (1239 lines): `grep waitForFileChooser|fileChooserOpened|FileChooser|uploadFile` → zero hits. `CdpFrame` holds its own `#client` (`Frame.ts:127 _client()`) but exposes no chooser wait; `FrameManager.setupEventListeners` binds only frame/nav/lifecycle/audits events (`FrameManager.ts:185-224`), never `Page.fileChooserOpened`.
- `FrameManager.onAttachedToTarget` (FrameManager.ts:382-385) does `frame.updateClient(target._session())` + `setupEventListeners(target._session())` for child targets — but that path handles frame tree, not chooser, so it cannot rescue the wait.
- `#onFileChooser` is reached ONLY via the primary-session emitter; the handler itself (Page.ts:470-497) does `frameManager.frame(event.frameId)` + `adoptBackendNode` — i.e. IF an event arrived on the primary session it could resolve even for a framed child. The failure is purely that the OOPIF event never arrives there (separate CDP session; `Target.attachToTarget {flatten:true}` per Connection.js:241, TargetManager.js:353).
- BiDi `waitForFileChooser` (`bidi/Page.js:595`) listens on `this.#frame.browsingContext.once('filedialogopened', …)` — a different transport. The driver pins CDP: `scripts/client-oopif-chooser-round96.mjs:203 puppeteer.connect({ browserURL })` (no `protocol:'webDriverBiDi'`), so the BiDi path is out of scope under limit 2 (attached via connect, default protocol). It is not covered by the counter and cannot rescue the CDP claim; it is also not claimed.

Counterexample conclusion: NO in-transport alternate path exists. The word "never" in §Claim "Puppeteer v25.16.0 never resolves `page.waitForFileChooser()` for a chooser opened inside a cross-site iframe" survives the sweep — except for the explicit carve-outs already in limit 4 (longer wait, later event, `ElementHandle.uploadFile`, frame-level APIs are not measured). `uploadFile` is indeed a real non-chooser path (`Frame.ts`/`ElementHandle`), but limit 4 names it, so the claim does not over-generalise; it fences it.

## 4. Playwright S230 verification (dist coreBundle.js, sha `4ef83305…63f7f1` matches freeze)
- `CRPage.updateFileChooserInterception` (:39147-39148): fans out via `_forAllFrameSessions` to EVERY session's `_updateFileChooserInterception` (per-session `Page.setInterceptFileChooserDialog`, :39857-39863).
- Each `CRFrameSession` registers its own listener at :39325: `eventsHelper.addEventListener(this._client, "Page.fileChooserOpened", (event) => this._onFileChooserOpened(event))` and forwards to the page (:39748 `this._page._onFileChooserOpened(handle)`), which emits `Page.Events.FileChooser` (:23981).
- That per-frame-session fan-out is exactly what makes PWX/PWS resolve while PPX/PPW time out. S230 account confirmed in the pinned bytes.

## 5. Scored evidence (no new --live run of my own)
- `.ufo/waves/round-96/scored/c1-live.json`: verdict `clean`, 165 checks, 0 findings, nonce `tabi-r96-live-c1225d318ea6`, driver sha matches freeze.
- `.ufo/waves/round-96/scored/live-receipt.json` PPX-1: `outcome timeout, errName TimeoutError, errMessage "Waiting for \`FileChooser\` failed: 3000ms exceeded", childFiles []`; PPW-1 additionally `witnessEvents [{frameId == iframe targetId, mode selectSingle, backendNodeId 2}]` with `childFiles []`. Lib pins in receipt match my fresh install shas exactly (§2).
- Behaviour matches the mechanism: witness proves the chooser opened on the OOPIF session; Puppeteer's primary-session listener never sees it.

## Commands run (exit codes)
- `npm init -y && npm install puppeteer-core@25.16.0 playwright-core@1.65.0` in `/fast/scratch/hyaku/tabi-r96/R96Critic2/deps` → exit 0; shas above.
- `curl -sL https://raw.githubusercontent.com/puppeteer/.../puppeteer-v25.16.0/.../Page.ts` + `diff`/`sha256sum` → IDENTICAL-RANGES, sha `e7f2f6b8…af90` both.
- `grep -rn fileChooserOpened|waitForFileChooser|setInterceptFileChooser lib --include="*.js"` → only cdp/Page.js + bidi/Page.js.
- `grep -n waitForFileChooser|fileChooserOpened|FileChooser Frame.ts FrameManager.ts ApiFrame.ts` → zero hits.
- No `--live` run executed by this seat (mechanism/source seat; scored run artifacts cited instead). No chromium processes started. No tool installs beyond the npm deps install (no pacman/sudo; RULES.md read).

## Finding
Mechanism and source are accurate. No alternate CDP path for `page.waitForFileChooser()` exists in v25.16.0; the sentence's "never" is transport-scoped (CDP + connect) and limit 4 fences the non-chooser/future-event cases. No falsification of wording or number. Smallest correction needed: none. Optional note: a future round could name the BiDi transport explicitly in limit 2, but the driver already pins CDP via default `connect({browserURL})`, so this is clarity, not correctness.

VERDICT C1: neutral
