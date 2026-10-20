VERDICT: PASS

# S013 live recheck — C1 receipt attack

Assigned item: falsify `corpus/evidence/round-18/source-recheck/S013.json` against the live source
and the C1 receipt contract at REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`. The receipt is valid.
The quote is present at the recorded location, the excerpt is reproducible from today's bytes, the
quote supports the row's `teaches` (with adjacent page text), source identity and both anchor
sections held, and the committed counter counts the receipt. No falsification. Non-gating
observations are in §9; none changes `c1_rows_rechecked = 51`.

## 1. Inputs and committed bindings

Lane tip: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`
(exit 0) → `530f40a9bc3f10436161a2af1ca0fe9bffffc004`. `git status --porcelain` → only
`?? .ufo/waves/round-18/w2/` (the report directory). No production file was modified.

| Input | Binding observed |
|---|---|
| `corpus/evidence/round-18/source-recheck/S013.json` | committed at REV; `git show REV:...` and worktree both sha256 `6e7e04345ce9b0d4e9a7305e427272bfb5bfd090b47ea01e780fb252ce81545e`; `git diff REV -- ...S013.json` empty |
| `.../S013.excerpt.txt` | 1288 bytes; sha256 `93ce10e05e386c0eb4e614710211841ba4885bd427a64bf1808a761e2773a214`; equals `excerptSha256` at `S013.json:19`; `git diff REV -- ...S013.excerpt.txt` empty |
| S013 row in `corpus/SOURCES.md` at REV | line 27; source cell contains `https://playwright.dev/docs/test-retries` verbatim; `git diff B REV -- corpus/SOURCES.md \| grep -c S013` → `0` (row unchanged B→REV) |
| Original quote source `corpus/lessons/kaika-fleet-round-1.md:56` | row S013 in the seat-quote table; quote `""flaky" - tests that failed on the first run, but passed when retried"`; digest `cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa`; `git diff B REV -- corpus/lessons/kaika-fleet-round-1.md` → 0 bytes |
| Producer `.ufo/waves/round-18/recheck-fetch.mjs` | `git show REV:.ufo/waves/round-18/recheck-fetch.mjs \| sha256sum` → `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`; worktree identical; equals `producerSha256` at `S013.json:24` |
| Supersession | S013 is not in the six-row superseded set (`S004,S039,S047,S049,S050,S053`); it is present once in the 64-row REV registry |

## 2. Independent live fetch (assignment command shape)

Exact command and observed output:

```text
$ curl -sSL --compressed --max-time 90 \
    -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
    -o /tmp/tabi-s013-znfcQE/body -w '%{http_code}' \
    'https://playwright.dev/docs/test-retries'
200
$ wc -c < /tmp/tabi-s013-znfcQE/body
99073
$ sha256sum /tmp/tabi-s013-znfcQE/body
cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa
```

`curl -w 'final=%{url_effective} code=%{http_code} redirects=%{num_redirects} size=%{size_download}'`
→ `final=https://playwright.dev/docs/test-retries code=200 redirects=0 size=10801` (the 10801 is the
compressed transfer; the decoded body written by `-o` is 99073 bytes). Source identity: same URL,
HTTP 200, no redirect — held.

Response headers (GET, `-D /tmp/tabi-s013-znfcQE/hdr`):

```text
HTTP/2 200
server: GitHub.com
content-type: text/html; charset=utf-8
last-modified: Tue, 20 Oct 2026 16:46:38 GMT
etag: W/"6ad79aee-18301"
cache-control: max-age=600
content-encoding: gzip
x-proxy-cache: HIT
x-cache: HIT
age: 237
content-length: 10801
```

The ETag suffix `18301` is hex 99073, matching the decoded body size. The `last-modified` deploy
timestamp (16:46:38Z) precedes the receipt's `fetchedAt` (19:06:20Z) and my fetch (~20:06Z), yet the
body is byte-identical to the 2026-10-19 seat fetch recorded at `kaika-fleet-round-1.md:56`. The
`x-cache: HIT` / `age: 237` means the response came from a CDN edge object — a finite limit on
origin-level claims, recorded in §7.1/§9, not a falsification of the receipt's quote check.

Decode per receipt `decode: html-text`, with the receipt's normalizer (NFC, curly quotes/dashes
folded, whitespace collapsed):

- normalized text length `7513`;
- quote `"flaky" - tests that failed on the first run, but passed when retried` at offset `3529`
  — exactly `quoteOffset` at `S013.json:17`;
- the quote is literal in the raw HTML, not a tag-joining artifact:
  `<li class="">"flaky" - tests that failed on the first run, but passed when retried;</li>`.

Excerpt reproduction from my own body using the producer's slice rule (`at-600` to
`at+len+600`, plus newline): 1288 bytes, sha256
`93ce10e05e386c0eb4e614710211841ba4885bd427a64bf1808a761e2773a214`, `cmp` equal to the committed
excerpt. Thus `quoteFound`, `quoteOffset`, `excerptSha256`, and the excerpt bytes all reproduce
independently; the verdict does not rely on raw-body equality, though equality was observed.

## 3. C1 contract clause-by-clause

| Clause | Observed | Result |
|---|---|---|
| schema `tabi-source-recheck-v1` | `S013.json:2` | pass |
| row id present at REV, not superseded | `SOURCES.md:27`; set excludes S013 | pass |
| `rowUrl` occurs verbatim in row `source` cell | `https://playwright.dev/docs/test-retries` at line 27 | pass |
| `sha256` 64-hex | `cf48ff4d…ffbdfa` (`S013.json:10`) | pass |
| `quoteWords` ≤25 and equals quote word count | 13 words (`S013.json:14`); `split(/\s+/)` = 13 | pass |
| `normalize(quote)` occurs in `normalize(excerpt)` | committed excerpt and my reproduced excerpt both contain it | pass |
| `excerptSha256` = sha256 of excerpt bytes | `93ce10e0…a214`; recomputed | pass |
| `quoteFound` true | quote at offset 3529 in my fetch | pass |
| `fetchedAt` on 2026-10-20 | `2026-10-20T19:06:20.191Z` | pass |
| `teachesVerdict` held | quote + adjacent page text support the row's teaches (§4) | pass |
| `httpStatus` 200 | 200 observed | pass |
| `producerSha256` = REV producer blob | `f2ba0033…aa360`; recomputed from REV | pass |
| one receipt per row | 51 `.json` + 51 `.excerpt.txt`; counter reports 0 rejected | pass |

## 4. Does the quote actually support the `teaches`?

Row `teaches` at `SOURCES.md:27`: “A first-run failure that passes on retry is classed flaky, not
passed; keep every attempt”.

- **Direct support for “classed flaky”**: the quote is the `"flaky"` category itself.
- **Support for “not passed”**: the same list defines `"passed" - tests that passed on the first
  run`, so a first-run failure cannot be `passed`; the three categories are mutually exclusive on
  the page.
- **Support for “keep every attempt”**: the page's run summary prints the failed first attempt and
  the passing retry for the same test:
  `x example.spec.ts:5:2 › second flaky ( 691ms )` then
  `✓ example.spec.ts:5:2 › second flaky ( 522ms )`, followed by `1 flaky` and `2 passed ( 4s )`.
  This is example-level support, not a normative “keep” sentence. The knowledge note labels its
  ledger as operational inference (`corpus/knowledge/web-flake-retry-evidence.md:39-56`, `:174-176`);
  the receipt's `note` (`S013.json:22`) accurately describes the categories and the retaining
  summary. The parenthetical “(x first attempt, check retried attempt, 1 flaky)” is a glyph
  paraphrase: literal strings `first attempt` and `retried attempt` are absent (`grep` count 0),
  but `x …`, `✓ …`, and `1 flaky` are present. No overclaim beyond the page.

## 5. Source identity and anchors: held

- **Identity**: same URL, HTTP 200, no redirect, body identical to the 2026-10-19 seat fetch. The
  page is unversioned; the anchor class is the URL, not a commit/tag. `last-modified` shows a
  deploy at 2026-10-20 16:46:38Z, but the served bytes are unchanged; this is consistent with a
  site deploy that did not alter this page.
- **Sections**: the page has `<h2 … id=retries>Retries` and `<h2 … id=failures>Failures`, matching
  the row's “§Failures, §Retries”. The quote is in the Retries category list.
- **Date marker claim**: `anchorObserved` (`S013.json:20`) says “no revision/date marker in body”.
  Observed: no `Last updated`/`dateModified`; the only date-like token is the footer
  `Copyright © 2026 Microsoft` (a copyright year, not a document revision/date). The
  `last-modified` is an HTTP header, outside the body. The sentence holds as written; the header is
  not recorded by the receipt (limit in §9/§10).
- **Verdict**: source identity held, anchor held, teaches held. No drift, no unreachable.

## 6. Committed counter

At REV (exit 0):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

At baseline B (exit 0): `c1_rows_rechecked:0`, `eligible_rows:51`, and URL classes
`immutable_pinned:14, living_live:42, own_work:1`. The S013 receipt is one of the 51 accepted
receipts: the counter saw 51 JSON receipts, every one accepted (`rejected: []`), and the S013 file
is present and schema-valid; had it been rejected the count would be 50 and S013 would appear in
`rejected`.

The live check was not run as `--live` (that would re-fetch all 51 rows); only S013 was re-fetched,
twice, with identical bytes. The assignment's own-fetch requirement is satisfied for this row.

## 7. Immutable availability vs live product freshness

The C1 claim is stated as source-row re-verification, not product support:
`PLAN.md:15-21` (“Source rows re-verified against their live source with a committed recheck
receipt”), `lessons/round-18.md:12-16` (“C1 counts round-specific integrity-checked recheck
receipts, not overdue rows or current product support”), `knowledge/source-recheck-round-18.md:141`
(“The receipts say what the cited documents and source files contain. They say nothing about how
any product behaves”), and `LOG.md:1049-1050` (“51 current-at-baseline rows reopened … no row
date-due”). The receipt's `freshness_scope` is the same. No conflation of immutable availability
with product freshness was found in those statements.

Two qualifications are worth recording:

1. The live 200 is a real fetch of the unversioned URL, but it was served by a CDN cache
   (`x-cache: HIT`, `age: 237`, `cache-control: max-age=600`) and is byte-identical to the prior
   day. That supports “the same source is available/unchanged at the URL”, not “the origin was
   contacted” or “the product is fresh”. The claim does not assert either stronger thing.
2. `anchorObserved` (`S013.json:20`) uses a cross-run digest equality (“equals the 2026-10-19
   seat-fetch sha”). The equality is factual — `kaika-fleet-round-1.md:56` records
   `cf48ff4d…ffbdfa`, and my fetch is the same — but `source-recheck-round-18.md:143` says a
   receipt's `sha256` “must not be compared across runs or used as a page identity.” The receipt
   uses it as an observation, not a page identity; the wording tension is non-gating, but a
   reader should not treat the digest as an origin fingerprint.

## 8. S029 cross-check (assignment's own-work rule)

`S029.json` is not a network receipt: `command` is
`git -C … show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`,
`httpStatus: null`. I ran the pinned read:

```text
$ git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | sha256sum
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
$ git show … | wc -c
97073
```

Both match `S029.json` (`sha256`, `bytes`); the object type is `commit`; the excerpt sha256
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` matches. The own-work path is
read from git at the pinned commit, not network; holds.

## 9. Non-gating observations

- **F1 (documentation, non-gating; overlaps ReRunC1):** `knowledge/source-recheck-round-18.md:11`
  says “`corpus/SOURCES.md` has 57 rows (S001–S057).” At REV the registry has 64 rows:
  `git show REV:corpus/SOURCES.md | grep -c '^| S'` → `64`; S058–S064 are at `SOURCES.md:72-78`.
  The 51-row recheck scope (57 at B minus the six superseded) is unaffected; the sentence should
  say “at baseline B” or describe the 64-row REV registry and the 51 in-scope rows. This is the
  prose counterpart of ReRunC1's `eligible_rows:58` denominator finding; it does not change the
  S013 receipt or `c1_rows_rechecked:51`.
- **F2 (wording, non-gating):** `S013.json:20` cross-run digest equality vs
  `knowledge/source-recheck-round-18.md:143`'s “must not be compared across runs”; see §7.2.
- **F3 (limit, non-gating):** the receipt records no HTTP headers, so the
  `last-modified: 2026-10-20 16:46:38 GMT` deploy and the `x-cache: HIT`/`age` cannot be seen from
  the receipt. This bounds what the receipt proves about origin-level freshness, not what it proves
  about the quoted text.
- **F4 (support level, non-gating):** “keep every attempt” is supported by the run-summary example,
  not by a normative sentence; the knowledge note already labels the ledger as operational
  inference. This is a stronger reading than the 13-word quote alone, and the receipt's `note`
  supplies the link; no falsification of the row's teaches.

## 10. Limits

- One URL, one live GET per request (two fetches); no browser launched and no runtime/product
  behavior observed. This is a source recheck, not a product-support check.
- The response was CDN-cached; origin-level stability is not established.
- `measure-c1.mjs --live` was not run (it would re-fetch all 51); the S013 live check above is the
  assigned independent fetch.
- No lane production, fleet, sibling, Git index, or jj state was written. The only write is this
  report. No `recheck-fetch.mjs` execution and no tool installation occurred.
- The page is unversioned: “source identity” means the served URL/bytes, not a Playwright version
  or commit. The knowledge note's rolling-stable qualification (`web-flake-retry-evidence.md:174-176`)
  is the correct scope.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS013.md
