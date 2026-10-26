# Round 31 w1 — ScribeSourcesRows report

Verdict: the four registry rows S119–S122 are drafted against the frozen revision
`9505a10eb80b2a0b273ebaba3f7f872ad302192d` and satisfy SOURCES contract v1 in a scratch mirror
of that revision — 11 cells each (NF=13), kind `spec`/`spec`/`docs`/`docs`, tier A scoped to each
`scope`, status `mined`, opened `2026-10-26`, recheck `365d`/`365d`/`90d`/`90d`, used-by
`corpus/knowledge/rate-signal-decision-table.md` — and
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <mirror>/corpus/SOURCES.md`
exits 0 with 0 E-lines and 19 pre-existing W04 lines (unchanged; no new rows trigger a warning).
All four pages were fetched read-only in this seat; every Gate quote (12, 25, 13 and 9 words) and
every supplementary quote was located in the fetched bytes at the cited line spans, and raw bytes
plus receipts are preserved in the output dir. Nothing was written to the lane tree, and the lane's
`SOURCES.md` still has 118 rows with S118 as the last one.

## Fetch receipts

`curl -q -sS --proto =https -o <file> -w '%{http_code}' <url>`, one GET per URL, no `-L`, no
cookies, no credentials, no api.github.com. Raw bytes are in `bytes/` beside this report and
`fetch-receipts.tsv` records the same table.

| id | URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| S119 | https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T08:36:21Z | 200 | 25265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 |
| S120 | https://www.rfc-editor.org/rfc/rfc6585.txt | 2026-10-26T08:36:21Z | 200 | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 |
| S121 | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-10-26T08:36:21Z | 200 | 337116 | ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18 |
| S122 | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 2026-10-26T08:36:21Z | 200 | 328088 | b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e |

Exit code of the batched fetch command: 0. Byte counts are those reported by `wc -c`; the sha256
column was re-computed with `sha256sum` on the copied files in `bytes/` after the copy.

## Deliverables

- `rows.md` — the four complete rows, ready to append after S118 (lane `corpus/SOURCES.md` line
  132, before `## Paths` at line 133), plus cell notes (why tier A is scoped, why `recheck` cadence
  differs, why the used-by path must exist before census runs).
- `gate.md` — one Gate line per row (URL, UTC access time, HTTP status, bytes, sha256, ≤25-word
  located quote) in the round-30 lesson's table shape, plus further located spans per row and the
  quote-proof method.
- `appended-rows.md` / `newrows.txt` — the same four rows as appended in the mirror.
- `validate.txt` — the census command, its exit status and full stdout.
- `quote-check.txt` — every quote with located line span, word count and FOUND/MISSING, ending
  `ALL_QUOTES_LOCATED`.
- `bytes/S119.txt`, `bytes/S120.txt`, `bytes/S121.html`, `bytes/S122.html` — raw fetched bytes.
- `fetch-receipts.tsv` — the receipt table above.

## Commands and exit codes

1. Clone and pin (scratch, `TMPDIR=/fast/scratch/hyaku/tabi-r31/ScribeSourcesRows`):
   `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`;
   `git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d`.
   Result: `head=9505a10eb80b2a0b273ebaba3f7f872ad302192d`, `status --porcelain` = 0 lines, exit 0.
2. Fetches: table above, exit 0.
3. Quote location (Python, whitespace-collapsed for RFC text; tags stripped, entities unescaped
   and whitespace collapsed for the GitHub HTML): `ALL_QUOTES_LOCATED`, exit 0. Located spans:
   - S119 gate `rfc9309.txt:377-378`; supplementary `:384-385`, `:425`, `:419`; anchor facts
     `:392` (400-499), `:403` (500-599), `:406` (30 days).
   - S120 gate `rfc6585.txt:137-139`; supplementary `:145` (`Retry-After: 3600`), `:165` (429
     cache prohibition).
   - S121 gate `gh-rate-limits.html:67`; supplementary `:38` (60/hour unauthenticated), `:66`
     (100 concurrent), `:70` (80/min and 500/hour content-generating); anchor facts `:41`
     (5,000/hour), `:61` (GITHUB_TOKEN 1,000/hour/repo), `:143` (403/429 with remaining 0).
   - S122 gate `gh-best-practices.html:51`; supplementary `:43` (serial), `:45` (one second),
     `:49` (Retry-After), `:51` (exponential); anchor facts `:36` (x-poll-interval), `:57`
     (301 permanent), `:58` (302/307 temporary), `:64` (304 not counted).
   All word counts are ≤25; the S120 gate quote is exactly 25.
4. Mirror build: `cp -a "$S/clone/corpus" mirror/corpus`; four rows inserted after the S118 line
   with a Python split/insert asserting `lines[131]` starts `| S118 |` and `lines[132]` starts
   `## Paths`; a placeholder entry created at
   `mirror/corpus/knowledge/rate-signal-decision-table.md`. Exit 0; mirror rows 118 → 122.
5. Census:
   `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$S/mirror/corpus/SOURCES.md"`
   → **exit 0**, `E` lines 0, `W` lines 19. None of the 19 W04 lines mentions S119–S122; they are
   the lane's pre-existing duplicate-URL-across-scopes warnings (S058–S118). Verbatim stdout
   (also `validate.txt`):

```
file	W04	S058 duplicate url chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd across scopes
file	W04	S065 duplicate url git-scm.com/docs/git-rev-parse across scopes
file	W04	S066 duplicate url www.selenium.dev/documentation/webdriver/bidi across scopes
file	W04	S068 duplicate url github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts across scopes
file	W04	S069 duplicate url developer.chrome.com/blog/webdriver-bidi-2023 across scopes
file	W04	S070 duplicate url raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md across scopes
file	W04	S073 duplicate url github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md across scopes
file	W04	S074 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 across scopes
file	W04	S075 duplicate url developer.chrome.com/docs/ai/webmcp/imperative-api across scopes
file	W04	S076 duplicate url mpapad.github.io/publications/pdfs/ICST25.pdf across scopes
file	W04	S077 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT across scopes
file	W04	S095 duplicate url html.spec.whatwg.org/multipage/input.html across scopes
file	W04	S096 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
file	W04	S098 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT across scopes
file	W04	S099 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl across scopes
file	W04	S100 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
file	W04	S114 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
file	W04	S115 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
file	W04	S118 duplicate url github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts across scopes
file	ok	<mirror>/corpus/SOURCES.md
```

   (The `ok` line's path is the scratch mirror, replaced here by `<mirror>`; the scratch directory
   was removed after the run.)
6. Contract structural checks on the mirror (plain `awk`, CORPUS.md §Census):
   rows = 122; malformed rows = 0; duplicate ids = none; tier/status/kind enum violations = none;
   tier-A-community = none. The four new rows each report `cells=11`.

## Findings

1. **Append point.** At the freeze, `corpus/SOURCES.md` has 118 S-rows; S118 is the last row
   (line 132) and `## Paths` follows at line 133. The four rows belong between them. Row count at
   the freeze (118) matches the round-30 closure census, so no row was added between rounds.
2. **GitHub Docs line numbering.** Both GitHub pages serve a `__NEXT_DATA__` preload as HTML
   line 32 whose tail opens the article body; the first `h2` (`about-primary-rate-limits`,
   `avoid-polling`) is on that same line, and every later threshold is one element per line
   (S121: 33-74, 103-150; S122: 33-104). The anchor cells state this explicitly rather than
   pretending line 32 is a clean heading line, and each anchor also carries fetch time and sha256
   so the anchor names a byte revision, not a floating page.
3. **E11 forces the used-by path.** `sources-census.sh` E11 checks each mined row's used-by paths
   on disk under the registry's parent directory. The C1 entry does not exist at the freeze
   (`ls clone/corpus/knowledge/rate-signal-decision-table.md` → No such file), so the mirror
   validation needed a placeholder entry. On the lane, census will report four E11 lines unless
   the C1 entry exists when it runs; this is expected pre-C1 and is not a defect of the rows.
4. **No new warnings.** `W03` (mined row with used-by `—`) does not fire, because all four rows
   name the entry; `W04` stays at the 19 pre-existing lines because none of the four URLs occurs
   in the registry at the freeze (`grep -c` over the clone's `SOURCES.md` for the four URL
   fragments = 0).
5. **Tier scoping.** The RFCs are A for their own normative text; the GitHub pages are A only for
   what GitHub publishes about its own ceilings and guidance. Neither GitHub row claims a measured
   response, and the rounds' no-runtime rule holds: no request went to api.github.com, and every
   URL fetched is documentation.
6. **Numbering and word bounds.** Gate quotes are 12/25/13/9 whitespace-split words; the 25-word
   S120 quote is at the limit, so the L1 must not append words to it. Supplementary quotes are
   2–20 words.

## Out of scope / not done here

- No edit to the lane `corpus/SOURCES.md`, `SKILL.md`, `corpus/README.md`, `SCORECARD.md`, or any
  other tracked file; no lane git index or jj state touched; commits only in the scratch clone and
  none made.
- No C1 entry, no decision-table rows, and no `corpus/evidence/round-31/decision-table/` receipts:
  those belong to the C1 entry seat and the Fetch seats. The bytes in `bytes/` are this seat's own
  fetch evidence, not the C1 receipt set.
- No round-31 lesson: the L1 writes `corpus/lessons/round-31.md` from `gate.md`.
- No lane scripts run (no `check-sources.mjs`, no counter); only the fleet census script.
- No tool installs or upgrades; used `curl`, `git`, `python3`, `awk`/`grep`/`wc`, `sha256sum`.

## Known limits

- Line numbers are line numbers of the bytes fetched at the recorded time; a documentation edit
  will move them, which is why the anchors and receipts carry sha256 rather than only line numbers.
- The `sources-census.sh` result is for a mirror whose corpus directory is a byte copy of the
  freeze tree plus the four rows and one placeholder; it is not a lane-tree measurement.
- The GitHub pages include no visible revision marker, so `recheck 90d` is a cadence choice, not a
  derived date; the RFC rows use `365d` because published RFC text is stable.

## Artifact paths (relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`)

- `.ufo/waves/round-31/w1/ScribeSourcesRows/rows.md`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/gate.md`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/validate.txt`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/quote-check.txt`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/fetch-receipts.tsv`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/appended-rows.md`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/newrows.txt`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/bytes/S119.txt`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/bytes/S120.txt`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/bytes/S121.html`
- `.ufo/waves/round-31/w1/ScribeSourcesRows/bytes/S122.html`
- this report: `.ufo/waves/round-31/w1/ScribeSourcesRows.md`
