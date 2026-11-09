# R98 Critic2 — mechanism & source attack on C1 (Tabi round 98, wave w1)

Seat: R98Critic2. Lane: tabi-shokunin. Base: 020ce05f, scored commit 172bc0a1.
Scope: staged sources vs upstream + installed dist; `isTrusted` mechanism for PLA;
Playwright launch headless flag on Chromium 155; S241 message vs PUR receipt text.
Tools: npm registry (no pacman — host-wide PAUSED; no tools installed/upgraded beyond
deps below; no sudo). Deps: `D=/fast/scratch/hyaku/tabi-r98/R98Critic2/deps`,
`npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0`
→ exit 0; installed versions confirmed 25.16.0 / 1.65.0 (electron? no — puppeteer-core,
playwright-core only). No Chromium --live run in this seat (mechanism/source seat);
evidence is receipt recount + static dist/upstream comparison; no Chromium processes
started (pgrep by cdp port: none started by this seat; verify: `pgrep -af remote-debugging-port`
run by caller — this seat never launched a browser).

## 1. Staged sources == upstream, line numbers as cited

Re-fetched all four raw URLs from `fetch-log.txt` (all HTTP 200, curl exit 0) and
sha256-compared to staged copies. All byte-identical to the fetch log's hashes
(dom.ts 65cb43c9…, fileUploadUtils.ts 96dd5ef0…, chromium.ts 59286d44…,
ChromeLauncher.ts ba077ef5…, file_error.cc tag 2b5ea556… == main):
`cmp` IDENTICAL for every file; upstream tag-155 file_error.cc == main copy.

- `dom.ts` 768–788: plan's "local paths → `this._page.delegate.setInputFilePaths(…)`,
  else `injected.setInputFiles(node, files)` with `filePayloads`" is exactly 768–788:
  768 `if (localPaths || localDirectory)`, 779 `await this._page.delegate.setInputFilePaths(
  progress, retargeted, localPathsOrDirectory)`, 785–787 the else branch calls
  `injected.setInputFiles(node, files)` with `filePayloads!`. Correct, including the
  `fs.promises.access` pre-check at 770–772 (relevant to PLLM below).
- `fileUploadUtils.ts` 62: `if (!frame._page.browserContext._browser._isBrowserCollocatedWithServer)`
  is line 62. Correct. (Note: plan S238 citation says "paths are converted to payloads
  only when the browser is not collocated with the server" — the 62–75 block: when not
  collocated, localPaths are read into `fileBuffers` and `localPaths = undefined` (62–75).)
- `ChromeLauncher.ts` 90–104 + 278–281: staged 90–104 is the `!chromeArguments.some(
  argument => argument.startsWith('--remote-debugging-'))` block (pipe vs port);
  278–281 falls in `if (headless) { chromeArguments.push(headless === 'shell' ?
  '--headless' : '--headless=new', …) }`. Both correct (dist: ChromeLauncher.js:59–66
  the same guard; :203–204 the same push).
- `file_error.cc` 55–57 at tag 155.0.8059.84: `const char kNotFoundErrorMessage[] =
  "A requested file or directory could not be found at the time an operation was
  processed."` at lines 55–57. Correct. Tag-155 file == main file (byte-identical), so
  the tag pin adds no divergence risk.
- S241 message vs PUR receipt: scored `live-receipt.json` PUR-1/2/3 childRead equals
  `["err","NotFoundError","A requested file or directory could not be found at the time
  an operation was processed."]` — exactly the Blink string concatenated from the
  staged lines 55–57. No drift.

## 2. Installed dist carries the same logic (line numbers)

- `playwright-core/lib/coreBundle.js:21979` `_setInputFiles`: same shape as dom.ts —
  `localPaths || localDirectory` → `this._page.delegate.setInputFilePaths(...)` after
  `fs.promises.access`, else `injected.setInputFiles(node, files)`. Matches source.
- `coreBundle.js:21219` `prepareFilesForUpload`: identical to fileUploadUtils.ts —
  `_isBrowserCollocatedWithServer` check at :21235, path→buffers conversion under
  `!_isBrowserCollocatedWithServer` (:21235–21249), payloads carry `name/mimeType/
  buffer(base64)`. Matches source line 62.
- `puppeteer-core/lib/puppeteer/node/ChromeLauncher.js:203–204`: `headless === 'shell' ?
  '--headless' : '--headless=new'`; `:59–66` keeps caller-supplied `--remote-debugging-*`.
  Matches staged ChromeLauncher.ts. `ElementHandle.js:118` `uploadFile` sends paths
  straight to `DOM.setFileInputFiles` (:155) with NO local existence check — the
  asymmetry vs Playwright's `fs.promises.access` is real and is what makes PUR resolve
  with a phantom entry while PLLM throws ENOENT.

## 3. PLA trusted pair — collocation explains it, and the flag is where claimed

`_isBrowserCollocatedWithServer`:
- default `true` in `Browser` constructor (`coreBundle.js:54465`) — i.e. a launched
  browser is collocated by default.
- set `false` in exactly three places: `CRBrowser.connect` for Clank
  (`coreBundle.js:40160–40161`), `chromium.ts` staged :162–163 (`if (!options.isLocal)
  browser._isBrowserCollocatedWithServer = false` inside `_connectOverCDPImpl`), and
  the WebKit `connectOverRDP` (`coreBundle.js:52380`, `if (!params2.isLocal)`).
  Chromium launch never touches it → stays `true`.
Mechanism: PLA launches its own browser → flag stays true → `prepareFilesForUpload`
leaves `localPaths` intact → `_setInputFiles` takes the `setInputFilePaths` branch
(dom.ts:768/779; dist :2200x) → CDP path upload → trusted input/change. PLL (isLocal
connect) likewise keeps it true → same branch → trusted. PLB (default connect) flips
it false → paths would be read into buffers → payload branch → injected
`setInputFiles` → untrusted; but PLB is only tested with a payload object anyway.
PLAB uploads a payload object → filePayloads branch regardless of the flag → untrusted.
The provenance claim holds: PLA's trusted pair is fully explained by launched-browser
collocation, and the `isLocal` gate in chromium.ts:162–163 (also dist) is the only
relevant flip for these arms. Note `chromium.ts:86` forces `isLocal: true` when a
`transport` is supplied (internal path) — not exercised by the CDP-URL legs here.
One exposition gap (not a falsification): the plan/staged sources never cite where
the default `true` is set (browser.ts constructor); staged chromium.ts alone shows
only the `false` assignment. A reader of only the staged sources cannot derive
"launched browsers are collocated" without fetching browser.ts — the plan's §Declared
limits 5 handles this by scoping mechanism to "the sources' account", and the
counter checks behaviour, not code paths; so this is a citation-completeness nit, not
a mechanism error. Smallest safe correction: add `browser.ts` (or the dist
`_isBrowserCollocatedWithServer = true` default) to the S238 evidence, or note the
constructor default as the third collocation site.

## 4. Headless flags on Chromium 155

- Playwright `chromium.launch({headless:true})` pushes old-style `--headless`
  (coreBundle.js:45180–45181 `_innerDefaultArgs`).
- Puppeteer `launch({headless:true})` pushes `--headless=new` (ChromeLauncher.js:203–204).
- Empirically on this host's Chromium 155.0.8059.84 (`/usr/bin/chromium --version`
  = `Chromium 155.0.8059.84 Arch Linux`): both `--headless` and `--headless=new` with
  `--dump-dom about:blank` exit 0 and print the empty page. So on 155 the old-style
  flag is still accepted and functional; the flag difference does not falsify any
  leg-level statement (PLA's legs resolved with trusted events in the scored run,
  which used exactly Playwright's `--headless`). No load-bearing difference found on
  this host; headed/unmeasured builds remain a declared limit (limit 1). What WOULD
  matter: on a build that dropped old headless, PLA would fail to start — counter
  would report `setup`/browser-version failure, not a leg-level falsehood; and the
  predicate binds to this host's build. Not a falsification of this round's sentence.

## 5. Smallest safe correction (if any is warranted)

No leg-level statement of the predicate is false; mechanism citations verify
byte-identical to upstream at the cited lines; dist logic matches; PUR text matches
Blink; receipt recount confirms 24 legs, 24 distinct browserIds, and per-arm outcomes
exactly as the predicate states (path arms trusted/readable, payload arms untrusted/
readable, PLLM `Error`/`ENOENT…stat '<missingPath>'` with `childFiles []`, events [],
read null, PUR phantom `[["tabi-r98-missing.txt",0,"text/plain"]]` trusted +
NotFoundError). The only defect found is the §3 citation gap: the collocation
default (`true`, browser.ts constructor) is not among the staged sources, so "launched
browsers are [collocated]" is under-evidenced in the staged set. Smallest safe
correction: append the browser.ts constructor line to sources/fetch-log or add one
sentence citing the `_isBrowserCollocatedWithServer = true` default — no predicate
wording change needed. This is a wording/evidence gap too small to cross the
falsifies-wording bar on its own (limit 5 explicitly scopes mechanism out of the
counter and the scored claim); it does not narrow or widen what the instrument
enforces. Verdict: neutral.

## Commands run (exit codes)
- `npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0` in
  `/fast/scratch/hyaku/tabi-r98/R98Critic2/deps` → exit 0 (versions confirmed).
- Upstream re-fetch (6 raw URLs) → curl exit 0; `cmp` staged vs upstream: all IDENTICAL.
- `/usr/bin/chromium --headless/--headless=new --dump-dom about:blank` → rc 0 both.
- Receipt recount (python3 over scored live-receipt.json; committed receipt.json
  sha256 identical: f69c5719…) → 24 legs / 24 browserIds, per-arm outcomes as predicate.
- No `--live` run by this seat (no driver run; no browsers started; no `setup` failure
  to report). No fixture git repo needed (no git/jj calls made).
- Scratch cleanup: this seat's scratch will be removed on yield; this report is the
  only lane write.

VERDICT C1: neutral
