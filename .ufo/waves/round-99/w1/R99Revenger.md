# R99Revenger — protocol-level hypothesis probe (round 99, w1)

Seat: R99Revenger (godspeed). Lane: tabi-shokunin. Ports 34651,34652,34653 only.
Scratch: /fast/scratch/hyaku/tabi-r99/R99Revenger/ (removed before yield).

## Hypothesis (falsifiable)
On the refused arms nothing reaches the browser's file-setting path: PLBN sends
no `DOM.setFileInputFiles` and evaluates no injected `setInputFiles`; PUCN sends
no `DOM.setFileInputFiles`; PLLP and PUCM each send exactly one
`DOM.setFileInputFiles` carrying two files on the iframe's session; PLBX/PLBM send
none (payloads go through the injected script).

## Setup
- Chromium 155.0.8059.84 (/usr/bin/chromium, headless=new for connect legs),
  connect-only harness mirroring scripts/client-oopif-uploadsets-round99.mjs
  fixture shape (parent 127.0.0.1 + cross-site localhost child, #s/#m[multiple],
  listeners record [inputId,type,isTrusted]).
- Client deps: `mkdir -p /fast/scratch/hyaku/tabi-r99/R99Revenger/deps && cd ... &&
  npm init -y && npm install --no-audit --no-fund puppeteer-core@25.16.0
  playwright-core@1.65.0` via npm registry (channel: npm). Verified:
  puppeteer-core 25.16.0, playwright-core 1.65.0.
- TMPDIR=/fast/scratch/hyaku/tabi-r99/R99Revenger/t set before the requires
  (r98 D2).
- Logging: Playwright `DEBUG=pw:protocol,pw:api` + `DEBUG_FILE=<log>` (namespace
  verified: `debugLogger.isEnabled("protocol")` → `pw:protocol` SEND/RECV in
  playwright-core 1.65.0 coreBundle.js, DebugLogger class; task brief's
  `pw:protocol` is correct). Puppeteer `NODE_DEBUG=puppeteer:protocol:*`
  (util.debuglog, stderr capture; prefixes `puppeteer:protocol:SEND/RECV` per
  puppeteer-core Debug.js DEBUG_PREFIXES). Task brief's `puppeteer:protocol:*`
  is correct as a NODE_DEBUG filter.
- Script: .ufo/waves/round-99/w1/R99Revenger-probe.mjs (one rep per leg).
  Trimmed logs: R99Revenger-<leg>.txt (+ R99Revenger-<leg>.txt.json stdout).
  Summary: R99Revenger-results.json.

## Results (one rep each)
Outcome/files/events observed match the frozen predicate on all six legs
(see R99Revenger-results.json). Protocol counts below are SENDs only, per-line
parse (the 344KB utility-script bundle text contains `setInputFiles` as source
text and must not be counted as a call).

| leg | DOM.setFileInputFiles SENDs | files[] | session == iframe session? | Injected `setInputFiles` callFunctionOn | Outcome |
|---|---|---|---|---|---|
| PLBX | 0 | — | — (n/a) | 1, on iframe | resolved |
| PLBM | 0 | — | — (n/a) | 1, on iframe | resolved |
| PLBN | 0 | — | — | 0 | error (Non-multiple) |
| PLLP | 1 | [a(22B), b(30B)] | yes (C09B6A70…) | 0 | resolved, trusted |
| PUCM | 1 | [a(22B), b(30B)] | yes (E08DC76C…) | 0 | resolved, trusted |
| PUCN | 0 | — | — | 0 | error (Multiple file uploads…) |

- PLBX injected call (Runtime.callFunctionOn, session 41837B93… = iframe):
  `([injected, node, files]) => injected.setInputFiles(node, files)` with payloads
  `[{name:"tabi-r99-bytes.png", mimeType:"image/png", buffer: base64(0x00..0xff)}]`
  (driver sent no mimeType; `image/png` is Playwright's S238 mime inference —
  leg landed `[["tabi-r99-bytes.png",256,"image/png"]]` untrusted, as frozen).
- PLBM injected call (session 5A2CC10B… = iframe): two payloads
  `[{p1, text/plain 27B}, {p2, application/octet-stream 36B}]` (S238 fallback);
  leg landed `[["tabi-r99-p1.txt",27,"text/plain"],["tabi-r99-p2.tabi99",36,
  "application/octet-stream"]]` untrusted, as frozen.
- PLBN: refused before file-setting. The only file-related SEND is
  `Runtime.callFunctionOn(utilityScript.evaluate(...), "([injected, node, {multiple,
  directoryUpload}]) => { … if (multiple2 && !inputElement.multiple && …)
  throw … 'Non-multiple file input can only accept single file' … }")` — the
  S240 utility-world refusal check — whose RECV is the `Error: Non-multiple…`
  exception (id 63). Zero `DOM.setFileInputFiles`, zero `injected.setInputFiles`
  calls, inputs `[]`, no event.
- PLLP verbatim (id 69):
  `pw:protocol SEND ► {"id":69,"method":"DOM.setFileInputFiles","params":
  {"objectId":"-6935380057157982038.2.5","files":["/fast/scratch/hyaku/tabi-r99/
  R99Revenger/tabi-r99-a.txt","/fast/scratch/hyaku/tabi-r99/R99Revenger/
  tabi-r99-b.txt"]},"sessionId":"C09B6A7037A135185242D4FF686E5870"}` —
  sessionId equals the `type=iframe` attachedToTarget sessionId in the same log.
- PUCM verbatim (id 65):
  `PUPPETEER:PROTOCOL:SEND ► … {"method":"DOM.setFileInputFiles","params":
  {"objectId":"3502789673654414089.2.4","files":[…a…,…b…],"backendNodeId":2},
  "id":65,"sessionId":"E08DC76C87B87970AFA9C7FCEAAC4C3C"}` — sessionId equals the
  iframe session; sequence `Runtime.callFunctionOn(element=>element.multiple)` →
  `DOM.describeNode` → `DOM.setFileInputFiles` (S237 code order).
- PUCN: `Runtime.callFunctionOn(element=>element.multiple)` (sender frame
  ElementHandle.js:119) then the client-side `assert` throws; `DOM.setFileInputFiles`
  total 0; no `DOM.describeNode` after the `.multiple` read (only earlier frame
  lookups), inputs `[]`, no event. Nothing reached the browser's file-setting path.

## Sub-hypothesis verdicts (all CONFIRMED)
1. PLBN sends no DOM.setFileInputFiles: CONFIRMED (0/0).
2. PLBN evaluates no injected setInputFiles: CONFIRMED (0 callFunctionOn
   `injected.setInputFiles`; the single Runtime.evaluate mentioning the bundle is
   the 344KB utility-script definition, not an execution).
3. PUCN sends no DOM.setFileInputFiles: CONFIRMED (0/0).
4. PLLP sends exactly one DOM.setFileInputFiles with two files on the iframe
   session: CONFIRMED.
5. PUCM sends exactly one DOM.setFileInputFiles with two files on the iframe
   session: CONFIRMED.
6. PLBX/PLBM send none (payloads via injected script): CONFIRMED (0 DOM sends
   each; 1 injected call each on the iframe session).

## Caveats
- Connect-mode legs only (PUAM/PLAM launch arms not probed here; PLLP used
  isLocal:true, others connectOverCDP without isLocal / Puppeteer connect).
- One rep per leg (hypothesis probe, not the scored 3×8=24-leg counter run).
- `Runtime.evaluate` raw string counts are quoted only as executed-call counts;
  bundle-source-text mentions are excluded and named above.

## No mutation
No lane files edited outside .ufo/waves/round-99/w1/; no git/jj/commit; no
background jobs. `pgrep -f "remote-debugging-port=34653"` empty at each leg end
and before yield; chromium processes killed only under my own ports/scratch.

VERDICT C1: neutral
