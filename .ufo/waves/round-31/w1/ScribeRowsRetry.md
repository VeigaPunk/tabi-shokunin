# ScribeRowsRetry — C1 build, S120 (RFC 6585) decision rows

**Verdict:** RFC 6585 supports two honest decision-table rows, and no more: a `429` response row whose action is to wait the Retry-After delay (normative strength MAY, the 3600 s value labelled the RFC's example) and a `429` body-budget row whose action is to cap at the budget an example body states (50 requests per hour, labelled an example body, the server's illustrative policy). Neither threshold carries a bound word, because RFC 6585 states no bound — the first draft's `at least 3600 s` was an author's inference and is withdrawn (see Critic engagement). Both rows were proved against the frozen counter end-to-end in a scratch fixture: offline `population 2, admitted 2, failing 0, exit 0`, and with `--live` the same figures from a fresh fetch. The section's only normative duties are numberless (MAY Retry-After; 429 MUST NOT be cached), so if C1's counted rows must assert only source-stated bounds, the L1 should drop both rows and carry 429 in prose plus registry used-by — RFC 6585 alone cannot supply a bounded row without turning an example into a norm. I verified that alternative independently: the critic's 11-row table over S119/S121/S122 admits 11 of 11 under `--live` against my own fetches and the frozen counter (base `53bc176…`, tip `3ab1e7e…`), with one row-level caveat on its D1 (below).

## Scope and discipline

- Seat: leaf, no subagent dispatch, no message to `agent://all`. Attack seats report findings only; this seat drafted rows and revised them once on a first-falsifier finding.
- Read: `scripts/check-decision-table.mjs` (header comment, `normalise`, `parseRegistry`, `parseTable`, `splitRow`, `quoteSpans`, `numbersIn`, `UNIT_RE`, `evaluate`), `.ufo/waves/round-31/claims.json`, `PROVINCE.md`.
- Wrote only: this report, `.ufo/waves/round-31/w1/ScribeRowsRetry/` (rows, rejected list, evidence) and scratch under `/fast/scratch/hyaku/tabi-r31/ScribeRowsRetry/`. No lane tracked file, index, jj state, fleet repo or sibling lane was touched. No tool install, no upgrade, no `pacman`/`uv`/`npm` transaction.
- No lane checkout was used as a run target. One shared clone at the freeze commit, used only to execute the counter script against a scratch fixture repo.

## Fetch record (single read-only GET, no login, no API)

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| https://www.rfc-editor.org/rfc/rfc6585.txt | 2026-10-26T08:37:13Z | 200 | 17164 | `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58` |

Command:

```
curl -q -sS --proto '=https' --proto-redir '=https' -L --max-redirs 5 --max-time 60 \
  -o rfc6585.txt -w 'code=%{http_code} url=%{url_effective} bytes=%{size_download}\n' \
  https://www.rfc-editor.org/rfc/rfc6585.txt
```
```
code=200 url=https://www.rfc-editor.org/rfc/rfc6585.txt bytes=17164
curl_exit=0
```

Effective URL stayed on the cited host and scheme, so the receipt's `url` is the row's source URL verbatim. The counter's own `--live` fetch applies the same https-only, same-host rule and passed for both rows.

## Normalisation note (matters for anyone drafting other quotes)

`normalise()` takes its HTML branch on `/<!doctype html|<html[\s>]/i` — and RFC 6585's §4 example response contains a literal `<html>` body. The fetched text is therefore treated as HTML: `<html>`, `<head>`, `<title>…</title>`, `<h1>`, `<p>` are stripped and entities decoded, then whitespace collapsed. In the normalised text §4 reads (excerpt):

```
For example: HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600 Too Many Requests Too Many Requests I only allow 50 requests per hour to this Web site per logged in user. Try again soon.
```

Consequences: a quote may not contain the example's markup tags (they do not exist after normalisation), and every row here uses the tag-stripped run. Page footers (`Nottingham & Fielding Standards Track [Page 3] RFC 6585 …`) sit mid-flow, so quotes must stay inside one page body — both do.

## Row proofs (independent of the counter)

`evidence/norm.mjs` imports the frozen `normalise`, `NUMBER_WORDS`, `numbersIn` and `UNIT_RE` bodies verbatim; `evidence/quote-checks-rows.txt` is the output.

```
node "$S/norm.mjs" --check "$S/fetch/rfc6585.txt" "$S/rows-only.json"
```
```
D1 quote_words=11 located=true threshold=3600 s tnum=3600 number_in_quote=true PASS
D2 quote_words=15 located=true threshold=50 requests tnum=50 number_in_quote=true PASS
total=2 failures=0
rows_exit=0
```

Each row therefore satisfies q1 (one span, 6..25 words), q2 (the quote is a literal substring of the normalised fetch) and n1 (the threshold's number occurs in the quote as digits: 3600, 50).

Controls proving the refusals are not hand-waving (`evidence/quote-checks-controls.txt`, exit 1 by design):

```
CONTROL-MAY-only quote_words=16 located=true threshold=3600 s tnum=3600 number_in_quote=false FAIL
CONTROL-normative-full quote_words=26 located=true threshold=3600 s tnum=3600 number_in_quote=true FAIL
total=2 failures=2
controls_exit=1
```

The normative MAY sentence alone has no number (n1), and normative sentence + example is 26 words (q1). That is why the rows keep the 11-word example span and label its value an example instead of claiming the RFC bounds at 3600 s.

## End-to-end through the frozen counter (scratch fixture)

- Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d`; `sha256sum scripts/check-decision-table.mjs` = `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`, equal to `frozenDigests` in `claims.json`.
- Fixture repo `$S/fixture`: baseline commit `3b8448477effc9efaf59f09b7ad637db6f7022fd` (registry without S120), tip commit `433e4e281688014b823cfe0c68a70886fc93f6f0` (S120 registry row `status=mined`, `used-by=corpus/knowledge/rate-signal-decision-table.md`; the two-row entry; receipt `S120.json` + `bytes/S120.txt` = the fetched 17164 bytes). `git -C "$S/fixture" rev-parse --show-toplevel` = the fixture. All fixtures are mine, not the lane's.

Offline:

```
node scripts/check-decision-table.mjs --repo "$S/fixture" --rev 433e4e2… --baseline 3b84484… \
  --entry corpus/knowledge/rate-signal-decision-table.md --json
```
```
offline_exit=0   (fields projected from evidence/offline.json)
{"population":2,"admitted":2,"failing":0,"clean":true}
D1 true null 3600
D2 true null 50
```

With `--live` (the counter's own `curl -q … --proto =https` fetch of the cited URL):

```
live_exit=0      (fields projected from evidence/live.json)
{"population":2,"admitted":2,"failing":0,"live":true}
D1 true null
D2 true null
```

Both rows are admitted by the same bytes the lane will freeze, and both survive the live refetch. Raw outputs: `evidence/offline.json`, `evidence/live.json`.

## Critic engagement (CritSourceChoice)

CritSourceChoice's first-falsifier finding (relayed verbatim in gist): RFC 6585 contains "NO normative number"; its only two numbers sit inside one `For example:` block; "r4/t4/n1 force you to present an example value as the source's bound"; a fixture row presenting 3600 as a bound is admitted by the frozen counter; and 11 rows pass live from S119 §2.3.1.2/§2.4/§2.5, S121's explicit "No more than N … are allowed" quotas and S122's one-second/one-minute rules, so RFC 6585 can be carried in prose plus registry used-by. They also note RFC 9309's "30 days" is a parenthetical example under MAY and that GitHub answers 403 or 429.

What I changed in response:

- D1's Threshold is now `3600 s`, not `at least 3600 s`. The bound word was mine; RFC 6585 writes no bound. The Decision cell now says the value is the example response's and that the section's normative sentence states MAY, "not a norm".
- Both rows state their normative strength inside the Decision cell as examples, per the assignment ("label them so"), and `rejected.md` item 9 records the withdrawn bound phrasing and why.
- I agree with the substance of the admission-hole observation: `n1-threshold-sourced` only checks that the number occurs in the quote, so an example value can be presented as a threshold by any row, S120 or otherwise. That is a counter property, not something a row can fix; the table's honesty rests on the Decision cell's label, which the counter does not read.

What I did not do, and will not do from this seat: drop the rows on my own authority. My assignment names S120 rows explicitly ("the Retry-After example value and the example body's request budget — both are EXAMPLE values in the RFC, label them so"). The choice of whether C1's counted population includes example-labelled rows belongs to the L1; both readings are now on the record with evidence, and the rows are optional if the S119/S121/S122 population reaches the target on its own — which I then verified (next section).

## Independent verification of the 11-row alternative (option c)

The critic's own fixture builder cannot have produced its recorded result: `build-honest.mjs` writes entry rows from an array whose Signal cells for D6 and D7 are unbackticked ("concurrent in-flight requests", "single-endpoint burst"), which `t2-signal` rejects, yet `honest-live2.json` reports 11 admitted; the committed `probe-honest-table.md` carries backticked signals, so the JSON's producing bytes are not the committed builder's. I therefore rebuilt the fixture from `probe-honest-table.md` itself and my own fetches, and ran the frozen counter (sha256 `d15f3bd7…`, unchanged).

Fetches (read-only, no login, no API):

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T08:47:26Z | 200 | 25265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-10-26T08:47:26Z | 200 | 337116 | `ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18` |
| https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 2026-10-26T08:47:26Z | 200 | 328088 | `b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e` |

Fixture `$S/fixture-probe`, built by `evidence/build-independent.mjs` from the probe table's 11 rows verbatim: baseline `53bc176c42cc19dd3f3ea7a5fb3590793477750f` (registry without S119-S122), tip `3ab1e7e67e6fb05419c7204d836546db30847266`. All 11 quotes were confirmed located in my normalised fetches before the run (the script prints one line per row; every `located=true`, word counts 8–19).

```
node scripts/check-decision-table.mjs --repo $S/fixture-probe --rev 3ab1e7e… --baseline 53bc176… \
  --entry corpus/knowledge/rate-signal-decision-table.md --json
offline_exit=0   population 11, admitted 11, failing 0   (evidence/probe-offline.json)

node scripts/check-decision-table.mjs … --live --json
live_exit=0      population 11, admitted 11, failing 0, live true   (evidence/probe-live.json)
```

So option (c) is real at the counter: 11 rows, 0 failing, live. One row-level caveat for the L1, found while checking the quotes against my fetch of RFC 9309: the probe table's D1 quotes "If a robots.txt file is reached within five consecutive redirects, the robots.txt file MUST be fetched" and thresholds at "at least 5 redirects" under a Decision labelled "MUST", but the "at least five" bound is stated by the *preceding* SHOULD sentence ("The crawlers SHOULD follow at least five consecutive redirects, even across authorities"), while the quoted sentence says "within five" and its MUST covers the fetch. The counter admits the row (the number `five` is in the quote), but the normative strength and the bound's wording come from a neighbouring sentence — the same class of mislabel I withdrew from D1 above. Rewording that row (quote the SHOULD sentence, keep "at least 5 redirects", decision "follow — SHOULD") or replacing its threshold is the S119 seat's work, not this seat's; it does not reduce the count, since the row would still admit.

The probe table's other rows held up on inspection: D2's quote carries "SHOULD NOT use the cached version for more than 24 hours" with the action `refetch` and bound "no more than 24 hours"; D3's quote is "The parsing limit MUST be at least 500 kibibytes" (MUST, matching its threshold); D10/D11 are GitHub's own pacing statements ("wait for at least one minute before retrying", "wait at least one second between each request"), labelled vendor rules, not web norms.

## The rows as drafted

See `rows.md`; the exact entry bytes exercised above are `evidence/rate-signal-decision-table.md` (`sha256 2805ca2f9c203eb3a28a6a571753332cc25a806d370e986be6cf1d1ec60e3b21`). Both quotes are single-line, contain no `|`, and the table header is exactly the frozen one.

What the two rows claim, and nothing more:

1. A `429` example response carrying `Retry-After: 3600` → a driver waits 3600 s before a new request; the section's normative sentence states MAY and the value is the RFC's example, not a bound.
2. A `429` body that states a request budget → the driver caps at that stated budget; 50 requests per hour is the example body's own illustrative policy, not a normative limit.

## Handoff notes for the L1

- Receipt: `evidence/S120.receipt.json` is a fixture-shaped proposal with the fetch's real url/status/bytes/sha256 and `bytes_path` `corpus/evidence/round-31/decision-table/bytes/S120.txt`; the lane's `S120.json` and bytes must come from the seat that owns the fetch, not from this file.
- Registry row used in the fixture is illustrative text; the counter's `r3-used-by` requires the lane's S120 row to list `corpus/knowledge/rate-signal-decision-table.md`, and `r4-new-row` requires S120 to be absent at baseline `96a2d1a…` (it is absent at the freeze; `grep -n 'S120' corpus/SOURCES.md` at `9505a10` returns nothing).
- Ordering: the entry, registry row, receipt and bytes must all be in the same measured revision; the counter reads committed blobs only.
- Decision for the L1: include both rows only if an example-labelled threshold is acceptable in a counted row. If the table must assert source-stated bounds only, omit them — RFC 6585's only MUST on 429 (cache) is numberless, so prose + used-by is the only honest non-counted use of this source. Note on the critic's option (a): entry prose cannot exclude a row from `population` (the counter counts the first table's data rows), so prose alone changes no number; it only helps in combination with a claim-wording change, which is option (b).

## Out of scope / not done

- No measurement of C1 itself at a lane revision (no REV exists yet); the fixture runs above are grammar and receipt-gate evidence, not the C1 predicate.
- No rows for S119, S121 or S122 were drafted by this seat: I fetched those three pages only to re-verify the critic's probe table against my own bytes (section above), and the D1 rewording is left to the S119 seat.
- No lane build, lint, formatter or gate suite run; no commit in the lane.
