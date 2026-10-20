VERDICT: PASS

PASS applies to the committed S024 receipt: every C1 contract field reproduces from the live source, the source identity/anchor held, and the quote-to-teaches relationship is supported by page text at the time of attack. Two claim-level counter limitations (M1/M2) were executed and are reported separately; they do not make the committed S024 bytes false, but they show C1's "integrity-checked" wording is weaker than body/excerpt provenance.

# S024 — C1 live source recheck (seat LiveS024, wave 2)

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Baseline B: `2bff864fdfee684ddbcd066cc8e735adaba2735c`
- Measured REV: `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
- Target: `corpus/evidence/round-18/source-recheck/S024.json` + `S024.excerpt.txt`
- Source: `https://playwright.dev/docs/aria-snapshots` (row S024, `corpus/SOURCES.md:38`)
- Probe dirs: `/tmp/tabi-s024-attack`, `/tmp/tabi-s024-c1forge`, `/tmp/tabi-s024-teachforge` (all private; no LANE production/fleet/jj/Git-index writes; no Git writes in LANE)
- Tools: system `curl 8.23.0`, `node v24.21.0`; no installs or upgrades; public-source GET only.

## Axes

- A1: receipt body bytes/digest/status/excerpt/producer binding vs live fetch.
- A2: source identity and section anchor.
- A3: does the quoted sentence support the row's `teaches` cell; does page-level text close the gap.
- A4: does C1 conflate immutable availability with live product freshness.
- M1/M2: does the C1 counter's admission predicate actually bind a receipt to its fetched body/teaches.

## 1. Live fetch (A1)

Exact command run in `/tmp/tabi-s024-attack`:

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -D headers.txt -o body \
  -w 'HTTP=%{http_code} SIZE=%{size_download} TIME=%{time_total}\n' \
  'https://playwright.dev/docs/aria-snapshots'
```

Observed, exit 0:

```
HTTP=200 SIZE=16228 TIME=0.258541
125426 body
bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194  body
```

`SIZE=16228` is the gzip transfer size; `--compressed` decodes to `125426` bytes, which is the value in `S024.json:9` (`bytes`) and the byte length on disk. Response headers observed in `headers.txt`:

```
HTTP/2 200
server: GitHub.com
content-type: text/html; charset=utf-8
content-encoding: gzip
content-length: 16228
last-modified: Tue, 20 Oct 2026 16:46:38 GMT
date: Tue, 20 Oct 2026 20:02:06 GMT
x-cache: HIT
x-origin-cache: HIT
age: 0
```

A second fetch checked identity and redirects:

```
curl -sSL --compressed --max-time 90 -A '...same UA...' -o body2 \
  -w 'HTTP=%{http_code} FINAL=%{url_effective} REDIRECTS=%{num_redirects} SIZE=%{size_download}\n' \
  'https://playwright.dev/docs/aria-snapshots'
```

Observed:

```
HTTP=200 FINAL=https://playwright.dev/docs/aria-snapshots REDIRECTS=0 SIZE=16228
bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194  body2
body2 IDENTICAL to body
```

Receipt comparison (raw-body equality is not required for a dynamic page; here it happened exactly):

| Field | `S024.json` | Live 2026-10-20 | Result |
|---|---|---|---|
| `httpStatus` | 200 (`:8`) | 200 | held |
| `bytes` | 125426 (`:9`) | 125426 decoded | held |
| `sha256` | `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194` (`:10`) | same | held, exact |
| final URL | row URL (`:4-5`) | same, 0 redirects | held |
| `decode` | `html-text` (`:11`) | html-text reproduction | held |

The receipt digest also equals the 2026-10-19 seat-fetch digest recorded at `corpus/lessons/kaika-fleet-round-1.md:67`, and the `bbbad6881341` prefix at `corpus/knowledge/source-recheck-round-18.md:74`. The file mtime `2026-10-20 16:05:37.569657547 -0300` equals `fetchedAt` `2026-10-20T19:05:37.569Z` (`S024.json:6`) to the millisecond, so the receipt date is internally consistent.

## 2. Normalizer, quote location, excerpt (A1)

I did not invoke `recheck-fetch.mjs` `main()` and produced no receipt. I imported its exported `decodeBody`/`normalize` functions (read-only) to reproduce the committed transformation exactly:

```
node --input-type=module -e '
  import { readFileSync } from "node:fs";
  import { decodeBody, normalize } from
    "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs";
  ...
'
```

Observed:

```
{
 "normLen": 17704,
 "at": 4648,
 "quoteWords": 13,
 "occurrences": 1
}
rebuiltExcerptSha=60e5c6a3c8f33b8cc0bb2d579ab1372d2b0d3a104a4f51a27fffe518fb0ab528 bytes=1286
committedExcerptSha=60e5c6a3c8f33b8cc0bb2d579ab1372d2b0d3a104a4f51a27fffe518fb0ab528
rawByteOffset=35985 rawLine=56/197 caseInsensitiveOffsets=[4648]
```

The excerpt algorithm is `text.slice(at-600, at+quote.length+600) + "\n"` (`recheck-fetch.mjs:107-109`); rebuilding it from the live body reproduces the committed `S024.excerpt.txt` byte-for-byte (`excerptSha256` at `S024.json:19`). The quote is unique, at normalized offset `4648` (the receipt's `quoteOffset`, `S024.json:17`), raw byte `35985`, line 56 of 197. The §Aria snapshots heading begins at normalized offset `4616`; the quote follows it.

The quote source cited by the receipt, `corpus/lessons/kaika-fleet-round-1.md:67`, contains the identical sentence and the same full body digest; `S024.json:15` is accurate.

## 3. Source identity and anchor (A2)

From the fetched body:

- Final URL `https://playwright.dev/docs/aria-snapshots`, redirects `0`; canonical link `rel=canonical href=https://playwright.dev/docs/aria-snapshots`; `og:url` same. Identity held.
- `<title data-rh=true>Snapshot testing | Playwright</title>`; `<h1>Snapshot testing` — matches the row's "Snapshot testing — Playwright" source cell.
- `<meta name=generator content="Docusaurus v3.10.1">` — matches `anchorObserved` (`S024.json:20`).
- Root class includes `docs-version-stable docs-doc-page docs-doc-id-aria-snapshots` — matches the "docs-version-stable" observation.
- `<h2 class="anchor anchorTargetStickyNavbar_Vzrq" id=aria-snapshots>Aria snapshots<a href=#aria-snapshots ...>` — the §Aria snapshots anchor exists and contains the quote immediately after the heading.
- Body date markers: `grep -o -i 'last updated|updated on|last modified|published on|<time...'` over the body returned none. The HTTP header `last-modified: 2026-10-20T16:46:38Z` is response metadata, not a page-body date marker; `anchorObserved`'s "no date marker" is true for the page text, but would be false if read to include headers (precision note M4).

Result: source identity **held**, anchor **held**, no redirect or rename.

## 4. Quote → teaches (A3)

Row teaches (`corpus/SOURCES.md:38`):

> An ARIA snapshot is a YAML accessibility-tree template matched partially or strictly — structural evidence, not pixels

The receipt quote (`S024.json:13`):

> aria snapshots provide a YAML representation of the accessibility tree of a page.

Sentence-level support is partial by design: the quote proves the YAML accessibility-tree representation, not the template/matching clauses. Page-level text at the same anchor supplies the rest:

- `A template is a constraint, not necessarily a complete serialization of the accessibility tree.` (normalized offset 4861).
- `Partial matching` section at offset 7177: partial matches by omitting attributes/accessible names.
- `Strict matching` section at offset 8409: default subset/`contain` matching and `/children` `contain`/`equal`/`deep-equal`.
- `Broad structural checks` appears twice; the page frames aria snapshots as structural checks, not pixel comparison.
- `pixel`/`pixels`: 0 occurrences in the normalized body. `screenshot`: 1 occurrence, a sidebar navigation link ("Screenshots"), not a claim about aria snapshots.

So `teachesVerdict: held` is substantively correct at page level. The only non-literal clause is "not pixels": the page says structural checks and an accessibility tree, but never literally says "not pixels." That is an inference from the representation, not a quoted statement; it is not contradicted. I record this as a qualification, not a drift.

Result: teaches **held (qualified)**: quote supports the representation; adjacent page sections support template/partial/strict; the "not pixels" clause is an interpretive gloss.

## 5. C1 receipt contract matrix

| Rule | Evidence | Result |
|---|---|---|
| schema `tabi-source-recheck-v1` | `S024.json:2` | pass |
| row present at REV, not superseded | `corpus/SOURCES.md:38`; superseded set is S004/S039/S047/S049/S050/S053 | pass |
| `rowUrl` occurs in source cell | source cell contains `https://playwright.dev/docs/aria-snapshots` | pass |
| `sha256` 64-hex | `S024.json:10` | pass |
| `quoteWords` ≤25 and equals count | 13, verified | pass |
| normalized quote occurs in normalized excerpt | verified; excerpt reproduces | pass |
| `excerptSha256` = sha of excerpt bytes | `60e5c6a3…` verified | pass |
| `quoteFound` true | quote unique at 4648 | pass |
| `fetchedAt` on 2026-10-20 | `2026-10-20T19:05:37.569Z` | pass |
| `teachesVerdict` held/drift (+superseding row) | held; page text supports | pass |
| `httpStatus` 200 | live 200 | pass |
| `producerSha256` = producer blob at REV | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` = `git show 530f40a…:.ufo/waves/round-18/recheck-fetch.mjs \| sha256sum` | pass |
| one receipt per row | only `S024.json` | pass |

Receipt file digest: `3f6c38ee550caa51d4c58382f2fef06462f82a0c551fc26ecf177da38b834e44` (working tree = `git show 530f40a…`). Producer digest: `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`. Excerpt digest: `60e5c6a3c8f33b8cc0bb2d579ab1372d2b0d3a104a4f51a27fffe518fb0ab528`. Body digest: `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194`.

## 6. Claim-level counter findings (M1/M2; executed, not S024 receipt defects)

The committed S024 receipt is true, but the C1 admission predicate is weaker than "integrity-checked" implies. The counter checks the receipt's `sha256` only as 64-hex (`measure-c1.mjs:330`); for HTTP rows it does not bind `bytes`, `sha256`, or the excerpt to any fetched body. The excerpt rule (`measure-c1.mjs:368-369`) binds the excerpt to itself and to the quote only. `--live` checks only `normalize(body).includes(normalize(quote))` (`measure-c1.mjs:428`); it never compares body digest/bytes to the receipt and never re-checks the teaches sections.

### M1 — forged body digest + synthetic excerpt accepted, static and live

Fixture `/tmp/tabi-s024-c1forge` (copied counter sha `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`; producer sha `f2ba0033…`), git commit `f27d34204429b6e5f75bf5b9b732acc544c05eb3`. Receipt key fields: real row URL and real quote, `httpStatus: 200`, `fetchedAt: 2026-10-20T…Z`, `teachesVerdict: held`, `quoteWords: 13`, but:

- `bytes: 999999` (not the live body's 125426)
- `sha256: 69e742ca828ad8747b056d80854bd59bf716d6fc92a92ac75d7976ca4703dd34` = sha256 of the literal string `forged body that is not the live page`
- `S024.excerpt.txt` = `SYNTHETIC EXCERPT — not derived from any fetched body. In Playwright, aria snapshots provide a YAML representation of the accessibility tree of a page. INSERTED CONTEXT THAT DOES NOT EXIST.` (`excerptSha256: 802c0ac21d5f5d9a50437339c0e756f32e1e4974dd7a621f25e4661ff4be180e`)

Static run:

```
node .ufo/waves/round-18/measure-c1.mjs "$(git rev-parse --verify HEAD)"
{"rev":"f27d34204429b6e5f75bf5b9b732acc544c05eb3", ...,
 "c1_rows_rechecked":1,"eligible_rows":1,"held":1,"drift_superseded":0,
 "own_work":0,"row_classes":{"kind":{"docs":1},"status":{"mined":1},"url":{"living_live":1}},
 "rejected":[],"live":null,
 "counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
STATIC_EXIT=0
```

Live run:

```
node .ufo/waves/round-18/measure-c1.mjs "$(git rev-parse --verify HEAD)" --live
{..., "c1_rows_rechecked":1,"held":1,"rejected":[],
 "live":{"checked":1,"live_held":1,"failures":[],"not_http":[]}, ...}
LIVE_EXIT=0
```

Finite counterexample: a receipt whose claimed body is a one-line forged string and whose excerpt contains invented surrounding text is counted as `held: 1` and `live_held: 1`. The counter's `--live` only confirms the real quote still exists somewhere on the live page. This is a claim-level gap in "integrity-checked"; it is not evidence that the committed S024 receipt is forged, because the committed S024 body and excerpt were independently reproduced above.

### M2 — quote-only page with teaches sections deliberately absent accepted

Fixture `/tmp/tabi-s024-teachforge`, git commit `0d07b00fe4ac6d702f5d9bddf0c2eb74199af611`; fixture-owned loopback `http://127.0.0.1:8777/aria-snapshots.html`, HTTP 200, body 348 bytes, sha256 `2b4409ff08fcae204977e4f994ea67a7d1ab8f7411ef939506a660e498543454`. The page contains the quoted sentence but no partial-matching section, no strict-matching section, and no template wording. Receipt `teachesVerdict: held`; `--live` result:

```
{"rev":"0d07b00fe4ac6d702f5d9bddf0c2eb74199af611", ...,
 "c1_rows_rechecked":1,"held":1,"rejected":[],
 "live":{"checked":1,"live_held":1,"failures":[],"not_http":[]}, ...}
LIVE_EXIT=0
```

Finite counterexample: deleting the two matching sections and template sentence from a page while retaining the 13-word quote still yields `held: 1` / `live_held: 1`. The fixture is not the real S024 page; at attack time the real page still has the sections at normalized offsets 7177/8409/4861, so S024's `held` is true. The finding is about what the counter can prove.

Additionally, `teachesVerdict` is passed straight from the CLI (`recheck-fetch.mjs:130`, `--verdict`); the producer never derives it from page content, and the counter only checks the enum and drift-supersession rule (`measure-c1.mjs:337-340`). The S024 `held` verdict is author-side and was independently verified here.

## 7. Freshness vs availability (A4)

S024 is an unpinned rolling docs URL: the counter's own classifier treats it as `living_live` (`measure-c1.mjs:247-259`; replication: `isPinnedUrl=false class=living_live`). The live re-fetch is therefore genuine live availability: 200, no redirect, current Fastly/GitHub Pages object, quote present. It does not conflate pinned archival availability with live fetching for this row.

The limit is the other direction: the body is byte-identical to the 2026-10-19 seat fetch (`corpus/lessons/kaika-fleet-round-1.md:67`) and to both direct 2026-10-20 fetches. The receipt therefore proves the sentence is still served on 2026-10-20 at 19:05Z/20:02Z; it does not prove that a pinned Playwright version's semantics are unchanged, and it cannot detect a semantics change that leaves the generic sentence intact. The C1 lesson gate already bounds this: `corpus/lessons/round-18.md:12-14` says C1 counts "round-specific integrity-checked recheck receipts, not overdue rows or current product support", and `measure-c1.mjs:471` emits `freshness_scope: 'round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate'`. So the declared claim does not confuse the two, provided "freshness" is read as point-in-time source presence, not product freshness. If the scorecard axis is read as product freshness, this receipt does not support that reading.

## 8. Limits of this attack

- Only S024 was attacked. S029 is a separate seat (`LiveS029`) and was not touched; the assignment's `git show` rule for S029 was not exercised. No other receipt was opened.
- The producer `main()` was not run and no receipt was written in LANE; the exported `decodeBody`/`normalize` functions were imported read-only to reproduce the committed normalization.
- Direct live checks were three GETs to playwright.dev on 2026-10-20 (body at ~20:02Z, body2 immediately after, and the M1 fixture's `--live`) plus one fixture-owned loopback GET for M2; no time travel. Raw-body equality was observed but is not the basis of the pass: identity, anchor, quote, excerpt, and digest checks were used.
- The quote was present, so no alternate rendering/raw endpoint was needed. No browser, no real-site page tool, no credentials/session content.
- `git status --porcelain` for the touched LANE paths (`SOURCES.md`, `S024.json`, `S024.excerpt.txt`, `measure-c1.mjs`, `recheck-fetch.mjs`) returned empty; no LANE file was modified.
- Fixture repositories are ephemeral `/tmp` copies; M1/M2 are reproducible from the field values above.

## 9. Result

S024's committed receipt is **accurate and reproducible** at attack time: same 125426-byte body, same full SHA-256, HTTP 200, same excerpt SHA-256, quote at the same normalized offset, same §Aria snapshots anchor, same producer digest, and the quote is supported by the page text (with the "not pixels" gloss noted). The C1 counter itself is not an integrity check of body/excerpt provenance: it accepts a forged body digest and synthetic excerpt (M1) and a quote-only page with the teaches sections deleted (M2), in both static and `--live` modes. Those are C1 claim-mechanism findings for the counter owner, not a failure of this receipt's committed bytes.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS024.md`
- `/tmp/tabi-s024-attack/body`
- `/tmp/tabi-s024-attack/body2`
- `/tmp/tabi-s024-attack/headers.txt`
- `/tmp/tabi-s024-attack/rebuilt.excerpt.txt`
- `/tmp/tabi-s024-c1forge/` (fixture; source retained above)
- `/tmp/tabi-s024-teachforge/` (fixture; source retained above)
