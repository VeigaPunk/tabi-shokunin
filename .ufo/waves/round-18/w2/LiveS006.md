VERDICT: ISSUES

# LiveS006 — C1 receipt S006 falsification attack

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Baseline B: `2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured REV: `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
  (lane tip `refs/heads/master` at read time; `jj status` parent `wmxluppu 530f40a9 master`).
- Date: 2026-10-20 UTC. Seat `TabiR18.LiveS006-2`; read-only, no lane production/Git/jj edits.
- Receipt under attack: `corpus/evidence/round-18/source-recheck/S006.json`
  (file sha256 `8a89d2a291fee8c9e3c80204d73bde5c310a67aed66a67b37ea7f9bb6bfe43ed`).

**Bottom line.** Every counter-validated field of the receipt passes, and
`node .ufo/waves/round-18/measure-c1.mjs 530f40a…` accepts it (`c1_rows_rechecked: 51`,
`rejected: []`). Source identity is **held**, the anchor is **held**, and `teaches` is
**held at the row's scoped claim** (module index + command/event overview). The receipt's
free-text `note` is not accurate: it omits the 13th module and asserts the sidebar indexes
*each* command/event name, which is false for 7 of 13 modules. The seat report's explanation
of fetch variance ("per-request build chrome") is also false. These are note/report defects,
not count defects: the counter does not read `note` or `anchorObserved`
(`measure-c1.mjs:315-378`; zero references to either field), so the C1 count is unaffected.

## 1. Re-fetch and receipt comparison

Fresh private `/tmp` dir `/tmp/tabi-r18-s006-3092` (deleted after this report). Exact
re-fetch argv, same semantics as the receipt's producer:

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'HTTP=%{http_code} BYTES=%{size_download} CT=%{content_type} URL=%{url_effective}\n' \
  'https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules'
```

Observed: `HTTP=200 BYTES=17940 CT=text/html
URL=https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules`
(no redirect). Decompressed body: **163592 bytes**, sha256
**`7dc6b2bd57b0ed4eb7895bf8fdd6cc476ebeb6cb025f11fc774e7bec7810af87`** — byte-identical to
`S006.json:10` and to the second and cache-busted fetches below. Exact equality is stronger
than required for a dynamic page; the identity checks in §2 do not depend on it.

| Receipt field (`S006.json`) | Receipt value | Observed | Match |
|---|---|---|---|
| `row` / `rowUrl` / `url` (2–5) | S006; MDN Modules URL | same URL, `url_effective` identical | yes |
| `fetchedAt` (6) | `2026-10-20T19:06:09.057Z` | my fetch `2026-10-20T20:04:44Z`; body identical | n/a (time) |
| `httpStatus` (8) | 200 | 200 | yes |
| `bytes` (9) | 163592 | 163592 decompressed (17940 compressed transfer) | yes |
| `sha256` (10) | `7dc6b2bd…af87` | `7dc6b2bd…af87` | yes |
| `decode` (11) | `html-text` | independent html-text decode: quote found | yes |
| `quote` (13) | `The WebDriver BiDi protocol is organized into modules.` | present verbatim | yes |
| `quoteWords` (14) | 8 | 8 (`quote.trim().split(/\s+/)`) | yes |
| `quoteFound` (16) | true | true | yes |
| `quoteOffset` (17) | 1950 | 1950 in normalized text (my independent NFC/fold/collapse); 8660 chars | yes |
| `excerpt` / `excerptSha256` (18–19) | `S006.excerpt.txt`; `fee9eb7e…8eae` | 1255 B; sha `fee9eb7e…8eae`; quote at excerpt offset 600 | yes |
| `anchorObserved` (20) | commit `253bed3d…`; page last modified 2026-04-22; §List of modules/Commands/Events | all present; commit is latest for the page path (see §2) | yes |
| `teachesVerdict` (21) | `held` | held at row scope; note overstates (see §3) | partial |
| `producerSha256` (24) | `f2ba0033…a360` | `sha256sum .ufo/waves/round-18/recheck-fetch.mjs` and `git show 530f40a:…` both `f2ba0033…a360` | yes |

Quote locations in the raw body (UTF-8 byte offsets): meta description **3794**,
`og:description` **4225**, article `<p>` **84612**. The normalizer strips meta tags, so the
located occurrence is the article paragraph; the receipt's 1950 is a normalized-text offset,
not a byte offset (see §4, F5).

Fetched-body excerpt reproduction: I implemented the documented normalizer independently
(NFC, curly quotes/dashes folded, whitespace runs collapsed) and verified
`normalize(excerpt)` == `normalize(body)[at-600 : at+len(q)+600] + "\n"` exactly, so the
excerpt is derived from the fetched body, not hand-written. Header/body integrity:
extract sha `fee9eb7e…8eae`; receipt file `8a89d2a2…43ed`.

### Response headers (second fetch, `date: Tue, 20 Oct 2026 20:04:44 GMT`)

```
last-modified: Tue, 20 Oct 2026 01:09:07 GMT
etag: "2da9b0b672c5e50f5212b0247f270e7e"
age: 898
x-cache: MISS, HIT, HIT
content-length: 17940
x-goog-stored-content-length: 163592
content-encoding: br
cache-control: public, max-age=3600
vary: Accept-Encoding
```

A cache-busted GET
(`…/Modules?tabi-cachebust=20261020`) returned the same 163592 B and sha256 with
`age: 0` and `x-cache: MISS, MISS, MISS`, same ETag and `last-modified`. The object is a
static build, stable within the build; it is not per-request chrome (see F4).

### Counter cross-check

```
$ node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40a9…","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable
freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,
"drift_superseded":0,"own_work":1,"rejected":[],"live":null,
"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

`rejected: []`; `held` 50 + `own_work` 1 = 51. The receipt is accepted. `eligible_rows: 58`
is 64 SOURCES rows at REV minus the six superseded; the seven new rows S058–S064 have no
receipts by design and are outside the C1 target of 51 baseline rows (F6).

## 2. Source identity and anchor

- **Row at REV.** `git show 530f40a:corpus/SOURCES.md` line 20 is S006; the `rowUrl`
  occurs verbatim in the `source` cell; S006 is not in the superseded set
  `{S004,S039,S047,S049,S050,S053}`.
- **Identity.** HTTP 200 at the exact URL, no redirect; page title `WebDriver BiDi modules`;
  body source is the MDN WebDriver BiDi modules page.
- **Anchor commit.** `GET https://api.github.com/repos/mdn/content/commits/253bed3def8e1680475ea75987d24ca62ee9f989`
  → HTTP 200, sha `253bed3d…`, committer date `2026-04-22T16:45:22Z`, message
  `[Editorial review] BiDi - Add page for log module event (#43793)`, files include
  `files/en-us/web/webdriver/reference/bidi/modules/index.md`. File digest
  `caead78ec7b7c0af9eb759ee8b8085daa409cab78a126b1ae4ea4aa325d1e8e5`.
- **It is the current page revision, not a stale one.**
  `GET …/commits?path=files/en-us/web/webdriver/reference/bidi/modules/index.md&per_page=5`
  lists `253bed3d` (2026-04-22) as the newest, then `f83c12ab` (2026-03-24), `fbf73373`
  (2026-03-12), `62b11997` (2026-02-23). JSON digest `5c267da2…19de`.
- **Same text at the anchor commit.** Raw markdown at `253bed3d`
  (`…/files/en-us/web/webdriver/reference/bidi/modules/index.md`, HTTP 200, 3181 B,
  sha256 `4603b237a359d81ae9d7c2a47505eb4af6d9467fb24082d6ef047661a6efebd3`)
  contains the quote at **line 10**, `## List of modules` at line 15, `## Commands` at
  line 19; `## Events` follows. This is the alternative same-identity rendering; the quote
  is present there too, so no absence path was needed.
- **Page metadata.** The HTML footer has
  `<time datetime="2026-04-22T16:45:22.000Z">Apr 22, 2026</time>`; the page-report metadata
  carries `Last commit: https://github.com/mdn/content/commit/253bed3def8e1680475ea75987d24ca62ee9f989`.

**Result: source identity held; anchor held.** The anchor cell's commit is the latest commit
for the page path and its content date matches the page footer.

## 3. Does the quote support `teaches`? (the substantive attack)

Row `teaches` (`corpus/SOURCES.md:20` at REV): *A navigable module index for locating BiDi
commands and events before reading the spec section.* Scope cell: *Module index and
command/event overview, secondary to S005.*

The quote itself — `The WebDriver BiDi protocol is organized into modules.` — asserts only
that BiDi is modular. It says nothing about navigation, command/event names, or reading
before the spec. The `held` verdict therefore rests on the page structure, not the quote.
I verified that structure in the fetched body:

- h2 sections present: `List of modules`, `Commands`, `Events`, `Browser compatibility`,
  `See also`.
- `§List of modules` has **13** module links, each with a one-line summary:
  bluetooth, browser, browsingContext, emulation, input, log, network, permissions, script,
  session, storage, **userAgentClientHints**, webExtension.
- The left sidebar (`<nav class="left-sidebar">`, 122 `href`s) lists command/event subpages
  for browser (6 commands), browsingContext (12 commands, 13 events), input (3 commands,
  1 event), log (1 event), script (5 commands, 2 events), session (5 commands). For
  bluetooth, emulation, network, permissions, storage, userAgentClientHints and webExtension
  it lists only the module link — no command or event names.
- Module pages confirm the gap: `…/Modules/bluetooth` HTTP 200, 16229 B, sha256
  `d3f16e92f3dfd1a585a5722f0f45b501156ce08fa4cc53eae66c3aa92b0a339f`, h2s are only
  `In this article`, `Specifications`, `Browser compatibility`, `Help improve MDN` — no
  `Commands` heading and no command names; `…/Modules/emulation` HTTP 200, 16198 B, same
  shape. For those modules, the index does not let a reader locate the command names before
  the spec.

**Result: `teaches` is held at the row's scoped claim** (it is a module index with a
command/event overview, and 6 of 13 modules expose command/event names in the sidebar), but
**the receipt's `note` overstates it** (F1, F2) and the quote alone is not its evidence
(F3). This is not drift: the page did not change; the note's universal was never true.

## 4. Availability vs live product freshness (the second attack)

- **Content freshness is real, not inferred from the fetch time.** `253bed3d` is the newest
  commit for the page path; the served page footer names it; the raw markdown at that commit
  carries the quote. The page content is current as of the anchor, not a stale cached copy
  of an older article.
- **The fetch object is a static CDN build, not a fresh origin render.** HTTP
  `last-modified: 2026-10-20T01:09:07Z`, `etag: "2da9b0b6…"`, `age: 898` with
  `x-cache: … HIT` at 20:04:44Z; a cache-busted GET has `age: 0`, `MISS, MISS, MISS` and
  the same bytes/ETag. The receipt's `sha256` pins that build. It is a **build identity**,
  not a content identity; the content identity is the commit `253bed3d`, which the receipt
  also records in `anchorObserved`.
- **No product-freshness claim is being made by S006.** The row is a docs pointer; the C1
  note §6 says the receipts "say nothing about how any product behaves, and the 51 rows are
  not a statement of current live product support"
  (`corpus/knowledge/source-recheck-round-18.md:141`). The counter's own
  `freshness_scope` is "round-18 receipt date 2026-10-20 only; not a reusable freshness
  due-date gate". So the main claim does **not** confuse immutable availability with live
  product freshness *for this row*. The residual is the digest's meaning: it is one build,
  not a durable page identity, and the receipt records no `Last-Modified`/`ETag`/`Age` to
  let a later auditor distinguish a build change from a per-request variant (F5).
- **The seat report's variance explanation is false.** `w1/Recheck03.md:62` says "MDN
  serves per-request build chrome, so the Gate sha is not reproducible from a fresh GET."
  Two fetches 58 minutes apart (receipt 19:06:09Z, mine 20:04:44Z) are byte-identical, and
  the cache-busted fetch is identical with `age: 0` / `x-cache: MISS, MISS, MISS`. The delta
  from the round-1 digest `6bb0a5ed…` is a **build boundary** (`last-modified`
  2026-10-20T01:09:07Z), not per-request chrome; within a build the digest is reproducible
  (F4). The Gate sha is not reproducible across the deploy; the new digest is stable.

## 5. Findings (path:line and finite counterexample)

| ID | Severity | Field / claim | Path:line | Finite counterexample | Effect |
|---|---|---|---|---|---|
| F1 | issue (note) | "the sidebar indexes each command/event name" | `corpus/evidence/round-18/source-recheck/S006.json:22` | Sidebar text after `bluetooth` is `bluetooth browser Commands close …`; only `/Modules/bluetooth` is linked, no `bluetooth/*` command. Same for emulation, network, permissions, storage, userAgentClientHints, webExtension — 7 of 13 modules. The bluetooth and emulation module pages have no `Commands` heading. | False universal in the receipt's rationale; `held` still defensible at row scope. Count-neutral. |
| F2 | issue (note) | module enumeration | `S006.json:22` | Note names 12 modules; `§List of modules` has 13 links; the 13th is `/Modules/userAgentClientHints`, with summary "The userAgentClientHints module contains commands for overriding user agent client hints." | Incomplete rationale; no effect on quote or counter. |
| F3 | limit (teaches) | quote supports teaches | `S006.json:13`; `w1/Recheck03.md:32` | Quote is 8 words and only asserts modular organization; the navigability/command-index part comes from the h2 sections and sidebar, not the quote. `Recheck03.md:32` "No clause of the cell overstates the body" is too strong for the note. | `held` is a page-structure judgment; quote presence is not claim proof (the C1 note itself says this at `source-recheck-round-18.md:140`). |
| F4 | issue (report) | "per-request build chrome" | `w1/Recheck03.md:62` | Two fetches 58 min apart byte-identical (`7dc6b2bd…`), cache-busted fetch identical (`age: 0`, `MISS`); response has `etag`, `last-modified 2026-10-20T01:09:07Z`, `x-goog-generation`. | Correct the variance explanation; it does not change the receipt. |
| F5 | limit (freshness) | digest = page identity | `S006.json:20`; `source-recheck-round-18.md:143` | `last-modified` 01:09 today vs content footer Apr 22; `age: 898` HIT; receipt records no headers. The digest is a build identity; the commit is the content identity. The note's blanket "must not be compared across runs" is overbroad for this static page. | Bounds the "live" claim to the served build; no false receipt. |
| F6 | info (wave) | 51 target vs 58 eligible | counter output; `corpus/SOURCES.md` at REV (64 rows) | `eligible_rows: 58` = 64 − 6 superseded; S058–S064 are new this round and have no receipts by design; `c1_rows_rechecked: 51`, `held: 50` + `own_work: 1`. | Presentation: 51/58 is not 7 missing baseline rows. No S006 impact. |

## 6. Contract rules — each checked

| PLAN §C1 rule | Observed |
|---|---|
| JSON parses, schema `tabi-source-recheck-v1` | yes (`S006.json:1-2`) |
| `row` present at REV, not superseded | S006 at `SOURCES.md:20`; not superseded |
| `rowUrl` verbatim in `source` cell | yes |
| `sha256` 64-hex | `7dc6b2bd…af87` |
| `quoteWords` ≤25 and equals word count | 8 = 8 |
| `normalize(quote)` in `normalize(excerpt)` | yes; excerpt offset 600 |
| `excerptSha256` = sha of excerpt bytes | `fee9eb7e…8eae` |
| `quoteFound` true | yes |
| `fetchedAt` on 2026-10-20 | `2026-10-20T19:06:09.057Z` |
| `teachesVerdict` held (or drift + superseding row) | `held`; no superseding row needed |
| `httpStatus` 200 | 200 |
| `producerSha256` = producer at REV | `f2ba0033…a360` both on disk and `git show 530f40a:…` |
| One receipt per row | one S006 receipt |

**Count impact: none.** The counter's rejection list is empty. The ISSUES are in the
free-text `note` and the seat report, which the counter does not read.

## 7. Remaining unknowns / limits

- **Round-1 raw body not retained.** The lesson records only `6bb0a5ed…b7806c9`
  (`corpus/lessons/kaika-fleet-round-1.md:49`); the exact byte delta cannot be diffed.
  [INFERENCE] the delta is asset/nav chrome from the 2026-10-20T01:09:07Z build, not article
  text; the article quote and all section headings match the anchor commit. Confidence high
  on "different build", medium on "chrome only" (no retained old body).
- **Sidebar is build-dependent.** The served sidebar predates the current main sidebar
  commit `a4b7a640` (2026-10-20T18:20:27Z, adds `script.callFunction`); the served body has
  no `callFunction`, and both `…/Modules/script/callFunction` (live, HTTP 404, 88379 B) and
  the raw `…/script/callFunction/index.md` at main (HTTP 404, 14 B) are absent as of 20:07Z.
  This is outside S006's page content (the page commit is 253bed3d) but shows the nav index
  can lag the repo.
- **No product runtime.** No browser launched; no BiDi or WebMCP product behavior tested.
  The receipt is source-only, as the C1 note says.
- **`quoteOffset` semantics.** 1950 is a normalized-text offset; raw article byte offset is
  84612 (meta occurrences 3794/4225). The receipt does not label the unit. Not checked by
  the counter; a later auditor comparing to raw bytes should use 84612.
- **No live recheck of the other 50 receipts.** Scope is S006 only; the C1 total is taken
  from the committed counter run, not independently re-fetched for every row.

## 8. Tooling and files

No installs or upgrades; no pacman transaction. `node v24.21.0`, `curl`, `python3`, `git`
were already present. No browser launched, no credential or session content handled, and no
page-tool invocation against a real site; the only network traffic was GET requests to public
sources (MDN, raw.githubusercontent.com, api.github.com).

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS006.md`

Private sandbox `/tmp/tabi-r18-s006-3092` held the fetched bodies, headers and JSON
responses; it is not part of the lane and is removed after this report. Reproduce with the
exact commands in §1 and the API URLs in §2.
