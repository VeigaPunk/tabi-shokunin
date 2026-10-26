# RowAttackD7D8 — C1 rows D7 and D8 (GitHub 60/h and 5,000/h, `(derived)`) at `4860483`

**Verdict.** Both rows hold on every letter that decides a row: the quote is verbatim and I re-located it myself in the committed receipt bytes and in a live 2026-10-26T12:27:38Z GET of S121 (a) — at raw receipt lines 38 and 41, normalised offsets 5015 and 5301; the threshold number is the quantity the quote bounds, not a status/section/document number or a pronoun (b); the unit is the quote's unit, the bound is the source's declared maximum and the row's Decision says `plan at most`, with the period living in the Decision cell exactly as D10/D11 do (c); both quotes are bare declaratives with no RFC 2119 keyword and no directive, so `(derived)` is the marker the entry's own rule demands and `cap` is in the closed verb set (d); `x-ratelimit-limit` is documented on the same page as "The maximum number of requests that you can make per hour" (raw line 134), so the signal is a driver-held observable (e); and the two rows are distinct from each other and from D6/D9–D13, with each quote occurring once in the table and once in the source (g). What I do not pass is scope, letter (f), and only at low severity: **D7** names "unauthenticated" but not the binding the source states in the immediately preceding sentence — the 60/hour is per *originating IP* and only for *fetching public data*, and the page says "Some endpoints, like the search endpoints, have more restrictive limits" (raw lines 34, 37) — and **D8** names "user token" while the quote's antecedent, "all of these requests", is PAT **plus** GitHub App and OAuth app requests made on the user's behalf, the 5,000 being one shared *personal* budget (raw line 41: a higher-limit app's use "will have exhausted the 5,000 request budget for your personal access tokens"). Neither omission changes the number, the unit, the bound, the derived force or the direction of the cap, and neither is repairable-by-counter (the counter cannot read scope); both are prose-only scope notes on rows that the frozen counter admits. **No hard defect; no defect that would move C1 off the depth axis.** The finding is that criterion 80's scope clause is met at credential-class level only, on the two rows where the source binds the number to an IP-shared budget (D7) and to a user-shared budget (D8).

## Row identity at the frozen revision

`corpus/knowledge/rate-signal-decision-table.md:55` and `:56` at `486048356f0712e4396588c9dab58cd419243120`:

```
| D7 | `x-ratelimit-limit` on an unauthenticated request | cap — plan at most this many requests per hour (GitHub REST API policy, unauthenticated) (derived) | 60 requests | S121 | "The primary rate limit for unauthenticated requests is 60 requests per hour." |
| D8 | `x-ratelimit-limit` with a personal access token | cap — plan at most this many requests per hour (GitHub REST API policy, user token; this lane holds no token) (derived) | 5,000 requests | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour." |
```

Registry row `S121` (from `corpus/SOURCES.md` at REV): `status=mined`, `used-by=corpus/knowledge/rate-signal-decision-table.md`, source `Rate limits for the REST API — https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api`, anchors "unauthenticated 60 requests per hour at line 38, authenticated 5,000 requests per hour at line 41". Receipt `corpus/evidence/round-31/decision-table/S121.json` → `bytes/S121.html`, `http_status: 200`, sha256 `3a33f87b965a4af17078523dad091e35c41c69d7c9e6941140f91f4feefef755`; `sha256sum` of the committed bytes equals it.

## Evidence per letter

Extraction used the counter's own `normalise()` (imported semantics: strip `script`/`style`, strip tags, decode entities, collapse whitespace) run over the committed receipt and over my live GET.

**(a) verbatim + located.** Each quote cell parsed out of its row with the counter's `quoteSpans` regex and re-located:

```
D7 line 55 threshold "60 requests" source S121
  quote "The primary rate limit for unauthenticated requests is 60 requests per hour."
  located_committed: true  words: 12  index: 5015  occurrences in source: 1
D8 line 56 threshold "5,000 requests" source S121
  quote "All of these requests count towards your personal rate limit of 5,000 requests per hour."
  located_committed: true  words: 15  index: 5301  occurrences in source: 1
quote occurrences in the entry: D7 1, D8 1
```

Raw receipt lines, unchanged HTML paragraphs:

```
38: <p>The primary rate limit for unauthenticated requests is 60 requests per hour.</p>
41: <p>All of these requests count towards your personal rate limit of 5,000 requests per hour. Requests made on your behalf by a GitHub App that is owned by a GitHub Enterprise Cloud organization have a higher rate limit of 15,000 requests per hour. …</p>
```

Live re-location (my own GET, not the counter's): both quotes present in the live normalised text at the same indices, 5015 and 5301.

**(b) the number is the bounded quantity.** `numbersIn()` over each quote returns exactly `[60]` and `[5000]` — no status code, section number, document number, year or pronoun in either quote, so neither row can be the M10/A1–A6 failure mode. Line 38: 60 = requests per hour for unauthenticated requests. Line 41: 5,000 = "your personal rate limit", requests per hour. Neither number is the 15,000 Enterprise Cloud figure that sits later in the same paragraph, nor the 1,000 `GITHUB_TOKEN` figure at line 61.

**(c) unit and bound.** Unit cells are `requests`; both quotes rate the quantity per hour, and the period appears in the Decision ("per hour") rather than the Threshold cell — the same convention D10 (`900 points`, period in Decision) and D11 (`90 seconds`, window in Decision) use, so the row as a whole an unbroken statement of a rate. The bound is a declared maximum: line 38's "rate limit … is" and line 41's "rate limit of", with line 134 defining the same header as "The maximum number of requests that you can make per hour". The Decision's "plan at most" is the correct bound direction. (Only note: D7/D8 are the two `cap` rows whose Threshold cell carries no explicit bound word — D9–D11 say `no more than`; the bound is present in the Sentence, not inverted.)

**(d) verb and force.** Both located quotes are third-person declaratives: no `MUST`/`SHOULD`/`MAY` in capitals, no lower-case directive addressed to the caller ("you can use a personal access token…" at line 40 is a permission, not an instruction). Under the entry's own rule (paragraph "A decision the quote does not instruct carries `(derived)`") the marker is required, and both Decision cells end with it. `cap` is a member of the entry's declared closed verb set, and the actions are the ones the declared ceilings imply.

**(e) observable.** `x-ratelimit-limit` is documented on the same page, raw line 134: "`x-ratelimit-limit` — The maximum number of requests that you can make per hour", in the section "Checking the status of your rate limit" whose opening sentence is "You can use the headers that are sent with each response". A driver that sends one request of the row's class holds the header on the response. Observation, not defect: the header arrives only *after* a request, while the row's action is a pre-request plan; the signal is still the vendor's own reporting of exactly the ceiling the row plans against, and the entry's "Request-time caps…" prose paragraph is about the secondary ceilings (D9–D11), not these primary ones.

**(f) scope — the finding.** Both rows name the vendor and the credential class, and the entry states the access date once ("S121 and S122 are GitHub's published policy on 2026-10-26", Limits; header "fetched 2026-10-26"), which satisfies criterion 80's "that vendor's, at the access date". What the two rows do not carry is the *binding* the source puts on the number:

- **D7 — low.** The source's sentence before the quote (raw line 37): "Unauthenticated requests are associated with the originating IP address, not with the user or application that made the request", and the same paragraph's "You can make unauthenticated requests if you are only fetching public data." Earlier, raw line 34: "Some endpoints, like the search endpoints, have more restrictive limits." The row's scope cell reads only "unauthenticated", so a journey record can store "60/hour" as the driver's bound while the budget is actually shared by every client on the egress IP, is conditioned on public-data fetches, and is lower on the resource families the page calls out. Concretely, an unauthenticated request to a search endpoint returns a `x-ratelimit-limit` that is not 60, so the Signal→Threshold pairing in the row is not universal — the header, not the row, carries that case. No inversion: 60/hour remains the vendor's own primary figure and the plan stays conservative, so this is a scope note, not a wrong number.
- **D8 — low.** The quote's subject is "All of these requests", and the antecedent two sentences earlier (raw lines 40–41) is "You can use a personal access token to make API requests. Additionally, you can authorize a GitHub App or OAuth app, which can then make API requests on your behalf." The 5,000 is therefore one *personal* budget shared across those credential paths, which the same paragraph states twice: "Requests made on your behalf by a GitHub App that is owned by a GitHub Enterprise Cloud organization have a higher rate limit of 15,000 requests per hour", and "requests made by a higher-limit app reduce the remaining budget available for lower-limit authentication methods. For example, if an app with a 15,000 request limit makes 10,000 requests on your behalf, you will have exhausted the 5,000 request budget for your personal access tokens, even though the app has 5,000 requests remaining." The row's "(… user token …)" narrows a shared per-user budget to a credential and can be read as a per-token allowance of 5,000, which the source's own example falsifies (a PAT can hold 5,000 nominal while the remaining budget is already spent by an app). It does not falsify the number, the unit or the cap direction — "plan at most 5,000" remains a ceiling — and the entry's Limits elsewhere already warns that the vendor's remaining count varies and must not be depended on exactly, though it does not carry this sharing rule.

**(g) distinctness.** D7 (60, unauthenticated) and D8 (5,000, PAT) share no `(source, threshold number, unit)` triple with each other or with D1–D6/D9–D13; each quote occurs exactly once in the entry and once in the source page. This matches the lane's own distinctness standard recorded in the lesson: the Scribe's installation-token row (a second 5,000) was dropped at selection ("D4 installation minimum repeats 5,000"), leaving the 5,000 in exactly one row. D7 and D8 are two credential classes of one rule *shape*, not one rule restated: the signal class and the number both differ, and a reader acts differently (which header value to expect, whether a token exists at all).

## Counter cross-check (not my predicate; run for the record)

Clean clone at REV, `git status --porcelain` = 0 lines, lane script run only there:

```
sha256sum scripts/check-decision-table.mjs
d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832   (= claims.json frozenDigests)
node scripts/check-decision-table.mjs --rev 486048356f0712e4396588c9dab58cd419243120 \
  --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json > "$S/c1.json"
EXIT=0
{ population: 13, admitted: 13, failing: 0 }
  D7 line 55 S121 admitted true threshold 60
  D8 line 56 S121 admitted true threshold 5000
```

This confirms only what the frozen counter checks (located, live, number-in-quote). It cannot see (c) bound word, (d) force or (f) scope — which is exactly why the two scope notes above are reader evidence beside the predicate, not counter output.

## Live fetch provenance

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` | 2026-10-26T12:27:38Z | 200 (final URL identical, same host) | 337116 | `47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9` |

Command (read-only, no credentials, no API host): `curl -q -sS --proto =https -L --max-redirs 5 --max-time 60 -o live-S121.html -w '…' <url>`, exit 0. The live raw bytes differ from the committed receipt (whose sha256 is `3a33f87b…f755`) in 63 bytes at offset 7898, all inside a Next.js build id in `<script src="/_next/static/<id>/_buildManifest.js">`; the **normalised** texts are byte-identical (sha256 `7416038ab0f63a4d614c70cdaa4adf14d14fabab09b6520db4dd6b8b6ecca3b3` both sides, 15,503 chars), so both quotes are genuinely live and the committed receipt's content is current, with only asset-hash churn between the two fetches. This also independently reproduces the lesson's S121 note ("raw bytes differ per response, normalised text identical").

## Smallest safe correction (not landed — attack seat)

Neither row needs its quote, number, unit, force or verb touched, and nothing here asks for a counter or claim change. The correction is prose inside the two Decision cells (counter-neutral: the counter reads the Signal cell's backticks, the Threshold cell's number+unit, the Source id and the quote, not the Decision text):

1. D7 — replace `(GitHub REST API policy, unauthenticated)` with a parenthetical that names the binding the source states: `(GitHub REST API policy, unauthenticated; 60/hour per originating IP, public-data fetches only; some endpoints lower)`. No new number enters the row, so `n1-threshold-sourced` is unaffected; the added qualifiers are the source's own lines 34 and 37.
2. D8 — replace `(GitHub REST API policy, user token; this lane holds no token)` with `(GitHub REST API policy, the user's shared personal budget across personal-access-token, GitHub App and OAuth app requests; this lane holds no token)`. Again no numeral is added and the quote is untouched.

If the lane later adds a criterion-80 reader check for "the row names the scope the source binds the number to", these two cells are the red state it should catch — D7 on per-IP/endpoint scope, D8 on the shared antecedent of "these requests" — and nothing else in D1–D13 that I have read shows this shape (D1–D5 quote `SHOULD`/`MUST` sentences where the scope is the crawler, stated; D6 quotes a directive; D9–D11 quote "No more than …" ceilings whose scope sentence is itself the quote).

## Commands run (with exit codes)

```
git clone --shared …/tabi-shokunin $S/clone; git -C $S/clone checkout -q 4860483      # exit 0
git -C $S/clone status --porcelain | wc -l                                             # 0
git show 4860483:corpus/knowledge/rate-signal-decision-table.md                        # exit 0
awk -F'|' '/^\| S121 /{…}' corpus/SOURCES.md                                           # exit 0, status/used-by as quoted
sha256sum corpus/evidence/round-31/decision-table/bytes/S121.html                      # exit 0, = receipt sha256
node rowcheck.mjs (counter normalise/quoteSpans/numbersIn over REV blob + receipt)     # exit 0
node livecheck.mjs (committed vs live normalise; quote indices; norm sha256)           # exit 0
node -e numbersIn(quote) / quote-occurrence count in entry                             # exit 0
curl -q -sS --proto =https -L --max-redirs 5 --max-time 60 -o live-S121.html <url>     # exit 0, 200, 337116 B
node scripts/check-decision-table.mjs … --live --json > "$S/c1.json"                   # exit 0, 13/13/0
grep -n -i -E '15,000|shared|budget|originating ip|search endpoint|personal rate' entry # exit 0, no scope caveat in the entry
grep -n -o -E '.{0,80}(more restrictive limits|reduce the remaining budget|exhausted the 5,000…)' S121.html  # exit 0, lines 34/37/41
```

No lane tracked file, index or jj state was written; no fleet/sibling/shokuknow write; no subagent; no tool installed or upgraded; no `api.github.com`, login, cookie or credential used. Written only: this report and `.ufo/waves/round-31/a2w1/RowAttackD7D8/` (`c1.json`, `live-S121.html`, `s121-section.txt`, `fetch-provenance.txt`). Scratch `/fast/scratch/hyaku/tabi-r31/RowAttackD7D8/` (TMPDIR passed explicitly; clone and live bytes) was removed after the receipts were copied here.
