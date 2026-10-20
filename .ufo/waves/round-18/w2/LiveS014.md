VERDICT: PASS

# S014 live-source attack (C1 freshness) — no falsifying counterexample

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Measured candidate REV: `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
Lane tip checked read-only: `git -C LANE rev-parse --verify refs/heads/master` → `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
Probe time: 2026-10-20, 20:03–20:06 UTC (17:03–17:06 −03). Tools: `curl 8.23.0`, `node v24.21.0`, `python3` (stdlib `re`/`unicodedata`). No packages installed.

## 1. Artifacts read and bindings

- Receipt: `corpus/evidence/round-18/source-recheck/S014.json`
  file sha256 `9a8f68bf1642db16544d8d61f270b084cf7f35f6f2eb7adea27bc4e1620d17d9`;
  committed at REV as blob `e6c2d183edb988ffd3ba909c580332965e0625f1`.
- Excerpt: `corpus/evidence/round-18/source-recheck/S014.excerpt.txt`
  sha256 `5ca87465a4c202ff770f289f9c901a5e03e6b781fe0d2b3d9346b5458d9e063d`;
  committed at REV as blob `3d5ea51f137cb85549bfeb1c10d1c5c2c5bcfcb9`; 1289 bytes, one line.
- Row: `corpus/SOURCES.md:28` at REV (blob `c931461cdef10f45051210e0f68aee0fb7fbf250`):
  `| S014 | Trace viewer — Playwright — https://playwright.dev/docs/trace-viewer | docs | A | Playwright Test retry-trace capture | stable docs served 2026-10-19, §Recording a trace / Tracing on CI | Record the trace on the first retry so the failing path is inspectable with DOM, console and network records | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |`
  `rowUrl` occurs verbatim in the source cell; S014 is not in the superseded set
  (`PLAN.md:15-20`, `measure-c1.mjs:15`).
- Original quote record: `corpus/lessons/kaika-fleet-round-1.md:57` — same 15-word quote, same recorded body sha256 `e947d4dc…1bee`, section marker `§Tracing on CI`.
- Note: `corpus/knowledge/source-recheck-round-18.md:64` (S014 row: `mined / A | html-text | 200 | 60566 | e947d4dc0b73 | https://playwright.dev/docs/trace-viewer | stable docs served 2026-10-19, §Recording a trace / Tracing on CI`); scope statements at `:2` (author-side, not independent) and `:7` (“does not make any knowledge entry true”).
- Producer at REV: `.ufo/waves/round-18/recheck-fetch.mjs` blob `7d9c314e4fc84b672cb024f400101127033552ec`;
  sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` — equals `S014.json:24 producerSha256`.

## 2. Independent live fetch

Fetch 1 (same curl argv family as the receipt; UA string passed as one argv element):

```
mkdir -p /tmp/tabi-r18-lives014 && cd /tmp/tabi-r18-lives014
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body1 -w 'status=%{http_code} size=%{size_download} url=%{url_effective}\n' \
  'https://playwright.dev/docs/trace-viewer'
```

Observed: `status=200 size=11407 url=https://playwright.dev/docs/trace-viewer` (exit 0).
`sha256sum body1` → `e947d4dc0b73cdb8eae97f10c268c10024e4ff9410077acd7d69e6b0bafc1bee`; `wc -c body1` → `60566`.
`size_download` is the compressed transfer; the `--compressed`-decoded body written to `body1` is 60566 bytes, exactly `receipt.bytes`.

Fetch 2 (97 s later, headers captured):

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -D headers2 -o body2 -w 'status=%{http_code} size=%{size_download}\n' \
  'https://playwright.dev/docs/trace-viewer'
```

Observed: `status=200 size=11407`; `sha256sum body2` → the same `e947d4dc…1bee`; 60566 bytes.
Response headers included: `content-type: text/html; charset=utf-8`, `last-modified: Tue, 20 Oct 2026 16:46:38 GMT`,
`etag: W/"6ad79aee-ec96"`, `cache-control: max-age=600`, `age: 88`, `date: Tue, 20 Oct 2026 20:03:40 GMT`,
`x-cache: HIT`, `x-cache-hits: 0`, `content-length: 11407`.

Independent decode: a local Python implementation of the receipt's declared `html-text` semantics
(`<script>`/`<style>` removal, tag → space, named/numeric entity decoding, then NFC + curly-quote/dash folding + whitespace collapse; `recheck-fetch.mjs:24-36,48`). It is not the producer and wrote no receipt.

Observed on `body1`:
- decoded text 10,347 chars; normalized text 9,106 chars.
- `quote_offset 2845`, `quote_words 15` — exactly `S014.json:17 quoteOffset` and `:14 quoteWords`.
- Quote appears inside visible article markup: raw byte offset **33448** (decoded-character offset 33434), inside
  `<h3 id=tracing-on-ci>Tracing on CI…</h3>` followed by `<p>Traces should be run … failed test by setting the <code>trace: 'on-first-retry'</code> option … This will produce a <code>trace.zip</code> file for each test that was retried.</p>`. Not in a `<script>`, hidden panel, or head metadata.
- `normalize(quote)` occurs in `normalize(excerpt file)` at normalized offset 600 (the excerpt begins at the producer's 600-char left context).
- Recomputing the producer's excerpt rule (`normalized.slice(at-600, at+len(q)+600) + "\n"`) yields byte length 1289 and sha256 `5ca87465a4c202ff770f289f9c901a5e03e6b781fe0d2b3d9346b5458d9e063d` — exactly `S014.json:19 excerptSha256` and the committed excerpt bytes.
- Page identity: `<title>Trace viewer | Playwright</title>` (title text at raw byte 267), `<h1>Trace viewer</h1>` (raw byte 26492; `id=tracing-on-ci` at 33271), `<meta name=docsearch:version content=stable>` (raw byte 1135), `docsearch:docusaurus_tag=docs-default-stable`; no `outdated`, `archived`, `This is documentation for`, or `noindex` marker. No body date/version marker (only `Copyright © 2026 Microsoft` in the footer), which matches `anchorObserved`'s “no date marker”.
- Same page later contains the second half of the teaches claim: “Go back and forward in time and click an action to inspect and debug” (normalized ~4540); “Playwright captures a set of complete DOM snapshots for each action” (normalized 5398–5474); “See console logs from the browser as well as from your test” (6710); network requests “filtered to only show the network requests that were made during the actions selected” (7294–7308).

## 3. Receipt comparison against the C1 contract

| Contract item (`PLAN.md:67-80`) | Observed | Result |
|---|---|---|
| JSON parses, schema `tabi-source-recheck-v1` | `S014.json:2` | pass |
| `row` present at REV, not superseded | `SOURCES.md:28`; superseded set excludes S014 | pass |
| `rowUrl` verbatim in row's source cell | `S014.json:4` = URL in `SOURCES.md:28` | pass |
| `sha256` 64-hex | `e947d4dc0b73cdb8eae97f10c268c10024e4ff9410077acd7d69e6b0bafc1bee` | pass |
| `quoteWords` ≤25 and equals quote word count | 15 = 15 | pass |
| `normalize(quote)` in `normalize(excerpt)` | found at 600 | pass |
| `excerptSha256` = sha256(excerpt bytes) | `5ca87465…063d` matches file and recomputation | pass |
| `quoteFound` true | independently found twice on live source | pass |
| `fetchedAt` on 2026-10-20 | `2026-10-20T19:05:39.650Z`; file mtime `16:05:39.649663459 −0300` = `19:05:39.649663Z` (~0.34 ms earlier; across the 51 receipts mtime−fetchedAt ∈ [−1.169 ms, +2.022 ms]) | pass |
| `teachesVerdict` = `held` (or drift + superseder) | `held`; see §4 | pass (page-scope; see §4) |
| `httpStatus` 200 | 200 on both independent fetches | pass |
| `producerSha256` = sha256 of producer at REV | `f2ba0033…a360` = REV blob `7d9c314e…` | pass |
| One receipt per row | one `S014.json` | pass |

Counter run at the measured revision (reads committed git objects; no network, no lane write):

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
exit 0
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

S014 is not in `rejected` (empty). `held 50 + own_work 1 = 51`. `eligible_rows:58` is the REV-row count (64 rows − 6 superseded), not the fixed B target 51; the denominator/reporting mismatch is covered by sibling `w2/ReRunC1.md` and is not re-adjudicated here.

## 4. Does the quote actually support the teaches cell?

Row teaches (`SOURCES.md:28`, cells[6]): “Record the trace on the first retry so the failing path is inspectable with DOM, console and network records”.

- The quoted 15 words directly support the **first clause**: on CI, trace on the first retry of a failed test. The immediately following sentence on the same page (raw byte 33622; normalized 2951) adds the mechanism and artifact: `trace: 'on-first-retry'` in the config, producing `trace.zip` “for each test that was retried.”
- The quote alone does **not** mention DOM, console, or network. Those are grounded by other passages of the same served page (§Snapshots, §Console, §Network; offsets above), and the receipt's `note` (`S014.json:22`) says exactly that. So `teachesVerdict: held` is defensible at **page scope**, while a quote-only reading is narrower than the teaches cell.
- No contradiction or drift: the page's visible article text still teaches the retry-timing and the viewer's snapshot/console/network inspection. Confidence: high (direct text, twice-fetched byte-identical body).

## 5. Source identity / anchor / teaches status

- **Identity: held.** Same URL, HTTP 200, `title`/`h1` “Trace viewer | Playwright”, `docsearch:version=stable`; the body's sha256 is identical to the value recorded for the 2026-10-19 seat fetch at `kaika-fleet-round-1.md:57` and to the receipt. This is stronger than the “dynamic page” minimum: no identity concession was needed.
- **Anchor: held.** `§Recording a trace` and `§Tracing on CI` exist in the served page; the cited sentence sits in the `Tracing on CI` paragraph. The body carries no date/version marker, matching `anchorObserved`. The HTTP response carried `last-modified: 2026-10-20T16:46:38Z` (today, before both fetches) with a byte-identical body; [INFERENCE] the object was refreshed/redeployed today without a content change for this page — only the header and the identical bytes are observed.
- **Teaches: held (page-scope).** See §4.
- **Unreachable: no.**

## 6. Availability versus live product freshness

- S014 is a **living-live** source (versionless Playwright `stable` docs), not an immutable pinned artifact; the receipt's body came from a live 200 fetch, not an archive copy. The 2026-10-20 body's sha256 matches the value recorded for the 2026-10-19 seat fetch at `kaika-fleet-round-1.md:57`.
- What the receipt establishes: the cited sentence was present at the cited location in bytes served on 2026-10-20, and the page still shows the trace-viewer capabilities the teaches cell names.
- What it does **not** establish: that the current Playwright release still implements `trace: 'on-first-retry'`, or that these docs correspond to any specific release. The page is versionless and the row cites no version.
- Does the main claim conflate the two? **No, for S014.** `PLAN.md:15-16` claims “source rows re-verified against their live source with a committed recheck receipt”; the measured field is `c1_rows_rechecked`; the counter emits `freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate"` (`measure-c1.mjs:471`); the committed note says it “does not make any knowledge entry true” (`knowledge/source-recheck-round-18.md:7`); the lesson gate says C1 counts receipts, “not overdue rows or current product support” (`lessons/round-18.md:12-13`); S014's own `recheck` cell is `on-release`, and the note states no row's `recheck` cell was past due on 2026-10-20 (`knowledge/source-recheck-round-18.md:7`).
- Finite counterexample showing the boundary (not a defect): if Playwright removed the option tomorrow while leaving the docs sentence unchanged, this receipt would still report `held`, because “held” means source-text presence at fetch time. The committed claim text does not assert more than that.

## 7. Non-falsifying observations (outside the counted contract)

- **O-1 (low; producer/counter-wide, not a C1 counter failure):** the recorded `command` string (`S014.json:7`) is not shell-executable. Ran the string verbatim (only `<tmp>` substituted) via `bash /tmp/tabi-r18-lives014/receipt-cmd.sh` → exit 2, stderr `syntax error near unexpected token '('`. Cause: `recheck-fetch.mjs:98` and `measure-c1.mjs:233-236` render argv with `join(' ')` without quoting, so the space-containing UA `Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18` is split and its parenthesis is a shell token. The producer's actual fetch used an argv array and is authentic (my argv fetch reproduces the bytes exactly), and no C1 acceptance rule examines `command`; if the field is intended as a reproduction recipe, quote each argv token or record the array.
- **O-2:** the quote is a verbatim clause, not a complete sentence; it stops before `by setting the trace: 'on-first-retry' option…`. The omitted tail is present at raw byte 33622 and is what makes the row's mechanism concrete. Not a falsification, but a quote-only reader cannot reconstruct the setting from the receipt's 15 words.
- **O-3:** the docs page is CDN-served (`cache-control: max-age=600`, second fetch `age: 88`, `x-cache: HIT`), and the receipt records no `Age`/`ETag`/`Last-Modified`. A 600-s edge window means “served bytes at fetchedAt” can lag origin by up to the TTL. For this content the window is closed: `Last-Modified 16:46:38Z` precedes the receipt fetch (19:05:39Z), and a fetch 97 minutes later (past the TTL) still returned the identical sha256.

## 8. Scope, not run, finite limits

- Did not invoke `.ufo/waves/round-18/recheck-fetch.mjs` in any mode; the producer was only read and hashed. The decode/excerpt verification was an independent reimplementation of the documented `html-text`/normalize steps.
- Did not run `measure-c1.mjs --live` (that would fetch all 51 rows); the live check here is the two targeted S014 fetches above. The committed-input counter run is `live:null`.
- S029 (own-work, pinned git object) was not probed: this seat's target is S014, an HTTP row; the S029 path is untouched.
- No browser was used; public-source access was GET-only. No credential/session content was read or sent.
- No private clone was needed: no Git-writing probe was run. All probe writes were under `/tmp/tabi-r18-lives014`. Lane access was read-only (`git rev-parse`, `git show`, `git ls-tree`) plus the read-only counter; no lane production, fleet, sibling, Git-index, or jj file was written.
- Residual unknowns: (a) whether Playwright's current release still implements the documented behavior (not claimed by the row; not tested); (b) CDN origin state precisely at `fetchedAt`, bounded by the cache note in O-3; (c) nothing else — quote presence, offset, excerpt derivation, producer binding, row binding, and teaches grounding were all independently reproduced.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS014.md`
- `/tmp/tabi-r18-lives014/` (ephemeral probe outputs: `body1`, `body2`, `headers2`, `decode.py`, `receipt-cmd.sh`, `c1.json`)
