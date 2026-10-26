# ScribeSrcBidiSpec — S124 (W3C WebDriver BiDi, re-opened), round 32 w1 / milestone C1

**Verdict.** S124 is ready to land: the dated Working Draft this lane already cites is
*unchanged*, not superseded — https://www.w3.org/TR/webdriver-bidi/ served HTTP 200 with
`Last-Modified: Thu, 08 Oct 2026 07:00:10 GMT`, and the dated URL
https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ returns byte-identical content
(4,235,856 B, sha256 `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4`,
revision meta `f922e6af669ead51496db85f37813f39438ef171`), the same revision and digest
S005 recorded on 2026-10-19; nothing moved, so the row re-opens S005 with the C1 driver's
per-command anchors rather than superseding it. All sixteen driver commands/event named in
the seat item are located with a section number and a verbatim ≤25-word quote, and R16 is
confirmed to have no BiDi command in §7.3.3 at this revision. The drafted 11-cell row passes
the real structural gate: `check-sources.mjs` is clean with the row inserted and a used-by
stub entry present (exit 0, rows 122→123, findings 0), and the frozen counter's offline leg
accepts the row's `source:` citation (`entryFinding: null`). No live BiDi session, entry,
receipt or lane file is touched by this seat; the runtime half of C1 remains the executors'.

## Evidence (commands run and exit codes)

Scratch root `$S=/fast/scratch/hyaku/tabi-r32/ScribeSrcBidiSpec` (TMPDIR=$S throughout);
clone `git clone --shared …/tabi-shokunin "$S/clone"`, `checkout --detach 4181fff…`; every
git call carried `-C "$S/clone"` and the clone toplevel was verified equal to `$S/clone`.

| # | command (abridged) | result | exit |
|---|---|---|---|
| 1 | `curl -q -sS --proto =https -o bidi-body.html -D bidi-headers.txt -w '%{http_code} %{size_download}' https://www.w3.org/TR/webdriver-bidi/` | 200, 4235856 B, UTC 2026-10-26T16:02:06Z | 0 |
| 2 | same for `https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` | 200, 4235856 B, UTC 2026-10-26T16:02:22Z | 0 |
| 3 | `cmp -s bidi-body.html dated.html` | identical | 0 |
| 4 | `sha256sum bidi-body.html` | `dc1077db…1d24d4` | 0 |
| 5 | `node clone/scripts/check-sources.mjs --root probe-full` (pristine `corpus/` from 4181fff) | clean, rows=122, findings=0 | 0 |
| 6 | same with the S124 row + a used-by stub entry | clean, rows=123, mined 98→99, findings=0 | 0 |
| 7 | same against a partial probe root (missing used-by files), with and without the row | 142 findings each; **0** findings naming S124; delta 0 | 1 / 1 |
| 8 | `node clone/scripts/check-bidi-runtime.mjs --repo clone --rev 34e8e70… --baseline d805d1d… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json` (offline) | population 1, admitted 0, failing 1, `entryFinding: null`, reason `t1-receipt` (no receipt in the probe) | 1 |
| 9 | `sha256sum clone/scripts/check-bidi-runtime.mjs` | `2f25af5a…16c393` = the frozen digest in claims.json | 0 |
| 10 | `pgrep -x chromium; pgrep -x chromedriver` after my work | none from this seat (the live PIDs point at sibling seats' `--user-data-dir`s under `tabi-r32/ExecInterceptPhases` and `tabi-r32/ExecCollectorTiming`; I started no browser) | 1 |

Raw outputs: `sources-gate-full-base.txt`, `sources-gate-full-with-S124.txt`,
`sources-gate-base.txt`, `sources-gate-with-S124.txt`, `bidi-counter-s1.json`,
`bidi-counter-s1.err` (empty).

Probe commit in the scratch clone: `34e8e707cb0a8891094b6f292cf8a7f7cbc06ab2` (scratch-only,
removed with the scratch; not reproducible from the lane by design — the reproducible part is
the row and the probe root layout described here).

## Fetch record

- Requested URL: `https://www.w3.org/TR/webdriver-bidi/` (no redirect; `%{url_effective}` is
  the same URL), HTTP/2 200, 4,235,856 B, UTC 2026-10-26T16:02:06Z,
  `Last-Modified: Thu, 08 Oct 2026 07:00:10 GMT`, `Content-Location: Overview.html`.
- Dated WD: `https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/`, HTTP/2 200,
  4,235,856 B, UTC 2026-10-26T16:02:22Z, byte-identical (`cmp` exit 0).
- Document header: "This version:" = the dated URL; "Latest published version:" =
  `https://www.w3.org/TR/webdriver-bidi/`; "Previous Versions:" =
  `https://www.w3.org/TR/2026/WD-webdriver-bidi-20260930/`; `meta name=revision`
  = `f922e6af669ead51496db85f37813f39438ef171`; SOTD date line "8 October 2026".
- sha256 (both fetches, identical): `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4`.
- Bytes saved at `webdriver-bidi-20261008.html` in this output dir; machine record in
  `fetch.json`. Only a read-only HTTPS GET was made; the `__cf_bm` cookie the response offered
  was never stored (`curl` ran without a cookie jar).
- Notes for replay: the page's markup leaves a space before some punctuation
  (`adds a collector .`), so quotes that would end on such a full stop are cut before it.

## Comparison with S005 (dated WD 2026-10-08)

| item | S005 (opened 2026-10-19) | this opening (2026-10-26) | moved? |
|---|---|---|---|
| dated WD | 2026-10-08 | 2026-10-08 | no |
| revision | `f922e6af669ead51496db85f37813f39438ef171` | same | no |
| sha256 | `dc1077db…1d24d4` (kaika Gate, S005 row) | `dc1077db…1d24d4` | no |
| bytes | 4,235,856 | 4,235,856 | no |
| section scope in the row | Abstract and §§7.1–7.10 | the C1 driver's command sections (below) | anchors deepened, spec text unchanged |

Nothing moved: no republication, no revision bump, no section renumbering. Therefore S124 is a
re-opening with driver-specific anchors, **not** a `supersedes S005` row (and the registry's
duplicate-URL rule is satisfied by citing the dated URL, which is a distinct URL string from
S005's undated `/TR/webdriver-bidi/`).

## Per-command locator (C1 driver methods, from `scripts/check-bidi-runtime.mjs:142-147,214-302`)

Every quote below was checked as a verbatim substring of the fetched document
(normalized whitespace) and is ≤25 words; `anchors.json` carries the same records with
section ids, line numbers and a `verbatim_in_document` flag.

| Row | Driver call | Section | Quote (≤25 words) |
|---|---|---|---|
| R2 | `browsingContext.getTree` | 7.3.3.5 | "The browsingContext.getTree command returns a tree of all descendent navigables including the given parent itself" |
| R3 | `browsingContext.navigate` (+ event `browsingContext.load`) | 7.3.3.8 (event 7.3.4.7) | "The browsingContext.navigate command navigates a navigable to the given URL." |
| R4 | `browsingContext.captureScreenshot` | 7.3.3.2 | "captures an image of the given navigable, and returns it as a Base64-encoded string." |
| R5 | `browsingContext.locateNodes` | 7.3.3.7 | "returns a list of all nodes matching the specified locator" |
| R6 | `script.evaluate` | 7.6.4.4 | "evaluates a provided script in a given realm. For convenience a navigable can be provided in place of a realm" |
| R7 | `browsingContext.setViewport` | 7.3.3.12 | "modifies specific viewport characteristics (e.g. viewport width and viewport height) on the given top-level traversable" |
| R8, R9 | `input.performActions` (pointer / key) | 7.9.3.1 | "performs a specified sequence of user input actions." |
| R10 | `session.subscribe` | 7.1.3.4 | "The session.subscribe command enables certain events either globally or for a set of navigables." |
| R10, R11 | events `network.beforeRequestSent`, `network.responseCompleted` | 7.5.6.2, 7.5.6.4 | `network.BeforeRequestSent = ( method : "network.beforeRequestSent"` — type declaration; the R11 payload shape is 7.5.4.17: "The network.ResponseData type represents the response to a network request." |
| R12 | `network.addDataCollector`, `network.getData` | 7.5.5.1, 7.5.5.8 (timing note 7.5.2) | "The network.addDataCollector adds a collector"; "The network.getData command retrieves a network data if it is available."; note: "there are no collectors setup when the response is created" |
| R13 | `network.addIntercept`, `network.continueRequest` | 7.5.5.2, 7.5.5.3 (concept 7.5.3) | "The network.addIntercept command adds a network intercept"; "The network.continueRequest command continues a request that…"; "A network intercept is a mechanism to allow remote ends to intercept and modify network requests and responses." |
| R14 | `browsingContext.traverseHistory` | 7.3.3.15 | "The browsingContext.traverseHistory command traverses the history of a given navigable by a delta." |
| R15 | `storage.getCookies` | 7.7.3.1 | "The storage.getCookies command retrieves zero or more cookies which match a set of provided parameters." |
| R17 | `browsingContext.handleUserPrompt`, event `browsingContext.userPromptOpened` | 7.3.3.6, 7.3.4.14 | "The browsingContext.handleUserPrompt command allows closing an open prompt"; "The remote end event trigger is the WebDriver BiDi user prompt opened steps" |
| R16 | — (no command) | 7.3.3.1–7.3.3.15 | §7.3.3 at this revision lists 15 `browsingContext` commands; the only stop is 7.3.3.14 `stopScreencast`, which stops screencasting, not navigation |

R1 is not a S124 command: `PREDICATES.R1` reads classic new-session capabilities
(`browserName`, `browserVersion`, loopback `webSocketUrl`) and only requires *some* successful
BiDi command; the capability half belongs to S126.

## Draft registry row S124 (11 cells, no `|` inside a cell)

Exact bytes also in `draft-row-S124.txt`; insert as the last row of the `## Registry` table.

```
| S124 | W3C WebDriver BiDi dated Working Draft — https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ | spec | A | Protocol semantics of the sixteen WebDriver BiDi commands and one event the round-32 C1 driver sends, plus the network data-collection and intercept rules they depend on; spec text only, never implementation coverage | WD published 8 October 2026, revision f922e6af669ead51496db85f37813f39438ef171; Abstract plus §§7.1.3.4, 7.3.3.2, 7.3.3.5-7.3.3.8, 7.3.3.12, 7.3.3.15, 7.3.4.14, 7.5.2, 7.5.3, 7.5.5.1-7.5.5.3, 7.5.5.8, 7.6.4.4, 7.7.3.1, 7.9.3.1; fetched 2026-10-26, 4235856 B, sha256 dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4, byte-identical to S005's 2026-10-19 fetch and to the undated /TR/webdriver-bidi/ alias | Each command the C1 driver sends has its own section: subscribe enables events globally or per navigable; getTree returns navigable trees; navigate returns the target URL; captureScreenshot returns a Base64 PNG; locateNodes matches a locator; setViewport modifies top-level traversable viewport characteristics; script.evaluate runs in a realm or navigable; performActions runs an action sequence; addDataCollector registers collectors that must already exist when a response is created; getData retrieves collected data; addIntercept adds beforeRequestSent, responseStarted or authRequired phases; continueRequest releases a blocked request; traverseHistory steps by delta; getCookies filters cookies; handleUserPrompt closes a prompt; userPromptOpened is emitted by the user prompt opened steps. A dated Working Draft is protocol text, never per-browser support, and S005's dated WD is unchanged, so this row re-opens it with the driver's section anchors rather than superseding it | mined | 2026-10-26 | 90d | corpus/knowledge/webdriver-bidi-runtime-round-32.md |
```

Validation of this exact line (not a paraphrase): fields split to 13 (11 cells), `spec`/`A`/`mined`
allowed, all dates ISO, `anchor` non-bare, no duplicate URL, and the used-by target contains
`S124`, so `check-sources.mjs` reports `verdict=clean findings=0` (step 6 above).

## Draft lesson `## Gate` record for `corpus/lessons/round-32.md`

Also in `draft-gate-S124.md`.

```
- S124 — W3C WebDriver BiDi dated Working Draft https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ — opened 2026-10-26
  (undated alias https://www.w3.org/TR/webdriver-bidi/ served identical bytes; both 200, 4,235,856 B, sha256 dc1077…1d24d4;
   revision f922e6af669ead51496db85f37813f39438ef171, unchanged since S005, so no supersede).
  Quote (Abstract): "This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents."

| S124 | ScribeSrcBidiSpec | "This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents." — Abstract, dated WD 2026-10-08, fetched 2026-10-26 | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` |
```

## Touched surfaces

- Written (this seat's own output dir only):
  `.ufo/waves/round-32/w1/ScribeSrcBidiSpec/` — `webdriver-bidi-20261008.html`,
  `fetch.json`, `anchors.json`, `draft-row-S124.txt`, `draft-gate-S124.md`,
  `sources-gate-full-base.txt`, `sources-gate-full-with-S124.txt`, `sources-gate-base.txt`,
  `sources-gate-with-S124.txt`, `bidi-counter-s1.json`, `bidi-counter-s1.err`.
- This report.
- Scratch: `$HYAKU_SCRATCH/tabi-r32/ScribeSrcBidiSpec` (clone at 4181fff plus probe commit
  `34e8e707…`, probe roots, spec bytes) — **deleted** after copying receipts; `test -e` after
  `rm -rf` reports "scratch removed".
- Lane tracked files, lane git index, jj state: untouched (`git status --porcelain` in the lane
  shows only the L1's untracked wave files, no file of mine).
- Tool installs/upgrades: none (no pacman, no uv tool, no npm/npx). Nothing needed.

## Out of scope (not claimed, not done)

- No live BiDi session, chromedriver/chromium launch, fixture serving or receipt generation —
  the runtime half of C1 and the entry `corpus/knowledge/webdriver-bidi-runtime-round-32.md`
  belong to the executor and entry seats. My row points at that entry's future path.
- No edit to `corpus/SOURCES.md`, no edit to the entry, no round-32 lesson. `S123`, `S125`,
  `S126` are other scribes' rows.
- No claim that any row is implemented in Chromium; the matrix's `locally measured: no` stands
  until receipts land.

## Findings and limits

1. **S124 does not supersede S005.** Same dated WD, revision and bytes; the only difference is
   anchor depth. A `supersedes S005` cell would be false and would also be the only way to reuse
   S005's URL under `check-sources` — the dated URL avoids that.
2. **R16 stays a gap.** §7.3.3 at this revision has no navigation-stop command (7.3.3.14 is
   `stopScreencast`); the capability-matrix statement holds at 20261008.
3. **R1 is not covered here.** Its capability fields are classic WebDriver (S126); S124 only
   supplies the "any successful BiDi command" leg.
4. **Landing order matters.** The row's `used-by` must exist and cite `S124` before or with the
   row, else `check-sources` raises `E11 used_by_missing`. Verified against a stub entry: clean.
5. **Quote punctuation.** The spec's markup leaves a space before some full stops; quotes that
   would end there are cut before the punctuation (`adds a collector`, `adds a network
   intercept`, `continues a request that`, `allows closing an open prompt`). Whitespace is
   normalized; no word is altered.
6. **`teaches` is long** (≈1.2 kB). It is one sentence chain, not padding, and comparable to
   existing long cells (e.g. S082, S112); a shorter cell would drop the per-command map the
   round needs. The L1 may trim the section list in `anchor` if a tighter cell is preferred.
7. **Freshness is a fetch-time fact only.** The page is a living alias with no cache validators
   beyond `Last-Modified`; the 90d recheck covers a silent republication.
8. **No conflicts to report** to the canonical Rust judge: nothing in this opening contradicted
   the frozen claims, counters, or the contract.
