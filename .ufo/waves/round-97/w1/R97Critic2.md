# R97Critic2 — mechanism/source attack on C1

## Sources verified (staged == upstream, byte-identical via diff)

- ElementHandle.ts: staged == puppeteer-v25.16.0. uploadFile at 106-163:
  - 118 `// Locate all files and confirm that they exist.` — comment only. The
    code below it (120-131) only absolutizes paths; NO fs stat/read/access/
    exists check anywhere in the function or in lib/puppeteer/cdp/ElementHandle.js
    (grep: only decorator-internal `access` hits). The comment claims a check
    that does not exist.
  - 138-150 zero-files branch: `element.files = new DataTransfer().files` +
    `new Event('input'/{bubbles,composed})` + `new Event('change')` dispatched
    via `this.evaluate`.
  - 158-162: `this.client.send('DOM.setFileInputFiles', {objectId, files,
    backendNodeId})` — `this.client` is the handle's own (per-session) client.
- fileUploadUtils.ts:62 staged == v1.65.0: `if
  (!frame._page.browserContext._browser._isBrowserCollocatedWithServer)` —
  reads files to buffers, drops localPaths. Note lines 62-66: on the
  non-collocated path `filesExceedUploadLimit` stats files before the
  `readFile` loop (21235-21244 in bundle), so the PLM ENOENT originates at
  `stat` — consistent with the frozen message `ENOENT ... stat '<path>'`.
- chromium.ts:162-163 staged == v1.65.0: `if (!options.isLocal)
  browser._isBrowserCollocatedWithServer = false;`

## Installed dist (fresh npm install, npm registry channel)

- puppeteer-core@25.16.0 (26 packages added; sha256
  `162b7199…9b7c96` matches plan pin). ElementHandle.js:123 comment,
  141 `files.length===0`, 147-148 script dispatchEvent pair,
  155 `DOM.setFileInputFiles` — logic identical to staged TS.
- playwright-core@1.65.0 (sha256 `4ef83305…63f7f1` matches plan pin).
  coreBundle.js:21235 non-collocated branch; 44989-44990 `if (!options.isLocal)
  browser._isBrowserCollocatedWithServer = false` (chromium.ts line matches).
- Untrusted pair source — decoded the injected-source string literal
  (`source5`, coreBundle.js:21274) to recover the engine-injected runtime.
  `injected.setInputFiles(node, payloads)` rebuilds `File`s + `DataTransfer`,
  then dispatches exactly:
  `input.dispatchEvent(new Event("input", {bubbles: true, composed: true}))`
  and `input.dispatchEvent(new Event("change", {bubbles: true}))` — both
  script-dispatched (`isTrusted: false`). Server `_setInputFiles`
  (coreBundle.js:21979) routes payloads here via
  `injected.setInputFiles(node, files)` at 22016.
- Collocated branch (PLL, `isLocal: true` keeps `_isBrowserCollocatedWithServer`
  true): `_setInputFiles` 22003 does `fs.promises.access(localPath, F_OK)` then
  `setInputFilePaths` (49442) -> `DOM.setInputFiles` (49449) — CDP path, whose
  events the browser marks trusted; matches the frozen PLL trusted claim and
  the PUX/PUS/PUM Puppeteer `DOM.setFileInputFiles` trusted claim.

## Attack results

1. **Comment-vs-code gap (Puppeteer existence check).** The frozen wording
   (plan §C1: "DOM.setFileInputFiles on the handle's own client"; claim bullets)
   claims behaviour, not the comment, and declared limit 6 explicitly frames
   mechanism as "the sources' account; the counter checks behaviour, not code
   paths". The PUM phantom `[[tabi-r97-missing.txt, 0]]` is exactly what this
   source produces: no client-side existence check, `DOM.setFileInputFiles`
   passes the path string to Chromium which fabricates a 0-byte File with
   trusted events. No wording falsification — behaviour claim is what source
   predicts.
2. **Playwright untrusted pair is genuinely the injected script** (recovered
   above). PLX/PLS untrusted claim is mechanistically grounded, not an artefact
   of the driver.
3. **PLM ENOENT wording.** `stat` comes from `filesExceedUploadLimit`, called
   before the read loop; frozen exact message names `stat` — source-consistent.
   (Limit 5 leaves the isLocal-absent case unmeasured; no contradiction.)
4. **No count issue.** Unit of claim (24 legs) not re-derived here; source
   gives no lever to move it, and the scored receipt matches the frozen
   driver/pins.

## Counterexample attempted

- "Puppeteer checks existence, so PUM should reject": refuted by dist +
  upstream source — the only `confirm` is a comment.
- "PLX untrusted events could be CDP-synthesized": refuted — payloads go
  through the injected `dispatchEvent` pair, which is script-level.
- "isLocal trusted events are script-dispatched too": refuted — PLL routes
  through `DOM.setInputFiles`, not the injected setter.

## Adjacency / calibration

- Declarations and comments that contradict the code (`confirm that they
  exist`) are a real cosmetic-source defect in puppeteer-core 25.16.0, but the
  frozen claim numbers/pin predicates are unaffected; declared limit 6 already
  scopes mechanism out of the predicate.
- No subagent dispatch, no chromium runs, no fixture repo; only npm deps
  installed into scratch. Scratch removed after writing this report.

VERDICT C1: neutral
