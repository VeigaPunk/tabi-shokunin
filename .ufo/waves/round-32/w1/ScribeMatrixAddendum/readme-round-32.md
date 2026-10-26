<!-- DRAFT snippet (round 32, w1, seat ScribeMatrixAddendum) — append verbatim to the END of
     corpus/README.md. Append-only: no earlier byte changes. -->

## Round 32 — WebDriver BiDi runtime measurement (2026-10-26)

Append-only. One knowledge row; no earlier line is edited. The round-1 coverage row at
`:168` and the round-1 frontier row at `:191` (its status cell begins `docs-held — spec
map only; no BiDi session measured`) keep their bytes and describe the 2026-10-19
documentation-only state; this block records the current-state reading.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webdriver-bidi-runtime-round-32.md` *(round 32)* | R1–R15 and R17 of `webdriver-bidi-capability-matrix.md` §2 run and admitted on this host's chromium 154.0.8037.97 + chromedriver 154.0.8037.97 through a classic `webSocketUrl: true` session, against the counter's own 127.0.0.1 fixture (row bases must be loopback; a non-loopback base fails the row predicate; no CDP endpoint): identity from `session.new` capabilities, `getTree`, `navigate` + `load`, a 640×480 PNG screenshot, `locateNodes` `#h`, awaited `window.__ready`, `setViewport` + `innerWidth`, pointer click → `clicked:tabi`, key actions → `tabi`, `beforeRequestSent`/`responseCompleted`, status 200 + fixture header, `addDataCollector` + `getData` body, `beforeRequestSent` intercept + `continueRequest`, `traverseHistory` −1, `tabi_fixture=1`, `userPromptOpened` + `handleUserPrompt`; R16 has no BiDi command. Admission is the frozen counter's (`admitted ≥ 14`, `failing 0`); observed counts and the two driver-run transcripts are in the receipt. **Not** measured: wire-truth parity, a columnar DOMSnapshot schema, a history-entry list, `insertText`, retroactive body retrieval. | S124 W3C WebDriver BiDi, S125 Chrome-owned BiDi/ChromeDriver doc, S126 W3C WebDriver classic capabilities — all opened 2026-10-26; receipt `evidence/round-32/bidi/receipt.json` |

Frontier restatement (append-only; earlier rows keep their bytes): **WebDriver BiDi** —
docs-held → **runtime-held on this host** at one pinned pair. The matrix's §2 rows no
longer rest on a spec map alone for R1–R15 and R17: each has a BiDi command or event
pair measured against a loopback fixture and admitted by a frozen counter, with the
`locally measured: no` bytes of the original pass left in place and a dated 2026-10-26
addendum recording the runtime state. R16 stays `no BiDi command` — the WD defines no
navigation-stop command, so the lane's CDP `Page.stopLoading` witness has no BiDi
counterpart to measure. The three contracts the matrix names as unmatched remain
unmatched: no wire-truth parity (serialized `ResponseData` fields, not CDP `ExtraInfo`
raw header-block bytes or a byte-exact status line), no columnar `DOMSnapshot` shape
(`locateNodes` plus caller-supplied script serialization instead), no history-entry list
(`traverseHistory` by delta only). One host, one browser build, one fixture: no
cross-browser, cross-version, worker/realm, cost or binding-stability finding is added,
and U1 is answered for 154.0.8037.97 only, not the 152.0.7977.82 build it names.

| Frontier item | Status | Pointer |
|---|---|---|
| WebDriver BiDi | runtime-held on chromium 154.0.8037.97 + chromedriver 154.0.8037.97, loopback fixture only — R1–R15 and R17 measured and admitted; R16 has no BiDi command; wire-truth parity, DOMSnapshot columns, the history-entry list, `insertText` and retroactive body retrieval remain unmatched | `knowledge/webdriver-bidi-runtime-round-32.md`; `knowledge/webdriver-bidi-capability-matrix.md` dated correction 2026-10-26; counter `node scripts/check-bidi-runtime.mjs --rev <REV> --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json` |

Counting commands (2026-10-26): `ls corpus/knowledge/*.md | wc -l` → 50 at the freeze
commit `4181fffb`, 51 once this round's entry lands; `git ls-tree --name-only 4181fffb
corpus/knowledge/ | grep -c '\.md$'` → 50.
