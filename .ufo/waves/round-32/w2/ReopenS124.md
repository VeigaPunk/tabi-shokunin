# ReopenS124 — independent re-open of registry row S124 (round-32 w2, frontier)

**Verdict (one paragraph).** S124 **holds on provenance, fully on nine of its eleven cells and partly on the tenth**, and
**fails on the `scope` cell plus the Gate's word counts** — all three are counting/provenance defects inside the registry
and lesson, not a falsified substantive claim. I re-fetched the dated WD myself (`https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/`, HTTP 200
at 2026-10-26T17:07:31Z, 4,235,856 B, sha256 `dc1077db…1d24d4`) and the undated alias (HTTP 200 at 17:09:32Z, same
digest, `cmp -s` exit 0), so every byte claim in the row reproduces: publication date `8 October 2026`
(`<time datetime="2026-10-08">`), revision `f922e6af669ead51496db85f37813f39438ef171` (one `meta name="revision"`
occurrence), and byte-identity with S005's 2026-10-19 fetch (`corpus/lessons/kaika-fleet-round-1.md:48` records the same
digest). All **18 declared anchor sections resolve** in the fetched bytes (245 headings extracted; `anchor-sections.txt`),
`kind: spec`, `tier: A`, `status: mined`, `opened: 2026-10-26`, `recheck: 90d` and `used-by:
corpus/knowledge/webdriver-bidi-runtime-round-32.md` are all valid under contract v1, and the seven `teaches` sentences I
could attack are grounded in the anchored bytes (including "returns a Base64 PNG", which holds through §7.3.3.2's
`encode a canvas as Base64` default `image/png` when `format` is null — the driver passes only `{ context }`). What does
not hold: **(D1, medium)** the `anchor` cell omits **§4.1** and the three event sections **§7.3.4.7, §7.5.6.2, §7.5.6.4**
that the entry's own predicates R1/R3/R10/R11 depend on — the §4.1 section the *Gate itself quotes* is outside the row's
declared anchor; **(D2, low)** the `scope` cell says "the **sixteen** WebDriver BiDi commands and **one** event the
round-32 C1 driver sends", while the row's own `teaches` cell enumerates **15 commands + 1 event** and both committed
transcripts contain **28 send frames / 15 distinct commands** with **4 subscribed events**; **(D3, low)** the lesson Gate
row states "(16 words)" and "(18 words)" for quotes that measure **15** and **17** words (both quotes are verbatim and
correctly located — only the counts are wrong, and the ≤25-word rule still holds). None of the three is reachable by an
in-place edit under contract rule 2; the fixes below are append-only.

## What I attacked

Row `corpus/SOURCES.md:138` (S124) and its lesson Gate row `corpus/lessons/round-32.md:17`, at the revision every item
attacks — lane `HEAD` = `b234a58920134424e0d104f137311ff54a16d26b`, working tree clean for tracked files
(`git status --porcelain` listed only untracked `.ufo/` files); S124 absent at baseline `d805d1d` (`grep -c` → 0) and
present at `b234a58` (`grep -c` → 3).

Method: re-fetch the row's own URLs under `TMPDIR` scratch, resolve every declared section in the fetched bytes, test
each `teaches` clause against the section it names, and test the row's counts against the artefacts the row points at
(the driver and both committed transcripts) rather than against the row's prose.

## Per-cell verdicts

| # | cell | value (abridged) | verdict |
|---|---|---|---|
| 2 | `id` | `S124` | **holds** — no duplicate ids in the registry (duplicate-id census prints nothing); S124 absent at baseline, so the id is used once, in this round |
| 3 | `source` | `W3C WebDriver BiDi dated Working Draft — https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` | **holds** — HTTP 200, title `WebDriver BiDi`, `w3c-status` = WD, dated `2026-10-08`; both URLs the row names answer 200 with identical bytes |
| 4 | `kind` | `spec` | **holds** — a W3C Working Draft is `spec` under contract v1's enum; it is *not* presented as a Recommendation (scope says "spec text only") |
| 5 | `tier` | `A` | **holds** — contract v1: "A: primary or authoritative for that scope (spec …)"; tier is explicitly scoped to the row's `scope` cell and the row never claims per-browser support |
| 6 | `scope` | "the sixteen WebDriver BiDi commands and one event the round-32 C1 driver sends, plus the network data-collection and intercept rules …; spec text only, never implementation coverage" | **DEFECT (D2, low)** — 15 commands, 4 events; the "spec text only" half is honest |
| 7 | `anchor` | "WD published 8 October 2026, revision f922e6af…; Abstract plus §§7.1.3.4, 7.3.3.2, 7.3.3.5-7.3.3.8, 7.3.3.12, 7.3.3.15, 7.3.4.14, 7.5.2, 7.5.3, 7.5.5.1-7.5.5.3, 7.5.5.8, 7.6.4.4, 7.7.3.1, 7.9.3.1; fetched 2026-10-26, 4235856 B, sha256 dc1077db…" | **partly holds** — date/revision/bytes/sha256 all reproduce and all 18 declared sections resolve, but **DEFECT (D1, medium)**: §4.1, §7.3.4.7, §7.5.6.2, §7.5.6.4 are missing |
| 8 | `teaches` | "Each command the C1 driver sends has its own section: subscribe …; userPromptOpened is emitted by the user prompt opened steps. A dated Working Draft is protocol text, never per-browser support, and S005's dated WD is unchanged, so this row re-opens it …" | **holds** — 16 clauses, each grounded (see §Grounding below); "Each command … has its own section" is true for all 15; the S005-unchanged sentence is verified by digest |
| 9 | `status` | `mined` | **holds** — cited by ≥1 path in `used-by`, and the cited file exists |
| 10 | `opened` | `2026-10-26` | **holds** — matches the round and my own 2026-10-26 fetches |
| 11 | `recheck` | `90d` | **holds** — contract v1 accepts the cadence form (`90d`), and 90d is the same cadence S005 carries for the same document; a dated WD that W3C republishes is exactly the 90d case |
| 12 | `used-by` | `corpus/knowledge/webdriver-bidi-runtime-round-32.md` | **holds** — that entry cites S124 on its `source:` line (`…:5`) and again at `…:25`; path exists; shape matches S123/S125/S126 (entry-only), which is the lane's convention (only 3 of 126 rows name a `lessons/` path) |

Structural checks on the row itself: `NF=13`, 0 malformed rows, 0 duplicate ids, `kind`/`tier`/`status` in enum, `tier A`
not paired with `community` (`awk` census from contract v1 §Census, all exit 0).

## Gate row (corpus/lessons/round-32.md:17, §Gate)

| item the Gate must carry | verdict |
|---|---|
| URL | holds — dated URL and alias both named; both HTTP 200 for me |
| access date | holds — `2026-10-26` (date only; S123/S125/S126 carry UTC times, S124 does not — contract rule 1 requires the date, so this is compliant, not a defect) |
| quote ≤25 words + location, grounding `teaches` | holds on text and location, **fails on the stated counts (D3, low)** |

Quote 1, verbatim, in the **Abstract** (verified in tag-stripped whitespace-normalised bytes, `present=True`):

> "This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents."

15 words; the cell states **16**.

Quote 2, verbatim, in **§4.1 Establishing a Connection** (`present=True`; the HTML source wraps it across two lines,
which is why a raw `grep` for the period-terminated string exits 1 — see Commands):

> "WebDriver clients opt in to a bidirectional connection by requesting the WebSocket URL capability with value true."

17 words; the cell states **18**.

Both are ≤25 words, so contract rule 1's bound is met; the parenthetical counts are wrong by exactly one each (the same
+1 on both suggests the location label `Abstract:` / `§4.1:` was counted as a token). This is the round's own
`number-drift` class (lesson M4) reappearing in the Gate.

## Defects

### D1 — the anchor omits four sections the row's own consumers depend on (medium)

`corpus/SOURCES.md:138`, cell 7. The declared anchor is "Abstract plus §§7.1.3.4, 7.3.3.2, 7.3.3.5-7.3.3.8, 7.3.3.12,
7.3.3.15, 7.3.4.14, 7.5.2, 7.5.3, 7.5.5.1-7.5.5.3, 7.5.5.8, 7.6.4.4, 7.7.3.1, 7.9.3.1" — §4.1 is not in it, and neither
are the three event sections the entry leans on. The sections exist in the fetched bytes (`anchor-sections.txt`), so
this is under-declaration, not a bad link:

- §4.1 "Establishing a Connection" — the opt-in the **Gate itself quotes** (`corpus/lessons/round-32.md:17`) and that
  the entry cites on its `source:` line (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:5`) and at `…:25`; R1
  (`…:67`) rests on "classic `POST /session` with `webSocketUrl: true`".
- §7.3.4.7 "The browsingContext.load Event" — R3's predicate (`…:69`) is "a `browsingContext.load` event carries it";
  the driver waits on that event at `scripts/bidi-loopback-round32.mjs:163` and `:236`.
- §7.5.6.2 `network.beforeRequestSent` — R10 (`…:76`) and R13 (`…:79`); driver at `scripts/…:145`, `:222`.
- §7.5.6.4 `network.responseCompleted` — R10 (`…:76`) and R11 (`…:77`); driver at `scripts/…:208`.

So four sections of the row's declared ground are outside the anchor — including the one section in the Gate row. A row's
`anchor` is the row's provenance claim; a Gate quote outside it is the same shape of gap the round already recorded as M3
(a quote whose location is not the row's ground).

### D2 — the scope count contradicts the row's own teaches cell and the driver (low)

`corpus/SOURCES.md:138`, cell 6: "the **sixteen** WebDriver BiDi commands and **one** event the round-32 C1 driver sends".

- The row's own `teaches` cell (cell 8) enumerates **16 items = 15 commands + 1 event** (`subscribe, getTree, navigate,
  captureScreenshot, locateNodes, setViewport, script.evaluate, performActions, addDataCollector, getData, addIntercept,
  continueRequest, traverseHistory, getCookies, handleUserPrompt` + `userPromptOpened`).
- Both committed transcripts: **28 send frames, 15 distinct commands** each (`driver-commands.txt`, run1 and run2;
  `corpus/evidence/round-32/bidi/run1/transcript.jsonl`, `run2/…`).
- The driver's source literal census: 19 BiDi method strings = **15 commands + 4 events**
  (`scripts/bidi-loopback-round32.mjs:145` subscribes to `browsingContext.load`, `browsingContext.userPromptOpened`,
  `network.beforeRequestSent`, `network.responseCompleted`).

"Sixteen commands and one event" (17 surfaces) overstates the command surface by one and understates the event surface by
three. It reads as the entry's "sixteen distinct row ids" (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:190`)
carried into a cell about protocol surfaces — the exact conflation criterion 86 warns about ("a count of distinct
surfaces, not of table instances").

### D3 — the Gate's word counts are off by one each (low)

`corpus/lessons/round-32.md:17`: "(16 words)" for a 15-word quote, "(18 words)" for a 17-word quote. Text and location
are correct; only the counts are wrong. Bound (≤25) still met.

## Grounding of the `teaches` cell (what I tried to break and could not)

| clause | anchored section | verdict |
|---|---|---|
| "subscribe enables events globally or per navigable" | §7.1.3.4 | holds — "enables certain events either globally or for a set of navigables" (the section also carries a pending note about realms, which no clause claims) |
| "getTree returns navigable trees" | §7.3.3.5 | holds — "returns a tree of all descendent navigables including the given parent itself" |
| "navigate returns the target URL" | §7.3.3.8 | holds — `NavigateResult = { navigation, url }` |
| "captureScreenshot returns a Base64 PNG" | §7.3.3.2 | holds — "returns it as a Base64-encoded string" + `encode a canvas as Base64`: "If format is not null … Otherwise, let type be `image/png`"; the driver sends `{ context }` only (`scripts/…:172`), so `format` is null and the default is normative. Not implementation coverage |
| "locateNodes matches a locator" | §7.3.3.7 | holds — "returns a list of all nodes matching the specified locator" |
| "setViewport modifies top-level traversable viewport characteristics" | §7.3.3.12 | holds — "modifies specific viewport characteristics … on the given top-level traversable" |
| "script.evaluate runs in a realm or navigable" | §7.6.4.4 | holds — "evaluates a provided script in a given realm. For convenience a navigable can be provided in place of a realm" |
| "performActions runs an action sequence" | §7.9.3.1 | holds — "performs a specified sequence of user input actions" |
| "addDataCollector registers collectors that must already exist when a response is created" | §7.5.5.1 + §7.5.2 | holds — §7.5.2: "This might happen if there are no collectors setup when the response is created" |
| "getData retrieves collected data" | §7.5.5.8 | holds — "retrieves a network data if it is available" (looser than the clause, not false) |
| "addIntercept adds beforeRequestSent, responseStarted or authRequired phases" | §7.5.5.2 | holds — `network.InterceptPhase = "beforeRequestSent" / "responseStarted" / "authRequired"` |
| "continueRequest releases a blocked request" | §7.5.5.3 | holds — "continues a request that's blocked by a network intercept" (paraphrase of "releases") |
| "traverseHistory steps by delta" | §7.3.3.15 | holds — "traverses the history of a given navigable by a delta" |
| "getCookies filters cookies" | §7.7.3.1 | holds — "retrieves zero or more cookies which match a set of provided parameters" |
| "handleUserPrompt closes a prompt" | §7.3.3.6 | holds — "allows closing an open prompt" |
| "userPromptOpened is emitted by the user prompt opened steps" | §7.3.4.14 | holds — "The remote end event trigger is the WebDriver BiDi user prompt opened steps …" |
| "S005's dated WD is unchanged, so this row re-opens it … rather than superseding it" | digest | holds — S005's recorded sha256 is the same `dc1077db…` and the same revision; re-open (not supersede) is the correct declaration |

Duplicate-authority check: S005 and S124 now carry the same document, but S124 narrows the scope to the driver's sections
and says so in the cell; S005's scope (§§7.1–7.10 semantics) is broader. That is two scopes on one source, not two
authorities — **no defect**, though the byte receipt is redundant with S005's, which the row admits.

## Impacted axes

- **coverage** — D1/D2 misstate the registry's declared surface for the round's new capability (off by one command, three
  event sections unanchored). The C1 runtime verdicts themselves are untouched.
- **calibration** — D3 and D2 are both the round's M4 `number-drift` class; criterion 86's rule ("a row count is a count
  of distinct surfaces") is what both numbers violate.
- **freshness / depth / operability / adjacency** — unaffected: the row is same-day fresh, byte-identical to two prior
  receipts, and nothing I measured contradicts an operational claim.

## Smallest safe correction (append-only; I have not touched any lane file)

1. **New row S127** (next unused id; `grep -c S127 corpus/SOURCES.md` → 0) whose `teaches` opens `supersedes S124 —`,
   carrying S124's scope with the true counts and S124's anchor plus §4.1, §7.3.4.7, §7.5.6.2, §7.5.6.4. Paste-ready
   (13 fields, no `|` inside a cell):

```
| S127 | W3C WebDriver BiDi dated Working Draft (S124 scope/anchor correction) — https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ | spec | A | The §4.1 opt-in, the fifteen BiDi command sections and the four event sections the round-32 C1 driver uses (subscribe, getTree, navigate, captureScreenshot, locateNodes, setViewport, script.evaluate, performActions, addDataCollector, getData, addIntercept, continueRequest, traverseHistory, getCookies, handleUserPrompt; events browsingContext.load, browsingContext.userPromptOpened, network.beforeRequestSent, network.responseCompleted), plus §§7.5.2 and 7.5.3; spec text only, never implementation coverage | WD published 8 October 2026, revision f922e6af669ead51496db85f37813f39438ef171; §4.1, §§7.1.3.4, 7.3.3.2, 7.3.3.5-7.3.3.8, 7.3.3.12, 7.3.3.15, 7.3.4.7, 7.3.4.14, 7.5.2, 7.5.3, 7.5.5.1-7.5.5.3, 7.5.5.8, 7.5.6.2, 7.5.6.4, 7.6.4.4, 7.7.3.1, 7.9.3.1; fetched 2026-10-26, 4235856 B, sha256 dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4 | supersedes S124 — the C1 driver sends fifteen commands (S124 said sixteen) and subscribes to four event types (S124 said one); §4.1 and §§7.3.4.7, 7.5.6.2, 7.5.6.4 added to the anchor; every command and event still has its own section at the dated WD | mined | 2026-10-26 | 90d | corpus/knowledge/webdriver-bidi-runtime-round-32.md |
```

   with a Gate row for S127 quoting §4.1 (17 words, verified present) and, for the event addition, §7.3.4.7's trigger
   (20 words, verified present): "The remote end event trigger is the WebDriver BiDi load complete steps given navigable
   navigable and navigation status navigation status". Both are ≤25 words and in the fetched bytes; state the measured
   counts, not the estimated ones.
2. **One appended erratum** under `## Gate` in `corpus/lessons/round-32.md` (D3), for example:
   `S124 Gate quote counts corrected: Abstract 15 words, §4.1 17 words (both ≤25).`
   (Append-only; the two quotes and their locations are already correct.)

## Commands run (every one executed; exit codes as printed)

```
curl -q -sS --proto =https -o bidi-wd-20261008.html -w 'HTTPSTATUS=%{http_code}\nBYTES=%{size_download}\nURL=%{url_effective}\n' https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/
  -> exit 0; 2026-10-26T17:07:31Z; HTTPSTATUS=200; BYTES=4235856
sha256sum bidi-wd-20261008.html
  -> exit 0; dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4
curl … https://www.w3.org/TR/webdriver-bidi/            -> exit 0; 2026-10-26T17:09:32Z; HTTPSTATUS=200; BYTES=4235856; same sha256
cmp -s bidi-alias.html bidi-wd-20261008.html            -> exit 0 (IDENTICAL)
grep -o 'f922e6af[0-9a-f]*' …                           -> exit 0; 1 occurrence
grep -o '8 October 2026' …                              -> exit 0; 1 occurrence
grep -c 'WebDriver clients opt in to a bidirectional connection by requesting the WebSocket URL capability with value true.' (raw HTML)
  -> exit 1, 0 matches — disclosed: the HTML source wraps that sentence across two lines; the whitespace-normalised
     substring test below is the valid check
python3 (tag-strip + \s+ collapse, substring test of both Gate quotes)
  -> exit 0; Abstract: 15 words present=True; §4.1: 17 words present=True
python3 (heading extraction, <h1>-<h6> with data-level)  -> exit 0; 245 headings; 18/18 declared anchor sections resolved
python3 (teaches clause count)                          -> exit 0; 16 clauses = 15 commands + 1 event
python3 (transcript census run1/run2: dir=="send")      -> exit 0; run1 28 frames/15 distinct; run2 28 frames/15 distinct; 4 subscribed events
awk -F'|' NF check on corpus/SOURCES.md:138             -> exit 0; NF=13
awk duplicate-id / malformed-row / enum+tier censuses   -> exit 0; no output (0 duplicates, 0 malformed, S124 spec A mined)
awk used-by existence check                             -> exit 0; EXISTS corpus/knowledge/webdriver-bidi-runtime-round-32.md
python3 (len(q.split()) on the two Gate cell quotes)    -> exit 0; 15 vs stated 16; 17 vs stated 18
git show d805d1d6132430118b206a848b85753ab35d1014:corpus/SOURCES.md | grep -c S124   -> exit 0; 0
git show b234a58920134424e0d104f137311ff54a16d26b:corpus/SOURCES.md | grep -c S124    -> exit 0; 3
pgrep -u "$(id -u)" -fa 'chromedriver|chromium'         -> exit 1 (no process of mine)
```

No lane gate/counter was run: this seat's item is the registry re-open, and `scripts/**` is frozen after `4181fff`; the
C1 counting command is another seat's measurement.

## Fetch receipts (this seat's own GETs)

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ | 2026-10-26T17:07:31Z | 200 | 4,235,856 | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` |
| https://www.w3.org/TR/webdriver-bidi/ | 2026-10-26T17:09:32Z | 200 | 4,235,856 | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` |

Receipts copied to `.ufo/waves/round-32/w2/ReopenS124/` (`fetch-receipts.md`, `anchor-sections.txt`, `s124-cells.txt`,
`driver-commands.txt`, `gate-row.txt`).

## Hygiene and tooling

- Scratch `/fast/scratch/hyaku/tabi-r32/ReopenS124` used as `TMPDIR` for both curls; deleted before yielding (receipts
  copied first). No clone was needed (no lane script was run; the only git use was read-only `git show`/`rev-parse` in
  the lane).
- No browser was started; no chromedriver/chromium of mine remains (`pgrep -u … -fa 'chromedriver|chromium'` → exit 1;
  the one `chromium`-mentioning line belongs to the host's `earlyoom`).
- No tool installed or upgraded. No lane tracked file, index, or jj state touched; this seat wrote only its report and
  its own output dir.
