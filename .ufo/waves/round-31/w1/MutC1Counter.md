# MutC1Counter — C1 first falsifier: mutation test of the frozen counter's `--selftest`

## Verdict

The frozen counter `scripts/check-decision-table.mjs` (sha256 `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`, byte-identical to `claims.json → frozenDigests`, at freeze commit `9505a10eb80b2a0b273ebaba3f7f872ad302192d`) holds against 60 targeted mutants of its own behavioral detector: **44 killed, 16 survived**. Every drop/invert/off-by-one mutant of the row checks t1–t4, r1–r4, g1–g3, q1 (min bound), q2, n1, l1, the same-host/HTTP-200 core of `liveOk`, the NUMBER_WORDS word-boundary regex, and the `parseTable` header/separator matching is caught by at least one self-test case — mostly by the reason-specific negative case, sometimes by a reason shift (e.g. `q1-min-5` turns `q1-quote-length` into `q2-quote-located`, still a detectable verdict change). The 16 survivors are **coverage findings, not counter defects** — the counter is frozen and was not touched: the self-test never exercises (a) any bound word except `at least`, (b) a comma-form threshold number (`5,000`-style) in a threshold cell, (c) UNIT_RE's anchoring, (d) a receipt whose inner `id` differs from its filename (`g1` id match), (e) a valid receipt whose `bytes_path` is uncommitted (`g3` null guard), (f) quotes near the 6- or 25-word boundaries (no 6-word quote; longest is 13 words — the whole `> 25` clause is deletable undetected), (g) hyphenated number words (`twenty-four`) for the boundary class, (h) two live rows on one url with mixed quote outcomes (the quote half of the live cache key), (i) an `http://` same-host effective redirect, or (j) `hostOf`'s `host`-vs-`hostname` distinction. Two structural observations stand out: the `--live` cache key collapsing to url-only is invisible, and `g3`'s `bytes === null` guard is untested although in production it would throw rather than report `g3-bytes`. None of these bears on C1's predicate (admitted >= 10, failing = 0 under `--live`); they bound what the self-test — not the counter — can prove.

## Setup (all paths absolute; lane untouched)

- Scratch clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin /fast/scratch/hyaku/tabi-r31/MutC1Counter/clone` → exit 0; `git -C … checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d` → exit 0; `rev-parse --show-toplevel` = the clone (per contract, checked before any fixture-style run); `rev-parse HEAD` = `9505a10e…`.
- Counter digest at that commit: `sha256sum clone/scripts/check-decision-table.mjs` → `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832` = `claims.json.frozenDigests["scripts/check-decision-table.mjs"]`.
- Detector = the counter's own `--selftest` (34 cases; `--live` exercised via injected fetcher, never the network; TMPDIR pointed into scratch for every run).
- Node v24.21.0 (preinstalled). **No tools installed or upgraded** — nothing to record under the 2026-10-19 tooling authorization. No network fetches made.
- One harness bug (recorded in ENV.md): a first non-JSON pristine run exited 1 (ENOENT) because its TMPDIR leaf was not pre-created; rerun correctly — detector evidence comes from the corrected runs.

## Baseline (pristine bytes, before and after all mutants)

```
TMPDIR=$S/tmp/pristine-before  node $S/clone/scripts/check-decision-table.mjs --selftest --json  # exit 0, cases=34 passed=34 ok=true
TMPDIR=$S/tmp/pristine-nonjson node $S/clone/scripts/check-decision-table.mjs --selftest         # exit 0, DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34 (2.67 s)
TMPDIR=$S/tmp/pristine-after   node $S/clone/scripts/check-decision-table.mjs --selftest --json  # exit 0, cases=34 passed=34 ok=true
```

## Mutants

`python3 $S/mutate.py` → exit 0 (wall 24.0 s, 8 workers). Per mutant: one mutated copy `$S/mutants/<id>.mjs` (pristine bytes never modified), then `TMPDIR=$S/tmp/<id> node $S/mutants/<id>.mjs --selftest --json`. 60 mutants over: t1–t4, r1–r4, g1–g3, q1, q2, n1, l1, `hostOf`/same-host, UNIT_RE bound words/number forms/anchor, NUMBER_WORDS boundary regex, `parseTable` header match/separator/length, and the `--live` cache key — drop, invert, and off-by-one (6..25 word bounds) as assigned.

**Result: 44 KILLED / 16 SURVIVED.** Full table with per-mutant killing cases: [MUTANTS.md](.ufo/waves/round-31/w1/MutC1Counter/MUTANTS.md); raw results [results.json](.ufo/waves/round-31/w1/MutC1Counter/results.json); unified diff per mutant in [diffs/](.ufo/waves/round-31/w1/MutC1Counter/diffs/) (60 files). Environment, commands and exit codes: [ENV.md](.ufo/waves/round-31/w1/MutC1Counter/ENV.md).

Killed highlights (first killing case):

| check | killed by |
|---|---|
| t1-row-id | `t1-drop` → `row-id-duplicate` (admitted 2, exit 0 vs 1); `t1-invert` → `admitted-clean` |
| t2-signal | `t2-drop`/`t2-weaken` → `signal-without-token` (admitted, exit 0 vs 1) |
| t3-decision | `t3-drop` → `decision-outside-set`; `t3-invert` → `admitted-clean` |
| t4-threshold | `t4-drop`/`t4-invert` → selftest abort, node exit 1 (`tm[1]` of null at mutant line 274; first reachable case `threshold-prose`, inferred from case order) |
| UNIT_RE | `unit-boundwords-drop` → `admitted-clean` (1/2 admitted); `unit-digits-alt-drop` → `admitted-clean`; `unit-ksep-2` **SURVIVED**; `unit-unanchored` **SURVIVED** |
| r1-row-missing | `r1-drop`/`r1-invert`/`r1-has-drop` → selftest abort exit 1 (`reg.status` of undefined; first reachable case `source-row-missing`, inferred); `r1-regex-drop` **SURVIVED** |
| r2/r3/r4 | all six → their named negative case (`status-queued`, `used-by-omits-entry`, `row-present-at-baseline`) / `admitted-clean` |
| g1-receipt | `g1-drop`/`g1-invert` → selftest abort exit 1 (`rc.url` of null at mutant line 251; first reachable case `receipt-missing`, inferred); `g1-idcheck-drop` **SURVIVED** |
| g2-url | `g2-https-drop` → `receipt-url-http`; `g2-inrow-drop` → `receipt-url-not-in-row`; `g2-invert` → `admitted-clean` |
| g3-bytes | `g3-sha-drop` → `bytes-sha-mismatch`; `g3-status-drop` → `http-status-404`; `g3-invert` → `admitted-clean`; `g3-bytesnull-drop` **SURVIVED** |
| q1-quote-length | `q1-drop`, `q1-min-drop`, `q1-min-5` → `quote-too-short` flips reason to `q2-quote-located` (detectable); `q1-spans-drop` → `quote-two-spans` admits (exit 0 vs 1); `q1-invert` → `admitted-clean`; `q1-min-7`, `q1-max-24/26`, `q1-max-drop` **SURVIVED** |
| q2-quote-located | `q2-drop` → `quote-not-in-bytes` admits; `q2-invert` → `admitted-clean` |
| n1-threshold-sourced | `n1-drop` → `threshold-not-in-quote` admits; `n1-invert` → `admitted-clean`; `nw-boundary-drop` → `number-word-needs-boundary` admits ("one" matched inside "none"); `nw-boundary-hyphen` **SURVIVED** |
| l1-live | `l1-drop` → `live-self-quote-receipt` (+3) admits; `l1-invert` → `live-located` fails |
| liveOk / hostOf / cache key | `live-samehost-drop` → `live-offhost-redirect` admits; `live-code200-drop` → `live-non-200` admits; `live-nullres-crash` → selftest abort exit 1 (first reachable `live-fetch-failed`, inferred); `live-cachekey-urlonly`, `live-effhttps-drop`, `live-reqhttps-drop`, `hostof-hostname` **SURVIVED** |
| parseTable | `pt-header-case-drop` → `admitted-clean` (no table found, exit 1); `pt-separator-drop` → `admitted-clean` (dashes row fails t1); `pt-length-drop` **SURVIVED** |

Survivors (coverage findings, counter frozen — recorded, not fixed):

1. `unit-boundwords-weaken` — only `at least` is exercised; the other ten bound words could all be deleted undetected.
2. `unit-ksep-2` — no comma-form threshold cell (`5,000` appears only in a quote; its threshold is `5000`), so the thousands-group digit count is unproven.
3. `unit-unanchored` — `^` anchor deletable; leading-prose thresholds (`about 5 requests`) would pass t4 undetected.
4. `r1-regex-drop` — S-id shape regex is redundant on the case set (registry lookup rejects the same cells); semi-equivalent here, defense-in-depth unproven.
5. `g1-idcheck-drop` — no receipt with inner `id` ≠ filename id; g1's id match untested.
6. `g3-bytesnull-drop` — no case with a valid receipt and uncommitted `bytes_path`; the guard that would throw in production is untested.
7. `q1-min-7` — no 6-word quote exists (shortest located 7, shortest rejected 5): the exact min boundary is untested.
8. `q1-max-24`, `q1-max-26`, `q1-max-drop` — no quote longer than 13 words: the `> 25` clause is deletable undetected; the 24–26-word region is untested.
9. `nw-boundary-hyphen` — no hyphenated number word (`twenty-four`); the hyphen exclusion in the boundary class is untested.
10. `live-cachekey-urlonly` — no same-url mixed-outcome live pair, so the quote half of the cache key is untested; a second row on the same url would inherit the first row's verdict.
11. `live-effhttps-drop` — no `http://` same-host effective redirect case, though the header doc promises https-only redirects.
12. `live-reqhttps-drop` — the request-url https guard is masked by g2 in every case (dead path in the case set).
13. `hostof-hostname` — `host` = `hostname` on every case url (no ports/userinfo).
14. `pt-length-drop` — equivalent on the case set (`cells.every` already rejects short headers); a 7-column header would be accepted in general but no such case exists.

## Restoration evidence

```
sha256sum $S/clone/scripts/check-decision-table.mjs   # d15f3bd7…f482f6832 — unchanged after all runs
git -C $S/clone status --porcelain                    # (empty)
git -C $S/clone rev-parse HEAD                        # 9505a10eb80b2a0b273ebaba3f7f872ad302192d — unchanged
```

Pristine bytes were never the target of an edit (every mutant is a separate file under `$S/mutants/`); the post-run selftest passes 34/34 and the digest matches the freeze. Mutant copies and their diffs are retained in the output dir as findings evidence.
