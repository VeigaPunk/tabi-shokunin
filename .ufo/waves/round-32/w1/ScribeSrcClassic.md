# ScribeSrcClassic — round 32 w1, S126 (W3C WebDriver classic capabilities)

Verdict: **S126 is drafted and source-held, but the wave item's premise is partly wrong
and the draft corrects it.** The `unhandledPromptBehavior` capability with the `ignore`
handler is real, documented and locatable in the dated W3C Working Draft of WebDriver
(`https://www.w3.org/TR/webdriver2/`, this-version `WD-webdriver2-20260702`, 1882653 B,
sha256 `929f2f0b…919e`): §7's capabilities table says it "Describes the session's user
prompt handler. Defaults to \"dismiss and notify\".", and §16.1's known-handler table says
`ignore` means "All simple dialogs encountered should be left to the user to handle."
The `webSocketUrl` capability is **not** in WebDriver classic at all — 0 case-insensitive
occurrences in the dated bytes and 0 in the editor's draft (1882259 B, sha256
`d49b731e…4dd6`); it is defined by WebDriver BiDi §4.1 (`#establishing`, dfn
`#websocket-url`), which is S124's row, and classic only admits it through the §7
additional-capability slot. So the drafted S126 carries the classic lever the C1 driver
needs (the session default `dismiss and notify` versus `ignore`) and records the true
location of `webSocketUrl`; it deliberately does not claim the classic spec as that
capability's source. No lane file was edited by this seat; the row and Gate lines below
are drafts for the L1. No browser, chromedriver, network service or lane script ran.

## Behavior

1. Read the frozen claim/counter interfaces before fetching: `scripts/check-bidi-runtime.mjs`
   lines 1–75 (receipt schema `tabi-bidi-receipt-v1`, JSONL transcript shape, t1/t3/t2/l1
   checks, `FIXTURE`), and its `s1-source-row` implementation at lines ~505–520, which decides
   that the C1 entry's `source:` line must cite an S-id whose row is `status: mined`, names
   the entry in `used-by`, and is absent at baseline `d805d1d6`. This is why the draft row's
   `used-by` is exactly `corpus/knowledge/webdriver-bidi-runtime-round-32.md`, `status` is
   `mined`, and `opened` is `2026-10-26`.
2. Read `scripts/check-sources.mjs` field contract (11 cells; `recheck` accepts an ISO date,
   `<n>d`, or `on-release`; cells joined by `|`) so the draft row is structurally admissible.
   The checks were **not executed** (lane linters are out of this seat's scope).
3. Fetched three pages over read-only HTTPS with `curl -q -sS --proto =https`, saved the bytes,
   and pinned HTTP status, byte count, UTC time and sha256 for each (manifest:
   `fetches.json`).
4. Located the quotes by tag-stripping fixed HTML line ranges (`extract-quotes.py`), because
   the sentence is interleaved with `<a>`/`<code>` markup and a plain `grep -F` for it fails —
   recorded as a method limit, not a finding about the source.
5. Answered `ScribeEntry`'s direct question (confirm URL/digest, give anchors and quotes,
   flag the `webSocketUrl` misattribution) before drafting.

## Evidence

Scratch clone: `git clone --shared` was **not** used — this seat ran no lane script, so no
revision checkout was needed; reads were direct reads of the lane tree, which the seat
contract permits (read-only).

Fetch receipts (`/fast/scratch/hyaku/tabi-r32/ScribeSrcClassic/raw`, copied to the output dir
as `evidence-greps.txt` and `fetches.json`):

```
$ date -u +%Y-%m-%dT%H:%M:%SZ; curl -q -sS --proto =https -o wd2-dated.html \
    -w 'HTTP %{http_code} bytes %{size_download}\n' https://www.w3.org/TR/webdriver2/; \
  sha256sum wd2-dated.html; wc -c wd2-dated.html
2026-10-26T16:02:14Z
HTTP 200 bytes 1882653
929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e  wd2-dated.html
1882653 wd2-dated.html
exit 0

$ curl ... https://w3c.github.io/webdriver/            # editor's draft
2026-10-26T16:02:31Z   HTTP 200 bytes 1882259
d49b731e12c386b0fc16ea680d304f5c43bd26a3a506f4ec900a05f4ca1c4dd6  wd-ed.html
exit 0

$ curl ... https://www.w3.org/TR/webdriver-bidi/       # cross-reference only (S124 scope)
2026-10-26T16:02:37Z   HTTP 200 bytes 4235856
dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4  bidi.html
exit 0
```

Absence/presence receipts (`evidence-greps.txt`, verbatim):

```
== absence checks over classic WebDriver bytes (exit 1 = no match, the expected signal) ==
grep -c -i 'websocket' wd2-dated.html      -> 0    exit=1
grep -c -i 'websocketurl' wd-ed.html       -> 0    exit=1
== presence checks ==
grep -c -F 'All simple dialogs encountered should be left to the user to handle.' wd2-dated.html
  -> 0    exit=1      # markup-interleaved; see extract-quotes.py, not a source fact
grep -c -F 'Defaults to "<code>dismiss and notify</code>".' wd2-dated.html -> 1 exit=0
grep -c -F 'id="user-prompt-handler"' wd2-dated.html                       -> 1 exit=0
grep -c -F 'id="capabilities"' wd2-dated.html                              -> 1 exit=0
grep -c -F 'opt in to a bidirectional connection' bidi.html                -> 1 exit=0
```

Quote locations (`python3 extract-quotes.py <raw>`, exit 0; output in `quotes.txt`):

```
wd2-dated.html:11202-11203  §16 preamble, unhandled prompt
  By default user prompts are not handled automatically unless a user prompt handler has been defined.   [15 words]
wd2-dated.html:11306-11307  §16.1 known handler "ignore"
  " ignore " All simple dialogs encountered should be left to the user to handle.                        [12 words]
wd2-dated.html:1976-1980    §7 capabilities table, unhandledPromptBehavior row
  ... Describes the session 's user prompt handler . Defaults to " dismiss and notify ".                 [10 words]
wd2-dated.html:1798-1801    §7 additional WebDriver capabilities slot
  Other specifications may define additional WebDriver capabilities . ...                                [quoted span 8 words]
bidi.html:2216-2217         §4.1 webSocketUrl opt-in (S124 scope)
  WebDriver clients opt in to a bidirectional connection by requesting the WebSocket URL capability with value true.  [18 words]
wd2-dated.html: case-insensitive occurrences of 'websocket' = 0
wd-ed.html: case-insensitive occurrences of 'websocketurl' = 0
```

Cross-check: ScribeEntry reported the same classic URL at `2026-10-26T16:02:34Z`,
1882653 B, sha256 `929f2f0b…919e` — byte-identical, so the digest is not a single-sample
artifact. The dated version is pinned inside the fetched bytes at HTML lines 343-344:
`https://www.w3.org/TR/2026/WD-webdriver2-20260702/` with
`"generatedSubtitle": "W3C Working Draft 02 July 2026"` (line 333).

## Gate — drafted lines for `corpus/lessons/round-32.md`

```markdown
## Gate (opened sources, 2026-10-26)

- **S126** — W3C WebDriver classic, dated WD 02 July 2026 (`https://www.w3.org/TR/webdriver2/`;
  this-version `https://www.w3.org/TR/2026/WD-webdriver2-20260702/` at HTML lines 343-344,
  `generatedSubtitle` "W3C Working Draft 02 July 2026" at line 333); fetched
  2026-10-26T16:02:14Z, HTTP 200, 1882653 B, sha256
  `929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e`; quote
  `"ignore" All simple dialogs encountered should be left to the user to handle.`
  (lines 11306-11307, 12 words), capability default
  `Defaults to "dismiss and notify".` (lines 1976-1980), preamble
  `By default user prompts are not handled automatically unless a user prompt handler has been defined.`
  (lines 11202-11203, 15 words), additional-capability slot
  `Other specifications may define additional WebDriver capabilities.` (line 1798); mined;
  used by `corpus/knowledge/webdriver-bidi-runtime-round-32.md`.
- **S126 measured absence — `webSocketUrl` is not classic.** Case-insensitive occurrences of
  `websocket` = 0 in the dated bytes and of `websocketurl` = 0 in the editor's draft
  (`https://w3c.github.io/webdriver/`, 2026-10-26T16:02:31Z, HTTP 200, 1882259 B, sha256
  `d49b731e12c386b0fc16ea680d304f5c43bd26a3a506f4ec900a05f4ca1c4dd6`). The capability text is
  WebDriver BiDi §4.1 `https://www.w3.org/TR/webdriver-bidi/#establishing`, dfn `#websocket-url`:
  `WebDriver clients opt in to a bidirectional connection by requesting the WebSocket URL capability with value true.`
  (18 words) — S124's row, not S126's. Classic admits it only as an additionally-defined
  capability (§7, line 1798).
- **Two-seat byte agreement** — ScribeEntry fetched the same classic URL at
  2026-10-26T16:02:34Z with the same 1882653 B and sha256 `929f2f0b…919e`; the row digest is
  reproducible within the round.
```

Optional `## Mistakes` candidate (route as the L1 sees fit):

```markdown
### M? — the round-32 C1 item placed `webSocketUrl` in WebDriver classic

Class: source-identity slip in the assignment. The item describes S126 as "W3C WebDriver
classic: the `webSocketUrl` capability and `unhandledPromptBehavior` 'ignore'". Measured:
0 case-insensitive occurrences of `websocket` in the dated WD 02 July 2026 bytes and 0 of
`websocketurl` in the editor's draft; the capability is BiDi §4.1. The driver lever the item
actually needs (`unhandledPromptBehavior: "ignore"`) is classic and holds, so no C1 plan
changes; the draft row splits the two sources instead of merging them.
```

Optional `## Search log` line:

```markdown
- 2026-10-26 · round-32 WebDriver classic capabilities (ScribeSrcClassic). Question: which
  documented classic capability and value keep an open alert available to BiDi
  `browsingContext.handleUserPrompt`? Opened the dated WD (this-version
  2026/WD-webdriver2-20260702) and the editor's draft; no discovery query. Identified 2,
  screened 2, included 1 (S126), excluded 1 (the editor's draft — same two claims, undated).
  Stop: the capability row and the handler table answer it; whether this chromedriver honours
  `ignore` is C1's runtime question, not a reading.
```

## Draft registry row (S126) — for `corpus/SOURCES.md` §Registry, one line, 11 cells

| S126 | WebDriver — W3C Working Draft 02 July 2026 — https://www.w3.org/TR/webdriver2/ | spec | A | WebDriver classic session capability `unhandledPromptBehavior` and its known handler keys (the `ignore` value in particular), the capability's documented default, and the §7 slot through which another specification adds a capability; the dated Working Draft bytes only, not BiDi command semantics | WD dated 02 July 2026 (this-version https://www.w3.org/TR/2026/WD-webdriver2-20260702/ at HTML lines 343-344); fetched 2026-10-26T16:02:14Z, HTTP 200, 1882653 B, sha256 929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e; §7 capabilities table lines 1976-1980 (`unhandledPromptBehavior`, `Defaults to "dismiss and notify"`), §7 additional-capability slot line 1798, §16 preamble 11202-11203, §16.1 known handlers 11247-11307 (`"ignore"` at 11306-11307); case-insensitive `websocket` occurrences in these bytes = 0 | A session's `unhandledPromptBehavior` capability sets the user prompt handler and defaults to `dismiss and notify`, while the `ignore` handler leaves every simple dialog to the user, so an alert dismissed before a BiDi `handleUserPrompt` is the session default acting, not `ignore`; `webSocketUrl` is absent from WebDriver classic and enters only through the §7 additional-capability slot, defined by WebDriver BiDi §4.1 (S124) | mined | 2026-10-26 | 90d | corpus/knowledge/webdriver-bidi-runtime-round-32.md |

## Touched surfaces

- Written (this seat's scope only): `.ufo/waves/round-32/w1/ScribeSrcClassic.md` (this file) and
  `.ufo/waves/round-32/w1/ScribeSrcClassic/` containing `fetches.json`, `evidence-greps.txt`,
  `quotes.txt`, `extract-quotes.py`, `wd2-dated.sha256`.
- Scratch `/fast/scratch/hyaku/tabi-r32/ScribeSrcClassic/` — removed before yield.
- Not touched: `corpus/SOURCES.md`, `corpus/lessons/*`, `corpus/knowledge/*`, any script, the
  lane git index/jj state, the fleet repo, any sibling lane repo, `/home/vgpnk/Projects/shokuknow`.
- No git commit anywhere; no clone created; no subagent; no `agent://all` message.
- Processes: no browser or driver was started. After cleanup,
  `pgrep -fa 'chromedriver|chromium'` (exit 0) returned one line, `1371 /usr/bin/earlyoom …
  --prefer (^|/)(java|node|chromium|python3?)$` — the host's earlyoom service matching its
  own argv pattern, not a process of this seat. No chromedriver lives in this seat's tree.
- Scratch: `rm -rf -- /fast/scratch/hyaku/tabi-r32/ScribeSrcClassic` then `ls -d` on the same
  path → `No such file or directory` (exit 2), i.e. the tree is gone; receipts were copied out
  first (`fetches.json`, `evidence-greps.txt`, `quotes.txt`, `wd2-dated.sha256`).
- Tooling: nothing installed or upgraded; `curl`, `python3`, `grep`, `sha256sum`, `date` were
  already present, so the pacman/`uv tool` channels were not used.

## Findings

1. **Holds — the classic lever is documented, with a default that explains the freeze
   observation.** S126's `unhandledPromptBehavior` is a classic capability (§7) whose default
   is `dismiss and notify`, and `ignore` is one of five known handler keys (§16.1). The C1
   driver's `unhandledPromptBehavior: "ignore"` therefore has documented text behind it, and
   the L1's freeze observation (`no such alert` after a driver-side alert if the capability is
   unset) is consistent with the documented default dismissing the dialog. Consistency with
   the spec is *not* a measurement that chromedriver 154 honours `ignore`; that is C1's
   runtime question.
2. **Defect in the wave item (severity: low, wording not product).** The item asserts S126
   covers "the `webSocketUrl` capability" in WebDriver classic. Measured absence: 0 matches in
   the dated WD and in the editor's draft. The capability lives in WebDriver BiDi §4.1
   (`#establishing`, dfn `#websocket-url`) — S124's row. Impact: a row drafted to the item's
   wording would have recorded a capability under a document that does not contain it. The
   draft row avoids that by scoping classic to `unhandledPromptBehavior` + the §7
   additional-capability slot.
3. **Method limit.** The `ignore` sentence cannot be located with `grep -F` on the raw HTML
   (it is split by `<a>`/`<code>` markup); line-range tag stripping is required. Any later
   recheck of S126 must repeat that, or a `grep` recheck will report a false absence.
4. **Not claimed.** No runtime behaviour of this host's browser, chromedriver or any BiDi
   command; no C1 counter run; no statement about whether `ignore` is honoured in practice;
   no claim about the BiDi spec's own `userPromptHandler` map beyond the single §4.1 quote
   used as a cross-reference (that reading belongs to S124's seat).

## Out of scope

Registry admission, the round-32 lesson text, `claims.json`, counters, the C1 entry
(`webdriver-bidi-runtime-round-32.md`), S123/S124/S125 rows, the C2 calibration corrections,
and any file edit in the lane — all owned by the L1 or by sibling seats.

## Artifacts

- `.ufo/waves/round-32/w1/ScribeSrcClassic.md` — this report.
- `.ufo/waves/round-32/w1/ScribeSrcClassic/fetches.json` — URL, UTC, HTTP status, bytes, sha256
  for the three fetches.
- `.ufo/waves/round-32/w1/ScribeSrcClassic/evidence-greps.txt` — absence/presence greps with
  exit codes.
- `.ufo/waves/round-32/w1/ScribeSrcClassic/quotes.txt` and `extract-quotes.py` — quote
  locations with reproducible extraction.
- `.ufo/waves/round-32/w1/ScribeSrcClassic/wd2-dated.sha256` — digest of the saved classic bytes.
