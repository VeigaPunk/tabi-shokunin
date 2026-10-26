# MutC1Counter — mutation table: frozen counter `scripts/check-decision-table.mjs` vs its own `--selftest`

Detector = the counter's own `--selftest` (34 cases), run per mutant with `TMPDIR` in scratch.
Pristine: exit 0, `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34`, before and after all runs.
Result: **44 killed / 16 survived / 60 total**.

Verdict classes: KILLED(case-fail) = at least one self-test case reports FAIL; KILLED(crash) = the mutated
script aborts the self-test with an uncaught exception (exit 1, no per-case report; killing case inferred
from case order + stack line); SURVIVED = 34/34 cases PASS, exit 0.

| # | mutant | target | change | verdict | killing case(s) / evidence | diff |
|---|--------|--------|--------|---------|----------------------------|------|
| 1 | `t1-drop` | t1-row-id | check deleted (row id `D<n>` + uniqueness) | KILLED | `row-id-duplicate` (expected exit 1, got 0, admitted 2, reason None) | [diffs/t1-drop.diff](diffs/t1-drop.diff) |
| 2 | `t1-invert` | t1-row-id | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason t1-row-id) +28 more failing cases | [diffs/t1-invert.diff](diffs/t1-invert.diff) |
| 3 | `t2-drop` | t2-signal | check deleted | KILLED | `signal-without-token` (expected exit 1, got 0, admitted 1, reason None) | [diffs/t2-drop.diff](diffs/t2-drop.diff) |
| 4 | `t2-weaken` | t2-signal | backtick-token requirement weakened to any non-empty cell (`[^`]+` -> `.`) | KILLED | `signal-without-token` (expected exit 1, got 0, admitted 1, reason None) | [diffs/t2-weaken.diff](diffs/t2-weaken.diff) |
| 5 | `t3-drop` | t3-decision | check deleted | KILLED | `decision-outside-set` (expected exit 1, got 0, admitted 1, reason None) | [diffs/t3-drop.diff](diffs/t3-drop.diff) |
| 6 | `t3-invert` | t3-decision | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason t3-decision) +28 more failing cases | [diffs/t3-invert.diff](diffs/t3-invert.diff) |
| 7 | `t4-drop` | t4-threshold | guard deleted (tm null reaches tm[1]) | KILLED | selftest aborted, node exit 1; stack `t4-drop.mjs:274` | [diffs/t4-drop.diff](diffs/t4-drop.diff) |
| 8 | `t4-invert` | t4-threshold | condition inverted | KILLED | selftest aborted, node exit 1; stack `t4-invert.mjs:274` | [diffs/t4-invert.diff](diffs/t4-invert.diff) |
| 9 | `unit-boundwords-drop` | UNIT_RE | bound-word alternation (at least|at most|...|<=|>) deleted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 1, reason t4-threshold) +22 more failing cases | [diffs/unit-boundwords-drop.diff](diffs/unit-boundwords-drop.diff) |
| 10 | `unit-boundwords-weaken` | UNIT_RE | bound-word alternation reduced to `at least` only | SURVIVED | 34/34 PASS, exit 0 | [diffs/unit-boundwords-weaken.diff](diffs/unit-boundwords-weaken.diff) |
| 11 | `unit-digits-alt-drop` | UNIT_RE | `\d+(?:\.\d+)?` alternative deleted (only comma-form or 1-3 digit ints) | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason t4-threshold) +25 more failing cases | [diffs/unit-digits-alt-drop.diff](diffs/unit-digits-alt-drop.diff) |
| 12 | `unit-ksep-2` | UNIT_RE | thousands group `(?:,\d{3})+` -> `(?:,\d{2})+` | SURVIVED | 34/34 PASS, exit 0 | [diffs/unit-ksep-2.diff](diffs/unit-ksep-2.diff) |
| 13 | `unit-unanchored` | UNIT_RE | `^` anchor dropped | SURVIVED | 34/34 PASS, exit 0 | [diffs/unit-unanchored.diff](diffs/unit-unanchored.diff) |
| 14 | `r1-drop` | r1-row-missing | check deleted | KILLED | selftest aborted, node exit 1; stack `r1-drop.mjs:277` | [diffs/r1-drop.diff](diffs/r1-drop.diff) |
| 15 | `r1-invert` | r1-row-missing | condition inverted | KILLED | selftest aborted, node exit 1; stack `r1-invert.mjs:277` | [diffs/r1-invert.diff](diffs/r1-invert.diff) |
| 16 | `r1-regex-drop` | r1-row-missing | S-id shape disjunct deleted (registry lookup kept) | SURVIVED | 34/34 PASS, exit 0 | [diffs/r1-regex-drop.diff](diffs/r1-regex-drop.diff) |
| 17 | `r1-has-drop` | r1-row-missing | registry-lookup disjunct deleted (shape regex kept) | KILLED | selftest aborted, node exit 1; stack `r1-has-drop.mjs:277` | [diffs/r1-has-drop.diff](diffs/r1-has-drop.diff) |
| 18 | `r2-drop` | r2-status | check deleted | KILLED | `status-queued` (expected exit 1, got 0, admitted 1, reason None) | [diffs/r2-drop.diff](diffs/r2-drop.diff) |
| 19 | `r2-invert` | r2-status | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason r2-status) +23 more failing cases | [diffs/r2-invert.diff](diffs/r2-invert.diff) |
| 20 | `r3-drop` | r3-used-by | check deleted | KILLED | `used-by-omits-entry` (expected exit 1, got 0, admitted 1, reason None) | [diffs/r3-drop.diff](diffs/r3-drop.diff) |
| 21 | `r3-invert` | r3-used-by | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason r3-used-by) +22 more failing cases | [diffs/r3-invert.diff](diffs/r3-invert.diff) |
| 22 | `r4-drop` | r4-new-row | check deleted | KILLED | `row-present-at-baseline` (expected exit 1, got 0, admitted 1, reason None) | [diffs/r4-drop.diff](diffs/r4-drop.diff) |
| 23 | `r4-invert` | r4-new-row | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason r4-new-row) +21 more failing cases | [diffs/r4-invert.diff](diffs/r4-invert.diff) |
| 24 | `g1-drop` | g1-receipt | check disabled (`if (false)`) | KILLED | selftest aborted, node exit 1; stack `g1-drop.mjs:251` | [diffs/g1-drop.diff](diffs/g1-drop.diff) |
| 25 | `g1-idcheck-drop` | g1-receipt | `rc.id !== id` conjunct deleted (existence only) | SURVIVED | 34/34 PASS, exit 0 | [diffs/g1-idcheck-drop.diff](diffs/g1-idcheck-drop.diff) |
| 26 | `g1-invert` | g1-receipt | condition inverted | KILLED | selftest aborted, node exit 1; stack `g1-invert.mjs:251` | [diffs/g1-invert.diff](diffs/g1-invert.diff) |
| 27 | `g2-https-drop` | g2-url | https-scheme disjunct deleted | KILLED | `receipt-url-http` (expected exit 1, got 0, admitted 1, reason None) | [diffs/g2-https-drop.diff](diffs/g2-https-drop.diff) |
| 28 | `g2-inrow-drop` | g2-url | url-in-source-cell disjunct deleted | KILLED | `receipt-url-not-in-row` (expected exit 1, got 0, admitted 1, reason None) | [diffs/g2-inrow-drop.diff](diffs/g2-inrow-drop.diff) |
| 29 | `g2-invert` | g2-url | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason g2-url) +19 more failing cases | [diffs/g2-invert.diff](diffs/g2-invert.diff) |
| 30 | `g3-bytesnull-drop` | g3-bytes | `bytes === null` disjunct deleted | SURVIVED | 34/34 PASS, exit 0 | [diffs/g3-bytesnull-drop.diff](diffs/g3-bytesnull-drop.diff) |
| 31 | `g3-status-drop` | g3-bytes | `http_status !== 200` disjunct deleted | KILLED | `http-status-404` (expected exit 1, got 0, admitted 1, reason None) | [diffs/g3-status-drop.diff](diffs/g3-status-drop.diff) |
| 32 | `g3-sha-drop` | g3-bytes | sha256 equality disjunct deleted | KILLED | `bytes-sha-mismatch` (expected exit 1, got 0, admitted 1, reason None) | [diffs/g3-sha-drop.diff](diffs/g3-sha-drop.diff) |
| 33 | `g3-invert` | g3-bytes | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason g3-bytes) +17 more failing cases | [diffs/g3-invert.diff](diffs/g3-invert.diff) |
| 34 | `q1-drop` | q1-quote-length | check deleted | KILLED | `quote-too-short` (expected exit 1, got 1, admitted 0, reason q2-quote-located) +1 more failing cases | [diffs/q1-drop.diff](diffs/q1-drop.diff) |
| 35 | `q1-min-drop` | q1-quote-length | min-bound clause `words < 6` deleted | KILLED | `quote-too-short` (expected exit 1, got 1, admitted 0, reason q2-quote-located) | [diffs/q1-min-drop.diff](diffs/q1-min-drop.diff) |
| 36 | `q1-min-5` | q1-quote-length | min bound off-by-one 6 -> 5 | KILLED | `quote-too-short` (expected exit 1, got 1, admitted 0, reason q2-quote-located) | [diffs/q1-min-5.diff](diffs/q1-min-5.diff) |
| 37 | `q1-min-7` | q1-quote-length | min bound off-by-one 6 -> 7 | SURVIVED | 34/34 PASS, exit 0 | [diffs/q1-min-7.diff](diffs/q1-min-7.diff) |
| 38 | `q1-max-26` | q1-quote-length | max bound off-by-one 25 -> 26 | SURVIVED | 34/34 PASS, exit 0 | [diffs/q1-max-26.diff](diffs/q1-max-26.diff) |
| 39 | `q1-max-24` | q1-quote-length | max bound off-by-one 25 -> 24 | SURVIVED | 34/34 PASS, exit 0 | [diffs/q1-max-24.diff](diffs/q1-max-24.diff) |
| 40 | `q1-max-drop` | q1-quote-length | max-bound clause `words > 25` deleted | SURVIVED | 34/34 PASS, exit 0 | [diffs/q1-max-drop.diff](diffs/q1-max-drop.diff) |
| 41 | `q1-spans-drop` | q1-quote-length | single-span clause `spans.length !== 1` deleted | KILLED | `quote-two-spans` (expected exit 1, got 0, admitted 1, reason None) | [diffs/q1-spans-drop.diff](diffs/q1-spans-drop.diff) |
| 42 | `q1-invert` | q1-quote-length | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason q1-quote-length) +15 more failing cases | [diffs/q1-invert.diff](diffs/q1-invert.diff) |
| 43 | `q2-drop` | q2-quote-located | check deleted | KILLED | `quote-not-in-bytes` (expected exit 1, got 0, admitted 1, reason None) +1 more failing cases | [diffs/q2-drop.diff](diffs/q2-drop.diff) |
| 44 | `q2-invert` | q2-quote-located | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason q2-quote-located) +13 more failing cases | [diffs/q2-invert.diff](diffs/q2-invert.diff) |
| 45 | `n1-drop` | n1-threshold-sourced | check deleted | KILLED | `threshold-not-in-quote` (expected exit 1, got 0, admitted 1, reason None) +1 more failing cases | [diffs/n1-drop.diff](diffs/n1-drop.diff) |
| 46 | `n1-invert` | n1-threshold-sourced | condition inverted | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason n1-threshold-sourced) +11 more failing cases | [diffs/n1-invert.diff](diffs/n1-invert.diff) |
| 47 | `nw-boundary-drop` | NUMBER_WORDS boundary | word-boundary regex replaced by `lower.includes(w)` | KILLED | `number-word-needs-boundary` (expected exit 1, got 0, admitted 1, reason None) | [diffs/nw-boundary-drop.diff](diffs/nw-boundary-drop.diff) |
| 48 | `nw-boundary-hyphen` | NUMBER_WORDS boundary | boundary class `[^a-z-]` -> `[^a-z]` (hyphen no longer a boundary) | SURVIVED | 34/34 PASS, exit 0 | [diffs/nw-boundary-hyphen.diff](diffs/nw-boundary-hyphen.diff) |
| 49 | `l1-drop` | l1-live | live block disabled (`if (false)`) | KILLED | `live-self-quote-receipt` (expected exit 1, got 0, admitted 1, reason None) +3 more failing cases | [diffs/l1-drop.diff](diffs/l1-drop.diff) |
| 50 | `l1-invert` | l1-live | cache-verdict condition inverted | KILLED | `live-located` (expected exit 0, got 1, admitted 0, reason l1-live) +4 more failing cases | [diffs/l1-invert.diff](diffs/l1-invert.diff) |
| 51 | `live-cachekey-urlonly` | --live cache key | key = url only (quote dropped from key) | SURVIVED | 34/34 PASS, exit 0 | [diffs/live-cachekey-urlonly.diff](diffs/live-cachekey-urlonly.diff) |
| 52 | `live-effhttps-drop` | liveOk same-host/https | effective-url https-scheme test deleted (hostOf kept) | SURVIVED | 34/34 PASS, exit 0 | [diffs/live-effhttps-drop.diff](diffs/live-effhttps-drop.diff) |
| 53 | `live-samehost-drop` | liveOk same-host/https | hostOf equality test deleted (https test kept) | KILLED | `live-offhost-redirect` (expected exit 1, got 0, admitted 1, reason None) | [diffs/live-samehost-drop.diff](diffs/live-samehost-drop.diff) |
| 54 | `live-reqhttps-drop` | liveOk same-host/https | request-url https guard deleted | SURVIVED | 34/34 PASS, exit 0 | [diffs/live-reqhttps-drop.diff](diffs/live-reqhttps-drop.diff) |
| 55 | `live-code200-drop` | liveOk HTTP 200 | `res.code !== 200` deleted (null guard kept) | KILLED | `live-non-200` (expected exit 1, got 0, admitted 1, reason None) | [diffs/live-code200-drop.diff](diffs/live-code200-drop.diff) |
| 56 | `live-nullres-crash` | liveOk HTTP 200 | null guard deleted (`if (res.code !== 200)`) | KILLED | selftest aborted, node exit 1; stack `live-nullres-crash.mjs:211` | [diffs/live-nullres-crash.diff](diffs/live-nullres-crash.diff) |
| 57 | `hostof-hostname` | hostOf | `.host` -> `.hostname` | SURVIVED | 34/34 PASS, exit 0 | [diffs/hostof-hostname.diff](diffs/hostof-hostname.diff) |
| 58 | `pt-header-case-drop` | parseTable header | `.toLowerCase()` dropped from header match | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 0, reason None) +29 more failing cases | [diffs/pt-header-case-drop.diff](diffs/pt-header-case-drop.diff) |
| 59 | `pt-separator-drop` | parseTable separator | separator-line skip deleted (dashes become a data row) | KILLED | `admitted-clean` (expected exit 0, got 1, admitted 2, reason t1-row-id) +28 more failing cases | [diffs/pt-separator-drop.diff](diffs/pt-separator-drop.diff) |
| 60 | `pt-length-drop` | parseTable header | header cell-count check deleted | SURVIVED | 34/34 PASS, exit 0 | [diffs/pt-length-drop.diff](diffs/pt-length-drop.diff) |

## Survivors (coverage findings — counter is frozen; recorded, not fixed)

- `unit-boundwords-weaken` (UNIT_RE): No case exercises any bound word except `at least` (`at most`, `no more than`, `up to`, `more than`, `less than`, `≤`, `≥`, `<=`, `>=`, `<`, `>` are untested); weakening the alternation to `at least` alone is invisible.
- `unit-ksep-2` (UNIT_RE): No threshold cell contains a comma-form number (`5,000` appears only inside a quote; its threshold is `5000`), so `(?:,\d{3})+` vs `(?:,\d{2})+` is indistinguishable; a comma-form threshold would be mis-parsed undetected.
- `unit-unanchored` (UNIT_RE): UNIT_RE anchoring is untested: with `^` dropped, a threshold with leading prose (`about 5 requests`) would still match.
- `r1-regex-drop` (r1-row-missing): The S-id shape regex is redundant on the case set: any malformed source cell also fails the registry lookup, so r1 fires anyway. Semi-equivalent mutant (defense-in-depth unproven).
- `g1-idcheck-drop` (g1-receipt): No case has a receipt JSON whose inner `id` differs from its filename id; g1's id match is untested.
- `g3-bytesnull-drop` (g3-bytes): No case has a valid receipt whose `bytes_path` is uncommitted; the null-bytes guard is untested (in production it would throw instead of reporting g3).
- `q1-min-7` (q1-quote-length): No 6-word quote exists in the case set (shortest located quote is 7 words, shortest rejected is 5), so min bound 6->7 is invisible; the 6-word boundary is untested.
- `q1-max-26` (q1-quote-length): No quote is longer than 13 words, so max bound 25->26 is invisible.
- `q1-max-24` (q1-quote-length): Same gap from below: 25->24 also invisible; the 24/25/26-word boundary region is untested.
- `q1-max-drop` (q1-quote-length): Deleting the `> 25` clause entirely is invisible — no long-quote case exists.
- `nw-boundary-hyphen` (NUMBER_WORDS boundary): No hyphenated number word (`twenty-four`) appears in any quote, so the hyphen exclusion in the boundary class is untested (without it, `four` would match inside `twenty-four`).
- `live-cachekey-urlonly` (--live cache key): No live case has two rows on one url with mixed outcomes, so the quote in the cache key is untested; with the mutant, a second row on the same url inherits the first row's fetch verdict.
- `live-effhttps-drop` (liveOk same-host/https): No case redirects to an `http://` same-host url, so the effective-url scheme test is untested (the header doc promises 'redirects only to https on the same host').
- `live-reqhttps-drop` (liveOk same-host/https): The request-url https guard in liveOk is unreachable in the case set — g2 already forces https before l1 runs; the guard's own behavior is untested (masked, not exercised).
- `hostof-hostname` (hostOf): `host` vs `hostname` are identical on every case url (no ports/userinfo), so hostOf's exact semantics are untested.
- `pt-length-drop` (parseTable header): Header cell-count check is equivalent on the case set (`cells.every` already rejects short headers); in general a 7-column header would be accepted without it, but no such case exists.

## Killed, by check (killing case)

- **NUMBER_WORDS boundary**: `nw-boundary-drop` (`number-word-needs-boundary`)
- **UNIT_RE**: `unit-boundwords-drop` (`admitted-clean`); `unit-digits-alt-drop` (`admitted-clean`)
- **g1-receipt**: `g1-drop` (selftest abort, exit 1); `g1-invert` (selftest abort, exit 1)
- **g2-url**: `g2-https-drop` (`receipt-url-http`); `g2-inrow-drop` (`receipt-url-not-in-row`); `g2-invert` (`admitted-clean`)
- **g3-bytes**: `g3-status-drop` (`http-status-404`); `g3-sha-drop` (`bytes-sha-mismatch`); `g3-invert` (`admitted-clean`)
- **l1-live**: `l1-drop` (`live-self-quote-receipt`); `l1-invert` (`live-located`)
- **liveOk HTTP 200**: `live-code200-drop` (`live-non-200`); `live-nullres-crash` (selftest abort, exit 1)
- **liveOk same-host/https**: `live-samehost-drop` (`live-offhost-redirect`)
- **n1-threshold-sourced**: `n1-drop` (`threshold-not-in-quote`); `n1-invert` (`admitted-clean`)
- **parseTable header**: `pt-header-case-drop` (`admitted-clean`)
- **parseTable separator**: `pt-separator-drop` (`admitted-clean`)
- **q1-quote-length**: `q1-drop` (`quote-too-short`); `q1-min-drop` (`quote-too-short`); `q1-min-5` (`quote-too-short`); `q1-spans-drop` (`quote-two-spans`); `q1-invert` (`admitted-clean`)
- **q2-quote-located**: `q2-drop` (`quote-not-in-bytes`); `q2-invert` (`admitted-clean`)
- **r1-row-missing**: `r1-drop` (selftest abort, exit 1); `r1-invert` (selftest abort, exit 1); `r1-has-drop` (selftest abort, exit 1)
- **r2-status**: `r2-drop` (`status-queued`); `r2-invert` (`admitted-clean`)
- **r3-used-by**: `r3-drop` (`used-by-omits-entry`); `r3-invert` (`admitted-clean`)
- **r4-new-row**: `r4-drop` (`row-present-at-baseline`); `r4-invert` (`admitted-clean`)
- **t1-row-id**: `t1-drop` (`row-id-duplicate`); `t1-invert` (`admitted-clean`)
- **t2-signal**: `t2-drop` (`signal-without-token`); `t2-weaken` (`signal-without-token`)
- **t3-decision**: `t3-drop` (`decision-outside-set`); `t3-invert` (`admitted-clean`)
- **t4-threshold**: `t4-drop` (selftest abort, exit 1); `t4-invert` (selftest abort, exit 1)
