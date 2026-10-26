# CritEntryDifferences — w2 attack on `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` §3/§4/§5

## Verdict

**Holds, with three minor documentation defects (one moderate).** Every one of the eleven
claimed engine differences (D1–D11) is **present in the committed transcripts**, not just in the
w1 one-session delta: I reproduced each D1–D10 observation on the two committed Firefox runs
(`corpus/evidence/round-35/bidi-firefox/run1.jsonl`, `run2.jsonl`) and the two committed
round-32 Chromium transcripts (`corpus/evidence/round-32/bidi/run1/transcript.jsonl`,
`run2/transcript.jsonl`), and on the delta records. No claimed difference is an overreach of a
one-session delta. However:

1. **D10 (moderate)** overstates the Chromium `request.request` grammar. The committed transcripts
   show Chromium request ids in *two* shapes: navigation requests are 32 uppercase hex
   (`DDF778C6456D1668F9703C6FD1CA5FBE`), but the fetch/subresource requests that the rows
   `getData`/`continueRequest` actually echo are **decimal-dotted** (`"483282.3"`). The sentence
   "the request id a `continueRequest`/`getData` must echo is 32 uppercase hex on Chromium" is
   false for the very rows the counter exercises.
2. **D10** says `getTree` returns "the same eight keys" — both engines return **seven** keys
   (`children clientWindow context originalOpener parent url userContext`); the set is identical,
   the count is not eight.
3. **D2** says Chromium "publishes **no** chromedriver-version capability at all" — the committed
   Chromium caps *do* carry the driver version, nested under the `chrome` key
   (`chrome.chromedriverVersion`). The intended contrast (no flat `moz:`-style version key) holds,
   but the sentence as written is overbroad.
4. **§4 cost row** quotes "2,312 ms Firefox vs 1,104 ms Chromium" and cites sibling artifact
   `w1/ExecFirefoxDelta/shapes.json`; that artifact and `delta.md` record **1054 ms** and
   **2332 ms**. The quoted numbers do not match the cited artifact (minor transcription error).

§4 decision-table conditions are falsifiable and not universal: each row's condition is a live,
checkable clause (predicate holds on committed runs + live session; per build; per shape; sample
size stated), and the "neither" row states a scope limit rather than a universal claim. No
condition is unbounded.

## Evidence

All inspections were read-only over the lane checkout; no lane scripts ran, no browser was
launched. Parsing/statistics were done with `node v24.21.0` (exit code 0 on every run); digests
with `sha256sum` (exit 0). File references below are lane-relative.

### D1 identity grammars — reproduced in committed runs
- `run1.jsonl:1` sessionId `0bbeca6a-dbcc-4219-a397-ea458e786a1d` (UUID); `:5` context
  `658356ec-b45e-45b8-ba2d-e313609aef68`; `:18` realm `d8c77d4a-e4cf-41fa-a70c-b7dbc9f42781`;
  `:24` sharedId `d468079e-f8ae-4e49-9ee0-15ac5902fcb3`. Same shapes in `run2.jsonl`
  (`8efe5e35-…`, `cff1dabb-…`, `ed04bdbb-…`, `b9e50240-…`).
- Chromium committed: `run1/transcript.jsonl:1` sessionId `10abbb479bdcc37a405098c5ea778bf0`
  (32 lowercase hex); `:5` context `31B8FE9C25C36020CBB175F250715903` (32 uppercase hex);
  `:16` realm `-5557482705395649225.-4539730934041801561` (dotted decimal pair, different pair at
  `:66`); `:22` sharedId `f.31B8FE9C25C36020CBB175F250715903.d.DDF778C6456D1668F9703C6FD1CA5FBE.e.4`.
  `run2` same (sessionId `6b30c7033f4821af5f94d9e75e85b234`, context `0E62B928C3D82E935056B338D5E0FBF4`).
- Claim holds. (getTree keys: see D10 note 2.)

### D2 capability namespaces — reproduced
- `run1.jsonl:1` caps: 22 keys incl. `moz:geckodriverVersion:"0.37.1"`, `userAgent`, `moz:headless`,
  `moz:windowless`, `moz:profile` (`/fast/scratch/…`). `run2.jsonl:1` identical set.
- `run1/transcript.jsonl:1` caps: 22 keys incl. `chrome:{chromedriverVersion:"154.0.8037.97 (…)",…}`,
  `goog:chromeOptions`, `goog:processID`, `webauthn:*`, `fedcm:accounts`, **no** top-level
  `moz:`-style version key, **but** `chrome.chromedriverVersion` present ⇒ the sentence
  "publishes **no** chromedriver-version capability at all" is overbroad (defect 3).
- `moz:profile` is an absolute host path in both committed Firefox transcripts
  (`/fast/scratch/hyaku/tabi-r35/L1/int/tmp/fx-…`), consistent with D2's redaction warning.

### D3 `userContext` / `goog:resource*` — reproduced
- Firefox: **all 20 events** in each committed run carry `userContext:"default"` on their params:
  `run1.jsonl:11,12,13,14,17,40,41,51,55,58,59,60,62,63,65,66,67,68,69,75` (same lines in
  `run2.jsonl`); `userPromptOpened` at `:75` has `userContext`. Zero `goog:resource*` fields.
- Chromium: **zero** events carry `userContext`; all 10 network events carry `goog:resourceType`
  and `goog:resourceInitiator` inside `request` (`run1/transcript.jsonl:11,12,38,39,49,53,56,57,62,63`).
- Delta parity: `firefox-raw.jsonl:12,13,14,75`; `chromium-raw.jsonl:12,13,14,69`.

### D4 screenshot bytes — reproduced with exact digests
| transcript | base64 chars | bytes | IHDR | sha256 |
|---|---|---|---|---|
| `run1.jsonl:22` | 12604 | 9451 | `00000280 000001e0` | `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` |
| `run2.jsonl:22` | 12604 | 9451 | same | same |
| `run1/transcript.jsonl:20` | 8836 | 6626 | same | `ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5` |
| `run2/transcript.jsonl:20` | 8836 | 6626 | same | same |
- Cross-engine differs, within-engine identical across committed runs (matches counter's binding axis).

### D5 favicon fetches — reproduced
- Firefox committed: 8 `network.beforeRequestSent`, 3 favicon (`run1.jsonl:13` after first
  `/a.html`, `:62` after `/b.html`, `:68` after traversal back; interleaving confirmed:
  traverseHistory send `:64`, favicon BRS `:68`, `location.pathname` probe `:71`).
- Chromium committed: 5 BRS, 0 favicon (`run1/transcript.jsonl:11,38,49,56,62`).

### D6 request headers — reproduced
- Firefox `/a.html` BRS: 11 headers, all unique, `Host` first
  (`{"name":"Host","value":{"type":"string","value":"127.0.0.1:46819"}}`) — `run1.jsonl:11`.
- Chromium: 19 headers, 14 unique, the five names duplicated verbatim, first entry
  `Upgrade-Insecure-Requests` — `run1/transcript.jsonl:11`.
- Both encode values as `{"type":"string","value":…}`.

### D7 response fields — reproduced
- `/a.html` responseCompleted, Firefox: `bodySize:474`, `content:{size:0}`, `headersSize:217`,
  `mimeType:"text/html;charset=utf-8"`, header order `content-type, cache-control, x-tabi-fixture,
  Date, Connection, Keep-Alive, Transfer-Encoding`, `bytesReceived:703` — `run1.jsonl:12`
  (identical `run2.jsonl:12`, delta `firefox-raw.jsonl:13`).
- Chromium: `bodySize:703`, `content:{size:474}`, `headersSize:198`, `mimeType:"text/html"`, order
  `Connection, Date, Keep-Alive, Transfer-Encoding, cache-control, content-type, x-tabi-fixture`,
  `bytesReceived:703` — `run1/transcript.jsonl:12` (same `run2`, delta `chromium-raw.jsonl:13`).

### D8 cookies — reproduced
- Firefox: `sameSite:"default"`, no `goog:` fields, result-level `partitionKey:{}`, cookie-level no
  partitionKey, `httpOnly:false`, `secure:false`, `size:13`, `value:{type:"string",value:"1"}`
  — `run1.jsonl:46`, `run2.jsonl:46`, `firefox-raw.jsonl:46`.
- Chromium: `sameSite:"none"` + `goog:priority/session/sourcePort/sourceScheme`, result-level
  `partitionKey:{userContext:"default"}`, same shared fields — `run1/transcript.jsonl:44`,
  `run2/transcript.jsonl:44`, `chromium-raw.jsonl:44`.

### D9 intercept/collector/`getData` — reproduced
- Collector/intercept are UUIDs on both engines (`run1.jsonl:9,48`; `run1/transcript.jsonl:9,46`).
- Blocked BRS lists `intercepts:[<id>]` and is followed by `continueRequest` → `{}`
  (`run1.jsonl:51,52,53`; `run1/transcript.jsonl:49,50,51`).
- `getData` returns `bytes:{type:"string",value:"tabi-bidi-body-0123456789\n"}` (26 chars) on both
  (`run1.jsonl:44`; `run1/transcript.jsonl:42`).

### D10 network ids — **partially overstates (defect 1)**
- `navigation` is a UUID on both: `run1.jsonl:11` `e45aab03-…`; `run1/transcript.jsonl:11`
  `a0e521a8-…`. ✓
- Firefox `request.request` is `<int>-<uuid>` on every request: `run1.jsonl:11,13,40,51,58,62,65,68`
  (`6-8d9dcba4-…` … `14-8d9dcba4-…`). ✓
- Chromium `request.request`: **navigation** requests are 32 uppercase hex
  (`run1/transcript.jsonl:11` `DDF778C6456D1668F9703C6FD1CA5FBE`, `:56`, `:62`), but **fetch**
  requests are decimal-dotted (`:38` `"483282.3"`, `:49` `"483282.4"`), and the `getData`/`continueRequest`
  commands echo those decimal-dotted ids (`:41` `"483282.3"`, `:50` `"483282.4"`). So the sentence
  "the request id a `continueRequest`/`getData` must echo is 32 uppercase hex" is false for the
  exercised rows; the true statement is "navigation request ids are 32 uppercase hex; fetch request
  ids are decimal-dotted and are the ones echoed". Malformed in delta too
  (`chromium-raw.jsonl:12` nav `BD28158C-…` vs `:39` fetch `3566294.3`).
- `setViewport`/`traverseHistory`/`handleUserPrompt` return `{}` on both (`run1.jsonl:7,70,77`;
  `run1/transcript.jsonl:7,61,71`); `innerWidth` 640; `#out` `clicked:tabi`; `#t` `tabi` on both.
- `timings` differ in kind as claimed: Chromium `timeOrigin:1793030723344` (non-zero integer) with
  all-zero deltas; Firefox `timeOrigin:0` with fractional `requestTime:1793050353023.61`
  (`run1.jsonl:11` vs `run1/transcript.jsonl:11`). ✓
- **`getTree` keys: seven on both, not eight (defect 2):**
  `run1.jsonl:5` = `[children,context,originalOpener,url,userContext,clientWindow,parent]`;
  `run1/transcript.jsonl:5` = `[children,clientWindow,context,originalOpener,parent,url,userContext]`.
  Same set, same count (7); the entry's list itself contains seven names.

### D11 egress — consistent with sentinel record
- `measure/driver-egress-sample.txt` is **0 bytes** (empty), which is consistent with "sampled 0
  non-loopback sockets" (an empty socket list), but the file carries no attestation lines; the
  claim's support is the sentinel seat's record, not this file's content. Prefs claim and M3 note
  (counter live leg not loopback-only) match the recorded defect ledger. Not a transcript claim.

### §3 table spot-checks against committed transcripts (all hold)
- R1: caps `browserName:"firefox"`, `browserVersion:"158.0.1"` both runs, `moz:geckodriverVersion`
  present, `webSocketUrl` = `ws://127.0.0.1:39419/session/0bbeca6a-…` / `ws://127.0.0.1:38493/session/8efe5e35-…`
  (matches `^ws://` on 127.0.0.1 ending `:<port>/session/<sessionId>`).
- R2: `contexts` non-empty, every context a UUID string.
- R3: navigate result returns same `url`; `browsingContext.load` event carries it (`run1.jsonl:14,15`).
- R4: IHDR exactly 640×480 (D4 table).
- R5: `locateNodes` `#h` → exactly one node, `localName:"h1"` (`run1.jsonl:24`).
- R6: `script.evaluate` `window.__ready` `awaitPromise:true` → `"settled"` (`:18`).
- R7: after `setViewport` 640×480, `innerWidth` = 640 (`:20`).
- R8: after pointer down/up on `#b`, `#out` reads `clicked:tabi` (`:38`).
- R9: after key actions, `#t` value `tabi` (`:34`).
- R10: for `/a.html` both `network.beforeRequestSent` and `network.responseCompleted` observed
  (`:11,:12`).
- R11: response `status:200`, header `x-tabi-fixture: r32` (`:12`).
- R12: collector registered before request (`:8,:9` before `:10`), then `getData` bytes equal
  `/data.txt` body (`:44`).
- R13: `beforeRequestSent` for `/data.txt?held=1` `isBlocked:true` with `intercepts` list
  (`:51`), `continueRequest` follows (`:52`).
- R14: after `/b.html` navigate, `traverseHistory delta:-1`, `location.pathname` = `/a.html`
  (`:64,:72`).
- R15: `storage.getCookies` contains `tabi_fixture=1` (`:46`).
- R16: no command exists; no committed transcript contains any navigation-stop command (grep for
  `stop`/`screencast` finds none) — consistent with "no committed run can carry it".
- R17: `browsingContext.userPromptOpened` `tabi-alert` event (`:75`), `handleUserPrompt` success
  (`:77`).
- Run shape: 28 sends, 20 events, 0 errors in each committed Firefox run; transcripts distinct
  (sha256 `0ef2e7e5c20241565aa4b307bddbac9886c8099cca80360660bbbbcb16a2f62a` vs
  `6754ec2dca56c417341431f00cf773964bec68ad10b35e2e6aeb32f92a06f687`).

### §4 decision-table falsifiability
- All "either engine" / "both engines" rows have operational conditions (predicate holds on
  committed runs + live session; per-build admission; shape requirement; sample-size statement) that
  are checkable and engine-scoped — none is universal. The "neither" row is an explicit scope
  limit, not a condition.
- **Defect 4:** the cost/latency row's parenthetical "2,312 ms Firefox vs 1,104 ms Chromium" does
  not match the cited artifact `w1/ExecFirefoxDelta/shapes.json` (`runs` = 1054 ms chromium, 2332
  ms firefox) nor `delta.md` ("Walls: Chromium 1054 ms, Firefox 2332 ms"). Direction (Firefox
  slower) is right; magnitudes are wrong.

## Report

- Verdict: **holds** for all 11 engine-difference claims and all §3 row verdicts against the
  committed transcripts; **defects** (documentation, minor-to-moderate): D10 request-id grammar
  overstatement (moderate), D10 "eight keys" count (seven), D2 "no chromedriver-version capability"
  overbreadth, §4 wall-time figures mismatch the cited artifact. No claimed difference is an
  overreach of the one-session delta.
- Deliverable: this report at `.ufo/waves/round-35/w2/CritEntryDifferences.md`.
