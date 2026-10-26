# RefetchS119 — independent refetch of S119 (RFC 9309) for C1, round 31 / a2w1

**Seat:** RefetchS119 (leaf, attack seat — findings only, no repair). **Milestone:** C1 (depth).
**Lane rev audited:** `486048356f0712e4396588c9dab58cd419243120` (clean clone, `status --porcelain` = 0 lines).
**Freeze:** `9505a10eb80b2a0b273ebaba3f7f872ad302192d`; baseline `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`.
**Independence:** the committed receipt's `fetched_by` is `FetchS119`; this seat is `RefetchS119` and fetched the URL itself, at 12:26:29Z (receipt `fetched_at` 08:36:13Z).

## Verdict

**The refetch holds.** Two fresh `curl` fetches of `https://www.rfc-editor.org/rfc/rfc9309.txt` returned HTTP 200, 25 265 bytes, effective URL unchanged, raw sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` — byte-identical to each other and to the committed receipt bytes `corpus/evidence/round-31/decision-table/bytes/S119.txt`, so the counter's normalised form is identical too (normalised sha256 `473fd7d6e946037b43ba27b88ba25796d645057507eb80b81f332785e1c004e5`, 20 886 chars, computed on all three buffers, not inferred from raw equality). All five S119 rows (D1–D5) carry exactly one quote each, and every quote is located in **my** fresh normalised bytes exactly once, at the same offset as in the committed bytes; each quote's force (SHOULD / MAY / MAY / SHOULD NOT / MUST) and its number+unit+bound match the row's threshold cell, and the five quotes are pairwise distinct. The registry anchor cell's cited line numbers all land on the cited sentences in both the fresh and committed bytes. **Two defects, neither in the quote/threshold axis:** (1) the anchor cell dates RFC 9309 "(June 2022)"; the source says **September 2022** in its TXT header and in the HTML `<time datetime="2022-09" class="published">` (severity low–medium: wrong provenance metadata in a frozen registry row, in scope of "does the anchor cell point at the source"); (2) the entry header declares `recheck: 180d for S119 and S120`, while the governing registry cells for both rows say `365d` (severity low: cross-document contradiction the lane's own convention says the row cell wins, and no counter reads it).

S119's contribution to C1's predicate is confirmed independently: the frozen live counter run in my own clean clone reports `population 13, admitted 13, failing 0, exit 0`, with D1–D5 admitted.

## Evidence

### 1. Fetch record (TSV, also at `.ufo/waves/round-31/a2w1/RefetchS119/fetch-record.tsv`)

```
seq	utc	url	http_status	bytes	raw_sha256	effective_url	norm_chars	norm_sha256	curl_exit
fetch1	2026-10-26T12:26:29Z	https://www.rfc-editor.org/rfc/rfc9309.txt	200	25265	f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207	https://www.rfc-editor.org/rfc/rfc9309.txt	20886	473fd7d6e946037b43ba27b88ba25796d645057507eb80b81f332785e1c004e5	0
fetch2	2026-10-26T12:26:29Z	https://www.rfc-editor.org/rfc/rfc9309.txt	200	25265	f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207	https://www.rfc-editor.org/rfc/rfc9309.txt	20886	473fd7d6e946037b43ba27b88ba25796d645057507eb80b81f332785e1c004e5	0
committed-receipt-bytes	2026-10-26T08:36:13Z (receipt fetched_at, seat FetchS119)	https://www.rfc-editor.org/rfc/rfc9309.txt	200	25265	f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207	https://www.rfc-editor.org/rfc/rfc9309.txt	20886	473fd7d6e946037b43ba27b88ba25796d645057507eb80b81f332785e1c004e5	n/a
fetch3-headers	2026-10-26T12:27:58Z	https://www.rfc-editor.org/rfc/rfc9309.txt	200	25265	f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207	https://www.rfc-editor.org/rfc/rfc9309.txt	20886	473fd7d6e946037b43ba27b88ba25796d645057507eb80b81f332785e1c004e5	0
html-metadata	2026-10-26T12:28:08Z	https://www.rfc-editor.org/rfc/rfc9309.html	200	82367	bbaa280636d3e38f0a1a130a5ce40e9753db1ed18c860945b0bf795ff8dc1a87	https://www.rfc-editor.org/rfc/rfc9309.html	—	—	0
```

Response headers on fetch3: `content-type: text/plain;charset=utf-8`, `cache-control: public, max-age=86400`, `etag: W/"25cf63a95f77e90b5d9b4e9f878e9951"`, no `last-modified`. The weak ETag with no revision marker is consistent with the entry's "changes by errata only" premise (it is a recheck-cadence argument, not part of the counted predicate).

Commands (all with `TMPDIR=/fast/scratch/hyaku/tabi-r31/RefetchS119`):

| # | command | exit |
|---|---|---|
| 1 | `curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 -o fetch1.txt -w "%{http_code}\t%{size_download}\t%{url_effective}" https://www.rfc-editor.org/rfc/rfc9309.txt` | 0 |
| 2 | same for `fetch2.txt` | 0 |
| 3 | `sha256sum fetch1.txt fetch2.txt <committed>/bytes/S119.txt` | 0 |
| 4 | `curl ... -D headers3.txt -o fetch3.txt ...` (headers capture) | 0 |
| 5 | `git clone --shared <lane> "$S/clone"; git -C "$S/clone" checkout -q 4860483…; git -C "$S/clone" rev-parse HEAD; git -C "$S/clone" status --porcelain \| wc -l` → `486048356f…`, `0` | 0 |
| 6 | `node analyze.mjs` (normalise via the counter's own `normalise`, see note) | 0 |
| 7 | `git -C clone show 4860483…:corpus/knowledge/rate-signal-decision-table.md > entry.md; node rows.mjs` | 0 |
| 8 | `node clone/scripts/check-decision-table.mjs --rev 4860483… --baseline 96a2d1a… --entry corpus/knowledge/rate-signal-decision-table.md --repo "$S/clone" --live --json > c1-live.json` | 0 |
| 9 | `node anchors.mjs` (anchor line-number verification) | 0 |
| 10 | `curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 -o rfc9309.html -w …  https://www.rfc-editor.org/rfc/rfc9309.html` | 0 |

Note on normalisation: `scripts/check-decision-table.mjs` calls `main()` unconditionally at module scope, so importing it as a library exits 2 (`usage:`). I imported a byte copy of the file with the trailing `main();` call removed (`norm-mod.mjs`, 28 294 of 28 302 bytes) and verified with `diff` that the extracted `export function normalise` block is byte-identical to the counter's (`normalise identical`, exit 0). The counter itself (command 8) ran unmodified in the clone.

### 2. Comparison

| buffer | bytes | raw sha256 | normalised chars | normalised sha256 |
|---|---|---|---|---|
| committed `bytes/S119.txt` | 25 265 | `f633915d…fb207` | 20 886 | `473fd7d6…c004e5` |
| fresh fetch 1 | 25 265 | `f633915d…fb207` | 20 886 | `473fd7d6…c004e5` |
| fresh fetch 2 | 25 265 | `f633915d…fb207` | 20 886 | `473fd7d6…c004e5` |

Raw equality holds across all three (and across fetch3). The receipt's `sha256`, `http_status: 200` and `bytes_path` therefore re-derive: `g3-bytes` would pass from my own bytes, and `normalise()` is a pure function of bytes, so normalised equality is verified rather than assumed.

### 3. Per-row quotes of the rows citing S119 (entry at REV, extracted by the counter's own quote regex)

| row | entry line | quote words | spans in cell | found in my fresh normalised bytes | char offset (0-based) | occurrences | force in quote | threshold cell | number/unit/bound in quote |
|---|---|---|---|---|---|---|---|---|---|
| D1 | 49 | 20 | 1 | yes | 13510 | 1 | SHOULD | `at least 5 redirects` | "at least five consecutive redirects" — 5, redirects, at least ✓ |
| D2 | 50 | 17 | 1 | yes | 13816 | 1 | MAY | `more than 5 redirects` | "more than five consecutive redirects … MAY assume … unavailable" — 5, redirects, more than ✓ |
| D3 | 51 | 20 | 1 | yes | 14648 | 1 | MAY | `30 days` | "(for example, 30 days) … MAY assume" — 30, days, **example (no bound)** — see note |
| D4 | 52 | 18 | 1 | yes | 15130 | 1 | SHOULD NOT | `more than 24 hours` | "SHOULD NOT … more than 24 hours, unless … unreachable" — 24, hours, more than ✓ |
| D5 | 53 | 10 | 1 | yes | 15332 | 1 | MUST | `at least 500 KiB` | "MUST be at least 500 kibibytes [KiB]" — 500, KiB, at least ✓ |

Offsets are identical in the committed normalised bytes and in both fresh normalised buffers (all three normalised strings are byte-identical). Quote lengths are 10–20 words, inside the counter's 6–25 band; the five quotes are pairwise distinct strings, so the round-1 hole "one quote repeated across rows" is not triggered here. Each threshold number is the source's own, with the unit and bound the quote states; each row's decision verb and its declared force match the quoted modal (the one row whose bound is not a bound — D3 — is discussed below).

D3 note (not a defect, disclosed): the source gives 30 days as an example ("for a reasonably long period of time (for example, 30 days)"), not as a bound. The row handles this correctly twice — signal cell: "for a long period — the period is the RFC's example value"; decision cell: "MAY treat the file as unavailable after the example period (or keep a cached copy)". Only the threshold cell alone (`30 days`) carries no "example" marker; the quote itself carries it, and the counter admits the row on the quoted number, which is the source's. The "before that, complete disallow applies" clause matches §2.3.1.4 line 402 (`MUST assume complete disallow`).

### 4. Registry anchor cell (SOURCES.md:133) against fresh and committed bytes

Anchors verified by substring inside the cited line ranges, in all three buffers (committed, fetch1, fetch2 — identical results, `anchors.out`):

| cited | claimed content | first line carrying it | verdict |
|---|---|---|---|
| §2.3.1.2 lines 373-385 | `2.3.1.2.  Redirects` | 373 | ✓ |
| 377-384 | `SHOULD follow at least five consecutive redirects` | 377 | ✓ |
| 377-384 | `more than five consecutive redirects` | 384 | ✓ |
| §2.3.1.3 lines 387-396 | `2.3.1.3.  "Unavailable" Status` | 387 | ✓ |
| 392 | `400-499` | 392 | ✓ |
| §2.3.1.4 lines 398-408 | `2.3.1.4.  "Unreachable" Status` | 398 | ✓ |
| 403 | `500-599` | 403 | ✓ |
| 406 | `30 days` | 406 | ✓ |
| §2.4 lines 415-420 | `2.4.  Caching` | 415 | ✓ |
| 419 | `more than 24 hours` | 419 | ✓ |
| §2.5 lines 422-425 | `2.5.  Limits` | 422 | ✓ |
| 425 | `500 kibibytes [KiB]` | 425 | ✓ |
| teaches-cell extras | `MAY access any resources` (394-396), `MUST assume complete disallow` (400-402), `MAY cache the fetched robots.txt` (417-418) | 395 / 402 / 417 | ✓ |

Registry header facts: `25265 B` ✓, sha256 ✓, `fetched 2026-10-26T08:36:13Z` ✓ (receipt), `status: mined` ✓, `used-by: corpus/knowledge/rate-signal-decision-table.md` ✓, tier/kind plausibly `spec`/`A`.

**Defect 1 — wrong publication date in the anchor cell (severity low–medium).** `corpus/SOURCES.md:133` states `RFC 9309 (June 2022)`. The committed bytes' own header, line 11, reads `September 2022`, and line 7 `Category: Standards Track`, line 27 `This is an Internet Standards Track document.` The HTML page fetched at 12:28:08Z agrees: `<td class="right">September 2022</td>` (line 1204) and `<time datetime="2022-09" class="published">September 2022</time>` (line 1223). Every `June 2022` occurrence in the fetched bytes and HTML belongs to the reference entries for RFC 9110 / RFC 9111 (`DOI 10.17487/RFC911[01]`, `<time datetime="2022-06" class="refDate">`), i.e. the date appears to have been lifted from the neighbouring references. Nothing in C1's counting predicate reads this date, so the claim's verdict is unaffected — but the anchor cell is the provenance record the claim rests on, and it misstates the source's date. Evidence: `date-check.txt` in the output dir.

### 5. Counter reading in my clean clone (context for C1, not a repair)

```
$ node clone/scripts/check-decision-table.mjs --rev 486048356f0712e4396588c9dab58cd419243120 \
    --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
    --entry corpus/knowledge/rate-signal-decision-table.md --repo "$S/clone" --live --json
exit 0
population 13  admitted 13  failing 0  clean true  live true
D1 49 S119 ADMITTED 5      D2 50 S119 ADMITTED 5      D3 51 S119 ADMITTED 30
D4 52 S119 ADMITTED 24     D5 53 S119 ADMITTED 500
D6–D11 S121 ADMITTED (1, 60, 5000, 100, 900, 90)   D12–D13 S122 ADMITTED (0, 1)
```

Written to a file (`> c1-live.json`, never piped to `jq`, per the round's note); `c1-live.err` is empty. Run in the scratch clone with porcelain empty; the lane checkout was only read.

### 6. Secondary defect — recheck cadence contradiction (severity low)

`corpus/knowledge/rate-signal-decision-table.md:8` states `recheck: 180d for S119 and S120 (standards-track RFC text …)`. The registry cells for those same rows say `365d`: `corpus/SOURCES.md:133` (S119) and `:134` (S120). The lane's own convention resolves which wins — `corpus/knowledge/source-recheck-round-18.md:7`: "a row's own `recheck` cell in `corpus/SOURCES.md` governs that row's check" — so the entry's 180d contradicts the governing value for both RFC rows, while agreeing with the registry on S121/S122 (90d both sides). No counter reads this: `scripts/check-sources.mjs:322` only validates the cell's shape (`/^[0-9]+d$/`, ISO date or `on-release`), and `scripts/check-frontier-admission.mjs:244` only requires that a `recheck:` line exists. Unguarded, therefore reportable.

## What this does not establish

- Only S119 is refetched here; S120–S122 and their rows are other seats' items.
- The frozen counter holes named in the wave-1 critiques (a quote repeated across rows, non-threshold numbers inside a quote, proxy/CA environment satisfying `--live`) are not repaired and not re-tested; here the five rows happen to be quote-distinct and their numbers are threshold numbers.
- No runtime behaviour of any host is exercised; every fetch above is a read-only public HTTPS GET to `www.rfc-editor.org`.
- The lane's tracked tree was never modified: `git -C <lane> status --porcelain` lists only untracked orchestrator wave state (`a2w1-dispatch.json`, `a2w1-spec.json`, `a2w1-validate.stderr`, `a2w1.ready`, `a2w1.ready.dispatched`) and the untracked `a2w1/` output directory; the lane checkout sits at `ae15a37ee8aa43964179a676a087604368cd1c41` (salvage tip), while every reading above was taken at `486048356f0712e4396588c9dab58cd419243120` in my clone. No index, jj state or tracked file touched; all work happened in `/fast/scratch/hyaku/tabi-r31/RefetchS119` and the output dir below.

## Artifacts

Written (all under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/a2w1/RefetchS119/`): `fetch-record.tsv`, `fetch1.txt`, `fetch2.txt`, `headers3.txt`, `analysis.json`, `rows.json`, `anchors.out`, `c1-live.json`, `c1-live.err`, `date-check.txt`. This report: `.ufo/waves/round-31/a2w1/RefetchS119.md`. Scratch `/fast/scratch/hyaku/tabi-r31/RefetchS119` removed on exit. No tools installed or upgraded.
