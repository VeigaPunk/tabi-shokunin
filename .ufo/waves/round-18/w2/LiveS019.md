VERDICT: PASS

# C1 receipt S019 — independent re-fetch and teaches/freshness attack

## Context

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Baseline B: `2bff864fdfee684ddbcd066cc8e735adaba2735c`
- Measured candidate REV: `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (resolved by `git rev-parse 530f40a9bc3f10436161a2af1ca0fe9bffffc004`; `git show REV:corpus/SOURCES.md` piped to `sed -n '33p'` is identical to B's S019 row)
- Receipt: `corpus/evidence/round-18/source-recheck/S019.json` (file sha256 `71d1c3e92a47bb828ecd758a2622eafff9a31d0aae10c50e1c1efd0887a7784c` at REV), excerpt `S019.excerpt.txt` (1310 B, sha256 `dcda7ff799718ff3cf506cd204930e4a11b5846cea1e90fb8e029a9fb343aa34`)
- Producer: `.ufo/waves/round-18/recheck-fetch.mjs`, sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`; identical blob at REV (`git show REV:.ufo/waves/round-18/recheck-fetch.mjs | sha256sum`)
- Row: `corpus/SOURCES.md:33`; quote source: `corpus/lessons/kaika-fleet-round-1.md:62`; note: `corpus/knowledge/source-recheck-round-18.md`
- No production writes; no producer invocation against production; no `jj`/Git write; no browser. Network probes were public-source GETs; an early header-only `curl -I` probe was followed by the GET header capture (`-D headers4.txt`) used in this report, and no HEAD-derived value is relied on.

## Receipt under test (observed)

`corpus/evidence/round-18/source-recheck/S019.json`:

- `:3` row `S019`; `:5` url = `https://research.knu.ac.kr/en/publications/non-flaky-and-nearly-optimal-time-based-treatment-of-asynchronous/`; `:6` `fetchedAt` `2026-10-20T19:05:49.436Z`
- `:8` `httpStatus` 200; `:9` `bytes` 49866; `:10` `sha256` `119a6e3078a7927ea6276bd013abaa9904eb13b392be18c8009bb3bb525e55a9`
- `:13` quote `developers adjusted wait time to address asynchronous wait flakiness in about 63% of cases (31 out of 49)`; `:14` `quoteWords` 18; `:15` `quoteSource` `corpus/lessons/kaika-fleet-round-1.md:62`; `:16` `quoteFound` true; `:17` `quoteOffset` 1022
- `:19` `excerptSha256` `dcda7ff799718ff3cf506cd204930e4a11b5846cea1e90fb8e029a9fb343aa34`; `:20` `anchorObserved` `publication_date 2025/02/12; DOI 10.1145/3695989 (portal meta)`; `:21` `teachesVerdict` `held`
- `:22` note: “Held: abstract still states 63% (31/49) adjusted wait time even when underlying causes lie elsewhere; teaches cell matches abstract-only scope. Page bytes differ from the seat fetch (4fa85f45...) but the quoted abstract text is unchanged.”

The quoted 18-word span is exactly present in `corpus/lessons/kaika-fleet-round-1.md:62`; that line records the original seat body digest `4fa85f45c7657f149f868a36b747c2319ebb10fb00484bb491b8b7a3546015ab`. The receipt’s `sha256` is a different fetch, as its note says.

## Independent fetch

Sandbox: `mktemp -d /tmp/tabi-r18-lives019-XXXXXX` (`/tmp/tabi-r18-lives019-nDj6av`). Exact GET argv (the receipt’s user agent and timeout):

```
UA='Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18'
URL='https://research.knu.ac.kr/en/publications/non-flaky-and-nearly-optimal-time-based-treatment-of-asynchronous/'
for n in 1 2 3; do
  code=$(curl -sSL --compressed --max-time 90 -A "$UA" -o "$D/body$n" -w '%{http_code}' "$URL")
  echo "fetch$n http=$code bytes=$(wc -c < "$D/body$n") sha256=$(sha256sum "$D/body$n" | cut -d' ' -f1)"
done
```

Observed (exit 0 for each `curl`; all HTTP 200):

```
fetch1 http=200 bytes=49866 sha256=d5d02d360e34a8aea207961855da50b321df684316c784734ba300de67615abc
fetch2 http=200 bytes=49866 sha256=ef42d03d0ffc63cda995ab301a8f9d29857a64b017a554a106bb70bb3ff60e2b
fetch3 http=200 bytes=49866 sha256=d4a13a2961aa399c2dc72888b6a612a6f8eeb473b39f5172ef306e9a5852a998
```

A fourth GET captured response headers and another body (`-D headers4.txt -o body4`):

```
fetch4 http=200 bytes=49866 sha256=c47e5c9ef9927518ecef21633c9ab88ce8a408340f1cd5b6db892d444543dfcd
```

GET response headers (`headers4.txt`): `HTTP/2 200`; `date: Tue, 20 Oct 2026 20:06:17 GMT`; `content-type: text/html;charset=UTF-8`; `last-modified: Tue, 13 Oct 2026 23:36:46 GMT`; `server: cloudflare`; `cf-cache-status: REVALIDATED`; `x-product: Pure Portal`.

Comparison to the receipt: status 200 = 200; bytes 49866 = 49866; raw `sha256` differs (receipt `119a6e…`, four independent bodies above). This is not treated as a failure: the page is a dynamic Cloudflare/Pure response, and the note’s §6 (`corpus/knowledge/source-recheck-round-18.md:143`) says a receipt digit pins one response and “must not be compared across runs or used as a page identity.” The task’s rule is not to require raw-body equality on a dynamic page.

## Decode, quote and excerpt

Decoded with the producer’s own exported `decodeBody(bytes,'html-text')` and `normalize()` (imported read-only from `recheck-fetch.mjs`; no `main()` run, no production output):

```
normLen=10556 quoteOffset=1022 quoteFound=true textsEqualAll=true
```

- The quote is found at normalized offset **1022** in every one of the four bodies, exactly matching `quoteOffset:1022` (`S019.json:17`). Normalized body length **10556** matches Recheck09’s recorded `10556`.
- The quote is also present raw in the page (`rawQuotePresent=true` in `body1`), not only after decoding.
- Quote word count is **18**, matching `quoteWords` (`S019.json:14`); normalized quote length 105.
- The excerpt is not merely “a file with the quote”: applying the producer’s own excerpt rule (`text.slice(max(0, at-600), at + q.length + 600)` + `\n`, `recheck-fetch.mjs:107,128`) to each of the four bodies produces exactly 1310 bytes with sha256 `dcda7ff799718ff3cf506cd204930e4a11b5846cea1e90fb8e029a9fb343aa34`, byte-identical to the committed excerpt. The excerpt therefore is derived from a body whose normalized content is the same as all four independent fetches, and the committed excerpt’s `excerptSha256` is correct.
- The quote is in the excerpt, and the first/last excerpt edges are author/abstract text, not a synthetic passage.

## Why the raw digests differ (finite localization)

Raw diff of `body1` vs `body2`: exactly **one** differing byte range, `44885–45850` (966 B), inside the page’s `<script>` block spanning `40306–48847`. The differing text is the Cloudflare email-protection token in an anchor inside that script:

```
href="/cdn-cgi/l/email-protection#3c034f495e56595f480172..."
```

`body4` has the token at byte 44848 (encoded length 963), also inside `<script>` `40306–48847`. The producer’s `html-text` decoder removes `<script>[\s\S]*?</script>` before stripping tags (`recheck-fetch.mjs:26`), so the token cannot alter the normalized text. This is a complete, finite explanation of the per-request digest variation; nothing in the abstract, title, authors or metadata varies. It corroborates the receipt note’s “Page bytes differ … but the quoted abstract text is unchanged.”

[Inference] Cloudflare generates the email-protection encoding per request; the observed `server: cloudflare` / `cf-ray` headers and `/cdn-cgi/l/email-protection#` target support that reading. No other variable region was found in the compared bodies.

## Source identity, anchor and teaches

[Observed] KNU page metadata (raw `body1`): `<meta name="citation_title" content="Non-Flaky and Nearly Optimal Time-Based Treatment of Asynchronous Wait Web Tests">`; authors `Yu Pei`, `Jeongju Sohn`, `Sarra Habchi`, `Mike Papadakis`; journal `ACM Transactions on Software Engineering and Methodology`; volume 34, issue 2, first page 45; DOI `10.1145/3695989`; `citation_publication_date` `2025/02/12`; `citation_online_date` `2025/12/16`. The abstract text contains the receipt’s quote, followed by “even when the underlying causes lie elsewhere. From this, we introduce TRaf, an automated time-based repair…”

[Observed] Independent identity check, Crossref public GET `https://api.crossref.org/works/10.1145/3695989` (HTTP 200): same title, DOI, four authors (Yu Pei, Jeongju Sohn, Sarra Habchi, Mike Papadakis), container TOSEM, type `journal-article`, and the same abstract sentence including the exact quote. Crossref dates: `published-online` 2025-01-20, `published-print` 2025-02-28. Crossref has empty `relation` and no `update-to`; no retraction/correction relation. The ACM DOI landing is not reachable to curl: `https://doi.org/10.1145/3695989` returned **403** with final URL `https://dl.acm.org/doi/10.1145/3695989`, 2989 B, sha256 `7b071d2412b92af4a6132f6678716e4685f1de7969f28869d56ad1a6e77e04b6`, title “Just a moment...” (Cloudflare challenge). Crossref metadata is therefore the independent identity/abstract witness, not a replacement of the KNU evidence.

[Observed → held] **Identity: held.** The page is the institutional record of the DOI/title/authors/journal, and Crossref independently confirms the same work and the same abstract sentence. The quote is not a portal invention.

[Observed → held, with a finite cross-source date note] **Anchor: held to the cited record.** The row’s anchor says `institutional record, Abstract; DOI 10.1145/3695989, published 2025-02-12` (`corpus/SOURCES.md:33`), and the page’s `citation_publication_date` is exactly `2025/02/12`; the receipt’s `anchorObserved` is therefore true to the portal meta. However, Crossref gives `published-online` 2025-01-20 and `published-print` 2025-02-28, and the portal itself also exposes `citation_online_date` 2025/12/16. The row’s bare “published 2025-02-12” is portal-local, not a universal publisher date; this report does not treat that as drift of the quoted record, but it is a finite bibliographic discrepancy (three different dates across the page and Crossref). No quote/identity field depends on it.

[Observed → held, wording caveat] **Teaches: held at the row’s stated scope.** The row’s scope is “Reported prevalence of wait-time changes in asynchronous-wait fixes” and its teaches cell is “Developers often adjust wait durations as the fix; a secondary record of that prevalence, read from the abstract only” (`corpus/SOURCES.md:33`). The quoted 63% (31/49) directly supports “often adjust wait durations” and the prevalence. The literal 18-word quote stops at “(31 out of 49)”; the abstract’s next clause, “even when the underlying causes lie elsewhere,” qualifies efficacy and is included in the receipt’s note (`S019.json:22`) but not in the row’s teaches cell. The paper’s next sentence frames time adjustment as TRaf, “an automated time-based repair,” so “as the fix” is defensible as “the fix applied,” not as “the fix that removes the root cause.” Finite caveat: if the teaches cell is read as efficacy (“adjusting waits fixes flakiness”), the quote alone does not support that; the abstract’s qualifier and the note’s wording do. The receipt’s `teachesVerdict: held` is correct for the row’s prevalence/abstract-only scope; no drift and no superseding row is required.

## Immutable availability vs live product freshness

[Observed] S019 is an immutable 2025 journal article: DOI `10.1145/3695989`, TOSEM 34(2):45, Crossref metadata; the recheck proves the KNU institutional record still serves the same title/DOI/authors/abstract and that the quote is still present. It cannot show that the 2025 finding is current or that any product behaves as the paper suggests.

[Observed] The declared claim is scoped the same way, so it is not conflating the two:

- `PLAN.md:15-16` defines C1 as “Source rows re-verified against their live source with a committed recheck receipt … target 51 = every row not superseded at B.”
- `corpus/lessons/round-18.md:12-14` says C1 “counts round-specific integrity-checked recheck receipts, not overdue rows or current product support,” and calls S029 own-work “hygiene, not live freshness.”
- `corpus/knowledge/source-recheck-round-18.md:141` says the receipts “say nothing about how any product behaves, and the 51 rows are not a statement of current live product support”; `:140` says quote presence is not claim truth; `:143` says a digest pins one response.
- The counter emits `freshness_scope: 'round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate'` (`measure-c1.mjs:471`).

[Boundary finding, not a defect] The counter’s URL histogram at REV reports `living_live:46`, `immutable_pinned:17`, `own_work:1`; S019’s URL has no pin marker, so `isPinnedUrl`/`urlClass` (`measure-c1.mjs:247-260`) classify it `living_live`. That is a URL-shape label, not evidence that the content is live or changing; the note already says “The URL class is a property of the row’s URL, not of the receipt” (`source-recheck-round-18.md:108-112`). S019 should be read as a **static publication record checked for availability and text identity**. If a later report cited the `living_live` count for S019 as proof of current product freshness, that would be an overread; the current claim does not do so, and the scalar is 8→8 with no promotion.

## Counter (read-only)

Command, exit 0:

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Observed fields: `rev` `530f40a9bc3f10436161a2af1ca0fe9bffffc004`; `c1_rows_rechecked` **51**; `eligible_rows` **58**; `held` 50; `drift_superseded` 0; `own_work` 1; `row_classes.url` `{immutable_pinned:17, living_live:46, own_work:1}`; `rejected` `[]`; `live` `null`; `counterSha256` `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. S019 is among the 51 accepted receipts; no receipt was rejected. `--live` was not run; the counter did not fetch. The `eligible_rows:58` vs target 51 is a separate denominator boundary (new S058–S064 rows at REV), not an S019 receipt failure; it is not re-litigated here.

## Limits / unresolved

- The publisher’s HTML at `https://dl.acm.org/doi/10.1145/3695989` was **403** (Cloudflare challenge, 2989 B, sha256 `7b071d…e04b6`); no full text was read. Crossref metadata supplied the independent title/DOI/authors/abstract check.
- The receipt’s exact raw body (`119a6e…`) is not retrievable; the report verifies status, bytes, normalized content, quote, offset, excerpt bytes and the finite dynamic region instead. Raw-digest equality is deliberately not required on this dynamic page; note §6 (`source-recheck-round-18.md:143`) prohibits using a digest as page identity.
- `quoteFound` is presence only; this report separately checked that the quote supports the row’s prevalence scope. It did **not** perform a full-text check of the paper or a retraction database. The bounded checks found no `update-to`/relation in Crossref and no `retract`/`correction`/`erratum`/`withdraw` in the fetched page, which is not proof of absence.
- The portal date (`citation_publication_date` 2025/02/12; `citation_online_date` 2025/12/16) and Crossref dates (online 2025-01-20, print 2025-02-28) disagree; the row’s “published 2025-02-12” is portal-local. The receipt’s `anchorObserved` is accurate to the portal but is not a publisher-date confirmation.
- The row’s teaches cell says “as the fix” without the abstract’s “even when the underlying causes lie elsewhere” clause; the receipt’s note includes the clause and the row’s scope is prevalence-only. Wording caveat, not a receipt drift; a future registry edit could add the qualifier, but no production edit was made here.
- The recheck is an early, author-side re-open (row opened 2026-10-19, recheck cell `180d`, receipt 2026-10-20), not an overdue repair or independent non-author verification; the note’s own authorship limit (`source-recheck-round-18.md` §1/§6) applies.

## Conclusion

`PASS` for the S019 receipt as a C1 source recheck: the quoted 18-word sentence is present in the live institutional record at the recorded offset, the excerpt is exactly derivable from the fetched normalized text and its digest matches, the producer binding and row URL hold, the DOI/title/authors identity is independently confirmed, and the teaches verdict is correct at the row’s prevalence/abstract-only scope. The only raw-byte variation is a Cloudflare email-protection token inside a stripped script; no content drift. The immutable-publication versus live-product-freshness distinction is explicitly scoped by the plan, lesson, note and counter; the residual risk is a URL-class label (`living_live`) that should not be read as content liveness. No superseding row is warranted.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS019.md
