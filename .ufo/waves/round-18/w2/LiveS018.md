VERDICT: ISSUES

# LiveS018 — C1 receipt S018 attack (round 18, wave 2)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`. Target: C1 freshness claim, receipt S018 only. Read-only LANE; probe in private `/tmp/s018-live-3092`; no Git writes; no browser; public-source GET only. No tool installs.

**Bottom line.** Every machine-checked receipt field reproduces exactly on a live fetch, and the quoted text does support the study-scoped teaches. But the receipt's `anchorObserved` is false by one printed page (Table V is on printed p. **100**, not 99), and the quoted span is a cross-cell join whose "verbatim" status holds only under the `-layout` decoder. The C1 counter does not validate `anchorObserved`, so the receipt counts while asserting a wrong page. This is an ISSUE in the C1 evidence as written; the bytes and the teaches are not in dispute.

## 1. Target files and line numbers

- Receipt: `corpus/evidence/round-18/source-recheck/S018.json` — `row` `:3`, `rowUrl`/`url` `:4-5`, `fetchedAt` `:6`, `httpStatus` `:8`, `bytes` `:9`, `sha256` `:10`, `decode` `:11`, `quote` `:13`, `quoteWords` `:14`, `quoteSource` `:15`, `quoteFound` `:16`, `quoteOffset` `:17`, `excerpt` `:18`, `excerptSha256` `:19`, `anchorObserved` `:20`, `teachesVerdict` `:21`, `note` `:22`, `producerSha256` `:24`.
- Excerpt: `corpus/evidence/round-18/source-recheck/S018.excerpt.txt` — 1287 B = 1286 chars + LF; sha256 `5dae0b5e141a77d40814ff352bbc763b7d8780847a5fa291543ae27a99c70d3c` (matches `:19`).
- Registry row at REV: `corpus/SOURCES.md:32` (status `mined`, tier `A`). Row is identical B→REV: `diff <(git show 2bff864…:corpus/SOURCES.md | grep '^| S018 ') <(git show 530f40a…:corpus/SOURCES.md | grep '^| S018 ')` → empty, exit 0.
- Original quote source: `corpus/lessons/kaika-fleet-round-1.md:61` — `"Ensure elements are fully loaded and visible before interaction." — §V.A Table V, printed p. 99`, with the same body sha256 `9304083f…`.
- C1 note: `corpus/knowledge/source-recheck-round-18.md` — `:1` source list, `:11` scope sentence, `:17` decode tally, `:68` S018 §3 row, `:104` `quoteSource new`, `:141` no-product-support limit, `:144` PDF limit.
- Producer / counter: `.ufo/waves/round-18/recheck-fetch.mjs` (blob sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` at REV, verified `git show REV:.ufo/waves/round-18/recheck-fetch.mjs | sha256sum`); `.ufo/waves/round-18/measure-c1.mjs` — `isPinnedUrl` `:247`, URL class `:258`, `freshness_scope` `:471`.

## 2. Live re-fetch (executed)

```sh
mkdir -p /tmp/s018-live-3092 && cd /tmp/s018-live-3092
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'HTTP=%{http_code} SIZE=%{size_download} CT=%{content_type} URL=%{url_effective}\n' \
  'https://mpapad.github.io/publications/pdfs/ICST25.pdf'
```

Observed, exit 0:

```text
HTTP=200 SIZE=447958 CT=application/pdf URL=https://mpapad.github.io/publications/pdfs/ICST25.pdf
9304083f19871e117d5c4de0db4b1fe40767b66778641a188cdbd9dae4ebed3b  body
-rw-r--r-- 447958 body
```

Receipt comparison: `httpStatus` `:8` = 200 ✓; `bytes` `:9` = 447958 ✓; `sha256` `:10` = `9304083f19871e117d5c4de0db4b1fe40767b66778641a188cdbd9dae4ebed3b` ✓. Raw-body equality holds here because the artifact is static; no dynamic-page relaxation is needed.

Second GET (headers only, exit 0):

```text
content-type: application/pdf
last-modified: Thu, 17 Sep 2026 18:54:01 GMT
etag: "6aac3749-6d5d6"
cache-control: max-age=600
age: 67
date: Tue, 20 Oct 2026 20:03:38 GMT
x-served-by: cache-gig2250038-GIG
content-length: 447958
```

`etag` hex `6d5d6` = 447958 decimal, i.e. the same length as the body. The body was served through a CDN cache (`x-served-by`, `age: 67`); the digest pins the cache's copy at 20:03Z.

`pdfinfo body` (identity, observed):

```text
Title:           An Empirical Study of Web Flaky Tests: Understanding and Unveiling DOM Event Interaction Challenges
Subject:         ICST 2025
Author:          Yu Pei, Jeongju Sohn, and Mike Papadakis
Creator:         TeX; Conference Publishing Consulting
Producer:        pdfTeX-1.40.26; ConfPub - icst25main-p61-p rev-f59b80d6ba-101305:101306 p92 on 2025-03-30T08:19:46+00:00
CreationDate:    Wed Feb 26 13:10:39 2025 -03
ModDate:         Sun Mar 30 05:19:46 2025 -03
Pages:           11
File size:       447958 bytes
```

`pdftotext -v` → `pdftotext version 26.08.0` (same witness the note records at `:144`).

Decode / excerpt reproduction, using the producer's own exported functions at REV:

```sh
node --input-type=module -e '
import { decodeBody, normalize } from "file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const t = normalize(decodeBody(readFileSync("body"), "pdf-text"));
const q = normalize("DOM interaction synchronization mechanism Ensure elements are fully loaded and visible");
const at = t.indexOf(q);
const ex = t.slice(Math.max(0, at-600), at+q.length+600);
console.log(JSON.stringify({normLen:t.length,qLen:q.length,at,found:at>=0}));
console.log(JSON.stringify({excerptChars:ex.length,excerptSha256:createHash("sha256").update(Buffer.from(ex+"\n")).digest("hex")}));
'
```

Observed:

```text
{"normLen":66616,"qLen":86,"at":45719,"found":true}
{"excerptChars":1286,"excerptSha256":"5dae0b5e141a77d40814ff352bbc763b7d8780847a5fa291543ae27a99c70d3c"}
```

So `quoteFound` `:16`, `quoteOffset` `:17` (45719) and `excerptSha256` `:19` all reproduce exactly from the live body. The excerpt is a 600/600 normalized window around the quote, not a page slice.

## 3. Identity / anchor / teaches verdict

| Facet | Live observation | Against receipt |
|---|---|---|
| Source identity | PDF Title, Subject `ICST 2025`, Author `Yu Pei, Jeongju Sohn, Mike Papadakis` exact; body text `ICST 2025, Naples, Italy` and `979-8-3315-0814-2/25 © 2025 IEEE` present | held |
| Anchor — Table V | Table V is on printed p. **100** (PDF page 9 of 11, footer `100`), not p. 99 | **NOT held** — receipt `:20` says p. 99; row `corpus/SOURCES.md:32` says pp. 94, 98-99 |
| Anchor — §III.C | `C. Categorization and Analysis` is on printed p. **95** (PDF page 4, footer `95`); §III starts p. 94 | partial — row's `94` fits §III start, not §III.C |
| Anchor — §V.A | `V. THE COMMON STRATEGIES AND TIME COSTS…` and `A. Results` on printed p. **98** (PDF page 7, footer `98`); TABLE IV p. 99; TABLE V p. 100 | `98` holds for §V.A; `99` is the TABLE IV page |
| Decode | `pdftotext -layout` 26.08.0; quote at normalized offset 45719, Table V row 1 | held |
| Teaches | Table V caption `Common fixed strategies for the Dom-events flaky tests`; rows synchronization 62 (50.4%), conditional waits 47 (38.2%), consistent state transitions 14 (11.4%); 62+47+14 = 123; abstract `123 flaky tests in 49 open-source web projects`; §V.A `approaches developers employ to mitigate and resolve flaky tests` | held, with the quote-scope caveat in F2 |
| Freshness kind | byte-identical to the earlier TabiFlakeExec2 fetch; `Last-Modified` 2026-09-17; static 2025 paper | availability/byte identity, not product freshness (F3) |

## 4. Findings

### F1 [ISSUE] `anchorObserved` page is wrong by one printed page

Path: `corpus/evidence/round-18/source-recheck/S018.json:20` (`"Table V on printed p. 99"`), repeated in `S018.json:22` (`"Table V p.99 lists..."`), `corpus/knowledge/source-recheck-round-18.md:68`, and `.ufo/waves/round-18/w1/Recheck09.md:12-14`.

Finite counterexample (page-scoped `pdftotext` on the fetched body):

```sh
pdftotext -layout -f 9 -l 9 body - | sed -n '1p'
# TABLE V: Common fixed strategies for the Dom-events flaky tests
pdftotext -layout -f 9 -l 9 body - | awk 'NF==1 && $1 ~ /^[0-9]+$/ {n=$1} END{print n}'
# 100
pdftotext -layout -f 8 -l 8 body - | sed -n '1p'
# TABLE IV: The top five flaky and non-flaky DOM event interaction combinations with detailed examples are listed below. ...
pdftotext -layout -f 8 -l 8 body - | awk 'NF==1 && $1 ~ /^[0-9]+$/ {n=$1} END{print n}'
# 99
pdftotext -layout -f 4 -l 4 body - | grep -n 'Categorization and Analysis'
# 24:C. Categorization and Analysis ...
```

Page/footer map from the same body (observed):

```text
pdf page 3  footer 94   (no §III.C heading)
pdf page 4  footer 95   (C. Categorization and Analysis)
pdf page 7  footer 98   (V. THE COMMON STRATEGIES…, A. Results)
pdf page 8  footer 99   (TABLE IV)
pdf page 9  footer 100  (TABLE V)
```

The `99` that appears immediately before `TABLE V` in the normalized excerpt is the footer of the preceding page (printed 99, which carries TABLE IV); the TABLE V page's own footer is `100`. This is exactly the column/page-order artifact the note warns about at `:144`. The seat's own parenthetical at `Recheck09.md:13` — “extracted p. 1 bears printed 92” — arithmetically implies extracted page 9 (1-based) bears printed 100.

Impact: `anchorObserved` is free text and `measure-c1.mjs evaluateReceipt` does not read or validate it; the counter accepts the receipt (`rejected: []`). The receipt therefore counts while asserting a false page. The row anchor cell at `corpus/SOURCES.md:32` (`printed pp. 94, 98-99`) is also off for Table V (p. 100) and, if `94` is intended for §III.C, for that heading (p. 95). The row is unchanged B→REV, so this is a pre-existing registry error the recheck repeated rather than a new source drift.

Repair (main, not this seat): re-issue the receipt with `anchorObserved` p. 100 and correct `S018.json:22` / note `:68`; annotate `w1/Recheck09.md:12-14`; correct the registry anchor through the SOURCES rule path (the anchor cell is not in the in-place allowlist — log old→new or open a superseding row) so a later reader does not repeat p. 99.

### F2 [ISSUE, evidence strength] the quote is a cross-cell join; the original quote is present under another renderer

Path: `S018.json:13` and `S018.json:22`; `.ufo/waves/round-18/w1/Recheck09.md:16`.

The receipt's 11-word quote is the Table V category cell concatenated with the first line of the description cell. In the receipt's own `-layout` decode (whole-file `grep -n` on the generated `out.txt`):

```text
559:  TABLE V: Common fixed strategies for the Dom-events flaky tests
563:  DOM interaction synchronization mechanism   Ensure elements are fully loaded and visible   await driver.waitForSelector(’.   62 (50.4%)
564:                                              before interaction.                              qr-code__address’);11 wait to ensure
```

The full description, `Ensure elements are fully loaded and visible before interaction.` (the original Gate quote at `corpus/lessons/kaika-fleet-round-1.md:61`), is **absent** from the `-layout` normalized text (`indexOf` → -1) because the Examples column interleaves line 564. But it is **present** under two other poppler renderings of the same body:

```text
out.txt          (pdftotext -layout)  chosen=45719  original=-1
out-default.txt  (pdftotext)          chosen=45669  original=45711
out-raw.txt      (pdftotext -raw)     chosen=45695  original=45737
```

The chosen quote itself is present in all three renderings, so `quoteFound` is not in doubt. The defect is in the justification: “cannot normalize-match” (`Recheck09.md:16`) is true only for the fixed `-layout` decoder, not for the paper. The paper's text layer carries the original sentence contiguously; the chosen span is a category+description concatenation, not a sentence, and it omits `before interaction`.

Consequence for the teaches: the quote alone names the first category and its description prefix. It does not carry the “consistent state transitions” half (that is the adjacent Table V row, 14 / 11.4%, in the excerpt) and it does not carry the 123 bound (that is the abstract, `123 flaky tests in 49 open-source web projects`, normalized offset 934 in default text / 1418 in layout text, outside the committed excerpt). The strongest supporting sentence is the §V.A prose on printed p. 98: “This strategy involves adding synchronization logic to ensure that DOM elements are fully loaded and ready for interaction before proceeding with certain actions.” That prose is in the fetched body but is not quoted. The `teachesVerdict: held` is still substantively correct; the receipt's single quote is weaker evidence than the seat's note implies.

Repair (main): if the receipt is re-issued, use the default-rendering original sentence or the §V.A prose and record the decode; keep the `-layout` join as secondary evidence. Do not replace the committed excerpt without recording the renderer change.

### F3 [BOUNDARY] immutable availability vs live product freshness

The live re-fetch is byte-identical to the earlier TabiFlakeExec2 fetch recorded at `corpus/lessons/kaika-fleet-round-1.md:61` (same `9304083f…`), and the response's `Last-Modified` is `2026-09-17T18:54:01Z` with a stable ETag. The receipt therefore proves availability and unchanged bytes of a 2025 conference paper on 2026-10-20; it does not observe a live product, a current release, or a change in any claim.

The committed text does **not** conflate the two: note `:141` says the receipts “say nothing about how any product behaves, and the 51 rows are not a statement of current live product support”, and the counter's `freshness_scope` (`measure-c1.mjs:471`) is “round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate”. The main claim is source-receipt coverage, not product currency, so no overclaim is committed here.

Two limits remain worth recording. First, `c1_rows_rechecked` is class-blind: S018 counts the same as a rolling docs page. Second, the URL class is pattern-only — `isPinnedUrl` (`measure-c1.mjs:247-258`) sees no version/date/commit in `.../ICST25.pdf`, so S018 is reported as `living_live` even though the content is a fixed 2025 paper (counter JSON `row_classes.url` includes `living_live: 46`). 1/51 of the credited rows is availability-only evidence. If the freshness scalar is later credited from the 51 receipts, the evidence is recheck coverage, not product freshness; the note's own §6 limit should travel with the number.

### F4 [C1-wide, not S018] the note's scope sentence is stale at REV

Path: `corpus/knowledge/source-recheck-round-18.md:11` — “`corpus/SOURCES.md` has 57 rows (S001–S057)”. At REV the registry has **64** rows: `git show 530f40a…:corpus/SOURCES.md | grep -c '^| S0'` → `64` (S058–S064 were opened this round; lesson `§Sources opened this round`). The counter at REV reports `eligible_rows: 58`, `c1_rows_rechecked: 51`: the seven new rows have no receipts. The note's “the other 51 rows each have exactly one receipt” is baseline-relative but unmarked, and the same note's §3 says new rows were opened. The PLAN target is explicitly baseline-relative (“51 = every row not superseded at B”), so this is a scope-wording defect in the note, not a falsification of the claim. Route to the note owner; it is outside the S018 receipt.

## 5. Receipt contract checks (machine-validated fields)

| Contract item | Observed | Result |
|---|---|---|
| schema `tabi-source-recheck-v1` | `:1` | pass |
| row S018 in SOURCES at REV, not superseded | `corpus/SOURCES.md:32`; not in `{S004,S039,S047,S049,S050,S053}` | pass |
| `rowUrl` verbatim in row source cell | `:4` occurs in `:32` | pass |
| `sha256` 64-hex | `:10` 64 hex | pass |
| `quoteWords` = word count, ≤25 | `:14` 11; JS `split(/\s+/)` = 11 | pass |
| `quoteFound` true | `:16`; live `indexOf` = 45719 | pass |
| `fetchedAt` on 2026-10-20 | `:6` `2026-10-20T19:05:49.680Z` | pass |
| `teachesVerdict` held | `:21`; supported (table + abstract + §V.A) | pass |
| `httpStatus` 200 | `:8`; live 200 | pass |
| `producerSha256` = blob at REV | `:24` `f2ba…`; `git show REV:…recheck-fetch.mjs \| sha256sum` = `f2ba…` | pass |
| `excerptSha256` = excerpt bytes | `:19` `5dae…`; `sha256sum S018.excerpt.txt` = `5dae…` | pass |
| `quoteOffset` reproduces | `:17` 45719; live normalized index 45719 | pass |
| excerpt regenerated from live body | 1286 chars + LF; sha `5dae…` = `:19` | pass |
| `anchorObserved` accurate | `:20` says p. 99; live page 9 footer = 100 | **fail (F1)** |

Counter, executed read-only at REV:

```sh
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
# exit 0
```

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004",
 "freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate",
 "c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,
 "row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},
 "status":{"mined":48,"queued":8,"rejected":8},
 "url":{"immutable_pinned":17,"living_live":46,"own_work":1}},
 "rejected":[],"live":null,
 "counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

`rejected: []` means S018 passes the counter's rules; the counter simply has no anchor check. That is the gap F1 exploits.

## 6. Limits

- CDN cache: the digest pins the cache's copy at 2026-10-20T20:03Z, not an origin-side guarantee. `Last-Modified` (2026-09-17) precedes the fetch, the earlier fetch digest matches, and the ETag is stable, so the served copy is unchanged across the two observations. No claim is made about a hypothetical origin update behind the cache.
- `pdftotext` version 26.08.0 on this host; the receipt does not record the tool version (note `:144` acknowledges this). Page numbers were read from the page footers of the fetched body, not inferred from the excerpt.
- Source-only: no browser, no runtime, no real-site page tool, no credentials or session content. The S029 own-work path was not touched (no network for it).
- No production write: the recheck producer was not run into LANE; no Git index/jj state touched; the `/tmp` sandbox is removed after this report (the commands above reproduce it).
- The `-layout` quote offset is decoder-specific; the default/raw offsets in F2 are reported for transparency, not as replacement evidence.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS018.md`
