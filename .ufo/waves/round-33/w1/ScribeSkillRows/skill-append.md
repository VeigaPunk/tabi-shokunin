## Round 33 — registry row for the BiDi runtime gate v2 (2026-10-26; append-only; never edit above)

`scripts/check-bidi-runtime.mjs` is rewritten at v2 (round-33 C2, operability axis). Gate v1 admitted every receipt
construction the round-32 falsifiers built — eight accepted of eight
(`.ufo/waves/round-33/baseline/c2-J1-do-nothing.json`: `forgeriesAccepted 8`) — because the first-screenshot binding
proved a receipt was rendered on this host, not that its two runs were two real sessions. The frozen predicate requires
v2 to refuse all eight while still admitting the lane's honest round-32 receipt, a byte re-layout of it and the
round-32 w2 rerun pair (`admitted 16`, `failing 0`, `--selftest` exit 0) with no honest digest literal in its source
(`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs`, frozen bytes); the measured readings are the round's
receipts, not this row's prose. The rules v2 adds, each tied to the construction it refuses:

1. Row table (F2 duplicate ids, F7 decorated cell): a repeated row id is a row finding (`x3-duplicate-id`); population
   counts every table row whose `Measured` cell is non-empty; a `Measured` cell that is not exactly `yes` or `no` is
   a row finding, so `yes (live)` no longer counts as a measured row.
2. Session provenance (F1 golden splice, F3 same path twice, F4 byte copy): the two runs cite distinct transcript
   paths and distinct transcript sha256; each run's `newSession` body carries a `sessionId` of ChromeDriver's own
   shape (32 lowercase hex, S127) and a `capabilities.webSocketUrl` of `ws://127.0.0.1:<port>/session/<sessionId>`;
   the two session ids differ; and no run's browsing-context ids equal the constants the gate's own synthetic
   transcript generator emits (honest contexts are 32 uppercase hex). A golden transcript with one real screenshot
   spliced in no longer passes.
3. Driver provenance (F5 gate-copy driver, F6 re-export driver): the cited driver blob is present with its stated
   sha256, that sha256 differs from the gate's own blob at `--rev`, and the driver's source neither re-exports the
   gate (`export * from` / `export {…} from`) nor imports a gate symbol outside the allow-list stated in the gate
   header — `FIXTURE`, `FIXTURE_SHA256`, `FIXTURE_HEADER`, `VIEWPORT`, `DATA_TEXT`, `serveFixture`; the round-32
   driver imported three of them, and v2 states the list instead of leaving it implicit (round-32 routed defect 1).
4. Mined source row (F8 junk source): the cited new `S`-row must also appear in a `corpus/lessons/round-*.md`
   `## Gate` table row at `--rev` carrying an https URL and a 64-hex sha256, and the registry row's source URL host
   must equal that Gate URL host.
5. No honest bytes as a literal: neither a 64-hex honest digest nor a 12-hex prefix of one may occur in the gate's
   source, so accepting the honest receipt cannot be done by whitelisting its digests
   (`.ufo/waves/round-33/baseline/c2-J3-whitelist.json` is that control).
6. Live leg (no-harm evidence, not part of the offline predicate): `--live` launches the real binary
   `/usr/lib/chromium/chromium` by default, passes no `--no-sandbox`, and bypasses the `/usr/bin/chromium` launcher's
   `~/.config/chromium-flags.conf` injection (S128; `--no-sandbox` disables the layer-1 namespace/setuid sandbox,
   S129), refusing with a clear message when the sandbox cannot start.

The CLI, the JSON field names and the exit classes are unchanged (fields added only). The row below supersedes the
round-32 `bidi-runtime` row at `SKILL.md:2626`; `scripts/check-gate-registry.mjs` reads the latest row for a gate in
document order, so this is a revision of one gate, not a second gate.

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| bidi-runtime | gate | `node scripts/check-bidi-runtime.mjs --rev REV --baseline REV --entry corpus/knowledge/X.md [--receipt PATH] [--live] [--json]` | 0=clean (population>=1, every measured row admitted); 1=failed (entry absent, no newly mined source row, a duplicate row id, a Measured cell that is not `yes` or `no`, a run pair without distinct session provenance, a driver that is the gate or imports it beyond the allow-list, or a row not admitted); 2=could-not-evaluate (usage, unresolvable revision, registry absent, `--live` without chromedriver or chromium) | `node scripts/check-bidi-runtime.mjs --selftest` (cases=<N>, passed=<N>) | `scripts/check-bidi-runtime.mjs` FIXTURE, ROWS, PREDICATES, CASES and the driver import allow-list; `corpus/evidence/round-32/bidi/`; `.ufo/waves/round-33/claims.json` C2 frozenDigests; `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` | stdout/stderr only; production reads committed git blobs; `--live` starts chromedriver and headless chromium from the real binary under a throwaway profile in a short TMPDIR, 127.0.0.1 fixtures only, no `--no-sandbox`, launcher flags file bypassed | tabi L1 |

## Round 33 — sibling-overlap sweep and screen ledger (2026-10-26; append-only; never edit above)

Round 17's map (`corpus/adjacency.tsv`, ten rows, gate `scripts/check-adjacency.mjs`) records the overlaps this lane
dispositioned; it never bounded which sibling province lines the map had to answer for. Round 33 freezes the
population. `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` takes every line of every sibling lane's
`PROVINCE.md` at that sibling's frozen pin whose text matches the frozen browser-domain regex (word-bounded,
case-insensitive: browsers, browser, chromium, chrome, cdp, devtools, playwright, puppeteer, webdriver, bidi,
selenium, webbridge, tabi, crawl/crawler/crawlers/crawling, scrape/scraper/scrapers/scraping). Twenty sibling
`PROVINCE.md` files are scanned and seven carry a match — 52 candidates: kake 42, kagi 4, kaidoku 2, tsukuroi 1,
revenger 1, kotoba 1, kengaku 1 (`.ufo/waves/round-33/baseline/c1-candidates.tsv`). At the baseline five are mapped
(`kaidoku:53`, `kake:34`, `kake:39`, `kagi:43`, `revenger:5`) and 47 are unaccounted.

A candidate is accounted for in exactly one of two ways. **Mapped** — a verification-passing row of
`corpus/adjacency.tsv` cites that sibling's `PROVINCE.md` line and the cited line's text equals the candidate line
(text, not pin: kake's map rows cite a commit whose line 30 and line 35 read the same as the frozen pin's 34 and 39).
**Screened** — the ledger `corpus/adjacency-screen.tsv` carries a row for it. The counter reports the claim met only
when `scripts/check-adjacency.mjs` is clean at the revision, `unaccounted` is 0 and at least four map rows are new
since the baseline, verification-passing, covering a candidate, and naming the other side (`ruled` or
`contested-open`, or `split-declared` / `refused-route` whose sibling quote contains `tabi` or whose tabi quote names
the sibling lane). Baseline reading: candidates 52, mapped 5, screened 0, unaccounted 47, newMapped 0, adjacency
clean.

The ledger is TAB-separated, one row per screened candidate, with the header `sibling_ref`, `reason`, `surface`,
`quote`, `note` in that order and no other header — a different first line is `screen-header` and no row is read.
The first four columns are checked mechanically; the fifth is prose (the counter verifies only that the column exists):

| column | rule |
|---|---|
| `sibling_ref` | exactly `<lane>-shokunin@<pin>:PROVINCE.md:<line>` from the frozen candidate list; any other string is `screen-not-a-candidate`, and a repeated one is `screen-duplicate` |
| `reason` | one of `not-browser-sense`, `same-surface`, `third-lane-report`, `no-claim-declared`; anything else is `screen-reason-unknown` |
| `surface` | a `same-surface` row names a surface that a verification-passing map row already carries for the SAME sibling (the folded surface and sibling pair); every other reason writes exactly `-` |
| `quote` | a verbatim substring of the cited candidate line, 4 to 25 whitespace-separated words and at least 20 non-space characters — the span that decides the disposition |
| `note` | free prose: why this line is not an overlap this lane must answer for |

The ledger is a judgement about real overlap, not a parking place. A screened line is a line this lane says it does
not overlap, and the row is re-opened when the sibling's pin moves and the quoted line changes. `contested-open` is
not a screen reason: an overlap this lane cannot adjudicate is a map row whose `ruling_ref` is a fleet L0 question
`tabi | round-33 | ...` naming the sibling; seats draft such lines and only the L1 files them. Nor is a map row
optional when the overlap is real — the counter cannot judge overlap semantics (four rows on candidate lines whose
quotes name the other side reach the target whatever their disposition is worth; a candidate screened with a wrong
reason still counts as accounted), so the semantic guard is the round's attack wave and the closure's spot-check.

### Round 33 — decision rule: a map row or a screen row (append-only)

Ask in this order; the first answer that applies decides, and a real overlap is never screened.

1. **Is the line about this lane's craft at all** — a browser, a driver, a protocol, a capture? A sibling line that
   only matches the regex through another sense of the word (a UI "chrome" skin, a prose "crawl" of a book) is
   `not-browser-sense`.
2. **Does a verification-passing map row already own that surface for that sibling?** Then `same-surface`, with the
   `surface` cell repeating that row's surface; the line adds no second row for a surface already answered.
3. **Does the line only report another lane's work** — a probe it ran, a measurement it took, a ruling it received —
   without claiming anything on this lane's surface? Then `third-lane-report`.
4. **Does the line declare no claim on this lane's surface** — a deliberate refusal, a boundary it will not cross, an
   explicit non-goal? Then `no-claim-declared`.
5. **Otherwise it is an overlap.** Add a map row: nine TAB columns, both quotes verbatim, a disposition of `ruled`,
   `contested-open`, `split-declared` or `refused-route`, and the ruling reference that disposition requires. If no
   truthful `tabi_ref` and `tabi_quote` exist, the line is not an overlap this lane can map — say so in the lesson;
   never convert the gap into a screen row.

A screen row is cheaper than a map row but weaker evidence: it carries no tabi side. When the same line could be
mapped truthfully (this lane shares the surface and has a committed line to cite), map it; the screen ledger exists
for lines the map must not answer for, not for lines that are merely inconvenient.

## Round 33 — corrections (append-only; each cites the stale line in its own document)

- `scripts/check-bidi-runtime.mjs` `--selftest` (<N>/<N>): correction — supersedes the stale tally at
  `SKILL.md:2626`. That line states `cases=27, passed=27`, the v1 count at the round-32 freeze; v2 adds one case per
  frozen battery construction F1–F8 and one per round-32 surviving mutant M04, M06, M09, M10, M11, M14, M17, M18 and
  M19, and the gate prints `BIDI_RUNTIME_SELFTEST verdict=clean cases=<N> passed=<N>` at the round-33 measured
  revision (registry section above).
