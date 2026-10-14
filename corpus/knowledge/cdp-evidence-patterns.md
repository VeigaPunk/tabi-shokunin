<!-- corpus entry — tabi-shokunin round 1 (2026-10-14), lane TABI-3 (probation wave 1). Method: self-launched loopback CDP session on chromium 152 headless, scratch port 19333, one data: URL navigated; screenshot bytes + DOM snapshot + target-list schemas captured; browser killed and port closure verified. Scratch artifacts staged at /tmp/tabi3-cdp/ (ephemeral — archive before they matter). Housekeeping left to the integrating round: LOG.md append per AGENTS.md:3, corpus map row still empty at corpus/README.md:5-6. This lane's write scope was this file only. -->

# CDP evidence-capture discipline — re-runnable loopback session

Scope: PROVINCE.md:9-13 (CDP session discipline: endpoints, targets, screenshot/DOM evidence
capture). Refusals honored (PROVINCE.md:15-19): no external site touched (only a `data:` URL),
no secrets read, no consequential actions. Admission bar: corpus/QUALITY.md:1-8.

Claims below are observations with anchors (`command`, `path:line`, evidence id), marked
inference, or listed under §6 Unknowns. All evidence was produced 2026-10-14 on this host.

## 1. Launch recipe (observed)

Host inventory first (never oral knowledge):

- `chromium --version` → `Chromium 152.0.7977.82 Arch Linux`
- `node --version` → `v24.21.0` — node ≥21 has a built-in global `WebSocket` (`node -e "console.log(typeof WebSocket)"` → `function`), so CDP works with zero npm deps. Python on this host lacks `websocket`/`websockets` (`ModuleNotFoundError` both) — rejected as a path.
- `/usr/bin/chromium` is an ELF launcher (14,424 B) that execs `/usr/lib/chromium/chromium` and appends flags from an `XDG_CONFIG_HOME` `chromium-flags.conf`; `/etc/chromium-flags.conf` is absent, `~/.config/chromium-flags.conf` holds 4 lines (`--ozone-platform=wayland`, `--ozone-platform-hint=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`, `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`). *(Inference, strong: the launcher binary's strings name `chromium-flags.conf`/`XDG_CONFIG_HOME`, and the child process line (below) begins with these 4 flags verbatim. Consequence: `chromium …` is NOT the effective command — record the child line, not what you typed.)*

Command used (scratch port checked free first: `ss -ltn | grep ':19333 '` → empty):

```sh
setsid nohup chromium --headless=new --remote-debugging-port=19333 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir=/tmp/tabi3-cdp/profile \
  --no-first-run --no-default-browser-check --disable-gpu about:blank \
  > /tmp/tabi3-cdp/chromium.log 2>&1 &
```

Effective child process line (E1, from `ps -eo pid,args`, abridged):

`/usr/lib/chromium/chromium --ozone-platform=wayland --ozone-platform-hint=wayland --enable-features=TouchpadOverscrollHistoryNavigation --load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url --headless=new --remote-debugging-port=19333 --remote-debugging-address=127.0.0.1 --user-data-dir=/tmp/tabi3-cdp/profile --no-first-run --no-default-browser-check --disable-gpu --noerrdialogs --ozone-platform=headless --ozone-override-screen-size=800,600 --use-angle=swiftshader-webgl about:blank`

- Loopback binding (E2): `ss -ltnp | grep 19333` → `LISTEN 0 10 127.0.0.1:19333 0.0.0.0:* users:(("chromium",pid=1315427,fd=77))` — the endpoint is on 127.0.0.1 only. (Not tested: reachability from another host/interface; see §6.)
- Startup log (E3, /tmp/tabi3-cdp/chromium.log:2): `DevTools listening on ws://127.0.0.1:19333/devtools/browser/c1bf364a-9e6d-405a-85cf-4f83d7f56856` — the browser-level WS endpoint; note chromium itself prints the loopback form.
- Egress caveat (E4, chromium.log:3-6): even this fresh profile emitted outbound Google traffic (`google_apis/gcm/…` `DEPRECATED_ENDPOINT`, `Authentication Failed: wrong_secret`, GCM reset). *"Loopback-only debug endpoint" does not mean "browser makes no network calls."* If a claim needs no-egress, add `--disable-background-networking` (untested; §6).

## 2. HTTP control surface — `/json/version` and `/json/list` (observed)

`/json/version` (E5) returned exactly: `Browser` (`Chrome/152.0.7977.82`), `Protocol-Version` (`1.3`),
`User-Agent` (`…HeadlessChrome/152.0.0.0…`), `V8-Version` (`15.2.124.21`), `WebKit-Version`,
`webSocketDebuggerUrl` (`ws://127.0.0.1:19333/devtools/browser/<uuid>`).

`/json/list` schema (E6) — JSON array of targets; sorted field names as observed:

`description, devtoolsFrontendUrl, id, title, type, url, webSocketDebuggerUrl`

- `id` was 32-char uppercase hex (e.g. `38204F3DC6886277C5D400107604A825`), per-launch, **not stable across launches** — match targets by `url`/`title`, never by id.
- `webSocketDebuggerUrl` is per target; connecting straight to it gives a page session without `Target.attachToTarget`.
- Observed `type` values **across snapshots of the same browser**: `page`(1) + `browser_ui`(2) at capture time; an earlier launch-window listing (output truncated at 50 lines) additionally showed `background_page` (title `Google Hangouts`, url `chrome-extension://nkeimhogjdpnpccoofpliimaahmaaome/background.html`) and `service_worker` (title `Service Worker chrome-extension://…/background.js`). Between the two snapshots the extension targets disappeared — **the target list is a time-varying inventory, not a system census**; snapshot it at capture time.
- The `service_worker` id `baflhghklkoibehmofgdmfdfkgpmngkg` was verified to be the `copy-url` extension: `sha256("/home/vgpnk/.local/share/omarchy/default/chromium/extensions/copy-url")`, first 32 hex digits mapped `0-9a-f→a-p`, yields exactly that id (python cross-check, match: `True`). So the wrapper-injected `--load-extension` flag did take effect despite its literal `~` (resolution mechanism unexamined; §6). *(Inference: the flat 3-target snapshot later means dormant extension targets drop off the listing — mechanism unconfirmed, §6.)*
- Page `title` tracks the document: after navigation, the page target's `title` read `tabi3-probe`, matching `Runtime.evaluate(expression: "document.title")` (E7).

## 3. Browser-level `Target.getTargets` (observed)

On the browser WS endpoint, `Target.getTargets` → `{targetInfos:[…]}`, count 3 (same inventory as `/json/list` at that moment). Field names on the first targetInfo (E8):

`attached, browserContextId, canAccessOpener, targetId, title, type, url`

So the protocol surface exposes `attached` and `browserContextId`, which `/json/list` omits (field names recorded from the page targetInfo only; values/optionality across other target types not fully recorded). Prefer this call when you must know *attached* state; prefer `/json/list` when you want the same view a devtools frontend would get.

## 4. Navigation + DOM evidence (observed)

Navigated a data URL (exact document):
`<!doctype html><html><head><title>tabi3-probe</title></head><body><h1 id="h">TABI-3 evidence probe</h1><p id="p">loopback capture</p></body></html>`
via `Page.navigate`; readiness polled with `Runtime.evaluate("document.readyState")` until `complete` (a load event raced unreliably here; polling is the robust wait). `Page.navigate` returned `frameId == target id` for the main frame (observed once; generalization per version unverified, §6).

**Screenshot (E9).** `Page.captureScreenshot {format:"png", captureBeyondViewport:true}` → `result.data` base64 (12,100 chars) → 9,074 bytes; PNG magic `89504e470d0a1a0a`; IHDR says **780×493**. SHA-256: `c1ba9588baa833dd33f9378a10f4f0e9a1cb50e06667ddd99b1198fd58c93b6e`.

- Byte-determinism in this environment: two independent probe runs (fresh navigation each) produced the identical hash and byte count; on-disk `sha256sum /tmp/tabi3-cdp/screenshot.png` re-matched after the fact.
- Content was visually verified by reading the PNG back (heading + paragraph rendered as authored).
- Determinism is **environment-scoped** (same chromium build, OS, fonts, content, flags) — do not generalize to real pages or other builds.
- Viewport geometry: 780×493 vs the appended `--ozone-override-screen-size=800,600` is unexplained (window metrics not recorded; §6).

**DOM.getDocument (E10).** `{depth:-1}` → root keys: `backendNodeId, baseURL, childNodeCount, children, compatibilityMode, documentURL, localName, nodeId, nodeName, nodeType, nodeValue, xmlVersion`; root = `{nodeId:1, backendNodeId:2, nodeType:9, nodeName:"#document"}`; recursive walk counted 11 nodes for this tiny document (text nodes included).

**DOMSnapshot.captureSnapshot (E11).** `{computedStyles:[]}` → top level `{documents, strings}`; `strings.length` 18; `documents.length` 1; document keys: `baseURL, contentHeight, contentLanguage, contentWidth, documentURL, encodingName, frameId, layout, nodes, publicId, scrollOffsetX, scrollOffsetY, systemId, textBoxes, title`; `nodes` is **columnar** (parallel arrays) with fields `attributes, backendNodeId, contentDocumentIndex, currentSourceURL, inputChecked, inputValue, isClickable, nodeName, nodeType, nodeValue, optionSelected, originURL, parentIndex, pseudoIdentifier, pseudoType, shadowRootType, textValue`. Values like `nodeName` are **indices into `strings`** (sample node 0: nodeType 9 → `#document`, parentIndex −1). Node count (11) matched the `DOM.getDocument` walk — two independent surfaces agreeing.

## 5. What makes a page-claim re-verifiable (rules, each earned from the above)

A page claim is re-verifiable when the record carries enough anchors for a third party to
re-observe the same state, and carries each anchor's determinism class:

1. **URL + exact navigation input.** Record the literal URL (for `data:` URLs, the whole document string — E7 shows the target's `url` field preserves it verbatim). A page claim without its URL/title is unfalsifiable.
2. **Browser provenance, effective form.** Chromium version + the **child process line** (E1), not the typed command — host launchers inject flags (`chromium-flags.conf`, above). Version-pin protocol shape too: `Protocol-Version` (E5) and the devtools frontend revision embedded in `devtoolsFrontendUrl` (E6).
3. **Session slot.** Capture time (both UTC and local), browser WS endpoint (E3), target `id` + `frameId` (E6/E8). Ids are per-launch: re-verification re-identifies the target by URL/title, then records its new id.
4. **Evidence bytes + hash.** Screenshot: store the PNG, its sha256, byte count, stereo dims, and that it was read back visually (E9). DOM: store the method + parameters (`depth:-1`, `captureSnapshot` flags) because shape depends on them; store the `strings` table or resolved excerpts, since raw `nodes` fields are indices (E11). A hash alone proves integrity, not meaning.
5. **Determinism class per artifact.** Mark byte-stable (E9 screenshot, this environment) vs time-varying (target inventory drifted mid-session, §2; ids per launch). A claim resting on a time-varying datum must be stated as-of-capture with its snapshot attached.
6. **Cross-checks.** Prefer claims where two independent surfaces agree (`title` in `/json/list` vs `document.title` E7; DOM node count vs DOMSnapshot count E10/E11). Surface disagreement is itself evidence — usually staleness, not contradiction.
7. **Fetch vs observe disambiguation.** State which channel produced each fact: HTTP `/json/*` (E5/E6), browser-level protocol (E8), page-level protocol (E7/E9/E10/E11), or the browser's own log (E3/E4). Logs are the only surface that survives was-never-in-a-devtools-session questions.
8. **Cleanup proof.** A session's "no trace left" is a claim too: pairs with §5.5 below (pre-kill listening line, post-kill refusal). An evidence session that leaves a debug port open is an operational hazard — that port is full browser control.
9. **Archive or it didn't happen.** Hashes over `/tmp` artifacts are only verifiable while `/tmp` lives. This note's artifacts are staged at `/tmp/tabi3-cdp/` (`screenshot.png`, `run1.json`, `cdp-summary.json`, `chromium.log`, `cdp-probe.mjs`); a claim graduating past staging must copy bytes into durable corpus storage.

## 6. Cleanup recipe (executed) + verification

Kill by PID discovered from the process table, not by name:

```sh
CDPPIDS=$(ps -eo pid,comm,args | awk '$2=="chromium" && $0 ~ /\/tmp\/tabi3-cdp/ {print $1}')
kill $CDPPIDS          # escalate to kill -9 only if a scan still shows survivors
```

Verified after: process scan for the scratch profile → empty; `ss -ltn | grep ':19333 '` → nothing (`port 19333 not listening`); `curl http://127.0.0.1:19333/json/version` → exit 7, `Could not connect to server`. Post-shutdown log lines (chromium.log:7-8, zygote/GCM errors as the process died) are benign shutdown noise; the port evidence is what counts.

Calibration — **the `pkill -f` self-match**: an earlier cleanup attempt used `pkill -f 'user-data-dir=/tmp/tabi3-cdp'`; the pattern matched the invoking shell's own command line, killing the shell mid-script (tool call aborted, exit −1) before its verification steps ran. Kill by explicit PIDs, or exclude `$$`. The kill itself had worked — but an unverified kill is an unknown, not a cleanup. Keep: rejections/incidents are evidence, not shame (QUALITY.md:5).

## 7. Unknowns (do not convert to claims without a new probe)

1. Why extension targets (`background_page`, `service_worker`) vanished from listings within ~1 minute of launch (idle/dormant behavior?) — unconfirmed.
2. Screenshot 780×493 vs `--ozone-override-screen-size=800,600` — window metrics / DPR / viewport not recorded.
3. Mechanism by which `~` inside the wrapper's `--load-extension` flag resolved (extension demonstrably loaded, §2) — shell/glib/chromium-side expansion unidentified.
4. `attached` / `browserContextId` values and optional-field behavior across non-page target types — field names only were recorded.
5. `frameId == target id` on the main frame — seen once on this build; version-scoped generalizability untested.
6. External reachability of port 19333 — the loopback claim rests on the `ss` bind line only; no cross-interface or firewall test; Host-header/DNS-rebinding protections untested.
7. Whether `--disable-background-networking` actually stops the observed GCM egress (E4).
8. Byte-determinism beyond static `data:` content (real pages, fonts, GPU paths) — untested.

## 8. Errata (append-only — never edit above blocks)

*(none yet)*

Appended 2026-10-14 (tabi round 2, lane TABI-R2-3; command transcripts staged
at `/tmp/tabi-r2-3-verify/`, volatile). Entries below supersede the
placeholder above; nothing above is edited. Pre-append sha256 of this file:
`034b1e53b004ed5366530d286cf36deca6681d7f726940ff4a06e16f690cfbb0` (= the
`SKILL.md:23-27` pin `034b1e53b004` at append time). The post-append hash
necessarily differs — re-derive with `sha256sum` and refresh the pin.

- **[2026-10-14, TABI-AUDIT2 wave-1 re-run + primary-record diff] CORRECTED —
  root `backendNodeId` is per-capture, not 2.** §4 E10 (:75) prints the
  `DOM.getDocument` root as `{nodeId:1, backendNodeId:2, …}`. The staged
  records disagree within the same session: `run1.json` root `backendNodeId`
  = 2 (12:54:11Z) vs `cdp-summary.json` = 1 (12:54:26Z); the wave-1 audit
  (fresh browser, port 19441) measured 1 again
  (`/tmp/tabi-audit2-cdp/audit-summary.json` → `getDocumentRoot.backendNodeId:
  1`). Correct reading: `nodeId:1` / `nodeType:9` / `nodeName:"#document"`
  held in all records; record `backendNodeId` per capture, never key on it.
  The rest of E10 (root key list, 11-node walk) held.
- **[2026-10-14, primary-record diff] CORRECTED — §5.1's "the target's `url`
  field preserves it verbatim" is wrong as stated.** The original capture's
  `url` / `location.href` read back percent-encoded —
  `data:text/html;charset=utf-8,%3C!doctype%20html%3E…` (`run1.json`
  `listAfter.probeTarget.url`) — because the recipe navigated with
  `'data:text/html;charset=utf-8,' + encodeURIComponent(doc)`
  (`/tmp/tabi3-cdp/cdp-probe.mjs:5`). The wave-1 audit navigated the raw
  `data:text/html,<…>` form and read that raw form back
  (`audit-summary.json` → `urlPreservedVerbatim:true`). Correct rule: `url`
  holds the URL as navigated **after browser normalization** — record the
  as-read-back string, and for `data:` URLs the exact navigation input too.
  The "(E7 …)" cite was also off: E7 is the title cross-check (:52).
- **[2026-10-14, wave-1 audit] RE-VERIFIED — screenshot determinism held a
  third time, cross-session.** `sha256sum /tmp/tabi3-cdp/screenshot.png` →
  `c1ba9588baa833dd33f9378a10f4f0e9a1cb50e06667ddd99b1198fd58c93b6e`
  (= §4 E9 value), 9,074 B, IHDR 780×493; the wave-1 audit's independent
  session produced the byte-identical PNG (same 12,100-char base64, same
  sha256, `screenshotsByteIdentical:true`). The environment-scoped claim
  (:72) stands.
- **[2026-10-14, records] §7 item 5 extended — `frameId == target id` now
  observed three times.** `run1.json` `runtimeCrossCheck.navFrameId` == page
  target id `38204F3DC6886277C5D400107604A825`; the wave-1 audit re-observed
  `frameIdEqualsTargetId:true` in a separate session. The "seen once" datum
  is superseded; still build-scoped (chromium 152.0.7977.82) and the general
  claim still unproven.
- **[2026-10-14, wave-2 evidence] §7 item 7 and item 8 narrowed by the
  round-2 capture note (pointer).** `--disable-background-networking` under
  the round-2 flags did not stop GCM registration attempts/logs (client-log
  observation only) — `live-dynamic-capture.md` §6. Byte-determinism beyond
  static content: demonstrated on an HTTP-served fixture with JS hydration
  **when the rendered state is deterministic**, refuted for time-varying DOM
  text (`live-dynamic-capture.md` §3, which also gives a viewport-pin bypass
  for §7.2). §7.2 itself stays unexplained.
- **[2026-10-14, evidence review] CALIBRATION — the "earlier launch-window
  listing" (§2, :50; extension `background_page` + `service_worker` sighting)
  is not backed by a staged artifact.** Both staged listings
  (`run1.json` / `cdp-summary.json` `listBefore`) show only `page`(1) +
  `browser_ui`(2), as did the wave-1 audit; that sighting rests on CLI output
  truncated at 50 lines and never archived — single-source, non-replayable.
  §7 item 1 (why extension targets vanished) stays open.