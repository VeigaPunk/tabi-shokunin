# R56Scout - C2 chromium control-keys recon (read-only)

Seat: R56Scout, wave w1, round 56. Scope: recon for claim **C2**
(`chromium-keyevent-control-keys-linux`). I wrote no repo script; everything below is
read from the committed layer or measured with throwaway drivers kept in
`$HYAKU_SCRATCH/tabi-r56/R56Scout/` (driver sources copied here as `*.mjs.txt`).

Rounds read (frozen history, not edited):
`scripts/webview2-cdp-loopback-round55.mjs` (893 ln),
`.ufo/waves/round-55/counters/webview2-receipt-r55.mjs` (592 ln),
`scripts/chrome-cdp-loopback-round46.mjs` (413 ln),
`corpus/knowledge/webview2-control-keys-round-55.md` (66 ln).
Claims frozen text: `.ufo/waves/round-56/claims.json`.

## 0. Headline for the L1

The control-domain leg **already runs green on this host's Chromium 155**, measured, with
every r55 witness intact - including the Enter implicit submission - at
`scout/control-leg-dryrun.json`. Two mechanics must change and one must be pinned:

1. **Launch the real binary** `/usr/lib/chromium/chromium`, not `/usr/bin/chromium`.
   The Arch launcher is a 14,424-byte glibc stub that prepends
   `~/.config/chromium-flags.conf` to our argv (`--ozone-platform=wayland`,
   `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`,
   `--disable-features=Vulkan`). `--disable-extensions` does **not** remove that
   extension flag (measured `containsLoadExtension: true`), so the wrapper's flags leak
   into the surface. With the real binary the argv is exactly what we pass
   (`containsLoadExtension: false`).
2. **Create the page target at the nonce `data:` URL** via `PUT /json/new?<data:url>`.
   That is what restores r55's `journey-history` predicate (`urls[0]` startsWith `data:`,
   4 entries, index 3) without touching the predicate. Measured side by side in
   `scout/history-shape.json` and `scout/history-data-target.json`.
3. **Pin the key mappings verbatim.** A `codeFor` without the `'-'` branch sends
   `code: null`, and Chromium rejects the dispatch with
   `-32602 ... Failed to deserialize params.code - BINDINGS: string value expected`
   (observed first run, fixed by reusing r55 L492-493). r55's mappings already carry it.

Also measured, unfixable and must be disclosed rather than hidden: a `background_page`
extension target (`chrome-extension://nkeimhogjdpnpccoofpliimaahmaaome/...`) is present in
`/json/list` **even with the real binary and `--disable-extensions`** - it is a build
component, not our `--load-extension`. Target selection must therefore filter on
`type === 'page'` **and** the expected URL, never on "the first target".

### 0b. A defect I hit and fixed in my own probe - and what it means for the runner

My first dry run died on the CDP `-32602` error (an uncaught rethrow inside the
WebSocket message handler) **after** Chromium was up. Its teardown never ran: a global
`ps -eo pid=,args=` grep minutes later found 10 live processes carrying that run's
profile token (`tabi-r56-dry-a2c6b5e6caf5`). I killed exactly those 10 pids; the final
global grep for `tabi-r56-` is 0.

I then measured the class on purpose (`leak-bare.json` / `leak-guarded.json`, victim runs
externally observed so a Node-side census cannot lie about itself):

| mode | mid-run processes | survivors after the victim died |
|---|---|---|
| bare (no guard) | 11 | **11** |
| guarded: `process.on('exit')` + `process.on('uncaughtException')` -> token census -> SIGKILL each | 11 | **0** |

Requirement for `scripts/chrome-cdp-loopback-round56.mjs`: the sweep must be installed as
a process-level guard immediately after `spawn`, not only as a straight-line teardown
block at the end. Any throw path between launch and the teardown block - a CDP error, a
failed assertion, an unhandled rejection - otherwise leaks the whole tree and, worse,
under-reports `postKillSweepCount`, which is exactly the field `teardown-survivors` grades.
The r46 runner has the same shape of exposure (its `die()` paths all call `sweepToZero`,
but its CDP `send()` rejections reach `die()` only where explicitly awaited).

## 1. Measured host facts (each with its receipt)

| Fact | Value | Receipt |
|---|---|---|
| Binary version | `Chromium 155.0.8059.84 Arch Linux` | launch-probe.json |
| `/json/version` Browser | `Chrome/155.0.8059.84` (no `Edg/`) | launch-probe.json |
| Protocol-Version | `1.3` | launch-probe.json |
| User-Agent | `HeadlessChrome/155.0.0.0 ... X11; Linux x86_64` | launch-probe.json |
| Discovery file | `<profile>/DevToolsActivePort` (root, not `EBWebView/`) | launch-probe.json |
| Discovery speed | 103 ms via file; stderr line also present | launch-probe.json |
| `DevToolsActivePort` line 2 | `/devtools/browser/<uuid>` | launch-probe.json |
| Loopback only | `ws://127.0.0.1:37321/...` | launch-probe.json |
| Process tree at launch | 10 children under the main pid; 11 token hits | launch-probe.json |
| Effective argv vs spawn argv | wrapper path: injected flags present; real-binary path: none | launch-probe.json, portability-micro.json, portability-direct.json |
| `PUT /json/new` | 200 | portability-micro.json |
| `GET  /json/new` | **405** (`This action supports only PUT verb.`) | portability-micro.json |
| Screenshot | PNG magic `89504e47`, 3,720 B | history-shape.json |
| Teardown | post-kill token census 0 in all six probes | all six |
| Free space | `/fast` 411 GB free (49% used) | `df -h` |

## 2. (a) Every r55 check id -> Chromium-portable mechanic

100 ids, taken from the counter source in source order (line = r55 counter line).
Dispositions: **KEEP** (same predicate, same mechanic), **KEEP-POSIX** (same predicate,
POSIX path form), **KEEP-NEW-IMPL** (same rule, different census implementation),
**RENAME** (same check, new literal), **REPLACE** (the check's subject does not exist on
Linux; a named substitute carries the same invariant), **DROP** (no subject on this host),
**KEEP-PREDICATE / NEW-MECHANIC** (predicate frozen, runner behaviour changes).

| id | r55 ln | disposition | Chromium-portable mechanic |
|---|---|---|---|
| `schema` | 130 | RENAME | Literal `tabi-webview2-cdp-r55` -> `tabi-chromium-cdp-r56`. Same shape check; the literal is the cross-generation breaker (an r55 receipt on the r56 counter dies here first, and vice versa). |
| `surface-identity-mismatch` | 132 | REPLACE-TEST | `/^Edg\//` -> `/^Chrome\/155\.0\.8059\.84$/` against `receipt.jsonVersion.Browser`. Measured value on this host: `Chrome/155.0.8059.84` (no `Edg/` brand: the WebView2 shell is what carried `Edg/`). |
| `ws-not-loopback` | 134 | KEEP | Unchanged regex `^ws://127\.0\.0\.1:\d+/`. Measured `ws://127.0.0.1:37321/devtools/browser/<uuid>`, both from stderr and from `DevToolsActivePort` line 2. |
| `host-exe-not-webview2-host` | 136 | REPLACE | No COM host exists. -> `browser-exe-not-canonical`: `receipt.browserPath` must equal the resolved real binary `/usr/lib/chromium/chromium`. `/usr/bin/chromium` is a 14,424-byte glibc launcher, not the browser (measured argv injection, see (c)). |
| `runtime-folder-not-webview2` | 140 | DROP | No `EdgeWebView/Application/<ver>` folder on Linux. The runtime-pin surface is replaced by `browser-version-pin-shape` (the pinned binary path + version line recorded in the receipt and re-checked). |
| `runtime-identity-mismatch` | 144 | REPLACE | -> `browser-identity-mismatch`: `receipt.chromiumVersionLine` (`Chromium 155.0.8059.84 Arch Linux`) must agree with `receipt.jsonVersion.Browser` (`Chrome/155.0.8059.84`) on the version tail. |
| `runtime-msedgewebview2-absent` | 149 | DROP | No `msedgewebview2.exe` on this host; nothing to grade. |
| `profile-not-throwaway` | 162 | RENAME | Regex `tabi-r55-wv2drv-<hex>-profile` -> `tabi-r56-chromiumdrv-[0-9a-f]+-profile`. Same throwaway invariant; the profile basename is also the launch token (see (c)), so one string carries both roles. |
| `paths-block-missing` | 165 | KEEP | Same block-presence check on `receipt.paths` {scratchGiven, scratchResolved, outGiven, outResolved}. |
| `paths-resolved-not-absolute` | 168 | KEEP-POSIX | `path.win32.isAbsolute` -> `path.posix.isAbsolute`. Measured scratch form: `/fast/scratch/hyaku/tabi-r56/<seat>/`. |
| `profile-outside-resolved-scratch` | 172 | KEEP-POSIX | Same containment test, `/`-normalised (`norm` becomes identity on POSIX) instead of `\`-normalised. |
| `relinvocation-flag` | 174 | KEEP | Unchanged: a relative `--scratch` must carry `paths.relInvocation === true`. |
| `paths-resolution-not-applied` | 175 | KEEP | Unchanged: resolved must differ from given when the given form is relative. |
| `paths-tail-lost` | 177 | KEEP-POSIX | Same tail-containment test with `'/'` instead of `'\\'`. |
| `paths-absolute-not-identity` | 180 | KEEP-POSIX | Same identity test with `path.posix.normalize`. |
| `discovery-via` | 184 | RENAME | `devtools-active-port-webview-ebwebview` -> `devtools-active-port-chromium-profile-root`. MEASURED: the file is at `<profile>/DevToolsActivePort` (NOT under `EBWebView/`), first line `37321`, second line `/devtools/browser/<uuid>`; the stderr line `DevTools listening on ws://...` is ALSO present (unlike branded Edge), so both r46 discovery legs work. |
| `discovery-port` | 185 | KEEP | Same `/^\d+$/` check on the discovered port. |
| `invocation-binding` | 186 | KEEP | Unchanged: `receipt.nonceEcho` (page `document.title`) === `receipt.nonce`. |
| `nonce-shape` | 187 | RENAME | `/^tabi-r55-[0-9a-f]{16}$/` -> `/^tabi-r56-[0-9a-f]{16}$/`. Length 25, which the caret witnesses depend on (measured `caretAfterEnd` = 25). |
| `host-not-ready` | 188 | REPLACE | THE no-host-application mechanic. r55 graded the COM host's stdout line `WEBVIEW2_HOST ready`. On Chromium -> `cdp-not-ready`: readiness is the CDP target itself reaching `document.readyState === 'complete'` after `/json/version` returned 200. |
| `invocation-bound-flag` | 189 | KEEP | Unchanged boolean. |
| `teardown-survivors` | 190 | KEEP-NEW-IMPL | Same rule (`postKillSweepCount === 0`); the census implementation must be POSIX: `ps -eo pid=,ppid=,args=` filtered by the exact launch token, never an image name. Measured: mid-run 11-12 processes, post-kill 0, in all six probes. |
| `driver-pin-mismatch` | 193 | KEEP | Same: re-hash the committed runner file and compare to `receipt.driverSha256`. This is the pin the C2 do-nothing control relies on (a canned or relabelled receipt dies here). |
| `hostsrc-pin-mismatch` | 193 | REPLACE | No host source to pin. -> `fixture-pin-mismatch`: re-hash the runner's own fixture-page source (the `mkPage`/`mkFormPage` bytes exported into the receipt) so a relabelled fixture is refused, the same class of defence. |
| `pin-file-unreadable` | 196 | KEEP | Same: driver file must be readable to re-hash. |
| `loader-pin-shape` | 199 | DROP | No `WebView2Loader.dll`; the pin disappears with it. |
| `hostexe-pin-shape` | 200 | REPLACE | -> `argv-pin-shape`: `/^[0-9a-f]{64}$/` on the sha256 of the receipt's recorded EFFECTIVE argv (`flagsEffective`), so the launch line is byte-bound to the receipt. Measured effective argv differs from the spawn argv on the wrapper path and matches it on the real-binary path - the pin is what makes that difference auditable. |
| `shot-unreadable` | 202 | KEEP | Same on the main shot. |
| `shot-digest-mismatch` | 206 | KEEP | Same. `Page.captureScreenshot {format:'png'}` measured 3,720 B, sha256 `ec033574...0876`. |
| `shot-length-mismatch` | 207 | KEEP | Same byte-length equality. |
| `shot-not-png` | 208 | KEEP | Same PNG magic check; measured magic `89504e47`. |
| `journey-steps` | 215 | KEEP | Same 6-step (form mode) / 4-step count and leg names. Leg count is surface-independent. |
| `journey-leg` | 231 | KEEP | Same expected leg sequence Page.navigate, anchor-click, anchor-click, navigateToHistoryEntry, anchor-click, form-submit. `navigateToHistoryEntry` and page-side `anchor.click()` are both measured working on Chromium. |
| `journey-url` | 233 | KEEP | Same per-step suffix pin. |
| `journey-origin-not-loopback` | 236 | KEEP | Same `http://127.0.0.1:<port>` origin check. Measured same-port fixture (e.g. 37917 for every step). |
| `journey-port` | 237 | KEEP | Same single-port rule across all steps. |
| `journey-title` | 242 | KEEP | Same non-empty title per step. |
| `journey-invocation-binding` | 246 | KEEP | Same `nonceOnPageA` marker read. |
| `journey-shot-arg-missing` | 252 | KEEP | Same CLI --png-<key> requirement. |
| `journey-shot-unreadable` | 253 | KEEP | Same per-step readability. |
| `journey-shot-digest-mismatch` | 256 | KEEP | Same per-step digest pin. |
| `journey-shot-length-mismatch` | 257 | KEEP | Same per-step byte length. |
| `journey-shot-not-png` | 258 | KEEP | Same per-step PNG magic. |
| `main-shot-not-final-step` | 263 | KEEP | Same: `receipt.screenshot` must equal the final step's screenshot record. |
| `journey-history` | 275 | KEEP-PREDICATE / NEW-MECHANIC | PREDICATE UNCHANGED (entriesLength 4, currentIndex 3, `urls[0]` startsWith `data:`, then /a,/b,/c). MECHANIC CHANGES: the `data:` slot-0 must be CREATED, not inherited. MEASURED on Chromium 155: (1) reusing the profile's `about:blank` page target -> `urls[0] = 'about:blank'` (RED); (2) `PUT /json/new?about:blank` -> same (RED); (3) `PUT /json/new?<data:url>` -> `entriesLength 1, currentIndex 0, urls[0] 'data:...'` at create and `entriesLength 4, currentIndex 3, urls [data:, /a.html, /b.html, /c.html]` at C (GREEN, the r55 numbers exactly). No predicate is touched: the runner creates the target at the nonce data: URL. |
| `journey-back-leg` | 282 | KEEP | Same: `navigateToHistoryEntry` to index 2 of `[data:, a, b, c]`, landing `/b.html`, `entriesLengthAfter 4`, `currentIndexAfter 2`. With mechanic (3) above the index arithmetic is identical to r55. |
| `form-mechanism` | 294 | KEEP | Literal `dispatchKeyEvent+shift-chords+chord-domain+control-domain+enter-submit` unchanged: it names CDP domains and legs, not a host. `Input.dispatchKeyEvent` is the same command on Chromium (S153). |
| `form-invocation-binding` | 295 | KEEP | Same `nonceOnFormPage` marker. |
| `form-filled-value` | 296 | KEEP | Same expected nonce in `#field`. |
| `form-echo-url` | 298 | KEEP | Same `/echo` pathname pin. |
| `form-echo-origin` | 301 | KEEP | Same same-origin/port pin against step 0. |
| `form-echo-query` | 303 | KEEP | Same exact `?field=<nonce>&mixed=<UPPERCASE>` query. Measured exact match: `/echo?field=tabi-r56-60242f101056c63f&mixed=TABI-R56-60242F101056C63F`. |
| `form-echo-value` | 305 | KEEP | Same `#echoed` client render. |
| `form-server-witness` | 307 | KEEP | Same fixture `served` log equality against `wantedQuery`. NOTE (measured): Chromium fires an extra `GET /favicon.ico`; the r55 `includes(wantedQuery)` form is portable, but a `find(first startsWith '/echo?')` shortcut is NOT (it can pick a stale entry). |
| `typing-missing` | 310 | KEEP | Same presence check on `journey.form.typing`. |
| `typing-length` | 312 | KEEP | Same `nonce.length`. |
| `typing-entry` | 314 | KEEP | Same per-entry object check. |
| `typing-index` | 315 | KEEP | Same `t.i === i`. |
| `typing-char` | 316 | KEEP | Same per-character pin. |
| `typing-vk` | 317 | KEEP | Same `windowsVirtualKeyCode` re-derivation. Chromium accepts the same VK numbering; the `-` case is 189. |
| `typing-code` | 318 | KEEP | Same `code` re-derivation. MEASURED FAILURE MODE: a mapping without the `ch === '-'` branch sends `code: null` and CDP rejects the call with `-32602 Invalid parameters: Failed to deserialize params.code - BINDINGS: string value expected`. r55's `codeFor`/`vkFor` already carry the `-` branch (L492-493); the r56 runner MUST reuse them verbatim. |
| `typing-prefix` | 319 | KEEP | Same per-keystroke prefix witness. MEASURED: keyDown WITH `text` inserts on Chromium; the field read back per key equals the nonce prefix (final value == nonce). |
| `typing-value-before` | 321 | KEEP | Same empty-before-first-key. |
| `typing-event-count` | 322 | KEEP | Same `2 * nonce.length` (keyDown + keyUp per character; keyUp carries no `text`). |
| `typing-field-value` | 323 | KEEP | Same final value == nonce. |
| `chords-missing` | 330 | KEEP | Same presence on `journey.form.chords` and `.typing`. |
| `chords-value` | 332 | KEEP | Same `nonce.toUpperCase()`. |
| `chords-length` | 336 | KEEP | Same `mixed.length`. |
| `chords-entry` | 338 | KEEP | Same per-entry object check. |
| `chords-index` | 339 | KEEP | Same `t.i === i`. |
| `chords-char` | 340 | KEEP | Same per-character pin. |
| `chords-shift` | 342 | KEEP | Same `shiftRide === /[A-Z]/.test(char)`. MEASURED: the Shift ride (`modifiers: 8`, `key 'Shift'`, `code 'ShiftLeft'`, VK 16) produces the uppercase character and a page keylog entry with `shiftKey: true`; `#field2` ended exactly `TABI-R56-60242F101056C63F`. |
| `chords-modifiers` | 343 | KEEP | Same `modifiers === (ride ? 8 : 0)` (S153 bit field, S161 booleans). |
| `chords-vk` | 344 | KEEP | Same chord VK re-derivation. |
| `chords-code` | 345 | KEEP | Same chord `code` re-derivation (`Key` + letter, `-` -> `Minus`). |
| `chords-prefix` | 346 | KEEP | Same per-keystroke prefix witness. |
| `chords-value-before` | 348 | KEEP | Same empty-before-first-key on `#field2`. |
| `chords-event-count` | 350 | KEEP | Same `4 per shifted + 2 per unshifted` total. |
| `chords-field-value` | 351 | KEEP | Same final value == mixed. |
| `chords-all-prefix-flag` | 352 | KEEP | Same runner-side boolean, must be true. |
| `form-mixed-echo-value` | 355 | KEEP | Same `#mixed-echoed` client render. |
| `form-server-mixed-witness` | 356 | KEEP | Same server-side second parameter. |
| `chord-domain-missing` | 376 | KEEP | Same presence on `journey.form.chordDomain`. |
| `chord-domain-derivation` | 378 | KEEP | Same literal `first [a-f] char of the nonce hex tail` + `hexTail` echo. |
| `chord-domain-letter` | 380 | KEEP | Same derived letter + `Key<L>`/VK. Measured the letter 'a' (from nonce tail) delivered as `KeyA`/65 and recorded by the page. |
| `chord-domain-chords` | 383 | KEEP | Same 3-chord array length (Control bit 2, Alt bit 1, Meta bit 4). |
| `chord-domain-chord` | 387 | KEEP | Same per-chord name/bit/key/code/VK pin. |
| `chord-domain-events` | 389 | KEEP | Same `keyEventsDispatched === 4` per chord, `keyEventCount === 12`, and keylog window +6. MEASURED: the Chromium page keylog advances by exactly 6 over the chord leg (2 keydowns x 3 chords). |
| `chord-domain-boolean` | 391 | KEEP | Same bit<->boolean correspondence re-derived from the page's own records (`domEvents[0..1]`). Measured identical on Chromium. |
| `field3-not-empty` | 400 | KEEP | Same: a modifier chord inserts nothing, `#field3` stays empty. |
| `control-domain-missing` | 416 | KEEP | Same presence on `journey.form.controlDomain` - the claim-C2 surface. |
| `control-tab-focus` | 418 | KEEP | Same two checks: `focusAfterClick === 'field'` and the Tab pair `activeElementBefore 'field'` -> `activeElementAfter 'field2'` via the page's OWN `document.activeElement`. MEASURED GREEN: click at x+8 gives caret `[0,0]`, focus `field`; after Tab `field2`. |
| `control-end-witness` | 421 | KEEP | Same: End key/code/VK 35, 2 events, fieldId `field`, AND the NEGATIVE EDIT WITNESS `valueAfterEnd === nonce`. MEASURED GREEN: `valueAfterEnd` == nonce, and the caret moved to `[25,25]` (end of line) - i.e. End's movement half is additionally observable on Chromium via `selectionStart`, which r55 could not read. |
| `control-backspace-witness` | 426 | KEEP | Same: Backspace key/code/VK 8, 2 events, `valueBeforeBackspace === nonce`, `valueAfterBackspace === nonce.slice(0,-1)`. MEASURED GREEN (residue exactly 24 chars of 25). |
| `control-restore-witness` | 432 | KEEP | Same: restore char == last nonce char with re-derived code/VK, 2 events WITH `text`, `valueAfterRestore === nonce`. MEASURED GREEN. |
| `control-enter-submit` | 444 | KEEP / MECHANIC NAMED | Same predicate: key `Enter`, code `Enter`, VK 13, ONE keyDown, `submitMechanism 'implicit-submission-enter-key'`, `focusAtSubmit 'field2'`. MECHANIC ON CHROMIUM: the keyDown must carry `text: '\r'` and NO keyUp is dispatched; the implicit submission then navigates. MEASURED GREEN: submit request served 100-101 ms after the keyDown, `location` exactly the wanted query, `#echoed` renders the nonce. (S083 4.10.22.2 is the ground; the fixture's submit button is load-bearing exactly as in r55.) |
| `control-keylog-window` | 450 | KEEP | Same two checks: `keylogLengthBefore === chordDomain.keylogLengthAfter` and the window `+4` (End, Backspace, restore char, Tab keyDOWNs). MEASURED GREEN: 58 -> 62. |
| `keylog-missing` | 464 | KEEP | Same presence on `journey.form.pageKeylog`. |
| `keylog-length` | 481 | KEEP | Same re-derived expected length. MEASURED on Chromium: 62 = 25 plain + 33 chord-domain (25 + 8 Shift rides) + 4 control, exactly the r55 derivation. |
| `keylog-entry` | 483 | KEEP | Same entry-by-entry equality (key/code/keyCode/4 booleans). MEASURED: the Chromium page delivered exactly the derived sequence, including the four control entries (`End`/35, `Backspace`/8, last char, `Tab`/9) all with every modifier boolean false. |

### 2b. The three questions the seat asked, answered directly

**The keyDown `text`.** On Chromium, `Input.dispatchKeyEvent` with `type: 'keyDown'` and
`text` (plus `unmodifiedText`) performs the edit; `keyUp` must NOT carry `text`. Measured:
the plain 25-character trace produced the exact nonce; the Shift-chord trace produced the
exact uppercase value; the restore character re-typed with `text` restored the nonce. The
`Enter` keyDown needs `text: '\r'` or the default action (implicit submission) does not
fire - measured with it, the `/echo` request arrived 100 ms later with `focusAtSubmit`
`field2` and no keyUp dispatched.

**The implicit submission path.** Identical to r55 in cause and witness, different in
shell: no native host mediates it. One Enter keyDown from the tabbed-to field drives
`/echo?field=<nonce>&mixed=<UPPER>`; witnessed server-side (fixture `served` log, exact
query) and client-side (`#echoed` / `#mixed-echoed` text, and `location.search`).
The form's submit button stays load-bearing (S083 4.10.22.2), exactly as the r55 note
records. Measured: `serverSawExactQuery: true`, `enterToSubmitMs: 100`, `#echoed` == nonce.

**No host application.** r55 graded `WEBVIEW2_HOST ready` on the COM host's stdout and
pinned `hostCsSha256`. On Chromium there is no host process: readiness becomes the CDP
target itself (`/json/version` 200, then `document.readyState === 'complete'`), and the
`hostsrc` pin is replaced by the effective-argv pin. Nothing else in the form/control
chain depended on the host.

## 3. (b) Exact functions to reuse, by name and line

### From `scripts/chrome-cdp-loopback-round46.mjs` (the keyed-launch sweep)

| symbol | line | reuse verdict |
|---|---|---|
| `findBrowser()` | 98 | **contract only** - candidate list is Windows; resolve once + `accessSync`, pointed at `/usr/lib/chromium/chromium` |
| `waitFor(fn, ms, every)` | 105 | **verbatim** |
| `sweepOnce(token)` | 120 | **contract verbatim, body replaced** - `Get-CimInstance` -> `ps -eo pid=,ppid=,args=` with the exact-token substring filter, excluding own pid |
| `killByPid(pid)` | 137 | **body replaced** - `taskkill /F /T` -> `process.kill(pid,'SIGKILL')` |
| `sweepToZero(token)` | 146 | **verbatim** (rounds, per-round entries, fail-closed `postKillSweepCount`, 15-round budget) |
| `SWEEP_MAX_ROUNDS` / `SWEEP_WAIT_MS` | 74-75 | verbatim |
| `launchToken = SURFACES[surface].profilePrefix + randomBytes(6).hex` | 163 | **verbatim shape**, prefix becomes `tabi-r56-chromiumdrv-` |
| `preLaunchSweep` freshness gate (die on collision) | 164-168 | **verbatim** - measured count 0 on every probe |
| loopback fixture server (`http.createServer`, `listen(0,'127.0.0.1')`) | 177-194 | verbatim shape |
| `flags[]` | 196-206 | **reuse subset** + add `--remote-debugging-address=127.0.0.1`; keep `--headless=new`, `--remote-debugging-port=0`, `--user-data-dir`, `--no-first-run`, `--no-default-browser-check`, `--disable-gpu`, `--window-size=800,600`, `about:blank` |
| `spawn(browserPath, flags, {stdio:['ignore','ignore','pipe']})` + stderr tail | 207-212 | verbatim |
| discovery legs (`stderr /DevTools listening on ws:/` then `DevToolsActivePort`) | 219-256 | **verbatim** - both legs work here (measured) |
| `jsonEndpoint(p, method)` | 258 | **verbatim** |
| `midRunSweep = sweepOnce(launchToken)` (count >= 1) | 276 | **verbatim** - measured 11-12 |
| `--probe` output block | 284-297 | verbatim shape (this seat's `launch-probe.json` is its Linux sibling) |
| CDP `send()` + pending map | 304-317 | verbatim |
| teardown: `child.kill('SIGKILL')` then `sweepToZero` then assert 0 | 356-371 | **verbatim** |

### From `scripts/webview2-cdp-loopback-round55.mjs` (the control leg)

| symbol | line | reuse verdict |
|---|---|---|
| `mkPage` / `mkFormPage` (keylog recorder, 3 fields, submit button) | 203-220 | **verbatim HTML**, titles -> `tabi-r56` |
| `PAGES` | 222-227 | verbatim |
| fixture server with `/echo` + `served` log + `#echoed`/`#mixed-echoed` | 231-250 | **verbatim** |
| `send` / `evalStr` | 352-366 | verbatim |
| `capture()` (`Page.captureScreenshot`, base64 -> Buffer) | 370-377 | verbatim |
| `waitPath(suffix, extraExpr)` | 386-394 | verbatim |
| `recordStep(leg, suffix, pngName)` | 396-411 | verbatim (per-step PNG + title + `nonceMarker`) |
| journey legs incl. `Page.getNavigationHistory` and `navigateToHistoryEntry` | 413-460 | **verbatim**, preceded by target creation at the data: URL |
| `waitEcho()` | 462-469 | verbatim |
| `clickAt(x,y)` | 471-474 | verbatim |
| `centerOf(id)` | 476 | verbatim |
| `vkFor` / `codeFor` | 492-493 | **VERBATIM, including the `'-'` branch** (`Minus` / 189) - load-bearing, see 2b |
| `vkForChord` / `codeForChord` | 527-528 | verbatim |
| `CHORD_MODS` (Control 2 / Alt 1 / Meta 4) | 575-579 | verbatim |
| `controlDomain` block (End -> Backspace -> restore -> Tab, keylog read after Tab) | 634-674 | **verbatim** |
| `klEq` + `expectedKeylog` derivation | 685-712 | **verbatim** |
| `controlDomain.enter` block (one keyDown, `text:'\r'`, no keyUp) | 727-734 | **verbatim** |
| `ok` control-domain predicate chain | 793-880 | **verbatim** - it is the claim's witness set |
| teardown `sweep()` (`wmic`) | 767-782 | **body replaced** by the r46 POSIX census |

## 4. (c) What must differ

1. **No COM host.** Delete `hostSrc`, `compile`/`cscExe`, `hostExe`, `hostExeSha256`,
   `hostPid`, `hostStdout/Tail`, `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS`,
   `WEBVIEW2_USER_DATA_FOLDER`, `taskkill`, `hostReadySeen`. `host-not-ready` becomes a
   CDP-readiness check; `hostsrc-pin-mismatch` and `hostexe-pin-shape` give way to the
   effective-argv pin.
2. **No WebView2 runtime pin.** Delete `runtimeFolder`, `loaderDll`, `loaderSha256`,
   `runtime-msedgewebview2-absent`, `runtime-folder-not-webview2`,
   `runtime-identity-mismatch`, and the whole declared could-not-evaluate class
   `runtime-pin-host-drift` (there is no auto-updating fixed-version folder here).
   The honesty gap that class disclosed simply does not exist on this host; the version
   is pinned by the binary path plus the recorded version line.
3. **Its own profile and launch token.** `tabi-r56-chromiumdrv-<12 hex>-profile` under the
   **resolved** scratch root, created fresh (`rmSync` then `mkdirSync`). The basename IS
   the launch token, so the census, the profile path and the receipt all carry one string.
   Pre-launch census must be 0 (else refuse the run), mid-run >= 1, post-kill 0. Measured
   on six independent launches: 0 / 11-12 / 0.
4. **Its own binary resolution.** Pin `/usr/lib/chromium/chromium` and record both the
   resolved path and `--version`. If a future host only has a launcher wrapper, the
   receipt must record the **effective** argv (post-injection) and the counter must grade
   the argv pin against it - that is what makes the wrapper's extra flags auditable
   instead of silent.
5. **Its own schema and nonce shape.** `tabi-chromium-cdp-r56` / `tabi-r56-<16 hex>`, so
   cross-refusal is symmetric: the r55 webview2 counter on an r56 receipt dies on
   `schema` + `surface-identity-mismatch` + `host-exe-not-webview2-host` +
   `runtime-folder-not-webview2` + `nonce-shape`; the r56 counter on the committed r55
   receipt dies on its own `schema` + browser-identity findings.
6. **POSIX paths.** `path.win32.*` -> `path.posix.*` in the paths block; the profile
   containment and tail tests normalise on `/`.
7. **Target creation, not target reuse.** `PUT /json/new?<data:url>` (GET is 405), then
   select that target by `type === 'page'` **and** its URL - never "the first page"
   (measured build-component extension `background_page` target).

## 5. Residuals this recon does NOT close (for the L1 to freeze or disclose)

- **One live run per invocation.** The control-leg measurements are from a throwaway
  driver whose nonce (`tabi-r56-60242f101056c63f`) and fixture port differ from the data
  run's; they prove the mechanics, not the claim. The claim needs the committed runner
  against the committed counter, exactly as C2's `before`/`after` commands say.
- **The `data:` boot page is now a real page.** Creating the target at the data: URL
  means the history slot 0 holds the nonce data: page rather than the WebView2 host's
  private `data:` page. The r55 predicate only requires `urls[0]` to start with `data:`;
  the boot page should therefore carry the nonce title so a reviewer can see *which*
  data: page it was.
- **`/favicon.ico`.** Chromium requests it; the server `served` log grows one extra
  entry per form load. `form-server-witness` must keep r55's exact-`includes` form.
- **Headless screenshot timing.** Both history walks produced identical screenshot bytes
  (3,720 B, same sha256) - convenient, and a warning: `main-shot-not-final-step` compares
  records, not pixels, so identical bytes across steps are not a defect.
- **`reuseWithPreData` in `history-shape.json` is contaminated** by walking the same
  target twice; the decisive measurement is `history-data-target.json` (fresh target).
  Recorded rather than deleted, because it is what a naive "navigate to data: first"
  implementation would produce (entriesLength 8 at C).
- **Free space at probe time:** `/fast/scratch` 411 GB free; no ENOSPC.
- **My own leak, disclosed.** One dry run leaked an 11-process Chromium tree for ~3
  minutes (section 0b). It is cleaned (0 survivors, global grep). Recorded here rather
  than silently removed, because it is the evidence for the guard requirement.
- **Scratch left behind by me:** none. The 19 per-run profile directories under
  `$HYAKU_SCRATCH/tabi-r56/R56Scout/` plus the `org.chromium.Chromium.*` temp dirs
  (167 MB total) are still on disk at hand-off; they are this seat's scratch and are
  removed by the lane's scratch policy, not silently relocated.

## 6. Files

- `scout/launch-probe.json` - launch/discovery/argv/census/teardown (survivors 0)
- `scout/control-leg-dryrun.json` - the four control legs measured green
- `scout/portability-micro.json` - wrapper path, `--disable-extensions`, `/json/new`
- `scout/portability-direct.json` - real-binary path (no injected `--load-extension`)
- `scout/history-shape.json` - reuse-about:blank vs PUT /json/new?about:blank
- `scout/history-data-target.json` - PUT /json/new?<data:url> -> data: at slot 0
- `scout/leak-bare.json`, `scout/leak-guarded.json` - the crash-leak measurement (0b)
- `scout/*.mjs.txt` - the throwaway drivers (kept so every number can be re-derived)
