# RowAttackD5D6 — C1 rows D5 (RFC 9309 500 KiB) and D6 (GitHub one-minute fallback)

**Verdict (one paragraph).** Both rows **hold on all seven letters**. D5 quotes RFC 9309 line 425 verbatim ("The parsing limit MUST be at least 500 kibibytes [KiB]."), and its threshold (`at least 500 KiB`) is that sentence's own number, unit and bound; §3 line 441 corroborates the direction the row claims ("Section 2.5 defines the lower limit of bytes that must be processed"), so "a floor, not a ceiling" is the RFC's reading, not the author's. D6 quotes S121's else-branch verbatim ("Otherwise, wait for at least one minute before retrying.", HTML line 144) and its threshold (`at least 1 minute`) is that branch's own wait; the branch conditions the row states in its Signal cell (403/429, no `retry-after`, `x-ratelimit-remaining` not `0`) are exactly the negation of the two tests on the same line, and I could not build a counterexample that the source's structure excludes. Neither row is a restatement of another row. What I do find is **four low-severity wording/phrasing defects** (D5's Signal is not a conditioning signal in the source; D5's Decision omits the `SHOULD impose a parsing limit` premise; D6's "last-resort" label is contradicted by the sentence that follows it on the same line; D6's "after `retry-after` and `x-ratelimit-reset`" names a branch by its action field instead of its condition), plus one low-severity **entry-prose** inconsistency next to D6 ("neither field is present" vs the row's own "remaining not `0`") and one low-severity **registry-anchor** gap (S121's anchor names line 144 only as "retry-after", not as the one-minute figure). No high or moderate defect: no axis is harmed beyond the depth wording that these cells themselves carry. Separately, and worth recording because it bounds what the round's `admitted = 13` can mean: the frozen counter admits both of these rows **with their decisions inverted** (fixture rev `23d9d2e6…`, live, exit 0), so the counter's count is evidence of location and number-in-quote only; the semantics below are the only check the rows have had.

Attacked: `corpus/knowledge/rate-signal-decision-table.md` at `486048356f0712e4396588c9dab58cd419243120`, table rows on lines 53 (D5) and 54 (D6). Sources re-opened live: S119 (`www.rfc-editor.org/rfc/rfc9309.txt`) and S121 (`docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api`). Nothing in this report repairs anything.

---

## Provenance established before reading the rows

- Lane revision under test: `4860483` (clone `git rev-parse HEAD` = `486048356f0712e4396588c9dab58cd419243120`, `git status --porcelain` = 0 lines).
- Counter bytes at that revision: `sha256sum scripts/check-decision-table.mjs` = `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832` = `frozenDigests` in `claims.json`.
- Frozen counter run (output redirected to a **file**, per the assignment's warning about `jq` on a pipe):

```
node scripts/check-decision-table.mjs --rev 4860483… --baseline 96a2d1a3… \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json > $S/c1.json
# exit 0   {"population":13,"admitted":13,"failing":0,"live":true}
# D5 line 53 admitted=true reason=null threshold=500
# D6 line 54 admitted=true reason=null threshold=1
```

- Committed receipts hash-check (independent of the counter):

```
S119  receipt sha256 f633915d…  bytes/S119.txt  sha256 f633915d…   (match)
S121  receipt sha256 3a33f87b…  bytes/S121.html sha256 3a33f87b…   (match)
```

- Live re-fetch (read-only GET, this seat): S119 is **byte-identical** to the committed receipt (`f633915d…`); S121 differs from its receipt (`3a33f87b…` → `47031376…`) in exactly two lines (HTML 32 and 151, Next.js chunk/footer markup) while the article region that holds D6's branch (HTML 142–151) is identical — consistent with S119/S121's registry notes. Fetch receipts: `…/a2w1/RowAttackD5D6/fetch-receipts.txt`.

---

## D5 — `robots.txt` body size → limit, `at least 500 KiB` (S119, entry line 53)

Row as landed:

```
| D5 | `robots.txt` body size | limit — MUST keep the parsing limit at least this high; a floor, not a ceiling (RFC 9309 §2.5) | at least 500 KiB | S119 | "The parsing limit MUST be at least 500 kibibytes [KiB]." |
```

Source, RFC 9309, exact lines of the live bytes (= receipt bytes):

```
422:2.5.  Limits
424:   Crawlers SHOULD impose a parsing limit to protect their systems; see
425:   Section 3.  The parsing limit MUST be at least 500 kibibytes [KiB].
...
441:   Memory management:  Section 2.5 defines the lower limit of bytes that
442:      must be processed, which inherently also protects the parser from
443:      out-of-memory scenarios.
```

| Letter | Verdict | Evidence |
|---|---|---|
| (a) quote verbatim and located | **holds** | The 10-word span is a substring of the normalised receipt and of the live page; the raw bytes at line 425 read `   Section 3.  The parsing limit MUST be at least 500 kibibytes [KiB].` — the row's cell is the second sentence exactly, including the bracketed `[KiB]` (defined at line 564). |
| (b) threshold number is the bounded quantity | **holds** | 500 is the value of the parsing limit the quote bounds, not a status code, section number, document number or year. §3 line 441 independently glosses §2.5 as "the lower limit of bytes that must be processed", i.e. the same quantity. |
| (c) unit and bound word | **holds** | Quote: "at least 500 kibibytes [KiB]". Row: `at least 500 KiB`. Bound word identical (`at least`), unit identical (`kibibytes` / the RFC's own `[KiB]`). No `more than`/`no more than` substitution. |
| (d) verb and force | **holds, with a low-severity omission** | Verb `limit` is the row's closed-set action, and the force is the RFC's own capitalised `MUST` in the quote. What the quote alone does not carry is line 424, `Crawlers SHOULD impose a parsing limit …`: the `MUST` is conditional on having a limit at all. The row says "MUST keep the parsing limit at least this high" — correct for the value — but a driver that imposes no parsing limit satisfies the quoted `MUST` and breaks the `SHOULD` on line 424, and nothing in the row or the entry prose says so. **Low.** |
| (e) signal is an observable the driver has | **holds, with a low-severity form defect** | The body size of a fetched `robots.txt` is observable (content length / bytes read). But the normative sentence is unconditional: no observed body size changes the action, so the cell is a label rather than a trigger, unlike D4 where cache age crosses the 24-hour bound. Mitigation already in the row: "a floor, not a ceiling" closes the dangerous misreading (truncate at 500 KiB), which the RFC does not license — §2.5 + §3-441 require the parser to accept at least that many bytes. **Low.** |
| (f) scope stated | **holds at entry level, not in the cell** | The cell cites `(RFC 9309 §2.5)` — a section, not a client class. The crawler-vs-browser caveat is stated in the entry's `U4` ("the robots.txt apply rule is a crawler rule … a row in that group applies only where a driver chooses to fetch the file") and in `Limits`. This is uniform across D1–D4, so it is not a D5-specific defect. **Low note.** |
| (g) distinct from every other row | **holds** | Thresholds across the table are 13 distinct values (`at least 5 redirects`, `more than 5 redirects`, `30 days`, `more than 24 hours`, `at least 500 KiB`, `at least 1 minute`, `60 requests`, `5,000 requests`, `no more than 100 concurrent`, `no more than 900 points`, `no more than 90 seconds`, `0 requests`, `at least 1 second`); all 13 located quotes are distinct. D5 bounds the parser's size floor; D4 bounds cache age; D3 bounds the unreachable period. |

Context read for omissions: the §2.5 paragraph contains no exception, no "for example" and no "in general"; the surrounding sentences (parsing errors §2.3.1.5, caching §2.4) do not qualify it. The only omitted sentence, line 424, is the one named under (d).

**D5 overall: holds. Low defects: (d) omission of the `SHOULD impose a parsing limit` premise; (e) signal is not a condition of the source's sentence. Scope note (f).**

Smallest safe corrections (not applied): add to the Decision cell `; SHOULD impose a parsing limit at all (RFC 9309 §2.5 first sentence)`; reword the Signal cell to `robots.txt body bytes (parser must read at least 500 KiB)` or `robots.txt body larger than the parser's configured limit` so the cell names a trigger.

---

## D6 — rate-limited `403`/`429` → wait, `at least 1 minute` (S121, entry line 54)

Row as landed:

```
| D6 | rate-limited `403` or `429` with no `retry-after` and `x-ratelimit-remaining` not `0` | wait — at least this long before retrying; the vendor's last-resort branch after `retry-after` and `x-ratelimit-reset` (GitHub REST API policy) | at least 1 minute | S121 | "Otherwise, wait for at least one minute before retrying." |
```

Source, S121 HTML (receipt and live identical in this region), §Exceeding the rate limit, line 142 heading; the paragraph spanned by lines 143–144 normalises to:

```
[143] If you exceed your primary rate limit, you will receive a 403 or 429 response, and the
      x-ratelimit-remaining header will be 0. You should not retry your request until after the
      time specified by the x-ratelimit-reset header.
[144] If you exceed a secondary rate limit, you will receive a 403 or 429 response and an error
      message that indicates that you exceeded a secondary rate limit. If the retry-after
      response header is present, you should not retry your request until after that many
      seconds has elapsed. If the x-ratelimit-remaining header is 0, you should not retry your
      request until after the time, in UTC epoch seconds, specified by the x-ratelimit-reset
      header. Otherwise, wait for at least one minute before retrying. If your request continues
      to fail due to a secondary rate limit, wait for an exponentially increasing amount of time
      between retries, and throw an error after a specific number of retries.
[145] Continuing to make requests while you are rate limited may result in the banning of your
      integration.
```

| Letter | Verdict | Evidence |
|---|---|---|
| (a) quote verbatim and located | **holds** | 9-word span, byte-for-byte at HTML line 144 of both the committed receipt and the live page (the article region is identical across the two fetches; only lines 32/151 differ). The same sentence also appears in S122 at its line 51 as a list item — D6 cites S121, where the sentence is present, so the citation is correct as written. |
| (b) threshold number is the bounded quantity | **holds** | 1 is the wait duration the quote bounds. The status codes in the row (`403`, `429`) sit in the Signal cell, outside the quote and outside the Threshold cell; the threshold cell contains no status code, section number, document number or year. |
| (c) unit and bound word | **holds** | Quote: "at least one minute"; row: `at least 1 minute`. Bound word `at least` and unit `minute` are the source's own; no `no more than`/`at most` drift. |
| (d) verb and force | **holds, with a low-severity label defect** | Verb `wait` is the quote's own imperative. Force: the quote carries no capitalised RFC 2119 keyword and the row claims none — it labels the sentence "(GitHub REST API policy)", which is the vendor-directive class; the neighbouring branch sentences use "you should not", so a bare "wait" is the weaker of the vendor's own forms and the row does not inflate it. **Defect:** "the vendor's last-resort branch" is contradicted by the sentence three clauses later on the same line — the last resort is "an exponentially increasing amount of time between retries, and throw an error after a specific number of retries". The one-minute wait is the *else* of the two header tests, not the last resort. **Low** (the entry's prose immediately below states the exponential rule, so the entry as a whole is not misleading; the cell is). A second, smaller imprecision: "after `retry-after` and `x-ratelimit-reset`" names branch 2 by its action field; branch 2's condition is `x-ratelimit-remaining` = 0, whose action cites `x-ratelimit-reset`. The Signal cell states the conditions correctly, so this is a parenthetical confusion only. **Low.** |
| (e) signal is an observable the driver has | **holds** | All three observables are on the response: the status code, the absence of `retry-after`, and `x-ratelimit-remaining` ≠ 0 (the page warns against logic depending on an *exact* remaining count, not against the zero test, which its own next sentence uses). Strongest counterexample I could construct: a permission `403` that carries `x-ratelimit-remaining` on a host whose policy differs — the row's guard word "rate-limited" excludes it, and S122's parallel rendering of the same rule states the precondition as "If you receive a rate limit error", confirming the vendor frames the branch that way. **Note, low:** on the page D6 cites, the block's own discriminator is the body text ("an error message that indicates that you exceeded a secondary rate limit") and the row does not name it; the row instead reaches the same branch through the negation of the two header tests, which is sound for S121 because line 143 guarantees `remaining = 0` for a primary limit. |
| (f) scope stated | **holds** | "(GitHub REST API policy)" names the vendor and implicit client class (REST API, not a browser session — a browser journey never holds `x-ratelimit-*`); the entry header pins the access date (fetched 2026-10-26) and `Limits` states "One vendor, at one access date" plus the no-portability caveat. |
| (g) distinct from every other row | **holds** | D6 is the complement of D12 (`x-ratelimit-remaining` = 0 → stop until `x-ratelimit-reset`): the two never apply to the same response, and neither restates the other. It does not overlap D7–D11 (published ceilings) or D13 (`at least 1 second` between mutative requests). No other row quotes this sentence. |

Context read for omissions: the branch is nested inside the secondary-limit sentence on line 144 and is immediately followed by the exponential/throw sentence (line 144) and the ban warning (line 145). Of those three, the row's own cell omits the nesting (see (e)) and mislabels the follow-on rule as not existing (see (d)); the entry's prose carries the exponential rule and the ban warning, so no meaning is lost at entry level.

**D6 overall: holds. Low defects: (d) "last-resort" label and the branch-name/condition mismatch.**

Smallest safe corrections (not applied): replace "the vendor's last-resort branch after `retry-after` and `x-ratelimit-reset`" with "the vendor's else-branch when `retry-after` is absent and `x-ratelimit-remaining` is not `0`"; optionally add the source's own discriminator to the Signal cell (`an error message naming a secondary limit`).

---

## Adjacent findings inside the same surface (low)

1. **Entry prose contradicts D6's own condition.** `rate-signal-decision-table.md`, "How a journey driver uses it": "Only when neither field is present does the fallback apply — a wait of at least one minute". The source's else-branch tests `retry-after` absent **and** `x-ratelimit-remaining` ≠ 0, not the absence of both headers (`x-ratelimit-reset` is normally present). The row's cell is right; the prose sentence is loose. **Low.** Fix: "Only when `retry-after` is absent and `x-ratelimit-remaining` is not `0` does the fallback apply".
2. **S121's registry anchor does not name D6's figure.** `corpus/SOURCES.md:135` records "§Exceeding the rate limit at line 142 (403 or 429 with x-ratelimit-remaining 0 at line 143, retry-after at line 144)". D6's quote is on line 144 too, so provenance is intact, but the anchor never names the one-minute fallback a row depends on — compare S122's anchor, which does ("otherwise one minute and exponentially increasing waits at line 51"). **Low**; verified line numbers: 422 (§2.5) and 425 (500 KiB) for S119 are exact as recorded.

## What the round's counter does and does not establish (bounds the `admitted = 13` reading)

I built the strongest local counterexample against "the counter's admitted count means these rows are right": a fixture that keeps **both located quotes unchanged** and inverts **both decisions** —

```
| D1 | `429` response | stop — do not retry at all, ever (fixture: inverted force) | at least 1 minute | S121 | "Otherwise, wait for at least one minute before retrying." |
| D2 | `robots.txt` body size | cap — truncate the body at this size (fixture: floor read as ceiling) | at least 500 KiB | S119 | "The parsing limit MUST be at least 500 kibibytes [KiB]." |
```

Run against the frozen counter, live:

```
node scripts/check-decision-table.mjs --rev 23d9d2e63f3ec06e219d060d8fad5ce96da5bf2a \
  --baseline 96a2d1a3… --entry corpus/knowledge/zz-attack-d56.md --live --json > $S/fixture-inverted.json
# exit 0   {"population":2,"admitted":2,"failing":0}
# D1 admitted=true threshold=1   D2 admitted=true threshold=500
```

So `admitted = 13` proves quote location and number-in-quote for D5/D6 (and their registry/receipt provenance); it proves nothing about direction, force, condition, scope or distinctness. The seven-letter reading above is the only semantic check these two rows have received this round, and it is the part that must be repeated if the rows are later edited. Fixture patch: `…/a2w1/RowAttackD5D6/fixture-inverted.patch` (commit `23d9d2e6…`, made inside this seat's scratch clone only; clone restored to `4860483`, porcelain 0).

---

## Impacted axes

- **depth** (primary): the four low defects are all in the two cells that carry depth (D5's unconditional-signal phrasing and its omitted `SHOULD` premise; D6's "last-resort" mislabel and branch-name/condition mismatch). None removes a sourced number or a correct force; the axis gain stands.
- **calibration** (secondary, note only): the frozen counter cannot see (b)–(g); its `admitted = 13` is a location-and-number check. Named here so a later round does not read the count as a semantic verdict. No C2 document is touched by this finding.
- **adjacency**: no change — S119 is RFC 9309 (already held as vocabulary in round 27's redirect/Retry-After work) and S121 is a vendor page already opened this round; D5/D6 add numbers, not new provinces.
- No coverage, freshness or operability harm found.

---

## Commands run (with exit codes)

```
git clone --shared …/tabi-shokunin $S/clone && git -C $S/clone checkout -q 4860483…    # exit 0; rev-parse = 4860483…, porcelain 0
sha256sum $S/clone/scripts/check-decision-table.mjs                                    # d15f3bd7… = frozenDigests
curl -q -sS --proto =https -o live/S119.bin  https://www.rfc-editor.org/rfc/rfc9309.txt                                  # 200, 25265 B, f633915d…
curl -q -sS --proto =https -o live/S121.bin  https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api  # 200, 337116 B, 47031376…
diff <receipt S121.html> <live S121.bin>                                               # exit 1; 10 diff lines, only HTML 32 and 151
node $S/verify.mjs   # normalise() replica: D5 words=10 located receipt/live=true, digits [500], bound "at least"+"MUST"
                     #                    D6 words=9  located receipt/live=true, number-word one=1, bound "at least", no force keyword
                     # exit 0
sha256sum bytes/S119.txt bytes/S121.html vs receipt .json                              # both match (f633915d…, 3a33f87b…)
node scripts/check-decision-table.mjs --rev 4860483… --baseline 96a2d1a3… --entry corpus/knowledge/rate-signal-decision-table.md --live --json > $S/c1.json
                     # exit 0; population 13, admitted 13, failing 0; D5 line 53 thr=500, D6 line 54 thr=1
node scripts/check-decision-table.mjs --rev 23d9d2e6… --baseline 96a2d1a3… --entry corpus/knowledge/zz-attack-d56.md --live --json > $S/fixture-inverted.json
                     # exit 0; population 2, admitted 2 (both decisions inverted)
node -e '…quote/threshold dump of the landed table…'                                   # exit 0; 13 rows, 13 distinct quotes, 13 distinct thresholds
```

No tool was installed or upgraded (no pacman, no uv/npx); no network beyond the two read-only HTTPS GETs above; no subagent dispatched; no lane tracked file, index or jj state written; scratch clone `/fast/scratch/hyaku/tabi-r31/RowAttackD5D6/` removed after the receipts above were copied into `…/a2w1/RowAttackD5D6/`.

Evidence files in `…/a2w1/RowAttackD5D6/`: `fetch-receipts.txt`, `verify.mjs`, `verify-out.txt`, `c1.json`, `fixture-inverted.json`, `fixture-inverted.patch`, `d6wrapped.txt`.
