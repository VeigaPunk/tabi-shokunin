# MutC1Rows — C1 attempt-2 falsifier: mutation test of the landed decision-table rows

**Seat** MutC1Rows · **Milestone** C1 · **Wave** a2w1 · **Round** 31 attempt 2
**Baseline** `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc` · **Landing under attack** `486048356f0712e4396588c9dab58cd419243120`
**Counter** `scripts/check-decision-table.mjs`, sha256 `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832` = `claims.json.frozenDigests`, byte-identical at the measured rev (recomputed from the scratch clone worktree).
**Scratch** `/fast/scratch/hyaku/tabi-r31/MutC1Rows/` (one shared clone at `clone/`, pinned to `4860483…`, porcelain empty; receipts copied to this output dir before scratch deletion).

## Verdict

I mutation-tested the **landed C1 rows** — D1–D13 of `corpus/knowledge/rate-signal-decision-table.md` at `4860483…` — with 43 single mutants covering all seven assigned classes (threshold +1 on every row; unit changed, both out-of-vocabulary and in-vocabulary-wrong; bound word flipped; one quote word changed; Source id swapped to another new row, including a single-sided variant; row duplicated under a new id; quote replaced by another sentence of the same page carrying the same number), each mutant committed alone in the scratch clone and judged by the frozen counter offline with stdout written to a file, plus `--live` runs on the pristine tree and four key survivors. **The counter's falsifiable core holds**: all 13 threshold+1 mutants are killed by `n1-threshold-sourced`, out-of-vocabulary units by `t4-threshold`, any quote alteration by `q2-quote-located`, and a source swap to a page not carrying the quote by `q2`; pristine reads **population 13, admitted 13, failing 0** offline and live, and the lane bytes were restored byte-exact (entry sha256 `2371692d…51b86` before and after; lane porcelain shows only untracked wave-state/output entries). **But 22 of 44 row-mutations survive the deployed gate** — the counter never compares the threshold's *unit* or *bound word* to the quote (a `500 KiB`→`500 bytes` 1024× error, a `1 minute`→`1 hour` 60× error, `100 concurrent`→`100 requests`, and five bound-direction flips all admit with exit 0), it admits an exact duplicate row under a new id (population 14, admitted 14, exit 0), it admits D6 with its Source swapped from S121 to S122 because the one-minute sentence is verbatim on **both** GitHub pages (survives `--live` too), and — new against wave 1's frozen hole list — it admits six rows whose quote I replaced with a **different sentence of the same page carrying the same number** (D5's 500 KiB parsing limit re-sourced to the "500-599 status range" sentence; D7's 60-requests/hour cap re-sourced to a GraphQL "60 seconds" CPU sentence; D9's concurrency cap re-sourced to the LFS "100 Git LFS objects" sentence; D8, D13, D1, D2 similarly), so `admitted 13, failing 0` evidences the number-in-located-quote core but **not** the unit, the bound direction, *which* sentence of the page licenses the row, row distinctness, or *which* of two same-sentence pages a row cites. **Verdict: the landed bytes are correct; the counter's admission is defective evidence for everything around that core — defect, medium-high severity, on C1's evidence quality.** Attack seat: nothing repaired, no lane file touched.

## What I attacked

The C1 landing's row-level admission at `4860483…`: whether the frozen counter's `admitted=13 / failing=0` reading would have caught a corrupted row — wrong threshold digit, wrong unit, flipped bound, altered quote, wrong source row, duplicated row, or a quote swapped for another same-page sentence.

## Setup and guards

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"          # exit 0
git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120             # exit 0
git -C "$S/clone" rev-parse HEAD                                                   # 486048356f07…43120; status --porcelain empty
sha256sum "$S/clone/scripts/check-decision-table.mjs"                              # d15f3bd7…f6832 = frozenDigests ✓
```

Every commit: toplevel verified (`git -C "$S/clone" rev-parse --show-toplevel` = the clone), identity `-c user.name=MutC1Rows -c user.email=MutC1Rows@scratch.local`, one mutant per commit, counter spawned with `--repo <clone> --rev <sha> --baseline 96a2d1a3… --entry corpus/knowledge/rate-signal-decision-table.md --json`, stdout written to `out/<id>.json` (never piped into jq; jq read only the harness's own complete `matrix.json` file). Node v24.21.0; no tools installed or upgraded (nothing to record under the 2026-10-19 authorization).

Pristine detector readings (before any mutation): offline **exit 0, population 13, admitted 13, failing 0** (`out/pristine-offline.json`) — matches the L1's reading; live **exit 0, admitted 13** (`out/live-pristine.json`). A harness guard aborts (exit 8) if pristine is not 13/13, so every mutant reading below is judged against a passing baseline.

## Matrix — 43 mutants, one at a time

`caught` = the counter refuses the mutated row (exit 1, that row not admitted). Full per-mutant counter JSON in `out/<id>.json`; commit sha and mutated-entry sha256 per mutant in `out/matrix.json`.

| id | row | mutation | offline reading | caught? |
|---|---|---|---|---|
| m1-D1 | D1 | `at least 5 redirects`→`at least 6 redirects` | exit 1, adm 12, fail 1 | **yes** — n1-threshold-sourced |
| m1-D2 | D2 | `more than 5`→`more than 6 redirects` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D3 | D3 | `30 days`→`31 days` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D4 | D4 | `more than 24`→`25 hours` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D5 | D5 | `at least 500`→`501 KiB` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D6 | D6 | `at least 1 minute`→`2 minutes` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D7 | D7 | `60 requests`→`61 requests` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D8 | D8 | `5,000 requests`→`5,001 requests` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D9 | D9 | `no more than 100`→`101 concurrent` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D10 | D10 | `no more than 900`→`901 points` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D11 | D11 | `no more than 90`→`91 seconds` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D12 | D12 | `0 requests`→`1 request` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m1-D13 | D13 | `at least 1 second`→`2 seconds` | exit 1, adm 12 | **yes** — n1-threshold-sourced |
| m2a-D1 | D1 | unit→`5 elephants` | exit 1, adm 12 | **yes** — t4-threshold |
| m2a-D5 | D5 | unit→`500 bananas` | exit 1, adm 12 | **yes** — t4-threshold |
| m2a-D6 | D6 | unit→`1 fortnight` | exit 1, adm 12 | **yes** — t4-threshold |
| m2b-D3 | D3 | `30 days`→`30 hours` | exit 0, adm 13 | **no — survives** |
| m2b-D5 | D5 | `500 KiB`→`500 bytes` (1024×) | exit 0, adm 13 | **no — survives** |
| m2b-D6 | D6 | `1 minute`→`1 hour` (60×) | exit 0, adm 13 | **no — survives** |
| m2b-D9 | D9 | `100 concurrent`→`100 requests` | exit 0, adm 13 | **no — survives** |
| m2b-D13 | D13 | `1 second`→`1 minute` (60×) | exit 0, adm 13 | **no — survives** |
| m3-D1 | D1 | `at least`→`at most` (floor→ceiling) | exit 0, adm 13 | **no — survives** |
| m3-D2 | D2 | `more than`→`less than` | exit 0, adm 13 | **no — survives** |
| m3-D4 | D4 | `more than`→`up to` | exit 0, adm 13 | **no — survives** |
| m3-D6 | D6 | `at least`→`at most` | exit 0, adm 13 | **no — survives** |
| m3-D9 | D9 | `no more than`→`at least` | exit 0, adm 13 | **no — survives** |
| m4-D1 | D1 | quote `consecutive`→`successive` | exit 1, adm 12 | **yes** — q2-quote-located |
| m4-D6 | D6 | quote `wait`→`sleep` | exit 1, adm 12 | **yes** — q2-quote-located |
| m4-D12 | D12 | quote `should`→`must` | exit 1, adm 12 | **yes** — q2-quote-located |
| m5-E1 | D1 | Source `S119`→`S121` | exit 1, adm 12 | **yes** — q2-quote-located |
| m5-E2 | D6+D12 | swap `S121`↔`S122` | exit 1, adm 12 | **half** — D12 caught (q2); **D6 half admitted** |
| m5-E2b | D6 | Source `S121`→`S122` (single-sided) | exit 0, adm 13 | **no — survives** (live too, below) |
| m5-E3 | D10 | Source `S121`→`S122` | exit 1, adm 12 | **yes** — q2-quote-located |
| m6-F1 | D9→D14 | exact duplicate row, new id | exit 0, **pop 14, adm 14** | **no — survives** |
| m6-F2 | D1→D15 | exact duplicate row, new id | exit 0, **pop 14, adm 14** | **no — survives** |
| m7-D1 | D1 | quote→D2's sentence ("more than five… MAY assume unavailable") | exit 0, adm 13 | **no — survives** (live too, below) |
| m7-D2 | D2 | quote→D1's sentence ("SHOULD follow at least five…") | exit 0, adm 13 | **no — survives** |
| m7-D5 | D5 | quote→"…status codes in the 500-599 range." | exit 0, adm 13 | **no — survives** |
| m7-D6 | D6 | quote→"…higher on a later response than on an earlier one…" | exit 0, adm 13 | **no — survives** |
| m7-D7 | D7 | quote→"No more than 60 seconds of this CPU time may be for the GraphQL API." | exit 0, adm 13 | **no — survives** |
| m7-D8 | D8 | quote→"…the rate limit is 5,000 requests per hour per OAuth app." | exit 0, adm 13 | **no — survives** (live too, below) |
| m7-D9 | D9 | quote→"Git LFS… processes 100 Git LFS objects per API request…" | exit 0, adm 13 | **no — survives** |
| m7-D13 | D13 | quote→"Otherwise, wait for at least one minute before retrying." | exit 0, adm 13 | **no — survives** (live too, below) |

M7 had **no** valid same-page candidate for D3 (30), D4 (24), D10 (900), D11 (90), D12 (0) — no other sentence on those pages carries the number the way the counter parses numbers — so those five rows are protected against this class by page content, not by any counter check.

**Score: 20 fully caught + 1 half-caught (E2's D12 side) vs 21 fully surviving + E2's D6 side = 22 surviving row-mutations.**

## Survivor classification — wave-1-known vs new

| survivors | hole | status vs wave 1 |
|---|---|---|
| m2b-D3/D5/D6/D9/D13 | `n1` (line 286) compares only the number; `UNIT_RE` (line 86) accepts any in-vocabulary unit — the quote's unit is never compared | **known** — w1 `CritC1Counter` A1; here instantiated on the landed rows |
| m3-D1/D2/D4/D6/D9 | the bound word is an optional, never-compared prefix of `UNIT_RE` | **known** — w1 `CritC1Counter` A2; instantiated |
| m6-F1/F2 | uniqueness enforced on the row id only (`seen` set, line 267); no `(source, quote)`/`(source, threshold)` distinctness | **known** — w1 `CritC1Axis` Q2 repetition control and `CritC1Counter` B; instantiated: population grows to 14, exit 0 |
| m5-E2b (and E2's D6 half) | D6's quote "Otherwise, wait for at least one minute before retrying." is verbatim in **both** S121's and S122's committed receipt bytes (collision check in `out/`, and located at char 13955 of normalised S121 / 6157 of normalised S122); `q2`/`l1` cannot tell which page a row cites | **known family** — w1 `CritC1Counter` cases C/D (receipt/page identity); new instantiation on landed rows, live-verified |
| m7-D5, m7-D6 | enabled by non-threshold numbers in a quote: "500-599" supplies 500 for the KiB row; the pronoun "one" in "earlier one" supplies 1 for the minute row (w1 A4) | **known** — the frozen hole "non-threshold numbers in a quote are admitted"; instantiated |
| m7-D1, m7-D2, m7-D7, m7-D8, m7-D9, m7-D13 | **sentence-identity hole (new):** the counter binds a row to (page, *some* number in *a* located quote) but never to *which* sentence — any same-page sentence carrying the threshold's number licenses the row, offline and live. Mirror image of w1's B (one quote → ten rows): here one row → the wrong sentence | **new** against the frozen hole list in `claims.json` |

Instantiated survivor rows (verbatim, from the mutant commits):

```
m2b-D5 : | D5 | `robots.txt` body size | limit — MUST keep the parsing limit at least this high; … | at least 500 bytes | S119 | "The parsing limit MUST be at least 500 kibibytes [KiB]." |          # 1024× unit error admitted
m3-D1  : | D1 | … | follow — SHOULD: … (RFC 9309 §2.3.1.2) | at most 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, …" |   # floor flipped to ceiling, admitted
m5-E2b : | D6 | rate-limited `403` or `429` … | wait — … | at least 1 minute | S122 | "Otherwise, wait for at least one minute before retrying." |                # cites the other GitHub page, admitted live
m7-D5  : | D5 | `robots.txt` body size | limit — … | at least 500 KiB | S119 | "For example, in the context of HTTP, server errors are identified by status codes in the 500-599 range." |
m7-D7  : | D7 | `x-ratelimit-limit` on an unauthenticated request | cap — … | 60 requests | S121 | "No more than 60 seconds of this CPU time may be for the GraphQL API." |
m7-D9  : | D9 | parallel fan-out to the host … | cap — … | no more than 100 concurrent | S121 | "Git LFS uses a batch API which processes 100 Git LFS objects per API request by default." |
m6-F1  : | D14 | parallel fan-out to the host … | cap — … | no more than 100 concurrent | S121 | "No more than 100 concurrent requests are allowed." |            # exact copy of D9, admitted
```

## Live phase (`--live`, real read-only GETs)

| run | rev | reading |
|---|---|---|
| pristine | `4860483…` | exit 0, admitted 13, failing 0 |
| m5-E2b (D6→S122) | `13a3942373ff64ac69d38c7477c266606a9691bc` | exit 0, admitted 13 — **survivor survives the full gate** |
| m7-D1 | `35ae58a49ab8307378c0617a773e733d9a1f7947` | exit 0, admitted 13 — survives |
| m7-D8 | `f40c3144d89397977209f24b506c8e4a559fc8c6` | exit 0, admitted 13 — survives |
| m7-D13 | `5512a73487dac9647762869bfd2d91ce44bd6a5e` | exit 0, admitted 13 — survives |

The caught mutants were all killed before `l1` (t4/q2/n1 short-circuit), so live adds nothing for them. For m2b/m3/m6 the mutated rows keep the pristine (url, quote) pair, and `l1`'s only inputs are that pair (cache key `url\0quote`, lines 256–260, 208–215) — their live outcome is the same code path pristine already exercised; not separately run. No proxy, no CA override, no PATH tricks were used: these are clean-environment fetches, so the w1 `SentinelC1Live` Finding-1 hole is *not* needed for any survivor above.

## Restoration evidence

```
git -C "$S/clone" reset --hard -q 486048356f0712e4396588c9dab58cd419243120        # scratch clone only
sha256(restored entry) = 2371692dc50ca81124f8b451c816dd6331105bc78ee074caae4388b463951b86 = pristine sha ✓ (out/restoration.json)
counter re-run at 4860483… offline: exit 0, admitted 13 (out/pristine-restored-offline.json)
lane entry sha256: 2371692dc50ca81124f8b451c816dd6331105bc78ee074caae4388b463951b86 — identical; lane untouched
git -C lane status --porcelain: 6 untracked entries only (a2w1 dispatch state + seat output dirs); no tracked modification, no index/jj write
```

## Commands and exit codes (abridged; harness `out/matrix.json` carries every rev and reading)

```
node "$S/harness.mjs" scan    # exit 0 — normalise-copy validated (13/13 landed quotes located in their own receipts); collision matrix: D6 quote also in S122
node "$S/harness.mjs" run     # exit 0 — pristine 13/13; 43 mutants committed and counted one at a time; restoration verified
node "$S/harness.mjs" live pristine 486048356f0712e4396588c9dab58cd419243120   # exit 0, adm 13
node "$S/harness.mjs" live m5-E2b 13a39423… ; live m7-D1 35ae58a4… ; live m7-D8 f40c3144… ; live m7-D13 5512a734…   # all exit 0, adm 13
```

Per mutant the harness ran exactly: write entry → `git -C clone add -- <entry>` → `git -C clone -c user.name=MutC1Rows -c user.email=MutC1Rows@scratch.local commit -q -m "mut(<id>): …"` → `node scripts/check-decision-table.mjs --repo <clone> --rev <sha> --baseline 96a2d1a3… --entry corpus/knowledge/rate-signal-decision-table.md --json` (offline; stdout to `out/<id>.json`).

## Network fetches (all read-only HTTPS GETs of public documentation pages; no api.github.com, no credentials, no cookies)

Explicit metadata curls (2026-10-26T12:31:39Z, `curl -q -sS --proto =https`, `out/fetch-log.txt`):

```
S119  https://www.rfc-editor.org/rfc/rfc9309.txt                                  status=200 bytes=25265   sha256=f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207
S121  https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api        status=200 bytes=337116 sha256=47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9
S122  https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api status=200 bytes=328088 sha256=e4050f6bab26d33a4f6e8cc633555bb55478f9cc0c2857e37e77ff7ba38147b0
```

Counter-internal fetches: each `--live` run performs one GET per distinct (url, quote) pair — 13 per run, 5 runs = 65 GETs across the three cited URLs (S120 is cited by no row and was never fetched by any run); every one returned 200 on-host with the quote present, otherwise `l1-live` would have failed.

**Adjacent observation (not a new claim):** the two GitHub pages' live bytes differ on every fetch while the byte *length* stays constant (S121: receipt `3a33f87b…` vs w1's `ae5e1812…` vs today's `47031376…`, all 337,116 B; S122: `b15c1c0b…` vs `e4050f6b…`, both 328,088 B; the RFC text page is static, `f633915d…` exact). So the committed GitHub receipt bytes are not byte-reproducible from the live page — `g3`'s sha check is self-referential (receipt vs its own `bytes_path`) and `l1`'s quote presence is the only live anchor (w1 `CritC1Counter` case C adjacent).

## Line evidence in the frozen counter (byte-identical at `4860483…`, so w1's line numbers carry)

- `UNIT_RE` line 86 — bound word optional and never compared; unit from a fixed list, never compared to the quote; only `tm[1]` (the number) is kept (line 274).
- `numbersIn` lines 182–189, `n1` line 286 — number-in-quote is the *only* threshold↔source binding; no unit, no sentence identity.
- `t1`/`seen` line 267 — uniqueness on the row id only; duplicates under new ids admitted.
- `q2` line 285 / `liveOk` lines 208–215 — quote presence in the receipt bytes / live page; no check of *which* sentence, and `g2` line 251 accepts any page whose bytes carry the sentence.
- `t3` lines 270–271 — only the Decision cell's first verb is read; the `§`-anchor text in a Decision cell is unchecked (code reading; not one of the assigned mutants, not run).

## Scope and hygiene

Leaf seat: no subagent dispatch, no message to `agent://all`, no builds/linters/formatters of the lane. Writes confined to this report, `a2w1/MutC1Rows/` (receipts: `out/` — 43 mutant JSONs, pristine/restored/live JSONs, `matrix.json`, `restoration.json`, `fetch-log.txt` — plus `harness.mjs` and `evidence.mjs` for reproduction), and scratch under `$HYAKU_SCRATCH/tabi-r31/MutC1Rows/` (deleted after copying). No lane tracked file, index or jj state written; no sibling repo touched; nothing repaired — findings only.
