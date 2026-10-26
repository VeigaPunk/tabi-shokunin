# CritC1Verdict — does the landed C1 table meet the claim's intent, or only the frozen counter? (tabi round 31, a2w1)

**Verdict: `met`. C1's intent holds on the landed bytes, not only the counter — with a margin of 0–2 thresholds over the bar, so the closure must say "12 distinct" or "10 at the floor", never "13 thresholds".** I reproduced the frozen predicate at REV in a clean clone (exit 0, population 13, admitted 13, failing 0, live true), and it matches the L1 reading. I then counted criterion 80 myself, row by row, against receipt bytes I verified independently: **13 rows admit, carrying 12 distinct sourced thresholds (S119 5, S121 6, S122 2); the harshest defensible reading that follows criterion 80 still leaves 10** (drop the marked example period and the one cell whose unit the quote does not state). Wave 1's counter holes (repetition, status code as threshold, unit/bound unread, proxy/CA `--live`) are real and remain frozen, but the landed data **does not exercise any of them**: the 13 quotes are distinct, every threshold is the source's own number with the quote's bound polarity, every force limb is present as written or as a directive, and the committed receipts are the cited documents (RFCs byte-identical to my fetch; GitHub pages identical but for the page's own build id). Nothing the frozen rule depends on changed after seats scored: `scripts/` and `claims.json` are untouched between the freeze commit and REV, and the counter blobs hash to `frozenDigests`. Residual defects are cell-level and routable (below); none changes the admission count or the verdict.

## 1. The predicate, reproduced (not taken from the L1)

Clean clone of the lane at REV, porcelain empty, frozen counter digests:

```
git clone -q --shared …/tabi-shokunin $S/clone && git -C $S/clone checkout -q 486048356f0712e4396588c9dab58cd419243120   # exit 0
git -C $S/clone status --porcelain | wc -l                        # 0
sha256sum $S/clone/scripts/check-decision-table.mjs               # d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832 = frozenDigests
sha256sum $S/clone/scripts/check-selfassessment.mjs               # 143d66ff…dadb2fce = frozenDigests
node scripts/check-decision-table.mjs --rev 486048356f… --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
     --entry corpus/knowledge/rate-signal-decision-table.md --live --json > $S/c1-live.json                  # exit 0
jq '{population,admitted,failing,clean,live,entryPresent}' $S/c1-live.json
  {"population":13,"admitted":13,"failing":0,"clean":true,"live":true,"entryPresent":true}
node scripts/check-decision-table.mjs --selftest --json           # exit 0; {"cases":34,"passed":34,"ok":true}
```

Raw reading: `.ufo/waves/round-31/a2w1/CritC1Verdict/c1-live-at-REV.json`; selftest beside it. The entry at REV has 13 table rows `D1`–`D13`, all admitted with `reason: null`; the counter's `threshold` values are 5, 5, 30, 24, 500, 1, 60, 5000, 100, 900, 90, 0, 1.

## 2. Did the L1 change anything the frozen rule depends on? No.

```
git diff --stat 9505a10eb80b2a0b273ebaba3f7f872ad302192d 486048356f… -- scripts/ .ufo/waves/round-31/claims.json
  (no output; exit 0)
git diff --numstat 9505a10e… 4860483… -- scripts/ .ufo/waves/round-31/claims.json
  (no output; exit 0)
```

Kill-rule conditions checked: counter exit 0 (not 2); `scripts/check-decision-table.mjs` sha256 at REV `d15f3bd7…` = `frozenDigests`; no `scripts/` change; `claims.json` unchanged. The freeze-to-REV numstat is **all insertions, zero deletions** — `SCORECARD.md 4/0, SKILL.md 22/0, corpus/QUALITY.md 28/0, corpus/README.md 25/0, corpus/SOURCES.md 4/0, evidence ×4 + bytes ×4, entry 172/0, lesson 294/0`. The lane branch tip `ae15a37e` is one salvage commit above REV and changes **0 non-`.ufo` paths** (`git diff --name-only 4860483 ae15a37 | grep -vc '^\.ufo/'` → 0), so the landed corpus is exactly the integrated tree.

The one thing the L1 did author after wave 1 is QUALITY criteria 80–81, in the data commit. That does not touch the predicate: criterion 80 is **stricter** than the counter (`failing 0` is "necessary, not sufficient") and its first clause states the counter's holes. It cannot have relaxed an admission. Its only widening clause is the example-period carve-out; I tested the verdict without it (see §3, floor count 11 before D12's unit is judged), so the verdict does not rest on an authored exemption.

## 3. My own criterion-80 count (`corpus/QUALITY.md:457-469`)

All 13 quotes were located twice — in the committed receipt bytes at REV and in **my own** read-only fetches (`curl -q -sS --proto =https`; no proxy/cert/PATH override in my shell: `env | grep -iE 'proxy|SSL_CERT|CURL|CA_BUNDLE'` exit 1). Per-row audit: `.ufo/waves/round-31/a2w1/CritC1Verdict/rows-audit.tsv`.

| row | threshold | source's own number | bound | unit as quoted | force | marker |
|---|---|---|---|---|---|---|
| D1 | at least 5 redirects | "at least five consecutive redirects" | ✓ | redirects | SHOULD | — |
| D2 | more than 5 redirects | "more than five consecutive redirects" | ✓ | redirects | MAY | — |
| D3 | 30 days | "(for example, 30 days)" | n/a | days | MAY | example named in Signal+Decision |
| D4 | more than 24 hours | "more than 24 hours" | ✓ | hours | SHOULD NOT | — |
| D5 | at least 500 KiB | "at least 500 kibibytes [KiB]" | ✓ | KiB | MUST | — |
| D6 | at least 1 minute | "at least one minute" | ✓ | minute | directive "wait … before retrying" | — |
| D7 | 60 requests | "60 requests per hour" | declared | requests/hour | declared limit | `(derived)` |
| D8 | 5,000 requests | "5,000 requests per hour" | declared | requests/hour | declared limit | `(derived)` |
| D9 | no more than 100 concurrent | "No more than 100 concurrent requests" | ✓ | concurrent requests | declared limit | `(derived)` |
| D10 | no more than 900 points | "No more than 900 points per minute" | ✓ | points/minute | declared limit | `(derived)` |
| D11 | no more than 90 seconds | "No more than 90 seconds of CPU time per 60 seconds of real time" | ✓ | seconds | declared limit | `(derived)` |
| D12 | 0 requests | "…header is 0 , you should not make another request…" | n/a | **none stated** | directive | — |
| D13 | at least 1 second | "wait at least one second between each request" | ✓ | second | directive | — |

Counted under criterion 80: **13 rows / 12 distinct thresholds**. Distinctness is 12 because **D1 and D2 are two rows on one number, one source, one unit** (5 redirects, S119) — 13 distinct *quotes*, 12 distinct *thresholds*. Floor readings:

- refuse the example period (D3) and the fabricated unit (D12): **10 distinct** — still at the bar.
- also refuse D2 as "a second row on one number": distinct count unchanged (D1 keeps the 5), 12 → **10 or 11** depending on the D3/D12 call.
- require four sources (wave-1's proposed correction): the table cites three (S119, S121, S122; S120 prose only) — this would fail, but four sources was **never in the frozen claim**; the claim's surface says *each row* cites a row opened this round.

So "met" is not a counter artefact: on the strictest reading that still applies criterion 80 as written, the table has exactly 10 genuine, distinct, sourced thresholds, and on the plain reading 12.

## 4. Wave-1's holes, re-tested against the landed rows (none exercised)

| wave-1 hole (freeze counter) | landed table at REV |
|---|---|
| one sentence reused for N rows (CritC1Axis Q2, CritC1Counter B) | 13 rows, **13 distinct quotes**; no quote repeats |
| status code / RFC number / section number as "threshold" (A3, A5, A6) | no threshold cell is a status code, RFC number or section number; each is a quantity in its own quote |
| unit is the author's (A1) | 12 of 13 units are the quote's own; one exception, D12 (§5) |
| bound inverted (A2) | every bound matches the quote's polarity (`at least`/`more than`/`no more than`) |
| receipt bytes need not be the cited document (C) | **closed independently**: S119/S120 byte-identical to my fetch; S121/S122 differ in exactly 3 spans each, all the Next.js build id (`ltuTboUIVptrdqXZZauaN`/`fLcjPgBz_YHwhrus9wIPY` vs `xU-2nvoRQaQJjVgNhAf2O`) — see `byte-provenance.txt`. (That is also why three seats record three digests for the same 337,116-byte page.) |
| proxy/CA can satisfy `--live` (SentinelC1Live) | my clean-env `--live` run passed, and my own fetches independently carry all 13 quotes; the landed table does not need the hole |

## 5. Defects found (findings only; not repaired)

1. **Low — D1/D2 share one threshold number, and the lesson says that class was refused.** `.ufo/…/lesson round-31.md` Gate section: "kept the robots rows D1, D3–D6 of ScribeRowsRobots (its D2 restates D1's five-redirect bound under MUST and was dropped as a second row on one number)". The dropped draft row was a *distinct quote* ("If a robots.txt file is reached within five consecutive redirects, the robots.txt file MUST be fetched, parsed, and its rules followed") on the same number. The landed table keeps the two-sided pair `at least 5` (D1) / `more than 5` (D2) — two distinct quotes, two genuine decisions, one number and one source — so the rule as written ("a second row on one number") would have refused landed D2 too. Either reading is defensible; what is not is closing with both the rule and the count it implies. 13 admitted rows are 12 distinct thresholds, and the closure sentence must not equate the two.
2. **Low — D12's Threshold cell supplies a unit the quote does not state.** Quote: "the x-ratelimit-remaining header is 0 , you should not make another request…"; cell: `0 requests`. This is wave-1's A3 class in its mild form (the *number* is genuine; the *unit* is the author's). Also the Decision cell says "SHOULD strength" for a lowercase `should` — the row qualifies under criterion 80's directive limb, not as an RFC 2119 keyword.
3. **Low — D7/D8/D10 drop the rate window, D9 truncates the noun.** Threshold cells read `60 requests`, `5,000 requests`, `900 points`, `100 concurrent` where the quotes state `requests per hour`, `requests per hour`, `points per minute`, `concurrent requests`. Read alone, `60 requests` is a count, not a rate; the window lives in the Decision cell ("per hour"/"per minute"), so the row is not wrong but the Threshold cell is not the source's unit.
4. **Low — D13's located quote omits the condition its Signal rests on.** The signal says "mutative requests in a series"; the quoted fragment is "wait at least one second between each request." The condition is the earlier clause of the same sentence in the bytes: "If you are making a large number of POST , PATCH , PUT , or DELETE requests, wait at least one second between each request." (`S122.html:45`). Scope is named by the row and by the section heading; the quote alone does not bind it.
5. **Info — the lesson lists a span that cannot source a row.** Lesson "Further located spans", S121 `:143` "you will receive a 403 or 429 response, and the x-ratelimit-remaining header will be 0": that text exists only inside the `__NEXT_DATA__` script payload (escaped `\u003c…`), which `normalise()` strips — a row quoting it would fail `q2-quote-located`. The lesson should not read as admitting it.
6. **Info — the claim's surface parenthetical is narrower than the table.** "each row maps an observable signal (status code, response header, robots.txt fetch condition)": D9–D11 and D13 are client-side, pre-request conditions (fan-out, points, CPU-time proxy, request class), not response observations. The entry's own prose states this honestly ("Request-time caps are applied before a request, not after a response"), so this is claim prose, not entry error.
7. **Governance (carried, not a defect of this data) — the predicate stays porous.** The frozen counter at REV is byte-identical to the one wave 1 falsified, so the pad/bogus classes would still admit at REV; the landed table simply does not contain them. Any later row addition is unguarded until counter v2 lands (lesson M10: "not landed … carried"). Depth may be credited on this entry; the instrument remains a known-weak one.

## 6. Why not the other two verdicts

- **"met under the frozen rule with disclosed counter holes"** would be the honest verdict if the intent count had come out below 10 while the counter said 13. It did not: my independent count is 12 distinct thresholds, 10 at the harshest defensible exclusion set. The holes are disclosed and unrouted into the predicate, but they are not load-bearing for this landing.
- **"not verified"** does not apply: counter exit 0 with the frozen digests, no `scripts/` change, live run reproduced by me in a clean clone with a clean network environment, and every quote independently re-located in my own fetches.

## 7. Commands run (exit codes as observed)

```
git clone --shared …/tabi-shokunin $S/clone; git -C $S/clone checkout -q 486048356f…          # 0 / 0
git -C $S/clone status --porcelain | wc -l                                                    # 0
sha256sum $S/clone/scripts/{check-decision-table,check-selfassessment}.mjs                    # d15f3bd7…, 143d66ff… (= frozenDigests)
node scripts/check-decision-table.mjs --rev 486048356f… --baseline 96a2d1a3… --entry corpus/knowledge/rate-signal-decision-table.md --live --json > $S/c1-live.json   # 0; 13/13/0 live
node scripts/check-decision-table.mjs --selftest --json                                       # 0; 34/34
git diff --stat 9505a10e… 4860483… -- scripts/ .ufo/waves/round-31/claims.json                # 0, empty
git diff --numstat 9505a10e… 4860483…                                                          # 0; zero deletions anywhere
git diff --name-only 4860483… ae15a37e… | grep -vc '^\.ufo/'                                   # 0
curl -q -sS --proto =https -L --max-time 60 -o body-<n> -w '%{http_code}' <each of the four URLs>   # 200 each; 25265/17164/337116/328088 B
cmp -l <fresh> <committed evidence bytes> (per file)                                           # RFCs identical; GitHub pages 63 differing bytes = build id only
python: normalise(committed bytes) and fresh bodies, locate all 13 row quotes                  # 13/13 in both
```

Fetch receipts (URL, UTC, status, bytes, sha256) in `.ufo/waves/round-31/a2w1/CritC1Verdict/fetch-receipts.txt`; the counter reading and selftest in the same directory. No lane tracked file, index, jj state, sibling repo or fleet path was written; read-only git only in the lane. Scratch `/fast/scratch/hyaku/tabi-r31/CritC1Verdict` deleted after copying receipts. **Tooling:** none installed or upgraded (`node 24.21.0`, `git`, `curl 8.23.0` already present).
