VERDICT: ISSUES

# S025 — C1 source-recheck receipt (round 18, wave 2)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Baseline B: `2bff864fdfee684ddbcd066cc8e735adaba2735c`
Measured REV: `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
Date: 2026-10-20
Receipt: `corpus/evidence/round-18/source-recheck/S025.json`
(sha256 `f35172ac7cb153d87a68dfb07dd85c7ac56dfdc754f325dcb8833ae7579f8f41`)
Excerpt: `corpus/evidence/round-18/source-recheck/S025.excerpt.txt`
(sha256 `3452be596734d483bcc4e74f033012b522101a5ac8aa9178fe9a7dfc792cf87a`)
Row: `corpus/SOURCES.md:39` (byte-identical at B and REV; `git diff` of the row: no output)
Quote source: `corpus/lessons/kaika-fleet-round-1.md:68` (exact quote, exact digest)

## Result

The receipt is **structurally valid** and the live source **is byte-identical to the receipt**:
HTTP 200, 39,382-byte decoded body, sha256
`17521385704dfa9ab49fa599b78258c579aa05676aa88c6ca629c94682c3d30f`; the 14-word quote is present
once in the raw HTML at normalized offset **542**; the excerpt is exactly the producer's normalized
window; URL, quote source, excerpt digest, producer digest and canonical curl command all match.
`measure-c1` accepts S025; at REV it reports `c1_rows_rechecked` **51** (0 at B). No drift, no
unreachable.

The finding is semantic, not structural. The receipt's note says the row's `teaches` cell is
"supported", but:
- the quote itself only supports the generic scope sentence ("apply accessibility semantics to common
  design patterns and widgets");
- the page's adjacent text supports **roles/states/properties** and **keyboard support** (both inside
  the committed excerpt) and **accessible names** (outside the excerpt, at offsets 1290/1358);
- the ordering clause **"before asserting it by role"** appears nowhere on the page (0 occurrences of
  "before" and "assert" in the full normalized body).

The note's own §6 says quote presence does not show the quote supports the `teaches` claim. The C1
count is unaffected; the receipt's `held` label and note overstate teach support. This is the ISSUES
finding. The main claim does **not** conflate product freshness: it is explicitly scoped to source
rechecking, not current product support (see §5).

## 1. Live re-fetch

Command run from a private `/tmp` directory (removed after measurement):

```sh
D=$(mktemp -d /tmp/tabi-r18-s025-XXXXXX)
curl -sSL --compressed --max-time 90 \
  -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  -D headers.txt -o body.html \
  -w 'http=%{http_code} effective=%{url_effective} bytes=%{size_download} time=%{time_total}\n' \
  'https://www.w3.org/WAI/ARIA/apg/'
```

Observed, exit 0:

```text
http=200 effective=https://www.w3.org/WAI/ARIA/apg/ bytes=12502 time=0.030524
sha256 17521385704dfa9ab49fa599b78258c579aa05676aa88c6ca629c94682c3d30f  body.html
39382 body.html
```

`%{size_download}` is 12,502 compressed wire bytes; `--compressed` writes the 39,382-byte decoded
body. The receipt's `bytes` is the producer's `readFileSync(out).length`, so 39,382 is the correct
comparison; no mismatch.

Headers observed:

```text
HTTP/2 200
date: Tue, 20 Oct 2026 20:02:50 GMT
content-type: text/html; charset=utf-8
x-origin-cache: HIT
last-modified: Wed, 14 Oct 2026 17:09:16 GMT
cf-cache-status: HIT
cache-control: max-age=600, s-maxage=2592001
age: 24229
content-encoding: br
server: cloudflare
```

Identity markers: `<title> ARIA Authoring Practices Guide | APG | WAI | W3C</title>`; canonical
`<link rel="canonical" href="https://www.w3.org/WAI/ARIA/apg/" />`; effective URL identical to
`receipt.url`. Quote occurs **once** in the raw HTML.

Quote location via the producer's own normalizer (probe writes nothing):

```sh
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text \
  --body "$D/body.html" \
  --quote "This guide describes how to apply accessibility semantics to common design patterns and widgets."
```

Observed, exit 0:

```json
{"found":true,"offset":542,"normalizedLength":3632,"window":"Guide ARIA Authoring Practices Guide (APG) Home Learn to use the accessibility semantics defined by the Accessible Rich Internet Application (ARIA) specification to create accessible web experiences. This guide describes how to apply accessibility semantics to common design patterns and widgets. It provides design patterns and functional examples complemented by in-depth guidance for fundamental practices. View Patterns APG Resources ..."}
```

Quote length 96 chars; normalized page length 3,632 chars. `quoteOffset` 542 matches the receipt
exactly.

Excerpt derivation, using the same `normalize`/`decodeBody` imported from
`.ufo/waves/round-18/recheck-fetch.mjs`:

```text
offset 542 qlen 96 excerptLen 1238 fileLen 1239
excerpt+newline equals file: true
firstDiff -1
```

The producer slices `text.slice(Math.max(0, at - 600), at + q.length + 600)` and writes
`${excerpt}\n`. At offset 542 the start clamps to 0, so the committed excerpt is the first 1,238
normalized characters. The live body reproduces it exactly.

## 2. Receipt fields vs observed

| Field | Receipt | Observed 2026-10-20 | Verdict |
|---|---|---|---|
| `schema` | `tabi-source-recheck-v1` | same | match |
| `row` | `S025` | present at REV; not in the six-row superseded set | match |
| `rowUrl` | `https://www.w3.org/WAI/ARIA/apg/` | occurs verbatim in `corpus/SOURCES.md:39` source cell | match |
| `url` | same URL | effective URL same; canonical same | match |
| `fetchedAt` | `2026-10-20T19:05:37.593Z` | date 2026-10-20; my fetch 20:02:50 GMT same date | match |
| `command` | canonical curl with `<tmp>/body` and `%{http_code}` | matches `measure-c1.mjs:233` `expectedCurlCommand` | match |
| `httpStatus` | 200 | 200 | match |
| `bytes` | 39382 | 39382 decoded | match |
| `sha256` | `1752138…c3d30f` | `1752138…c3d30f` (full digest above) | match |
| `decode` | `html-text` | quote found after same decode; raw HTML plain-text occurrence 1 | match |
| `quote` | 14 words | exact quote; word count 14 | match |
| `quoteSource` | `corpus/lessons/kaika-fleet-round-1.md:68` | line 68: exact quote, digest `1752138…c3d30f` | match |
| `quoteFound` | true | true | match |
| `quoteOffset` | 542 | 542 | match |
| `excerpt` | `S025.excerpt.txt` | file exists; byte-identical to live-derived excerpt + newline | match |
| `excerptSha256` | `3452be…c792cf87a` | `3452be…c792cf87a`; committed blob equals worktree | match |
| `anchorObserved` | no revision/date marker in body; bytes identical to 2026-10-19 seat fetch | full body has 0 `revision`, 0 `date`; no meta revision/updated/date; title/canonical same; digest equals kaika `:68` and round-12 note `:15` | truthful; see F2 for cache limit |
| `teachesVerdict` | `held` | page supports roles/states/properties (offset 924), keyboard (978), names (1290/1358); quote alone generic; ordering absent | **partial**; see F1 |
| `note` | "teaches cell (roles/names/keyboard patterns before role assertions) supported" | quote/excerpt do not contain the ordering; names is outside the excerpt; full body has 0 "before"/"assert" | **overstates**; F1 |
| `seat` | `Recheck12` | author-side (note `:2` says not independent) | not independently verified; my fetch is the non-author check |
| `producerSha256` | `f2ba…eaa360` | `f2ba…eaa360` at REV and worktree | match |

Committed bytes vs worktree: `S025.json` and `S025.excerpt.txt` are identical at REV and in the lane
(`git show REV:<path> | sha256sum` equals `sha256sum <path>`), so the receipt under test is the
committed artifact.

## 3. Source identity, anchor, teach

**Source identity: HELD.** Effective URL, canonical URL, title and body digest are the same as the
receipt. The body digest also equals the 2026-10-19 kaika seat fetch recorded at
`corpus/lessons/kaika-fleet-round-1.md:68` and the round-12 fetch recorded at
`corpus/knowledge/playwright-accessible-locators-and-snapshots.md:15` (39,382 B, same digest). The page
is byte-stable across 2026-10-19, 2026-10-20 04:04, 2026-10-20 19:05 and 2026-10-20 20:02.

**Anchor: HELD as served-body identity; no in-body version anchor exists.** The page has no
revision/date marker in its body (0 `revision`, 0 `date` in the normalized text; no matching meta
tag). The server sends `last-modified: Wed, 14 Oct 2026 17:09:16 GMT`; the row anchor cell says "APG
home, no revision marker, read 2026-10-19", which matches. There is no version drift to mark. The
producer's `anchorObserved` says "no revision or date marker in body", which is accurate.

**Teaches: PARTIAL.** Details in §4. The page still contains the material the row cites for its
mapping, but not in the quoted 14 words, and not including the ordering clause.

**Cache caveat (F2).** The response is cache-served: `cf-cache-status: HIT`, `x-origin-cache: HIT`,
`age: 24229` seconds (6h43m). A cache HIT plus a byte-identical digest proves served-body identity,
not origin-current content. `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:17`
already says: "`Last-Modified` is the server's header, not a claim that no later build exists behind a
cache." The round-18 note says "a digest pins one response's bytes" (`source-recheck-round-18.md:143`)
and "source-only" (`:141`). The receipt's `anchorObserved` should say "served bytes" rather than
implying origin freshness.

## 4. Does the quote actually support `teaches`?

Row `teaches` (`corpus/SOURCES.md:39`): "Which roles, names and keyboard patterns a widget should
expose before asserting it by role".

Normalized live-page offsets (length 3,632):

| Text | Offset | Inside committed excerpt (end 1,238)? |
|---|---|---|
| Quote: "This guide describes how to apply accessibility semantics to common design patterns and widgets." | 542–638 | yes |
| "Design Patterns and Examples" | 834 | yes |
| "ARIA roles, states and properties" | 924 | yes |
| "keyboard support" | 978 | yes |
| "Providing Accessible Names and Descriptions" | 1,290 | **no** |
| "Providing elements with accessible names…" | 1,358 | **no** |
| "accessibility semantics, developing keyboard interfaces" | 1,624 | no |
| "before" | absent | — |
| "assert" | absent | — |

Assessment:
- **Quote alone:** supports only "the guide applies accessibility semantics to common design patterns
  and widgets". It does not mention roles, names, keyboard, or role assertion.
- **Page context (inside excerpt):** the "Design Patterns and Examples" paragraph explicitly says
  "ARIA roles, states and properties and by implementing keyboard support". This supports the
  roles/keyboard categories.
- **Page context (outside excerpt):** "Providing Accessible Names and Descriptions" and "Providing
  elements with accessible names" support the names category. The committed excerpt stops at 1,238,
  so the excerpt alone does not show names.
- **Ordering clause:** "before asserting it by role" has no counterpart in the page. The knowledge note
  `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:47` treats it as the lane's
  selection rule ("APG … establishes the authoring scope … before a role locator is meaningful") and
  explicitly bounds it: "The APG home does not, by itself, state any specific widget's keyboard
  requirement … APG is not a test oracle." Line 83 repeats that the pages do not establish keyboard
  operability.

Therefore the receipt's note phrase "teaches cell (roles/names/keyboard patterns before role
assertions) supported" is broader than the bytes:
- roles/keyboard: page-supported (and in the excerpt);
- names: page-supported but outside the committed excerpt;
- "before asserting it by role": not source text at all; it is the lane's inference.

The note's own `source-recheck-round-18.md:140` says: "It does not show that the row's `teaches` claim
is correct, that the quote supports it". The receipt's note asserts the opposite. That is the
contradiction to repair.

## 5. Main claim: availability vs live product freshness

The main C1 claim is scoped:
- `PLAN.md:15-16`: "Source rows re-verified against their live source with a committed recheck
  receipt".
- `corpus/lessons/round-18.md:12-13`: "C1 counts round-specific integrity-checked recheck receipts,
  not overdue rows or current product support."
- `corpus/knowledge/source-recheck-round-18.md:141`: "The receipts say what the cited documents and
  source files contain. They say nothing about how any product behaves, and the 51 rows are not a
  statement of current live product support."

So the main claim is a **recheck-process** claim, not a product-freshness claim. It does not confuse
immutable availability with live product freshness at the claim level. The residual conflations are:
1. the receipt's `teachesVerdict: held` / note "supported" (F1), which a reader can read as teach
   truth; the counter does not check it; and
2. the receipt's `anchorObserved` "bytes identical to 2026-10-19 seat fetch" (F2), which is served-byte
   identity, not origin freshness; the page is cache-served.

The scalar name "freshness" is doing process work here (source recheck coverage), not product
currency. The lesson and note say so. No claim-level repair is needed for that distinction; the
receipt wording should not be cited as more.

## 6. Counter behaviour

At REV:

```sh
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

exit 0:

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

At baseline B, control:

```sh
node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
```

exit 0:

```json
{"rev":"2bff864fdfee684ddbcd066cc8e735adaba2735c","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":0,"eligible_rows":51,"held":0,"drift_superseded":0,"own_work":0,"row_classes":{"kind":{"code":10,"community":5,"docs":32,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":42,"queued":8,"rejected":7},"url":{"immutable_pinned":14,"living_live":42,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

The receipt directory has 51 `.json` + 51 `.excerpt.txt` files; `rejected` is empty, so S025 is one
of the 51 accepted. `c1_rows_rechecked` is the C1 number: 0 → 51. `eligible_rows` at REV is 58
because S058–S064 were opened this round (64 total rows minus the 6 superseded); the 51 target is
the baseline set (57 − 6), which is met. `held` 50 + `own_work` 1 = 51; the counter excludes S029
own-work from `held`, while the note's §2 `held` 51 counts the field over all receipts. Neither is a
contradiction; `c1_rows_rechecked` is the count to cite.

Counter limits relevant to this receipt (`measure-c1.mjs:315-376`): it checks the schema, row,
`rowUrl`, `sha256` shape, quote presence in the **excerpt**, quote word count, `fetchedAt` date,
`teachesVerdict` enum, URL↔row mapping, canonical curl command, HTTP 200, producer digest, excerpt
digest and quote-in-excerpt. It does **not** check `quoteSource`, `quoteOffset` for non-S029,
`anchorObserved`, `note`, or the quote against the full fetched body. S025's `quoteOffset` and
`quoteSource` happen to be correct, but the counter would not catch a wrong value; it also cannot
detect that `held` overstates teach support. That is why F1/F2 are wording/limit findings, not count
failures.

## 7. Findings

| ID | Severity | Path:line | Finding | Finite counterexample | Repair |
|---|---|---|---|---|---|
| F1 | medium (evidence wording; count unaffected) | `corpus/evidence/round-18/source-recheck/S025.json:22`; `corpus/evidence/round-18/source-recheck/S025.excerpt.txt:1`; `corpus/knowledge/source-recheck-round-18.md:140` | The note says the `teaches` cell (including "before role assertions") is supported; the quote alone supports only the generic scope, the excerpt supports roles/keyboard but not names (names at 1,290 > excerpt end 1,238), and the full body has 0 "before"/"assert". The note's own §6 says the receipt does not show the quote supports teaches. | Quote at 542; `keyboard support` at 978 (inside excerpt); `accessible names` at 1,358 (outside excerpt); 0 occurrences of `before` and `assert` in the 3,632-char normalized body. | Narrow the receipt note to "page still carries the scope sentence and the roles/states/properties + keyboard categories; 'before asserting it by role' is the lane's inference"; or narrow the SOURCES `teaches` cell. Do not cite `held` as teach truth. |
| F2 | low (freshness boundary; count unaffected) | `corpus/evidence/round-18/source-recheck/S025.json:20`; headers above; `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:17`; `corpus/knowledge/source-recheck-round-18.md:141,143` | `anchorObserved` says "bytes identical to 2026-10-19 seat fetch"; the response is a cache HIT (`cf-cache-status: HIT`, `x-origin-cache: HIT`, `age: 24229`) with `last-modified: 2026-10-14 17:09:16 GMT`. This proves served-body identity, not origin-current content. The main claim is scoped to source recheck, so no product-freshness claim is falsified. | `curl -D headers.txt` output: `cf-cache-status: HIT`, `x-origin-cache: HIT`, `age: 24229`, `last-modified: Wed, 14 Oct 2026 17:09:16 GMT`; body digest equals the prior fetch. | Say "served bytes identical", not "source bytes current"; keep the existing note §6/line 17 caveat. |
| F3 | low (adjacent, not S025) | `corpus/knowledge/source-recheck-round-18.md:11` | The note says `corpus/SOURCES.md` has 57 rows; at REV it has 64 (S001–S064) and the counter reports `eligible_rows` 58. The 51 target is baseline 57 − 6, so S025's acceptance is unaffected. | `grep -c '^| S[0-9]'` at REV = 64; `measure-c1` at B `eligible_rows` 51, at REV 58. | Add "at baseline B" to the sentence; do not change the 51 target. |
| F4 | informational (counter limit) | `.ufo/waves/round-18/measure-c1.mjs:315-376` | The counter does not check `quoteSource`, non-S029 `quoteOffset`, `anchorObserved`, `note`, or quote-in-full-body. S025's values are correct, but the counter cannot detect a semantic `held` overstatement. | `measure-c1.mjs:369` only tests quote-in-excerpt; `:337` only tests the verdict enum; no `anchorObserved`/`note` reference. | No S025 repair; treat `held` as the seat's label, not a verified teach. |

No quote-absence fallback was needed: the quote was found on the first GET, at the receipt's offset,
with the receipt's digest. An alternative rendering/raw endpoint was not required.

## 8. Limits

- One GET of the receipt URL; no cache-bypass (`Cache-Control: no-cache`), no second user agent, no
  HEAD/ETag, no origin probe. The body is a cache-served response.
- No browser, no runtime, no real-site page tool, no credentials, no session content. The page is
  static documentation.
- The `html-text` decoder strips tags; the quote is plain text and appears once in the raw HTML, so
  no tag-join artifact. The quote is ASCII; no normalization-only match ambiguity.
- The 2026-10-19 body is known only by its digest in `kaika-fleet-round-1.md:68`; the old body bytes
  were not retained.
- The page has no in-body revision/date marker; only the server `Last-Modified` header. The digest
  pins one response, not a publishing revision.
- The C1 counter was run without `--live` at B and REV; the live check here is a single non-author
  fetch of S025. A full 51-row `--live` re-fetch was not run.
- S025's `seat` is `Recheck12`; the note says the receipts are author-side, not independent
  (`source-recheck-round-18.md:2`). This report is a non-author check of one row only.
- The `S025` row's own `recheck` cell is 365d; it was not date-due on 2026-10-20. No row was
  date-due under its own cell.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS025.md`

Report: .ufo/waves/round-18/w2/LiveS025.md
